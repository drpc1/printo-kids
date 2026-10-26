import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DEFAULT_SEQUENCE_LEVEL_ID, SEQUENCE_LEVELS, sequenceLevelById } from "./levels.ts";

void describe("SEQUENCE_LEVELS", () => {
  void test("are the four levels of the PRD table (hand-written oracle)", () => {
    assert.deepEqual(
      SEQUENCE_LEVELS.map(({ id, fieldsPerRow, rowCount, gaps, extraGapRows, gapPlacement }) => [
        id,
        fieldsPerRow,
        rowCount,
        gaps,
        extraGapRows,
        gapPlacement,
      ]),
      [
        ["lat4", 5, 5, 1, 0, "end"],
        ["lat5", 7, 6, 1, 3, "end"],
        ["lat6", 8, 7, 2, 0, "free"],
        ["lat7", 8, 7, 2, 3, "free"],
      ],
    );
  });

  void test("names, bar labels, descriptions and typical ages are the approved wording", () => {
    assert.deepEqual(
      SEQUENCE_LEVELS.map(({ label, barLabel, description, typicalAge }) => [label, barLabel, description, typicalAge]),
      [
        ["Poziom 1", "1", "dwa kształty na zmianę, 1 puste pole", "zwykle ok. 4 lata"],
        ["Poziom 2", "2", "wzory z kształtów, 1–2 puste pola", "zwykle ok. 5 lat"],
        ["Poziom 3", "3", "liczby i wzory, 2 puste pola", "zwykle ok. 6 lat"],
        ["Poziom 4", "4", "kształt z liczbą, liczby w dół, grupy; 2–3 puste pola", "zwykle ok. 7 lat"],
      ],
    );
    for (const level of SEQUENCE_LEVELS) {
      assert.doesNotMatch(level.label + level.barLabel, /lat|nastolat/, level.id);
    }
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
