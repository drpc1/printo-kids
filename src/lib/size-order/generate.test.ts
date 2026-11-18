import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { isOrdered, pictureKey, sizeOrderCardKey, sizeOrderCardProblems } from "./card.ts";
import { generateSizeOrderCard } from "./generate.ts";
import { SIZE_ORDER_LEVELS } from "./levels.ts";

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = Array.from({ length: 300 }, (_, index) => index + 1);

void describe("generateSizeOrderCard", () => {
  for (const level of SIZE_ORDER_LEVELS) {
    void test(`${level.id}: every card is legal and keeps the table of the level`, () => {
      for (const seed of SEEDS) {
        const card = generateSizeOrderCard(mulberry32(seed), level);
        assert.ok(card, `seed ${seed}`);
        assert.deepEqual(sizeOrderCardProblems(card, level), [], `seed ${seed}`);
        assert.equal(card.rows.length, level.rowCount);
        for (const row of card.rows) {
          assert.deepEqual(
            [...row.heights].sort((a, b) => a - b),
            [...level.heights],
          );
          assert.ok(!isOrdered(row.heights));
        }
      }
    });

    void test(`${level.id}: icons and shapes are mixed, no picture twice, neighbouring rows in other crayons`, () => {
      for (const seed of SEEDS) {
        const card = generateSizeOrderCard(mulberry32(seed), level);
        assert.ok(card);
        const kinds = new Set(card.rows.map((row) => row.picture.kind));
        assert.equal(kinds.size, 2, `seed ${seed}`);
        assert.equal(new Set(card.rows.map((row) => pictureKey(row.picture))).size, level.rowCount);
        for (let i = 1; i < card.rows.length; i++) assert.notEqual(card.rows[i].crayon, card.rows[i - 1].crayon);
      }
    });
  }

  void test("the next card has another key", () => {
    const level = SIZE_ORDER_LEVELS[0];
    const first = generateSizeOrderCard(mulberry32(4), level);
    assert.ok(first);
    const second = generateSizeOrderCard(mulberry32(4), level, sizeOrderCardKey(first));
    assert.ok(second);
    assert.notEqual(sizeOrderCardKey(second), sizeOrderCardKey(first));
  });

  void test("the same seed draws the same card", () => {
    const level = SIZE_ORDER_LEVELS[2];
    assert.deepEqual(generateSizeOrderCard(mulberry32(9), level), generateSizeOrderCard(mulberry32(9), level));
  });
});
