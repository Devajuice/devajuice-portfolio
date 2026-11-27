const LASTFM_PH = '2a96cbd8b46e442fc41c2b86b821562f';

// Always go through /api/nowplaying, never Last.fm directly.
//
// Dev/preview: handled by the lastfmDevApi plugin in vite.config.js.
// Production:   handled by api/nowplaying.js (Vercel function).
//
// The API key must never be read from import.meta.env here — a VITE_ prefixed
// key gets inlined into the production bundle as plaintext. Keeping it behind
// this one URL means it stays server-side in every environment.

// ─── In-memory cache ─────────────────────────────────────────────────────────
// Live tracks:     cache 30 s  (user might change song soon)
// Non-live tracks: cache 120 s (won't change until next play)
// Art lookups:     capped at 100 entries — evicts oldest when full
let _cache = null; // { data, ts, isLive }
let _artCache = new Map(); // "artist|album" → artUrl  (max 100 entries)
let _inflight = null; // deduplicates concurrent calls

const LIVE_TTL = 30_000;
const RECENT_TTL = 120_000;
const FETCH_TIMEOUT = 6_000;
const ART_CACHE_MAX = 100;

function setArtCache(key, url) {
  if (_artCache.size >= ART_CACHE_MAX) {
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
  if (!images) return '';
  for (const sz of ['extralarge', 'large', 'medium', 'small']) {
    const img = images.find((i) => i.size === sz);
    if (img?.['#text']?.trim() && !img['#text'].includes(LASTFM_PH)) return img['#text'];
  }
  return '';
}

function _scoreResult(r, artist, album) {
  let score = 0;
  const ra = (r.artistName || '').toLowerCase();
  const rc = (r.collectionName || '').toLowerCase();
  const al = artist.toLowerCase();
  const ab = album.toLowerCase();
  if (ra === al) score += 2;
  else if (ra.includes(al) || al.includes(ra)) score += 1;
  if (rc === ab) score += 2;
  else if (rc.includes(ab) || ab.includes(rc)) score += 1;
  return score;
}

function _toMaxResArt(url) {
  return url ? url.replace(/\d+x\d+bb/, '3000x3000bb') : '';
}

async function fetchiTunesCoverArt(artist, album, trackName = '') {
  const key = `${artist}|${album}`.toLowerCase();
  if (_artCache.has(key)) return _artCache.get(key);
  try {
    const q = encodeURIComponent(`${artist} ${album}`);
    const res = await fetchWithTimeout(
      `https://itunes.apple.com/search?term=${q}&entity=album&limit=8`
    );
    if (!res.ok) return '';
    const data = await res.json();

    let url = '';
    if (data.results?.length) {
      const best = data.results
        .map((r) => ({ r, score: _scoreResult(r, artist, album) }))
        .sort((a, b) => b.score - a.score)[0];
      if (best.score > 0 || data.results.length === 1) {
        url = _toMaxResArt(best.r.artworkUrl100 || '');
      }
    }

    if (!url && (album !== artist || trackName)) {
      const qt = encodeURIComponent(`${artist} ${trackName || album}`);
      const res2 = await fetchWithTimeout(
        `https://itunes.apple.com/search?term=${qt}&entity=musicTrack&limit=5`
      );
      if (res2.ok) {
        const data2 = await res2.json();
        const hit =
          data2.results?.find((r) => {
            const ra = (r.artistName || '').toLowerCase();
            return ra === artist.toLowerCase() || ra.includes(artist.toLowerCase());
          }) ?? data2.results?.[0];
        if (hit?.artworkUrl100) url = _toMaxResArt(hit.artworkUrl100);
      }
    }

    setArtCache(key, url);
    return url;
  } catch {
    return '';
  }
}

function trackUrl(track) {
  const name = track?.name || '';
  const artist = track?.artist?.name || track?.artist?.['#text'] || track?.artist || '';
  return `https://music.youtube.com/search?q=${encodeURIComponent(`${name} ${artist}`.trim())}`;
}

function normalizeRawTrack(track) {
  const isLive = track?.['@attr']?.nowplaying === 'true';
  const name = track?.name || 'Unknown Track';
  const artist = track?.artist?.name || track?.artist?.['#text'] || 'Unknown Artist';
  const album = track?.album?.['#text'] || '';
  const lastfmArt = getBestImage(track?.image);
  const uts = Number.parseInt(track?.date?.uts, 10);
  return {
    isLive,
    name,
    artist,
    album,
    art: lastfmArt,
    url: trackUrl(track),
    playedAt: Number.isFinite(uts) ? uts * 1000 : null,
  };
}

async function enrichTrack(track) {
  const needsInfo = !track.album || !track.art;
  const [infoResult, itunesResult] = await Promise.allSettled([
    needsInfo
      ? fetchWithTimeout(
          `/api/nowplaying?method=track.getInfo` +
            `&artist=${encodeURIComponent(track.artist)}` +
            `&track=${encodeURIComponent(track.name)}`
        )
          .then((r) => r.json())
          .catch(() => null)
      : Promise.resolve(null),
    fetchiTunesCoverArt(track.artist, track.album || track.name, track.name),
  ]);

  let album = track.album;
  let lastfmArt = track.art;
  if (infoResult.status === 'fulfilled' && infoResult.value?.track?.album) {
    const info = infoResult.value.track.album;
    album = album || info.title || '';
    lastfmArt = lastfmArt || getBestImage(info.image);
  }
  album = album || 'Unknown Album';

  let art =
    itunesResult.status === 'fulfilled' && itunesResult.value
      ? itunesResult.value
      : await fetchiTunesCoverArt(track.artist, album, track.name);
  art = art || lastfmArt;

  return { ...track, album, art };
}

// ─── Public API ──────────────────────────────────────────────────────────────
export async function fetchNowPlaying({ limit = 5 } = {}) {
  const safeLimit = Number.isFinite(limit) ? Math.min(10, Math.max(1, limit)) : 5;
  if (_cache) {
    const ttl = _cache.isLive ? LIVE_TTL : RECENT_TTL;
    if (Date.now() - _cache.ts < ttl && _cache.limit >= safeLimit) return _cache.data;
  }
  if (_inflight) return _inflight;
  _inflight = _doFetch(safeLimit).finally(() => {
    _inflight = null;
  });
  return _inflight;
}

async function _doFetch(limit) {
  try {
    const res = await fetchWithTimeout(`/api/nowplaying?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.message);

    const rawTracks = data.recenttracks?.track;
    const tracks = (Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : [])
      .slice(0, limit)
      .map(normalizeRawTrack);

    if (tracks.length === 0) {
      const empty = {
        isLive: false,
        name: '',
        artist: '',
        album: '',
        art: '',
        recentTracks: [],
      };
      _cache = { data: empty, ts: Date.now(), isLive: false, limit };
      return empty;
    }

    const recentTracks = await Promise.all(tracks.map((t) => enrichTrack(t)));
    const current = recentTracks[0];
    const result = {
      isLive: current.isLive,
      name: current.name,
      artist: current.artist,
      album: current.album,
      art: current.art,
      url: current.url,
      recentTracks,
    };
    _cache = { data: result, ts: Date.now(), isLive: current.isLive, limit };
    return result;
  } catch {
    // A missing API key is reported by the /api/nowplaying handler (dev proxy or
    // serverless function), so no extra warning is needed here. Don't cache
    // errors, so a fixed key recovers on the next poll.
    return { error: true, recentTracks: [] };
  }
}
