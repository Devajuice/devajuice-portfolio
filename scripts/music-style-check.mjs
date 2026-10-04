import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { decodePng, meanColor, colorDistance } from './lib/png.mjs';

const FIREFOX_CANDIDATES = [
  process.env.FIREFOX_PATH,
  '/Applications/Firefox.app/Contents/MacOS/firefox',
  '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox',
  '/Applications/Firefox Nightly.app/Contents/MacOS/firefox',
  '/usr/bin/firefox',
  '/usr/local/bin/firefox',
  '/snap/bin/firefox',
].filter(Boolean);
const FIREFOX = FIREFOX_CANDIDATES.find((p) => existsSync(p));
if (!FIREFOX) {
  console.error('Firefox not found. Set FIREFOX_PATH.');
  process.exit(1);
}

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';

const ART =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff0080"/><stop offset="1" stop-color="#00e5ff"/>
      </linearGradient></defs>
      <rect width="300" height="300" fill="url(#g)"/>
    </svg>`
  ).toString('base64');

// Raw Last.fm shape — this is what src/utils/lastfm.js actually parses.
// The track name is deliberately long so truncation is exercised.
const track = (nowplaying) => ({
  '@attr': { nowplaying: nowplaying ? 'true' : 'false' },
  name: 'Blinding Lights (Extended Nightdrive Reprise)',
  artist: { name: 'The Weeknd' },
  album: { '#text': 'After Hours' },
  image: [{ size: 'extralarge', '#text': ART }],
});

const LIVE_BODY = JSON.stringify({
  recenttracks: {
    track: [track(true)],
  },
});

const RECENT_BODY = JSON.stringify({ recenttracks: { track: [track(false)] } });

// Computed colours come back as rgb()/rgba() in some cases and oklab() in
// others, so support both encodings when deciding "is this green?".
const isGreenLike = (input) => {
  const s = String(input || '').trim();
  if (!s) return false;
  if (/^(rgb|rgba)\(/i.test(s)) {
    const [r, g, b] = (s.match(/-?[\d.]+/g) || []).map(Number);
    return Number.isFinite(g) && g > r + 25 && g > b + 25;
  }
  const m = s.match(/-?[\d.]+/g);
  if (!m || m.length < 3) return false;
  const [, a, b] = m.map(Number);
  return Math.hypot(a, b) > 0.02 && (Math.atan2(b, a) * 180) / Math.PI > 100 && (Math.atan2(b, a) * 180) / Math.PI < 180;
};

// The timezone pill also carries role="status" and appears first in the DOM, so
// the music pill must be located by its label text.
const findMusicPill = (scope = '#home') => {
  const host = [...document.querySelectorAll(`${scope} [role="status"]`)].find((e) =>
    /now playing|last played/i.test(e.textContent)
  );
  return host?? host;
};

// The fixture is chosen from ?state= so a single stub can serve both the live
// and non-live runs without needing a second browser. ?art=0 blanks the artwork
// so the pixel pass can measure how much the artwork actually contributes.
function installFetchStub(target) {
  target.evaluateOnNewDocument((bodies) => {
    const real = window.fetch.bind(window);
    window.fetch = (url, opts) => {
      const href = String(url);
      if (href.includes('/api/nowplaying')) {
        const params = new URL(location.href).searchParams;
        const body = JSON.parse(bodies[params.get('state')] || bodies.live);
        if (params.get('art') === '0') {
          body.recenttracks.track[0].image = [{ size: 'extralarge', '#text': '' }];
        }
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      // Keep the run offline and deterministic.
      if (href.includes('itunes')) return Promise.resolve(new Response('{}', { status: 404 }));
      return real(url, opts);
    };
  }, { live: LIVE_BODY, recent: RECENT_BODY });
}

// The timezone pill also carries role="status" and appears first in the DOM, so
// the music pill must be located by its label text.

const browser = await puppeteer.launch({
  browser: 'firefox',
  executablePath: FIREFOX,
  headless: true,
  args: ['--width=390', '--height=844'],
});

const page = await browser.newPage();
installFetchStub(page);
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

// Headless Firefox reports prefers-color-scheme: dark by default, which would
// silently make every "light" assertion read the dark tokens. Pin the theme via
// localStorage — this is the exact key index.html's bootstrap reads first, and it
// runs before any page script. (emulateMediaFeatures needs CDP, unsupported by
// Firefox WebDriver BiDi.)
await page.evaluateOnNewDocument(() => {
  try {
    const forced = new URL(location.href).searchParams.get('theme');
    localStorage.setItem('easyui-theme', forced === 'dark' ? 'dark' : 'light');
  } catch (e) {
    /* ignore */
  }
});



const fail = [];
const ok = [];
const check = (name, cond, detail = '') =>
  (cond ? ok : fail).push(`${name}${detail ? ' — ' + detail : ''}`);

// ── mobile home pill ───────────────────────────────────────────────
await page.goto(`${BASE}/#home`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));

