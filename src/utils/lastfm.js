const LASTFM_USERNAME = "Devajuice";
const LASTFM_API_KEY = "a1947761da6f45ca8c47e50ebf1033c2";
const LASTFM_PH = "2a96cbd8b46e442fc41c2b86b821562f";

function getBestImage(images) {
  if (!images) return "";
  for (const sz of ["extralarge", "large", "medium", "small"]) {
    const img = images.find((i) => i.size === sz);
    if (img?.["#text"]?.trim() && !img["#text"].includes(LASTFM_PH))
      return img["#text"];
  }
  return "";
}

// ---------------------------------------------------------------------------
// iTunes Search API — CORS-friendly, no API key required
// ---------------------------------------------------------------------------

/**
 * Searches iTunes for an album cover by artist + album name.
 * Returns a 600×600 artwork URL, or '' if nothing was found.
 */
async function fetchiTunesCoverArt(artist, album) {
  try {
    const q = encodeURIComponent(`${artist} ${album}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${q}&entity=album&limit=5`,
    );
    if (!res.ok) return "";
    const data = await res.json();
    if (!data.results?.length) return "";

    // Prefer a result whose album title matches; otherwise take the first
    const match =
      data.results.find((r) =>
        r.collectionName?.toLowerCase().includes(album.toLowerCase()),
      ) ?? data.results[0];

    // artworkUrl100 is always present — swap dimensions for higher resolution
    return match.artworkUrl100?.replace("100x100bb", "600x600bb") || "";
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchNowPlaying() {
  try {
    // --- 1. Fetch recent track metadata from Last.fm ---
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
        `&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1&extended=1`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.message);

    const track = data.recenttracks?.track?.[0];
    if (!track)
      return { isLive: false, name: "", artist: "", album: "", art: "" };

    const isLive = track["@attr"]?.nowplaying === "true";
    const name = track.name || "Unknown Track";
    const artist =
      track.artist?.name || track.artist?.["#text"] || "Unknown Artist";
    let album = track.album?.["#text"] || "";
    let lastfmArt = getBestImage(track.image); // kept as final fallback

    // If album name or art is missing, ask track.getInfo
    if (!album || !lastfmArt) {
      try {
        const ti = await (
          await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=track.getInfo` +
              `&api_key=${LASTFM_API_KEY}` +
              `&artist=${encodeURIComponent(artist)}` +
              `&track=${encodeURIComponent(name)}` +
              `&format=json&username=${LASTFM_USERNAME}`,
          )
        ).json();
        if (ti.track?.album) {
          album = album || ti.track.album.title || "";
          lastfmArt = lastfmArt || getBestImage(ti.track.album.image);
        }
      } catch (_) {}
    }

    album = album || "Unknown Album";

    // --- 2. Try iTunes for cover art first, fall back to Last.fm image ---
    const itunesArt = await fetchiTunesCoverArt(artist, album);
    const art = itunesArt || lastfmArt;

    return { isLive, name, artist, album, art };
  } catch {
    return { error: true };
  }
}
