// patternLinesSpec and patternLinesEngine (S-36, phase 2).
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { PatternLinesSettings } from "../card-settings.ts";
import { patternLinesEngine, patternLinesSpec } from "./engine.ts";
import { PATTERN_LINES_LEVELS } from "./levels.ts";

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

void describe("patternLinesEngine", () => {
  void test("a card for every level is verified, frozen and keyed", () => {
    for (const level of PATTERN_LINES_LEVELS) {
      const settings: PatternLinesSettings = { level: level.id, lines: true };
      const verified = patternLinesEngine.generate(settings, mulberry32(3), null);
      assert.equal(verified.kind, "szlaczki");
      assert.deepEqual(patternLinesSpec.problems(verified.card, settings), []);
      assert.equal(verified.key, verified.card.key);
      assert.ok(Object.isFrozen(verified.card), level.id);
    }
  });

  void test("the next card differs from the previous one", () => {
    const settings: PatternLinesSettings = { level: "poziom2", lines: true };
    const first = patternLinesEngine.generate(settings, mulberry32(5), null);
    const second = patternLinesEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    const settings: PatternLinesSettings = { level: "poziom1", lines: true };
    const same = () => 0.5;
    const constant = patternLinesEngine.generate(settings, same, null);
    assert.throws(
      () => patternLinesEngine.generate(settings, same, constant.key),
      (error: unknown) => error instanceof CardExhausted && error.kind === "szlaczki" && error.attempts > 0,
    );
  });
});

void describe("patternLinesSpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.equal(patternLinesSpec.knownBad.length, 7);
    for (const bad of patternLinesSpec.knownBad) {
      const codes = patternLinesSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("the known bad cards cover the rules the plan names", () => {
    assert.deepEqual([...new Set(patternLinesSpec.knownBad.map((bad) => bad.expectedCode))].sort(), [
      "crossing",
      "dots-too-close",
      "duplicate-pattern",
      "level-mismatch",
      "out-of-row",
      "trace-repeats",
    ]);
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = patternLinesSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(patternLinesSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("the level is content; Linie is not", () => {
    const base: PatternLinesSettings = { level: "poziom3", lines: true };
    const key = patternLinesSpec.contentKey(base);
    assert.equal(key, "poziom3");
    assert.notEqual(key, patternLinesSpec.contentKey({ ...base, level: "poziom4" }));
    assert.equal(key, patternLinesSpec.contentKey({ ...base, lines: false }));
  });
});