const pill = await page.evaluate((fn) => {
  const el = new Function(`return ${fn}`)()();
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    w: Math.round(r.width),
    h: Math.round(r.height),
    radius: cs.borderRadius,
    text: el.textContent.trim(),
  };
}, findMusicPill.toString());
check('mobile pill exists', !!pill);
check('mobile pill fits viewport', pill.w <= 390, `w=${pill.w} vw=390`);
check('mobile pill is full-width bar', pill.w > 330, `w=${pill.w}`);
check('mobile pill has height', pill.h >= 32 && pill.h <= 48, `h=${pill.h}`);
// Firefox serialises a clamped border-radius as FLT_MAX rather than the clamped
// px value, so assert the radius reaches at least half the height.
check('mobile pill rounded', parseFloat(pill.radius) >= pill.h / 2, `${pill.radius} h=${pill.h}`);
check(
  'mobile pill shows track',
  /Blinding Lights/.test(pill.text || ''),
  pill.text?.slice(0, 60)
);

const overflow = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
check(
  'no horizontal overflow',
  overflow.scrollW <= overflow.clientW + 1,
  `${overflow.scrollW} vs ${overflow.clientW}`
);

const clipped = await page.evaluate(() => {
  const host = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
    /now playing|last played/i.test(e.textContent)
  );
  const el = host;
  const t = [...el.querySelectorAll('span')].find(
    (s) => getComputedStyle(s).overflowX === 'hidden' && s.textContent.includes('Blinding Lights')
  );
  return t ? { sw: t.scrollWidth, cw: t.clientWidth, clipped: t.scrollWidth > t.clientWidth } : null;
});
check('long track text truncates (no overflow)', clipped?.clipped === true, JSON.stringify(clipped));

const live = await page.evaluate(() => {
  const host = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
    /now playing|last played/i.test(e.textContent)
  );
  const el = host;
  const cs = getComputedStyle(el);
  return { color: cs.color, border: cs.borderTopColor };
});
check('live pill text is green', isGreenLike(live.color), live.color);
check('live pill border is green', isGreenLike(live.border), live.border);
check('light mode uses light green token', /rgb\(34,\s*197,\s*94\)/.test(live.color), live.color);

const art = await page.evaluate(() => {
  const host = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
    /now playing|last played/i.test(e.textContent)
  );
  const el = host;
  const bg = [...el.querySelectorAll('div')].find((d) =>
    getComputedStyle(d).backgroundImage.includes('url(')
  );
  if (!bg) return null;
  const cs = getComputedStyle(bg);
  return { filter: cs.filter, mask: cs.maskImage || cs.webkitMaskImage, scale: cs.scale };
});
check('backdrop art has blur', /blur/.test(art?.filter || ''), art?.filter);
// Full bleed, not a vignette: the artwork layer must not be masked away at the
// edges. Coverage is verified numerically further down.
check('backdrop art is not edge-masked', !/gradient/.test(art?.mask || ''), `mask=${art?.mask}`);
// Tailwind v4 emits the CSS `scale` property rather than `transform`.
check('backdrop art is scaled past edges', art?.scale && art.scale !== 'none', art?.scale);

const glass = await page.evaluate(() => {
  const host = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
    /now playing|last played/i.test(e.textContent)
  );
  const el = host;
  const g = [...el.querySelectorAll('div')].find((d) => getComputedStyle(d).backdropFilter.includes('blur'));
  return g ? getComputedStyle(g).backdropFilter : null;
});
check('glass layer present', !!glass, glass);

const eq = await page.evaluate(() => {
  const host = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
    /now playing|last played/i.test(e.textContent)
  );
  const el = host;
  const b = el.querySelector('span span');
  return b ? { n: getComputedStyle(b).animationName, h: b.getBoundingClientRect().height } : null;
});
check('equalizer animating', eq && eq.n !== 'none', JSON.stringify(eq));

// ── about card ─────────────────────────────────────────────────────
await page.goto(`${BASE}/#about`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));

