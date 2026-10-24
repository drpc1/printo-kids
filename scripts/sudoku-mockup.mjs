// Writes a print-ready mockup of the sudoku card to context/changes/picture-sudoku-first-printable/mockup.svg: one
// fixed 4×4 example card, and below it all nine shapes with their names, drawn at the size they have on the card.
// Print it on A4 at 100% to judge the shapes, the 40 mm cells, the block lines and the instruction.
// Run: node --experimental-strip-types scripts/sudoku-mockup.mjs
// Literal colors are allowed here: the output is a static file, not a page or component.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { layoutSudokuSheet } from "../src/lib/sudoku/layout.ts";
import { SUDOKU_SHEET } from "../src/lib/sudoku/sheet.ts";
import { SUDOKU_SHAPES, SUDOKU_SHAPE_NAMES, sudokuShapePath } from "../src/lib/sudoku/shapes.ts";

const OUTPUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../context/changes/picture-sudoku-first-printable/mockup.svg",
);

// A valid 4×4 solution: symbols 0..3 are circle, square, triangle, heart. One blank per row, in these columns.
const SOLUTION = [
  [0, 1, 2, 3],
  [2, 3, 0, 1],
  [1, 0, 3, 2],
  [3, 2, 1, 0],
];
const BLANK_COLUMNS = [2, 0, 3, 1];
const CARD_SHAPES = ["circle", "square", "triangle", "heart"];

const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const LABEL_SIZE = 4;
const SAMPLE_ROWS = [SUDOKU_SHAPES.slice(0, 5), SUDOKU_SHAPES.slice(5)];
const SAMPLE_FIRST_ROW_Y = 222;
const SAMPLE_ROW_PITCH = 38;

const sheet = layoutSudokuSheet({
  pageWidth: SUDOKU_SHEET.pageWidth,
  pageHeight: SUDOKU_SHEET.pageHeight,
  inset: SUDOKU_SHEET.inset,
  size: 4,
  blockRows: 2,
  blockColumns: 2,
  cellSize: SUDOKU_SHEET.cellSize4,
  instructionLineCount: SUDOKU_SHEET.instructionLines.length,
  instructionSize: SUDOKU_SHEET.instructionSize,
  instructionLineGap: SUDOKU_SHEET.instructionLineGap,
  instructionGap: SUDOKU_SHEET.instructionGap,
});

// The card is centered down the page; the mockup lifts it to the top margin to leave room for the shape samples.
const lift = sheet.instruction.ys[0] - SUDOKU_SHEET.instructionSize / 2 - SUDOKU_SHEET.inset;
const shapeSize = SUDOKU_SHEET.cellSize4 * SUDOKU_SHEET.shapeScale;

const outline = (d) =>
  `<path d="${d}" fill="none" stroke="#000" stroke-width="${SUDOKU_SHEET.shapeStroke}" stroke-linejoin="round"/>`;
const line = (l, width) =>
  `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="#000" stroke-width="${width}"/>`;

const parts = [];
parts.push(`<rect width="210" height="297" fill="#fff"/>`);

const card = [];
sheet.instruction.ys.forEach((y, index) => {
  card.push(
    `<text x="${sheet.instruction.x}" y="${y}" text-anchor="middle" dominant-baseline="central" ${FONT} font-size="${SUDOKU_SHEET.instructionSize}" fill="#000">${SUDOKU_SHEET.instructionLines[index]}</text>`,
  );
});
SOLUTION.forEach((row, r) => {
  row.forEach((symbol, c) => {
    if (BLANK_COLUMNS[r] === c) return;
    const { x, y } = sheet.cellCenter(r, c);
    card.push(outline(sudokuShapePath(CARD_SHAPES[symbol], x, y, shapeSize)));
  });
});
for (const l of sheet.cellLines) card.push(line(l, SUDOKU_SHEET.cellStroke));
for (const l of sheet.blockLines) card.push(line(l, SUDOKU_SHEET.blockStroke));
const { x, y, width, height } = sheet.grid;
card.push(
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="#000" stroke-width="${SUDOKU_SHEET.frameStroke}"/>`,
);
parts.push(`<g transform="translate(0 ${-lift})">${card.join("")}</g>`);

SAMPLE_ROWS.forEach((ids, rowIndex) => {
  const rowY = SAMPLE_FIRST_ROW_Y + rowIndex * SAMPLE_ROW_PITCH;
  const pitch = 190 / ids.length;
  ids.forEach((id, index) => {
    const cx = 10 + pitch * (index + 0.5);
    parts.push(outline(sudokuShapePath(id, cx, rowY, shapeSize)));
    parts.push(
      `<text x="${cx}" y="${rowY + shapeSize / 2 + 5}" text-anchor="middle" ${FONT} font-size="${LABEL_SIZE}" fill="#000">${SUDOKU_SHAPE_NAMES[id]}</text>`,
    );
  });
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">${parts.join("\n")}</svg>\n`;
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, svg);
console.log(`Wrote ${OUTPUT}`);
