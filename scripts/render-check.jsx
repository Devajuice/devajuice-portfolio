import React from 'react';
import { readFileSync, readdirSync } from 'node:fs';
import { renderToString } from 'react-dom/server';

// Minimal globals so modules that touch the DOM at import/render time don't explode
globalThis.window = globalThis.window ?? {
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  addEventListener() {},
  removeEventListener() {},
  devicePixelRatio: 1,
  AudioContext: undefined,
  location: { hash: '' },
  scrollTo() {},
};
globalThis.localStorage = globalThis.localStorage ?? {
  _v: {},
  getItem(k) {
    return this._v[k] ?? null;
  },
  setItem(k, val) {
    this._v[k] = String(val);
  },
  removeItem(k) {
    delete this._v[k];
  },
};
globalThis.document = globalThis.document ?? {
  documentElement: { style: {} },
  createElement: () => ({ getContext: () => null, width: 0, height: 0, style: {} }),
};
globalThis.navigator ??= { userAgent: 'node' };

// Framer Motion uses useLayoutEffect, which React warns about during SSR.
// This app is client-only; we SSR purely to catch render crashes, so silence
// that specific noise and let genuine errors through.
const realError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('useLayoutEffect does nothing on the server')) {
    return;
  }
  realError(...args);
};
globalThis.ResizeObserver = globalThis.ResizeObserver ?? class {
  observe() {}
  disconnect() {}
};
globalThis.requestAnimationFrame = globalThis.requestAnimationFrame ?? (() => 0);
globalThis.cancelAnimationFrame = globalThis.cancelAnimationFrame ?? (() => {});
globalThis.Intl = Intl;

const results = [];

async function check(name, fn) {
  try {
    const html = await fn();
    results.push({ name, ok: true, len: html.length, snippet: html.slice(0, 110).replace(/\n/g, ' ') });
  } catch (e) {
    results.push({ name, ok: false, err: e.message });
  }
}

const { default: PillNavigation } = await import('../src/components/ui/PillNavigation.jsx');
const { default: MagneticButton } = await import('../src/components/ui/MagneticButton.jsx');
const { default: Button } = await import('../src/components/ui/Button.jsx');
const { default: SpotlightCard } = await import('../src/components/ui/SpotlightCard.jsx');
const { default: SmoothAccordion } = await import('../src/components/ui/SmoothAccordion.jsx');
const { default: DotShader } = await import('../src/components/ui/DotShader.jsx');
const { default: Navigation } = await import('../src/components/Navigation.jsx');
const { default: HomeSection } = await import('../src/components/HomeSection.jsx');
const { default: AboutSection } = await import('../src/components/AboutSection.jsx');
const { default: ProjectsSection } = await import('../src/components/ProjectsSection.jsx');
const { default: SkillsSection } = await import('../src/components/SkillsSection.jsx');
const { default: HobbiesSection } = await import('../src/components/HobbiesSection.jsx');
const { default: ContactSection } = await import('../src/components/ContactSection.jsx');
const { default: Footer } = await import('../src/components/Footer.jsx');
const { ToastProvider } = await import('../src/components/Toast.jsx');
const { default: EasterEgg } = await import('../src/components/EasterEgg.jsx');
const { default: KeyboardShortcuts } = await import('../src/components/KeyboardShortcuts.jsx');

const musicData = {
  isLive: true,
  name: 'Midnight City',
  artist: 'M83',
  album: 'Hurry Up, We’re Dreaming',
  art: 'https://example.com/art.jpg',
};

const ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'code', label: 'Code', children: [{ id: 'react', label: 'React' }] },
];

await check('PillNavigation', () =>
  renderToString(<PillNavigation items={ITEMS} value="home" onChange={() => {}} />)
);
await check('PillNavigation (with submenu active)', () =>
  renderToString(<PillNavigation items={ITEMS} value="code" onChange={() => {}} />)
);
await check('MagneticButton', () =>
  renderToString(
    <MagneticButton>
      <span>Click</span>
    </MagneticButton>
  )
);
await check('MagneticButton as anchor', () =>
  renderToString(
    <MagneticButton as="a" href="/x.pdf" download="x.pdf">
      Resume
    </MagneticButton>
  )
);
await check('Button (default)', () => renderToString(<Button>Send</Button>));
await check('Button (loading)', () => renderToString(<Button isLoading loadingText="Sending…">Send</Button>));
await check('SpotlightCard', () => renderToString(<SpotlightCard>Body</SpotlightCard>));
await check('SmoothAccordion', () =>
  renderToString(
    <SmoothAccordion
      allowMultiple
      defaultOpen={['a']}
      items={[
        { id: 'a', title: 'One', subtitle: 'sub', content: 'Body one' },
        { id: 'b', title: 'Two', content: 'Body two' },
      ]}
    />
  )
);
await check('DotShader', () => renderToString(<DotShader className="fixed inset-0" />));
await check('Navigation', () => renderToString(<Navigation activeSection="home" onNavigate={() => {}} />));
await check('HomeSection', () => renderToString(<HomeSection onNavigate={() => {}} musicData={musicData} />));
await check('HomeSection (music loading)', () => renderToString(<HomeSection onNavigate={() => {}} musicData={null} />));
await check('AboutSection', () => renderToString(<AboutSection musicData={musicData} />));
await check('ProjectsSection', () => renderToString(<ProjectsSection />));
await check('SkillsSection', () => renderToString(<SkillsSection isActive />));
await check('HobbiesSection', () => renderToString(<HobbiesSection />));
await check('ContactSection', () =>
  renderToString(
    <ToastProvider>
      <ContactSection />
    </ToastProvider>
  )
);
await check('Footer', () => renderToString(<Footer />));
await check('ToastProvider', () => renderToString(<ToastProvider>App</ToastProvider>));
await check('EasterEgg (open)', () => renderToString(<EasterEgg open onClose={() => {}} />));
await check('KeyboardShortcuts (open)', () =>
  renderToString(<KeyboardShortcuts open onClose={() => {}} activeSection="skills" />)
);

