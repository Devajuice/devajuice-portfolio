import React, { useState, useRef, useEffect } from "react";
// Fix #10: removed duplicate import of saveThemePreference — consolidated here
import { triggerInkBlot, saveThemePreference } from "../utils/theme";
import { playSound } from "../utils/audio";

const SECTIONS = ["home", "about", "projects", "skills", "hobbies", "contact"];
const SECTION_LABELS = {
  home: "Home",
  about: "About",
  projects: "Projects",
  skills: "Skills",
  hobbies: "Hobbies",
  contact: "Contact",
};
const SECTION_ICONS = {
  home: "fa-house",
  about: "fa-user",
  projects: "fa-folder-open",
  skills: "fa-code",
  hobbies: "fa-gamepad",
  contact: "fa-paper-plane",
};

export default function Navigation({
  activeSection,
  onNavigate,
  theme,
  onThemeChange,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navLinksRef = useRef(null);
  const btnRefs = useRef({});
  const themeRef = useRef(null);

  useEffect(() => {
    const btn = btnRefs.current[activeSection];
    const navList = navLinksRef.current;
    if (!btn || !navList) return;
    const listRect = navList.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    // Position as a slim underline below the active button
    setIndicatorStyle({
      width: btnRect.width - 16, // slightly inset for elegance
      left: btnRect.left - listRect.left + 8,
      opacity: 1,
    });
  }, [activeSection]);

  const handleThemeToggle = () => {
    if (themeRef.current?.classList.contains("spinning")) return;
    const nextTheme = theme === "light" ? "dark" : "light";
    themeRef.current?.classList.add("spinning");
    triggerInkBlot(nextTheme, (t) => {
      onThemeChange(t);
      saveThemePreference(t);
      playSound("click");
    });
  };

  const handleNav = (section) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  return (
    <header
      className="topnav-wrapper"
      role="navigation"
      aria-label="Main navigation"
    >
      <nav className="topnav-pill">
        {/* Fix #8: use <button> instead of <div role="button"> — natively focusable,
            fires on Enter/Space without manual onKeyPress handler */}
        <button
          className="logo"
          aria-label="Go to home page"
          onClick={() => handleNav("home")}
        >
          <i className="fas fa-code" aria-hidden="true" />
          <span>Devajith</span>
        </button>

        <ul className="nav-links" ref={navLinksRef}>
          <span
            className="nav-indicator"
            aria-hidden="true"
            style={indicatorStyle}
          />
          {SECTIONS.map((s) => (
            <li key={s}>
              <button
                ref={(el) => (btnRefs.current[s] = el)}
                id={`nav-${s}`}
                className={`nav-btn${activeSection === s ? " active" : ""}`}
                onClick={() => handleNav(s)}
                aria-current={activeSection === s ? "page" : undefined}
              >
                <span>{SECTION_LABELS[s]}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="topnav-actions">
          <button
            ref={themeRef}
            id="themeToggle"
            className="theme-toggle-btn"
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            onAnimationEnd={() =>
              themeRef.current?.classList.remove("spinning")
            }
            onClick={handleThemeToggle}
          >
            <i
              className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`}
              aria-hidden="true"
            />
          </button>
          <button
            className={`mobile-menu-btn${mobileOpen ? " is-open" : ""}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            id="mobileMenuBtn"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Fix: aria-hidden when closed so screen readers skip the hidden menu,
          and its buttons don't appear in the focus order when visually gone */}
      <div
        id="mobileDropdown"
        className={`mobile-dropdown${mobileOpen ? " open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div className="mobile-nav-header">
          <span className="mobile-nav-label">Navigation</span>
          <span className="mobile-nav-active-label">
            {SECTION_LABELS[activeSection]}
          </span>
        </div>
        <ul className="mobile-nav-links">
          {SECTIONS.map((s) => (
            <li key={s}>
              <button
                className={`mobile-nav-btn${activeSection === s ? " active" : ""}`}
                onClick={() => handleNav(s)}
                tabIndex={mobileOpen ? 0 : -1}
              >
                <i className={`fas ${SECTION_ICONS[s]}`} aria-hidden="true" />
                <span>{SECTION_LABELS[s]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
