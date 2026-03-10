import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const ICONS = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'info', duration = 4500) => {
    const id = ++idRef.current;
    setToasts(t => [...t, { id, message, type, visible: false }]);
    // Trigger enter animation
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, visible: true } : x));
    }));
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(t => t.map(x => x.id === id ? { ...x, visible: false } : x));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 350);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}${toast.visible ? ' toast-in' : ''}`} role="status">
            <i className={`fas ${ICONS[toast.type] || ICONS.info}`} aria-hidden="true" />
            <span className="toast-msg" dangerouslySetInnerHTML={{ __html: toast.message }} />
            <button className="toast-close" aria-label="Dismiss" onClick={() => dismiss(toast.id)}>
              <i className="fas fa-xmark" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
