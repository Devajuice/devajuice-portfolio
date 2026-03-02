import { Resvg } from "@resvg/resvg-js";

export default async function handler(req, res) {
  const svg = `...your svg...`;
  const resvg = new Resvg(svg);
  const png = resvg.render().asPng();

  res.setHeader("Content-Type", "image/png");
  res.send(Buffer.from(png));
}
