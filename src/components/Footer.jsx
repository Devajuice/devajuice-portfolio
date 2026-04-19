import React from 'react';

export default function Footer({ onOpenShortcuts }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-glow-line" aria-hidden="true" />
      <div className="footer-inner">
        <div className="footer-left">
          <a href="/" className="footer-logo" aria-label="Go to home">
            <i className="fas fa-code" aria-hidden="true" />
            <span className="footer-logo-text">Devajuice</span>
          </a>
          <p className="footer-built-with">
            Built with{' '}
            <span className="footer-stack">
              <span className="footer-stack-chip">
                <i className="fab fa-react" aria-hidden="true" />
                React
              </span>
              <span className="footer-stack-chip">
                <i className="fab fa-js" aria-hidden="true" />
                JS
              </span>
              <span className="footer-stack-chip">
                <i className="fas fa-cloud" aria-hidden="true" />
                Vercel
              </span>
            </span>
          </p>
        </div>
        <div className="footer-center">
          <span className="footer-copy">&copy; {year} Devajuice. All rights reserved.</span>
          <button
            className="footer-kbd-hint"
            onClick={onOpenShortcuts}
            aria-label="View keyboard shortcuts"
          >
            <kbd>?</kbd>
            <span>Keyboard shortcuts</span>
          </button>
        </div>
        <div className="footer-links">
          <a
            href="https://github.com/devajuice"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <i className="fab fa-github" />
          </a>
          <a
            href="https://www.linkedin.com/in/devajith-jijush-5741ab39b/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <i className="fab fa-linkedin" />
          </a>
          <a
            href="https://instagram.com/devajuice"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram" />
          </a>
        </div>
      </div>
    </footer>
  );
}
