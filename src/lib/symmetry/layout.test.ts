import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { SPEECH_BAND } from "../sheet/speech.ts";
import { layoutSymmetrySheet, type SymmetrySheetInput, type SymmetrySheetLayout } from "./layout.ts";
import { SYMMETRY_LEVELS } from "./levels.ts";
import { SYMMETRY_SHEET } from "./sheet.ts";

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
    assert.equal(sheet.axis.y1, sheet.grid.y - 4);
    assert.equal(sheet.axis.y2, sheet.grid.y + sheet.grid.height + 4);
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

  void test("the tallest grid that fits is laid out, one row more throws", () => {
    // 7 + 8 + 17 × 15 + 4 = 274 mm fits the 277 mm inside the margin; 18 rows need 289 mm.
    const tallest = layoutSymmetrySheet({ ...FIVE_YEARS, rows: 17 });

    assertInsideMargin(tallest);
    assert.throws(() => layoutSymmetrySheet({ ...FIVE_YEARS, rows: 18 }));
  });

  void test("a block that fills the margin exactly still fits", () => {
    // 7 + 8 + 16 × 16.125 + 4 = 277 mm, the full height inside the margin; 12 × 16.125 = 193.5 mm is too wide, so
    // the width is checked with 11 columns (177.375 mm).
    const exact = layoutSymmetrySheet({ ...FIVE_YEARS, columns: 11, cellSize: 16.125 });

    assert.equal(exact.instruction.y - INSTRUCTION_HEIGHT / 2, INSET);
    assert.equal(exact.axis.y2, PAGE_HEIGHT - INSET);
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

void describe("layoutSymmetrySheet with the speech band", () => {
  void test("every level fits inside the 10 mm margin with a 26 mm band instead of the 7 mm line", () => {
    for (const level of SYMMETRY_LEVELS) {
      const input = {
        pageWidth: SYMMETRY_SHEET.pageWidth,
        pageHeight: SYMMETRY_SHEET.pageHeight,
        inset: SYMMETRY_SHEET.inset,
        columns: level.columns,
        rows: level.rows,
        cellSize: level.cellSize,
        instructionGap: SYMMETRY_SHEET.instructionGap,
      };
      const plain = layoutSymmetrySheet({ ...input, instructionHeight: SYMMETRY_SHEET.instructionSize });
      const band = layoutSymmetrySheet({ ...input, instructionHeight: SPEECH_BAND.characterSize });

      const bandTop = band.instruction.y - SPEECH_BAND.characterSize / 2;
      assert.ok(bandTop >= INSET - 1e-9, `${level.id} band top ${bandTop}`);
      assert.ok(band.axis.y2 <= PAGE_HEIGHT - INSET + 1e-9, `${level.id} axis bottom ${band.axis.y2}`);
      assert.ok(band.grid.y > bandTop + SPEECH_BAND.characterSize, `${level.id} grid is under the band`);
      assert.equal(band.grid.width, plain.grid.width, `${level.id} keeps its cell size`);
      assert.equal(band.grid.height, plain.grid.height);
    }
  });
});
