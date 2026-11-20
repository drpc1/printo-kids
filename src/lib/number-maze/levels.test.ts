import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  DEFAULT_NUMBER_MAZE_LEVEL_ID,
  lastNumber,
  NUMBER_MAZE_LEVEL_IDS,
  NUMBER_MAZE_LEVELS,
  numberMazeLevelById,
} from "./levels.ts";

void describe("number-maze levels", () => {
  void test("six numbered levels, Poziom 1 by default", () => {
    assert.deepEqual(NUMBER_MAZE_LEVEL_IDS, ["poziom1", "poziom2", "poziom3", "poziom4", "poziom5", "poziom6"]);
    assert.equal(numberMazeLevelById(DEFAULT_NUMBER_MAZE_LEVEL_ID).id, "poziom1");
  });

  void test("the last numbers match the PRD table", () => {
    assert.deepEqual(NUMBER_MAZE_LEVELS.map(lastNumber), [15, 20, 30, 50, 60, 200]);
    assert.deepEqual(
      NUMBER_MAZE_LEVELS.map((level) => `${level.cols}x${level.rows}`),
      ["5x5", "5x6", "6x7", "8x9", "6x7", "7x8"],
    );
  });

  void test("every path fits the grid, leaves traps and keeps the parity of the shortest path", () => {
    for (const level of NUMBER_MAZE_LEVELS) {
      const shortest = level.cols + level.rows - 1;
      assert.ok(level.count < level.cols * level.rows, level.id);
      assert.ok(level.count > shortest, `${level.id} is not the shortest path`);
      assert.equal((level.count - shortest) % 2, 0, `${level.id} parity`);
    }
  });

  void test("an unknown id throws", () => {
    assert.throws(() => numberMazeLevelById("poziom9" as never));
  });
});
