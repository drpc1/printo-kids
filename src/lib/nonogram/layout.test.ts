import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { composeNonogramCard, nonogramVariants } from "./generate.ts";
import { composeSimpleNonogramCard } from "./simple.ts";
import {
  blockLines,
  layoutNonogramSheet,
  layoutSimpleNonogramSheet,
  longestClues,
  type NonogramSheetInput,
  type SimpleNonogramSheetInput,
} from "./layout.ts";
import { NONOGRAM_SHEET, NONOGRAM_SIMPLE_SHEET } from "./sheet.ts";
import { CLASSIC_NONOGRAM_SIZES, nonogramSizeById, type NonogramSize } from "./sizes.ts";

const INSET = NONOGRAM_SHEET.inset;
const SLOT_FACTOR = NONOGRAM_SHEET.clueSlot;

/** The longest row and column clue lists over every variant of the size. */
function longestOverVariants(size: NonogramSize): { maxRowClues: number; maxColumnClues: number } {
  let maxRowClues = 0;
  let maxColumnClues = 0;
  for (const { template, variants } of nonogramVariants(size)) {
    const longest = longestClues(composeNonogramCard(template, variants, size).clues);
    maxRowClues = Math.max(maxRowClues, longest.maxRowClues);
    maxColumnClues = Math.max(maxColumnClues, longest.maxColumnClues);
  }
  return { maxRowClues, maxColumnClues };
}

function inputFor(size: NonogramSize, longest = longestOverVariants(size)): NonogramSheetInput {
  return {
    pageWidth: NONOGRAM_SHEET.pageWidth,
    pageHeight: NONOGRAM_SHEET.pageHeight,
    inset: INSET,
    columns: size.columns,
    rows: size.rows,
    cellSize: size.cellSize,
    digitSize: size.digitSize,
    instructionSize: NONOGRAM_SHEET.instructionSize,
    instructionGap: NONOGRAM_SHEET.instructionGap,
    clueGap: NONOGRAM_SHEET.clueGap,
    clueSlot: NONOGRAM_SHEET.clueSlot,
    ...longest,
  };
}

void describe("layoutNonogramSheet", () => {
  for (const size of CLASSIC_NONOGRAM_SIZES) {
    void test(`the ${size.id} block with the longest clues stays inside the 10 mm margin`, (t) => {
      const input = inputFor(size);
      const sheet = layoutNonogramSheet(input);
      const slot = size.digitSize * SLOT_FACTOR;
      const left = sheet.rowClueX(input.maxRowClues - 1) - slot / 2;
      const top = sheet.columnClueY(input.maxColumnClues - 1) - slot / 2;
      const right = sheet.grid.x + sheet.grid.width;
      const bottom = sheet.grid.y + sheet.grid.height;
      const instructionTop = sheet.instruction.y - NONOGRAM_SHEET.instructionSize / 2;

      assert.ok(left >= INSET, `left ${left}`);
      assert.ok(right <= NONOGRAM_SHEET.pageWidth - INSET, `right ${right}`);
      assert.ok(instructionTop >= INSET, `instruction top ${instructionTop}`);
      assert.ok(top >= instructionTop + NONOGRAM_SHEET.instructionSize, "column clues below the instruction");
      assert.ok(bottom <= NONOGRAM_SHEET.pageHeight - INSET, `bottom ${bottom}`);

      t.diagnostic(`${size.id}: block ${(right - left).toFixed(1)} x ${(bottom - instructionTop).toFixed(1)} mm`);
    });
  }

  void test("the block is centered across and down the page", () => {
    const size = nonogramSizeById("sredni");
    const input = inputFor(size);
    const sheet = layoutNonogramSheet(input);
    const slot = size.digitSize * SLOT_FACTOR;
    const left = sheet.rowClueX(input.maxRowClues - 1) - slot / 2;
    const rightGap = NONOGRAM_SHEET.pageWidth - (sheet.grid.x + sheet.grid.width);
    const bottomGap = NONOGRAM_SHEET.pageHeight - (sheet.grid.y + sheet.grid.height);
    const topGap = sheet.instruction.y - NONOGRAM_SHEET.instructionSize / 2;

    assert.ok(Math.abs(left - rightGap) <= 1e-9, `${left} vs ${rightGap}`);
    assert.ok(Math.abs(topGap - bottomGap) <= 1e-9, `${topGap} vs ${bottomGap}`);
    assert.equal(sheet.instruction.x, NONOGRAM_SHEET.pageWidth / 2);
  });

  void test("clue index 0 sits next to the grid and the index grows outward", () => {
    const size = nonogramSizeById("sredni");
    const sheet = layoutNonogramSheet(inputFor(size));
    const slot = size.digitSize * SLOT_FACTOR;

    assert.ok(Math.abs(sheet.rowClueX(0) - (sheet.grid.x - NONOGRAM_SHEET.clueGap - slot / 2)) <= 1e-9);
    assert.ok(Math.abs(sheet.rowClueX(0) - sheet.rowClueX(1) - slot) <= 1e-9);
    assert.ok(Math.abs(sheet.columnClueY(0) - (sheet.grid.y - NONOGRAM_SHEET.clueGap - slot / 2)) <= 1e-9);
    assert.ok(Math.abs(sheet.columnClueY(0) - sheet.columnClueY(1) - slot) <= 1e-9);
  });

  void test("the grid is the columns and rows times the cell size", () => {
    const size = nonogramSizeById("latwy");
    const sheet = layoutNonogramSheet(inputFor(size));

    assert.equal(sheet.grid.width, 8 * 14);
    assert.equal(sheet.grid.height, 12 * 14);
    assert.deepEqual(sheet.page, { width: 210, height: 297 });
  });

  void test("a setting too big for the margin throws", () => {
    const size = nonogramSizeById("sredni");
    const input = inputFor(size);

    assert.throws(() => layoutNonogramSheet({ ...input, cellSize: size.cellSize + 2 }));
    assert.throws(() => layoutNonogramSheet({ ...input, rows: size.rows + 8 }));
    assert.throws(() => layoutNonogramSheet({ ...input, maxRowClues: 20 }));
    assert.throws(() => layoutNonogramSheet({ ...input, maxColumnClues: 20 }));
  });

  void test("a block that fills the width exactly still fits", () => {
    // 190 mm inside the margin = 10 columns of 15 mm + a 40 mm band (5 numbers of 7.5 mm + 2.5 mm gap).
    const sheet = layoutNonogramSheet({
      ...inputFor(nonogramSizeById("sredni")),
      columns: 10,
      rows: 10,
      cellSize: 15,
      digitSize: 5,
      clueSlot: 1.5,
      clueGap: 2.5,
      maxRowClues: 5,
      maxColumnClues: 1,
    });

    assert.equal(sheet.rowClueX(4) - 3.75, INSET);
    assert.equal(sheet.grid.x + sheet.grid.width, NONOGRAM_SHEET.pageWidth - INSET);
  });
});

