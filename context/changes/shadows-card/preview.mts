// Podgląd karty „Cienie” (S-47, faza 2): rysuje karty z prawdziwych modułów produktu (poziomy, generator, układ,
// stałe druku) w skali 1:1 (A4, 210 × 297 mm), trzy poziomy, z postacią (kółko i dymek w pasie postaci) albo bez niej
// (samo polecenie). Nie jest kodem produktu; nie ma własnych wymiarów rysunku.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/shadows-card/preview.mts
// Pisze preview-*.svg i previews.html do tego folderu.
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { instructionBoxHeight } from "../../../src/lib/sheet/speech.ts";
import { shadowPictureById } from "../../../src/lib/shadows/families.ts";
import { generateShadowsCard } from "../../../src/lib/shadows/generate.ts";
import { layoutShadowsSheet } from "../../../src/lib/shadows/layout.ts";
import { SHADOWS_LEVELS } from "../../../src/lib/shadows/levels.ts";
import { SHADOWS_SHEET } from "../../../src/lib/shadows/sheet.ts";
import { pictureAt, SHADOW } from "./render.mts";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const files: { file: string; title: string }[] = [];
for (const level of SHADOWS_LEVELS) {
  for (const character of [true, false]) {
    const card = generateShadowsCard(seeded(11), level);
    if (card === null) throw new Error(`no card for ${level.id}`);
    const layout = layoutShadowsSheet(card, instructionBoxHeight(character, SHADOWS_SHEET.plainInstructionSize));
    const { inset, pageWidth: w, pageHeight: h } = SHADOWS_SHEET;
    const parts: string[] = [];
    const y = layout.band.y;
    if (character) {
      parts.push(`<circle cx="${inset + 12}" cy="${y + 13}" r="11" fill="#f3c969"/>`);
      parts.push(
        `<path d="M ${inset + 27} ${y + 3} H ${w - inset} V ${y + 23} H ${inset + 27} V ${y + 16} L ${inset + 23} ${y + 13} L ${inset + 27} ${y + 10} Z" fill="#fff" stroke="#111" stroke-width="0.4"/>`,
      );
      parts.push(`<text x="${inset + 32}" y="${y + 15}" ${FONT} font-size="5.6">${SHADOWS_SHEET.instruction}</text>`);
    } else {
      parts.push(
        `<text x="${inset}" y="${y + SHADOWS_SHEET.plainInstructionSize * 0.86}" ${FONT} font-size="${SHADOWS_SHEET.plainInstructionSize}">${SHADOWS_SHEET.instruction}</text>`,
      );
    }
    layout.rows.forEach((row, index) => {
      const picture = shadowPictureById(card.pictures[index]);
      const shadow = shadowPictureById(card.pictures[card.shadowOrder[index]]);
      if (picture === undefined || shadow === undefined) throw new Error("unknown picture");
      parts.push(pictureAt(picture, row.picture.x, row.picture.y, row.picture.size, false));
      parts.push(pictureAt(shadow, row.shadow.x, row.shadow.y, row.shadow.size, true));
      for (const dot of [row.dotLeft, row.dotRight]) {
        parts.push(`<circle cx="${dot.cx}" cy="${dot.cy}" r="${layout.dotRadius}" fill="${SHADOW}"/>`);
      }
    });
    const file = `preview-${level.id}${character ? "" : "-bez-postaci"}.svg`;
    writeFileSync(
      resolve(OUT, file),
      `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fff"/>${parts.join("")}</svg>`,
    );
    files.push({ file, title: `${level.label}${character ? "" : ", bez postaci"}` });
  }
}

writeFileSync(
  resolve(OUT, "previews.html"),
  `<!doctype html><meta charset="utf-8"><title>S-47 podgląd z kodu</title>
<style>body{font:14px Arial;margin:16px;background:#eee}figure{display:inline-block;margin:8px}img{width:360px;background:#fff;box-shadow:0 1px 4px #0003}</style>
${files.map((f) => `<figure><img src="${f.file}"><figcaption>${f.title}</figcaption></figure>`).join("\n")}`,
);
console.log(`wrote ${files.length} SVG + previews.html`);
