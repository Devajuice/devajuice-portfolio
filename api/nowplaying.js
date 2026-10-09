import { sendHtmlError } from './_lib/error-page.js';

const LASTFM_USERNAME = 'Devajuice';
// The README has always documented VITE_LASTFM_API_KEY, while this function
// originally read LASTFM_API_KEY. Accept either so existing deployments keep
// working regardless of which name the key was saved under.
const LASTFM_API_KEY = process.env.LASTFM_API_KEY || process.env.VITE_LASTFM_API_KEY;

const ENDPOINT = '/api/nowplaying';

/**
 * Report a failure. Browsers get a self-contained page that explains what is
 * broken; API clients (the app's fetch) keep the `{ error, message }` JSON
 * contract they parse. Either way the same human-readable message is sent.
 */
function fail(req, res, status, { title, message, cause, detail, hint }) {
  const sentPage = sendHtmlError(res, req, {
    status,
    title,
    message,
    endpoint: ENDPOINT,
    cause,
    detail,
    hint,
    backLabel: 'Back to site',
  });
  if (sentPage) return;
  res.status(status).json({ error: true, message });
}

export default async function handler(req, res) {
  if (!LASTFM_API_KEY) {
    return fail(req, res, 500, {
      title: 'Last.fm music proxy is not configured',
      message: 'The now-playing service cannot reach Last.fm because no API key is set.',
      cause: 'The LASTFM_API_KEY environment variable is missing on the deployment.',
      detail: 'api/nowplaying.js — LASTFM_API_KEY / VITE_LASTFM_API_KEY both unset',
      hint: 'Add LASTFM_API_KEY to the deployment environment variables and redeploy.',
    });
  }

  // Allow the client to request different Last.fm methods via ?method=
  // Defaults to user.getrecenttracks (the main now-playing poll)
  const method = req.query?.method || 'user.getrecenttracks';

  let url;
  if (method === 'user.getrecenttracks') {
    url =
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
      `&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}` +
      `&format=json&limit=1&extended=1`;
  } else if (method === 'track.getInfo') {
    const { artist, track } = req.query;
    if (!artist || !track) {
      return fail(req, res, 400, {
        title: 'Missing request parameters',
        message: 'The track lookup could not run because its query parameters are incomplete.',
        cause: 'track.getInfo was called without both `artist` and `track`.',
        detail: `artist=${artist ?? '(missing)'} track=${track ?? '(missing)'}`,
        hint: 'Call with ?method=track.getInfo&artist=...&track=...',
      });
    }
    url =
      `https://ws.audioscrobbler.com/2.0/?method=track.getInfo` +
      `&api_key=${LASTFM_API_KEY}` +
      `&artist=${encodeURIComponent(artist)}` +
      `&track=${encodeURIComponent(track)}` +
      `&format=json&username=${LASTFM_USERNAME}`;
  } else {
    return fail(req, res, 400, {
      title: 'Unsupported method',
      message: 'This proxy only forwards a fixed set of Last.fm methods.',
      cause: `The requested method "${method}" is not handled by this function.`,
      detail: 'Supported: user.getrecenttracks, track.getInfo',
      hint: 'Use one of the supported methods listed above.',
    });
  }

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Last.fm responded with ${r.status}`);
    const data = await r.json();
    // Cache at the edge: live tracks 30s, everything else 120s
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.status(200).json(data);
  } catch (e) {
    return fail(req, res, 502, {
      title: 'Last.fm is unreachable',
      message: 'The music proxy could not complete its request to Last.fm.',
      cause: 'The upstream request to ws.audioscrobbler.com failed.',
      detail: e.message,
      hint: 'Usually temporary — retry in a moment. If it persists, check Last.fm status and the API key.',
    });
  }
}
