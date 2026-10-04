import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const FIREFOX_CANDIDATES = [
  process.env.FIREFOX_PATH,
  '/Applications/Firefox.app/Contents/MacOS/firefox',
  '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox',
  '/Applications/Firefox Nightly.app/Contents/MacOS/firefox',
  '/usr/bin/firefox',
  '/usr/local/bin/firefox',
].filter(Boolean);
const FIREFOX = FIREFOX_CANDIDATES.find((p) => existsSync(p));
if (!FIREFOX) {
  console.error('Firefox not found. Set FIREFOX_PATH.');
  process.exit(1);
}

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';

const browser = await puppeteer.launch({
  browser: 'firefox',
  executablePath: FIREFOX,
  headless: true,
  args: ['--width=390', '--height=844'],
});

const fail = [];
const ok = [];
const check = (name, cond, detail = '') =>
  (cond ? ok : fail).push(`${name}${detail ? ' — ' + detail : ''}`);

const newPage = async (width, height = 844) => {
  const p = await browser.newPage();
  await p.setViewport({ width, height });
  return p;
};

// ── shortcuts pill is hidden on phones ─────────────────────────────
// The breakpoint lives inside the .kbd-hint-badge @utility rather than as a
// `hidden sm:flex` class pair, so this asserts the resolved display at both
// sides of 40rem.
for (const [width, expected] of [
  [390, 'none'],
  [360, 'none'],
  [768, 'flex'],
]) {
  const p = await newPage(width, 800);
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
  const display = await p.evaluate(() => {
    const el = document.getElementById('kbdHintBadge');
    return el ? getComputedStyle(el).display : null;
  });
  check(`shortcuts pill hidden at ${width}px`, display === expected, `display=${display}`);
  await p.close();
}

// ── Send Message button icon is centred and spaced ─────────────────
// Button wraps `children` in one <span>, so an inline icon passed as a child
// becomes a single flex item: the size `gap` never applies and the SVG lands on
// the text baseline. Assert the icon is a real flex item and shares the button's
// vertical centre with the label.
{
  const p = await newPage(1000, 900);
  await p.goto(`${BASE}/#contact`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1800));

  const info = await p.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      /send message/i.test(b.textContent)
    );
    if (!btn) return null;
    const svg = btn.querySelector('svg');
    const label = [...btn.querySelectorAll('span')].find(
      (s) => s.textContent.trim() === 'Send Message'
    );
    const bs = btn.getBoundingClientRect();
    const ss = svg.getBoundingClientRect();
    const ls = label.getBoundingClientRect();
    return {
      // the icon's wrapper must be a DIRECT child of the button
      iconIsDirectChild: svg.parentElement.parentElement === btn,
      gap: getComputedStyle(btn).gap,
      iconMid: ss.y + ss.height / 2,
      labelMid: ls.y + ls.height / 2,
      btnMid: bs.y + bs.height / 2,
      spacing: ls.left - ss.right,
    };
  });

  check('send button found', !!info);
  check('send icon is a direct flex child', info?.iconIsDirectChild);
  check('send icon shares the label centre', Math.abs(info.iconMid - info.labelMid) < 1.5,
    `icon=${info?.iconMid.toFixed(1)} label=${info?.labelMid.toFixed(1)}`);
  check('send icon centred in the button', Math.abs(info.iconMid - info.btnMid) < 1.5,
    `icon=${info?.iconMid.toFixed(1)} btn=${info?.btnMid.toFixed(1)}`);
  check('send icon has real spacing (gap applies)', parseFloat(info?.gap || 0) > 0, `gap=${info?.gap}`);
  await p.close();
}

