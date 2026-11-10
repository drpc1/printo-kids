import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  DEFAULT_PATTERN_LINES_LEVEL_ID,
  PATTERN_LINES_LEVELS,
  patternLinesHasGuides,
  patternLinesLevelById,
} from "./levels.ts";
import { PATTERNS } from "./patterns.ts";
import { PATTERN_LINES_SHEET } from "./sheet.ts";

void describe("PATTERN_LINES_LEVELS", () => {
  void test("four levels with 4, 5, 6 and 7 rows", () => {
    assert.deepEqual(
      PATTERN_LINES_LEVELS.map((level) => [level.id, level.rows]),
      [
        ["poziom1", 4],
        ["poziom2", 5],
        ["poziom3", 6],
        ["poziom4", 7],
      ],
    );
  });

  void test("steps, heights and gentleness are the PRD table", () => {
    assert.deepEqual(
      PATTERN_LINES_LEVELS.map((level) => [level.period, level.ratio, level.maxHeight, level.bottomPad]),
      [
        [[40, 52], [0.2, 0.42], 20, 15],
        [[30, 42], [0.35, 0.6], 18, 0],
        [[22, 30], [0.5, 0.85], 15, 0],
        [[12, 20], null, 13, 0],
      ],
    );
  });

  void test("labels are Poziom N, the bar shows N, and the description names no age", () => {
    for (const [index, level] of PATTERN_LINES_LEVELS.entries()) {
      assert.equal(level.label, `Poziom ${index + 1}`);
      assert.equal(level.barLabel, String(index + 1));
      assert.doesNotMatch(level.description, /lat/);
    }
  });

  void test("the modes are dots, dots, dots then free and a drawn line; only level 4 is ruled", () => {
    assert.deepEqual(
      PATTERN_LINES_LEVELS.map((level) => [level.mode, level.ruled, level.repeats]),
      [
        ["dots", false, 0],
        ["dots", false, 0],
        ["dotsThenFree", false, 2],
        ["line", true, 3],
      ],
    );
  });

  void test("every pool is made of known patterns, without repeats, and holds at least as many as the rows", () => {
    const known = new Set(PATTERNS.map((pattern) => pattern.id));
    for (const level of PATTERN_LINES_LEVELS) {
      assert.equal(new Set(level.pool).size, level.pool.length, level.id);
      assert.ok(
        level.pool.every((id) => known.has(id)),
        level.id,
      );
      assert.ok(level.pool.length >= level.rows, level.id);
    }
  });

  void test("the rejected patterns are in no pool", () => {
    for (const level of PATTERN_LINES_LEVELS) {
      assert.ok(!(level.pool as readonly string[]).includes("bolt"), level.id);
      assert.ok(!(level.pool as readonly string[]).includes("pyramid"), level.id);
    }
  });

  void test("the instruction of each level is the sentence of its mode", () => {
    assert.equal(patternLinesLevelById("poziom1").instruction, PATTERN_LINES_SHEET.instructions.dots);
    assert.equal(patternLinesLevelById("poziom2").instruction, PATTERN_LINES_SHEET.instructions.dots);
    assert.equal(patternLinesLevelById("poziom3").instruction, PATTERN_LINES_SHEET.instructions.dotsThenFree);
    assert.equal(patternLinesLevelById("poziom4").instruction, PATTERN_LINES_SHEET.instructions.line);
  });

  void test("the default level is level 2", () => {
    assert.equal(DEFAULT_PATTERN_LINES_LEVEL_ID, "poziom2");
  });

  void test("the Linie switch exists on levels 3 and 4 only", () => {
    assert.deepEqual(
      PATTERN_LINES_LEVELS.map((level) => patternLinesHasGuides(level.id)),
      [false, false, true, true],
    );
  });

  void test("an unknown level throws", () => {
    assert.throws(() => patternLinesLevelById("poziom9" as never));
  });
});
