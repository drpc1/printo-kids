// Fits the penguin to the frame of the other characters (outline y 96-415 of 512, centered), as in S-39, and prints
// contentLeft / contentRight in /1024. Usage (repo root): node context/changes/seasons-objects-characters/normalize-pingwin.mts <source.png> (node --experimental-strip-types)
import sharp from "sharp";

const src = process.argv[2];
const out = "context/changes/seasons-objects-characters/normalized/pingwin.png";

async function bounds(input: string) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, x1 = -1, y0 = info.height, y1 = -1;
  for (let y = 0; y < info.height; y += 1)
    for (let x = 0; x < info.width; x += 1)
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
  return { x0, x1, y0, y1, w: info.width, h: info.height };
}

const b = await bounds(src);
console.log("source", b);
const crop = await sharp(src).extract({ left: b.x0, top: b.y0, width: b.x1 - b.x0 + 1, height: b.y1 - b.y0 + 1 }).toBuffer();
const height = 320;
const width = Math.round(((b.x1 - b.x0 + 1) * height) / (b.y1 - b.y0 + 1));
const scaled = await sharp(crop).resize(width, height).toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: scaled, left: Math.round((512 - width) / 2), top: 96 }])
  .png()
  .toFile(out);
const n = await bounds(out);
console.log("normalized", n, "contentLeft", n.x0 * 2, "/1024 contentRight", (511 - n.x1) * 2, "/1024");
