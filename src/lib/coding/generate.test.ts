import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { codingKey, codingProblems, turnCount } from "./card.ts";
import { generateCodingCard } from "./generate.ts";
import { CODING_LEVELS, CODING_MODES } from "./levels.ts";

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];

void describe("generateCodingCard", () => {
  for (const level of CODING_LEVELS) {
    for (const mode of CODING_MODES) {
      void test(`${level.label} ${mode.label}: grid size, path, turns and obstacles follow the level`, () => {
        let obstacles = 0;
        let cells = 0;
        for (const seed of SEEDS) {
          const card = generateCodingCard(mulberry32(seed), null, level, mode);
          assert.ok(card);
          assert.deepEqual(codingProblems(card, card), []);
          assert.equal(card.blocked.length, level.rows);
          assert.ok(card.blocked.every((row) => row.length === level.cols));
          assert.ok(card.path.length >= level.pathMin && card.path.length <= level.pathMax);
          assert.ok(turnCount(card.path) >= level.turnsMin);
          obstacles += card.blocked.flat().filter(Boolean).length;
          cells += level.rows * level.cols;
        }
        // Obstacles are drawn per cell, so the share is near the level's value but not exact.
        assert.ok(Math.abs(obstacles / cells - level.obstacles) < 0.12, `share ${obstacles / cells}`);
      });
    }
  }

  void test("Wykonaj has three different pictures and exactly one goal", () => {
    for (const level of CODING_LEVELS) {
      const card = generateCodingCard(mulberry32(9), null, level, CODING_MODES[1]);
      assert.ok(card);
      assert.equal(card.targets.length, 3);
      assert.equal(new Set(card.targets.map((t) => t.kind)).size, 3);
      assert.equal(card.targets.filter((t) => t.isGoal).length, 1);
    }
  });

  void test("the next Generuj never returns the previous card", () => {
    for (const level of CODING_LEVELS) {
      for (const mode of CODING_MODES) {
        const random = mulberry32(11);
        let previous: string | null = null;
        for (let i = 0; i < 6; i += 1) {
          const card = generateCodingCard(random, previous, level, mode);
          assert.ok(card);
          assert.notEqual(codingKey(card), previous);
          previous = codingKey(card);
        }
      }
    }
  });

  void test("the goal picture of Wykonaj is not always the same shape", () => {
    const kinds = new Set<string>();
    const random = mulberry32(5);
    for (let i = 0; i < 30; i += 1) {
      const card = generateCodingCard(random, null, CODING_LEVELS[0], CODING_MODES[1]);
      assert.ok(card);
      kinds.add(card.targets.find((t) => t.isGoal)?.kind ?? "");
    }
    assert.equal(kinds.size, 3);
  });

  void test("20 cards of level 4 in both modes take under 5 s (NFR)", () => {
    const level = CODING_LEVELS[3];
    const started = performance.now();
    for (const mode of CODING_MODES) {
      const random = mulberry32(21);
      for (let i = 0; i < 20; i += 1) assert.ok(generateCodingCard(random, null, level, mode));
    }
    const elapsed = performance.now() - started;
    assert.ok(elapsed < 5000, `${elapsed.toFixed(0)} ms`);
  });

  void test("level 4 Zapisz needs few grids per card (the mockup drew about 2400)", () => {
    const base = mulberry32(31);
    let calls = 0;
    const random = (): number => {
      calls += 1;
      return base();
    };
    const cards = 30;
    for (let i = 0; i < cards; i += 1) assert.ok(generateCodingCard(random, null, CODING_LEVELS[3], CODING_MODES[0]));
    // A grid costs about 102 calls (every cell and the start); the plan asks for fewer than 500 grids per card.
    assert.ok(calls / cards < 500 * 102, `${calls / cards} random calls per card`);
  });
});
