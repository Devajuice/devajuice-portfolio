import { useEffect, useState } from 'react';
import { fetchNowPlaying } from '../utils/lastfm';

export function useNowPlaying() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    async function load() {
      let nextDelay = 30000;
      try {
        const result = await fetchNowPlaying();
        if (!cancelled) setData(result);
        nextDelay = result?.isLive ? 30000 : 120000;
      } catch {
        if (!cancelled) setData({ error: true });
        nextDelay = 60000;
      } finally {
        if (!cancelled) timeoutId = setTimeout(load, nextDelay);
      }
    }

    load();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return data;
}
