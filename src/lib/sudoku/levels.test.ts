import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  DEFAULT_SUDOKU_SETTINGS,
  SUDOKU_LEVELS,
  SUDOKU_SIZES,
  sudokuBlankCount,
  sudokuHasLevels,
  sudokuHasSymbolChoice,
  sudokuLevelDescription,
} from "./levels.ts";

void describe("sudokuBlankCount", () => {
  void test("4×4 has four blanks at every level", () => {
    for (const { id } of SUDOKU_LEVELS) assert.equal(sudokuBlankCount(4, id), 4);
  });

  void test("6×6 has 12, 18 and 22 blanks of 36", () => {
    assert.deepEqual(
      SUDOKU_LEVELS.map(({ id }) => sudokuBlankCount(6, id)),
      [12, 18, 22],
    );
  });

  void test("9×9 has 35, 45 and 52 blanks of 81", () => {
    assert.deepEqual(
      SUDOKU_LEVELS.map(({ id }) => sudokuBlankCount(9, id)),
      [35, 45, 52],
    );
  });
});

void describe("sudoku settings", () => {
  void test("the levels and sizes are listed in order with their labels", () => {
    assert.deepEqual(
      SUDOKU_SIZES.map(({ label }) => label),
      ["4×4", "6×6", "9×9"],
    );
    assert.deepEqual(
      SUDOKU_LEVELS.map(({ label }) => label),
      ["łatwy", "średni", "trudny"],
    );
  });

  void test("level bar labels carry no age", () => {
    assert.deepEqual(
      SUDOKU_LEVELS.map(({ barLabel }) => barLabel),
      ["łatwy", "średni", "trudny"],
    );
    for (const { label, barLabel } of SUDOKU_LEVELS) assert.doesNotMatch(label + barLabel, /lat|nastolat/);
  });

  void test("level descriptions count the blanks with Polish plural forms", () => {
    assert.deepEqual(
      SUDOKU_LEVELS.map(({ id }) => sudokuLevelDescription(6, id)),
      ["12 pustych pól z 36", "18 pustych pól z 36", "22 puste pola z 36"],
    );
    assert.deepEqual(
      SUDOKU_LEVELS.map(({ id }) => sudokuLevelDescription(9, id)),
      ["35 pustych pól z 81", "45 pustych pól z 81", "52 puste pola z 81"],
    );
  });

  void test("levels and the shapes or digits choice exist from 6×6 up, not for 4×4", () => {
    assert.equal(sudokuHasLevels(4), false);
    assert.equal(sudokuHasLevels(6), true);
    assert.equal(sudokuHasLevels(9), true);
    assert.equal(sudokuHasSymbolChoice(4), false);
    assert.equal(sudokuHasSymbolChoice(6), true);
    assert.equal(sudokuHasSymbolChoice(9), true);
  });

  void test("the default is 4×4, easy, shapes", () => {
    assert.deepEqual(DEFAULT_SUDOKU_SETTINGS, { size: 4, level: "latwy", symbols: "shapes" });
  });
});
