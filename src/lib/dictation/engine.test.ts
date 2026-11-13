// dictationSpec and dictationEngine (gh283, phase 10). The spec wraps `dictationCardProblems`; level and category are content.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { DictationSettings } from "../card-settings.ts";
import { dictationSpec, dictationEngine } from "./engine.ts";
import { DICTATION_LEVELS } from "./levels.ts";

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

void describe("dictationEngine", () => {
  void test("a card for every level is verified, frozen and keyed", () => {
    const start = performance.now();
    for (const level of DICTATION_LEVELS) {
      const settings: DictationSettings = { level: level.id, category: "wszystkie" };
      const verified = dictationEngine.generate(settings, mulberry32(3), null);
      assert.equal(verified.kind, "dyktando");
      assert.deepEqual(dictationSpec.problems(verified.card, settings), []);
      assert.equal(verified.key, verified.card.key);
      assert.ok(Object.isFrozen(verified.card), level.id);
    }
    // The cold call builds the catalog of each level.
    assert.ok(performance.now() - start < 15000);
  });

  void test("the next card differs from the previous one", () => {
    const settings: DictationSettings = { level: "lat6", category: "wszystkie" };
    const first = dictationEngine.generate(settings, mulberry32(5), null);
    const second = dictationEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });
});

void describe("dictationSpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.ok(dictationSpec.knownBad.length >= 3);
    for (const bad of dictationSpec.knownBad) {
      const codes = dictationSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = dictationSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(dictationSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("level and category are content", () => {
    const base: DictationSettings = { level: "lat6", category: "wszystkie" };
    const key = dictationSpec.contentKey(base);
    assert.notEqual(key, dictationSpec.contentKey({ ...base, level: "lat7" }));
    assert.notEqual(key, dictationSpec.contentKey({ ...base, category: "zwierzeta" }));
  });

  void test("a card for another level is rejected", () => {
    const settings: DictationSettings = { level: "lat6", category: "wszystkie" };
    const card = dictationEngine.generate(settings, mulberry32(1), null).card;
    const codes = dictationSpec.problems(card, { ...settings, level: "lat7" }).map((problem) => problem.code);
    assert.ok(codes.includes("settings-mismatch"));
  });

  void test("the start is not checked: the same outline from another vertex passes (R-9, option B)", () => {
    const settings: DictationSettings = { level: "lat6", category: "wszystkie" };
    const card = dictationEngine.generate(settings, mulberry32(2), null).card;
    // Rotate the walk to begin at the vertex after the first command.
    const [first, ...rest] = card.commands;
    const dx = first.direction === "right" ? first.length : first.direction === "left" ? -first.length : 0;
    const dy = first.direction === "down" ? first.length : first.direction === "up" ? -first.length : 0;
    const rotated = {
      ...card,
      start: { col: card.start.col + dx, row: card.start.row + dy },
      commands: [...rest, first],
    };
    assert.deepEqual(dictationSpec.problems(rotated, settings), []);
  });
});
