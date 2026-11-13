import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { generateOddOneOutCard, type OddItem, type OddOneOutCard } from "./generate.ts";
import { iconById } from "./icons.ts";
import { ODD_ONE_OUT_LEVELS, rulesFor, type OddOneOutLevel } from "./levels.ts";
import { oddOneOutCardProblems } from "./rules.ts";

// Mutation runs (stryker) instrument the code and run several times slower, so the wall-clock budget is skipped there.
const MUTATION_RUN = process.env.MUTATION_RUN === "1";

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = Array.from({ length: 200 }, (_, index) => index + 1);

function cards(level: OddOneOutLevel, colors: boolean): OddOneOutCard[] {
  return SEEDS.map((seed) => {
    const card = generateOddOneOutCard(mulberry32(seed), null, level, colors);
    assert.ok(card, `${level.id} colors ${String(colors)} seed ${seed}`);
    return card;
  });
}

/** How many of the features a distractor may vary (shape, size, crayon) differ across the row, apart from the rule. */
function varyingFeatures(items: readonly OddItem[], rule: string): number {
  const features: Record<string, (item: OddItem) => string> = {
    shape: (item) => item.shape ?? "icon",
    size: (item) => item.size,
    color: (item) => item.crayon ?? "none",
  };
  return Object.entries(features).filter(
    ([name, read]) => name !== rule && new Set(items.map(read)).size > 1 && !(name === "shape" && rule === "category"),
  ).length;
}

for (const level of ODD_ONE_OUT_LEVELS) {
  for (const colors of [false, true]) {
    void describe(`generateOddOneOutCard ${level.id}, colors ${colors ? "on" : "off"}`, () => {
      void test("200 seeds give a card every time, each keeping the rules of the level", () => {
        for (const card of cards(level, colors)) {
          assert.equal(card.levelId, level.id);
          assert.equal(card.colors, colors);
          assert.equal(card.rows.length, level.rowCount);
          assert.deepEqual(oddOneOutCardProblems(card, level, colors), [], card.key);
        }
      });

      void test("every rule of the level shows, no rule from outside, no neighbours with one rule", () => {
        const allowed = rulesFor(level, colors);
        for (const card of cards(level, colors)) {
          for (const rule of allowed) {
            assert.ok(
              card.rows.some((row) => row.rule === rule),
              `${card.key} lacks ${rule}`,
            );
          }
          card.rows.forEach((row, index) => {
            assert.ok(allowed.includes(row.rule), row.rule);
            if (index > 0) {
              assert.notEqual(row.rule, card.rows[index - 1].rule, card.key);
            }
          });
        }
      });

      void test("rows have the pictures of the level and no more distractors than the level allows", () => {
        for (const card of cards(level, colors)) {
          for (const row of card.rows) {
            assert.equal(row.items.length, level.itemCount);
            assert.ok(row.answer >= 0 && row.answer < level.itemCount);
            assert.ok(varyingFeatures(row.items, row.rule) <= level.distractors, card.key);
            for (const item of row.items) {
              assert.ok(item.count >= 1 && item.count <= 6);
              assert.equal(item.crayon !== null, colors && item.icon === null, card.key);
            }
          }
        }
      });

      void test("a level with distractors does put them in: some rows vary exactly that many other features", () => {
        if (level.distractors === 0) return;
        const rows = cards(level, colors).flatMap((card) => card.rows);
        assert.ok(
          rows.some((row) => varyingFeatures(row.items, row.rule) === level.distractors),
          `${level.id} colors ${String(colors)}`,
        );
        const withDistractor = rows.filter((row) => varyingFeatures(row.items, row.rule) > 0).length;
        assert.ok(withDistractor / rows.length > 0.5, `${level.id}: ${withDistractor}/${rows.length}`);
      });

      void test("a count row has groups of the level's size and one odd picture one more or one less", () => {
        for (const card of cards(level, colors)) {
          for (const row of card.rows.filter((candidate) => candidate.rule === "count")) {
            const odd = row.items[row.answer].count;
            const others = row.items.filter((_, index) => index !== row.answer).map((item) => item.count);
            assert.equal(new Set(others).size, 1, card.key);
            assert.ok(level.counts.includes(others[0]), `${card.key}: group of ${others[0]}`);
            assert.equal(Math.abs(odd - others[0]), 1, card.key);
          }
        }
      });

      void test("the next card has another key than the previous one", () => {
        let previous: string | null = null;
        const random = mulberry32(99);
        for (let index = 0; index < 40; index += 1) {
          const card = generateOddOneOutCard(random, previous, level, colors);
          assert.ok(card);
          assert.notEqual(card.key, previous);
          previous = card.key;
        }
      });

      void test("200 cards take well under 2 seconds", () => {
        const start = performance.now();
        cards(level, colors);
        assert.ok(MUTATION_RUN || performance.now() - start < 2000);
      });
    });
  }
}

