import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { instructionBoxHeight } from "../sheet/speech.ts";
import { layoutCopyDrawingSheet } from "./layout.ts";
import { COPY_DRAWING_LEVELS } from "./levels.ts";
import { COPY_DRAWING_SHEET } from "./sheet.ts";

const EPSILON = 1e-6;
const WITH_CHARACTER = instructionBoxHeight(true, COPY_DRAWING_SHEET.plainInstructionSize);
const WITHOUT_CHARACTER = instructionBoxHeight(false, COPY_DRAWING_SHEET.plainInstructionSize);

void describe("layoutCopyDrawingSheet", () => {
  void test("the instruction box is 26 mm with a character and 7 mm without", () => {
    assert.equal(WITH_CHARACTER, 26);
    assert.equal(WITHOUT_CHARACTER, 7);
  });

  for (const level of COPY_DRAWING_LEVELS) {
    for (const [name, boxHeight] of [
      ["with a character", WITH_CHARACTER],
      ["without a character", WITHOUT_CHARACTER],
    ] as const) {
      void describe(`${level.id} ${name}`, () => {
        const sheet = layoutCopyDrawingSheet(level, boxHeight);

        void test("both grids stay inside the 10 mm margin", () => {
          for (const grid of [sheet.source, sheet.copy]) {
            assert.ok(grid.x >= 10 - EPSILON, `left ${grid.x}`);
            assert.ok(grid.x + grid.width <= 200 + EPSILON, `right ${grid.x + grid.width}`);
            assert.ok(grid.y >= sheet.band.y + boxHeight + 6 - EPSILON, `top ${grid.y}`);
            assert.ok(grid.y + grid.height <= 287 + EPSILON, `bottom ${grid.y + grid.height}`);
          }
        });

        void test("the cell is the nominal one: 11, 7.5 and 5 mm", () => {
          assert.equal(sheet.cell, level.cellSize);
          assert.equal(sheet.source.width, level.size.columns * sheet.cell);
          assert.equal(sheet.source.height, level.size.rows * sheet.cell);
        });

        void test("the grids are equal, side by side, 10 mm apart and on the same height", () => {
          assert.equal(sheet.copy.width, sheet.source.width);
          assert.equal(sheet.copy.height, sheet.source.height);
          assert.equal(sheet.copy.y, sheet.source.y);
          assert.ok(Math.abs(sheet.copy.x - (sheet.source.x + sheet.source.width) - 10) < EPSILON);
        });

        void test("the instruction and the grids are one block centered across and down the page, the grids 6 mm under the instruction", () => {
          const left = sheet.source.x - 10;
          const right = 200 - (sheet.copy.x + sheet.copy.width);
          assert.ok(Math.abs(left - right) < EPSILON, `${left} vs ${right}`);
          assert.ok(Math.abs(sheet.source.y - (sheet.band.y + boxHeight + 6)) < EPSILON, `gap ${sheet.source.y}`);
          const topGap = sheet.band.y - 10;
          const bottomGap = 287 - (sheet.source.y + sheet.source.height);
          assert.ok(Math.abs(topGap - bottomGap) < EPSILON, `${topGap} vs ${bottomGap}`);
          assert.ok(sheet.band.y >= 10 - EPSILON, `band starts at ${sheet.band.y}`);
          assert.ok(sheet.source.y + sheet.source.height <= 287 + EPSILON);
        });
      });
    }
  }

  void test("the hard level fills exactly 190 mm of width", () => {
    const sheet = layoutCopyDrawingSheet(COPY_DRAWING_LEVELS[2], WITH_CHARACTER);
    assert.ok(Math.abs(sheet.copy.x + sheet.copy.width - sheet.source.x - 190) < EPSILON);
    assert.ok(Math.abs(sheet.source.x - 10) < EPSILON);
  });

  void test("the band has the height it was given and starts inside the margin", () => {
    const sheet = layoutCopyDrawingSheet(COPY_DRAWING_LEVELS[1], WITH_CHARACTER);
    assert.equal(sheet.band.height, 26);
    assert.ok(sheet.band.y >= 10);
  });

  void test("throws for a cell too large for the width instead of shrinking it", () => {
    const level = { ...COPY_DRAWING_LEVELS[2], cellSize: 20 };
    assert.throws(() => layoutCopyDrawingSheet(level, WITH_CHARACTER));
  });

  void test("the page is A4 and a level that does not fit is refused with a message that names the grids", () => {
    const base = COPY_DRAWING_LEVELS[0];
    const sheet = layoutCopyDrawingSheet(base, WITHOUT_CHARACTER);
    assert.deepEqual(sheet.page, { width: 210, height: 297 });
    const tooWide = { ...base, size: { ...base.size, columns: 12, rows: 1 }, cellSize: 7.6 };
    assert.throws(
      () => layoutCopyDrawingSheet(tooWide, WITHOUT_CHARACTER),
      /Two 12 by 1 grids of 7\.6 mm do not fit inside the 10 mm page margin/,
    );
  });

  void test("the cell is refused when it is a little over what width and height allow", () => {
    const base = COPY_DRAWING_LEVELS[0];
    // 12 columns: (210 - 20 - 10) / 24 = 7.5 mm.
    const wide = { ...base, size: { ...base.size, columns: 12, rows: 1 } };
    assert.doesNotThrow(() => layoutCopyDrawingSheet({ ...wide, cellSize: 7.5 }, WITHOUT_CHARACTER));
    assert.throws(() => layoutCopyDrawingSheet({ ...wide, cellSize: 7.6 }, WITHOUT_CHARACTER));
    // 20 rows with a plain line: (297 - 20 - 7 - 6) / 20 = 13.2 mm.
    const tall = { ...base, size: { ...base.size, columns: 1, rows: 20 } };
    assert.doesNotThrow(() => layoutCopyDrawingSheet({ ...tall, cellSize: 13.2 }, WITHOUT_CHARACTER));
    assert.throws(() => layoutCopyDrawingSheet({ ...tall, cellSize: 13.3 }, WITHOUT_CHARACTER));
  });

  void test("throws when there is no room under the instruction", () => {
    assert.throws(() => layoutCopyDrawingSheet(COPY_DRAWING_LEVELS[0], 300));
  });
});
