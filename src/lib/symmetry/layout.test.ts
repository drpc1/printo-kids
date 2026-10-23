import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { layoutSymmetrySheet, type SymmetrySheetInput, type SymmetrySheetLayout } from "./layout.ts";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const INSTRUCTION_HEIGHT = 7;
const INSTRUCTION_GAP = 8;

const FIVE_YEARS: SymmetrySheetInput = {
  pageWidth: PAGE_WIDTH,
  pageHeight: PAGE_HEIGHT,
  inset: INSET,
  columns: 12,
  rows: 16,
  cellSize: 15,
  instructionHeight: INSTRUCTION_HEIGHT,
  instructionGap: INSTRUCTION_GAP,
};

void describe("layoutSymmetrySheet", () => {
  void test("the 5 lat grid is 180 by 240 on a 210 by 297 page", () => {
    const sheet = layoutSymmetrySheet(FIVE_YEARS);

    assert.deepEqual(sheet.page, { width: PAGE_WIDTH, height: PAGE_HEIGHT });
    assert.equal(sheet.grid.width, 180);
    assert.equal(sheet.grid.height, 240);
  });

  void test("the grid and the instruction are centered across the page", () => {
    const sheet = layoutSymmetrySheet(FIVE_YEARS);

    assert.equal(sheet.grid.x, 15);
    assert.equal(PAGE_WIDTH - (sheet.grid.x + sheet.grid.width), 15);
    assert.equal(sheet.instruction.x, 105);
  });

  void test("the vertical axis runs through the middle of the grid and past its frame", () => {
    const sheet = layoutSymmetrySheet(FIVE_YEARS);

    assert.equal(sheet.axis.x1, 105);
    assert.equal(sheet.axis.x2, 105);
    assert.ok(sheet.axis.y1 < sheet.grid.y);
    assert.ok(sheet.axis.y2 > sheet.grid.y + sheet.grid.height);
  });

  void test("the instruction sits above the grid without touching the axis", () => {
    const sheet = layoutSymmetrySheet(FIVE_YEARS);

    assert.ok(sheet.instruction.y + INSTRUCTION_HEIGHT / 2 <= sheet.axis.y1);
  });

  void test("instruction, grid, and axis stay inside the 10 mm margin", () => {
    assertInsideMargin(layoutSymmetrySheet(FIVE_YEARS));
  });

  void test("the block is centered down the page", () => {
    const sheet = layoutSymmetrySheet(FIVE_YEARS);
    const above = sheet.instruction.y - INSTRUCTION_HEIGHT / 2 - INSET;
    const below = PAGE_HEIGHT - INSET - sheet.axis.y2;

    assert.ok(Math.abs(above - below) <= 1e-9, `${above} vs ${below}`);
  });

  void test("a grid too wide or too tall for the margin throws", () => {
    assert.throws(() => layoutSymmetrySheet({ ...FIVE_YEARS, columns: 13 }));
    assert.throws(() => layoutSymmetrySheet({ ...FIVE_YEARS, rows: 18 }));
    assert.throws(() => layoutSymmetrySheet({ ...FIVE_YEARS, cellSize: 16 }));
  });

  void test("a gap smaller than the axis overhang throws", () => {
    assert.throws(() => layoutSymmetrySheet({ ...FIVE_YEARS, instructionGap: 1 }));
  });
});

function assertInsideMargin(sheet: SymmetrySheetLayout): void {
  const min = INSET;
  const maxX = PAGE_WIDTH - INSET;
  const maxY = PAGE_HEIGHT - INSET;

  assert.ok(sheet.instruction.y - INSTRUCTION_HEIGHT / 2 >= min);
  assert.ok(sheet.grid.x >= min && sheet.grid.x + sheet.grid.width <= maxX);
  assert.ok(sheet.grid.y >= min && sheet.grid.y + sheet.grid.height <= maxY);
  assert.ok(sheet.axis.y1 >= min && sheet.axis.y2 <= maxY);
  assert.ok(sheet.axis.x1 >= min && sheet.axis.x1 <= maxX);
}
