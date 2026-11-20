import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { neighbours, numberMazeCardKey, numberMazeCardProblems } from "./card.ts";
import { generateNumberMazeCard, randomPath } from "./generate.ts";
import { lastNumber, NUMBER_MAZE_LEVELS } from "./levels.ts";

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = 100;

void describe("generateNumberMazeCard", () => {
  for (const level of NUMBER_MAZE_LEVELS) {
    void test(`${level.id}: ${SEEDS} cards are legal, with tempting traps`, () => {
      for (let seed = 1; seed <= SEEDS; seed += 1) {
        const card = generateNumberMazeCard(seeded(seed), level);
        assert.ok(card !== null, `seed ${seed}`);
        assert.deepEqual(numberMazeCardProblems(card, level), [], `seed ${seed}`);
        // A trap next to the path stands at most `near` steps from a path number beside it (PRD: tempting).
        const position = new Map(card.path.map((cell, index) => [cell, index]));
        card.values.forEach((value, cell) => {
          if (position.has(cell)) return;
          const beside = neighbours(cell, level.cols, level.rows)
            .map((next) => position.get(next))
            .filter((index): index is number => index !== undefined);
          if (beside.length === 0) return;
          const steps = Math.min(...beside.map((index) => Math.abs((value - level.first) / level.step - index)));
          assert.ok(steps <= level.near, `seed ${seed}: trap ${value} is ${steps} steps away`);
        });
      }
    });
  }

  void test("the path ends on the goal with the last number", () => {
    const level = NUMBER_MAZE_LEVELS[3];
    const path = randomPath(level, seeded(5));
    assert.ok(path !== null);
    assert.equal(path.length, level.count);
    assert.equal(path.at(-1), level.cols * level.rows - 1);
    const card = generateNumberMazeCard(seeded(5), level);
    assert.ok(card !== null);
    assert.equal(card.values.at(-1), lastNumber(level));
  });

  void test("never returns the previous card", () => {
    const level = NUMBER_MAZE_LEVELS[0];
    const first = generateNumberMazeCard(seeded(11), level);
    assert.ok(first !== null);
    const second = generateNumberMazeCard(seeded(11), level, numberMazeCardKey(first));
    assert.ok(second !== null);
    assert.notEqual(numberMazeCardKey(second), numberMazeCardKey(first));
  });

  void test("ends quickly even with a hostile random source", () => {
    for (const level of NUMBER_MAZE_LEVELS) {
      for (const random of [() => 0, () => 0.999_999]) {
        const started = performance.now();
        const card = generateNumberMazeCard(random, level);
        const again = card === null ? null : generateNumberMazeCard(random, level, numberMazeCardKey(card));
        assert.equal(again, null, `${level.id}: a constant source repeats its card, so the second draw gives up`);
        assert.ok(performance.now() - started < 2000, level.id);
      }
    }
  });

  // NFR: a card in at most 5 s; the mockup's slowest was about 0.6 s (Poziom 4, 50 of 72 cells).
  void test("the slowest of 200 cards per level takes under 2 s", () => {
    for (const level of NUMBER_MAZE_LEVELS) {
      let slowest = 0;
      for (let seed = 1; seed <= 200; seed += 1) {
        const started = performance.now();
        generateNumberMazeCard(seeded(seed * 7919), level);
        slowest = Math.max(slowest, performance.now() - started);
      }
      assert.ok(slowest < 2000, `${level.id}: ${slowest.toFixed(0)} ms`);
    }
  });
});
