import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { layoutSudokuSheet, type SudokuSheetInput } from "./layout.ts";
import { SUDOKU_SHEET } from "./sheet.ts";

/** Rough width of a text character relative to the font size, the estimate the plan uses. */
const CHARACTER_WIDTH = 0.55;

const FOUR: SudokuSheetInput = {
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
};

void describe("layoutSudokuSheet", () => {
  void test("the 4×4 grid is 160 by 160 and sits inside the 10 mm margin on every side", () => {
    const sheet = layoutSudokuSheet(FOUR);
    const { x, y, width, height } = sheet.grid;

    assert.equal(width, 160);
    assert.equal(height, 160);
    assert.ok(x >= 10 && x + width <= 200);
    assert.ok(y >= 10 && y + height <= 287);
    assert.equal(x, 25);
  });

  void test("the instruction lines sit above the grid and inside the margin, one center per line", () => {
    const sheet = layoutSudokuSheet(FOUR);
    const size = SUDOKU_SHEET.instructionSize;

    assert.equal(sheet.instruction.x, 105);
    assert.equal(sheet.instruction.ys.length, 3);
    assert.ok(sheet.instruction.ys[0] - size / 2 >= 10);
    assert.ok(sheet.instruction.ys[2] + size / 2 <= sheet.grid.y);
    assert.ok(sheet.instruction.ys[0] < sheet.instruction.ys[1] && sheet.instruction.ys[1] < sheet.instruction.ys[2]);
  });

  void test("the instruction and the grid are centered down the page", () => {
    const sheet = layoutSudokuSheet(FOUR);
    const top = sheet.instruction.ys[0] - SUDOKU_SHEET.instructionSize / 2;
    const bottom = sheet.grid.y + sheet.grid.height;

    assert.ok(Math.abs(top - 10 - (287 - bottom)) < 1e-9);
  });

  void test("4×4 has 2 thick inner lines (one each way) and 4 thin ones", () => {
    const sheet = layoutSudokuSheet(FOUR);

    assert.equal(sheet.blockLines.length, 2);
    assert.equal(sheet.cellLines.length, 4);
    const [vertical] = sheet.blockLines.filter((line) => line.x1 === line.x2);
    assert.equal(vertical.x1, sheet.grid.x + 80);
  });

  void test("a 6×6 grid with 2×3 blocks has thick lines every 2 rows and every 3 columns", () => {
    const sheet = layoutSudokuSheet({ ...FOUR, size: 6, blockRows: 2, blockColumns: 3, cellSize: 25 });
    const horizontal = sheet.blockLines.filter((line) => line.y1 === line.y2);
    const vertical = sheet.blockLines.filter((line) => line.x1 === line.x2);

    assert.equal(horizontal.length, 2);
    assert.equal(vertical.length, 1);
    assert.equal(sheet.cellLines.length, 5 + 5 - 3);
  });

  void test("cell centers are the middle of each cell", () => {
    const sheet = layoutSudokuSheet(FOUR);

    assert.deepEqual(sheet.cellCenter(0, 0), { x: sheet.grid.x + 20, y: sheet.grid.y + 20 });
    assert.deepEqual(sheet.cellCenter(3, 3), { x: sheet.grid.x + 140, y: sheet.grid.y + 140 });
  });

  void test("a cell too big for the page throws instead of crossing the margin", () => {
    assert.throws(() => layoutSudokuSheet({ ...FOUR, cellSize: 48 }), /does not fit/);
    assert.throws(() => layoutSudokuSheet({ ...FOUR, cellSize: 44, instructionGap: 100 }), /does not fit/);
  });

  void test("the longest instruction line fits the width inside the margin", () => {
    const longest = Math.max(...SUDOKU_SHEET.instructionLines.map((line) => line.length));
    const width = longest * CHARACTER_WIDTH * SUDOKU_SHEET.instructionSize;

    assert.ok(width <= SUDOKU_SHEET.pageWidth - SUDOKU_SHEET.inset * 2, `estimated ${width} mm`);
  });

  void test("the instruction lines read as the full sentence", () => {
    assert.equal(
      SUDOKU_SHEET.instructionLines.join(" "),
      "Dorysuj brakujący kształt. W każdym rzędzie, kolumnie i kwadracie każdy kształt jest raz.",
    );
  });
});
