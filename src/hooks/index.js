import { useState, useEffect, useCallback } from 'react';
import { fetchNowPlaying } from '../utils/lastfm';

// ── useSound ──────────────────────────────────────────────────
export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('soundEnabled') === 'true'
  );

  const toggle = useCallback(
    (val) => {
      const next = val !== undefined ? val : !soundEnabled;
      setSoundEnabled(next);
      localStorage.setItem('soundEnabled', next);
      return next;
    },
    [soundEnabled]
  );

  return { soundEnabled, toggle };
}

// ── useNowPlaying ─────────────────────────────────────────────
export function useNowPlaying() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchNowPlaying();
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData({ error: true });
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return data;
}

// ── useTimezone ───────────────────────────────────────────────
export function useTimezone() {
  const MY_TZ = 'Asia/Kolkata',
    MY_TZ_SHORT = 'IST';
  const [display, setDisplay] = useState({
    time: '--:-- --',
    label: 'Loading...',
  });

  useEffect(() => {
    const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fmtTime = (tz) => {
      try {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date());
      } catch {
        return '--:--';
      }
    };
    const getMinutes = (tz) => {
      try {
        const p = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        }).formatToParts(new Date());
        return (
          parseInt(p.find((x) => x.type === 'hour')?.value || 0) * 60 +
          parseInt(p.find((x) => x.type === 'minute')?.value || 0)
        );
      } catch {
        return 0;
      }
    };
    const getLabel = () => {
      try {
        const isDev =
          visitorTz === MY_TZ || visitorTz.includes('Calcutta') || visitorTz.includes('Kolkata');
        if (isDev) return `${MY_TZ_SHORT} · Same timezone as me 🙌`;
        let diff = getMinutes(MY_TZ) - getMinutes(visitorTz);
        if (diff > 720) diff -= 1440;
        if (diff < -720) diff += 1440;
        const a = Math.abs(diff),
          h = Math.floor(a / 60),
          m = a % 60;
        return `${MY_TZ_SHORT} · ${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${diff > 0 ? 'ahead of' : 'behind'} you`;
      } catch {
        return MY_TZ_SHORT;
      }
    };
    const tick = () => setDisplay({ time: fmtTime(MY_TZ), label: getLabel() });
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  return display;
}

// ── useTypewriter ─────────────────────────────────────────────
export function useTypewriter(words = ['Student', 'Developer', 'Gamer']) {
  const [text, setText] = useState('');

  useEffect(() => {
    let cancelled = false;
    let wIdx = 0,
      cIdx = 0,
      del = false;

    const tick = () => {
      if (cancelled) return;
      const word = words[wIdx];
      if (!del) {
        cIdx++;
        setText(word.slice(0, cIdx));
        if (cIdx === word.length) {
          del = true;
          setTimeout(tick, 1800);
        } else {
          setTimeout(tick, 90);
        }
      } else {
        cIdx--;
        setText(word.slice(0, cIdx));
        if (cIdx === 0) {
          del = false;
          wIdx = (wIdx + 1) % words.length;
          setTimeout(tick, 300);
        } else {
          setTimeout(tick, 50);
        }
      }
    };

    const initial = setTimeout(tick, 700);
    return () => {
      cancelled = true;
      clearTimeout(initial);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return text;
}
