// clockSpec and clockEngine (S-41, phase 2).
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { ClockSettings } from "../card-settings.ts";
import { clockEngine, clockSpec, knownBadBases } from "./engine.ts";
import { CLOCK_LEVELS, CLOCK_MODES } from "./levels.ts";

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

const ALL_CODES = [
  "settings-mismatch",
  "wrong-dial-count",
  "minute-not-in-level",
  "too-few-fresh-minutes",
  "repeated-time",
  "hour-out-of-range",
  "border-hour",
  "order-not-permutation",
  "digital-beside-own-dial",
];

void describe("clockEngine", () => {
  void test("a card for every level, mode and 24 h is verified, frozen and keyed", () => {
    for (const level of CLOCK_LEVELS) {
      for (const mode of CLOCK_MODES) {
        for (const h24 of [false, true]) {
          const settings: ClockSettings = { level: level.id, mode: mode.id, h24 };
          const verified = clockEngine.generate(settings, mulberry32(3), null);
          assert.equal(verified.kind, "zegar");
          assert.deepEqual(clockSpec.problems(verified.card, settings), []);
          assert.equal(verified.key, clockSpec.keyOf(verified.card));
          assert.ok(Object.isFrozen(verified.card) && Object.isFrozen(verified.card.times));
        }
      }
    }
  });

  void test("the next card differs from the previous one", () => {
    const settings: ClockSettings = { level: "poziom1", mode: "polacz", h24: false };
    const first = clockEngine.generate(settings, mulberry32(5), null);
    const second = clockEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    const settings: ClockSettings = { level: "poziom1", mode: "odczytaj", h24: false };
    assert.throws(
      () => clockEngine.generate(settings, () => 0.5, null),
      (error: unknown) => error instanceof CardExhausted && error.kind === "zegar" && error.attempts > 0,
    );
  });
});

void describe("clockSpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    for (const bad of clockSpec.knownBad) {
      const codes = clockSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("the sound bases of the known bad cards have no problem", () => {
    for (const base of knownBadBases()) {
      assert.deepEqual(clockSpec.problems(base.card, base.settings), [], base.name);
    }
  });

  void test("the known bad cards cover every code", () => {
    const covered = new Set(clockSpec.knownBad.map((bad) => bad.expectedCode));
    assert.deepEqual([...covered].sort(), [...ALL_CODES].sort());
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = clockSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(clockSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("the level, the mode and 24 h are content", () => {
    const base: ClockSettings = { level: "poziom2", mode: "odczytaj", h24: false };
    assert.equal(clockSpec.contentKey(base), "poziom2|odczytaj|false");
    const keys = [
      clockSpec.contentKey(base),
      clockSpec.contentKey({ ...base, level: "poziom3" }),
      clockSpec.contentKey({ ...base, mode: "polacz" }),
      clockSpec.contentKey({ ...base, h24: true }),
    ];
    assert.equal(new Set(keys).size, keys.length);
  });
});
