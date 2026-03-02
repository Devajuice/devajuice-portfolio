// ════════════════════════════════════════════════════════════════
// ✦ AUDIO ENGINE
// ════════════════════════════════════════════════════════════════
let soundEnabled = localStorage.getItem("soundEnabled") === "true";
let _audioCtx = null;

function _getCtx() {
  if (!_audioCtx)
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === "suspended") _audioCtx.resume().catch(() => {});
  return _audioCtx;
}

function _updateSoundBtn() {
  const btn = document.getElementById("soundToggle");
  if (!btn) return;
  const icon = btn.querySelector("i");
  if (soundEnabled) {
    icon.className = "fas fa-volume-high";
    btn.setAttribute("aria-label", "Mute transition sounds");
    btn.classList.remove("muted");
  } else {
    icon.className = "fas fa-volume-xmark";
    btn.setAttribute("aria-label", "Unmute transition sounds");
    btn.classList.add("muted");
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = _getCtx();
    if (type === "nav") {
      const osc = ctx.createOscillator(),
        gain = ctx.createGain(),
        filt = ctx.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.value = 800;
      filt.Q.value = 0.5;
      osc.connect(filt);
      filt.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.22);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    } else if (type === "click") {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] =
          (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
      const src = ctx.createBufferSource(),
        gain = ctx.createGain(),
        filt = ctx.createBiquadFilter();
      filt.type = "highpass";
      filt.frequency.value = 2000;
      src.buffer = buf;
      src.connect(filt);
      filt.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.15;
      src.start();
    } else if (type === "success") {
      [523.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator(),
          gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        const t = ctx.currentTime + i * 0.12;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    }
  } catch (e) {}
}

// ════════════════════════════════════════════════════════════════
// ✦ AMBIENT MUSIC — Look-ahead scheduler
// ════════════════════════════════════════════════════════════════
let bgMusicPlaying = false;
let bgSchedulerInterval = null;
let bgMaster = null,
  bgCompressor = null,
  bgConvolver = null;
let bgWetGain = null,
  bgDryGain = null,
  bgEQ = null;
let nextBeatTime = 0,
  currentBeat = 0;

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const SCHEDULE_AHEAD = 0.2;
const SCHEDULER_TICK = 50;

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
const BEATS_PER_CHORD = 8;
const TOTAL_BEATS = SONG.length * BEATS_PER_CHORD;

const MELODY_CYCLES = [
  {
    2: 523.25,
    4: 587.33,
    6: 659.25,
    8: 587.33,
    12: 659.25,
    14: 698.46,
    18: 659.25,
    22: 587.33,
    24: 523.25,
    28: 493.88,
    32: 523.25,
    36: 587.33,
    40: 659.25,
    44: 587.33,
    48: 523.25,
    54: 493.88,
    58: 523.25,
    62: 587.33,
  },
  {
    0: 659.25,
    3: 587.33,
    6: 523.25,
    10: 493.88,
    14: 523.25,
    16: 587.33,
    20: 523.25,
    24: 493.88,
    28: 440.0,
    32: 493.88,
    36: 523.25,
    40: 587.33,
    46: 523.25,
    50: 493.88,
    56: 440.0,
    60: 493.88,
  },
  {
    4: 587.33,
    8: 659.25,
    10: 698.46,
    12: 659.25,
    16: 587.33,
    20: 523.25,
    24: 587.33,
    30: 659.25,
    34: 698.46,
    38: 659.25,
    42: 587.33,
    46: 523.25,
    52: 587.33,
    58: 659.25,
    62: 587.33,
  },
  {
    6: 523.25,
    14: 493.88,
    22: 440.0,
    30: 493.88,
    38: 523.25,
    46: 493.88,
    54: 440.0,
    62: 392.0,
  },
];

function buildSharedGraph() {
  const ctx = _getCtx();
  bgMaster = ctx.createGain();
  bgMaster.gain.setValueAtTime(0, ctx.currentTime);
  bgMaster.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 4);
  bgCompressor = ctx.createDynamicsCompressor();
  bgCompressor.threshold.value = -20;
  bgCompressor.knee.value = 10;
  bgCompressor.ratio.value = 4;
  bgCompressor.attack.value = 0.05;
  bgCompressor.release.value = 0.3;
  bgEQ = ctx.createBiquadFilter();
  bgEQ.type = "lowpass";
  bgEQ.frequency.value = 4000;
  bgEQ.Q.value = 0.5;
  const revLen = ctx.sampleRate * 3.5;
  const revBuf = ctx.createBuffer(2, revLen, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = revBuf.getChannelData(ch);
    const preDelay = Math.floor(ctx.sampleRate * 0.025);
    for (let i = preDelay; i < revLen; i++)
      d[i] =
        (Math.random() * 2 - 1) *
        Math.pow(1 - (i - preDelay) / (revLen - preDelay), 2.2);
  }
  bgConvolver = ctx.createConvolver();
  bgConvolver.buffer = revBuf;
  bgWetGain = ctx.createGain();
  bgWetGain.gain.value = 0.38;
  bgDryGain = ctx.createGain();
  bgDryGain.gain.value = 0.62;
  bgDryGain.connect(bgEQ);
  bgConvolver.connect(bgWetGain);
  bgWetGain.connect(bgEQ);
  bgEQ.connect(bgCompressor);
  bgCompressor.connect(bgMaster);
  bgMaster.connect(ctx.destination);
}

function teardownSharedGraph() {
  if (!bgMaster) return;
  const ctx = _getCtx();
  bgMaster.gain.setValueAtTime(bgMaster.gain.value, ctx.currentTime);
  bgMaster.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  setTimeout(() => {
    [bgMaster, bgCompressor, bgEQ, bgWetGain, bgDryGain, bgConvolver].forEach(
      (n) => {
        try {
          n.disconnect();
        } catch (e) {}
      },
    );
    bgMaster = bgCompressor = bgEQ = bgWetGain = bgDryGain = bgConvolver = null;
  }, 1600);
}

