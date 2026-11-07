// moneySpec and moneyEngine (gh283, phase 5). The spec wraps `moneyCardProblems`; the engine never returns null.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import { moneyEngine, moneySpec } from "./engine.ts";
import { generateMoneyCard } from "./generate.ts";
import { MONEY_LEVELS, moneyLevelById } from "./levels.ts";

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

void describe("moneyEngine", () => {
  void test("a card for every level is verified, frozen and keyed", () => {
    for (const level of MONEY_LEVELS) {
      const verified = moneyEngine.generate({ level: level.id }, mulberry32(3), null);
      assert.equal(verified.kind, "pieniadze");
      assert.deepEqual(moneySpec.problems(verified.card, { level: level.id }), []);
      assert.equal(verified.key, verified.card.key);
      assert.ok(Object.isFrozen(verified.card), level.id);
    }
  });

  void test("the next card differs from the previous one", () => {
    const first = moneyEngine.generate({ level: "sredni" }, mulberry32(5), null);
    const second = moneyEngine.generate({ level: "sredni" }, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    // A random source that always draws the same value never finds a card that differs from its own key.
    const same = () => 0.5;
    const only = generateMoneyCard(same, null, moneyLevelById("sredni"));
    if (only === null) {
      assert.throws(() => moneyEngine.generate({ level: "sredni" }, same, null), CardExhausted);
      return;
    }
    assert.throws(
      () => moneyEngine.generate({ level: "sredni" }, same, only.key),
      (error: unknown) => error instanceof CardExhausted && error.kind === "pieniadze" && error.attempts > 0,
    );
  });
});

void describe("moneySpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.ok(moneySpec.knownBad.length >= 3);
    for (const bad of moneySpec.knownBad) {
      const codes = moneySpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = moneySpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(moneySpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("the level is content, the card key is the card's own key", () => {
    assert.notEqual(moneySpec.contentKey({ level: "latwy" }), moneySpec.contentKey({ level: "trudny" }));
    assert.equal(moneySpec.contentKey({ level: "sredni" }), moneySpec.contentKey({ level: "sredni" }));
    const card = moneyEngine.generate({ level: "sredni" }, mulberry32(1), null).card;
    assert.equal(moneySpec.keyOf(card), card.key);
  });
});
