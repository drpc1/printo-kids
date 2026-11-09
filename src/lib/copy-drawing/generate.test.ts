import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { OBJECT_CATEGORY_CHOICES } from "../symmetry/templates.ts";
import { copyDrawingProblems } from "./card.ts";
import { generateCopyDrawingCard } from "./generate.ts";
import { COPY_DRAWING_LEVELS } from "./levels.ts";

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

void describe("generateCopyDrawingCard", () => {
  for (const level of COPY_DRAWING_LEVELS) {
    for (const choice of OBJECT_CATEGORY_CHOICES) {
      void test(`${level.id}, ${choice.id}: at least two different legal cards, the next one differs`, () => {
        const random = mulberry32(7);
        const first = generateCopyDrawingCard(random, null, level, choice.id);
        assert.ok(first !== null);
        assert.deepEqual(copyDrawingProblems(first, level), []);
        const second = generateCopyDrawingCard(random, first.key, level, choice.id);
        assert.ok(second !== null);
        assert.notEqual(second.key, first.key);
        assert.deepEqual(copyDrawingProblems(second, level), []);
      });
    }
  }

  void test("a repeat is only refused by key: the same seed and the previous key give another card", () => {
    const level = COPY_DRAWING_LEVELS[1];
    const first = generateCopyDrawingCard(mulberry32(5), null, level, "wszystkie");
    assert.ok(first !== null);
    const second = generateCopyDrawingCard(mulberry32(5), first.key, level, "wszystkie");
    assert.notEqual(second?.key, first.key);
  });

  void test("a random source that always draws the same card runs out of attempts and gives null", () => {
    const level = COPY_DRAWING_LEVELS[0];
    const constant = () => 0.5;
    const only = generateCopyDrawingCard(constant, null, level, "wszystkie");
    assert.ok(only !== null);
    assert.equal(generateCopyDrawingCard(constant, only.key, level, "wszystkie"), null);
  });

  void test("a category without objects gives null", () => {
    const level = COPY_DRAWING_LEVELS[0];
    assert.equal(generateCopyDrawingCard(mulberry32(1), null, level, "nie-ma" as "wszystkie"), null);
  });

  void test("200 cards come out in under 2 seconds", () => {
    const random = mulberry32(11);
    let previous: string | null = null;
    const start = performance.now();
    for (let count = 0; count < 200; count += 1) {
      const level = COPY_DRAWING_LEVELS[count % COPY_DRAWING_LEVELS.length];
      const card = generateCopyDrawingCard(random, previous, level, "wszystkie");
      assert.ok(card !== null);
      previous = card.key;
    }
    assert.ok(performance.now() - start < 2000);
  });
});
