import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { SudokuSymbols } from "./levels.ts";
import { layoutSudokuSheet, type SudokuSheetInput } from "./layout.ts";
import { layoutSudokuShapeList } from "./shape-list.ts";
import { SUDOKU_SHAPES, type SudokuShapeId } from "./shapes.ts";
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
  cellSize: SUDOKU_SHEET.cellSize[4],
  instructionLineCount: SUDOKU_SHEET.instructionLines.length,
  instructionSize: SUDOKU_SHEET.instructionSize,
  instructionLineGap: SUDOKU_SHEET.instructionLineGap,
  instructionGap: SUDOKU_SHEET.instructionGap,
};

const BOARDS = [
  { size: 4, blockRows: 2, blockColumns: 2 },
  { size: 6, blockRows: 2, blockColumns: 3 },
  { size: 9, blockRows: 3, blockColumns: 3 },
] as const;

const SAMPLE: readonly SudokuShapeId[] = ["heart", "circle", "triangle", "square"];

function board(
  size: 4 | 6 | 9,
  blockRows: number,
  blockColumns: number,
  instructionBoxHeight?: number,
): SudokuSheetInput {
  return {
    ...FOUR,
    size,
    blockRows,
    blockColumns,
    cellSize: SUDOKU_SHEET.cellSize[size],
    ...(instructionBoxHeight === undefined ? {} : { instructionBoxHeight }),
  };
}

function place(input: SudokuSheetInput, symbols: SudokuSymbols, shapes: readonly SudokuShapeId[]) {
  const sheet = layoutSudokuSheet(input);
  return {
    sheet,
    row: layoutSudokuShapeList({
      grid: sheet.grid,
      pageWidth: input.pageWidth,
      pageHeight: input.pageHeight,
      inset: input.inset,
      symbols,
      shapes,
    }),
  };
}

void describe("layoutSudokuShapeList", () => {
  void test("heart, circle, triangle, square read koło, kwadrat, trójkąt, serce", () => {
    const { row } = place(FOUR, "shapes", SAMPLE);

    assert.deepEqual(
      row.items.map((item) => item.name),
      ["koło", "kwadrat", "trójkąt", "serce"],
    );
  });

  void test("a digits card returns no positions", () => {
    const { row } = place(FOUR, "digits", SAMPLE);

    assert.deepEqual(row.items, []);
  });

  void test("an empty shape list returns no positions", () => {
    const { row } = place(FOUR, "shapes", []);

    assert.deepEqual(row.items, []);
  });

  void test("the row leaves the grid where layoutSudokuSheet put it, with and without a 26 mm band", () => {
    for (const { size, blockRows, blockColumns } of BOARDS) {
      for (const instructionBoxHeight of [undefined, 26] as const) {
        const input = board(size, blockRows, blockColumns, instructionBoxHeight);
        const sheet = layoutSudokuSheet(input);
        const snapshot = { ...sheet.grid };
        const label = `${size}×${size}${instructionBoxHeight === undefined ? "" : " band"}`;

        layoutSudokuShapeList({
          grid: sheet.grid,
          pageWidth: input.pageWidth,
          pageHeight: input.pageHeight,
          inset: input.inset,
          symbols: "shapes",
          shapes: SAMPLE,
        });

        assert.deepEqual(sheet.grid, snapshot, label);
        assert.deepEqual(sheet.grid, layoutSudokuSheet(input).grid, label);
      }
    }
  });

  void test("a 9×9 card with a 26 mm band keeps every drawing and gwiazdka inside the 10 mm margin", () => {
    const input = board(9, 3, 3, 26);
    const { sheet, row } = place(input, "shapes", SUDOKU_SHAPES);
    const frameBottom = sheet.grid.y + sheet.grid.height + SUDOKU_SHEET.frameStroke / 2;

    assert.deepEqual(
      row.items.map((item) => item.id),
      [...SUDOKU_SHAPES],
    );

    for (const item of row.items) {
      const half = item.drawing.size / 2;
      const left = item.drawing.x - half;
      const right = item.drawing.x + half;
      const top = item.drawing.y - half;
      const bottom = item.drawing.y + half;

      assert.ok(left >= 10 - 1e-9, `${item.id} left ${left}`);
      assert.ok(right <= 200 + 1e-9, `${item.id} right ${right}`);
      assert.ok(bottom <= 287 + 1e-9, `${item.id} bottom ${bottom}`);
      assert.ok(top >= frameBottom - 1e-9, `${item.id} top ${top}`);
    }

    const star = row.items.find((item) => item.name === "gwiazdka");
    assert.ok(star, "gwiazdka");
    const width = 8 * star.label.size * CHARACTER_WIDTH;
    const labelLeft = star.label.x - width / 2;
    const labelRight = star.label.x + width / 2;
    const labelTop = star.label.y - star.label.size / 2;
    const labelBottom = star.label.y + star.label.size / 2;

    assert.ok(labelLeft >= 10 - 1e-9, `gwiazdka left ${labelLeft}`);
    assert.ok(labelRight <= 200 + 1e-9, `gwiazdka right ${labelRight}`);
    assert.ok(labelBottom <= 287 + 1e-9, `gwiazdka bottom ${labelBottom}`);
    assert.ok(labelTop >= frameBottom - 1e-9, `gwiazdka top ${labelTop}`);
    assert.ok(8 * star.label.size * 0.55 < (input.pageWidth - 2 * input.inset) / 9);
  });

  void test("the drawing side and the name size are the same on a 4×4 row and a 9×9 row", () => {
    const small = place(FOUR, "shapes", SAMPLE).row;
    const large = place(board(9, 3, 3, 26), "shapes", SUDOKU_SHAPES).row;

    const smallDrawing = small.items[0];
    const largeDrawing = large.items[0];
    assert.ok(smallDrawing);
    assert.ok(largeDrawing);
    assert.equal(smallDrawing.drawing.size, largeDrawing.drawing.size);
    assert.equal(smallDrawing.label.size, largeDrawing.label.size);
  });
});
