import { useState, useEffect, useRef, useCallback } from "react";
import { fetchNowPlaying } from "../utils/lastfm";

// ── useTheme ───────────────────────────────────────────────────
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute("data-theme") || "light";
  });

  const updateTheme = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);

  return { theme, updateTheme };
}

// ── useSound ──────────────────────────────────────────────────
export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem("soundEnabled") === "true",
  );

  const toggle = useCallback(
    (val) => {
      const next = val !== undefined ? val : !soundEnabled;
      setSoundEnabled(next);
      localStorage.setItem("soundEnabled", next);
      return next;
    },
    [soundEnabled],
  );

  return { soundEnabled, toggle };
}

// ── useNowPlaying ─────────────────────────────────────────────
export function useNowPlaying() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Fix #7: catch fetch/network errors so the pill never gets stuck on "Loading…"
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
  const MY_TZ = "Asia/Kolkata",
    MY_TZ_SHORT = "IST";
  const [display, setDisplay] = useState({
    time: "--:-- --",
    label: "Loading...",
  });

  useEffect(() => {
    const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fmtTime = (tz) => {
      try {
        return new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
      } catch {
        return "--:--";
      }
    };
    const getMinutes = (tz) => {
      try {
        const p = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        }).formatToParts(new Date());
        return (
          parseInt(p.find((x) => x.type === "hour")?.value || 0) * 60 +
          parseInt(p.find((x) => x.type === "minute")?.value || 0)
        );
      } catch {
        return 0;
      }
    };
    const getLabel = () => {
      try {
        const isDev =
          visitorTz === MY_TZ ||
          visitorTz.includes("Calcutta") ||
          visitorTz.includes("Kolkata");
        if (isDev) return `${MY_TZ_SHORT} · Same timezone as me 🙌`;
        let diff = getMinutes(MY_TZ) - getMinutes(visitorTz);
        if (diff > 720) diff -= 1440;
        if (diff < -720) diff += 1440;
        const a = Math.abs(diff),
          h = Math.floor(a / 60),
          m = a % 60;
        return `${MY_TZ_SHORT} · ${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${diff > 0 ? "ahead of" : "behind"} you`;
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

// ── useParticleCanvas ─────────────────────────────────────────
export function useParticleCanvas(canvasRef) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W,
      H,
      particles,
      rafId = null;
    const mouse = { x: -9999, y: -9999 };
    const COUNT = Math.min(80, Math.floor(window.innerWidth / 18));
    const MAX_DIST = 140,
      MOUSE_DIST = 180;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const createParticles = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      }));
    };
    const getAccentColor = () =>
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "59,130,246"
        : "37,99,235";
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const accent = getAccentColor();
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.012;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
        const mdx = p.x - mouse.x,
          mdy = p.y - mouse.y,
          md = Math.hypot(mdx, mdy);
        if (md < MOUSE_DIST) {
          const force = ((MOUSE_DIST - md) / MOUSE_DIST) * 0.015;
          p.vx += (mdx / md) * force;
          p.vy += (mdy / md) * force;
          const spd = Math.hypot(p.vx, p.vy);
          if (spd > 1.5) {
            p.vx = (p.vx / spd) * 1.5;
            p.vy = (p.vy / spd) * 1.5;
          }
        } else {
          p.vx *= 0.995;
          p.vy *= 0.995;
        }
        const po = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse)),
          pr = p.r * (0.9 + 0.1 * Math.sin(p.pulse * 1.3));
        ctx.beginPath();
        ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent},${po})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i],
            b = particles[j],
            dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${accent},${(1 - dist / MAX_DIST) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      createParticles();
    };
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) draw();
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    createParticles();
    draw();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [canvasRef]);
}

// ── useTypewriter ─────────────────────────────────────────────
// Fix #5: use a ref-based flag to reliably cancel on unmount mid-timeout
export function useTypewriter(words = ["Student", "Developer", "Gamer"]) {
  const [text, setText] = useState("");

  useEffect(() => {
    let cancelled = false; // Fix #5: single cancellation flag covers all pending timers
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