void describe("generateOddOneOutCard: what each level shows", () => {
  void test("łatwy: the rest of a row is identical, whatever the rule", () => {
    const level = ODD_ONE_OUT_LEVELS[0];
    for (const colors of [false, true]) {
      for (const card of cards(level, colors)) {
        for (const row of card.rows) {
          const rest = row.items.filter((_, index) => index !== row.answer);
          assert.equal(new Set(rest.map((item) => JSON.stringify(item))).size, 1, card.key);
        }
      }
    }
  });

  void test("łatwy: the small picture is half the big one (the level's small ratio)", () => {
    assert.equal(ODD_ONE_OUT_LEVELS[0].smallRatio, 0.5);
    assert.ok(ODD_ONE_OUT_LEVELS[2].smallRatio > ODD_ONE_OUT_LEVELS[1].smallRatio);
    assert.ok(ODD_ONE_OUT_LEVELS[1].smallRatio > ODD_ONE_OUT_LEVELS[0].smallRatio);
  });

  void test("trudny: a category row has one icon of another category among icons of one", () => {
    const level = ODD_ONE_OUT_LEVELS[2];
    let seen = 0;
    for (const card of cards(level, false)) {
      for (const row of card.rows.filter((candidate) => candidate.rule === "category")) {
        seen += 1;
        const categories = row.items.map((item) => iconById(item.icon ?? "")?.category);
        const odd = categories[row.answer];
        const rest = categories.filter((_, index) => index !== row.answer);
        assert.ok(
          rest.every((category) => category === rest[0]),
          card.key,
        );
        assert.notEqual(odd, rest[0]);
        assert.equal(new Set(row.items.map((item) => item.icon)).size, level.itemCount);
      }
    }
    assert.ok(seen >= SEEDS.length, `${seen} category rows`);
  });

  void test("średni with colors: a color row has one other crayon, and shapes are colored", () => {
    const level = ODD_ONE_OUT_LEVELS[1];
    let seen = 0;
    for (const card of cards(level, true)) {
      for (const row of card.rows.filter((candidate) => candidate.rule === "color")) {
        seen += 1;
        const rest = row.items.filter((_, index) => index !== row.answer).map((item) => item.crayon);
        assert.ok(
          rest.every((crayon) => crayon !== null && crayon === rest[0]),
          card.key,
        );
        assert.notEqual(row.items[row.answer].crayon, rest[0]);
      }
    }
    assert.ok(seen >= SEEDS.length);
  });

  void test("200 seeds give many different cards on every level", () => {
    for (const level of ODD_ONE_OUT_LEVELS) {
      assert.ok(new Set(cards(level, true).map((card) => card.key)).size > 190, level.id);
    }
  });

  void test("returns null when no card can meet the rules", () => {
    // A count rule needs group sizes to draw from.
    const impossible: OddOneOutLevel = { ...ODD_ONE_OUT_LEVELS[1], counts: [] };
    const start = performance.now();
    assert.equal(generateOddOneOutCard(mulberry32(1), null, impossible, false), null);
    // Giving up stays well inside the 5 s the PRD allows for Generuj (mutation runs are slower and skip the budget).
    if (process.env.MUTATION_RUN !== "1") {
      assert.ok(performance.now() - start < 2000, `gave up after ${Math.round(performance.now() - start)} ms`);
    }
  });
});