void describe("blockLines", () => {
  void test("a thicker line every 5, and the closing line (12 columns give 0, 5, 10, 12)", () => {
    assert.deepEqual(blockLines(12), [0, 5, 10, 12]);
  });

  void test("a count that is a multiple of 5 closes once", () => {
    assert.deepEqual(blockLines(10), [0, 5, 10]);
    assert.deepEqual(blockLines(8), [0, 5, 8]);
  });
});

void describe("longestClues", () => {
  void test("counts the numbers of the longest row and column clue", () => {
    assert.deepEqual(longestClues({ rows: [[1], [2, 3, 1]], columns: [[4], [1, 1]] }), {
      maxRowClues: 3,
      maxColumnClues: 2,
    });
  });
});

function simpleInputFor(maxRuns: number): SimpleNonogramSheetInput {
  const easy = nonogramSizeById("latwy");
  return {
    pageWidth: NONOGRAM_SHEET.pageWidth,
    pageHeight: NONOGRAM_SHEET.pageHeight,
    inset: INSET,
    columns: easy.columns,
    rows: easy.rows,
    cellSize: easy.cellSize,
    maxRuns,
    instructionSize: NONOGRAM_SHEET.instructionSize,
    instructionGap: NONOGRAM_SHEET.instructionGap * 2,
    chipSize: NONOGRAM_SIMPLE_SHEET.chipSize,
    chipGap: NONOGRAM_SIMPLE_SHEET.chipGap,
    bandGap: NONOGRAM_SIMPLE_SHEET.bandGap,
  };
}

void describe("layoutSimpleNonogramSheet", () => {
  void test("every variant of the easy level stays inside the 10 mm margin, with the longest row of chips", () => {
    const easy = nonogramSizeById("latwy");
    let longest = 0;
    for (const { template, variants } of nonogramVariants(easy)) {
      const card = composeSimpleNonogramCard(template, variants, easy);
      longest = Math.max(longest, ...card.runs.map((row) => row.length));
    }
    const sheet = layoutSimpleNonogramSheet(simpleInputFor(longest));
    const left = sheet.chipX(0, longest);
    const right = sheet.grid.x + sheet.grid.width;
    const instructionTop = sheet.instruction.y - NONOGRAM_SHEET.instructionSize / 2;

    assert.ok(left >= INSET, `left ${left}`);
    assert.ok(right <= NONOGRAM_SHEET.pageWidth - INSET, `right ${right}`);
    assert.ok(instructionTop >= INSET, `instruction top ${instructionTop}`);
    assert.ok(sheet.grid.y + sheet.grid.height <= NONOGRAM_SHEET.pageHeight - INSET);
  });

  void test("chips sit right-aligned against the grid, centered in their row, and never overlap", () => {
    const sheet = layoutSimpleNonogramSheet(simpleInputFor(5));
    const chip = NONOGRAM_SIMPLE_SHEET.chipSize;

    assert.ok(Math.abs(sheet.chipX(4, 5) + chip - (sheet.grid.x - NONOGRAM_SIMPLE_SHEET.bandGap)) <= 1e-9);
    assert.ok(sheet.chipX(1, 5) - (sheet.chipX(0, 5) + chip) >= NONOGRAM_SIMPLE_SHEET.chipGap - 1e-9);
    assert.ok(Math.abs(sheet.chipY(0) - (sheet.grid.y + (14 - chip) / 2)) <= 1e-9);
    assert.ok(Math.abs(sheet.chipX(0, 1) - (sheet.grid.x - NONOGRAM_SIMPLE_SHEET.bandGap - chip)) <= 1e-9);
  });

  void test("a row with more chips than fit beside the grid throws", () => {
    assert.throws(() => layoutSimpleNonogramSheet(simpleInputFor(9)));
  });
});
