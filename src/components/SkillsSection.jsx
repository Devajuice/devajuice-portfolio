import { useEffect, useState } from 'react';
import {
  motion,
  useSpring,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from 'framer-motion';
import SpotlightCard from './ui/SpotlightCard';
import { motionTransitions } from '../lib/motion-tokens';

const SKILL_GROUPS = [
  {
    icon: 'fab fa-python',
    title: 'Programming Languages',
    skills: [
      ['fab fa-python', 'Python', 85],
      ['fab fa-js', 'JavaScript', 75],
      ['fab fa-html5', 'HTML/CSS', 90],
      ['fas fa-database', 'SQL', 70],
    ],
  },
  {
    icon: 'fas fa-tools',
    title: 'Frameworks & Tools',
    skills: [
      ['fab fa-react', 'React', 70],
      ['fab fa-node-js', 'Node.js', 60],
      ['fab fa-git-alt', 'Git/GitHub', 80],
      ['fas fa-terminal', 'VS Code', 95],
    ],
  },
  {
    icon: 'fas fa-chart-bar',
    title: 'Data Science',
    skills: [
      ['fas fa-table', 'Pandas', 80],
      ['fas fa-square-root-alt', 'NumPy', 75],
      ['fas fa-chart-area', 'Matplotlib', 70],
      ['fas fa-brain', 'Scikit-learn', 65],
    ],
  },
];

function SkillBar({ icon, name, pct, animate }) {
  const reducedMotion = useReducedMotion();

  // Spring-driven bar width — 0 → pct with EasyUI's spring physics
  const spring = useSpring(0, {
    stiffness: 120,
    damping: 20,
    mass: 0.9,
  });

  // Spring-driven counter so the number tracks the bar instead of racing it
  const counter = useSpring(0, { stiffness: 120, damping: 24, mass: 0.9 });
  const rounded = useTransform(counter, (v) => Math.round(v));

  // A MotionValue cannot be rendered directly as a React child — React throws
  // "Objects are not valid as a React child". Mirror it into state instead,
  // starting at 0 so activating the section counts up from zero.
  const [shown, setShown] = useState(0);
  useMotionValueEvent(rounded, 'change', setShown);

  // Convert the spring MotionValue into a percentage string for the bar width
  const widthPct = useTransform(spring, (v) => `${v}%`);

  useEffect(() => {
    // No setShown() here: counter.set() fires the `change` event that
    // useMotionValueEvent listens to, so `shown` follows the spring on its own.
    if (!animate) {
      spring.set(0);
      counter.set(0);
      return;
    }
    spring.set(pct);
    counter.set(pct);
  }, [animate, pct, spring, counter]);

  return (
    <li>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-text-primary">
          <i className={icon} aria-hidden="true" />
          {name}
        </span>
        <motion.span className="font-mono text-xs text-text-muted tabular-nums">
          {animate && !reducedMotion ? shown : pct}%
        </motion.span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised"
        role="progressbar"
        aria-label={`${name} proficiency`}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-text-primary"
          style={{ width: reducedMotion ? `${animate ? pct : 0}%` : widthPct }}
          transition={motionTransitions.springSmooth}
        />
      </div>
    </li>
  );
}

/**
 * Returns `flag`, which becomes true `delay`ms after `active` flips true and
 * false again once `active` goes false. State updates happen inside the timer
 * callback so the effect body never triggers a cascading render.
 */
function useDelayedFlag(active, delay) {
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFlag(Boolean(active)), active ? delay : 0);
    return () => clearTimeout(timer);
  }, [active, delay]);

  return flag;
}

export default function SkillsSection({ isActive }) {
  const animated = useDelayedFlag(isActive, 120);

  return (
    <>
      <h2 id="skills-heading" className="section-heading">
        <i className="fas fa-chart-line" aria-hidden="true" />
        <span>Skills &amp; Technologies</span>
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SKILL_GROUPS.map((group) => (
          <SpotlightCard key={group.title} className="flex h-full flex-col">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-hover text-text-primary">
              <i className={`${group.icon} text-base`} aria-hidden="true" />
            </div>
            <h3 className="mb-4 text-base font-semibold text-text-primary">{group.title}</h3>
            <ul className="flex flex-col gap-4">
              {group.skills.map(([icon, name, pct]) => (
                <SkillBar key={name} icon={icon} name={name} pct={pct} animate={animated} />
              ))}
            </ul>
          </SpotlightCard>
        ))}
      </div>
    </>
  );
}
