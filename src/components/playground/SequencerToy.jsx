import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';
import { getAudioCtx } from '../../utils/audio';

/**
 * Eight-step Web Audio sequencer.
 *
 * Shares the module-level AudioContext from utils/audio.js rather than opening
 * its own — browsers cap concurrent contexts, and one context means the ambient
 * music and this toy share a single resume-on-gesture path.
 *
 * Scheduling is the standard lookahead pattern: a coarse timer wakes up every
 * 25ms and schedules any note falling inside the next 100ms against
 * `ctx.currentTime`. Tying notes to the audio clock instead of to the timer is
 * what keeps the rhythm from jittering when a tick lands late.
 */

const STEPS = 16;
const ROWS = [
  { id: 'kick', label: 'Kick', type: 'sine', freq: 150, drop: 48, decay: 0.32, gain: 0.9 },
  { id: 'hat', label: 'Hat', type: 'noise', freq: 9000, drop: 0, decay: 0.05, gain: 0.22 },
  { id: 'clap', label: 'Clap', type: 'noise', freq: 1600, drop: 0, decay: 0.16, gain: 0.34 },
  { id: 'bass', label: 'Bass', type: 'sawtooth', freq: 110, drop: 0, decay: 0.24, gain: 0.3 },
];

const TEMPOS = [90, 110, 128];

// A four-on-the-floor baseline so a fresh pattern already sounds intentional.
const DEFAULT_PATTERN = ROWS.map((row, rowIndex) =>
  Array.from({ length: STEPS }, (_, step) => {
    if (rowIndex === 0) return step % 4 === 0;
    if (rowIndex === 1) return step % 2 === 0;
    if (rowIndex === 2) return step % 8 === 4;
    return step % 4 === 0;
  })
);

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.1;

