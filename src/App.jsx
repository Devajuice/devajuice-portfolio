import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import Navigation from './components/Navigation';
import HomeSection from './components/HomeSection';
import { ToastProvider } from './components/Toast';
import { useToast } from './components/useToast';
import { useNowPlaying, useParticleCanvas, useSound } from './hooks';
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--accent)' }} />
    </div>
  );
}

function triggerConfetti() {
  const colors = ['#000000', '#333333', '#666666'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `left:${Math.random() * 100}vw;background:${colors[Math.floor(Math.random() * colors.length)]};width:${Math.random() * 8 + 4}px;height:${Math.random() * 8 + 4}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation-delay:${Math.random() * 0.8}s;animation-duration:${Math.random() * 1.5 + 1.5}s;`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

const SECTIONS = ['home', 'about', 'projects', 'skills', 'hobbies', 'contact'];
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
  const [kbdOpen, setKbdOpen] = useState(false);
  const [easterEggOpen, setEasterEggOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const musicData = useNowPlaying();
  const showToast = useToast();
  const ogImage = useOgImage({
    title: 'Devajith — Portfolio',
    description: 'Building cool things on the web.',
    author: 'Devajith',
  });
  const canvasRef = useRef(null);
  const splashRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const activeSectionRef = useRef(_initialSection);
  const musicStartedRef = useRef(false);
  useParticleCanvas(canvasRef);

  const navigate = useCallback((sectionId) => {
    if (isTransitioningRef.current) return;
    const current = activeSectionRef.current;
    if (sectionId === current) return;

    // Determine direction: going forward (right→left slide) or backward (left→right slide)
    const goingForward = SECTIONS.indexOf(sectionId) > SECTIONS.indexOf(current);

    activeSectionRef.current = sectionId;
    playSound('nav');
    window.location.hash = sectionId;
    window.scrollTo({ top: 0, behavior: 'instant' });
    isTransitioningRef.current = true;

    // Exit: forward → slide out left; backward → slide out right
    setSectionState((prev) => ({
      ...prev,
      [current]: goingForward ? 'exiting' : 'exiting to-right',
    }));

    setTimeout(() => {
      setSectionState(() => ({
        ...Object.fromEntries(SECTIONS.map((s) => [s, 'hidden'])),
        // Pre-position incoming section off-screen in the correct direction
        [sectionId]: goingForward ? 'active' : 'active from-left-init',
      }));
      setActiveSection(sectionId);

      requestAnimationFrame(() => {
        setSectionState((prev) => ({
          ...prev,
          // Enter: forward → from right (default); backward → from left
          [sectionId]: goingForward ? 'active entering' : 'active entering from-left',
        }));
      });

      setTimeout(() => {
        isTransitioningRef.current = false;
      }, ENTER_MS);
    }, EXIT_MS);
  }, []);

  // Keep activeSectionRef in sync with state
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Fix: handle browser Back/Forward — when the user presses back/forward,
  // the hash changes but the section doesn't update without this listener.
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

  // Splash screen
  useEffect(() => {
    const splash = splashRef.current;
    if (!splash) return;
    const timer = setTimeout(() => {
      splash.classList.add('splash-out');
      splash.addEventListener('transitionend', () => splash.remove(), {
        once: true,
      });
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const btns = document.querySelectorAll('[data-magnetic]');
    btns.forEach((btn) => {
      btn.onmousemove = (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * 0.38;
        const dy = (e.clientY - r.top - r.height / 2) * 0.38;
        btn.style.transition = 'transform .25s cubic-bezier(.23,1,.32,1)';
        btn.style.transform = `translate(${dx}px,${dy}px)`;
      };
      btn.onmouseleave = () => {
        btn.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';
        btn.style.transform = 'translate(0,0)';
      };
    });
    // Cleanup handlers on unmount / section change
    return () => {
      btns.forEach((btn) => {
        btn.onmousemove = null;
        btn.onmouseleave = null;
      });
    };
  }, [activeSection]);

  // Scroll → back-to-top button + progress bar (single listener for perf)
  useEffect(() => {
    const progressEl = document.getElementById('scrollProgress');
    const onScroll = () => {
      const scrollY = window.scrollY;
      setShowBackToTop(scrollY > 0);
      // Update CSS custom property for the progress bar transform
      if (progressEl) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
        progressEl.style.setProperty('--scroll-progress', pct);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // First interaction -> start music
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

  // Animated favicon — throttled to ~10 fps; paused when tab is hidden.
  // Fix: stop the animation after 3 seconds — the favicon doesn't need to
  // spin forever and calling toDataURL() + setting link.href every 100ms
  // causes unnecessary repaints for the lifetime of the page.
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
    const INTERVAL = 100; // ~10 fps — favicon doesn't need 60 fps
    const STOP_AFTER = 3000; // stop animating after 3 seconds
    const startTime = performance.now();

    const draw = (now) => {
      // Fix: stop the loop once the intro animation is done
      if (now - startTime >= STOP_AFTER) {
        cancelAnimationFrame(rafId);
        return;
      }
      rafId = requestAnimationFrame(draw);
      if (document.hidden) return; // skip entirely when tab is backgrounded
      if (now - lastDraw < INTERVAL) return; // throttle
      lastDraw = now;

      const t = frame / 120;
      ctx.clearRect(0, 0, 32, 32);
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      const angle = t * Math.PI * 2,
        r = 8,
        dx = 16 + Math.cos(angle) * r,
        dy = 16 + Math.sin(angle) * r;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('</>', 16, 16);
      link.href = canvas.toDataURL('image/png');
      frame = (frame + 1) % 120;
    };
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Konami code
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
        triggerConfetti();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Swipe gestures — reads activeSectionRef so listeners are registered ONCE
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
    // Use the ref so this closure never goes stale — no re-registration needed
    const idx = () => SECTIONS.indexOf(activeSectionRef.current);
    const showHint = (d, n) => {
      ha.textContent = d === 'left' ? '→' : '←';
      hl.textContent = n[0].toUpperCase() + n.slice(1);
      hint.className = `swipe-hint swipe-hint--${d} swipe-hint--visible`;
    };
    const hideHint = () => hint.classList.remove('swipe-hint--visible');
    const onStart = (e) => {
      if (
        e.touches.length !== 1 ||
        e.target.closest('.tags,.skill-bars-list,input,textarea,select')
      )
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
  }, []); // stable: reads activeSectionRef + navigate (useCallback, stable ref)

  // Fix #2: keyboard shortcuts — navigate is now defined above this effect
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
      const SECTION_KEYS = {
        1: 'home',
        2: 'about',
        3: 'projects',
        4: 'skills',
        5: 'hobbies',
        6: 'contact',
      };
      if (SECTION_KEYS[e.key]) {
        e.preventDefault();
        flashKey({ 1: 'kk-1', 2: 'kk-2', 3: 'kk-3', 4: 'kk-4', 5: 'kk-5', 6: 'kk-6' }[e.key]);
        const s = SECTION_KEYS[e.key];
        setKbdOpen(false);
        navigate(s);
        showToast(
          `<i class="fas fa-compass" style="margin-right:4px"></i> Jumped to <strong>${s[0].toUpperCase() + s.slice(1)}</strong>`,
          'info',
          1600
        );
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
  }, [kbdOpen, easterEggOpen, navigate]);

  // Fix #2: sound toggle now fully delegated to useSound hook
  const handleSoundToggle = () => {
    const next = toggleSound();
    // Fix #2: keep the audio module's internal cache in sync so playSound()
    // doesn't have to re-read localStorage on every call
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
    if (!s || s === 'hidden') return 'page-section';
    // s can be: "active", "active entering", "active entering from-left",
    //           "active from-left-init", "exiting", "exiting to-right"
    return `page-section ${s}`;
  };

  return (
    <>
      {/* OG / Twitter meta tags */}
      <Helmet>
        <meta property="og:title" content="Devajith — Portfolio" />
        <meta property="og:description" content="Building cool things on the web." />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      {/* Splash */}
      <div ref={splashRef} id="pageSplash" className="page-splash" aria-hidden="true">
        <div className="splash-inner">
          <div className="splash-logo">
            <i className="fas fa-code" />
            <span>Devajith</span>
          </div>
          <div className="splash-bar-wrap">
            <div className="splash-bar" />
          </div>
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <div
        id="scrollProgress"
        className="scroll-progress"
        aria-hidden="true"
        style={{ '--scroll-progress': 0 }}
      />

      {/* Canvas */}
      <canvas ref={canvasRef} id="particleCanvas" aria-hidden="true" />

      <Suspense fallback={null}>
        {/* Easter Egg */}
        <EasterEgg open={easterEggOpen} onClose={() => setEasterEggOpen(false)} />

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts
          open={kbdOpen}
          onClose={() => setKbdOpen(false)}
          activeSection={activeSection}
        />
      </Suspense>

      {/* Back to Top */}
      <button
        id="backToTop"
        className={`back-to-top${showBackToTop ? ' btt-visible' : ''}`}
        aria-label="Back to top"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          playSound('nav');
        }}
      >
        <i className="fas fa-arrow-up" aria-hidden="true" />
      </button>

      {/* Sound Toggle */}
      <button
        id="soundToggle"
        className={`sound-toggle-btn${showBackToTop ? ' snd-visible' : ''}${!soundEnabled ? ' muted' : ''}`}
        aria-label={soundEnabled ? 'Mute transition sounds' : 'Unmute transition sounds'}
        onClick={handleSoundToggle}
      >
        <i
          className={`fas ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}
          aria-hidden="true"
        />
      </button>

      {/* Keyboard hint badge */}
      <button
        className="kbd-hint-badge"
        id="kbdHintBadge"
        aria-label="View keyboard shortcuts"
        onClick={() => setKbdOpen(true)}
      >
        <kbd>?</kbd>
        <span>Shortcuts</span>
      </button>

      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Navigation */}
      <Navigation activeSection={activeSection} onNavigate={navigate} />

      {/* Main Content */}
      <main id="main-content" className="main-content">
        <Suspense fallback={<LoadingFallback />}>
          <section id="home" className={getStateClasses('home')} aria-labelledby="home-heading">
            <HomeSection onNavigate={navigate} musicData={musicData} />
          </section>
          <section id="about" className={getStateClasses('about')} aria-labelledby="about-heading">
            <AboutSection musicData={musicData} />
          </section>
          <section
            id="projects"
            className={getStateClasses('projects')}
            aria-labelledby="projects-heading"
          >
            <ProjectsSection />
          </section>
          <section
            id="skills"
            className={getStateClasses('skills')}
            aria-labelledby="skills-heading"
          >
            <SkillsSection isActive={activeSection === 'skills'} />
          </section>
          <section
            id="hobbies"
            className={getStateClasses('hobbies')}
            aria-labelledby="hobbies-heading"
          >
            <HobbiesSection />
          </section>
          <section
            id="contact"
            className={getStateClasses('contact')}
            aria-labelledby="contact-heading"
          >
            <ContactSection />
          </section>
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
