import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { SizeOrderSettings } from "../card-settings.ts";
import { sizeOrderCardProblems } from "./card.ts";
import { sizeOrderEngine, sizeOrderSpec } from "./engine.ts";
import { SIZE_ORDER_LEVELS, sizeOrderLevelById } from "./levels.ts";

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

void describe("sizeOrderEngine", () => {
  void test("a card of every level is verified, frozen and keyed", () => {
    for (const level of SIZE_ORDER_LEVELS) {
      const settings: SizeOrderSettings = { level: level.id, colors: false };
      const verified = sizeOrderEngine.generate(settings, mulberry32(3), null);
      assert.equal(verified.kind, "odnajmniejszego");
      assert.deepEqual(sizeOrderSpec.problems(verified.card, settings), []);
      assert.ok(Object.isFrozen(verified.card));
      assert.equal(verified.key, sizeOrderSpec.keyOf(verified.card));
    }
  });

  void test("the next card has another key", () => {
    const settings: SizeOrderSettings = { level: "sredni", colors: true };
    const first = sizeOrderEngine.generate(settings, mulberry32(4), null);
    const second = sizeOrderEngine.generate(settings, mulberry32(4), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("the content key holds the level only: colors keep the card, the level lays out a new one", () => {
    assert.equal(
      sizeOrderSpec.contentKey({ level: "sredni", colors: true }),
      sizeOrderSpec.contentKey({ level: "sredni", colors: false }),
    );
    assert.notEqual(
      sizeOrderSpec.contentKey({ level: "latwy", colors: false }),
      sizeOrderSpec.contentKey({ level: "trudny", colors: false }),
    );
  });

  void test("the spec has at least two known bad cards, each refused with its code", () => {
    assert.ok(sizeOrderSpec.knownBad.length >= 2);
    for (const bad of sizeOrderSpec.knownBad) {
      const codes = sizeOrderCardProblems(bad.card, sizeOrderLevelById(bad.settings.level));
      assert.ok(codes.includes(bad.expectedCode), `${bad.name}: ${codes.join(",")}`);
    }
  });

  void test("a card that breaks a rule is refused with CardInvariantError", () => {
    const bad = sizeOrderSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(sizeOrderSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("running out of attempts is CardExhausted", () => {
    const constant = () => 0.5;
    const settings: SizeOrderSettings = { level: "latwy", colors: false };
    const first = sizeOrderEngine.generate(settings, constant, null);
    assert.throws(() => sizeOrderEngine.generate(settings, constant, first.key), CardExhausted);
  });
});
