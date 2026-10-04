import { useEffect, useState } from 'react';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function readIsDark() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * Tracks whether the `.dark` class is applied to <html>.
 *
 * The theme is bootstrapped inline in index.html (localStorage, then the OS
 * preference), so it lives on the DOM rather than in React state. This hook
 * mirrors it into state and stays in sync via a MutationObserver plus a
 * matchMedia listener, so components that need concrete colours — the WebGL
 * dot shader, canvas confetti — can react instead of reading the DOM once.
 */
export function useIsDark() {
  const [isDark, setIsDark] = useState(readIsDark);

  useEffect(() => {
    const sync = () => setIsDark(readIsDark());

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const media = window.matchMedia?.(DARK_QUERY);
    media?.addEventListener?.('change', sync);

    // Re-sync once mounted in case the class landed after first render.
    sync();

    return () => {
      observer.disconnect();
      media?.removeEventListener?.('change', sync);
    };
  }, []);

  return isDark;
}

export default useIsDark;
