import React, { useState, useCallback, useRef } from 'react';
import { ToastContext } from './ToastContext';
import NotificationStack from './ui/NotificationStack';

/**
 * Notification state for the whole app. Rendering is delegated to the EasyUI
 * NotificationStack, so every `showToast()` call site gets the stacked
 * spring elevation and swipe-to-dismiss for free.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4500) => {
      const id = ++idRef.current;
      // Newest first: the stack renders index 0 as the card on top of the pile,
      // so pushing to the front is what makes a new toast the visible one.
      setToasts((t) => [{ id, message, type }, ...t]);
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
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[9999] flex flex-col items-center px-4">
        <div aria-live="polite" aria-atomic="false" className="w-full">
          <NotificationStack notifications={toasts} onDismiss={dismiss} />
        </div>
      </div>
    </ToastContext.Provider>
  );
}