// oddOneOutSpec and oddOneOutEngine. The spec wraps `oddOneOutCardProblems`; the engine never returns null.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { OddOneOutSettings } from "../card-settings.ts";
import { oddOneOutEngine, oddOneOutSpec } from "./engine.ts";
import { generateOddOneOutCard } from "./generate.ts";
import { ODD_ONE_OUT_LEVELS, oddOneOutLevelById } from "./levels.ts";

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

void describe("oddOneOutEngine", () => {
  void test("a card for every level and colors is verified, frozen and keyed", () => {
    for (const level of ODD_ONE_OUT_LEVELS) {
      for (const colors of [false, true]) {
        const settings: OddOneOutSettings = { level: level.id, colors };
        const verified = oddOneOutEngine.generate(settings, mulberry32(3), null);
        assert.equal(verified.kind, "niepasuje");
        assert.deepEqual(oddOneOutSpec.problems(verified.card, settings), []);
        assert.equal(verified.key, verified.card.key);
        assert.ok(Object.isFrozen(verified.card), level.id);
        assert.equal(verified.card.rows.length, level.rowCount);
      }
    }
  });

  void test("the next card differs from the previous one", () => {
    const settings: OddOneOutSettings = { level: "sredni", colors: true };
    const first = oddOneOutEngine.generate(settings, mulberry32(5), null);
    const second = oddOneOutEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    // A random source that always draws the same value draws the same row again and again, so no card comes out.
    const same = () => 0.5;
    const settings: OddOneOutSettings = { level: "sredni", colors: false };
    assert.equal(generateOddOneOutCard(same, null, oddOneOutLevelById("sredni"), false), null);
    assert.throws(
      () => oddOneOutEngine.generate(settings, same, null),
      (error: unknown) => error instanceof CardExhausted && error.kind === oddOneOutSpec.kind && error.attempts > 0,
    );
  });
});

void describe("oddOneOutSpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.ok(oddOneOutSpec.knownBad.length >= 3);
    for (const bad of oddOneOutSpec.knownBad) {
      const codes = oddOneOutSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
    assert.deepEqual(
      oddOneOutSpec.knownBad.map((bad) => bad.expectedCode),
      ["ambiguous-row", "crayon-without-colors", "duplicate-row"],
    );
  });

  void test("require throws CardInvariantError for each known bad card", () => {
    for (const bad of oddOneOutSpec.knownBad) {
      assert.throws(() => VerifiedCard.require(oddOneOutSpec, bad.card, bad.settings), CardInvariantError, bad.name);
    }
  });

  void test("generated cards pass require", () => {
    for (const level of ODD_ONE_OUT_LEVELS) {
      for (const colors of [false, true]) {
        const settings: OddOneOutSettings = { level: level.id, colors };
        const card = generateOddOneOutCard(mulberry32(11), null, level, colors);
        assert.ok(card);
        assert.doesNotThrow(() => VerifiedCard.require(oddOneOutSpec, card, settings));
      }
    }
  });

  void test("level and colors are both content (colors change the task), the card key is the card's own key", () => {
    const content = (level: OddOneOutSettings["level"], colors: boolean) => oddOneOutSpec.contentKey({ level, colors });
    assert.equal(content("sredni", false), "sredni|false");
    assert.notEqual(content("latwy", false), content("trudny", false));
    assert.notEqual(content("sredni", false), content("sredni", true));
    assert.equal(content("sredni", true), content("sredni", true));
    const card = oddOneOutEngine.generate({ level: "sredni", colors: false }, mulberry32(1), null).card;
    assert.equal(oddOneOutSpec.keyOf(card), card.key);
  });
});
