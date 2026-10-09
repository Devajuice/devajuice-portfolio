/**
 * Self-contained HTML error page for the API routes.
 *
 * By default an unhandled failure in a Vercel function returns the platform's
 * generic "FUNCTION_INVOCATION_FAILED" screen, which says nothing about what
 * actually broke. Every `/api/*` handler funnels its failures through here so a
 * human who opens the URL in a browser gets a page that names the endpoint, the
 * cause, and the fix.
 *
 * Dependency-free string building on purpose: the same module is imported by
 * the Node serverless function (`nowplaying.js`) and the Edge function
 * (`og.png.js`), and it must not pull in Node built-ins the Edge runtime lacks.
 *
 * API clients never receive this markup — `wantsHtml()` gates it, so `fetch()`
 * callers (a wildcard Accept header) still get the JSON contract they expect.
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readHeader(req, name) {
  const headers = req?.headers;
  if (!headers) return '';
  // Edge `Request.headers` has .get(); Node's has lowercase keys.
  if (typeof headers.get === 'function') return headers.get(name) || '';
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name);
  return key ? headers[key] || '' : '';
}

/**
 * True when the caller is a browser navigating to the URL rather than the
 * app's `fetch()` (which sends a wildcard Accept header).
 */
export function wantsHtml(req) {
  return readHeader(req, 'accept').includes('text/html');
}

const STYLES = `
  :root{
    --bg:#111113;--surface:#1c1c1f;--surface-raised:#18181a;
    --border:#29292c;--border-hover:#343438;
    --text-primary:#f2f2f3;--text-secondary:#a1a1a6;--text-muted:#6f6f75;--text-subtle:#4d4d52;
    --accent:#f2f2f3;--accent-ring:rgb(242 242 243/.2);
    --danger:#fb7185;--danger-soft:rgb(251 113 133/.12);--danger-border:rgb(251 113 133/.32);
    --ease:cubic-bezier(.22,1,.36,1);
  }
  *{box-sizing:border-box}
  html{background:var(--bg);color-scheme:dark;-webkit-text-size-adjust:100%}
  body{margin:0;min-height:100vh;background:var(--bg);color:var(--text-primary);
    font-family:'DM Sans',system-ui,-apple-system,sans-serif;letter-spacing:-.02em;line-height:1.6;
    -webkit-font-smoothing:antialiased}
  body::before{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;
    background-image:radial-gradient(circle,var(--accent) 1px,transparent 1px);
    background-size:24px 24px;opacity:.14}
  ::selection{background:rgb(242 242 243/.06)}
  *:focus-visible{outline:1px solid var(--accent-ring);outline-offset:2px;border-radius:4px}
  main{display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:100vh;padding:48px 24px;text-align:center}
  .code{font-size:clamp(4rem,14vw,8rem);font-weight:800;letter-spacing:-.04em;line-height:1;
    margin:0 0 .5rem;user-select:none;animation:up .5s var(--ease) .05s both}
  .code--danger{color:var(--danger)}
  .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:var(--surface);
    border:1px solid var(--border);border-radius:9999px;box-shadow:0 1px 2px rgb(0 0 0/.18);
    font-size:.82rem;font-weight:500;color:var(--text-muted);margin-bottom:1.5rem;
    animation:up .5s var(--ease) .15s both}
  .badge--danger{border-color:var(--danger-border);color:var(--danger)}
  .badge .dot{width:8px;height:8px;border-radius:50%;background:var(--danger)}
  h1{font-size:clamp(1.6rem,4vw,2.2rem);font-weight:700;letter-spacing:-.035em;margin:0 0 1rem;
    animation:up .5s var(--ease) .22s both}
  .desc{font-size:1.05rem;color:var(--text-muted);line-height:1.8;margin:0 0 2rem;max-width:520px;
    animation:up .5s var(--ease) .3s both}
  .details{width:100%;max-width:520px;margin:0 auto 2rem;text-align:left;background:var(--surface-raised);
    border:1px solid var(--border);border-radius:14px;overflow:hidden;
    animation:up .5s var(--ease) .34s both}
  .details .row{display:flex;gap:12px;padding:14px 18px;border-bottom:1px solid var(--border)}
  .details .row:last-child{border-bottom:0}
  .details dt{flex:0 0 108px;margin:0;font-size:.72rem;font-weight:600;letter-spacing:.08em;
    text-transform:uppercase;color:var(--text-subtle);padding-top:3px}
  .details dd{margin:0;flex:1;min-width:0;font-size:.9rem;color:var(--text-secondary);overflow-wrap:anywhere}
  .details dd code{font-family:'JetBrains Mono','Fira Code',ui-monospace,monospace;font-size:.82rem;
    color:var(--text-primary);background:rgb(242 242 243/.06);padding:2px 6px;border-radius:5px}
  .actions{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;
    animation:up .5s var(--ease) .4s both}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.75rem 1.4rem;
    border:1px solid transparent;border-radius:8px;background:var(--accent);color:var(--bg);
    text-decoration:none;font-size:.875rem;font-weight:500;cursor:pointer;
    transition:transform .25s var(--ease),opacity .2s ease,background-color .2s ease}
  .btn:hover{opacity:.9;transform:translateY(-1px)}
  .btn:active{transform:scale(.96)}
  .btn--secondary{background:transparent;border-color:var(--border);color:var(--text-primary)}
  .btn--secondary:hover{background:var(--surface);border-color:var(--border-hover)}
  @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;
    transition-duration:.01ms!important}}
  @media (max-width:480px){.details .row{flex-direction:column;gap:4px}.details dt{flex:none}
    .actions{flex-direction:column}.btn{width:100%;max-width:280px}}
`;

