import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { X, Keyboard } from 'lucide-react';
import { motionTransitions } from '../lib/motion-tokens';
import { SECTIONS, SECTION_LABELS, SECTION_ICONS } from './Navigation';

const ACTION_SHORTCUTS = [
  { id: 'kk-b', keys: 'B', label: 'Back to top', icon: 'fas fa-arrow-up' },
  { id: 'kk-q', keys: '?', label: 'Toggle shortcuts', icon: 'fas fa-keyboard' },
  { id: 'kk-esc', keys: 'Esc', label: 'Close / dismiss', icon: 'fas fa-xmark' },
];

export default function KeyboardShortcuts({ open, onClose, activeSection }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="kbd-overlay"
          className="fixed inset-0 z-[9998] flex items-start justify-center overflow-y-auto bg-black/60 p-6 pt-20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={motionTransitions.easeSoft}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kbdOverlayTitle"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={motionTransitions.springGentle}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2
                id="kbdOverlayTitle"
                className="flex items-center gap-2 text-base font-semibold text-text-primary"
              >
                <Keyboard className="h-4 w-4" aria-hidden="true" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={onClose}
                aria-label="Close shortcuts"
                className="focus-ring flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="mb-2.5 text-[11px] font-semibold tracking-[0.1em] text-text-subtle uppercase">
                Navigation
              </p>
              <ul className="flex flex-col">
                {SECTIONS.map((s, i) => (
                  <li
                    key={s}
                    className={`flex items-center justify-between rounded-md px-2.5 py-2 text-sm ${
                      activeSection === s ? 'bg-surface-hover text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <i
                        className={`fas ${SECTION_ICONS[s] || 'fa-circle-dot'} w-3.5 text-center text-xs`}
                        aria-hidden="true"
                      />
                      {SECTION_LABELS[s]}
                    </span>
                    <kbd
                      id={`kk-${i + 1}`}
                      className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-text-secondary"
                    >
                      {i + 1}
                    </kbd>
                  </li>
                ))}
              </ul>

              <p className="mt-5 mb-2.5 text-[11px] font-semibold tracking-[0.1em] text-text-subtle uppercase">
                Actions
              </p>
              <ul className="flex flex-col">
                {ACTION_SHORTCUTS.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-md px-2.5 py-2 text-sm text-text-muted"
                  >
                    <span className="flex items-center gap-2.5">
                      <i className={`${a.icon} w-3.5 text-center text-xs`} aria-hidden="true" />
                      {a.label}
                    </span>
                    <kbd
                      id={a.id}
                      className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-text-secondary"
                    >
                      {a.keys}
                    </kbd>
                  </li>
                ))}
              </ul>

              <p className="mt-5 flex items-start gap-2 rounded-md bg-surface-hover px-3 py-2.5 text-xs leading-relaxed text-text-subtle">
                <i className="fas fa-circle-info mt-0.5" aria-hidden="true" />
                Shortcuts are disabled while typing in a form field.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