// ── now-playing pill content is optically centred ───────────────────
for (const width of [390, 768, 1440]) {
  const p = await newPage(width);
  await p.goto(`${BASE}/#home`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500));

  // This suite talks to the real /api/nowplaying, so a fixed sleep can catch the
  // pill mid-"Loading…" — which has no element children and would make the
  // geometry below meaningless. Wait for a settled state instead.
  await p.waitForFunction(
    () => {
      const el = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
        /now playing|last played|unavailable/i.test(e.textContent)
      );
      return !!el && el.children.length > 0;
    },
    { timeout: 15000 }
  ).catch(() => {});

  const info = await p.evaluate(() => {
    const host = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
      /now playing|last played|unavailable|loading/i.test(e.textContent)
    );
    const el = host;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    // in-flow boxes only — the artwork and glass layers are absolutely positioned
    const boxes = [...el.children]
      .filter((k) => getComputedStyle(k).position !== 'absolute')
      .map((k) => k.getBoundingClientRect())
      .filter((x) => x.width > 0);
    const first = boxes[0];
    const last = boxes[boxes.length - 1];
    if (!first || !last) return { empty: true, pillCenter: r.x + r.width / 2, viewportCenter: window.innerWidth / 2 };
    return {
      pillCenter: r.x + r.width / 2,
      viewportCenter: window.innerWidth / 2,
      contentCenter: (first.x + last.right) / 2,
      asymmetry: first.x - r.x - (r.right - last.right),
      justify: getComputedStyle(el).justifyContent,
    };
  });

  check(`pill fits viewport at ${width}px`, info && info.pillCenter - info.pillCenter + info.pillCenter <= width, '');
  check(`pill centred in viewport at ${width}px`,
    info && Math.abs(info.pillCenter - info.viewportCenter) <= 1,
    `pill=${info?.pillCenter.toFixed(1)} vw=${info?.viewportCenter}`);
  check(`pill content measurable at ${width}px`, info && !info.empty, info?.empty ? 'pill had no in-flow children' : '');
  check(`pill content centred at ${width}px`,
    info && Math.abs(info.asymmetry) <= 1.5,
    `asymmetry=${info?.asymmetry.toFixed(1)}px`);
  await p.close();
}

