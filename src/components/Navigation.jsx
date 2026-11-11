import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Menu, X } from 'lucide-react';
import PillNavigation from './ui/PillNavigation';
import { motionTransitions } from '../lib/motion-tokens';

export const SECTIONS = ['home', 'about', 'projects', 'skills', 'hobbies', 'contact'];

export const SECTION_LABELS = {
  home: 'Home',
  about: 'About',
  projects: 'Projects',
  skills: 'Skills',
  hobbies: 'Hobbies',
  contact: 'Contact',
};

export const SECTION_ICONS = {
  home: 'fa-house',
  about: 'fa-user',
  projects: 'fa-folder-open',
  skills: 'fa-code',
  hobbies: 'fa-gamepad',
  contact: 'fa-paper-plane',
};

const NAV_ITEMS = SECTIONS.map((id) => ({ id, label: SECTION_LABELS[id] }));

export default function Navigation({ activeSection, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobilePanelRef = useRef(null);

  // Scroll-shrink: toggle `scrolled` state past a 20px threshold
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on Escape + click-away
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    const onClick = (e) => {
      if (!mobilePanelRef.current?.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [mobileOpen]);

  const handleNav = (section) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-transparent bg-surface/60 p-1.5 shadow-elevated backdrop-blur-2xl">
        {/* ── Logo ── */}
        <button
          onClick={() => handleNav('home')}
          aria-label="Go to home page"
          className="focus-ring flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface/80 px-4 text-sm font-bold text-text-primary italic transition-colors hover:border-border-hover hover:bg-surface-hover"
        >
          <Code2 className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
          <span className="hidden sm:inline">Devajith</span>
        </button>

        {/* ── Desktop pill navigation ── */}
        <div className="animate-nav-slide-down hidden lg:block">
          <PillNavigation
            items={NAV_ITEMS}
            value={activeSection}
            onChange={(id) => handleNav(id)}
            ariaLabel="Main navigation"
            className={scrolled ? 'shadow-elevated' : 'shadow-subtle'}
          />
        </div>

        {/* ── Mobile toggle ── */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
          id="mobileMenuBtn"
          className="focus-ring flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface/80 text-text-primary transition-colors hover:border-border-hover hover:bg-surface-hover lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* ── Mobile gooey drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            ref={mobilePanelRef}
            id="mobile-nav-panel"
            key="mobile-nav"
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={motionTransitions.springGentle}
            className="pointer-events-auto relative mt-2 w-full max-w-sm origin-top lg:hidden"
          >
            {/* Blur + alpha-contrast is what turns flat shapes into a liquid that
                merges. stdDeviation is matched to the row height so neighbouring
                rows bridge, not just the outer silhouette. */}
            <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0 overflow-hidden">
              <defs>
                <filter id="goo-nav-filter" colorInterpolationFilters="sRGB">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
                  />
                </filter>
              </defs>
            </svg>

            {/* Blob layer: one flat colour, filtered, so the panel and each row
                melt together. Text sits above this on an unfiltered layer. */}
            <div
              aria-hidden="true"
              className="goo-filter pointer-events-none absolute inset-0 overflow-hidden rounded-[30px] bg-surface-raised"
            >
              <p className="invisible px-3 pt-3 pb-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
                Navigation
              </p>
              <motion.ul
                className="grid gap-1 p-2"
                initial="hidden"
                animate="shown"
                variants={{ shown: { transition: { staggerChildren: 0.045, delayChildren: 0.03 } } }}
              >
                {SECTIONS.map((s) => (
                  <motion.li
                    key={s}
                    className="rounded-full bg-surface-raised px-3 py-3"
                    variants={{
                      hidden: { scaleX: 0.35, scaleY: 0.2, opacity: 0 },
                      shown: { scaleX: 1, scaleY: 1, opacity: 1 },
                    }}
                    transition={motionTransitions.springMorph}
                  >
                    <span className="invisible flex items-center gap-3 text-sm">
                      <i className={`fas ${SECTION_ICONS[s]} w-4 text-center`} />
                      {SECTION_LABELS[s]}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            <p className="relative z-10 px-3 pt-3 pb-1 text-[11px] font-semibold tracking-[0.12em] text-text-subtle uppercase">
              Navigation
            </p>
            <ul className="relative z-10 grid auto-rows-fr gap-1 p-2">
              {SECTIONS.map((s) => {
                const active = activeSection === s;
                return (
                  <li key={s}>
                    <button
                      onClick={() => handleNav(s)}
                      aria-current={active ? 'page' : undefined}
                      className={`focus-ring flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                        active
                          ? 'bg-surface-hover font-semibold text-text-primary'
                          : 'text-text-secondary hover:bg-surface-hover/70 hover:text-text-primary'
                      }`}
                    >
                      <i className={`fas ${SECTION_ICONS[s]} w-4 text-center`} aria-hidden="true" />
                      <span>{SECTION_LABELS[s]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