// One shared noise buffer, rebuilt only if the sample rate changes.
let noiseBuffer = null;
function getNoiseBuffer(ctx) {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function trigger(ctx, row, time) {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  const level = row.gain * 0.5;
  // Percussive rows need a fast decay; the exponential floor is what makes the
  // tail inaudible instead of clicking at the zero crossing.
  gain.gain.setValueAtTime(level, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + row.decay);

  if (row.type === 'noise') {
    const src = ctx.createBufferSource();
    src.buffer = getNoiseBuffer(ctx);
    const filt = ctx.createBiquadFilter();
    filt.type = row.freq >= 8000 ? 'highpass' : 'bandpass';
    filt.frequency.value = row.freq;
    if (row.freq < 8000) filt.Q.value = 1.1;
    src.connect(filt);
    filt.connect(gain);
    src.start(time);
    src.stop(time + row.decay + 0.02);
    return;
  }

  const osc = ctx.createOscillator();
  osc.type = row.type;
  // Pitch drop only applies where it makes musical sense — a sawtooth bass
  // sweeping upward on every hit sounds broken, not percussive.
  if (row.drop) {
    osc.frequency.setValueAtTime(row.freq, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(row.freq - row.drop, 20), time + row.decay);
  } else {
    osc.frequency.value = row.freq;
  }
  osc.connect(gain);
  osc.start(time);
  osc.stop(time + row.decay + 0.02);
}

export default function SequencerToy() {
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [bpm, setBpm] = useState(110);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(-1);

  // The scheduler closure needs the current pattern and tempo without being
  // torn down and rebuilt on every edit, so they live in refs.
  const patternRef = useRef(pattern);
  const bpmRef = useRef(bpm);
  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // The playhead is only for the UI, so a rAF reads it off the scheduler's step
  // counter rather than the timer interval pushing state every 25ms.
  useEffect(() => {
    if (!playing) return;
    let frame;
    const tick = () => {
      setPlayhead(currentStepRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;

    let timer;
    const ctx = getAudioCtx();
    // Start a hair in the future so the first note isn't late.
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    currentStepRef.current = 0;

    const scheduler = () => {
      const stepDur = 60 / bpmRef.current / 4;
      while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD) {
        const step = currentStepRef.current;
        ROWS.forEach((row, rowIndex) => {
          if (patternRef.current[rowIndex]?.[step]) trigger(ctx, row, nextNoteTimeRef.current);
        });
        nextNoteTimeRef.current += stepDur;
        currentStepRef.current = (step + 1) % STEPS;
      }
      timer = setTimeout(scheduler, LOOKAHEAD_MS);
    };
    scheduler();

    return () => clearTimeout(timer);
  }, [playing]);

  const toggleStep = useCallback((rowIndex, step) => {
    setPattern((prev) => {
      const next = prev.map((row) => [...row]);
      next[rowIndex][step] = !next[rowIndex][step];
      return next;
    });
  }, []);

  const clearAll = () => setPattern(ROWS.map(() => Array(STEPS).fill(false)));
  const randomize = () =>
    setPattern(
      ROWS.map((row, rowIndex) =>
        Array.from({ length: STEPS }, (_, step) => {
          // Row 0 is the backbone and stays mostly steady; upper rows are sparse
          // so a random pattern reads as musical rather than as static.
          if (rowIndex === 0) return step % 4 === 0 || Math.random() < 0.12;
          return Math.random() < (rowIndex === 3 ? 0.3 : 0.18);
        })
      )
    );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setPlaying((p) => !p);
            // Clear the playhead here rather than in an effect: on stop there is
            // no new value for it to pick up, so it has to be reset explicitly.
            setPlayhead(-1);
          }}
          aria-pressed={playing}
          className={cn(
            'focus-ring flex h-9 cursor-pointer items-center gap-2 rounded-md px-3.5 font-sans text-xs font-medium transition-colors',
            playing
              ? 'bg-text-primary text-bg hover:opacity-90'
              : 'border border-border bg-surface text-text-primary hover:bg-surface-hover'
          )}
        >
          {playing ? <Square className="h-3 w-3" aria-hidden="true" /> : <Play className="h-3 w-3" aria-hidden="true" />}
          {playing ? 'Stop' : 'Play'}
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="seq-tempo" className="font-mono text-[10px] tracking-[0.12em] text-text-muted">
            BPM
          </label>
          <div className="flex gap-1">
            {TEMPOS.map((t) => (
              <button
                key={t}
                onClick={() => setBpm(t)}
                aria-pressed={bpm === t}
                className={cn(
                  'focus-ring h-7 min-w-9 cursor-pointer rounded border px-2 font-mono text-[11px] tabular-nums transition-colors',
                  bpm === t
                    ? 'border-border-hover bg-surface-hover text-text-primary'
                    : 'border-border text-text-muted hover:text-text-primary'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex gap-1.5">
          <button
            onClick={randomize}
            className="focus-ring flex h-8 cursor-pointer items-center gap-1.5 rounded border border-border px-2.5 font-sans text-[11px] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Randomize
          </button>
          <button
            onClick={clearAll}
            className="focus-ring h-8 cursor-pointer rounded border border-border px-2.5 font-sans text-[11px] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-max">
          <div className="mb-1.5 flex gap-1 pl-14">
            {Array.from({ length: STEPS }, (_, step) => (
              <span
                key={step}
                className={cn(
                  'w-5 text-center font-mono text-[9px] tabular-nums',
                  playhead === step ? 'text-text-primary' : 'text-text-subtle'
                )}
              >
                {step % 4 === 0 ? step + 1 : '·'}
              </span>
            ))}
          </div>

          {ROWS.map((row, rowIndex) => (
            <div key={row.id} className="mb-1 flex items-center gap-1">
              <span className="w-14 shrink-0 pr-1 text-right font-mono text-[10px] tracking-[0.1em] text-text-muted">
                {row.label}
              </span>
              {Array.from({ length: STEPS }, (_, step) => {
                const active = pattern[rowIndex][step];
                return (
                  <motion.button
                    key={step}
                    onClick={() => toggleStep(rowIndex, step)}
                    whileTap={{ scale: 0.88 }}
                    transition={motionTransitions.springSnappy}
                    aria-pressed={active}
                    aria-label={`${row.label} step ${step + 1}`}
                    className={cn(
                      'focus-ring h-6 w-5 cursor-pointer rounded-sm border transition-colors',
                      active
                        ? 'border-border-hover bg-text-primary'
                        : 'border-border bg-surface hover:bg-surface-hover'
                    )}
                    style={
                      playhead === step
                        ? { boxShadow: '0 0 0 1px var(--color-text-primary)' }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}