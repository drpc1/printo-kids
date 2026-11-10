// copyDrawingSpec and copyDrawingEngine (S-35, phase 2).
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { CopyDrawingSettings } from "../card-settings.ts";
import { copyDrawingEngine, copyDrawingSpec } from "./engine.ts";
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

void describe("copyDrawingEngine", () => {
  void test("a card for every level is verified, frozen and keyed", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      const settings: CopyDrawingSettings = { level: level.id, category: "wszystkie", colors: false };
      const verified = copyDrawingEngine.generate(settings, mulberry32(3), null);
      assert.equal(verified.kind, "kopiuj");
      assert.deepEqual(copyDrawingSpec.problems(verified.card, settings), []);
      assert.equal(verified.key, verified.card.key);
      assert.ok(Object.isFrozen(verified.card), level.id);
    }
  });

  void test("the next card differs from the previous one", () => {
    const settings: CopyDrawingSettings = { level: "sredni", category: "wszystkie", colors: false };
    const first = copyDrawingEngine.generate(settings, mulberry32(5), null);
    const second = copyDrawingEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    const settings: CopyDrawingSettings = { level: "latwy", category: "wszystkie", colors: false };
    const same = () => 0.5;
    const constant = copyDrawingEngine.generate(settings, same, null);
    assert.throws(
      () => copyDrawingEngine.generate(settings, same, constant.key),
      (error: unknown) => error instanceof CardExhausted && error.kind === "kopiuj" && error.attempts > 0,
    );
  });
});

void describe("copyDrawingSpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.equal(copyDrawingSpec.knownBad.length, 4);
    for (const bad of copyDrawingSpec.knownBad) {
      const codes = copyDrawingSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("the known bad cards cover the four rules the plan names", () => {
    assert.deepEqual(copyDrawingSpec.knownBad.map((bad) => bad.expectedCode).sort(), [
      "grid-size",
      "level-mismatch",
      "no-filled-cell",
      "not-silhouette",
    ]);
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = copyDrawingSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(copyDrawingSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("level and category are content", () => {
    const base: CopyDrawingSettings = { level: "sredni", category: "wszystkie", colors: false };
    const key = copyDrawingSpec.contentKey(base);
    assert.equal(key, "sredni|wszystkie");
    assert.notEqual(key, copyDrawingSpec.contentKey({ ...base, level: "trudny" }));
    assert.notEqual(key, copyDrawingSpec.contentKey({ ...base, category: "zwierzeta" }));
  });
});