const card = await page.evaluate(() => {
  const h = [...document.querySelectorAll('h3')].find((x) => /currently listening/i.test(x.textContent));
  const c = h?.nextElementSibling;
  if (!c) return null;
  const cs = getComputedStyle(c);
  const bg = [...c.querySelectorAll('div')].find((d) => getComputedStyle(d).backgroundImage.includes('url('));
  const g = [...c.querySelectorAll('div')].find((d) => getComputedStyle(d).backdropFilter.includes('blur'));
  const badge = [...c.querySelectorAll('span')].find((s) => /^(Live|Recent)$/i.test(s.textContent.trim()));
  const bcs = badge ? getComputedStyle(badge) : null;
  const img = c.querySelector('img');
  return {
    hasArt: !!bg,
    filter: bg ? getComputedStyle(bg).filter : null,
    mask: bg ? getComputedStyle(bg).maskImage || getComputedStyle(bg).webkitMaskImage : null,
    opacity: bg ? getComputedStyle(bg).opacity : null,
    glass: g ? getComputedStyle(g).backdropFilter : null,
    badge: badge ? badge.textContent.trim() : null,
    badgeColor: bcs?.color,
    badgeBg: bcs?.backgroundColor,
    shadow: cs.boxShadow,
    borderColor: cs.borderTopColor,
    coverRadius: img ? getComputedStyle(img).borderRadius : null,
    coverW: img ? img.getBoundingClientRect().width : null,
  };
});

check('about card has art', card?.hasArt);
check('about art heavily blurred (32px)', /blur\(32px\)/.test(card?.filter || ''), card?.filter);
check('about art saturating', /saturate/.test(card?.filter || ''));
check('about art is not edge-masked', !/gradient/.test(card?.mask || ''), `mask=${card?.mask}`);
check('about art visible enough', parseFloat(card?.opacity || 0) > 0.3, card?.opacity);
check('about card has glass', !!card?.glass, card?.glass);
check('about badge says Live', card?.badge === 'Live', card?.badge);
check('about badge is green', isGreenLike(card?.badgeColor), card?.badgeColor);
check('about badge has green tint bg', isGreenLike(card?.badgeBg), card?.badgeBg);
const glowLayers = (card?.shadow || '').split(/,(?![^()]*\))/).map((x) => x.trim());
check(
  'about card has green live glow',
  glowLayers.some((c) => isGreenLike(c)),
  `${glowLayers.length} layer(s): ${card?.shadow?.slice(0, 80)}`
);
check('about card border is green', isGreenLike(card?.borderColor), card?.borderColor);
check(
  'album cover rounded',
  card?.coverRadius && parseFloat(card.coverRadius) >= 8,
  JSON.stringify({ r: card?.coverRadius, w: card?.coverW })
);

// ── desktop sanity: pill stays compact ─────────────────────────────
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${BASE}/#home`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));

const desk = await page.evaluate(() => {
  const host = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
    /now playing|last played/i.test(e.textContent)
  );
  const el = host;
  const r = el.getBoundingClientRect();
  const label = [...el.querySelectorAll('span')].find((s) => /now playing/i.test(s.textContent));
  return { w: Math.round(r.width), labelVisible: label ? getComputedStyle(label).display !== 'none' : false };
});
check('desktop pill is compact', desk.w < 460, `w=${desk.w}`);
check('desktop shows separate label', desk.labelVisible);

// ── non-live must stay monochrome (green is reserved for "now") ────
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${BASE}/?state=recent#about`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));

const recent = await page.evaluate(() => {
  const h = [...document.querySelectorAll('h3')].find((x) => /currently listening/i.test(x.textContent));
  const c = h?.nextElementSibling;
  const badge = [...c.querySelectorAll('span')].find((s) => /^(Live|Recent)$/i.test(s.textContent.trim()));
  const cs = badge ? getComputedStyle(badge) : null;
  const card = getComputedStyle(c);
  // All sections stay mounted, so the home pill is reachable from #about too.
  const host = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
    /now playing|last played/i.test(e.textContent)
  );
  return {
    badge: badge ? badge.textContent.trim() : null,
    badgeColor: cs?.color,
    badgeBg: cs?.backgroundColor,
    cardBorder: card.borderTopColor,
    homeLabel: host ? host.textContent.replace(/\s+/g, ' ').trim() : '',
    homeColor: getComputedStyle(host?? host).color,
  };
});
check('non-live badge says Recent', recent.badge === 'Recent', recent.badge);
check('non-live badge is NOT green', !isGreenLike(recent.badgeColor), recent.badgeColor);
check('non-live badge bg is NOT green', !isGreenLike(recent.badgeBg), recent.badgeBg);
check('non-live card border is NOT green', !isGreenLike(recent.cardBorder), recent.cardBorder);
check('non-live pill labelled Last Played', /Last Played/.test(recent.homeLabel), recent.homeLabel.slice(0, 70));
check('non-live home pill is NOT green', !isGreenLike(recent.homeColor), recent.homeColor);

