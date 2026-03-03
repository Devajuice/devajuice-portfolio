const LASTFM_USERNAME = 'Devajuice';
const LASTFM_API_KEY = 'a1947761da6f45ca8c47e50ebf1033c2';
const LASTFM_PH = '2a96cbd8b46e442fc41c2b86b821562f';

function getBestImage(images) {
  if (!images) return '';
  for (const sz of ['extralarge', 'large', 'medium', 'small']) {
    const img = images.find(i => i.size === sz);
    if (img?.['#text']?.trim() && !img['#text'].includes(LASTFM_PH)) return img['#text'];
  }
  return '';
}

export async function fetchNowPlaying() {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1&extended=1`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.message);
    const track = data.recenttracks?.track?.[0];
    if (!track) return { isLive: false, name: '', artist: '', album: '', art: '' };

    const isLive = track['@attr']?.nowplaying === 'true';
    const name = track.name || 'Unknown Track';
    const artist = track.artist?.name || track.artist?.['#text'] || 'Unknown Artist';
    let album = track.album?.['#text'] || '';
    let art = getBestImage(track.image);

    if (!album || !art) {
      try {
        const ti = await (await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(name)}&format=json&username=${LASTFM_USERNAME}`
        )).json();
        if (ti.track?.album) {
          album = album || ti.track.album.title || '';
          if (!art) art = getBestImage(ti.track.album.image);
        }
      } catch (_) {}
    }
    return { isLive, name, artist, album: album || 'Unknown Album', art };
  } catch {
    return { error: true };
  }
}