function schedulePiano(freq, startTime, duration, vol) {
  const ctx = _getCtx();
  if (!bgDryGain || !bgConvolver) return;
  const env = ctx.createGain(),
    filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = Math.min(freq * 8, 8000);
  filt.Q.value = 0.7;
  env.connect(filt);
  filt.connect(bgDryGain);
  filt.connect(bgConvolver);
  const f1 = ctx.createOscillator();
  f1.type = "triangle";
  f1.frequency.value = freq;
  f1.connect(env);
  const f2 = ctx.createOscillator(),
    g2 = ctx.createGain();
  f2.type = "sine";
  f2.frequency.value = freq * 2;
  g2.gain.value = 0.15;
  f2.connect(g2);
  g2.connect(env);
  const atk = 0.006,
    dec = 0.12,
    sus = vol * 0.4,
    rel = Math.min(duration * 0.3, 0.4);
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(vol, startTime + atk);
  env.gain.exponentialRampToValueAtTime(sus, startTime + atk + dec);
  env.gain.setValueAtTime(sus, startTime + duration - rel);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  const end = startTime + duration + 0.05;
  f1.start(startTime);
  f1.stop(end);
  f2.start(startTime);
  f2.stop(end);
}

function scheduleBass(freq, startTime, duration, vol) {
  const ctx = _getCtx();
  if (!bgDryGain) return;
  const env = ctx.createGain(),
    filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 320;
  filt.Q.value = 0.5;
  env.connect(filt);
  filt.connect(bgDryGain);
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  osc.connect(env);
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(vol, startTime + 0.04);
  env.gain.exponentialRampToValueAtTime(vol * 0.5, startTime + 0.2);
  env.gain.setValueAtTime(vol * 0.5, startTime + duration - 0.12);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function scheduleHihat(startTime, vol) {
  const ctx = _getCtx();
  if (!bgDryGain) return;
  const bufLen = Math.floor(ctx.sampleRate * 0.05);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++)
    d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
  const src = ctx.createBufferSource(),
    gain = ctx.createGain(),
    filt = ctx.createBiquadFilter();
  filt.type = "highpass";
  filt.frequency.value = 8000;
  src.buffer = buf;
  src.connect(filt);
  filt.connect(gain);
  gain.connect(bgDryGain);
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.05);
  src.start(startTime);
}

function schedulerTick() {
  if (!bgMusicPlaying || !bgMaster) return;
  const ctx = _getCtx();
  while (nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD) {
    const beat = currentBeat % TOTAL_BEATS;
    const chordIndex = Math.floor(beat / BEATS_PER_CHORD);
    const beatInChord = beat % BEATS_PER_CHORD;
    const chord = SONG[chordIndex];
    const t = nextBeatTime;
    if (beatInChord === 0)
      chord.chord.forEach((freq, i) =>
        schedulePiano(freq, t + i * 0.035, BAR * 2 - 0.15, 0.08),
      );
    if (beatInChord === 0) scheduleBass(chord.bass, t, BEAT * 3.5, 0.22);
    else if (beatInChord === 4)
      scheduleBass(chord.bass * 1.5, t, BEAT * 3.2, 0.14);
    scheduleHihat(t, beatInChord % 2 === 0 ? 0.02 : 0.01);
    const cycleIndex =
      Math.floor(currentBeat / TOTAL_BEATS) % MELODY_CYCLES.length;
    if (MELODY_CYCLES[cycleIndex][beat] !== undefined)
      schedulePiano(MELODY_CYCLES[cycleIndex][beat], t, BEAT * 1.8, 0.1);
    nextBeatTime += BEAT;
    currentBeat++;
  }
}

function startBgMusic() {
  if (bgMusicPlaying) return;
  bgMusicPlaying = true;
  buildSharedGraph();
  nextBeatTime = _getCtx().currentTime + 0.3;
  currentBeat = 0;
  bgSchedulerInterval = setInterval(schedulerTick, SCHEDULER_TICK);
}

function stopBgMusic() {
  if (!bgMusicPlaying) return;
  bgMusicPlaying = false;
  clearInterval(bgSchedulerInterval);
  bgSchedulerInterval = null;
  teardownSharedGraph();
}

// ════════════════════════════════════════════════════════════════
// ✦ FIRST-INTERACTION — lazy-start music
// ════════════════════════════════════════════════════════════════
let _musicStarted = false;
function _handleFirstInteraction() {
  if (_musicStarted) return;
  _musicStarted = true;
  if (_audioCtx && _audioCtx.state === "suspended") {
    _audioCtx
      .resume()
      .then(() => {
        if (soundEnabled) startBgMusic();
      })
      .catch(() => {});
  } else if (soundEnabled) {
    startBgMusic();
  }
}
["click", "keydown", "touchstart", "pointerdown"].forEach((evt) =>
  document.addEventListener(evt, _handleFirstInteraction, {
    passive: true,
    once: true,
  }),
);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (bgMusicPlaying) stopBgMusic();
  } else {
    if (soundEnabled && _musicStarted && !bgMusicPlaying) startBgMusic();
  }
});

// ════════════════════════════════════════════════════════════════
// ✦ PAGE LOAD SPLASH
// ════════════════════════════════════════════════════════════════
window.addEventListener("load", () => {
  const splash = document.getElementById("pageSplash");
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add("splash-out");
    splash.addEventListener("transitionend", () => splash.remove(), {
      once: true,
    });
  }, 700);
});

