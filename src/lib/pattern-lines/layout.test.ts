import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { instructionBoxHeight } from "../sheet/speech.ts";
import { layoutPatternLinesSheet } from "./layout.ts";
import { PATTERN_LINES_LEVELS } from "./levels.ts";
import { PATTERN_LINES_SHEET } from "./sheet.ts";

const EPSILON = 1e-6;
const WITH_CHARACTER = instructionBoxHeight(true, PATTERN_LINES_SHEET.plainInstructionSize);
const WITHOUT_CHARACTER = instructionBoxHeight(false, PATTERN_LINES_SHEET.plainInstructionSize);

void describe("layoutPatternLinesSheet", () => {
  void test("the instruction box is 26 mm with a character and 7 mm without", () => {
    assert.equal(WITH_CHARACTER, 26);
    assert.equal(WITHOUT_CHARACTER, 7);
  });

  for (const level of PATTERN_LINES_LEVELS) {
    for (const [name, boxHeight] of [
      ["with a character", WITH_CHARACTER],
      ["without a character", WITHOUT_CHARACTER],
    ] as const) {
      void describe(`${level.id} ${name}`, () => {
        const sheet = layoutPatternLinesSheet(level, boxHeight);

        void test("every row stays inside the 10 mm margin and below the instruction", () => {
          assert.equal(sheet.centers.length, level.rows);
          assert.ok(sheet.left >= 10 - EPSILON);
          assert.ok(sheet.left + sheet.length <= 200 + EPSILON);
          assert.ok(sheet.centers[0] - sheet.halfExtent >= 10 + boxHeight + 6 - EPSILON);
          assert.ok(sheet.centers[level.rows - 1] + sheet.halfExtent <= 287 - level.bottomPad + EPSILON);
        });

        void test("the steps between rows are equal and the rows do not overlap", () => {
          for (let i = 1; i < sheet.centers.length; i += 1) {
            assert.ok(Math.abs(sheet.centers[i] - sheet.centers[i - 1] - sheet.step) < EPSILON);
          }
          assert.ok(sheet.step >= 2 * sheet.halfExtent - EPSILON, `step ${sheet.step}`);
        });

        void test("the first row starts right under the instruction and the last ends at the bottom margin", () => {
          assert.ok(Math.abs(sheet.centers[0] - sheet.halfExtent - (10 + boxHeight + 6)) < EPSILON);
          assert.ok(Math.abs(sheet.centers[level.rows - 1] + sheet.halfExtent - (287 - level.bottomPad)) < EPSILON);
        });
      });
    }
  }

  void test("level 1 leaves 15 mm more at the bottom than level 2 at the same row height", () => {
    const first = layoutPatternLinesSheet(PATTERN_LINES_LEVELS[0], WITH_CHARACTER);
    const bottom = first.centers[first.centers.length - 1] + first.halfExtent;
    assert.ok(Math.abs(287 - bottom - 15) < EPSILON);
    const second = layoutPatternLinesSheet(PATTERN_LINES_LEVELS[1], WITH_CHARACTER);
    assert.ok(Math.abs(287 - (second.centers[4] + second.halfExtent)) < EPSILON);
  });

  void test("the band starts at the margin and has the height it was given", () => {
    assert.deepEqual(layoutPatternLinesSheet(PATTERN_LINES_LEVELS[1], WITH_CHARACTER).band, { y: 10, height: 26 });
  });

  void test("throws when there is no room under the instruction", () => {
    assert.throws(() => layoutPatternLinesSheet(PATTERN_LINES_LEVELS[3], 300));
  });

  void test("throws when the rows would overlap", () => {
    assert.throws(() => layoutPatternLinesSheet({ ...PATTERN_LINES_LEVELS[3], rows: 14 }, WITH_CHARACTER));
  });
});
