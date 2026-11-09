// Cuts the single coin and note pictures of the "Kto ma więcej?" card out of the author's mockup sheets
// (`context/ideas/waluty/makieta-eur.jpg`, `makieta-usd.jpg`) into transparent, 256-colour PNGs in `public/money/`.
//
// Needs `sharp`, which is not a dependency of the project: `npm i --no-save sharp`, then `node scripts/money-cut-images.mjs`.
//
// Method: the sheets are JPGs on a beige background, every piece inside a white sticker margin and a dashed cut line.
// Light pixels, plus the small dark specks of the dashes, are flooded from the border; what the flood does not reach is
// a piece (its black outline is closed, so the inside stays). Each piece is a connected group of those pixels; pieces
// are told apart by size and place on the sheet (see SHEETS).
import { Buffer } from "node:buffer";
import { mkdirSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import sharp from "sharp";

const OUT = fileURLToPath(new URL("../public/money/", import.meta.url));
const COIN_WIDTH = 256;
const NOTE_WIDTH = 480;
const LIGHT = 205; // a pixel whose darkest channel is above this is background or sticker margin
const SPECK = 600; // dark groups smaller than this are dashes of the cut line
const MIN_PIECE = 8000;

/** Which piece of the sheet becomes which file: notes in reading order, large coins from the left. */
const SHEETS = [
  {
    source: "makieta-eur.jpg",
    suffix: "eur",
    notes: [5, 10, 20, 50, 100, 200],
    usedNotes: [5, 10, 20, 50, 100],
    coins: [2, 1, 0.5],
    usedCoins: [2, 1],
  },
  {
    source: "makieta-usd.jpg",
    suffix: "usd",
    notes: [1, 5, 10, 20, 50, 100],
    usedNotes: [1, 5, 10, 20, 50, 100],
    coins: [1, 0.5, 0.25],
    usedCoins: [],
  },
];

async function load(file) {
  const path = fileURLToPath(new URL(`../context/ideas/waluty/${file}`, import.meta.url));
  const { data, info } = await sharp(path).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];

function components(mask, width, height) {
  const label = new Int32Array(width * height).fill(-1);
  const groups = [];
  const stack = [];
  for (let start = 0; start < width * height; start += 1) {
    if (!mask[start] || label[start] !== -1) continue;
    const id = groups.length;
    const group = { id, area: 0, x0: width, y0: height, x1: 0, y1: 0, sumX: 0, sumY: 0 };
    label[start] = id;
    stack.push(start);
    while (stack.length > 0) {
      const index = stack.pop();
      const x = index % width;
      const y = (index - x) / width;
      group.area += 1;
      group.x0 = Math.min(group.x0, x);
      group.x1 = Math.max(group.x1, x);
      group.y0 = Math.min(group.y0, y);
      group.y1 = Math.max(group.y1, y);
      group.sumX += x;
      group.sumY += y;
      for (const [dx, dy] of NEIGHBOURS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (mask[next] && label[next] === -1) {
          label[next] = id;
          stack.push(next);
        }
      }
    }
    groups.push(group);
  }
  return { label, groups };
}

function findPieces({ data, width, height }) {
  const size = width * height;
  const light = new Uint8Array(size);
  for (let i = 0; i < size; i += 1) {
    light[i] = Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) > LIGHT ? 1 : 0;
  }
  const dark = light.map((value) => 1 - value);
  const darkGroups = components(dark, width, height);
  const passable = new Uint8Array(size);
  for (let i = 0; i < size; i += 1) {
    passable[i] = light[i] === 1 || darkGroups.groups[darkGroups.label[i]].area < SPECK ? 1 : 0;
  }
  // Flood the outside from every passable pixel on the border.
  const outside = new Uint8Array(size);
  const stack = [];
  const push = (index) => {
    if (passable[index] && !outside[index]) {
      outside[index] = 1;
      stack.push(index);
    }
  };
  for (let x = 0; x < width; x += 1) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (stack.length > 0) {
    const index = stack.pop();
    const x = index % width;
    if (x > 0) push(index - 1);
    if (x < width - 1) push(index + 1);
    if (index >= width) push(index - width);
    if (index < size - width) push(index + width);
  }
  const inside = outside.map((value) => 1 - value);
  const { label, groups } = components(inside, width, height);
  return { label, pieces: groups.filter((group) => group.area >= MIN_PIECE) };
}

async function cut({ data, width }, label, piece, targetWidth, file) {
  const w = piece.x1 - piece.x0 + 1;
  const h = piece.y1 - piece.y0 + 1;
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const source = (y + piece.y0) * width + (x + piece.x0);
      const target = (y * w + x) * 4;
      rgba[target] = data[source * 3];
      rgba[target + 1] = data[source * 3 + 1];
      rgba[target + 2] = data[source * 3 + 2];
      rgba[target + 3] = label[source] === piece.id ? 255 : 0;
    }
  }
  // Erode the light fringe left by the anti-aliased edge: an opaque light pixel that touches a transparent one.
  const alphaAt = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : rgba[(y * w + x) * 4 + 3]);
  const fringe = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const index = (y * w + x) * 4;
      if (rgba[index + 3] === 0) continue;
      const edge =
        alphaAt(x - 1, y) === 0 || alphaAt(x + 1, y) === 0 || alphaAt(x, y - 1) === 0 || alphaAt(x, y + 1) === 0;
      if (edge && Math.min(rgba[index], rgba[index + 1], rgba[index + 2]) > 150) fringe.push(index);
    }
  }
  for (const index of fringe) rgba[index + 3] = 0;
  mkdirSync(OUT, { recursive: true });
  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .resize({ width: targetWidth, kernel: "lanczos3" })
    .png({ palette: true, colours: 256, effort: 10 })
    .toFile(`${OUT}${file}`);
  return `${w}x${h}`;
}

for (const sheet of SHEETS) {
  const image = await load(sheet.source);
  const { label, pieces } = findPieces(image);
  const ratio = (piece) => (piece.x1 - piece.x0) / (piece.y1 - piece.y0);
  const notes = pieces.filter((piece) => ratio(piece) > 1.6);
  const coins = pieces.filter((piece) => ratio(piece) <= 1.6 && piece.x1 - piece.x0 > 300);
  const rowOf = (piece) => (piece.sumY / piece.area < image.height * 0.31 ? 0 : 1);
  notes.sort((a, b) => rowOf(a) - rowOf(b) || a.sumX / a.area - b.sumX / b.area);
  coins.sort((a, b) => a.sumX / a.area - b.sumX / b.area);
  if (notes.length !== sheet.notes.length || coins.length !== sheet.coins.length) {
    throw new Error(
      `${sheet.source}: found ${notes.length} notes and ${coins.length} large coins, expected ${sheet.notes.length} and ${sheet.coins.length}`,
    );
  }
  for (const [index, value] of sheet.notes.entries()) {
    if (sheet.usedNotes.includes(value)) {
      console.log(
        sheet.suffix,
        "note",
        value,
        await cut(image, label, notes[index], NOTE_WIDTH, `${value}${sheet.suffix}.png`),
      );
    }
  }
  for (const [index, value] of sheet.coins.entries()) {
    if (sheet.usedCoins.includes(value)) {
      console.log(
        sheet.suffix,
        "coin",
        value,
        await cut(image, label, coins[index], COIN_WIDTH, `${value}${sheet.suffix}.png`),
      );
    }
  }
}
