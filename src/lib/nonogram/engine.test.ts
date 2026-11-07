// nonogramSpec and nonogramEngine (gh283, phase 9). One spec for the two card shapes: chips (easy) and clues (the rest).
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { NonogramSettings } from "../card-settings.ts";
import { nonogramEngine, nonogramSpec } from "./engine.ts";
import { NONOGRAM_SIZES } from "./sizes.ts";

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

void describe("nonogramEngine", () => {
  void test("a card for every level is verified, frozen and keyed", () => {
    for (const size of NONOGRAM_SIZES) {
      const settings: NonogramSettings = { level: size.id, category: "wszystkie" };
      const verified = nonogramEngine.generate(settings, mulberry32(3), null);
      assert.equal(verified.kind, "nonogram");
      assert.equal(verified.card.kind, size.kind);
      assert.deepEqual(nonogramSpec.problems(verified.card, settings), []);
      assert.equal(verified.key, verified.card.key);
      assert.ok(Object.isFrozen(verified.card), size.id);
    }
  });

  void test("the next card differs from the previous one", () => {
    const settings: NonogramSettings = { level: "sredni", category: "wszystkie" };
    const first = nonogramEngine.generate(settings, mulberry32(5), null);
    const second = nonogramEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    const settings: NonogramSettings = { level: "latwy", category: "wszystkie" };
    const same = () => 0.5;
    const constant = nonogramEngine.generate(settings, same, null);
    assert.throws(
      () => nonogramEngine.generate(settings, same, constant.key),
      (error: unknown) => error instanceof CardExhausted && error.kind === "nonogram" && error.attempts > 0,
    );
  });

  void test("the hardest card comes out in time", () => {
    const settings: NonogramSettings = { level: "trudny", category: "wszystkie" };
    const start = performance.now();
    for (let seed = 1; seed <= 5; seed += 1) {
      nonogramEngine.generate(settings, mulberry32(seed), null);
    }
    assert.ok((performance.now() - start) / 5 < 5000);
  });
});

void describe("nonogramSpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.ok(nonogramSpec.knownBad.length >= 4);
    for (const bad of nonogramSpec.knownBad) {
      const codes = nonogramSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("the easy card's probes: a short row and split chips are both runs-mismatch", () => {
    const codes = nonogramSpec.knownBad.filter((bad) => bad.name.startsWith("easy:")).map((bad) => bad.expectedCode);
    assert.deepEqual(codes, ["runs-mismatch", "runs-mismatch"]);
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = nonogramSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(nonogramSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("level and category are content", () => {
    const base: NonogramSettings = { level: "sredni", category: "wszystkie" };
    const key = nonogramSpec.contentKey(base);
    assert.notEqual(key, nonogramSpec.contentKey({ ...base, level: "trudny" }));
    assert.notEqual(key, nonogramSpec.contentKey({ ...base, category: "zwierzeta" }));
    assert.equal(key, nonogramSpec.contentKey({ ...base }));
  });

  void test("a card for another level is rejected", () => {
    const settings: NonogramSettings = { level: "sredni", category: "wszystkie" };
    const card = nonogramEngine.generate(settings, mulberry32(1), null).card;
    const codes = nonogramSpec.problems(card, { ...settings, level: "trudny" }).map((problem) => problem.code);
    assert.ok(codes.includes("settings-mismatch"));
  });
});
