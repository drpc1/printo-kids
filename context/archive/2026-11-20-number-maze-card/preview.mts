// Podgląd karty „Labirynt liczbowy” z kodu (faza 1): prawdziwy generator (src/lib/number-maze/generate.ts) i układ
// (layout.ts), sześć poziomów. Kółko i dymek u góry zastępują postać przy poleceniu (US-21); arkusz strony dochodzi
// w fazie 2. Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/number-maze-card/preview.mts
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SPEECH_BAND } from "../../../src/lib/sheet/speech.ts";
import { generateNumberMazeCard } from "../../../src/lib/number-maze/generate.ts";
import { layoutNumberMazeSheet } from "../../../src/lib/number-maze/layout.ts";
import { NUMBER_MAZE_LEVELS } from "../../../src/lib/number-maze/levels.ts";
import { NUMBER_MAZE_SHEET as S } from "../../../src/lib/number-maze/sheet.ts";

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

const files: string[] = [];
for (const [index, level] of NUMBER_MAZE_LEVELS.entries()) {
  const card = generateNumberMazeCard(seeded(100 + index), level);
  if (card === null) throw new Error(`${level.id}: no card`);
  const layout = layoutNumberMazeSheet(card, SPEECH_BAND.characterSize);
  const left = S.inset;
  const right = S.pageWidth - S.inset;
  const y = layout.band.y;
  const parts: string[] = [
    `<circle cx="${left + 12}" cy="${y + 13}" r="11" fill="#f3c969" stroke="#b8860b" stroke-width="0.4"/>`,
    `<text x="${left + 12}" y="${y + 15}" ${FONT} font-size="4" text-anchor="middle" fill="#7a5a00">postać</text>`,
    `<path d="M ${left + 27} ${y + 3} H ${right} V ${y + 23} H ${left + 27} V ${y + 16} L ${left + 23} ${y + 13} L ${left + 27} ${y + 10} Z" fill="#fff" stroke="#111" stroke-width="0.4"/>`,
    `<text x="${left + 32}" y="${y + 15}" ${FONT} font-size="5.6" fill="#111">${level.instruction}</text>`,
  ];
  for (const cell of layout.cells) {
    parts.push(
      `<rect x="${cell.x.toFixed(2)}" y="${cell.y.toFixed(2)}" width="${layout.cell.toFixed(2)}" height="${layout.cell.toFixed(2)}" fill="none" stroke="#111" stroke-width="${S.cellStroke}"/>`,
      `<text x="${(cell.x + layout.cell / 2).toFixed(2)}" y="${cell.baseline.toFixed(2)}" ${FONT} font-size="${cell.fontSize.toFixed(2)}" font-weight="bold" text-anchor="middle" fill="#111">${cell.text}</text>`,
    );
  }
  const { grid } = layout;
  parts.push(`<rect x="${grid.x}" y="${grid.y}" width="${grid.width}" height="${grid.height}" fill="none" stroke="#111" stroke-width="${S.frameStroke}"/>`);
  for (const end of layout.endpoints) {
    parts.push(`<rect x="${end.x}" y="${end.y}" width="${end.size}" height="${end.size}" rx="${S.endpointRadius}" fill="none" stroke="#111" stroke-width="${S.endpointStroke}"/>`);
  }
  for (const label of layout.labels) {
    parts.push(`<text x="${label.x}" y="${label.baseline}" ${FONT} font-size="${S.labelSize}" font-weight="bold" text-anchor="middle" fill="#111">${label.text}</text>`);
  }
  parts.push(`<text x="${right}" y="${S.pageHeight - 4}" ${FONT} font-size="3" text-anchor="end" fill="#999">podgląd z kodu · ${level.label} · kratka ${layout.cell.toFixed(1)} mm</text>`);
  const file = `preview-${level.id}.svg`;
  writeFileSync(resolve(OUT, file), `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${S.pageWidth} ${S.pageHeight}"><rect width="${S.pageWidth}" height="${S.pageHeight}" fill="#fff"/>${parts.join("")}</svg>`);
  files.push(file);
}
writeFileSync(
  resolve(OUT, "preview.html"),
  `<!doctype html><meta charset="utf-8"><title>S-49 podgląd z kodu</title><style>body{font:14px Arial;margin:16px;background:#eee}img{width:420px;margin:8px;background:#fff;box-shadow:0 1px 4px #0003}</style>${files.map((f) => `<img src="${f}">`).join("")}`,
);
console.log(`wrote ${files.length} SVG + preview.html`);
