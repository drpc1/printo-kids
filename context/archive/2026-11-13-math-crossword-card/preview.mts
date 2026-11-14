// Podgląd karty „Krzyżówka matematyczna” (S-40, faza 2): rysuje karty z prawdziwych modułów produktu (poziomy, generator,
// układ, stałe druku), po jednej na poziom, w skali 1:1 (A4, 210 × 297 mm), z przerywanym pasem na postać i dymek.
// Pisze preview-poziom-N.svg i previews.html (oba w .gitignore tego folderu; commitowany jest tylko ten skrypt), a drugą
// stronę każdego poziomu z włączonym „Pokaż rozwiązanie” jako szare cyfry. Nie jest kodem produktu: importuje tylko
// src/lib/math-crossword/* i nie ma własnych stałych rysunku. Szarości w podglądzie to zwykłe kolory (strona używa tokenów).
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/math-crossword-card/preview.mts
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { MathCrosswordCard } from "../../../src/lib/math-crossword/card.ts";
import { generateMathCrosswordCard } from "../../../src/lib/math-crossword/generate.ts";
import { layoutMathCrosswordSheet } from "../../../src/lib/math-crossword/layout.ts";
import { MATH_CROSSWORD_LEVELS, type MathCrosswordLevel } from "../../../src/lib/math-crossword/levels.ts";
import { MATH_CROSSWORD_SHEET } from "../../../src/lib/math-crossword/sheet.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const SHEET = MATH_CROSSWORD_SHEET;
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const BAND = 26;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number): string => n.toFixed(2);

function render(card: MathCrosswordCard, solution: boolean): string {
  const layout = layoutMathCrosswordSheet(card, BAND);
  const out: string[] = [
    `<rect width="210" height="297" fill="#fff"/>`,
    `<rect x="${SHEET.inset}" y="${SHEET.inset}" width="${SHEET.pageWidth - 2 * SHEET.inset}" height="${BAND}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="2 2"/>`,
    `<text x="${SHEET.inset + 4}" y="${SHEET.inset + 6}" ${FONT} font-size="3.5" fill="#777">miejsce na postać i dymek</text>`,
    `<text x="105" y="${SHEET.inset + 17}" ${FONT} font-size="5" font-weight="bold" text-anchor="middle">${SHEET.instruction}</text>`,
  ];
  for (const { cell, x, y } of layout.placed) {
    out.push(
      `<rect x="${f(x)}" y="${f(y)}" width="${f(layout.cell)}" height="${f(layout.cell)}" fill="#fff" stroke="#000" stroke-width="${SHEET.cellStroke}"/>`,
    );
    let text: string;
    let grey = false;
    if (cell.kind === "num") {
      const blank = card.blanks.includes(cell.id);
      if (blank && !solution) continue;
      text = String(card.values[cell.id]);
      grey = blank;
    } else {
      text = cell.kind === "op" ? cell.op : "=";
    }
    const size = layout.cell * (text.length >= SHEET.longGlyphFrom ? SHEET.longGlyphRatio : SHEET.glyphRatio);
    const bold = cell.kind === "num" || (SHEET.boldSigns as readonly string[]).includes(text);
    out.push(
      `<text x="${f(x + layout.cell / 2)}" y="${f(y + layout.cell / 2 + size * 0.36)}" ${FONT} font-size="${f(size)}"${bold ? ' font-weight="bold"' : ""}${grey ? ' fill="#777"' : ""} text-anchor="middle">${text}</text>`,
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">\n${out.join("\n")}\n</svg>\n`;
}

function info(card: MathCrosswordCard, level: MathCrosswordLevel): string {
  const layout = layoutMathCrosswordSheet(card, BAND);
  return `${card.equations.length} działań (cel ${level.equations}), ${card.values.length} liczb, ${card.blanks.length} pustych, siatka ${layout.cols}×${layout.rows}, kratka ${layout.cell.toFixed(1)} mm (do ${level.maxCell})`;
}

const blocks: string[] = [];
for (const [i, level] of MATH_CROSSWORD_LEVELS.entries()) {
  const started = performance.now();
  const card = generateMathCrosswordCard(mulberry32(2026 + i * 13), null, level);
  if (card === null) throw new Error(`no card for ${level.id}`);
  const ms = performance.now() - started;
  const svg = render(card, false);
  const solved = render(card, true);
  writeFileSync(`${OUT}/preview-${level.id}.svg`, svg);
  writeFileSync(`${OUT}/preview-${level.id}-rozwiazanie.svg`, solved);
  const text = `${info(card, level)}, ${ms.toFixed(0)} ms`;
  const inline = (s: string): string => s.replace(/width="210mm" height="297mm"/, "");
  blocks.push(
    `<figure><figcaption><b>${level.label}</b>: ${level.description}<br><small>${text}</small></figcaption>${inline(svg)}${inline(solved)}</figure>`,
  );
  console.log(`preview-${level.id}.svg`, text);
}
writeFileSync(
  `${OUT}/previews.html`,
  `<!doctype html><meta charset="utf-8"><title>Krzyżówka matematyczna – podgląd z kodu</title>
<style>body{font-family:Arial;margin:16px}.g{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}figure{margin:0;border:1px solid #ccc;padding:8px}svg{width:48%;height:auto;border:1px solid #eee}figcaption{font-size:14px;margin-bottom:6px}</style>
<h1>Krzyżówka matematyczna – podgląd z kodu (A4, drukuj w 100%; po lewej karta, po prawej z rozwiązaniem)</h1><div class="g">${blocks.join("")}</div>`,
);
