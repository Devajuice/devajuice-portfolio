const LASTFM_USERNAME = "Devajuice";
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

export default async function handler(req, res) {
  // Allow the client to request different Last.fm methods via ?method=
  // Defaults to user.getrecenttracks (the main now-playing poll)
  const method = req.query?.method || "user.getrecenttracks";

  let url;
  if (method === "user.getrecenttracks") {
    url =
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
      `&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}` +
      `&format=json&limit=1&extended=1`;
  } else if (method === "track.getInfo") {
    const { artist, track } = req.query;
    if (!artist || !track) {
      return res
        .status(400)
        .json({ error: true, message: "Missing artist or track param" });
    }
    url =
      `https://ws.audioscrobbler.com/2.0/?method=track.getInfo` +
      `&api_key=${LASTFM_API_KEY}` +
      `&artist=${encodeURIComponent(artist)}` +
      `&track=${encodeURIComponent(track)}` +
      `&format=json&username=${LASTFM_USERNAME}`;
  } else {
    return res.status(400).json({ error: true, message: "Unsupported method" });
  }

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Last.fm responded with ${r.status}`);
    const data = await r.json();
    // Cache at the edge: live tracks 30s, everything else 120s
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
}
