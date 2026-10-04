import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Info, TriangleAlert } from 'lucide-react';
import { ToastContext } from './ToastContext';
import { motionTransitions } from '../lib/motion-tokens';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: TriangleAlert,
};

const TONE = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-text-secondary',
  warning: 'text-amber-500',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4500) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[9999] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] || ICONS.info;
            return (
              <motion.div
                key={toast.id}
                layout
                role="status"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={motionTransitions.springSnappy}
                className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full border border-border bg-surface py-2.5 pr-2.5 pl-4 shadow-elevated"
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${TONE[toast.type] || TONE.info}`}
                  aria-hidden="true"
                />
                <span
                  className="text-sm text-text-primary"
                  dangerouslySetInnerHTML={{ __html: toast.message }}
                />
                <button
                  className="focus-ring ml-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-subtle transition-colors hover:bg-surface-hover hover:text-text-primary"
                  aria-label="Dismiss"
                  onClick={() => dismiss(toast.id)}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
