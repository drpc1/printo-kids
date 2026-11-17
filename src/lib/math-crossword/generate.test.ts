import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { chainDepth, compute, equationPositions, mathCrosswordKey, mathCrosswordProblems } from "./card.ts";
import { generateMathCrosswordCard, shuffled } from "./generate.ts";
import { EQUATION_TOLERANCE, MATH_CROSSWORD_LEVELS } from "./levels.ts";
// Mutation runs (stryker/*.config.json) set MUTATION_RUN=1: instrumented code is several times slower, so the wall-clock
// budget is skipped there; `npm test` keeps it.
// CI machines are shared and slower, so the wall-clock check is skipped there too; the 5 s promise is kept locally.
const MUTATION_RUN = process.env.MUTATION_RUN === "1" || process.env.CI === "true";
const SEEDS = 12;

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

void describe("shuffled", () => {
  void test("is a permutation, leaves the input alone and reaches every place", () => {
    const input = [1, 2, 3, 4, 5, 6];
    for (let seed = 0; seed < 30; seed += 1) {
      assert.deepEqual([...shuffled(input, mulberry32(seed))].sort(), input);
    }
    assert.deepEqual(input, [1, 2, 3, 4, 5, 6]);
    const counts = Array.from({ length: 4 }, () => new Array<number>(4).fill(0));
    const random = mulberry32(7);
    for (let n = 0; n < 4000; n += 1) {
      shuffled([0, 1, 2, 3], random).forEach((item, place) => (counts[item][place] += 1));
    }
    for (const row of counts) {
      for (const count of row) {
        assert.ok(count > 800 && count < 1200, `count ${count}`);
      }
    }
  });
});

void describe("generateMathCrosswordCard", () => {
  for (const level of MATH_CROSSWORD_LEVELS) {
    void test(`${level.id}: every card follows the rules of the level and is made in under 5 s`, (t) => {
      let slowest = 0;
      for (let seed = 1; seed <= SEEDS; seed += 1) {
        const started = performance.now();
        const card = generateMathCrosswordCard(mulberry32(seed), null, level);
        slowest = Math.max(slowest, performance.now() - started);
        assert.ok(card, `${level.id} seed ${seed}`);
        assert.deepEqual(mathCrosswordProblems(card, level), []);
        assert.equal(card.level, level.id);

        const occupied = new Set(card.cells.map((cell) => `${cell.row},${cell.col}`));
        assert.equal(occupied.size, card.cells.length, "one cell per position");
        for (const equation of card.equations) {
          const a: number = card.values[equation.a];
          const b: number = card.values[equation.b];
          const c: number = card.values[equation.c];
          assert.equal(compute(a, equation.op, b), c, `${a}${equation.op}${b}=${c}`);
          assert.ok(level.ops.includes(equation.op));
          for (const value of [a, b, c]) assert.ok(value >= 1 && value <= level.max);
          if (equation.op === "·") assert.ok(a >= 2 && a <= 10 && b >= 2 && b <= 10);
          if (equation.op === ":") assert.ok(b >= 2 && b <= 10 && c >= 2 && c <= 10 && a !== b);
          for (const at of equationPositions(equation)) assert.ok(occupied.has(`${at.row},${at.col}`));
          const empty = [equation.a, equation.b, equation.c].filter((id) => card.blanks.includes(id)).length;
          assert.ok(empty <= level.maxBlanksPerEquation);
        }
        assert.ok(card.equations.length >= level.equations - EQUATION_TOLERANCE);
        assert.ok(card.equations.length <= level.equations);
        assert.ok(card.blanks.length >= 1);
        const depth = chainDepth(card, level.max);
        assert.ok(depth !== null && depth >= 1 && depth <= level.maxChain, `chain ${depth}`);
        assert.ok(Math.max(...card.cells.map((cell) => cell.col)) < level.cols);
        assert.ok(Math.max(...card.cells.map((cell) => cell.row)) < level.rows);
      }
      t.diagnostic(`${level.id}: slowest of ${SEEDS} cards ${slowest.toFixed(0)} ms`);
      assert.ok(MUTATION_RUN || slowest < 5000, `slowest card took ${slowest.toFixed(0)} ms (budget 5 s)`);
    });

    void test(`${level.id}: the next card differs from the previous one and one seed gives one card`, () => {
      const first = generateMathCrosswordCard(mulberry32(5), null, level);
      assert.ok(first);
      const second = generateMathCrosswordCard(mulberry32(5), mathCrosswordKey(first), level);
      assert.ok(second);
      assert.notEqual(mathCrosswordKey(second), mathCrosswordKey(first));
      assert.deepEqual(generateMathCrosswordCard(mulberry32(5), null, level), first);
    });
  }

  void test("level 1 cards rarely repeat an equation (a repeat only when there is no other)", () => {
    const level = MATH_CROSSWORD_LEVELS[0];
    let repeats = 0;
    for (let seed = 1; seed <= 30; seed += 1) {
      const card = generateMathCrosswordCard(mulberry32(seed), null, level);
      assert.ok(card);
      const seen = new Set(card.equations.map((e) => `${card.values[e.a]}${e.op}${card.values[e.b]}`));
      if (seen.size < card.equations.length) repeats += 1;
    }
    assert.ok(repeats < 5, `${repeats} of 30 cards repeat an equation`);
  });

  void test("a random that never varies lays out no card: null, not a bad card", () => {
    assert.equal(
      generateMathCrosswordCard(() => 0.5, null, MATH_CROSSWORD_LEVELS[0]),
      null,
    );
  });

  void test("level 7 mixes all four signs", () => {
    const level = MATH_CROSSWORD_LEVELS[6];
    const seen = new Set<string>();
    for (let seed = 1; seed <= 12; seed += 1) {
      for (const equation of generateMathCrosswordCard(mulberry32(seed), null, level)?.equations ?? []) {
        seen.add(equation.op);
      }
    }
    assert.deepEqual([...seen].sort(), ["+", ":", "·", "−"].sort());
  });
});
