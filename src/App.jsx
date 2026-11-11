import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import Navigation, { SECTIONS, SECTION_LABELS } from './components/Navigation';
import HomeSection from './components/HomeSection';
import DotShader from './components/ui/DotShader';
import { ToastProvider } from './components/Toast';
import { useToast } from './components/useToast';
import { useNowPlaying, useSound, useTheme } from './hooks';
import {
  playSound,
  startBgMusic,
  stopBgMusic,
  getAudioCtx,
  isBgMusicPlaying,
  setSoundEnabled,
} from './utils/audio';
import { Helmet } from 'react-helmet-async';
import { useOgImage } from './hooks/useOgImage';
import { ArrowUp, Volume2, VolumeX, Sun, Moon, Music2 } from 'lucide-react';
import { cn } from './lib/utils';
import ErrorBoundary from './components/ErrorBoundary';

const AboutSection = lazy(() => import('./components/AboutSection'));
const ProjectsSection = lazy(() => import('./components/ProjectsSection'));
const SkillsSection = lazy(() => import('./components/SkillsSection'));
const HobbiesSection = lazy(() => import('./components/HobbiesSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const EasterEgg = lazy(() => import('./components/EasterEgg'));
const KeyboardShortcuts = lazy(() => import('./components/KeyboardShortcuts'));
const Footer = lazy(() => import('./components/Footer'));

function LoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <i className="fas fa-spinner fa-spin text-2xl text-text-primary" aria-hidden="true" />
    </div>
  );
}

