// Minimal PNG reader — enough to sample pixels from a Puppeteer screenshot so
// "is the album art actually visible?" can be answered numerically instead of by
// asserting that a CSS declaration exists (which passes even when the layer is
// 85% opaque and the art is invisible).
//
// Supports 8-bit truecolour with or without alpha, non-interlaced — which is
// what Firefox produces for page screenshots.

import { inflateSync } from 'node:zlib';

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/** Decode a PNG buffer into { width, height, channels, data }. */
export function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');

  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat = [];

  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const type = buffer.toString('ascii', pos + 4, pos + 8);
    const data = buffer.subarray(pos + 8, pos + 8 + len);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len; // length + type + data + crc
  }

  if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);
  if (interlace !== 0) throw new Error('interlaced PNG unsupported');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported colour type ${colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);

  // Undo per-scanline filtering.
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    const cur = out.subarray(y * stride, (y + 1) * stride);

    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      switch (filter) {
        case 0:
          break;
        case 1:
          v += a;
          break;
        case 2:
          v += b;
          break;
        case 3:
          v += (a + b) >> 1;
          break;
        case 4:
          v += paeth(a, b, c);
          break;
        default:
          throw new Error(`bad filter ${filter}`);
      }
      cur[x] = v & 0xff;
    }
  }

  return { width, height, channels, data: out };
}

/** Mean RGB of a rectangle, ignoring fully transparent pixels. */
export function meanColor(png, x0, y0, w, h) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
      const i = y * png.width * png.channels + x * png.channels;
      const alpha = png.channels === 4 ? png.data[i + 3] : png.channels === 2 ? png.data[i + 1] : 255;
      if (alpha < 8) continue;
      r += png.data[i];
      g += png.data[i + 1];
      b += png.data[i + 2];
      n++;
    }
  }
  return n ? { r: r / n, g: g / n, b: b / n, n } : null;
}

/** Perceived colour distance (0–255 scale). ~0 means indistinguishable. */
export function colorDistance(a, b) {
  if (!a || !b) return null;
  // Weighted euclidean; cheap approximation of perceptual difference.
  const rm = (a.r - b.r) * 0.299;
  const gm = (a.g - b.g) * 0.587;
  const bm = (a.b - b.b) * 0.114;
  return Math.sqrt(rm * rm + gm * gm + bm * bm);
}