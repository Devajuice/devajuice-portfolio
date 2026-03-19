export default async function handler(req, res) {
  try {
    const r = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
        `&user=Devajuice&api_key=${process.env.LASTFM_API_KEY}` +
        `&format=json&limit=1&extended=1`,
    );
    if (!r.ok) throw new Error(`Last.fm responded with ${r.status}`);
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
}