// ── Static 404 page: verify it no longer depends on the deleted design system
await check('public/404.html', () => {
  const html = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
  if (/global\.css/.test(html)) throw new Error('still references the removed global.css');
  if (!/href="\/404\.css"/.test(html)) throw new Error('does not link /404.css');
  if (!/<\/html>\s*$/.test(html)) throw new Error('unterminated document');
  return html;
});
await check('public/404.css', () => {
  const css = readFileSync(new URL('../public/404.css', import.meta.url), 'utf8');
  for (const token of ['--color-bg', '.dark', '--ease-out', 'prefers-reduced-motion']) {
    if (!css.includes(token)) throw new Error(`missing ${token}`);
  }
  // Every var(--x) must have a matching declaration, or it silently resolves to nothing.
  for (const used of new Set(css.match(/var\((--[a-z-]+)\)/g) ?? [])) {
    const name = used.slice(4, -1);
    if (!css.includes(`${name}:`)) throw new Error(`undeclared custom property ${name}`);
  }
  return css;
});

// ── Built CSS assertions
// Tailwind only emits a custom utility when its name appears as a complete
// literal in source, so `className={`floating-btn${x}`}` silently drops the base
// rule and renders the element unstyled. Assert the built CSS contains them.
await check('built CSS contains custom utilities', () => {
  const dist = new URL('../dist/assets/', import.meta.url);
  const files = readdirSync(dist).filter((f) => f.endsWith('.css'));
  if (!files.length) throw new Error('no built CSS found - run `npm run build` first');
  const css = readFileSync(new URL(files[0], dist), 'utf8');
  const required = [
    '.section-heading',
    '.floating-btn',
    '.floating-btn:hover',
    '.floating-btn.visible',
    '.kbd-hint-badge',
    '.kbd-hint-badge kbd',
  ];
  const missing = required.filter((sel) => !css.includes(sel));
  if (missing.length) throw new Error(`not emitted: ${missing.join(', ')}`);
  return css;
});

// ── DotShader colours must be theme-aware, otherwise the background is
// invisible in dark mode (dark dots on a dark surface).
await check('DotShader theme-aware colours', () => {
  const src = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  if (!/isDark \? 'rgba\(242, 242, 243/.test(src)) {
    throw new Error('DotShader dotColor/accentColor are not derived from isDark');
  }
  if (/dotColor="rgba\(10, 10, 10/.test(src)) {
    throw new Error('DotShader dotColor is still a hardcoded light-theme value');
  }
  return src;
});

// ── The Last.fm API key must never reach the client bundle.
// Vite inlines any VITE_-prefixed env var into the build, so a key read via
// import.meta.env.VITE_LASTFM_API_KEY ships in plaintext even when unused.
await check('no API key in built bundle', () => {
  const clientDir = new URL('../src/', import.meta.url);
  const offenders = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = new URL(e.name + (e.isDirectory() ? '/' : ''), dir);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|jsx)$/.test(e.name)) {
        const src = readFileSync(p, 'utf8');
        if (/import\.meta\.env\.[A-Z_]*(API_KEY|SECRET|TOKEN|PASSWORD)/.test(src)) {
          offenders.push(e.name);
        }
      }
    }
  };
  walk(clientDir);
  if (offenders.length) {
    throw new Error(`reads a secret from import.meta.env: ${offenders.join(', ')}`);
  }
  // The client must not call Last.fm directly either.
  const lastfm = readFileSync(new URL('../src/utils/lastfm.js', import.meta.url), 'utf8');
  if (lastfm.includes('ws.audioscrobbler.com')) {
    throw new Error('src/utils/lastfm.js calls Last.fm directly — go through /api/nowplaying');
  }
  return 'ok';
});

let failed = 0;
for (const r of results) {
  if (r.ok) {
    console.log(`  PASS  ${r.name.padEnd(34)} ${String(r.len).padStart(6)}b  ${r.snippet}`);
  } else {
    failed++;
    console.log(`  FAIL  ${r.name.padEnd(34)} ${r.err}`);
  }
}
console.log(`\n${results.length - failed}/${results.length} render checks passed`);
process.exit(failed ? 1 : 0);