// ════════════════════════════════════════════════════════════════
// ✦ TOAST SYSTEM
// ════════════════════════════════════════════════════════════════
const _toastIcons = {
  success: "fa-circle-check",
  error: "fa-circle-xmark",
  info: "fa-circle-info",
  warning: "fa-triangle-exclamation",
};

function showToast(message, type = "info", duration = 4500) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `<i class="fas ${_toastIcons[type] || _toastIcons.info}" aria-hidden="true"></i><span class="toast-msg">${message}</span><button class="toast-close" aria-label="Dismiss"><i class="fas fa-xmark"></i></button>`;
  function dismiss() {
    toast.classList.add("toast-out");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }
  toast.querySelector(".toast-close").addEventListener("click", dismiss);
  container.appendChild(toast);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => toast.classList.add("toast-in")),
  );
  if (duration > 0) setTimeout(dismiss, duration);
}

// ════════════════════════════════════════════════════════════════
// ✦ TYPEWRITER
// ════════════════════════════════════════════════════════════════
(function () {
  const words = ["Student", "Developer", "Gamer"];
  const el = document.getElementById("typewriter");
  if (!el) return;
  let wIdx = 0,
    cIdx = 0,
    del = false;
  function tick() {
    const word = words[wIdx];
    if (!del) {
      el.textContent = word.slice(0, ++cIdx);
      if (cIdx === word.length) {
        del = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 90);
    } else {
      el.textContent = word.slice(0, --cIdx);
      if (cIdx === 0) {
        del = false;
        wIdx = (wIdx + 1) % words.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 50);
    }
  }
  setTimeout(tick, 700);
})();

// ════════════════════════════════════════════════════════════════
// ✦ NAV INDICATOR
// ════════════════════════════════════════════════════════════════
function updateNavIndicator(activeBtn) {
  const indicator = document.getElementById("navIndicator");
  const navList = document.getElementById("navLinks");
  if (!indicator || !navList || !activeBtn) return;
  const listRect = navList.getBoundingClientRect();
  const btnRect = activeBtn.getBoundingClientRect();
  indicator.style.cssText = `width:${btnRect.width}px;height:${btnRect.height}px;left:${btnRect.left - listRect.left}px;top:${btnRect.top - listRect.top}px;opacity:1`;
}

// ════════════════════════════════════════════════════════════════
// ✦ NAVIGATION
// ════════════════════════════════════════════════════════════════
let isTransitioning = false;
const EXIT_MS = 220,
  ENTER_MS = 350;
const SECTION_LABEL_MAP = {
  home: "Home",
  about: "About",
  projects: "Projects",
  skills: "Skills",
  hobbies: "Hobbies",
  contact: "Contact",
};

function navigate(sectionId) {
  if (isTransitioning) return;
  const currentSection = document.querySelector(".page-section.active");
  const nextSection = document.getElementById(sectionId);
  if (!nextSection || currentSection === nextSection) return;

  // Update desktop nav
  document.querySelectorAll(".nav-btn").forEach((b) => {
    b.classList.remove("active");
    b.removeAttribute("aria-current");
  });
  const navBtn = document.getElementById(`nav-${sectionId}`);
  if (navBtn) {
    navBtn.classList.add("active");
    navBtn.setAttribute("aria-current", "page");
    updateNavIndicator(navBtn);
  }

  // Update mobile nav
  document.querySelectorAll(".mobile-nav-btn").forEach((b) => {
    b.classList.toggle(
      "active",
      b.getAttribute("onclick")?.includes(`'${sectionId}'`),
    );
  });
  const mobileActiveLabel = document.getElementById("mobileActiveLabel");
  if (mobileActiveLabel)
    mobileActiveLabel.textContent = SECTION_LABEL_MAP[sectionId] || sectionId;

  const dropdown = document.getElementById("mobileDropdown");
  if (dropdown?.classList.contains("open")) toggleMobileMenu();

  playSound("nav");
  window.location.hash = sectionId;
  window.scrollTo({ top: 0, behavior: "instant" });
  isTransitioning = true;

  if (currentSection) {
    currentSection.classList.remove("entering");
    currentSection.classList.add("exiting");
  }
  setTimeout(() => {
    if (currentSection) {
      currentSection.classList.remove("active", "exiting");
      currentSection.style.display = "none";
    }
    nextSection.classList.remove("entering", "exiting");
    nextSection.style.display = "block";
    nextSection.classList.add("active");
    void nextSection.offsetHeight;
    nextSection.classList.add("entering");
    nextSection.querySelector("h1, h2")?.focus();
    if (sectionId === "skills") animateSkillBars();
    window._highlightKbdSection?.();
    setTimeout(() => {
      isTransitioning = false;
    }, ENTER_MS);
  }, EXIT_MS);
}

function toggleMobileMenu() {
  const dropdown = document.getElementById("mobileDropdown");
  const menuBtn = document.getElementById("mobileMenuBtn");
  const isOpen = dropdown.classList.toggle("open");
  menuBtn.classList.toggle("is-open", isOpen);
  menuBtn.setAttribute("aria-expanded", isOpen);
  menuBtn.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
}

// ════════════════════════════════════════════════════════════════
// ✦ SKILL BARS
// ════════════════════════════════════════════════════════════════
let skillBarsAnimated = false;
function animateSkillBars() {
  if (skillBarsAnimated) return;
  skillBarsAnimated = true;
  document.querySelectorAll(".skill-bar-fill").forEach((bar, i) => {
    const pct = parseInt(bar.dataset.pct || 0);
    const pctEl = bar
      .closest(".skill-bar-item")
      ?.querySelector(".skill-bar-pct");
    setTimeout(() => {
      bar.style.width = pct + "%";
      if (!pctEl) return;
      const duration = 1100,
        startTime = performance.now();
      function updateCounter(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        pctEl.textContent = Math.round(eased * pct) + "%";
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
          return;
        }
        pctEl.textContent = pct + "%";
        pctEl.classList.remove("counting-done");
        void pctEl.offsetWidth;
        pctEl.classList.add("counting-done");
      }
      requestAnimationFrame(updateCounter);
    }, i * 90);
  });
}

