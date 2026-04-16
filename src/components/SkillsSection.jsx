import React, { useEffect, useRef, useState } from "react";

const SKILL_GROUPS = [
  {
    icon: "fab fa-python",
    title: "Programming Languages",
    skills: [
      ["fab fa-python", "Python", 85],
      ["fab fa-js", "JavaScript", 75],
      ["fab fa-html5", "HTML/CSS", 90],
      ["fas fa-database", "SQL", 70],
    ],
  },
  {
    icon: "fas fa-tools",
    title: "Frameworks & Tools",
    skills: [
      ["fab fa-react", "React", 70],
      ["fab fa-node-js", "Node.js", 60],
      ["fab fa-git-alt", "Git/GitHub", 80],
      ["fas fa-terminal", "VS Code", 95],
    ],
  },
  {
    icon: "fas fa-chart-bar",
    title: "Data Science",
    skills: [
      ["fas fa-table", "Pandas", 80],
      ["fas fa-square-root-alt", "NumPy", 75],
      ["fas fa-chart-area", "Matplotlib", 70],
      ["fas fa-brain", "Scikit-learn", 65],
    ],
  },
];

function SkillBar({ icon, name, pct, animate }) {
  const [current, setCurrent] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) return;
    setWidth(pct);
    const duration = 1100,
      start = performance.now();
    let rafId;
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * pct));
      if (progress < 1) rafId = requestAnimationFrame(update);
      else setCurrent(pct);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [animate, pct]);

  return (
    <li className="skill-bar-item">
      <div className="skill-bar-header">
        <span className="skill-bar-name">
          <i className={icon} aria-hidden="true" />
          {name}
        </span>
        <span
          className={`skill-bar-pct${animate && current === pct ? " counting-done" : ""}`}
        >
          {animate ? current : 0}%
        </span>
      </div>
      <div className="skill-bar-track">
        <div
          className="skill-bar-fill"
          style={{ width: animate ? width + "%" : "0%" }}
          data-pct={pct}
        />
      </div>
    </li>
  );
}

export default function SkillsSection({ isActive }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (isActive && !animated) {
      // Slight delay lets the section entrance transition finish first
      const timer = setTimeout(() => setAnimated(true), 50);
      return () => clearTimeout(timer);
    }
    if (!isActive) setAnimated(false);
  }, [isActive, animated]);

  return (
    <>
      <h2 id="skills-heading" className="section-title">
        <i className="fas fa-chart-line" aria-hidden="true" />
        <span>Skills &amp; Technologies</span>
      </h2>
      <div className="skills-grid">
        {SKILL_GROUPS.map((group) => (
          <div className="card" key={group.title}>
            <div className="card-icon">
              <i className={group.icon} aria-hidden="true" />
            </div>
            <div className="card-content">
              <h3>{group.title}</h3>
              <ul className="skill-bars-list">
                {group.skills.map(([icon, name, pct]) => (
                  <SkillBar
                    key={name}
                    icon={icon}
                    name={name}
                    pct={pct}
                    animate={animated}
                  />
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
