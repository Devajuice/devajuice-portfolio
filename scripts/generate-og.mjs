import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import fs from 'fs';

const out = resolve('public/og-image-v2.png');
const profile = pathToFileURL(resolve('public/assets/images/profile.webp')).href;
const fontPath = resolve('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2');
const fontData = fs.existsSync(fontPath) ? fs.readFileSync(fontPath).toString('base64') : '';

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  ${fontData ? `@font-face{font-family:'Geist Mono';src:url(data:font/woff2;base64,${fontData}) format('woff2');font-weight:100 900;font-style:normal;}` : ''}
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:1200px;height:630px;overflow:hidden;font-family:'Geist Mono',ui-monospace,monospace;background:#fbfbfa;color:#37352f}
  .bg{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(55,53,47,.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(55,53,47,.05) 1px,transparent 1px);background-size:32px 32px}
  .wrap{position:relative;height:100%;display:flex;align-items:center;justify-content:space-between;padding:64px 72px;gap:48px}
  .left{max-width:700px}
  .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid #e9e9e7;border-radius:999px;background:#fff;font-size:18px;color:#787774;margin-bottom:28px}
  .dot{width:10px;height:10px;border-radius:50%;background:#2eaadc}
  h1{font-size:64px;line-height:1.05;letter-spacing:-0.03em;font-weight:600;margin-bottom:18px}
  .role{font-size:28px;color:#5f5e5b;margin-bottom:20px}
  .desc{font-size:22px;line-height:1.5;color:#787774;max-width:680px}
  .url{margin-top:32px;font-size:20px;color:#9b9a97}
  .avatar{width:280px;height:280px;border-radius:999px;object-fit:cover;object-position:center 20%;border:1px solid #e9e9e7;box-shadow:0 8px 24px rgba(15,15,15,.06);background:#fff;flex-shrink:0}
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="wrap">
    <div class="left">
      <div class="badge"><span class="dot"></span>Available for work</div>
      <h1>Devajith</h1>
      <div class="role">Student · Developer · Data Analyst</div>
      <div class="desc">Building web projects and data-driven solutions with curiosity, clarity, and care.</div>
      <div class="url">devajuice.com</div>
    </div>
    <img class="avatar" src="${profile}" />
  </div>
</body>
</html>`;

const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.screenshot({ path: out, type: 'png' });
await browser.close();
console.log('ok', out);