// ════════════════════════════════════════════════════════════════
// ✦ DOM READY
// ════════════════════════════════════════════════════════════════
window.addEventListener("DOMContentLoaded", () => {
  _updateSoundBtn();

  // Sound toggle
  document.getElementById("soundToggle")?.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("soundEnabled", soundEnabled);
    _updateSoundBtn();
    if (soundEnabled) {
      _getCtx();
      if (_audioCtx.state === "suspended")
        _audioCtx
          .resume()
          .then(() => startBgMusic())
          .catch(() => {});
      else startBgMusic();
    } else {
      stopBgMusic();
      _musicStarted = false;
    }
  });

  // Resume download toast
  document.getElementById("resumeBtn")?.addEventListener("click", () => {
    playSound("success");
    showToast(
      '<i class="fas fa-file-arrow-down" style="margin-right:6px"></i> Downloading resume…',
      "info",
      2500,
    );
  });

  // Activate initial section
  const initial = document.querySelector(".page-section.active");
  if (initial) {
    initial.style.display = "block";
    void initial.offsetHeight;
    initial.classList.add("entering");
  }

  // Handle hash-based routing
  const hash = window.location.hash.slice(1);
  if (hash && document.getElementById(hash)) navigate(hash);

  document.getElementById("footerYear").textContent = new Date().getFullYear();

  requestAnimationFrame(() => {
    const activeNavBtn = document.querySelector(".nav-btn.active");
    if (activeNavBtn) updateNavIndicator(activeNavBtn);
  });

  initMagneticButtons();
  initBackToTop();
  initParticleCanvas();
  initTimezone();
  initAnimatedFavicon();
  initKonamiCode();
  initSwipeGestures();
  initContactForm();
});

// Nav keyboard support
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("keypress", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });
});

// ════════════════════════════════════════════════════════════════
// ✦ CURSOR SPOTLIGHT
// ════════════════════════════════════════════════════════════════
(function () {
  const spotlight = document.getElementById("cursorSpotlight");
  if (
    !spotlight ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  let mx = -9999,
    my = -9999,
    raf = null,
    visible = false;
  function update() {
    spotlight.style.background = `radial-gradient(600px circle at ${mx}px ${my}px,var(--spotlight-color),transparent 80%)`;
    raf = null;
  }
  document.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        spotlight.classList.add("visible");
        visible = true;
      }
      if (!raf) raf = requestAnimationFrame(update);
    },
    { passive: true },
  );
  document.addEventListener("mouseleave", () => {
    spotlight.classList.remove("visible");
    visible = false;
  });
})();

// ════════════════════════════════════════════════════════════════
// ✦ MAGNETIC BUTTONS
// ════════════════════════════════════════════════════════════════
function initMagneticButtons() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("[data-magnetic]").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.38;
      const dy = (e.clientY - r.top - r.height / 2) * 0.38;
      btn.style.cssText +=
        ";transition:transform .25s cubic-bezier(.23,1,.32,1);transform:translate(" +
        dx +
        "px," +
        dy +
        "px)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.cssText +=
        ";transition:transform .5s cubic-bezier(.23,1,.32,1);transform:translate(0,0)";
    });
  });
}

// ════════════════════════════════════════════════════════════════
// ✦ BACK TO TOP — debounced scroll
// ════════════════════════════════════════════════════════════════
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  const snd = document.getElementById("soundToggle");
  if (!btn) return;
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const past = window.scrollY > 0;
        btn.classList.toggle("btt-visible", past);
        snd?.classList.toggle("snd-visible", past);
        ticking = false;
      });
    },
    { passive: true },
  );
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    playSound("nav");
  });
}

