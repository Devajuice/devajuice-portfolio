import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Shuffle, RefreshCw } from 'lucide-react';
import { motionTransitions } from '../../lib/motion-tokens';

/**
 * Small deterministic-free toys. Everything is local and offline — no API, no
 * state that outlives the tab.
 */

const RANDOM_APOLOGIES = [
  'Build the side project.',
  'Take the afternoon off.',
  'Ship it, then sleep.',
  'Rewrite the thing nobody asked you to rewrite.',
  'Learn the boring skill.',
  'Ask them. Just ask.',
  'Delete it.',
];

const PROJECT_IDEAS = [
  'A keyboard-driven file manager',
  'A diff viewer that explains itself',
  'A pomodoro timer with an unfair dice mode',
  'A CLI that turns a screenshot into a bug report',
  'A tiny static-site search index',
  'A rate limiter visualiser',
  'A colour-palette linter for CSS',
];

function ToyCard({ icon, title, children, action }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-subtle">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-hover text-text-primary">
          <i className={`fas ${icon} text-xs`} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
      {action}
    </div>
  );
}

function DiceRoller() {
  // `rollId` exists so a re-roll of the same face still remounts the die and
  // replays the animation. Keying on the face value alone would not.
  const [{ faces, rollId }, setRoll] = useState(() => ({ faces: [3, 5], rollId: 0 }));

  const roll = (count) =>
    setRoll((prev) => ({
      faces: Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6)),
      rollId: prev.rollId + 1,
    }));

  return (
    <ToyCard
      icon="fa-dice"
      title="Dice"
      action={
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => roll(n)}
              className="focus-ring h-8 min-w-9 cursor-pointer rounded border border-border font-mono text-[11px] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              {n}d6
            </button>
          ))}
        </div>
      }
    >
      <div className="flex min-h-14 flex-wrap items-center gap-2">
        {faces.map((face, index) => (
          <motion.span
            key={`${rollId}-${index}`}
            initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ ...motionTransitions.springSnappy, delay: index * 0.04 }}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface-hover font-mono text-lg font-semibold text-text-primary tabular-nums"
          >
            {face}
          </motion.span>
        ))}
      </div>
    </ToyCard>
  );
}

function CoinFlip() {
  const [result, setResult] = useState(null);
  const [flipping, setFlipping] = useState(false);

  // A timeout rather than a duration-based CSS animation: it keeps the flip in
  // step with the result so the face can never disagree with the label.
  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    setResult(Math.random() < 0.5 ? 'heads' : 'tails');
    setTimeout(() => setFlipping(false), 420);
  };

  return (
    <ToyCard
      icon="fa-coins"
      title="Coin flip"
      action={
        <button
          onClick={flip}
          disabled={flipping}
          className="focus-ring mt-4 flex h-9 cursor-pointer items-center gap-2 self-start rounded-md bg-text-primary px-3.5 font-sans text-xs font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Coins className="h-3.5 w-3.5" aria-hidden="true" />
          Flip
        </button>
      }
    >
      {/* role=status so screen readers announce the result rather than the flip */}
      <div role="status" aria-live="polite" className="flex min-h-14 items-center">
        {result ? (
          <motion.div
            key={result}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={motionTransitions.springGentle}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-hover font-mono text-[10px] font-semibold tracking-[0.08em] text-text-primary uppercase"
          >
            {result}
          </motion.div>
        ) : (
          <span className="font-mono text-[10px] tracking-[0.12em] text-text-subtle">
            NO RESULT YET
          </span>
        )}
      </div>
    </ToyCard>
  );
}

function IdeaPicker() {
  const [idea, setIdea] = useState(null);

  const pick = () => {
    // Guard against the (rare) case where the only idea left is the one showing.
    let next = PROJECT_IDEAS[Math.floor(Math.random() * PROJECT_IDEAS.length)];
    if (next === idea) next = PROJECT_IDEAS[(PROJECT_IDEAS.indexOf(next) + 1) % PROJECT_IDEAS.length];
    setIdea(next);
  };

  return (
    <ToyCard
      icon="fa-lightbulb"
      title="Weekend project"
      action={
        <button
          onClick={pick}
          className="focus-ring mt-4 flex h-9 cursor-pointer items-center gap-2 self-start rounded-md bg-text-primary px-3.5 font-sans text-xs font-medium text-bg transition-opacity hover:opacity-90"
        >
          <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
          Pick one
        </button>
      }
    >
      <p role="status" aria-live="polite" className="min-h-10 text-sm leading-relaxed text-text-secondary">
        {idea ?? 'Seven ideas, no good ones.'}
      </p>
    </ToyCard>
  );
}

function DecisionMaker() {
  const [question, setQuestion] = useState('');
  const [verdict, setVerdict] = useState(null);

  const ask = () => {
    if (!question.trim()) return;
    setVerdict(Math.random() < 0.5 ? 'Yes. Do it.' : "No. And that's fine.");
  };

  return (
    <ToyCard
      icon="fa-scale-balanced"
      title="Decision maker"
      action={
        <button
          onClick={ask}
          disabled={!question.trim()}
          className="focus-ring mt-4 flex h-9 cursor-pointer items-center gap-2 self-start rounded-md bg-text-primary px-3.5 font-sans text-xs font-medium text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Ask
        </button>
      }
    >
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ask()}
        placeholder="Should I refactor this?"
        aria-label="Question to ask"
        maxLength={80}
        className="focus-ring w-full rounded-md border border-border bg-surface-raised px-3 py-2 font-sans text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle focus-visible:border-border-hover"
      />
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-text-secondary">
        {verdict ?? RANDOM_APOLOGIES[0]}
      </p>
    </ToyCard>
  );
}

export default function RandomToys() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DiceRoller />
      <CoinFlip />
      <IdeaPicker />
      <DecisionMaker />
    </div>
  );
}