// ── dark mode keeps the live accent green (lighter token) ─────────
await page.goto(`${BASE}/?theme=dark#home`, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));

const dark = await page.evaluate(() => {
  const host = [...document.querySelectorAll('#home [role="status"]')].find((e) =>
    /now playing|last played/i.test(e.textContent)
  );
  const el = host;
  const cs = getComputedStyle(el);
  return { color: cs.color, border: cs.borderTopColor, isDark: document.documentElement.classList.contains('dark') };
});
check('dark class applied', dark.isDark);
check('dark mode live pill is green', isGreenLike(dark.color), dark.color);
check('dark mode live border is green', isGreenLike(dark.border), dark.border);
check('dark mode uses dark green token', /rgb\(74,\s*222,\s*128\)/.test(dark.color), dark.color);

/* ── pixel visibility ───────────────────────────────────────────────
   Asserting that the backdrop CSS *exists* is not the same as asserting the
   artwork is *visible* — an 85%-opaque tint over the art still satisfies every
   declaration check while showing none of it. So screenshot the region with and
   without artwork and require a real perceptual difference. */
async function measure(target, { art, theme }) {
  const p = await browser.newPage();
  installFetchStub(p);
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await p.evaluateOnNewDocument((t) => {
    try {
      localStorage.setItem('easyui-theme', t);
    } catch (e) {
      /* ignore */
    }
  }, theme);

  const q = `theme=${theme}&art=${art ? 1 : 0}#${target === 'about' ? 'about' : 'home'}`;
  await p.goto(`${BASE}/?${q}`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500));
  await p.evaluate((t) => {
    const el =
      t === 'about'
        ? [...document.querySelectorAll('h3')].find((x) => /currently listening/i.test(x.textContent))
            ?.nextElementSibling
        : [...document.querySelectorAll('#home [role="status"]')].find((e) =>
            /now playing|last played/i.test(e.textContent)
          );
    el?.scrollIntoView({ block: 'center' });
  }, target);
  await new Promise((r) => setTimeout(r, 900));

  const rect = await p.evaluate((t) => {
    const el =
      t === 'about'
        ? [...document.querySelectorAll('h3')].find((x) => /currently listening/i.test(x.textContent))
            ?.nextElementSibling
        : [...document.querySelectorAll('#home [role="status"]')].find((e) =>
            /now playing|last played/i.test(e.textContent)
          );
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  }, target);

  const png = decodePng(await p.screenshot());
  const strip = Math.max(2, Math.round(rect.h * 0.18));
  const out = {
    center: meanColor(png, rect.x, rect.y, rect.w, rect.h),
    left: meanColor(png, rect.x, rect.y, strip, rect.h),
    right: meanColor(png, rect.x + rect.w - strip, rect.y, strip, rect.h),
  };
  await p.close();
  return out;
}

for (const theme of ['light', 'dark']) {
  for (const target of ['about', 'home']) {
    const withArt = await measure(target, { art: true, theme });
    const without = await measure(target, { art: false, theme });
    const d = colorDistance(withArt.center, without.center);
    // Baseline before the glass fix measured 5.9 (about) / 8.7 (home) in dark
    // mode, which is imperceptible. Anything under 12 is effectively invisible.
    check(
      `${theme} ${target} artwork is visibly rendered`,
      d !== null && d >= 12,
      `delta=${d?.toFixed(1)} with=${withArt.center && `rgb(${withArt.center.r.toFixed(0)},${withArt.center.g.toFixed(0)},${withArt.center.b.toFixed(0)})`}`
    );
    // The artwork must reach both borders — an edge mask made it look like a
    // blotchy vignette rather than a cover.
    const dl = colorDistance(withArt.left, without.left);
    const dr = colorDistance(withArt.right, without.right);
    check(
      `${theme} ${target} artwork reaches the edges`,
      dl !== null && dr !== null && dl >= 4 && dr >= 4,
      `left=${dl?.toFixed(1)} right=${dr?.toFixed(1)}`
    );
  }
}

await browser.close();
console.log('PASS:\n' + ok.map((s) => '  ✓ ' + s).join('\n'));
if (fail.length) {
  console.log('\nFAIL:\n' + fail.map((s) => '  ✗ ' + s).join('\n'));
  process.exit(1);
}
console.log(`\n${ok.length}/${ok.length} checks passed`);