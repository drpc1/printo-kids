// symmetrySpec and symmetryEngine (gh283, phase 6). The spec wraps `symmetryCardProblems`; the engine never returns null.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import { symmetryEngine, symmetrySpec } from "./engine.ts";
import { generateSymmetryCard } from "./generate.ts";
import { SYMMETRY_LEVELS, symmetryLevelById } from "./levels.ts";

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

void describe("symmetryEngine", () => {
  void test("a card for every level is verified, frozen and keyed", () => {
    for (const level of SYMMETRY_LEVELS) {
      const settings = { level: level.id, colors: false, category: "wszystkie" } as const;
      const verified = symmetryEngine.generate(settings, mulberry32(3), null);
      assert.equal(verified.kind, "symetria");
      assert.deepEqual(symmetrySpec.problems(verified.card, settings), []);
      assert.equal(verified.key, verified.card.key);
      assert.ok(Object.isFrozen(verified.card), level.id);
    }
  });

  void test("the next card differs from the previous one", () => {
    const settings = { level: "lat4", colors: false, category: "wszystkie" } as const;
    const first = symmetryEngine.generate(settings, mulberry32(5), null);
    const second = symmetryEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    const settings = { level: "lat4", colors: false, category: "wszystkie" } as const;
    const same = () => 0.5;
    const only = generateSymmetryCard(same, null, symmetryLevelById("lat4"), "wszystkie");
    assert.notEqual(only, null);
    assert.throws(
      () => symmetryEngine.generate(settings, same, only?.key ?? null),
      (error: unknown) => error instanceof CardExhausted && error.kind === "symetria" && error.attempts > 0,
    );
  });
});

void describe("symmetrySpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.ok(symmetrySpec.knownBad.length >= 3);
    for (const bad of symmetrySpec.knownBad) {
      const codes = symmetrySpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = symmetrySpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(symmetrySpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("level and category are content, colors are not", () => {
    const base = { level: "lat4", colors: false, category: "wszystkie" } as const;
    assert.notEqual(symmetrySpec.contentKey(base), symmetrySpec.contentKey({ ...base, level: "lat7" }));
    assert.notEqual(symmetrySpec.contentKey(base), symmetrySpec.contentKey({ ...base, category: "zwierzeta" }));
    assert.equal(symmetrySpec.contentKey(base), symmetrySpec.contentKey({ ...base, colors: true }));
    const card = symmetryEngine.generate(base, mulberry32(1), null).card;
    assert.equal(symmetrySpec.keyOf(card), card.key);
  });
});
