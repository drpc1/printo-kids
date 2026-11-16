// S-39 makieta: dopasowanie kadru nowych postaci do jedenastu istniejących i porównanie w jednym rzędzie.
// Istniejące postacie mają na 512 px obrys od y 96 do y 415 (320 px) i są wyśrodkowane w poziomie.
// Uruchom z katalogu repo: node context/changes/christmas-characters/mockup-lineup.mts
// Wynik: normalized/<id>.png (512, ten sam kadr) i mockup-lineup.png. Pliki w public/ zostają nietknięte.
import { mkdirSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import sharp from "sharp";

const HERE = fileURLToPath(new URL("./", import.meta.url));
const CHARS = fileURLToPath(new URL("../../../public/characters/", import.meta.url));
const NEW = ["mikolaj", "renifer", "balwanek"];
const OLD = ["dinozaur", "jednorozec", "kot", "pies", "rakieta", "robot", "samochodzik", "smok", "strazak", "syrenka", "wrozka"];
const SIZE = 512;
const TOP = 96;
const HEIGHT = 320;

async function bbox(input: string | Buffer) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = Infinity, maxX = -1, minY = Infinity, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 16) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function normalize(id: string): Promise<Buffer> {
  const src = `${CHARS}${id}.webp`;
  const box = await bbox(src);
  const scale = HEIGHT / box.height;
  const w = Math.round(box.width * scale);
  const figure = await sharp(src).extract(box).resize(w, HEIGHT).png().toBuffer();
  const out = await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: figure, left: Math.round((SIZE - w) / 2), top: TOP }])
    .png()
    .toBuffer();
  await sharp(out).toFile(`${HERE}normalized/${id}.png`);
  const after = await bbox(out);
  console.log(`${id}: przed y ${box.top}-${box.top + box.height - 1}, po y ${after.top}-${after.top + after.height - 1}, contentLeft ${Math.round((after.left / SIZE) * 1024)}/1024, contentRight ${Math.round(((SIZE - after.left - after.width) / SIZE) * 1024)}/1024`);
  return out;
}

mkdirSync(`${HERE}normalized`, { recursive: true });
const normalized: Record<string, Buffer> = {};
for (const id of NEW) normalized[id] = await normalize(id);

// Rząd: strażak, kot, wróżka jako wzór, potem nowe. Wiersz 1: pliki od użytkowniczki, wiersz 2: po dopasowaniu.
// Do tego rząd 40 px jak w liście postaci.
const CELL = 200;
const ref = ["strazak", "kot", "wrozka"];
const cols = ref.length + NEW.length;
const LIST = 40;
const listIds = [...OLD, ...NEW];
const width = cols * CELL;
const height = 2 * CELL + 40 + LIST + 20;
const layers: { input: Buffer; left: number; top: number }[] = [];
const place = async (input: string | Buffer, col: number, row: number) => {
  layers.push({ input: await sharp(input).resize(CELL, CELL).png().toBuffer(), left: col * CELL, top: row * CELL });
};
for (const [i, id] of ref.entries()) {
  await place(`${CHARS}${id}.webp`, i, 0);
  await place(`${CHARS}${id}.webp`, i, 1);
}
for (const [i, id] of NEW.entries()) {
  await place(`${CHARS}${id}.webp`, ref.length + i, 0);
  await place(normalized[id], ref.length + i, 1);
}
const step = Math.floor(width / listIds.length);
for (const [i, id] of listIds.entries()) {
  const input = NEW.includes(id) ? normalized[id] : `${CHARS}${id}.webp`;
  layers.push({ input: await sharp(input).resize(LIST, LIST).png().toBuffer(), left: i * step + Math.floor((step - LIST) / 2), top: 2 * CELL + 40 });
}
// Linie kadru (y 96 i 415 na 512) w obu rzędach dużych postaci.
const lines = [0, 1].flatMap((row) => [96, 415].map((y) => Math.round(row * CELL + (y / SIZE) * CELL)));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  ${lines.map((y) => `<line x1="0" x2="${width}" y1="${y}" y2="${y}" stroke="#4A90E2" stroke-dasharray="4 4" stroke-width="1"/>`).join("")}
  <line x1="${ref.length * CELL}" x2="${ref.length * CELL}" y1="0" y2="${2 * CELL}" stroke="#999" stroke-width="1"/>
  <text x="6" y="16" font-family="sans-serif" font-size="13" fill="#555">wzór</text>
  <text x="${ref.length * CELL + 6}" y="16" font-family="sans-serif" font-size="13" fill="#555">pliki od użytkowniczki</text>
  <text x="${ref.length * CELL + 6}" y="${CELL + 16}" font-family="sans-serif" font-size="13" fill="#555">po dopasowaniu kadru (y 96–415)</text>
  <text x="6" y="${2 * CELL + 28}" font-family="sans-serif" font-size="13" fill="#555">lista postaci, 40 px</text>
</svg>`;
await sharp({ create: { width, height, channels: 4, background: "#ffffff" } })
  .composite([...layers, { input: Buffer.from(svg), left: 0, top: 0 }])
  .png()
  .toFile(`${HERE}mockup-lineup.png`);
console.log("mockup-lineup.png");
