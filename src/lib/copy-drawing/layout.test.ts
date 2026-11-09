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
            assert.ok(grid.y >= 10 + boxHeight + 6 - EPSILON, `top ${grid.y}`);
            assert.ok(grid.y + grid.height <= 287 + EPSILON, `bottom ${grid.y + grid.height}`);
          }
        });

        void test("the cell is the nominal one: 10, 7 and 5 mm", () => {
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

        void test("the block is centered across the page and down the area under the instruction", () => {
          const left = sheet.source.x - 10;
          const right = 200 - (sheet.copy.x + sheet.copy.width);
          assert.ok(Math.abs(left - right) < EPSILON, `${left} vs ${right}`);
          const above = sheet.source.y - (10 + boxHeight + 6);
          const below = 287 - (sheet.source.y + sheet.source.height);
          assert.ok(Math.abs(above - below) < EPSILON, `${above} vs ${below}`);
        });
      });
    }
  }

  void test("the hard level fills exactly 190 mm of width", () => {
    const sheet = layoutCopyDrawingSheet(COPY_DRAWING_LEVELS[2], WITH_CHARACTER);
    assert.ok(Math.abs(sheet.copy.x + sheet.copy.width - sheet.source.x - 190) < EPSILON);
    assert.ok(Math.abs(sheet.source.x - 10) < EPSILON);
  });

  void test("the band starts at the margin and has the height it was given", () => {
    const sheet = layoutCopyDrawingSheet(COPY_DRAWING_LEVELS[1], WITH_CHARACTER);
    assert.deepEqual(sheet.band, { y: 10, height: 26 });
  });

  void test("throws for a cell too large for the width instead of shrinking it", () => {
    const level = { ...COPY_DRAWING_LEVELS[2], cellSize: 20 };
    assert.throws(() => layoutCopyDrawingSheet(level, WITH_CHARACTER));
  });

  void test("throws when there is no room under the instruction", () => {
    assert.throws(() => layoutCopyDrawingSheet(COPY_DRAWING_LEVELS[0], 300));
  });
});
