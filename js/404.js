/* ══════════════════════════════════════════════
   404 PAGE — SCRIPTS
   Depends on: styles.css + 404.css loaded first
══════════════════════════════════════════════ */

// ── THEME (mirrors main site exactly) ────────────────────────
const html = document.documentElement;
const themeBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeBtn.innerHTML =
    theme === "light"
      ? '<i class="fas fa-moon" aria-hidden="true"></i>'
      : '<i class="fas fa-sun"  aria-hidden="true"></i>';
  themeBtn.setAttribute(
    "aria-label",
    theme === "light" ? "Switch to dark mode" : "Switch to light mode",
  );
}

// ── INK BLOT SHAPES (same as main site) ──────────────────────
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
      r = maxR * (pct / 100);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  });
  const n = pts.length;
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n],
      p1 = pts[i],
      p2 = pts[(i + 1) % n],
      p3 = pts[(i + 2) % n];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6,
      cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6,
      cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
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
    H = window.innerHeight;
  const cx = W / 2,
    cy = H / 2,
    maxR = (Math.hypot(W, H) / 2) * 1.15;
  const color = newTheme === "dark" ? "#0a0a0a" : "#ffffff";
  let idx;
  do {
    idx = Math.floor(Math.random() * INK_BLOBS.length);
  } while (idx === _lastBlobIdx && INK_BLOBS.length > 1);
  _lastBlobIdx = idx;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;overflow:visible;";
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", makeBlob(INK_BLOBS[idx], cx, cy, maxR));
  path.setAttribute("fill", color);
  path.style.cssText = `transform-origin:${cx}px ${cy}px; transform:scale(0); transition:transform 0.55s cubic-bezier(.34,1.05,.64,1);`;
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
      path.style.transition = "transform 0.45s cubic-bezier(.4,0,.2,1)";
      path.style.transform = "scale(0)";
      setTimeout(() => svg.remove(), 500);
    }, 60);
  }, 580);
}

// ── Init theme ────────────────────────────────────────────────
const saved = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(saved || (prefersDark ? "dark" : "light"));

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
});

// ── CURSOR SPOTLIGHT (same as main site) ─────────────────────
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

// ── MAGNETIC BUTTONS (same as main site) ─────────────────────
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("[data-magnetic]").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.38;
      const dy = (e.clientY - r.top - r.height / 2) * 0.38;
      btn.style.transition = "transform 0.25s cubic-bezier(.23,1,.32,1)";
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transition = "transform 0.5s cubic-bezier(.23,1,.32,1)";
      btn.style.transform = "translate(0,0)";
    });
  });
})();
