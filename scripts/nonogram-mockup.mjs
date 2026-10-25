// Writes print-ready mockups of the three nonogram sizes (small, medium, large) to context/changes/nonogram-sizes/:
// one real card per size from the generator (fixed seed), drawn from the same constants as the page, empty (no
// solution). Print each file on A4 at 100% to judge cell size and clue digits. Literal black is allowed here: the
// output is a static file, not a page or component.
// Run: node --experimental-strip-types scripts/nonogram-mockup.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateNonogramCard } from "../src/lib/nonogram/generate.ts";
import { blockLines, layoutNonogramSheet, longestClues } from "../src/lib/nonogram/layout.ts";
import { NONOGRAM_SHEET as S } from "../src/lib/nonogram/sheet.ts";
import { NONOGRAM_SIZES } from "../src/lib/nonogram/sizes.ts";

const OUTPUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../context/changes/nonogram-sizes");

function mulberry32(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sheetSvg(size) {
  const card = generateNonogramCard(mulberry32(7), null, size);
  const sheet = layoutNonogramSheet({
    pageWidth: S.pageWidth,
    pageHeight: S.pageHeight,
    inset: S.inset,
    columns: card.columns,
    rows: card.rows,
    cellSize: card.cellSize,
    digitSize: size.digitSize,
    ...longestClues(card.clues),
    instructionSize: S.instructionSize,
    instructionGap: S.instructionGap,
    clueGap: S.clueGap,
    clueSlot: S.clueSlot,
  });
  const g = sheet.grid;
  const thickC = new Set(blockLines(card.columns, S.blockEvery));
  const thickR = new Set(blockLines(card.rows, S.blockEvery));
  const lines = [];
  for (let i = 0; i <= card.columns; i += 1)
    lines.push(
      `<line x1="${g.x + i * card.cellSize}" y1="${g.y}" x2="${g.x + i * card.cellSize}" y2="${g.y + g.height}" stroke-width="${thickC.has(i) ? S.blockStroke : S.gridStroke}"/>`,
    );
  for (let i = 0; i <= card.rows; i += 1)
    lines.push(
      `<line x1="${g.x}" y1="${g.y + i * card.cellSize}" x2="${g.x + g.width}" y2="${g.y + i * card.cellSize}" stroke-width="${thickR.has(i) ? S.blockStroke : S.gridStroke}"/>`,
    );
  const texts = [];
  card.clues.rows.forEach((clue, r) =>
    clue.forEach((v, p) =>
      texts.push(`<text x="${sheet.rowClueX(clue.length - 1 - p)}" y="${g.y + (r + 0.5) * card.cellSize}">${v}</text>`),
    ),
  );
  card.clues.columns.forEach((clue, c) =>
    clue.forEach((v, p) =>
      texts.push(
        `<text x="${g.x + (c + 0.5) * card.cellSize}" y="${sheet.columnClueY(clue.length - 1 - p)}">${v}</text>`,
      ),
    ),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S.pageWidth} ${S.pageHeight}" width="${S.pageWidth}mm" height="${S.pageHeight}mm">
<rect width="${S.pageWidth}" height="${S.pageHeight}" fill="#fff"/>
<text x="${sheet.instruction.x}" y="${sheet.instruction.y}" font-family="sans-serif" font-size="${S.instructionSize}" text-anchor="middle" dominant-baseline="middle">${S.instructionText}</text>
<g stroke="#000" fill="none">${lines.join("")}<rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" stroke-width="${S.frameStroke}"/></g>
<g fill="#000" font-family="sans-serif" font-size="${size.digitSize}" font-weight="${S.clueFontWeight}" text-anchor="middle" dominant-baseline="central">${texts.join("")}</g>
</svg>`;
}

mkdirSync(OUTPUT_DIR, { recursive: true });
for (const size of NONOGRAM_SIZES) {
  const svg = sheetSvg(size);
  writeFileSync(
    resolve(OUTPUT_DIR, `mockup-${size.id}.html`),
    `<!doctype html><meta charset="utf-8"><title>Nonogram ${size.label} ${size.columns}×${size.rows}</title><style>@page{size:A4;margin:0}body{margin:0}svg{display:block}</style>${svg}`,
  );
  console.log("wrote", `mockup-${size.id}.html`);
}
