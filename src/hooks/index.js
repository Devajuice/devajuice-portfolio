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

// ── useTheme ──────────────────────────────────────────────────
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f7f8' : '#111113');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme };
}

// ── useNowPlaying ─────────────────────────────────────────────
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
  const wordsKey = words.join('\0');

  useEffect(() => {
    let cancelled = false;
    let wIdx = 0,
      cIdx = 0,
      del = false;
    let timer;

    const tick = () => {
      if (cancelled) return;
      const word = words[wIdx] || '';
      if (!del) {
        cIdx++;
        setText(word.slice(0, cIdx));
        if (cIdx === word.length) {
          del = true;
          timer = setTimeout(tick, 1800);
        } else {
          timer = setTimeout(tick, 90);
        }
      } else {
        cIdx--;
        setText(word.slice(0, cIdx));
        if (cIdx === 0) {
          del = false;
          wIdx = (wIdx + 1) % words.length;
          timer = setTimeout(tick, 300);
        } else {
          timer = setTimeout(tick, 50);
        }
      }
    };

    timer = setTimeout(tick, 700);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [wordsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return text;
}
