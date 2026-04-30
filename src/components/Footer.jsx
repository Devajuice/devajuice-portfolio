import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-glow-line" aria-hidden="true" />
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col footer-col-brand">
            <a href="/" className="footer-logo" aria-label="Go to home">
              <i className="fas fa-code" aria-hidden="true" />
              <span className="footer-logo-text">Devajuice</span>
            </a>
            <p className="footer-tagline">Student. Developer. Data Analyst.</p>
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

          <div className="footer-col">
            <h3 className="footer-col-title">Quick Links</h3>
            <ul className="footer-links-list">
              <li>
                <a href="/#about">About</a>
              </li>
              <li>
                <a href="/#projects">Projects</a>
              </li>
              <li>
                <a href="/#skills">Skills</a>
              </li>
              <li>
                <a href="/#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Connect</h3>
            <ul className="footer-links-list">
              <li>
                <a href="mailto:devajith@example.com" className="footer-email">
                  <i className="fas fa-envelope" aria-hidden="true" />
                  devajuice@zohomail.in
                </a>
              </li>
              <li>
                <a href="https://github.com/devajuice" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github" aria-hidden="true" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/devajith-jijush-5741ab39b/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-linkedin" aria-hidden="true" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Resources</h3>
            <ul className="footer-links-list">
              <li>
                <a href="/assets/Devajith_Resume.pdf" download>
                  <i className="fas fa-file-pdf" aria-hidden="true" />
                  Download Resume
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">&copy; {year} Devajuice. All rights reserved.</span>
          <div className="footer-social">
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
      </div>
    </footer>
  );
}
