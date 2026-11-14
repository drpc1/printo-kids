// mathCrosswordSpec and mathCrosswordEngine (S-40, phase 2).
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { MathCrosswordSettings } from "../card-settings.ts";
import { mathCrosswordEngine, mathCrosswordSpec } from "./engine.ts";
import { MATH_CROSSWORD_LEVELS } from "./levels.ts";

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

void describe("mathCrosswordEngine", () => {
  void test("a card for every level is verified, frozen and keyed", () => {
    for (const level of MATH_CROSSWORD_LEVELS) {
      const settings: MathCrosswordSettings = { level: level.id };
      const verified = mathCrosswordEngine.generate(settings, mulberry32(3), null);
      assert.equal(verified.kind, "krzyzowka");
      assert.deepEqual(mathCrosswordSpec.problems(verified.card, settings), []);
      assert.equal(verified.key, mathCrosswordSpec.keyOf(verified.card));
      assert.ok(Object.isFrozen(verified.card), level.id);
    }
  });

  void test("the next card differs from the previous one", () => {
    const settings: MathCrosswordSettings = { level: "poziom2" };
    const first = mathCrosswordEngine.generate(settings, mulberry32(5), null);
    const second = mathCrosswordEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    const settings: MathCrosswordSettings = { level: "poziom1" };
    assert.throws(
      () => mathCrosswordEngine.generate(settings, () => 0.5, null),
      (error: unknown) => error instanceof CardExhausted && error.kind === "krzyzowka" && error.attempts > 0,
    );
  });
});

void describe("mathCrosswordSpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.equal(mathCrosswordSpec.knownBad.length, 9);
    for (const bad of mathCrosswordSpec.knownBad) {
      const codes = mathCrosswordSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("the known bad cards cover the codes the plan names", () => {
    const covered = new Set(mathCrosswordSpec.knownBad.map((bad) => bad.expectedCode));
    for (const code of [
      "false-equation",
      "needs-guessing",
      "chain-too-long",
      "number-out-of-range",
      "op-not-allowed",
      "cells-touch",
      "no-blanks",
      "too-few-equations",
      "too-many-blanks-in-equation",
    ]) {
      assert.ok(covered.has(code), code);
    }
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = mathCrosswordSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(mathCrosswordSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("the level is content", () => {
    assert.equal(mathCrosswordSpec.contentKey({ level: "poziom3" }), "poziom3");
    assert.notEqual(
      mathCrosswordSpec.contentKey({ level: "poziom3" }),
      mathCrosswordSpec.contentKey({ level: "poziom4" }),
    );
  });
});