function detailRow(label, value, isCode) {
  if (!value) return '';
  const content = isCode ? `<code>${escapeHtml(value)}</code>` : escapeHtml(value);
  return `<div class="row"><dt>${escapeHtml(label)}</dt><dd>${content}</dd></div>`;
}

/**
 * Render a complete HTML error document.
 *
 * @param {object}   opts
 * @param {number}   opts.status   HTTP status code (shown as the big number).
 * @param {string}   opts.title    Headline, e.g. "Last.fm music proxy is down".
 * @param {string}   opts.message  One-line plain-language summary.
 * @param {string}  [opts.endpoint] The route that failed.
 * @param {string}  [opts.cause]   What exactly is broken.
 * @param {string}  [opts.detail]  Raw upstream/exception detail.
 * @param {string}  [opts.hint]    What to do about it.
 * @param {string}  [opts.backHref]
 * @param {string}  [opts.backLabel]
 * @param {boolean} [opts.retry]   Show a "Try again" reload button.
 */
export function renderErrorPage({
  status = 500,
  title = 'Something broke on the server',
  message = 'This endpoint could not complete its request.',
  endpoint = '',
  cause = '',
  detail = '',
  hint = '',
  backHref = '/',
  backLabel = 'Back to site',
  retry = true,
} = {}) {
  const safeTitle = escapeHtml(title);
  const rows = [
    detailRow('Endpoint', endpoint, true),
    detailRow('What broke', cause),
    detailRow('Detail', detail, true),
    detailRow('What to do', hint),
  ].join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${status} — ${safeTitle}</title>
    <meta name="robots" content="noindex, nofollow" />
    <meta name="color-scheme" content="dark" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
    <style>${STYLES}</style>
  </head>
  <body>
    <main role="main">
      <p class="code code--danger">${escapeHtml(status)}</p>

      <div class="badge badge--danger">
        <span class="dot" aria-hidden="true"></span>
        <span>Service error</span>
      </div>

      <h1>${safeTitle}</h1>
      <p class="desc">${escapeHtml(message)}</p>

      <dl class="details">
        ${rows}
      </dl>

      <div class="actions">
        ${retry ? '<a class="btn" href="" onclick="location.reload();return false">Try again</a>' : ''}
        <a class="btn btn--secondary" href="${escapeHtml(backHref)}">${escapeHtml(backLabel)}</a>
      </div>
    </main>
  </body>
</html>
`;
}

/**
 * Write an HTML error page when the caller is a browser; signal the caller to
 * fall back to JSON otherwise. Returns true when a response was sent.
 */
export function sendHtmlError(res, req, options) {
  if (!wantsHtml(req)) return false;
  res.statusCode = options.status ?? 500;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(renderErrorPage(options));
  return true;
}
