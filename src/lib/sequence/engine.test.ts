// sequenceSpec and sequenceEngine (gh283, phase 7). The spec wraps `sequenceCardProblems`; the engine never returns null.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import { sequenceEngine, sequenceSpec } from "./engine.ts";
import { SEQUENCE_LEVELS } from "./levels.ts";

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

void describe("sequenceEngine", () => {
  void test("a card for every level is verified, frozen and keyed", () => {
    for (const level of SEQUENCE_LEVELS) {
      const settings = { level: level.id, colors: true } as const;
      const verified = sequenceEngine.generate(settings, mulberry32(3), null);
      assert.equal(verified.kind, "sekwencje");
      assert.deepEqual(sequenceSpec.problems(verified.card, settings), []);
      assert.equal(verified.key, verified.card.key);
      assert.ok(Object.isFrozen(verified.card), level.id);
    }
  });

  void test("the next card differs from the previous one", () => {
    const settings = { level: "lat5", colors: false } as const;
    const first = sequenceEngine.generate(settings, mulberry32(5), null);
    const second = sequenceEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    const settings = { level: "lat4", colors: false } as const;
    const same = () => 0.5;
    // A constant random draws the same rejected rows on every attempt, so no attempt yields a legal card.
    assert.throws(
      () => sequenceEngine.generate(settings, same, null),
      (error: unknown) => error instanceof CardExhausted && error.kind === "sekwencje" && error.attempts > 0,
    );
  });
});

void describe("sequenceSpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.ok(sequenceSpec.knownBad.length >= 3);
    for (const bad of sequenceSpec.knownBad) {
      const codes = sequenceSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = sequenceSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(sequenceSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("level is content, colors are not", () => {
    const base = { level: "lat5", colors: false } as const;
    assert.notEqual(sequenceSpec.contentKey(base), sequenceSpec.contentKey({ ...base, level: "lat6" }));
    assert.equal(sequenceSpec.contentKey(base), sequenceSpec.contentKey({ ...base, colors: true }));
    const card = sequenceEngine.generate(base, mulberry32(1), null).card;
    assert.equal(sequenceSpec.keyOf(card), card.key);
  });
});
