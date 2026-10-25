// Writes print-ready color mockups of the sudoku cards to context/changes/picture-sudoku-colors/: a 9×9 card with all
// nine shapes and a 4×4 card, each in two drawing variants (filled shapes, and colored outlines only). Each is a real
// board from the generator (fixed seed), drawn from the same constants as the page. Print each file on A4 at 100%, on a
// color printer and in grayscale, to judge the nine crayon colors and which variant reads better.
// Run: node --experimental-strip-types scripts/sudoku-mockup.mjs
// Literal colors are allowed here: the output is a static file, not a page or component.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateSudokuCard, generateSudokuPuzzle, sudokuBlock } from "../src/lib/sudoku/generate.ts";
import { layoutSudokuSheet } from "../src/lib/sudoku/layout.ts";
import { SUDOKU_SHEET } from "../src/lib/sudoku/sheet.ts";
import { sudokuShapePath, SUDOKU_SHAPES } from "../src/lib/sudoku/shapes.ts";

const OUTPUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../context/changes/picture-sudoku-colors");

// The proposed shape → crayon assignment (plan.md), as sRGB approximations of the --symmetry-* tokens; purple and
// brown are the two new crayons.
const SHAPE_COLORS = {
  heart: "#d32f2f",
  circle: "#2f6fd6",
  triangle: "#2e9e4f",
  square: "#f08a24",
  cross: "#7e3fb5",
  star: "#f0b400",
  diamond: "#7a4a2a",
  moon: "#8c8c8c",
  drop: "#1f1f1f",
};

const BOARDS = [
  { name: "9x9", size: 9, seed: 9 },
  { name: "4x4", size: 4, seed: 4 },
];
const VARIANTS = ["filled", "outline"];

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

const shapePath = (d, color, variant) =>
  `<path d="${d}" fill="${variant === "filled" ? color : "none"}" stroke="${color}" stroke-width="${SUDOKU_SHEET.shapeStroke}" stroke-linejoin="round"/>`;
const line = (l, width) =>
  `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="#000" stroke-width="${width}"/>`;

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const { name, size, seed } of BOARDS) {
  // 9×9: the easy level (35 blanks) leaves enough givens for all nine shapes to appear.
  const board =
    size === 4
      ? generateSudokuCard(mulberry32(seed), null)
      : { ...generateSudokuPuzzle(mulberry32(seed), size, 35), shapes: SUDOKU_SHAPES };
  if (board === null || board.givens === undefined) {
    throw new Error(`No ${size}×${size} board for seed ${seed}`);
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
  const shapeSize = cellSize * SUDOKU_SHEET.shapeScale;

  for (const variant of VARIANTS) {
    const parts = [`<rect width="${SUDOKU_SHEET.pageWidth}" height="${SUDOKU_SHEET.pageHeight}" fill="#fff"/>`];
    sheet.instruction.ys.forEach((y, index) => {
      parts.push(
        `<text x="${sheet.instruction.x}" y="${y}" text-anchor="middle" dominant-baseline="central" ${FONT} font-size="${SUDOKU_SHEET.instructionSize}" fill="#000">${SUDOKU_SHEET.instructionLines[index]}</text>`,
      );
    });
    board.givens.forEach((row, r) => {
      row.forEach((symbol, c) => {
        if (symbol === null) return;
        const { x, y } = sheet.cellCenter(r, c);
        const shape = board.shapes[symbol];
        parts.push(shapePath(sudokuShapePath(shape, x, y, shapeSize), SHAPE_COLORS[shape], variant));
      });
    });
    for (const l of sheet.cellLines) parts.push(line(l, SUDOKU_SHEET.cellStroke));
    for (const l of sheet.blockLines) parts.push(line(l, SUDOKU_SHEET.blockStroke));
    const { x, y, width, height } = sheet.grid;
    parts.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="#000" stroke-width="${SUDOKU_SHEET.frameStroke}"/>`,
    );

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${SUDOKU_SHEET.pageWidth} ${SUDOKU_SHEET.pageHeight}">${parts.join("\n")}</svg>\n`;
    const output = resolve(OUTPUT_DIR, `mockup-${name}-colors-${variant}.svg`);
    writeFileSync(output, svg);
    console.log(`Wrote ${output}`);
  }
}
