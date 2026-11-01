import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { generateMoneyCard } from "./generate.ts";
import { layoutMoneySheet, layoutPile } from "./layout.ts";
import { MONEY_LEVELS, moneyLevelById, type MoneyLevel } from "./levels.ts";
import { moneyCardProblems } from "./rules.ts";
import { MONEY_SHEET } from "./sheet.ts";

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = Array.from({ length: 60 }, (_, index) => index + 1);

/** The value of a pile summed by hand, independent of the rules module. */
function total(pile: readonly number[]): number {
  let sum = 0;
  for (const value of pile) {
    sum += value;
  }
  return sum;
}

function cards(level: MoneyLevel) {
  return SEEDS.map((seed) => {
    const card = generateMoneyCard(mulberry32(seed), null, level);
    assert.ok(card, `${level.id} seed ${seed}`);
    return card;
  });
}

void describe("generateMoneyCard", () => {
  for (const level of MONEY_LEVELS) {
    void describe(level.id, () => {
      void test("every card keeps the rules of its level", () => {
        for (const card of cards(level)) {
          assert.equal(card.levelId, level.id);
          assert.equal(card.rows.length, 5);
          assert.deepEqual(moneyCardProblems(card, level), [], card.key);
        }
      });

      void test("the answer of every row matches an independent count of the piles", () => {
        for (const card of cards(level)) {
          for (const row of card.rows) {
            const left = total(row.left);
            const right = total(row.right);
            assert.equal(row.answer, left > right ? "left" : left < right ? "right" : "equal", card.key);
          }
        }
      });

      void test("no pile is empty, over the sum or over the piece limit", () => {
        for (const card of cards(level)) {
          for (const row of card.rows) {
            for (const pile of [row.left, row.right]) {
              assert.ok(pile.length >= 1 && pile.length <= level.maxPieces, card.key);
              assert.ok(total(pile) <= level.maxSum, card.key);
              assert.ok(
                pile.every((value) => level.nominals.includes(value)),
                card.key,
              );
            }
          }
        }
      });

      void test("at most one row is a tie", () => {
        for (const card of cards(level)) {
          assert.ok(card.rows.filter((row) => row.answer === "equal").length <= 1, card.key);
        }
      });

      void test("every pile fits its frame on the sheet", () => {
        const sheet = layoutMoneySheet({
          pageWidth: MONEY_SHEET.pageWidth,
          pageHeight: MONEY_SHEET.pageHeight,
          inset: MONEY_SHEET.inset,
          rowCount: MONEY_SHEET.rowCount,
          bandHeight: MONEY_SHEET.bandHeight,
          bandGap: MONEY_SHEET.bandGap,
          rowGap: MONEY_SHEET.rowGap,
          signSize: MONEY_SHEET.signSize,
          signGap: MONEY_SHEET.signGap,
          pilePadding: MONEY_SHEET.pilePadding,
        });
        const area = sheet.rows[0].left;
        for (const card of cards(level)) {
          for (const row of card.rows) {
            for (const pile of [row.left, row.right]) {
              assert.ok(layoutPile(pile, area.innerWidth).height <= area.innerHeight, `${card.key} ${pile.join("+")}`);
            }
          }
        }
      });

      void test("the next card has another key than the previous one", () => {
        let previous: string | null = null;
        const random = mulberry32(99);
        for (let index = 0; index < 40; index += 1) {
          const card = generateMoneyCard(random, previous, level);
          assert.ok(card);
          assert.notEqual(card.key, previous);
          previous = card.key;
        }
      });

      void test("one card takes well under 5 seconds", () => {
        const start = performance.now();
        generateMoneyCard(mulberry32(7), null, level);
        assert.ok(performance.now() - start < 5000);
      });
    });
  }

  void test("łatwy: coins 1, 2 and 5 zł mixed, never misleading, and different nominals show up in one pile", () => {
    let mixedPiles = 0;
    for (const card of cards(moneyLevelById("latwy"))) {
      for (const row of card.rows) {
        for (const pile of [row.left, row.right]) {
          assert.ok(
            pile.every((value) => value < 10),
            card.key,
          );
          if (new Set(pile).size > 1) {
            mixedPiles += 1;
          }
        }
        if (row.left.length > row.right.length) {
          assert.ok(total(row.left) >= total(row.right), card.key);
        }
        if (row.left.length < row.right.length) {
          assert.ok(total(row.left) <= total(row.right), card.key);
        }
      }
    }
    assert.ok(mixedPiles > SEEDS.length, `${mixedPiles} mixed piles`);
  });

  void test("średni: exactly 2 of 5 rows have the pile with fewer pieces worth more", () => {
    for (const card of cards(moneyLevelById("sredni"))) {
      const misleading = card.rows.filter((row) => {
        const fewer = row.left.length - row.right.length;
        const more = total(row.left) - total(row.right);
        return (fewer < 0 && more > 0) || (fewer > 0 && more < 0);
      });
      assert.equal(misleading.length, 2, card.key);
    }
  });

  void test("trudny: at least 3 of 5 rows mislead, and notes show up across cards", () => {
    let withNotes = 0;
    for (const card of cards(moneyLevelById("trudny"))) {
      const misleading = card.rows.filter((row) => {
        const fewer = row.left.length - row.right.length;
        const more = total(row.left) - total(row.right);
        return (fewer < 0 && more > 0) || (fewer > 0 && more < 0);
      });
      assert.ok(misleading.length >= 3, card.key);
      if (card.rows.some((row) => [...row.left, ...row.right].some((value) => value >= 10))) {
        withNotes += 1;
      }
    }
    assert.ok(withNotes > SEEDS.length / 2, `${withNotes} cards with notes`);
  });

  void test("cards differ: 60 seeds give many different keys on every level", () => {
    for (const level of MONEY_LEVELS) {
      const keys = new Set(cards(level).map((card) => card.key));
      assert.ok(keys.size > 50, `${level.id}: ${keys.size} keys`);
    }
  });

  void test("returns null when no card can meet the rules", () => {
    // Piles of one piece with one nominal can never mislead, so a level that needs misleading rows has none.
    const impossible: MoneyLevel = { ...moneyLevelById("sredni"), maxPieces: 1, nominals: [5] };
    assert.equal(generateMoneyCard(mulberry32(1), null, impossible), null);
  });
});
