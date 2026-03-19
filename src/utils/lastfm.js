const LASTFM_USERNAME = "Devajuice";
const LASTFM_PH = "2a96cbd8b46e442fc41c2b86b821562f";

// In development (vite dev), call Last.fm directly so we don't need a
// running serverless runtime. In production (Vercel), route through the
// /api/nowplaying serverless function so the API key stays server-side.
const IS_DEV = import.meta.env.DEV;
const LASTFM_API_KEY_DEV = import.meta.env.VITE_LASTFM_API_KEY;

// ─── In-memory cache ─────────────────────────────────────────────────────────
// Live tracks:    cache 30 s  (user might change song soon)
// Non-live tracks: cache 120 s (won't change until next play)
// Art lookups:    capped at 100 entries — evicts oldest when full (Fix #3)
let _cache = null; // { data, ts, isLive }
let _artCache = new Map(); // "artist|album" → artUrl  (max 100 entries)
let _inflight = null; // deduplicates concurrent calls

const LIVE_TTL = 30_000;
const RECENT_TTL = 120_000;
const FETCH_TIMEOUT = 6_000;
const ART_CACHE_MAX = 100;

// Fix #6: module-level track name so fetchiTunesCoverArt can use it in the
// fallback search even when called with only artist + album args
let _currentTrackName = "";

// Fix #3: bounded art cache setter — evicts the oldest key once the cap is hit
function setArtCache(key, url) {
  if (_artCache.size >= ART_CACHE_MAX) {
    // Map iteration order is insertion order, so .keys().next() is the oldest
    _artCache.delete(_artCache.keys().next().value);
  }
  _artCache.set(key, url);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fetchWithTimeout(url, ms = FETCH_TIMEOUT) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), ms);
  return fetch(url, { signal: ac.signal }).finally(() => clearTimeout(id));
}

function getBestImage(images) {
  if (!images) return "";
  for (const sz of ["extralarge", "large", "medium", "small"]) {
    const img = images.find((i) => i.size === sz);
    if (img?.["#text"]?.trim() && !img["#text"].includes(LASTFM_PH))
      return img["#text"];
  }
  return "";
}

// ─── iTunes cover art with session cache ─────────────────────────────────────
// Scores a result: +2 exact artist match, +2 exact album match, +1 partial each.
// Higher score = better match. Falls back to track search if album search misses.
function _scoreResult(r, artist, album) {
  let score = 0;
  const ra = (r.artistName || "").toLowerCase();
  const rc = (r.collectionName || "").toLowerCase();
  const al = artist.toLowerCase(),
    ab = album.toLowerCase();
  if (ra === al) score += 2;
  else if (ra.includes(al) || al.includes(ra)) score += 1;
  if (rc === ab) score += 2;
  else if (rc.includes(ab) || ab.includes(rc)) score += 1;
  return score;
}

function _toMaxResArt(url) {
  // iTunes serves artwork up to 3000×3000 — replace the size token for the best quality
  return url ? url.replace(/\d+x\d+bb/, "3000x3000bb") : "";
}

