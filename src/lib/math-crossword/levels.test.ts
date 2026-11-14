import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  DEFAULT_MATH_CROSSWORD_LEVEL_ID,
  EQUATION_TOLERANCE,
  MATH_CROSSWORD_LEVELS,
  mathCrosswordLevelById,
} from "./levels.ts";

void describe("MATH_CROSSWORD_LEVELS", () => {
  void test("seven numbered levels in the order of the PRD table, default Poziom 2", () => {
    assert.deepEqual(
      MATH_CROSSWORD_LEVELS.map((level) => [level.id, level.label, level.barLabel]),
      [1, 2, 3, 4, 5, 6, 7].map((n) => [`poziom${n}`, `Poziom ${n}`, String(n)]),
    );
    assert.equal(DEFAULT_MATH_CROSSWORD_LEVEL_ID, "poziom2");
  });

  void test("the table: signs, greatest number, equations, cell, empty share, blanks per equation, chain", () => {
    const row = (id: string): (string | number)[] => {
      const level = MATH_CROSSWORD_LEVELS.find((candidate) => candidate.id === id);
      assert.ok(level);
      return [
        level.ops.join(" "),
        level.max,
        level.equations,
        level.maxCell,
        level.blankShare,
        level.maxBlanksPerEquation,
        level.maxChain,
      ];
    };
    assert.deepEqual(row("poziom1"), ["+", 10, 5, 26, 0.4, 1, 1]);
    assert.deepEqual(row("poziom2"), ["+ −", 10, 9, 24, 0.45, 1, 1]);
    assert.deepEqual(row("poziom3"), ["+ −", 20, 13, 17, 0.5, 2, 2]);
    assert.deepEqual(row("poziom4"), ["+ −", 100, 12, 16, 0.5, 2, 3]);
    assert.deepEqual(row("poziom5"), ["·", 30, 12, 16, 0.5, 2, 3]);
    assert.deepEqual(row("poziom6"), ["· :", 50, 15, 14.5, 0.55, 2, 4]);
    assert.deepEqual(row("poziom7"), ["+ − · :", 100, 20, 13.5, 0.6, 2, 4]);
  });

  void test("descriptions name no age and the tolerance is one equation", () => {
    for (const level of MATH_CROSSWORD_LEVELS) {
      assert.ok(level.description.length > 0);
      assert.ok(!/lat|rok/.test(level.description), level.description);
    }
    assert.equal(EQUATION_TOLERANCE, 1);
  });

  void test("mathCrosswordLevelById finds every level and throws for an unknown one", () => {
    for (const level of MATH_CROSSWORD_LEVELS) {
      assert.equal(mathCrosswordLevelById(level.id), level);
    }
    assert.throws(() => mathCrosswordLevelById("poziom9" as never), /Unknown math-crossword level/);
  });
});
