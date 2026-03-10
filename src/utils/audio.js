// ── AUDIO ENGINE ──────────────────────────────────────────────
let _audioCtx = null;

function _getCtx() {
  if (!_audioCtx)
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(() => {});
  return _audioCtx;
}

export function playSound(type) {
  const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
  if (!soundEnabled) return;
  try {
    const ctx = _getCtx();
    if (type === 'nav') {
      const osc = ctx.createOscillator(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
      filt.type = 'bandpass'; filt.frequency.value = 800; filt.Q.value = 0.5;
      osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.22);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t); osc.stop(t + 0.25);
    } else if (type === 'click') {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
      const src = ctx.createBufferSource(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
      filt.type = 'highpass'; filt.frequency.value = 2000;
      src.buffer = buf; src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      gain.gain.value = 0.15; src.start();
    } else if (type === 'success') {
      [523.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.12;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t); osc.stop(t + 0.35);
      });
    }
  } catch (e) {}
}

// ── AMBIENT MUSIC ─────────────────────────────────────────────
let bgMusicPlaying = false;
let bgSchedulerInterval = null;
let bgMaster = null, bgCompressor = null, bgConvolver = null;
let bgWetGain = null, bgDryGain = null, bgEQ = null;
let nextBeatTime = 0, currentBeat = 0;

const BPM = 72, BEAT = 60 / BPM, SCHEDULE_AHEAD = 0.2, SCHEDULER_TICK = 50;
const SONG = [
  { bass: 65.41, chord: [261.63, 329.63, 392.0, 493.88] },
  { bass: 55.0, chord: [220.0, 261.63, 329.63, 392.0, 493.88] },
  { bass: 43.65, chord: [174.61, 220.0, 261.63, 329.63] },
  { bass: 49.0, chord: [196.0, 261.63, 293.66, 349.23, 440.0] },
  { bass: 65.41, chord: [261.63, 329.63, 392.0, 493.88] },
  { bass: 36.71, chord: [146.83, 174.61, 220.0, 261.63, 311.13] },
  { bass: 41.2, chord: [164.81, 196.0, 246.94, 293.66] },
  { bass: 43.65, chord: [174.61, 220.0, 261.63, 329.63] },
];
const BEATS_PER_CHORD = 8, TOTAL_BEATS = SONG.length * BEATS_PER_CHORD;
const MELODY_CYCLES = [
  { 2: 523.25, 4: 587.33, 6: 659.25, 8: 587.33, 12: 659.25, 14: 698.46, 18: 659.25, 22: 587.33, 24: 523.25, 28: 493.88, 32: 523.25, 36: 587.33, 40: 659.25, 44: 587.33, 48: 523.25, 54: 493.88, 58: 523.25, 62: 587.33 },
  { 0: 659.25, 3: 587.33, 6: 523.25, 10: 493.88, 14: 523.25, 16: 587.33, 20: 523.25, 24: 493.88, 28: 440.0, 32: 493.88, 36: 523.25, 40: 587.33, 46: 523.25, 50: 493.88, 56: 440.0, 60: 493.88 },
  { 4: 587.33, 8: 659.25, 10: 698.46, 12: 659.25, 16: 587.33, 20: 523.25, 24: 587.33, 30: 659.25, 34: 698.46, 38: 659.25, 42: 587.33, 46: 523.25, 52: 587.33, 58: 659.25, 62: 587.33 },
  { 6: 523.25, 14: 493.88, 22: 440.0, 30: 493.88, 38: 523.25, 46: 493.88, 54: 440.0, 62: 392.0 },
];

function schedulePiano(freq, startTime, duration, vol) {
  const ctx = _getCtx();
  if (!bgDryGain || !bgConvolver) return;
  const env = ctx.createGain(), filt = ctx.createBiquadFilter();
  filt.type = 'lowpass'; filt.frequency.value = Math.min(freq * 8, 8000); filt.Q.value = 0.7;
  env.connect(filt); filt.connect(bgDryGain); filt.connect(bgConvolver);
  const f1 = ctx.createOscillator(); f1.type = 'triangle'; f1.frequency.value = freq; f1.connect(env);
  const f2 = ctx.createOscillator(), g2 = ctx.createGain();
  f2.type = 'sine'; f2.frequency.value = freq * 2; g2.gain.value = 0.15; f2.connect(g2); g2.connect(env);
  const atk = 0.006, dec = 0.12, sus = vol * 0.4, rel = Math.min(duration * 0.3, 0.4);
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(vol, startTime + atk);
  env.gain.exponentialRampToValueAtTime(sus, startTime + atk + dec);
  env.gain.setValueAtTime(sus, startTime + duration - rel);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  const end = startTime + duration + 0.05;
  f1.start(startTime); f1.stop(end); f2.start(startTime); f2.stop(end);
}