// ════════════════════════════════════════════════════════════════
// ✦ PARTICLES
// ════════════════════════════════════════════════════════════════
function initParticleCanvas() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles;
  const mouse = { x: -9999, y: -9999 };
  const COUNT = Math.min(80, Math.floor(window.innerWidth / 18));
  const MAX_DIST = 140,
    MOUSE_DIST = 180;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function createParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));
  }
  function getAccentColor() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "59,130,246"
      : "37,99,235";
  }

  let rafId = null;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const accent = getAccentColor();
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.012;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
      const mdx = p.x - mouse.x,
        mdy = p.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < MOUSE_DIST) {
        const force = ((MOUSE_DIST - md) / MOUSE_DIST) * 0.015;
        p.vx += (mdx / md) * force;
        p.vy += (mdy / md) * force;
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > 1.5) {
          p.vx = (p.vx / spd) * 1.5;
          p.vy = (p.vy / spd) * 1.5;
        }
      } else {
        p.vx *= 0.995;
        p.vy *= 0.995;
      }
      const po = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
      const pr = p.r * (0.9 + 0.1 * Math.sin(p.pulse * 1.3));
      ctx.beginPath();
      ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accent},${po})`;
      ctx.fill();
    }
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i],
          b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${accent},${(1 - dist / MAX_DIST) * 0.18})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener(
    "resize",
    () => {
      resize();
      createParticles();
    },
    { passive: true },
  );
  window.addEventListener(
    "mousemove",
    (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true },
  );
  window.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId) draw();
  });

  resize();
  createParticles();
  draw();
}

// ════════════════════════════════════════════════════════════════
// ✦ TIMEZONE
// ════════════════════════════════════════════════════════════════
function initTimezone() {
  const timeEl = document.getElementById("timezoneTime");
  const labelEl = document.getElementById("timezoneLabel");
  if (!timeEl || !labelEl) return;
  const MY_TZ = "Asia/Kolkata",
    MY_TZ_SHORT = "IST";
  const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fmtTime = (tz) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());
    } catch {
      return "--:--";
    }
  };
  const getMinutes = (tz) => {
    try {
      const p = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      }).formatToParts(new Date());
      return (
        parseInt(p.find((x) => x.type === "hour")?.value || 0) * 60 +
        parseInt(p.find((x) => x.type === "minute")?.value || 0)
      );
    } catch {
      return 0;
    }
  };
  function getLabel() {
    try {
      const isDev =
        visitorTz === MY_TZ ||
        visitorTz.includes("Calcutta") ||
        visitorTz.includes("Kolkata");
      if (isDev) return `${MY_TZ_SHORT} · Same timezone as me 🙌`;
      let diff = getMinutes(MY_TZ) - getMinutes(visitorTz);
      if (diff > 720) diff -= 1440;
      if (diff < -720) diff += 1440;
      const a = Math.abs(diff),
        h = Math.floor(a / 60),
        m = a % 60;
      return `${MY_TZ_SHORT} · ${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${diff > 0 ? "ahead of" : "behind"} you`;
    } catch {
      return MY_TZ_SHORT;
    }
  }
  function tick() {
    timeEl.textContent = fmtTime(MY_TZ);
    labelEl.textContent = getLabel();
  }
  tick();
  setInterval(tick, 30000);
}

// ════════════════════════════════════════════════════════════════
// ✦ ANIMATED FAVICON
// ════════════════════════════════════════════════════════════════
function initAnimatedFavicon() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext("2d");
  const link =
    document.getElementById("faviconLink") ||
    document.querySelector("link[rel*='icon']");
  if (!link || !ctx) return;
  let frame = 0;
  const TOTAL = 120;
  function draw() {
    const t = frame / TOTAL;
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    ctx.clearRect(0, 0, 32, 32);
    const bg = ctx.createLinearGradient(0, 0, 32, 32);
    bg.addColorStop(0, isDark ? "#1a1a2e" : "#e8f0fe");
    bg.addColorStop(1, isDark ? "#16213e" : "#d1e3ff");
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    const angle = t * Math.PI * 2,
      r = 8;
    const dx = 16 + Math.cos(angle) * r,
      dy = 16 + Math.sin(angle) * r;
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isDark ? "#3b82f6" : "#2563eb";
    ctx.fillText("</>", 16, 16);
    const gg = ctx.createRadialGradient(dx, dy, 0, dx, dy, 4);
    gg.addColorStop(0, isDark ? "rgba(96,165,250,1)" : "rgba(37,99,235,1)");
    gg.addColorStop(1, "rgba(59,130,246,0)");
    ctx.beginPath();
    ctx.arc(dx, dy, 4, 0, Math.PI * 2);
    ctx.fillStyle = gg;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(16, 16, r, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? "rgba(59,130,246,.18)" : "rgba(37,99,235,.18)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? "rgba(59,130,246,.4)" : "rgba(37,99,235,.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    link.href = canvas.toDataURL("image/png");
    frame = (frame + 1) % TOTAL;
    requestAnimationFrame(draw);
  }
  draw();
}

// ════════════════════════════════════════════════════════════════
// ✦ SWIPE GESTURES
// ════════════════════════════════════════════════════════════════
function initSwipeGestures() {
  const SECTIONS = [
    "home",
    "about",
    "projects",
    "skills",
    "hobbies",
    "contact",
  ];
  const MIN_X = 55,
    MAX_Y = 80,
    MIN_V = 0.3;
  let sx = 0,
    sy = 0,
    st = 0,
    swiping = false;
  const hint = document.createElement("div");
  hint.className = "swipe-hint";
  hint.innerHTML =
    '<span class="swipe-hint-arrow"></span><span class="swipe-hint-label"></span>';
  document.body.appendChild(hint);
  const ha = hint.querySelector(".swipe-hint-arrow"),
    hl = hint.querySelector(".swipe-hint-label");
  const idx = () => {
    const a = document.querySelector(".page-section.active");
    return a ? SECTIONS.indexOf(a.id) : 0;
  };
  const showHint = (d, n) => {
    ha.textContent = d === "left" ? "→" : "←";
    hl.textContent = n[0].toUpperCase() + n.slice(1);
    hint.className = `swipe-hint swipe-hint--${d} swipe-hint--visible`;
  };
  const hideHint = () => hint.classList.remove("swipe-hint--visible");

  document.addEventListener(
    "touchstart",
    (e) => {
      if (
        e.touches.length !== 1 ||
        e.target.closest(".tags,.skill-bars-list,input,textarea,select")
      )
        return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      st = Date.now();
      swiping = true;
    },
    { passive: true },
  );
  document.addEventListener(
    "touchmove",
    (e) => {
      if (!swiping) return;
      const dx = e.touches[0].clientX - sx,
        dy = Math.abs(e.touches[0].clientY - sy);
      if (dy > MAX_Y) {
        swiping = false;
        hideHint();
        return;
      }
      const i = idx();
      if (Math.abs(dx) > 20) {
        if (dx < 0 && i < SECTIONS.length - 1)
          showHint("left", SECTIONS[i + 1]);
        else if (dx > 0 && i > 0) showHint("right", SECTIONS[i - 1]);
        else hideHint();
      }
    },
    { passive: true },
  );
  document.addEventListener(
    "touchend",
    (e) => {
      if (!swiping) return;
      swiping = false;
      hideHint();
      const dx = e.changedTouches[0].clientX - sx,
        dy = Math.abs(e.changedTouches[0].clientY - sy);
      const v = Math.abs(dx) / (Date.now() - st);
      if (dy > MAX_Y || Math.abs(dx) < MIN_X || v < MIN_V) return;
      const i = idx();
      if (dx < 0 && i < SECTIONS.length - 1) {
        navigate(SECTIONS[i + 1]);
        showToast(
          "→ " + SECTIONS[i + 1][0].toUpperCase() + SECTIONS[i + 1].slice(1),
          "info",
          1200,
        );
      } else if (dx > 0 && i > 0) {
        navigate(SECTIONS[i - 1]);
        showToast(
          "← " + SECTIONS[i - 1][0].toUpperCase() + SECTIONS[i - 1].slice(1),
          "info",
          1200,
        );
      }
    },
    { passive: true },
  );
  document.addEventListener(
    "touchcancel",
    () => {
      swiping = false;
      hideHint();
    },
    { passive: true },
  );
}

// ════════════════════════════════════════════════════════════════
// ✦ KONAMI CODE
// ════════════════════════════════════════════════════════════════
function initKonamiCode() {
  const K = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let seq = [],
    timer;
  document.addEventListener("keydown", (e) => {
    seq.push(e.key);
    if (seq.length > K.length) seq.shift();
    clearTimeout(timer);
    timer = setTimeout(() => (seq = []), 3000);
    if (seq.length === K.length && seq.every((k, i) => k === K[i])) {
      seq = [];
      triggerEasterEgg();
    }
  });
  document
    .getElementById("easterEggClose")
    ?.addEventListener("click", () =>
      document.getElementById("easterEggOverlay").classList.remove("open"),
    );
  document
    .getElementById("easterEggOverlay")
    ?.addEventListener("click", (e) => {
      if (e.target.id === "easterEggOverlay") e.target.classList.remove("open");
    });
}

function triggerEasterEgg() {
  document.getElementById("easterEggOverlay")?.classList.add("open");
  const colors = [
    "#3b82f6",
    "#60a5fa",
    "#818cf8",
    "#34d399",
    "#f59e0b",
    "#f472b6",
    "#a78bfa",
  ];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `left:${Math.random() * 100}vw;background:${colors[Math.floor(Math.random() * colors.length)]};width:${Math.random() * 8 + 4}px;height:${Math.random() * 8 + 4}px;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};animation-delay:${Math.random() * 0.8}s;animation-duration:${Math.random() * 1.5 + 1.5}s;`;
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

// ════════════════════════════════════════════════════════════════
// ✦ LAST.FM
// ════════════════════════════════════════════════════════════════
const LASTFM_USERNAME = "Devajuice";
const LASTFM_API_KEY = "a1947761da6f45ca8c47e50ebf1033c2";
const LASTFM_PH = "2a96cbd8b46e442fc41c2b86b821562f";

// Cache DOM refs for music widget (queried once)
const _mEl = {
  get pill() {
    return document.getElementById("heroPill");
  },
  get pillLabel() {
    return document.getElementById("heroPillLabel");
  },
  get pillTrack() {
    return document.getElementById("heroTrack");
  },
  get heroEq() {
    return document.getElementById("heroEqBars");
  },
  get pillBgArt() {
    return document.getElementById("pillBgArt");
  },
  get trackName() {
    return document.getElementById("trackName");
  },
  get artistText() {
    return document.getElementById("artistNameText");
  },
  get albumName() {
    return document.getElementById("albumName");
  },
  get albumArt() {
    return document.getElementById("albumArt");
  },
  get aboutEq() {
    return document.getElementById("aboutEqBars");
  },
  get liveBadge() {
    return document.getElementById("aboutLiveBadge");
  },
  get glassCard() {
    return document.getElementById("musicGlassCard");
  },
  get cardBgArt() {
    return document.getElementById("musicCardBgArt");
  },
};

function setNowPlayingState(isLive, name, artist, album, art) {
  const {
    pill,
    pillLabel,
    pillTrack,
    heroEq,
    pillBgArt,
    trackName,
    artistText,
    albumName,
    albumArt,
    aboutEq,
    liveBadge,
    glassCard,
    cardBgArt,
  } = _mEl;

  if (pill) pill.classList.toggle("live", isLive);
  if (heroEq) heroEq.classList.toggle("live", isLive);
  if (pillLabel) pillLabel.textContent = isLive ? "Now Playing" : "Last Played";
  if (pillTrack)
    pillTrack.textContent = name && artist ? `${name} — ${artist}` : "";

  function setArt(el) {
    if (!el) return;
    if (art) {
      el.style.backgroundImage = `url('${art}')`;
      el.classList.add("has-art");
    } else {
      el.style.backgroundImage = "";
      el.classList.remove("has-art");
    }
  }
  setArt(pillBgArt);
  setArt(cardBgArt);

  if (trackName)
    trackName.childNodes[0].textContent = name || "No recent activity";
  if (artistText) artistText.textContent = artist || "";
  if (albumName) albumName.textContent = album || "";
  if (aboutEq) aboutEq.classList.toggle("live", isLive);
  if (glassCard) glassCard.classList.toggle("live-glow", isLive);

  if (liveBadge) {
    if (name) {
      liveBadge.style.display = "inline-flex";
      liveBadge.className = `music-live-badge ${isLive ? "live" : "recent"}`;
      liveBadge.innerHTML = isLive
        ? `<i class="fas fa-circle" style="font-size:.5em"></i> Live`
        : `<i class="fas fa-clock" style="font-size:.7em"></i> Recent`;
    } else {
      liveBadge.style.display = "none";
    }
  }

  if (albumArt) {
    if (art) {
      albumArt.src = art;
      albumArt.alt = `${album} album cover`;
      albumArt.style.display = "block";
      albumArt.onerror = () => {
        albumArt.style.display = "none";
        albumArt.onerror = null;
      };
    } else {
      albumArt.style.display = "none";
      albumArt.src = "";
    }
  }
}

function getBestImage(images) {
  if (!images) return "";
  for (const sz of ["extralarge", "large", "medium", "small"]) {
    const img = images.find((i) => i.size === sz);
    if (img?.["#text"]?.trim() && !img["#text"].includes(LASTFM_PH))
      return img["#text"];
  }
  return "";
}

async function fetchNowPlaying() {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1&extended=1`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.message);
    const track = data.recenttracks?.track?.[0];
    if (!track) {
      setNowPlayingState(false, "", "", "", "");
      return;
    }

    const isLive = track["@attr"]?.nowplaying === "true";
    const name = track.name || "Unknown Track";
    const artist =
      track.artist?.name || track.artist?.["#text"] || "Unknown Artist";
    let album = track.album?.["#text"] || "";
    let art = getBestImage(track.image);

    // Fallback: try track.getInfo for missing album/art
    if (!album || !art) {
      try {
        const ti = await (
          await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(name)}&format=json&username=${LASTFM_USERNAME}`,
          )
        ).json();
        if (ti.track?.album) {
          album = album || ti.track.album.title || "";
          if (!art) art = getBestImage(ti.track.album.image);
        }
      } catch (_) {}
    }
    setNowPlayingState(isLive, name, artist, album || "Unknown Album", art);
  } catch {
    const pl = document.getElementById("heroPillLabel");
    if (pl) pl.textContent = "Last.fm error";
    const tl = document.getElementById("trackName");
    if (tl) tl.childNodes[0].textContent = "Last.fm error";
  }
}
fetchNowPlaying();
setInterval(fetchNowPlaying, 30000);

// ════════════════════════════════════════════════════════════════
// ✦ THEME TOGGLE + INK BLOT
// ════════════════════════════════════════════════════════════════
const themeBtn = document.getElementById("themeToggle");
const html = document.documentElement;

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeBtn.innerHTML =
    theme === "light"
      ? '<i class="fas fa-moon" aria-hidden="true"></i>'
      : '<i class="fas fa-sun" aria-hidden="true"></i>';
  themeBtn.setAttribute(
    "aria-label",
    theme === "light" ? "Switch to dark mode" : "Switch to light mode",
  );
}

const INK_BLOBS = [
  [
    [0, 82],
    [30, 95],
    [60, 78],
    [90, 90],
    [120, 85],
    [150, 100],
    [180, 80],
    [210, 92],
    [240, 75],
    [270, 88],
    [300, 95],
    [330, 78],
  ],
  [
    [0, 115],
    [20, 65],
    [40, 120],
    [60, 58],
    [80, 118],
    [100, 62],
    [120, 110],
    [140, 60],
    [160, 115],
    [180, 65],
    [200, 120],
    [220, 58],
    [240, 112],
    [260, 62],
    [280, 118],
    [300, 58],
    [320, 115],
    [340, 68],
  ],
  [
    [0, 105],
    [45, 70],
    [90, 115],
    [135, 68],
    [180, 108],
    [225, 72],
    [270, 118],
    [315, 65],
  ],
  [
    [0, 55],
    [30, 80],
    [60, 100],
    [80, 115],
    [100, 105],
    [120, 90],
    [150, 85],
    [180, 110],
    [210, 88],
    [240, 95],
    [270, 112],
    [300, 85],
    [330, 65],
  ],
  [
    [0, 88],
    [25, 110],
    [50, 72],
    [75, 105],
    [100, 80],
    [125, 115],
    [150, 70],
    [175, 98],
    [200, 82],
    [225, 112],
    [250, 68],
    [275, 100],
    [300, 85],
    [325, 108],
    [350, 76],
  ],
  [
    [0, 110],
    [20, 80],
    [40, 118],
    [65, 55],
    [90, 105],
    [110, 130],
    [130, 78],
    [160, 100],
    [185, 60],
    [210, 115],
    [235, 85],
    [260, 120],
    [285, 70],
    [310, 105],
    [335, 88],
    [355, 115],
  ],
];

function makeBlob(points, cx, cy, maxR) {
  const pts = points.map(([deg, pct]) => {
    const rad = (deg * Math.PI) / 180,
      r = (maxR * pct) / 100;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  });
  const n = pts.length;
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n],
      p1 = pts[i],
      p2 = pts[(i + 1) % n],
      p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6,
      c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6,
      c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d + " Z";
}

let _lastBlobIdx = -1;
function triggerInkBlot(newTheme) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyTheme(newTheme);
    return;
  }
  const W = window.innerWidth,
    H = window.innerHeight,
    cx = W / 2,
    cy = H / 2,
    maxR = (Math.hypot(W, H) / 2) * 1.15;
  let idx;
  do {
    idx = Math.floor(Math.random() * INK_BLOBS.length);
  } while (idx === _lastBlobIdx && INK_BLOBS.length > 1);
  _lastBlobIdx = idx;
  const svgNS = "http://www.w3.org/2000/svg",
    svg = document.createElementNS(svgNS, "svg");
  svg.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;overflow:visible;";
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", makeBlob(INK_BLOBS[idx], cx, cy, maxR));
  path.setAttribute("fill", newTheme === "dark" ? "#0a0a0a" : "#ffffff");
  path.style.cssText = `transform-origin:${cx}px ${cy}px;transform:scale(0);transition:transform .55s cubic-bezier(.34,1.05,.64,1);`;
  svg.appendChild(path);
  document.body.appendChild(svg);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      path.style.transform = "scale(1)";
    }),
  );
  setTimeout(() => {
    applyTheme(newTheme);
    setTimeout(() => {
      path.style.transition = "transform .45s cubic-bezier(.4,0,.2,1)";
      path.style.transform = "scale(0)";
      setTimeout(() => svg.remove(), 500);
    }, 60);
  }, 580);
}

// Apply theme on load (already set by inline script, just update button state)
applyTheme(html.getAttribute("data-theme") || "light");

themeBtn.addEventListener("click", () => {
  const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  themeBtn.classList.remove("spinning");
  void themeBtn.offsetWidth;
  themeBtn.classList.add("spinning");
  themeBtn.addEventListener(
    "animationend",
    () => themeBtn.classList.remove("spinning"),
    { once: true },
  );
  triggerInkBlot(next);
  playSound("click");
});

// Sync with system preference changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem("theme"))
      applyTheme(e.matches ? "dark" : "light");
  });

// ════════════════════════════════════════════════════════════════
// ✦ CONTACT FORM
// ════════════════════════════════════════════════════════════════
function initContactForm() {
  document
    .getElementById("contactForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const message = document.getElementById("contactMessage").value.trim();
      if (!name || !email || !message) {
        showToast("Please fill in all fields.", "warning");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Please enter a valid email address.", "error");
        return;
      }
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i><span>Sending…</span>';
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: "22419ab2-e874-481c-a3b5-6d2fc55fa04e",
            name,
            email,
            message,
          }),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          playSound("success");
          showToast("Message sent! I'll get back to you soon.", "success");
          e.target.reset();
        } else showToast("Failed to send. Please try again.", "error");
      } catch {
        showToast("An error occurred. Please try again later.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="fas fa-paper-plane"></i><span>Send Message</span>';
      }
    });
}

// ════════════════════════════════════════════════════════════════
// ✦ MISC EVENTS
// ════════════════════════════════════════════════════════════════
document.addEventListener("click", (e) => {
  const d = document.getElementById("mobileDropdown"),
    t = document.querySelector(".topnav-pill");
  if (d?.classList.contains("open") && !t.contains(e.target))
    toggleMobileMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    flashKey("kk-esc");
    if (document.getElementById("kbdOverlay").classList.contains("open")) {
      closeKbdOverlay();
      return;
    }
    const d = document.getElementById("mobileDropdown");
    if (d?.classList.contains("open")) toggleMobileMenu();
    const ee = document.getElementById("easterEggOverlay");
    if (ee?.classList.contains("open")) ee.classList.remove("open");
    return;
  }
  if (isTypingInField() || e.ctrlKey || e.altKey || e.metaKey) return;
  const key = e.key;
  const SECTION_KEYS = {
    1: "home",
    2: "about",
    3: "projects",
    4: "skills",
    5: "hobbies",
    6: "contact",
  };
  if (SECTION_KEYS[key]) {
    e.preventDefault();
    flashKey(
      { 1: "kk-1", 2: "kk-2", 3: "kk-3", 4: "kk-4", 5: "kk-5", 6: "kk-6" }[key],
    );
    const s = SECTION_KEYS[key];
    closeKbdOverlay();
    navigate(s);
    showToast(
      `<i class="fas fa-compass" style="margin-right:4px"></i> Jumped to <strong>${s[0].toUpperCase() + s.slice(1)}</strong>`,
      "info",
      1600,
    );
    return;
  }
  if (key === "t" || key === "T") {
    e.preventDefault();
    flashKey("kk-t");
    const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
    themeBtn.classList.remove("spinning");
    void themeBtn.offsetWidth;
    themeBtn.classList.add("spinning");
    themeBtn.addEventListener(
      "animationend",
      () => themeBtn.classList.remove("spinning"),
      { once: true },
    );
    triggerInkBlot(next);
    playSound("click");
    return;
  }
  if (key === "b" || key === "B") {
    e.preventDefault();
    flashKey("kk-b");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (key === "?") {
    e.preventDefault();
    flashKey("kk-q");
    document.getElementById("kbdOverlay").classList.contains("open")
      ? closeKbdOverlay()
      : openKbdOverlay();
    return;
  }
});

document.querySelector(".skip-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  const mc = document.getElementById("main-content");
  if (mc) {
    mc.setAttribute("tabindex", "-1");
    mc.focus();
    mc.scrollIntoView({ behavior: "smooth" });
    mc.addEventListener("blur", () => mc.removeAttribute("tabindex"), {
      once: true,
    });
  }
});

// ════════════════════════════════════════════════════════════════
// ✦ KEYBOARD SHORTCUTS HELPERS
// ════════════════════════════════════════════════════════════════
function flashKey(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("pressed");
  setTimeout(() => el.classList.remove("pressed"), 240);
}
function isTypingInField() {
  const t = document.activeElement?.tagName?.toLowerCase();
  return (
    t === "input" ||
    t === "textarea" ||
    t === "select" ||
    document.activeElement?.isContentEditable
  );
}
window._highlightKbdSection = function () {
  const active = document.querySelector(".page-section.active")?.id;
  document
    .querySelectorAll(".kbd-item[data-section]")
    .forEach((r) =>
      r.classList.toggle("is-active", r.dataset.section === active),
    );
};
function openKbdOverlay() {
  const o = document.getElementById("kbdOverlay");
  o.classList.add("open");
  o.querySelector(".kbd-close").focus();
  window._highlightKbdSection?.();
  o.addEventListener("click", _backdropClose);
}
function closeKbdOverlay() {
  const o = document.getElementById("kbdOverlay");
  o.classList.remove("open");
  o.removeEventListener("click", _backdropClose);
}
function _backdropClose(e) {
  if (e.target === document.getElementById("kbdOverlay")) closeKbdOverlay();
}
