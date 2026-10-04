import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../hooks/useFocusTrap';
import Button from './ui/Button';
import { motionTransitions } from '../lib/motion-tokens';

export default function EasterEgg({ open, onClose }) {
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
          key="easter-egg-overlay"
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
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
            aria-labelledby="easter-egg-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={motionTransitions.springGentle}
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center shadow-elevated"
          >
            <div className="animate-easter-bounce mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-hover text-2xl">
              <span aria-hidden="true">🎮</span>
            </div>

            <h2
              id="easter-egg-title"
              className="text-lg font-semibold tracking-tight text-text-primary"
            >
              Achievement Unlocked!
            </h2>

            <p className="mt-1.5 font-mono text-xs text-text-subtle">↑ ↑ ↓ ↓ ← → ← → B A</p>

            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              You found the Konami Code Easter Egg.
              <br />
              Clearly a person of culture.
            </p>

            <p className="mt-5 inline-flex rounded-full border border-border bg-surface-hover px-4 py-1.5 text-xs font-semibold text-text-primary">
              +30 Gamer Points
            </p>

            <div className="mt-6">
              <Button onClick={onClose} fullWidth>
                Nice, thanks!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
