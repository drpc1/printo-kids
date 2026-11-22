import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { ShadowsSettings } from "../card-settings.ts";
import { shadowsCardProblems } from "./card.ts";
import { shadowsEngine, shadowsSpec } from "./engine.ts";
import { SHADOWS_LEVELS, shadowsLevelById } from "./levels.ts";

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

void describe("shadows engine", () => {
  void test("a card of every level is verified, frozen and keyed", () => {
    for (const level of SHADOWS_LEVELS) {
      const settings: ShadowsSettings = { level: level.id };
      const verified = shadowsEngine.generate(settings, seeded(1), null);
      assert.ok(verified instanceof VerifiedCard);
      assert.ok(Object.isFrozen(verified.card));
      assert.equal(verified.key, shadowsSpec.keyOf(verified.card));
      assert.deepEqual(shadowsCardProblems(verified.card, shadowsLevelById(level.id)), []);
    }
  });

  void test("the next card has another key", () => {
    const settings: ShadowsSettings = { level: "trudny" };
    const first = shadowsEngine.generate(settings, seeded(2), null);
    const second = shadowsEngine.generate(settings, seeded(2), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("the content key is the level", () => {
    assert.notEqual(shadowsSpec.contentKey({ level: "latwy" }), shadowsSpec.contentKey({ level: "sredni" }));
    assert.equal(shadowsSpec.contentKey({ level: "trudny" }), "trudny");
  });

  void test("the spec has at least two known bad cards, each refused with its code", () => {
    assert.ok(shadowsSpec.knownBad.length >= 2);
    for (const bad of shadowsSpec.knownBad) {
      const codes = shadowsSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(codes.includes(bad.expectedCode), `${bad.name}: ${codes.join(", ")}`);
    }
  });

  void test("a card that breaks a rule is refused with CardInvariantError", () => {
    const bad = shadowsSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(shadowsSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("running out of attempts is CardExhausted", () => {
    // A random source stuck at 0 draws the same card every time; with that card as the previous key, none is new.
    const settings: ShadowsSettings = { level: "sredni" };
    const stuck = () => 0;
    const card = shadowsEngine.generate(settings, stuck, null);
    assert.throws(() => shadowsEngine.generate(settings, stuck, card.key), CardExhausted);
  });
});
