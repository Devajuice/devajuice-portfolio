async function fetchFont(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const [regularBuf, boldBuf] = await Promise.all([
    fetchFont(
      "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8Cm8qZG40F9JadbnoEwA_JxhTg.ttf",
    ),
    fetchFont(
      "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8Cl0qZG40F9JadbnoEwA_JxhTg.ttf",
    ),
  ]);

  if (!regularBuf || !boldBuf) {
    res.status(500).send("Font fetch failed");
    return;
  }

  const { Resvg } = await import("@resvg/resvg-js");

  // Absolute minimal SVG — red bg, pure white text, no opacity, no gradients
  const svg = `<svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="200" fill="red"/>
    <text x="40" y="120" font-family="DM Sans" font-size="80" font-weight="700" fill="white">Hello World</text>
  </svg>`;

  const resvg = new Resvg(svg, {
    fontBuffers: [regularBuf, boldBuf],
    defaultFontFamily: "DM Sans",
  });
  const png = resvg.render().asPng();

  res.setHeader("Content-Type", "image/png");
  res.send(Buffer.from(png));
}