async function fetchiTunesCoverArt(artist, album) {
  const key = `${artist}|${album}`.toLowerCase();
  if (_artCache.has(key)) return _artCache.get(key);
  try {
    // Primary: album search
    const q = encodeURIComponent(`${artist} ${album}`);
    const res = await fetchWithTimeout(
      `https://itunes.apple.com/search?term=${q}&entity=album&limit=8`,
    );
    if (!res.ok) return "";
    const data = await res.json();

    let url = "";
    if (data.results?.length) {
      // Pick highest-scoring result; fall through to track search only on zero score
      const best = data.results
        .map((r) => ({ r, score: _scoreResult(r, artist, album) }))
        .sort((a, b) => b.score - a.score)[0];
      if (best.score > 0 || data.results.length === 1) {
        url = _toMaxResArt(best.r.artworkUrl100 || "");
      }
    }

    // Fix #6: fallback searches by artist + track NAME, not album — album may be
    // empty or wrong at this point, but `name` (the track title) is always known
    if (!url && album !== artist) {
      const qt = encodeURIComponent(`${artist} ${_currentTrackName}`);
      const res2 = await fetchWithTimeout(
        `https://itunes.apple.com/search?term=${qt}&entity=musicTrack&limit=5`,
      );
      if (res2.ok) {
        const data2 = await res2.json();
        const hit =
          data2.results?.find((r) => {
            const ra = (r.artistName || "").toLowerCase();
            return (
              ra === artist.toLowerCase() || ra.includes(artist.toLowerCase())
            );
          }) ?? data2.results?.[0];
        if (hit?.artworkUrl100) url = _toMaxResArt(hit.artworkUrl100);
      }
    }

    // Fix #3: use bounded setter instead of direct Map.set
    setArtCache(key, url);
    return url;
  } catch {
    return "";
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────
export async function fetchNowPlaying() {
  // Return cached result if still fresh
  if (_cache) {
    const ttl = _cache.isLive ? LIVE_TTL : RECENT_TTL;
    if (Date.now() - _cache.ts < ttl) return _cache.data;
  }
  // Deduplicate: if a fetch is already in-flight, share that Promise
  if (_inflight) return _inflight;
  _inflight = _doFetch().finally(() => {
    _inflight = null;
  });
  return _inflight;
}

async function _doFetch() {
  try {
    // Dev: call Last.fm directly (no serverless runtime needed for vite dev)
    // Prod: route through /api/nowplaying so the key never hits the browser
    const recentTracksUrl = IS_DEV
      ? `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
        `&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY_DEV}` +
        `&format=json&limit=1&extended=1`
      : `/api/nowplaying`;

    const res = await fetchWithTimeout(recentTracksUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.message);

    const track = data.recenttracks?.track?.[0];
    if (!track) {
      const empty = { isLive: false, name: "", artist: "", album: "", art: "" };
      _cache = { data: empty, ts: Date.now(), isLive: false };
      return empty;
    }

    const isLive = track["@attr"]?.nowplaying === "true";
    const name = track.name || "Unknown Track";
    const artist =
      track.artist?.name || track.artist?.["#text"] || "Unknown Artist";
    let album = track.album?.["#text"] || "";
    let lastfmArt = getBestImage(track.image);

    // Fix #6: store track name at module level so fetchiTunesCoverArt fallback
    // can search by track title instead of (possibly empty/wrong) album name
    _currentTrackName = name;

    const needsInfo = !album || !lastfmArt;

    // Fire track.getInfo and iTunes lookup in PARALLEL (not sequentially)
    const [infoResult, itunesResult] = await Promise.allSettled([
      needsInfo
        ? fetchWithTimeout(
            IS_DEV
              ? `https://ws.audioscrobbler.com/2.0/?method=track.getInfo` +
                  `&api_key=${LASTFM_API_KEY_DEV}` +
                  `&artist=${encodeURIComponent(artist)}` +
                  `&track=${encodeURIComponent(name)}` +
                  `&format=json&username=${LASTFM_USERNAME}`
              : `/api/nowplaying?method=track.getInfo` +
                  `&artist=${encodeURIComponent(artist)}` +
                  `&track=${encodeURIComponent(name)}`,
          )
            .then((r) => r.json())
            .catch(() => null)
        : Promise.resolve(null),
      // Start iTunes lookup immediately with whatever album name we have
      fetchiTunesCoverArt(artist, album || name),
    ]);

    if (infoResult.status === "fulfilled" && infoResult.value?.track?.album) {
      const info = infoResult.value.track.album;
      album = album || info.title || "";
      lastfmArt = lastfmArt || getBestImage(info.image);
    }

    album = album || "Unknown Album";

    // If speculative iTunes used empty album, retry with resolved name
    let art =
      itunesResult.status === "fulfilled" && itunesResult.value
        ? itunesResult.value
        : await fetchiTunesCoverArt(artist, album);

    art = art || lastfmArt;

    const result = { isLive, name, artist, album, art };
    _cache = { data: result, ts: Date.now(), isLive };
    return result;
  } catch {
    return { error: true }; // don't cache errors → allow retry next poll
  }
}
