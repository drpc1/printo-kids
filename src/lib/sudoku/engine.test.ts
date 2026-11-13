// sudokuSpec and sudokuEngine (gh283, phase 8). The spec wraps `sudokuCardProblems`; colors never change the card.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard } from "../card-contract.ts";
import type { SudokuCardSettings } from "../card-settings.ts";
import { sudokuEngine, sudokuSpec } from "./engine.ts";
import { SUDOKU_LEVELS, SUDOKU_SIZES, sudokuHasLevels, sudokuHasSymbolChoice } from "./levels.ts";

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

void describe("sudokuEngine", () => {
  void test("a card for every size, level and symbols is verified, frozen and keyed", () => {
    for (const { id: size } of SUDOKU_SIZES) {
      const levels = sudokuHasLevels(size) ? SUDOKU_LEVELS.map((level) => level.id) : [SUDOKU_LEVELS[0].id];
      const symbolsList = sudokuHasSymbolChoice(size) ? (["shapes", "digits"] as const) : (["shapes"] as const);
      for (const level of levels) {
        for (const symbols of symbolsList) {
          const settings: SudokuCardSettings = { size, level, symbols, colors: true };
          const verified = sudokuEngine.generate(settings, mulberry32(3), null);
          assert.equal(verified.kind, "sudoku");
          assert.deepEqual(sudokuSpec.problems(verified.card, settings), []);
          assert.equal(verified.key, verified.card.key);
          assert.ok(Object.isFrozen(verified.card), `${size}/${level}/${symbols}`);
        }
      }
    }
  });

  void test("the next card differs from the previous one", () => {
    const settings: SudokuCardSettings = { size: 6, level: "sredni", symbols: "shapes", colors: false };
    const first = sudokuEngine.generate(settings, mulberry32(5), null);
    const second = sudokuEngine.generate(settings, mulberry32(5), first.key);
    assert.notEqual(second.key, first.key);
  });

  void test("running out of attempts is CardExhausted, not null", () => {
    const settings: SudokuCardSettings = { size: 4, level: "latwy", symbols: "shapes", colors: false };
    // The same draws on every attempt give a card, so a previous key that equals it rejects every attempt.
    const first = sudokuEngine.generate(settings, mulberry32(9), null);
    const same = () => 0.5;
    const constant = sudokuEngine.generate(settings, same, null);
    assert.throws(
      () => sudokuEngine.generate(settings, same, constant.key),
      (error: unknown) => error instanceof CardExhausted && error.kind === "sudoku" && error.attempts > 0,
    );
    assert.ok(first.key.length > 0);
  });

  void test("the hardest 9x9 card comes out in time", () => {
    const settings: SudokuCardSettings = { size: 9, level: "trudny", symbols: "digits", colors: false };
    const start = performance.now();
    sudokuEngine.generate(settings, mulberry32(21), null);
    assert.ok(performance.now() - start < 5000);
  });
});

void describe("sudokuSpec", () => {
  void test("every known bad card is rejected with its expected code", () => {
    assert.ok(sudokuSpec.knownBad.length >= 4);
    for (const bad of sudokuSpec.knownBad) {
      const codes = sudokuSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        codes.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${codes.join(", ")}]`,
      );
    }
  });

  void test("require throws CardInvariantError for a bad card", () => {
    const bad = sudokuSpec.knownBad[0];
    assert.throws(() => VerifiedCard.require(sudokuSpec, bad.card, bad.settings), CardInvariantError);
  });

  void test("size, level and symbols are content, colors are not", () => {
    const base: SudokuCardSettings = { size: 6, level: "sredni", symbols: "shapes", colors: false };
    const key = sudokuSpec.contentKey(base);
    assert.notEqual(key, sudokuSpec.contentKey({ ...base, size: 9 }));
    assert.notEqual(key, sudokuSpec.contentKey({ ...base, level: "trudny" }));
    assert.notEqual(key, sudokuSpec.contentKey({ ...base, symbols: "digits" }));
    assert.equal(key, sudokuSpec.contentKey({ ...base, colors: true }));
  });

  void test("4x4 has one level and always shapes, so those settings do not change its key", () => {
    const base: SudokuCardSettings = { size: 4, level: "latwy", symbols: "shapes", colors: false };
    assert.equal(sudokuSpec.contentKey(base), sudokuSpec.contentKey({ ...base, level: "trudny", symbols: "digits" }));
  });

  void test("a card for other settings is rejected", () => {
    const six: SudokuCardSettings = { size: 6, level: "latwy", symbols: "shapes", colors: false };
    const card = sudokuEngine.generate(six, mulberry32(1), null).card;
    const codes = sudokuSpec.problems(card, { ...six, size: 9 }).map((problem) => problem.code);
    assert.ok(codes.includes("settings-mismatch"));
  });
});