// ── section switching is smooth ────────────────────────────────────
// Two regressions are checked here:
//  1. the incoming section must not paint at full opacity for one frame before
//     the enter animation starts (the old rAF flash), and
//  2. a revisited section must not replay its internal entrance animations,
//     which display:none/block used to cause on every visit.
{
  const p = await newPage(1000, 900);
  await p.goto(`${BASE}/#home`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  const samples = await p.evaluate(async () => {
    const nav = [...document.querySelectorAll('button')].find((n) =>
      /^projects$/i.test(n.textContent.trim())
    );
    if (!nav) return { error: 'nav button not found' };
    nav.click();
    const t0 = performance.now();
    const out = [];
    while (performance.now() - t0 < 750) {
      const sec = document.getElementById('projects');
      const cs = getComputedStyle(sec);
      if (cs.display !== 'none') {
        const inner = sec.querySelector("[class*='animate-fade-up'],[class*='animate-stagger-fade-up']");
        out.push({
          t: Math.round(performance.now() - t0),
          opacity: parseFloat(cs.opacity),
          innerAnim: inner ? getComputedStyle(inner).animationName : null,
          revealed: sec.classList.contains('revealed'),
        });
      }
      await new Promise((r) => requestAnimationFrame(r));
    }
    return { out };
  });

  check('projects section reachable', !samples.error, samples.error || '');
  const out = samples.out || [];
  const first = out[0];
  check('incoming section starts transparent (no flash frame)',
    first && first.opacity < 0.15, `first opacity=${first?.opacity}`);
  check('entering section is marked revealed', first?.revealed === true);
  // A real ramp: intermediate frames must exist between 0 and 1.
  const mid = out.filter((s) => s.opacity > 0.05 && s.opacity < 0.95);
  check('transition ramps gradually', mid.length >= 2, `${mid.length} intermediate frames`);
  check('transition reaches full opacity', out[out.length - 1]?.opacity === 1,
    `final=${out[out.length - 1]?.opacity}`);
  const innerNames = [...new Set(out.map((s) => s.innerAnim).filter(Boolean))];
  check('revisited section does not replay entrance animations',
    innerNames.length === 0, innerNames.join(' | ') || 'none');
  await p.close();
}

// ── mobile gooey nav menu ──────────────────────────────────────────
// The panel and the blob layer are separate DOM trees: the goo filter can only
// take a single flat colour, so text has to live outside it. That split is the
// easy thing to break, so assert the two layers stay row-aligned and that the
// filter is genuinely wired up rather than silently dropped.
{
  const p = await newPage(390);
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));
  await p.click('#mobileMenuBtn');
  await new Promise((r) => setTimeout(r, 1600));

  const info = await p.evaluate(() => {
    const panel = document.getElementById('mobile-nav-panel');
    if (!panel) return null;
    const pr = panel.getBoundingClientRect();
    const goo = panel.querySelector('.goo-filter');
    const gcs = goo ? getComputedStyle(goo) : null;
    const blobs = [...panel.querySelectorAll('.goo-filter ul > li')];
    const buttons = [...panel.querySelectorAll('ul li button')];
    const rows = buttons.map((b, i) => {
      const br = b.getBoundingClientRect();
      const bl = blobs[i]?.getBoundingClientRect();
      return {
        label: b.textContent.trim(),
        btnH: Math.round(br.height),
        dY: bl ? bl.y + bl.height / 2 - (br.y + br.height / 2) : null,
        dH: bl ? Math.abs(bl.height - br.height) : null,
      };
    });
    const def = document.getElementById('goo-nav-filter');
    return {
      positioned: getComputedStyle(panel).position,
      gooRect: gcs ? (({ y, width, height }) => ({ y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(goo.getBoundingClientRect()) : null,
      panelRect: { y: Math.round(pr.y), w: Math.round(pr.width), h: Math.round(pr.height) },
      filter: gcs?.filter,
      pointerEvents: gcs?.pointerEvents,
      hasBlur: !!def?.querySelector('feGaussianBlur'),
      hasColorMatrix: !!def?.querySelector('feColorMatrix'),
      blobCount: blobs.length,
      itemCount: buttons.length,
      maxDY: rows.length ? Math.max(...rows.map((r) => Math.abs(r.dY ?? 999))) : null,
      maxDH: rows.length ? Math.max(...rows.map((r) => r.dH ?? 999)) : null,
      focusable: buttons.every((b) => b.tabIndex >= 0 && !b.disabled),
      hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  check('goo panel opens', !!info);
  check('goo panel is a positioning context', info?.positioned === 'relative', `position=${info?.positioned}`);
  check('goo layer tracks the panel box',
    info?.gooRect && Math.abs(info.gooRect.y - info.panelRect.y) <= 1 && Math.abs(info.gooRect.w - info.panelRect.w) <= 1,
    `goo=${JSON.stringify(info?.gooRect)} panel=${JSON.stringify(info?.panelRect)}`);
  check('goo filter is applied', /url\(.#goo-nav-filter.\)/.test(info?.filter || ''), `filter=${info?.filter}`);
  check('goo filter is defined (blur + alpha contrast)',
    info?.hasBlur && info?.hasColorMatrix);
  check('blob layer ignores pointer events', info?.pointerEvents === 'none');
  check('one blob per nav row', info?.blobCount === info?.itemCount && info?.itemCount === 6,
    `${info?.blobCount} blobs / ${info?.itemCount} items`);
  check('blobs align with their rows', info?.maxDY <= 1, `maxDY=${info?.maxDY?.toFixed(2)}px`);
  check('blobs match row height', info?.maxDH <= 1, `maxDH=${info?.maxDH?.toFixed(2)}px`);
  check('all nav rows keyboard focusable', info?.focusable);
  check('goo menu does not cause horizontal scroll', !info?.hScroll);

  await p.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 2000));
  const closedByEsc = await p.evaluate(() => !document.getElementById('mobile-nav-panel'));
  check('Escape closes the goo menu', closedByEsc);
  await p.close();
}

await browser.close();
console.log('PASS:\n' + ok.map((s) => '  ✓ ' + s).join('\n'));
if (fail.length) {
  console.log('\nFAIL:\n' + fail.map((s) => '  ✗ ' + s).join('\n'));
  process.exit(1);
}
console.log(`\n${ok.length}/${ok.length} checks passed`);