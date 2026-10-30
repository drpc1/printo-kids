import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { SudokuSymbols } from "./levels.ts";
import { layoutSudokuSheet, type SudokuSheetInput } from "./layout.ts";
import { LABEL_GAP, LABEL_WIDTH, MAX_GAP, PANEL_PADDING, layoutSudokuShapeList } from "./shape-list.ts";
import { SUDOKU_SHAPES, type SudokuShapeId } from "./shapes.ts";
import { SUDOKU_SHEET } from "./sheet.ts";

/** Rough width of a text character relative to the font size, the estimate the plan uses. */
const CHARACTER_WIDTH = 0.55;

/** Height of the speech band with a character, in mm (SPEECH_BAND.characterSize). */
const BAND = 26;

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
  { size: 4, blockRows: 2, blockColumns: 2, shapes: SUDOKU_SHAPES.slice(0, 4) },
  { size: 6, blockRows: 2, blockColumns: 3, shapes: SUDOKU_SHAPES.slice(0, 6) },
  { size: 9, blockRows: 3, blockColumns: 3, shapes: SUDOKU_SHAPES },
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
  return { sheet, row: layoutSudokuShapeList({ grid: sheet.grid, symbols, shapes }) };
}

/** Every board, with and without a speech band, with the full set of shapes of that board. */
function everyCard() {
  return BOARDS.flatMap(({ size, blockRows, blockColumns, shapes }) =>
    ([undefined, BAND] as const).map((band) => ({
      label: `${size}×${size}${band === undefined ? "" : " band"}`,
      ...place(board(size, blockRows, blockColumns, band), "shapes", shapes),
    })),
  );
}

