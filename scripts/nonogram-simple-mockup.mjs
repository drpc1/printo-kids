// Writes print-ready mockups of the easy (chip) nonogram to context/changes/nonogram-sizes/: the empty card and the card
// with its solution, from the real generator logic (a fixed template) and the same layout and constants as the page.
// Print on A4 at 100% to judge the chips and the cells. Literal colors are allowed here: the output is a static file,
// not a page or component.
// Run: node --experimental-strip-types scripts/nonogram-simple-mockup.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { blockLines, layoutSimpleNonogramSheet } from "../src/lib/nonogram/layout.ts";
import { NONOGRAM_SHEET as S, NONOGRAM_SIMPLE_SHEET as C } from "../src/lib/nonogram/sheet.ts";
import { composeSimpleNonogramCard } from "../src/lib/nonogram/simple.ts";
import { nonogramSizeById } from "../src/lib/nonogram/sizes.ts";
import { symmetryTemplatesFor } from "../src/lib/symmetry/templates.ts";

const OUTPUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../context/changes/nonogram-sizes");
const FILL = { white: "#fff", gray: "#b9b9b9", black: "#111" };

function sheetSvg(card, solved) {
  const sheet = layoutSimpleNonogramSheet({
    pageWidth: S.pageWidth,
    pageHeight: S.pageHeight,
    inset: S.inset,
    columns: card.columns,
    rows: card.rows,
    cellSize: card.cellSize,
    maxRuns: Math.max(...card.runs.map((row) => row.length)),
    instructionSize: S.instructionSize,
    instructionGap: S.instructionGap * 2,
    chipSize: C.chipSize,
    chipGap: C.chipGap,
    bandGap: C.bandGap,
  });
  const g = sheet.grid;
  const thickC = new Set(blockLines(card.columns, S.blockEvery));
  const thickR = new Set(blockLines(card.rows, S.blockEvery));
  const parts = [`<rect width="${S.pageWidth}" height="${S.pageHeight}" fill="#fff"/>`];
  parts.push(
    `<text x="${sheet.instruction.x}" y="${sheet.instruction.y}" font-family="sans-serif" font-size="${S.instructionSize}" text-anchor="middle" dominant-baseline="middle">${C.instructionText}</text>`,
  );
  if (solved) {
    card.tones.forEach((row, r) =>
      row.forEach((tone, c) => {
        if (tone !== "white") {
          parts.push(
            `<rect x="${g.x + c * card.cellSize}" y="${g.y + r * card.cellSize}" width="${card.cellSize}" height="${card.cellSize}" fill="${FILL[tone]}"/>`,
          );
        }
      }),
    );
  }
  for (let i = 0; i <= card.columns; i += 1) {
    const x = g.x + i * card.cellSize;
    parts.push(
      `<line x1="${x}" y1="${g.y}" x2="${x}" y2="${g.y + g.height}" stroke="#000" stroke-width="${thickC.has(i) ? S.blockStroke : S.gridStroke}"/>`,
    );
  }
  for (let i = 0; i <= card.rows; i += 1) {
    const y = g.y + i * card.cellSize;
    parts.push(
      `<line x1="${g.x}" y1="${y}" x2="${g.x + g.width}" y2="${y}" stroke="#000" stroke-width="${thickR.has(i) ? S.blockStroke : S.gridStroke}"/>`,
    );
  }
  parts.push(
    `<rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" fill="none" stroke="#000" stroke-width="${S.frameStroke}"/>`,
  );
  card.runs.forEach((row, r) =>
    row.forEach((run, index) => {
      const x = sheet.chipX(index, row.length);
      const y = sheet.chipY(r);
      parts.push(
        `<rect x="${x}" y="${y}" width="${C.chipSize}" height="${C.chipSize}" rx="${C.chipRadius}" fill="${FILL[run.tone]}" stroke="#000" stroke-width="${C.chipStroke}"/>`,
      );
      parts.push(
        `<text x="${x + C.chipSize / 2}" y="${y + C.chipSize / 2}" font-family="sans-serif" font-size="${C.digitSize}" font-weight="${S.clueFontWeight}" text-anchor="middle" dominant-baseline="central" fill="${run.tone === "black" ? "#fff" : "#000"}">${run.count}</text>`,
      );
    }),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S.pageWidth} ${S.pageHeight}" width="${S.pageWidth}mm" height="${S.pageHeight}mm">${parts.join("")}</svg>`;
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const easy = nonogramSizeById("latwy");
const template = symmetryTemplatesFor(easy.templateLevel)[0];
const card = composeSimpleNonogramCard(
  template,
  template.parts.map(() => 0),
  easy,
);
for (const [name, solved] of [
  ["mockup-prosty", false],
  ["mockup-prosty-rozwiazanie", true],
]) {
  writeFileSync(
    resolve(OUTPUT_DIR, `${name}.html`),
    `<!doctype html><meta charset="utf-8"><title>Nonogram łatwy 8×12</title><style>@page{size:A4;margin:0}body{margin:0}svg{display:block}</style>${sheetSvg(card, solved)}`,
  );
  console.log("wrote", name);
}
