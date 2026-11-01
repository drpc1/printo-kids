import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DEFAULT_MONEY_LEVEL_ID, MONEY_LEVELS, moneyLevelById } from "./levels.ts";

void describe("MONEY_LEVELS", () => {
  void test("three levels in order, named without an age", () => {
    assert.deepEqual(
      MONEY_LEVELS.map((level) => [level.id, level.label, level.barLabel]),
      [
        ["latwy", "łatwy", "łatwy"],
        ["sredni", "średni", "średni"],
        ["trudny", "trudny", "trudny"],
      ],
    );
    for (const level of MONEY_LEVELS) {
      assert.ok(level.description.length > 0);
      assert.ok(!level.description.includes(" lat"), level.description);
    }
  });

  void test("the table of the plan: nominals, largest pile and pieces per level", () => {
    assert.deepEqual(
      MONEY_LEVELS.map((level) => [level.id, level.nominals, level.maxSum, level.maxPieces]),
      [
        ["latwy", [1, 2, 5], 10, 5],
        ["sredni", [1, 2, 5], 20, 8],
        ["trudny", [1, 2, 5, 10, 20], 50, 10],
      ],
    );
  });

  void test("every level has five rows; łatwy never misleads, średni has exactly 2, trudny at least 3", () => {
    assert.deepEqual(
      MONEY_LEVELS.map((level) => [level.id, level.rowCount, level.misleadingMin, level.misleadingMax]),
      [
        ["latwy", 5, 0, 0],
        ["sredni", 5, 2, 2],
        ["trudny", 5, 3, 5],
      ],
    );
  });

  void test("the first level has coins only", () => {
    assert.ok(moneyLevelById("latwy").nominals.every((value) => value < 10));
  });

  void test("the default is średni and lookups work", () => {
    assert.equal(DEFAULT_MONEY_LEVEL_ID, "sredni");
    assert.equal(moneyLevelById("trudny").label, "trudny");
    assert.throws(() => moneyLevelById("lat5" as never));
  });
});