void describe("layoutSudokuShapeList", () => {
  void test("the row lists the shapes in catalog order, without names", () => {
    const { row } = place(FOUR, "shapes", SAMPLE);

    assert.deepEqual(
      row.items.map((item) => item.id),
      ["circle", "square", "triangle", "heart"],
    );
    for (const item of row.items) {
      assert.deepEqual(Object.keys(item).sort(), ["drawing", "id"]);
    }
    assert.equal(row.label?.text, "Użyj:");
  });

  void test("a digits card gets no frame, no caption and no positions", () => {
    const { row } = place(FOUR, "digits", SAMPLE);

    assert.deepEqual(row, { panel: null, label: null, items: [] });
  });

  void test("an empty shape list gets no frame, no caption and no positions", () => {
    const { row } = place(FOUR, "shapes", []);

    assert.deepEqual(row, { panel: null, label: null, items: [] });
  });

  void test("the row leaves the grid where layoutSudokuSheet put it, with and without a 26 mm band", () => {
    for (const { size, blockRows, blockColumns } of BOARDS) {
      for (const band of [undefined, BAND] as const) {
        const input = board(size, blockRows, blockColumns, band);
        const sheet = layoutSudokuSheet(input);
        const snapshot = { ...sheet.grid };

        layoutSudokuShapeList({ grid: sheet.grid, symbols: "shapes", shapes: SAMPLE });

        assert.deepEqual(sheet.grid, snapshot, `${size}×${size}`);
        assert.deepEqual(sheet.grid, layoutSudokuSheet(input).grid, `${size}×${size}`);
      }
    }
  });

  void test("the frame has the width of the grid and sits one instruction gap below it", () => {
    for (const { label, sheet, row } of everyCard()) {
      assert.ok(row.panel, label);
      const above = sheet.grid.y - (sheet.instruction.top + sheet.instruction.height);
      const below = row.panel.y - (sheet.grid.y + sheet.grid.height);

      assert.equal(row.panel.x, sheet.grid.x, `${label} left`);
      assert.equal(row.panel.width, sheet.grid.width, `${label} width`);
      assert.ok(Math.abs(above - SUDOKU_SHEET.instructionGap) < 1e-9, `${label} instruction gap`);
      assert.ok(Math.abs(below - above) < 1e-9, `${label} gap under the grid`);
    }
  });

  void test("the frame stays inside the 10 mm margin, also on 9×9 with a 26 mm band", () => {
    for (const { label, row } of everyCard()) {
      assert.ok(row.panel, label);
      assert.ok(row.panel.y + row.panel.height <= 287 + 1e-9, `${label} bottom ${row.panel.y + row.panel.height}`);
      assert.ok(row.panel.x >= 10 - 1e-9 && row.panel.x + row.panel.width <= 200 + 1e-9, `${label} sides`);
    }
  });

  void test("the drawings sit inside the frame after the caption, with equal gaps that do not touch", () => {
    for (const { label, row } of everyCard()) {
      assert.ok(row.panel && row.label, label);
      const first = row.items.at(0);
      const last = row.items.at(-1);
      assert.ok(first && last, label);

      const captionRight = row.label.x + 5 * row.label.size * CHARACTER_WIDTH;
      assert.ok(first.drawing.x - first.drawing.size / 2 > captionRight, `${label} caption`);
      assert.ok(
        last.drawing.x + last.drawing.size / 2 <= row.panel.x + row.panel.width - PANEL_PADDING + 1e-9,
        `${label} right`,
      );

      for (const item of row.items) {
        const half = item.drawing.size / 2;
        assert.ok(
          item.drawing.y - half >= row.panel.y && item.drawing.y + half <= row.panel.y + row.panel.height,
          `${label} vertical`,
        );
      }

      const gaps = row.items.slice(1).map((item, index) => {
        const previous = row.items[index];
        assert.ok(previous, label);
        return item.drawing.x - previous.drawing.x - item.drawing.size;
      });
      for (const gap of gaps) {
        assert.ok(Math.abs(gap - (gaps[0] ?? 0)) < 1e-9, `${label} equal gaps`);
        assert.ok(gap >= 3 - 1e-9 && gap <= MAX_GAP + 1e-9, `${label} gap ${gap}`);
      }
    }
  });

  void test("4×4 and 6×6 pack the shapes with an 8 mm gap and 9×9 fits them with a smaller one", () => {
    const gapOf = (size: 4 | 6 | 9) => {
      const entry = everyCard().find((card) => card.label === `${size}×${size}`);
      const items = entry?.row.items ?? [];
      const a = items.at(0);
      const b = items.at(1);
      assert.ok(a && b, `${size}`);
      return b.drawing.x - a.drawing.x - a.drawing.size;
    };

    assert.ok(Math.abs(gapOf(4) - MAX_GAP) < 1e-9);
    assert.ok(Math.abs(gapOf(6) - MAX_GAP) < 1e-9);
    assert.ok(gapOf(9) < MAX_GAP && gapOf(9) >= 3);
  });

  void test("the group is centered in the space after the caption", () => {
    for (const { label, row } of everyCard()) {
      assert.ok(row.panel, label);
      const first = row.items.at(0);
      const last = row.items.at(-1);
      assert.ok(first && last, label);
      const fieldLeft = row.panel.x + PANEL_PADDING + LABEL_WIDTH + LABEL_GAP;
      const fieldRight = row.panel.x + row.panel.width - PANEL_PADDING;
      const left = first.drawing.x - first.drawing.size / 2 - fieldLeft;
      const right = fieldRight - (last.drawing.x + last.drawing.size / 2);

      assert.ok(Math.abs(left - right) < 1e-9, `${label} ${left} vs ${right}`);
    }
  });

  void test("the drawing side is the same on a 4×4 row and a 9×9 row", () => {
    const small = place(FOUR, "shapes", SAMPLE).row;
    const large = place(board(9, 3, 3, BAND), "shapes", SUDOKU_SHAPES).row;

    assert.ok(small.items[0]);
    assert.ok(large.items[0]);
    assert.equal(small.items[0].drawing.size, large.items[0].drawing.size);
  });

  void test("a single shape is centered in the space after the caption", () => {
    const { row } = place(FOUR, "shapes", ["star"]);
    const only = row.items[0];

    assert.equal(row.items.length, 1);
    assert.ok(row.panel && only);
    assert.equal(
      only.drawing.x,
      (row.panel.x + PANEL_PADDING + LABEL_WIDTH + LABEL_GAP + row.panel.x + row.panel.width - PANEL_PADDING) / 2,
    );
  });
});
