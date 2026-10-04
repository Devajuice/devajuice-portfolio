import puppeteer from 'puppeteer-core';

const FIREFOX = '/Applications/Firefox.app/Contents/MacOS/firefox';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173';

async function run(label, lastfmBody, { status = 200 } = {}) {
  const browser = await puppeteer.launch({
    browser: 'firefox',
    executablePath: FIREFOX,
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  // Stub fetch before any app code runs so both the dev (audioscrobbler) and
  // prod (/api/nowplaying) code paths are covered.
  await page.evaluateOnNewDocument((body, httpStatus) => {
    const real = window.fetch.bind(window);
    window.fetch = (url, opts) => {
      const u = String(url);
      if (u.includes('audioscrobbler') || u.includes('/api/nowplaying')) {
        if (!body) return Promise.reject(new Error('stubbed network failure'));
        return Promise.resolve(
          new Response(body, {
            status: httpStatus,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      // iTunes art lookups: 404 so no external requests are made.
      if (u.includes('itunes')) return Promise.resolve(new Response('{}', { status: 404 }));
      return real(url, opts);
    };
  }, lastfmBody, status);

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));

  const info = await page.evaluate(() => {
    const pill = [...document.querySelectorAll('#home [role="status"]')].find((el) =>
      /now playing|last played/i.test(el.textContent)
    );
    if (!pill) return { exists: false };
    // The pill carries role="status" itself — there is no inner wrapper to measure.
    const box = pill;
    const r = box.getBoundingClientRect();
    return {
      exists: true,
      text: pill.textContent.replace(/\s+/g, ' ').trim(),
      width: Math.round(r.width),
      height: Math.round(r.height),
      empty: box.textContent.replace(/\s+/g, ' ').trim().length < 12,
    };
  });

  console.log(`${label.padEnd(22)} ${JSON.stringify(info)}`);
  await browser.close();
  return info;
}

const LIVE_BODY = JSON.stringify({
  recenttracks: {
    track: [
      {
        '@attr': { nowplaying: 'true' },
        name: 'Blinding Lights',
        artist: { name: 'The Weeknd' },
        album: { '#text': 'After Hours' },
        image: [{ '#text': 'https://example.com/art.png' }],
      },
    ],
  },
});

const EMPTY_BODY = JSON.stringify({ recenttracks: { track: [] } });

const results = {};
results.live = await run('live track', LIVE_BODY);
results.empty = await run('no recent tracks', EMPTY_BODY);
results.failed = await run('request failed', null);

const bad = Object.entries(results).filter(
  ([, v]) => !v.exists || v.empty || v.width < 60 || v.height < 10
);
console.log(
  bad.length
    ? `\nFAIL: degenerate pill in ${bad.map(([k]) => k).join(', ')}`
    : '\nPASS: all three music-pill states render a visible, non-empty pill'
);
process.exit(bad.length ? 1 : 0);
