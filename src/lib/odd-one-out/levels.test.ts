import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DEFAULT_ODD_ONE_OUT_LEVEL_ID, ODD_ONE_OUT_LEVELS, oddOneOutLevelById, rulesFor } from "./levels.ts";

void describe("ODD_ONE_OUT_LEVELS", () => {
  void test("three levels in order, named without an age", () => {
    assert.deepEqual(
      ODD_ONE_OUT_LEVELS.map((level) => [level.id, level.label, level.barLabel]),
      [
        ["latwy", "łatwy", "łatwy"],
        ["sredni", "średni", "średni"],
        ["trudny", "trudny", "trudny"],
      ],
    );
    for (const level of ODD_ONE_OUT_LEVELS) {
      assert.ok(level.description.length > 0);
      assert.ok(!level.description.includes(" lat"), level.description);
    }
  });

  void test("the table of the plan: pictures, rows, rules, distractors, small size and group sizes", () => {
    assert.deepEqual(
      ODD_ONE_OUT_LEVELS.map((level) => [
        level.id,
        level.itemCount,
        level.rowCount,
        level.rules,
        level.distractors,
        level.smallRatio,
        level.counts,
      ]),
      [
        ["latwy", 4, 5, ["shape", "size"], 0, 0.5, []],
        ["sredni", 5, 5, ["shape", "size", "count", "color"], 1, 0.55, [2, 3]],
        ["trudny", 6, 6, ["shape", "size", "count", "color", "category"], 2, 0.72, [4, 5]],
      ],
    );
  });

  void test("the default is średni and lookups work", () => {
    assert.equal(DEFAULT_ODD_ONE_OUT_LEVEL_ID, "sredni");
    assert.equal(oddOneOutLevelById("trudny").label, "trudny");
    assert.throws(() => oddOneOutLevelById("lat5" as never));
  });
});

void describe("rulesFor", () => {
  void test("the color rule needs colors on", () => {
    assert.deepEqual(rulesFor(oddOneOutLevelById("latwy"), true), ["shape", "size"]);
    assert.deepEqual(rulesFor(oddOneOutLevelById("sredni"), false), ["shape", "size", "count"]);
    assert.deepEqual(rulesFor(oddOneOutLevelById("sredni"), true), ["shape", "size", "count", "color"]);
    assert.deepEqual(rulesFor(oddOneOutLevelById("trudny"), false), ["shape", "size", "count", "category"]);
    assert.deepEqual(rulesFor(oddOneOutLevelById("trudny"), true), ["shape", "size", "count", "color", "category"]);
  });
});