function scheduleBass(freq, startTime, duration, vol) {
  const ctx = _getCtx();
  if (!bgDryGain) return;
  const env = ctx.createGain(), filt = ctx.createBiquadFilter();
  filt.type = 'lowpass'; filt.frequency.value = 320; filt.Q.value = 0.5;
  env.connect(filt); filt.connect(bgDryGain);
  const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq; osc.connect(env);
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(vol, startTime + 0.04);
  env.gain.exponentialRampToValueAtTime(vol * 0.5, startTime + 0.2);
  env.gain.setValueAtTime(vol * 0.5, startTime + duration - 0.12);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.start(startTime); osc.stop(startTime + duration + 0.05);
}

function scheduleHihat(startTime, vol) {
  const ctx = _getCtx();
  if (!bgDryGain) return;
  const bufLen = Math.floor(ctx.sampleRate * 0.05);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++)
    d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
  const src = ctx.createBufferSource(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
  filt.type = 'highpass'; filt.frequency.value = 8000;
  src.buffer = buf; src.connect(filt); filt.connect(gain); gain.connect(bgDryGain);
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.05);
  src.start(startTime);
}

function buildSharedGraph() {
  const ctx = _getCtx();
  bgMaster = ctx.createGain();
  bgMaster.gain.setValueAtTime(0, ctx.currentTime);
  bgMaster.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 4);
  bgCompressor = ctx.createDynamicsCompressor();
  bgCompressor.threshold.value = -20; bgCompressor.knee.value = 10;
  bgCompressor.ratio.value = 4; bgCompressor.attack.value = 0.05; bgCompressor.release.value = 0.3;
  bgEQ = ctx.createBiquadFilter(); bgEQ.type = 'lowpass'; bgEQ.frequency.value = 4000; bgEQ.Q.value = 0.5;
  const revLen = ctx.sampleRate * 3.5;
  const revBuf = ctx.createBuffer(2, revLen, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = revBuf.getChannelData(ch);
    const preDelay = Math.floor(ctx.sampleRate * 0.025);
    for (let i = preDelay; i < revLen; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i - preDelay) / (revLen - preDelay), 2.2);
  }
  bgConvolver = ctx.createConvolver(); bgConvolver.buffer = revBuf;
  bgWetGain = ctx.createGain(); bgWetGain.gain.value = 0.38;
  bgDryGain = ctx.createGain(); bgDryGain.gain.value = 0.62;
  bgDryGain.connect(bgEQ); bgConvolver.connect(bgWetGain); bgWetGain.connect(bgEQ);
  bgEQ.connect(bgCompressor); bgCompressor.connect(bgMaster); bgMaster.connect(ctx.destination);
}

function teardownSharedGraph() {
  if (!bgMaster) return;
  const ctx = _getCtx();
  bgMaster.gain.setValueAtTime(bgMaster.gain.value, ctx.currentTime);
  bgMaster.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  setTimeout(() => {
    [bgMaster, bgCompressor, bgEQ, bgWetGain, bgDryGain, bgConvolver].forEach(n => { try { n.disconnect(); } catch (e) {} });
    bgMaster = bgCompressor = bgEQ = bgWetGain = bgDryGain = bgConvolver = null;
  }, 1600);
}

function schedulerTick() {
  if (!bgMusicPlaying || !bgMaster) return;
  const ctx = _getCtx();
  const BAR = BEAT * 4;
  while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD) {
    const beat = currentBeat % TOTAL_BEATS;
    const chordIndex = Math.floor(beat / BEATS_PER_CHORD);
    const beatInChord = beat % BEATS_PER_CHORD;
    const chord = SONG[chordIndex];
    const t = nextBeatTime;
    if (beatInChord === 0) chord.chord.forEach((freq, i) => schedulePiano(freq, t + i * 0.035, BAR * 2 - 0.15, 0.08));
    if (beatInChord === 0) scheduleBass(chord.bass, t, BEAT * 3.5, 0.22);
    else if (beatInChord === 4) scheduleBass(chord.bass * 1.5, t, BEAT * 3.2, 0.14);
    scheduleHihat(t, beatInChord % 2 === 0 ? 0.02 : 0.01);
    const cycleIndex = Math.floor(currentBeat / TOTAL_BEATS) % MELODY_CYCLES.length;
    if (MELODY_CYCLES[cycleIndex][beat] !== undefined)
      schedulePiano(MELODY_CYCLES[cycleIndex][beat], t, BEAT * 1.8, 0.1);
    nextBeatTime += BEAT;
    currentBeat++;
  }
}

export function startBgMusic() {
  if (bgMusicPlaying) return;
  bgMusicPlaying = true;
  buildSharedGraph();
  nextBeatTime = _getCtx().currentTime + 0.3;
  currentBeat = 0;
  bgSchedulerInterval = setInterval(schedulerTick, SCHEDULER_TICK);
}

export function stopBgMusic() {
  if (!bgMusicPlaying) return;
  bgMusicPlaying = false;
  clearInterval(bgSchedulerInterval);
  bgSchedulerInterval = null;
  teardownSharedGraph();
}

export function getAudioCtx() { return _getCtx(); }
export function isBgMusicPlaying() { return bgMusicPlaying; }
