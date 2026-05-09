import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

const SECTIONS = ['home', 'about', 'projects', 'skills', 'hobbies', 'contact'];

export default function KeyboardShortcuts({ open, onClose, activeSection }) {
  const panelRef = useRef(null);
  useFocusTrap(panelRef, open);

  // Escape to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div
      id="kbdOverlay"
      className={`kbd-overlay${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kbdOverlayTitle"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="kbd-panel" ref={panelRef}>
        <div className="kbd-header">
          <div className="kbd-title" id="kbdOverlayTitle">
            <i className="fas fa-keyboard" aria-hidden="true" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button className="kbd-close" onClick={onClose} aria-label="Close shortcuts">
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <p className="kbd-section-label">Navigation</p>
        <ul className="kbd-list">
          {SECTIONS.map((s, i) => {
            const icons = {
              home: 'fa-house',
              about: 'fa-user-circle',
              projects: 'fa-folder-open',
              skills: 'fa-chart-line',
              hobbies: 'fa-heart',
              contact: 'fa-envelope',
            };
            return (
              <li
                key={s}
                className={`kbd-item${activeSection === s ? ' is-active' : ''}`}
                data-section={s}
              >
                <span className="kbd-desc">
                  <i className={`fas ${icons[s]}`} aria-hidden="true" />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
                <span className="kbd-keys">
                  <kbd id={`kk-${i + 1}`}>{i + 1}</kbd>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="kbd-section-label">Actions</p>
        <ul className="kbd-list">
          <li className="kbd-item">
            <span className="kbd-desc">
              <i className="fas fa-arrow-up" aria-hidden="true" />
              Back to top
            </span>
            <span className="kbd-keys">
              <kbd id="kk-b">B</kbd>
            </span>
          </li>
          <li className="kbd-item">
            <span className="kbd-desc">
              <i className="fas fa-keyboard" aria-hidden="true" />
              Toggle shortcuts
            </span>
            <span className="kbd-keys">
              <kbd id="kk-q">?</kbd>
            </span>
          </li>
          <li className="kbd-item">
            <span className="kbd-desc">
              <i className="fas fa-xmark" aria-hidden="true" />
              Close / dismiss
            </span>
            <span className="kbd-keys">
              <kbd id="kk-esc">Esc</kbd>
            </span>
          </li>
        </ul>
        <p className="kbd-footer">
          <i className="fas fa-circle-info" aria-hidden="true" />
          Shortcuts are disabled while typing in a form field.
        </p>
      </div>
    </div>
  );
}
