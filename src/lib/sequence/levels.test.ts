import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DEFAULT_SEQUENCE_LEVEL_ID, SEQUENCE_LEVELS, sequenceLevelById } from "./levels.ts";

void describe("SEQUENCE_LEVELS", () => {
  void test("are the four age levels of the PRD table (hand-written oracle)", () => {
    assert.deepEqual(
      SEQUENCE_LEVELS.map(({ id, label, fieldsPerRow, rowCount, gaps, extraGapRows, gapPlacement }) => [
        id,
        label,
        fieldsPerRow,
        rowCount,
        gaps,
        extraGapRows,
        gapPlacement,
      ]),
      [
        ["lat4", "4 lata", 5, 5, 1, 0, "end"],
        ["lat5", "5 lat", 7, 6, 1, 3, "end"],
        ["lat6", "6 lat", 8, 7, 2, 0, "free"],
        ["lat7", "7 lat", 8, 7, 2, 3, "free"],
      ],
    );
  });

  void test("each level names the rules of the PRD table", () => {
    assert.deepEqual(
      SEQUENCE_LEVELS.map((level) => level.rules.map(({ rule }) => rule)),
      [["AB"], ["AB", "AAB", "ABC"], ["up1", "up2", "AB", "AAB", "ABC"], ["mixed", "down1", "groups"]],
    );
  });

  void test("the minimum rows of the rules fit in the rows of the card", () => {
    for (const level of SEQUENCE_LEVELS) {
      const required = level.rules.reduce((sum, { minRows }) => sum + minRows, 0);
      assert.ok(required <= level.rowCount, level.id);
    }
  });

  void test("the default level is 5 lat, the setting of the first sequence card", () => {
    assert.equal(DEFAULT_SEQUENCE_LEVEL_ID, "lat5");
    assert.equal(sequenceLevelById(DEFAULT_SEQUENCE_LEVEL_ID).fieldsPerRow, 7);
  });
});
