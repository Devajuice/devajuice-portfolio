import resvgWasm from "../node_modules/@resvg/resvg-wasm/index_bg.wasm";
import { Resvg, initWasm } from "@resvg/resvg-wasm";

export const config = { runtime: "edge" };

let ready = false;

export default async function handler(req) {
  if (!ready) {
    await initWasm(resvgWasm);
    ready = true;
  }

  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Devajith";
  const subtitle =
    searchParams.get("subtitle") || "Student · Developer · Gamer";

  // Fetch DM Sans directly from gstatic — no local files needed
  const [regularRes, boldRes] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8Cm8qZG40F9JadbnoEwA_JxhTg.ttf",
    ),
    fetch(
      "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8Cl0qZG40F9JadbnoEwA_JxhTg.ttf",
    ),
  ]);

  const [regularData, boldData] = await Promise.all([
    regularRes.arrayBuffer(),
    boldRes.arrayBuffer(),
  ]);

  const regularB64 = btoa(String.fromCharCode(...new Uint8Array(regularData)));
  const boldB64 = btoa(String.fromCharCode(...new Uint8Array(boldData)));

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @font-face { font-family: 'DMSans'; src: url('data:font/ttf;base64,${regularB64}'); font-weight: 400; }
        @font-face { font-family: 'DMSans'; src: url('data:font/ttf;base64,${boldB64}'); font-weight: 700; }
      </style>
      <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#60a5fa"/>
        <stop offset="35%"  stop-color="#3b82f6"/>
        <stop offset="70%"  stop-color="#818cf8"/>
        <stop offset="100%" stop-color="#a78bfa"/>
      </linearGradient>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#0a0a0a"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
      <radialGradient id="glow1" cx="85%" cy="10%" r="45%">
        <stop offset="0%"   stop-color="#3b82f6" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="10%" cy="90%" r="40%">
        <stop offset="0%"   stop-color="#818cf8" stop-opacity="0.13"/>
        <stop offset="100%" stop-color="#818cf8" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>

    <rect width="1200" height="630" fill="url(#bgGrad)"/>
    <rect width="1200" height="630" fill="url(#glow1)"/>
    <rect width="1200" height="630" fill="url(#glow2)"/>
    <rect width="1200" height="630" fill="url(#grid)"/>

    <!-- Logo box -->
    <rect x="80" y="48" width="36" height="36" rx="8"
          fill="none" stroke="rgba(59,130,246,0.6)" stroke-width="1.5"/>
    <text x="98" y="71" text-anchor="middle"
          font-family="DMSans" font-size="13" font-weight="700" fill="#3b82f6">&lt;/&gt;</text>

    <!-- Domain -->
    <text x="128" y="72" font-family="DMSans" font-size="18" font-weight="400"
          fill="rgba(255,255,255,0.45)">devajuice.vercel.app</text>

    <!-- Available badge -->
    <rect x="80" y="460" width="198" height="36" rx="18"
          fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <circle cx="104" cy="478" r="5" fill="#22c55e"/>
    <text x="118" y="483" font-family="DMSans" font-size="15" font-weight="400"
          fill="rgba(255,255,255,0.7)">Available for work</text>

    <!-- Title -->
    <text x="80" y="560" font-family="DMSans" font-size="96" font-weight="700"
          letter-spacing="-2" fill="url(#titleGrad)">${escapeXml(title)}</text>

    <!-- Subtitle -->
    <text x="80" y="600" font-family="DMSans" font-size="26" font-weight="400"
          fill="rgba(255,255,255,0.5)">${escapeXml(subtitle)}</text>

    ${renderTags(["Python", "JavaScript", "React", "Data Analysis"])}
  </svg>`;

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderTags(tags) {
  const h = 32,
    py = 16,
    fs = 14,
    cw = fs * 0.62,
    gap = 10;
  let x = 1120,
    out = "";
  for (let i = tags.length - 1; i >= 0; i--) {
    const w = Math.ceil(tags[i].length * cw) + py * 2;
    x -= w;
    out += `<rect x="${x}" y="526" width="${w}" height="${h}" rx="8"
      fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.25)" stroke-width="1"/>
    <text x="${x + py}" y="547" font-family="DMSans" font-size="${fs}" font-weight="700"
      fill="#60a5fa">${escapeXml(tags[i])}</text>`;
    x -= gap;
  }
  return out;
}
