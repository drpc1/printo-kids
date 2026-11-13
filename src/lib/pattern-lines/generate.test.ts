import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { patternLinesProblems } from "./card.ts";
import { composeRow, generatePatternLinesCard, shuffled } from "./generate.ts";
import { PATTERN_LINES_LEVELS, patternLinesLevelById } from "./levels.ts";
import { dotProblems, dotSpecFor, rowGeometry, rowLength, selfCrossings } from "./paths.ts";
// Mutation runs (stryker/*.config.json) set MUTATION_RUN=1: instrumented code is several times slower, so the wall-clock
// budget is skipped there; `npm test` keeps it.
const MUTATION_RUN = process.env.MUTATION_RUN === "1";

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
  void test("keeps the items, does not touch the input and is a permutation for every seed", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    for (let seed = 0; seed < 50; seed += 1) {
      const out = shuffled(input, mulberry32(seed));
      assert.deepEqual([...out].sort(), input);
    }
    assert.deepEqual(input, [1, 2, 3, 4, 5, 6, 7, 8]);
  });

  void test("every item gets to every place (no bias towards the first elements)", () => {
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

void describe("generatePatternLinesCard", () => {
  for (const level of PATTERN_LINES_LEVELS) {
    void test(`${level.id}: 200 cards in under 2 s, all valid, no pattern twice, and the next card differs`, () => {
      const random = mulberry32(11);
      const started = performance.now();
      let previous: string | null = null;
      for (let n = 0; n < 200; n += 1) {
        const card = generatePatternLinesCard(random, previous, level);
        assert.notEqual(card, null);
        if (card === null) return;
        assert.deepEqual(patternLinesProblems(card, level), [], card.key);
        assert.equal(card.rows.length, level.rows);
        assert.equal(new Set(card.rows.map((row) => row.patternId)).size, level.rows);
        assert.notEqual(card.key, previous);
        previous = card.key;
      }
      assert.ok(MUTATION_RUN || performance.now() - started < 2000, `${performance.now() - started} ms`);
    });
  }

  void test("level 1 holds back the height of a flat line and level 4 gives no height", () => {
    const level1 = patternLinesLevelById("poziom1");
    assert.equal(composeRow("line", level1, mulberry32(1)).height, 0);
    const level4 = patternLinesLevelById("poziom4");
    assert.equal(composeRow("loops", level4, mulberry32(1)).height, undefined);
  });

  void test("steps and heights stay inside the level's range (the pattern's span stretches the step)", () => {
    for (const level of PATTERN_LINES_LEVELS) {
      const random = mulberry32(5);
      for (const id of level.pool) {
        const row = composeRow(id, level, random);
        assert.ok(row.period >= level.period[0] - 1e-9, `${level.id} ${id}`);
        assert.ok(row.period <= level.period[1] * 1.8 + 1e-9, `${level.id} ${id}`);
        if (row.height !== undefined) {
          assert.ok(row.height <= level.maxHeight + 1e-9);
        }
      }
    }
  });

  void test("houses are five to a row", () => {
    const row = composeRow("house", patternLinesLevelById("poziom2"), mulberry32(2));
    assert.equal(row.count, 5);
  });

  void test("a constant random source ends in null, not in a loop", () => {
    const level = patternLinesLevelById("poziom2");
    const same = () => 0.5;
    const first = generatePatternLinesCard(same, null, level);
    assert.notEqual(first, null);
    assert.equal(generatePatternLinesCard(same, first?.key ?? null, level), null);
  });

  void test("every pattern of every pool passes the dot rules on 400 draws, the sharp ones (pointed, bricks) included", () => {
    for (const level of PATTERN_LINES_LEVELS) {
      const spec = dotSpecFor(level.id);
      const length = rowLength();
      for (const id of level.pool) {
        const random = mulberry32(id.length * 31 + level.rows);
        for (let seed = 0; seed < 400; seed += 1) {
          const row = composeRow(id, level, random);
          const { path, dots } = rowGeometry(row, level, true);
          for (const p of path) {
            assert.ok(p.x >= -1e-9 && p.x <= length + 1e-9, `${level.id} ${id} x ${p.x}`);
          }
          if (spec === null) continue;
          const crossing = selfCrossings(path);
          if (level.mode === "dots") {
            assert.equal(crossing, 0, `${level.id} ${id} crosses itself`);
          }
          assert.deepEqual(
            dotProblems(dots, spec.radius, spec.spacing, crossing === 0),
            [],
            `${level.id} ${id} draw ${seed}`,
          );
        }
      }
    }
  });
});
