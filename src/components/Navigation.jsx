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
      <div className="pointer-events-auto flex max-w-full items-center gap-2">
        {/* ── Logo ── */}
        <button
          onClick={() => handleNav('home')}
          aria-label="Go to home page"
          className="focus-ring flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-[#1f1f1f] bg-[#050505] px-4 py-2.5 text-sm font-bold text-[#fafafa] italic shadow-[0_8px_32px_rgba(0,0,0,0.18)] transition-colors hover:border-[#4a4a4a]"
        >
          <Code2 className="h-3.5 w-3.5 text-[#a1a1a1]" aria-hidden="true" />
          <span className="hidden sm:inline">Devajith</span>
        </button>

        {/* ── Desktop pill navigation ── */}
        <div className="animate-nav-slide-down hidden md:block">
          {/* The pill is always dark, so the scroll state only deepens the
              shadow rather than introducing a competing glass bar. */}
          <PillNavigation
            items={NAV_ITEMS}
            value={activeSection}
            onChange={(id) => handleNav(id)}
            ariaLabel="Main navigation"
            className={scrolled ? 'shadow-[0_16px_36px_-10px_rgba(15,15,20,0.32)]' : undefined}
          />
        </div>

        {/* ── Mobile toggle ── */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
          id="mobileMenuBtn"
          className="focus-ring flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#1f1f1f] bg-[#050505] text-[#fafafa] shadow-[0_8px_32px_rgba(0,0,0,0.18)] transition-colors hover:border-[#4a4a4a] md:hidden"
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
            className="pointer-events-auto relative mt-2 w-full max-w-sm origin-top md:hidden"
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
              className="goo-filter pointer-events-none absolute inset-0 overflow-hidden rounded-[30px] bg-[#0e0e0e]"
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
                    className="rounded-full bg-[#0e0e0e] px-3 py-2.5"
                    variants={{
                      hidden: { scaleX: 0.35, scaleY: 0.2, opacity: 0 },
                      shown: { scaleX: 1, scaleY: 1, opacity: 1 },
                    }}
                    transition={motionTransitions.springMorph}
                  >
                    {/* Mirrors the row's own metrics and glyph, so blob and button
                        are the same height without a hardcoded value. `invisible`
                        keeps layout while emitting nothing into the filter. */}
                    <span className="invisible flex items-center gap-3 text-sm">
                      <i className={`fas ${SECTION_ICONS[s]} w-4 text-center`} />
                      {SECTION_LABELS[s]}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            <p className="relative z-10 px-3 pt-3 pb-1 text-[11px] font-semibold tracking-[0.12em] text-[#525252] uppercase">
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
                      className={`focus-ring flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? 'bg-[#1f1f1f] font-semibold text-[#fafafa]'
                          : 'text-[#a1a1a1] hover:bg-[#18181a] hover:text-[#fafafa]'
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
