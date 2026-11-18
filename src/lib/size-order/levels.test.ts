import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { SIZE_ORDER_LEVELS, sizeOrderLevelById } from "./levels.ts";

void describe("size-order levels", () => {
  void test("three levels with 3 / 4 / 5 pictures and 4 / 4 / 5 rows", () => {
    assert.deepEqual(
      SIZE_ORDER_LEVELS.map((level) => [level.id, level.itemCount, level.rowCount]),
      [
        ["latwy", 3, 4],
        ["sredni", 4, 4],
        ["trudny", 5, 5],
      ],
    );
  });

  void test("heights rise to 1 and keep the smallest step of the level", () => {
    for (const level of SIZE_ORDER_LEVELS) {
      assert.equal(level.heights.length, level.itemCount);
      assert.equal(level.heights[level.heights.length - 1], 1);
      for (let i = 1; i < level.heights.length; i++) {
        assert.ok(level.heights[i] / level.heights[i - 1] >= level.minStep, `${level.id} step ${i}`);
      }
    }
  });

  void test("a finer level has a smaller step", () => {
    const steps = SIZE_ORDER_LEVELS.map((level) => level.minStep);
    assert.deepEqual(
      [...steps].sort((a, b) => b - a),
      steps,
    );
  });

  void test("a level is found by id", () => {
    assert.equal(sizeOrderLevelById("sredni").itemCount, 4);
    assert.throws(() => sizeOrderLevelById("nope" as never));
  });
});
