import puppeteer from 'puppeteer-core';

const FIREFOX = '/Applications/Firefox.app/Contents/MacOS/firefox';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173';

const browser = await puppeteer.launch({
  browser: 'firefox',
  executablePath: FIREFOX,
  headless: true,
  args: ['--width=1440', '--height=1000'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });

const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) =>
  logs.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText}`)
);
page.on('response', (r) => {
  if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`);
});

async function goto(hash) {
  await page.goto(`${BASE}/${hash}`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));
}

const probe = () =>
  page.evaluate(() => {
    const out = {};

    // The music pill is the [role=status] whose text mentions Now/Last Played.
    // (The timezone badge is also role=status, so match on the label text.)
    const pill = [...document.querySelectorAll('#home [role="status"]')].find((el) =>
      /now playing|last played/i.test(el.textContent)
    );
    out.musicPillExists = !!pill;
    out.musicPillText = pill ? pill.textContent.replace(/\s+/g, ' ').trim() : null;
    out.musicPillWidth = pill
      ? Math.round(pill.querySelector('div')?.getBoundingClientRect().width ?? 0)
      : 0;
    out.musicPillVisible = pill ? pill.getBoundingClientRect().height > 0 : false;

    const skills = document.querySelector('#skills');
    out.skillsSectionClass = skills ? skills.className : null;
    out.skillsHeading = !!document.querySelector('#skills-heading');
    out.skillsVisible = skills ? getComputedStyle(skills).display !== 'none' : false;

    const bars = [...document.querySelectorAll('#skills [role="progressbar"]')];
    out.barCount = bars.length;
    out.bars = bars.slice(0, 4).map((b) => {
      const fill = b.firstElementChild;
      return {
        label: b.getAttribute('aria-label'),
        ariaNow: b.getAttribute('aria-valuenow'),
        fillInline: fill ? fill.style.width || '(none)' : '(no fill)',
        fillComputed: fill ? getComputedStyle(fill).width : '(no fill)',
        trackH: getComputedStyle(b).height,
      };
    });

    const counters = [...document.querySelectorAll('#skills span.font-mono')];
    out.counters = counters.slice(0, 4).map((c) => c.textContent.trim());

    const active = document.querySelector('.page-section.active');
    out.activeSectionId = active ? active.id : null;
    out.renderedSections = document.querySelectorAll('.page-section').length;
    return out;
  });

console.log('══════ HOME ══════');
await goto('');
console.log(JSON.stringify(await probe(), null, 2));

console.log('\n══════ SKILLS (deep link) ══════');
await goto('#skills');
console.log(JSON.stringify(await probe(), null, 2));

console.log('\n══════ NAVIGATE home → skills via pill ══════');
await goto('');
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('[role="tab"], nav button')].find((b) =>
    /skills/i.test(b.textContent)
  );
  btn?.click();
});
await new Promise((r) => setTimeout(r, 2000));
console.log(JSON.stringify(await probe(), null, 2));

console.log('\n══════ CONSOLE / NETWORK ══════');
const noisy = (l) =>
  !/Download the React DevTools|\[vite\] (connect|connected)|favicon\.ico/.test(l);
const filtered = logs.filter(noisy);
console.log(
  filtered.length ? filtered.join('\n') : '(clean — no console errors, no failed requests)'
);

await browser.close();