function triggerConfetti(theme) {
  const colors = theme === 'light' ? ['#111113', '#71717a', '#16a34a'] : ['#f2f2f3', '#a1a1a6', '#4ade80'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `left:${Math.random() * 100}vw;background:${colors[Math.floor(Math.random() * colors.length)]};width:${Math.random() * 8 + 4}px;height:${Math.random() * 8 + 4}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation-delay:${Math.random() * 0.8}s;animation-duration:${Math.random() * 1.5 + 1.5}s;`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

const EXIT_MS = 180,
  ENTER_MS = 300;

// Fix: deduplicate initial section computation — evaluated once at module level,
// shared by useState, sectionState initializer, and activeSectionRef.
const _initialSection = (() => {
  const hash = window.location.hash.slice(1);
  return SECTIONS.includes(hash) ? hash : 'home';
})();

function AppInner() {
  const [activeSection, setActiveSection] = useState(_initialSection);
  const [sectionState, setSectionState] = useState(() =>
    Object.fromEntries(
      SECTIONS.map((s) => [s, s === _initialSection ? 'active entering' : 'hidden'])
    )
  );
  const { soundEnabled, toggle: toggleSound } = useSound();
  const { theme, toggleTheme } = useTheme();
  const [kbdOpen, setKbdOpen] = useState(false);
  const [easterEggOpen, setEasterEggOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const musicData = useNowPlaying();
  const showToast = useToast();
  const ogImage = useOgImage();
  const splashRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const activeSectionRef = useRef(_initialSection);

  const [revealed, setRevealed] = useState(() => new Set([_initialSection]));
  const markRevealed = useCallback((id) => {
    setRevealed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);
  const musicStartedRef = useRef(false);

  const navigate = useCallback(
    (sectionId) => {
      if (isTransitioningRef.current) return;
      const current = activeSectionRef.current;
      if (sectionId === current) return;

      const goingForward = SECTIONS.indexOf(sectionId) > SECTIONS.indexOf(current);

      activeSectionRef.current = sectionId;
      playSound('nav');
      window.location.hash = sectionId;
      window.scrollTo({ top: 0, behavior: 'instant' });
      isTransitioningRef.current = true;

      setSectionState((prev) => ({
        ...prev,
        [current]: goingForward ? 'exiting' : 'exiting to-right',
      }));

      setTimeout(() => {
        setSectionState(() => ({
          ...Object.fromEntries(SECTIONS.map((s) => [s, 'hidden'])),
          [sectionId]: goingForward ? 'active entering' : 'active entering from-left',
        }));
        setActiveSection(sectionId);
        markRevealed(sectionId);

        setTimeout(() => {
          isTransitioningRef.current = false;
        }, ENTER_MS);
      }, EXIT_MS);
    },
    [markRevealed]
  );

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.slice(1);
      if (SECTIONS.includes(hash) && hash !== activeSectionRef.current) {
        navigate(hash);
      }
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, [navigate]);

  useEffect(() => {
    const splash = splashRef.current;
    if (!splash) return;
    const timer = setTimeout(() => {
      splash.classList.add('splash-out');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const progressEl = document.getElementById('scrollProgress');
    const onScroll = () => {
      const scrollY = window.scrollY;
      setShowBackToTop(scrollY > 0);
      if (progressEl) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
        progressEl.style.setProperty('--scroll-progress', pct);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (musicStartedRef.current) return;
      musicStartedRef.current = true;
      if (soundEnabled) {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended')
          ctx
            .resume()
            .then(() => startBgMusic())
            .catch(() => {});
        else startBgMusic();
      }
    };
    ['click', 'keydown', 'touchstart', 'pointerdown'].forEach((evt) =>
      document.addEventListener(evt, handler, { passive: true, once: true })
    );
    const onVisibility = () => {
      if (document.hidden) {
        if (isBgMusicPlaying()) stopBgMusic();
      } else {
        if (soundEnabled && musicStartedRef.current && !isBgMusicPlaying()) startBgMusic();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [soundEnabled]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext('2d');
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    let frame = 0,
      rafId,
      lastDraw = 0;
    const INTERVAL = 100;
    const STOP_AFTER = 3000;
    const startTime = performance.now();
    const isLight = theme === 'light';
    const bg = isLight ? '#111113' : '#f2f2f3';
    const fg = isLight ? '#f7f7f8' : '#0a0a0a';

    const draw = (now) => {
      if (now - startTime >= STOP_AFTER) {
        cancelAnimationFrame(rafId);
        return;
      }
      rafId = requestAnimationFrame(draw);
      if (document.hidden) return;
      if (now - lastDraw < INTERVAL) return;
      lastDraw = now;

      ctx.clearRect(0, 0, 32, 32);
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = fg;
      ctx.fillText('</>', 16, 16);
      link.href = canvas.toDataURL('image/png');
      frame = (frame + 1) % 120;
    };
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [theme]);

  useEffect(() => {
    const K = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let seq = [],
      timer;
    const handler = (e) => {
      seq.push(e.key);
      if (seq.length > K.length) seq.shift();
      clearTimeout(timer);
      timer = setTimeout(() => (seq = []), 3000);
      if (seq.length === K.length && seq.every((k, i) => k === K[i])) {
        seq = [];
        setEasterEggOpen(true);
        triggerConfetti(theme);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('swipeHintSeen') === 'true') return;
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    const timer = setTimeout(() => {
      showToast('Tip: swipe left or right to move between sections', 'info', 3200);
      localStorage.setItem('swipeHintSeen', 'true');
    }, 1800);
    return () => clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    const MIN_X = 55,
      MAX_Y = 80,
      MIN_V = 0.3;
    let sx = 0,
      sy = 0,
      st = 0,
      swiping = false;
    const hint = document.createElement('div');
    hint.className = 'swipe-hint';
    hint.innerHTML = '<span class="swipe-hint-arrow"></span><span class="swipe-hint-label"></span>';
    document.body.appendChild(hint);
    const ha = hint.querySelector('.swipe-hint-arrow'),
      hl = hint.querySelector('.swipe-hint-label');
    const idx = () => SECTIONS.indexOf(activeSectionRef.current);
    const showHint = (d, n) => {
      ha.textContent = d === 'left' ? '→' : '←';
      hl.textContent = n[0].toUpperCase() + n.slice(1);
      hint.className = `swipe-hint swipe-hint--${d} swipe-hint--visible`;
    };
    const hideHint = () => hint.classList.remove('swipe-hint--visible');
    const onStart = (e) => {
      if (e.touches.length !== 1 || e.target.closest('input,textarea,select,[role="progressbar"]'))
        return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      st = Date.now();
      swiping = true;
    };
    const onMove = (e) => {
      if (!swiping) return;
      const dx = e.touches[0].clientX - sx,
        dy = Math.abs(e.touches[0].clientY - sy);
      if (dy > MAX_Y) {
        swiping = false;
        hideHint();
        return;
      }
      const i = idx();
      if (Math.abs(dx) > 20) {
        if (dx < 0 && i < SECTIONS.length - 1) showHint('left', SECTIONS[i + 1]);
        else if (dx > 0 && i > 0) showHint('right', SECTIONS[i - 1]);
        else hideHint();
      }
    };
    const onEnd = (e) => {
      if (!swiping) return;
      swiping = false;
      hideHint();
      const dx = e.changedTouches[0].clientX - sx,
        dy = Math.abs(e.changedTouches[0].clientY - sy),
        v = Math.abs(dx) / (Date.now() - st);
      if (dy > MAX_Y || Math.abs(dx) < MIN_X || v < MIN_V) return;
      const i = idx();
      if (dx < 0 && i < SECTIONS.length - 1) {
        navigate(SECTIONS[i + 1]);
        showToast('→ ' + SECTIONS[i + 1][0].toUpperCase() + SECTIONS[i + 1].slice(1), 'info', 1200);
      } else if (dx > 0 && i > 0) {
        navigate(SECTIONS[i - 1]);
        showToast('← ' + SECTIONS[i - 1][0].toUpperCase() + SECTIONS[i - 1].slice(1), 'info', 1200);
      }
    };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener(
      'touchcancel',
      () => {
        swiping = false;
        hideHint();
      },
      { passive: true }
    );
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      hint.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isTyping = () => {
      const t = document.activeElement?.tagName?.toLowerCase();
      return (
        t === 'input' ||
        t === 'textarea' ||
        t === 'select' ||
        document.activeElement?.isContentEditable
      );
    };
    const flashKey = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('pressed');
      setTimeout(() => el.classList.remove('pressed'), 240);
    };
    const handler = (e) => {
      if (e.key === 'Escape') {
        flashKey('kk-esc');
        if (kbdOpen) {
          setKbdOpen(false);
          return;
        }
        if (easterEggOpen) {
          setEasterEggOpen(false);
          return;
        }
        return;
      }
      if (isTyping() || e.ctrlKey || e.altKey || e.metaKey) return;
      const sectionIndex = Number(e.key) - 1;
      const s = SECTIONS[sectionIndex];
      if (Number.isInteger(sectionIndex) && sectionIndex >= 0 && s) {
        e.preventDefault();
        flashKey(`kk-${e.key}`);
        setKbdOpen(false);
        navigate(s);
        showToast(`Jumped to ${s[0].toUpperCase() + s.slice(1)}`, 'info', 1600);
        return;
      }
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        flashKey('kk-b');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        flashKey('kk-q');
        setKbdOpen((o) => !o);
        return;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [kbdOpen, easterEggOpen, navigate, showToast]);

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundEnabled(next);
    if (next) {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended')
        ctx
          .resume()
          .then(() => startBgMusic())
          .catch(() => {});
      else startBgMusic();
    } else {
      stopBgMusic();
      musicStartedRef.current = false;
    }
  };

  const getStateClasses = (section) => {
    const s = sectionState[section];
    const base = !s || s === 'hidden' ? 'page-section' : `page-section ${s}`;
    return revealed.has(section) ? `${base} revealed` : base;
  };

  const activeIndex = Math.max(0, SECTIONS.indexOf(activeSection));
  const activeLabel = SECTION_LABELS[activeSection] || activeSection;
  const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const nowPlayingText = musicData?.error
    ? 'Music unavailable'
    : musicData?.name
      ? `${musicData.name} — ${musicData.artist}`
      : musicData === null
        ? 'Loading music…'
        : 'No recent track';
  const nowPlayingState = musicData?.isLive ? 'Live now' : 'Ambient / recent';

  const shaderProps =
    theme === 'light'
      ? {
          dotColor: 'rgba(17, 17, 19, 0.08)',
          accentColor: 'rgba(17, 17, 19, 0.28)',
        }
      : {
          dotColor: 'rgba(242, 242, 243, 0.14)',
          accentColor: 'rgba(242, 242, 243, 0.7)',
        };

  return (
    <>
      <Helmet>
        <title>{`${activeLabel} | Devajith Portfolio`}</title>
        <meta
          name="description"
          content="Portfolio of Devajith — student, developer, and data analyst building web projects, data-driven solutions, and interactive experiences."
        />
        <meta property="og:title" content={`${activeLabel} | Devajith Portfolio`} />
        <meta property="og:description" content="Explore Devajith's projects, skills, and ways to get in touch." />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${activeLabel} | Devajith Portfolio`} />
        <meta name="twitter:description" content="Explore Devajith's projects, skills, and ways to get in touch." />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <div ref={splashRef} id="pageSplash" className="page-splash" aria-hidden="true">
        <div className="splash-inner">
          <div className="splash-logo">
            <i className="fas fa-code" aria-hidden="true" />
            <span>Devajith</span>
          </div>
          <div className="splash-bar-wrap">
            <div className="splash-bar" />
          </div>
        </div>
      </div>

      <div id="scrollProgress" className="scroll-progress" aria-hidden="true" />

      <DotShader
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        dotSize={isCoarsePointer ? 1.2 : 1.4}
        spacing={isCoarsePointer ? 30 : 24}
        cursorRadius={isCoarsePointer ? 0 : 190}
        distortionStrength={isCoarsePointer ? 0 : 0.32}
        maxScale={isCoarsePointer ? 1 : 2.4}
        waveIntensity={isCoarsePointer ? 0.08 : 0.22}
        interactive={!isCoarsePointer}
        overlay={false}
        {...shaderProps}
      />

      <Suspense fallback={null}>
        <EasterEgg open={easterEggOpen} onClose={() => setEasterEggOpen(false)} />
        <KeyboardShortcuts
          open={kbdOpen}
          onClose={() => setKbdOpen(false)}
          activeSection={activeSection}
        />
      </Suspense>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Current section: {activeLabel}
      </div>

      {/* Section orientation - desktop */}
      <nav
        aria-label="Section progress"
        className="pointer-events-auto fixed top-1/2 left-4 z-[850] hidden -translate-y-1/2 flex-col gap-3 rounded-2xl border border-border bg-surface/70 p-3 shadow-subtle backdrop-blur-xl lg:flex"
      >
        {SECTIONS.map((s, i) => {
          const active = s === activeSection;
          return (
            <button
              key={s}
              type="button"
              onClick={() => navigate(s)}
              className="focus-ring group flex items-center gap-2 text-left"
              aria-current={active ? 'page' : undefined}
              aria-label={`Go to ${SECTION_LABELS[s]} section`}
              title={SECTION_LABELS[s]}
            >
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full border transition-all',
                  active
                    ? 'scale-110 border-text-primary bg-text-primary'
                    : 'border-border-hover bg-transparent group-hover:border-text-muted'
                )}
              />
              <span
                className={cn(
                  'text-[11px] font-medium transition-colors',
                  active ? 'text-text-primary' : 'text-text-subtle group-hover:text-text-secondary'
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Section orientation - mobile */}
      <div className="pointer-events-auto fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[850] mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-2 shadow-elevated backdrop-blur-xl lg:hidden" aria-label="Section progress">
        <span className="text-[11px] font-semibold text-text-secondary">
          {activeIndex + 1}/{SECTIONS.length}
        </span>
        <div className="flex items-center gap-1.5">
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => navigate(s)}
              aria-label={`Go to ${SECTION_LABELS[s]}`}
              aria-current={s === activeSection ? 'page' : undefined}
              className={cn(
                'h-2.5 rounded-full transition-all',
                s === activeSection ? 'w-6 bg-text-primary' : 'w-2.5 bg-border hover:bg-border-hover'
              )}
            />
          ))}
        </div>
        <span className="max-w-[8rem] truncate text-[11px] text-text-muted">{activeLabel}</span>
      </div>

      {/* Floating controls */}
      <div className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[900] flex flex-col items-end gap-2.5 sm:right-5 sm:bottom-5">
        <button
          className="kbd-hint-badge"
          id="kbdHintBadge"
          aria-label="View keyboard shortcuts"
          onClick={() => setKbdOpen(true)}
        >
          <kbd>?</kbd>
          <span>Shortcuts</span>
        </button>

        <div className="hidden min-w-[260px] max-w-[320px] rounded-2xl border border-border bg-surface/75 p-3 shadow-elevated backdrop-blur-xl md:block">
          <div className="mb-2 flex items-start gap-2">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-hover/70 text-text-secondary">
              <Music2 className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-text-subtle uppercase">
                {nowPlayingState}
              </p>
              <p className="truncate text-sm font-medium text-text-primary" title={nowPlayingText}>
                {nowPlayingText}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="soundToggle"
              className={cn(
                'focus-ring inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface-hover/70 px-3 text-sm font-medium text-text-primary transition-colors hover:border-border-hover hover:bg-surface-hover',
                !soundEnabled && 'text-text-muted'
              )}
              aria-label={soundEnabled ? 'Mute sounds and ambient music' : 'Unmute sounds and ambient music'}
              onClick={handleSoundToggle}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
              <span>{soundEnabled ? 'Ambient on' : 'Ambient off'}</span>
            </button>
            <button
              type="button"
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-hover/70 text-text-primary transition-colors hover:border-border-hover hover:bg-surface-hover"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="flex gap-2.5 md:hidden">
          <button
            id="soundToggleMobile"
            className={cn('floating-btn backdrop-blur-xl', !soundEnabled && 'muted')}
            aria-label={soundEnabled ? 'Mute sounds and ambient music' : 'Unmute sounds and ambient music'}
            onClick={handleSoundToggle}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="floating-btn backdrop-blur-xl"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        <div className="flex gap-2.5">
          <button
            id="soundToggle"
            className={cn('floating-btn hidden md:!hidden backdrop-blur-xl', !soundEnabled && 'muted')}
            aria-label={soundEnabled ? 'Mute sounds and ambient music' : 'Unmute sounds and ambient music'}
            onClick={handleSoundToggle}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          </button>

          <button
            id="backToTop"
            className={cn('floating-btn backdrop-blur-xl', showBackToTop && 'visible')}
            aria-label="Back to top"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              playSound('nav');
            }}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navigation activeSection={activeSection} onNavigate={navigate} theme={theme} />

      <main id="main-content" className="relative z-10 flex min-h-screen flex-col">
        <Suspense fallback={<LoadingFallback />}>
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-28 pb-28 sm:px-6 sm:pt-36 sm:pb-20 md:pt-40 lg:pl-24">
            <ErrorBoundary>
              <section id="home" className={getStateClasses('home')} aria-labelledby="home-heading">
                <HomeSection onNavigate={navigate} musicData={musicData} />
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section
                id="about"
                className={getStateClasses('about')}
                aria-labelledby="about-heading"
              >
                <AboutSection musicData={musicData} />
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section
                id="projects"
                className={getStateClasses('projects')}
                aria-labelledby="projects-heading"
              >
                <ProjectsSection />
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section
                id="skills"
                className={getStateClasses('skills')}
                aria-labelledby="skills-heading"
              >
                <SkillsSection isActive={activeSection === 'skills'} />
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section
                id="hobbies"
                className={getStateClasses('hobbies')}
                aria-labelledby="hobbies-heading"
              >
                <HobbiesSection />
              </section>
            </ErrorBoundary>
            <ErrorBoundary>
              <section
                id="contact"
                className={getStateClasses('contact')}
                aria-labelledby="contact-heading"
              >
                <ContactSection />
              </section>
            </ErrorBoundary>
          </div>
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
