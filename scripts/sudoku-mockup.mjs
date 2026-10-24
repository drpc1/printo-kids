// Writes print-ready mockups of the sudoku cards to context/changes/picture-sudoku-levels/: the hardest 6×6 with
// shapes, and the hardest 9×9 with shapes and with digits. Each is a real board from the generator (fixed seed), drawn
// from the same constants as the page, so cell sizes, blank counts and the instruction are what a parent prints.
// Print each file on A4 at 100% to judge the cells, the shapes, the digits and how hard the blank count is.
// Run: node --experimental-strip-types scripts/sudoku-mockup.mjs
// Literal colors are allowed here: the output is a static file, not a page or component.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateSudokuPuzzle, sudokuBlock } from "../src/lib/sudoku/generate.ts";
import { layoutSudokuSheet } from "../src/lib/sudoku/layout.ts";
import { SUDOKU_SHEET } from "../src/lib/sudoku/sheet.ts";
import { sudokuShapePath, SUDOKU_SHAPES } from "../src/lib/sudoku/shapes.ts";

const OUTPUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../context/changes/picture-sudoku-levels");

// Blanks of the hardest level of each size (PRD Business Logic "Karta sudoku").
const MOCKUPS = [
  { file: "mockup-6x6-shapes.svg", size: 6, blanks: 22, symbols: "shapes", seed: 6 },
  { file: "mockup-9x9-shapes.svg", size: 9, blanks: 52, symbols: "shapes", seed: 9 },
  { file: "mockup-9x9-digits.svg", size: 9, blanks: 52, symbols: "digits", seed: 19 },
];

// Six of the nine shapes for the 6×6 card, including harder ones (star, moon, drop) so the print shows them.
const SHAPES_6 = ["circle", "triangle", "heart", "star", "moon", "drop"];

const FONT = 'font-family="Arial, Helvetica, sans-serif"';

function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const outline = (d) =>
  `<path d="${d}" fill="none" stroke="#000" stroke-width="${SUDOKU_SHEET.shapeStroke}" stroke-linejoin="round"/>`;
const line = (l, width) =>
  `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="#000" stroke-width="${width}"/>`;

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const { file, size, blanks, symbols, seed } of MOCKUPS) {
  const puzzle = generateSudokuPuzzle(mulberry32(seed), size, blanks);
  if (puzzle === null) {
    throw new Error(`No ${size}×${size} board with ${blanks} blanks for seed ${seed}`);
  }

  const block = sudokuBlock(size);
  const cellSize = SUDOKU_SHEET.cellSize[size];
  const sheet = layoutSudokuSheet({
    pageWidth: SUDOKU_SHEET.pageWidth,
    pageHeight: SUDOKU_SHEET.pageHeight,
    inset: SUDOKU_SHEET.inset,
    size,
    blockRows: block.rows,
    blockColumns: block.columns,
    cellSize,
    instructionLineCount: SUDOKU_SHEET.instructionLines.length,
    instructionSize: SUDOKU_SHEET.instructionSize,
    instructionLineGap: SUDOKU_SHEET.instructionLineGap,
    instructionGap: SUDOKU_SHEET.instructionGap,
  });
  const shapes = size === 6 ? SHAPES_6 : SUDOKU_SHAPES;
  const shapeSize = cellSize * SUDOKU_SHEET.shapeScale;
  const digitSize = cellSize * SUDOKU_SHEET.digitScale;

  const parts = [`<rect width="${SUDOKU_SHEET.pageWidth}" height="${SUDOKU_SHEET.pageHeight}" fill="#fff"/>`];
  sheet.instruction.ys.forEach((y, index) => {
    parts.push(
      `<text x="${sheet.instruction.x}" y="${y}" text-anchor="middle" dominant-baseline="central" ${FONT} font-size="${SUDOKU_SHEET.instructionSize}" fill="#000">${SUDOKU_SHEET.instructionLines[index]}</text>`,
    );
  });
  puzzle.givens.forEach((row, r) => {
    row.forEach((symbol, c) => {
      if (symbol === null) return;
      const { x, y } = sheet.cellCenter(r, c);
      if (symbols === "digits") {
        parts.push(
          `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" ${FONT} font-size="${digitSize}" fill="#000">${symbol + 1}</text>`,
        );
      } else {
        parts.push(outline(sudokuShapePath(shapes[symbol], x, y, shapeSize)));
      }
    });
  });
  for (const l of sheet.cellLines) parts.push(line(l, SUDOKU_SHEET.cellStroke));
  for (const l of sheet.blockLines) parts.push(line(l, SUDOKU_SHEET.blockStroke));
  const { x, y, width, height } = sheet.grid;
  parts.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="#000" stroke-width="${SUDOKU_SHEET.frameStroke}"/>`,
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${SUDOKU_SHEET.pageWidth} ${SUDOKU_SHEET.pageHeight}">${parts.join("\n")}</svg>\n`;
  const output = resolve(OUTPUT_DIR, file);
  writeFileSync(output, svg);
  console.log(`Wrote ${output} (${size}×${size}, ${blanks} blanks, ${symbols})`);
}
