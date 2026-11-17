// codingSpec and codingEngine (S-42, phase 2).
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { CodingSettings } from "../card-settings.ts";
import { codingProblems } from "./card.ts";
import { codingEngine, codingSpec, knownBadBases } from "./engine.ts";
import { CODING_LEVELS, CODING_MODES } from "./levels.ts";

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

void describe("codingEngine", () => {
  void test("a card for every level and mode is verified, frozen and keyed", () => {
    for (const level of CODING_LEVELS) {
      for (const mode of CODING_MODES) {
        const settings: CodingSettings = { level: level.id, mode: mode.id };
        const verified = codingEngine.generate(settings, mulberry32(3), null);
        assert.equal(verified.kind, "kodowanie");
        assert.deepEqual(codingSpec.problems(verified.card, settings), []);
        assert.ok(Object.isFrozen(verified.card));
        assert.equal(verified.key, codingSpec.keyOf(verified.card));
      }
    }
  });

  void test("the next card has another key", () => {
    const settings: CodingSettings = { level: "poziom2", mode: "zapisz" };
    const first = codingEngine.generate(settings, mulberry32(4), null);
    const second = codingEngine.generate(settings, mulberry32(4), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("the content key holds the level and the mode and nothing else", () => {
    assert.equal(codingSpec.contentKey({ level: "poziom3", mode: "wykonaj" }), "poziom3|wykonaj");
    assert.notEqual(
      codingSpec.contentKey({ level: "poziom1", mode: "zapisz" }),
      codingSpec.contentKey({ level: "poziom1", mode: "wykonaj" }),
    );
  });

  void test("the spec has at least two known bad cards, each with a code the rules can name", () => {
    assert.ok(codingSpec.knownBad.length >= 2);
    const codes = codingSpec.knownBad.map((bad) => bad.expectedCode);
    for (const code of ["shortest-path-not-unique", "path-leaves-grid-or-hits-obstacle", "distractor-on-path"]) {
      assert.ok(codes.includes(code), code);
    }
    for (const base of knownBadBases()) assert.deepEqual(codingProblems(base.card, base.settings), []);
  });

  void test("a card that breaks a rule is refused with CardInvariantError", () => {
    const bad = codingSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(codingSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("a random source that cannot give a legal card ends in CardExhausted", () => {
    // Every cell is an obstacle (0 < every share), so no goal is ever reachable.
    assert.throws(() => codingEngine.generate({ level: "poziom1", mode: "zapisz" }, () => 0, null), CardExhausted);
  });
});
