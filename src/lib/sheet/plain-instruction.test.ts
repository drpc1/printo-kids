import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  layoutPlainInstruction,
  PLAIN_INSTRUCTION,
  plainInstructionLines,
  plainTextWidth,
} from "./plain-instruction.ts";

const PAGE = { pageWidth: 210, inset: 10, size: 7 };
const SHORT = "Połącz każdy obrazek z jego cieniem.";
const LONG = "Zapisz strzałkami najkrótszą drogę do mety. Jedna strzałka to jeden krok.";

void describe("layoutPlainInstruction", () => {
  void test("an instruction that fits stays one line and its height is the font size", () => {
    const layout = layoutPlainInstruction({ ...PAGE, text: SHORT });
    assert.deepEqual(layout.lines, [SHORT]);
    assert.equal(layout.height, PAGE.size);
    assert.equal(layout.size, PAGE.size);
  });

  void test("an instruction wider than the page between margins is cut into one line per sentence", () => {
    assert.ok(plainTextWidth(LONG, PAGE.size) > PAGE.pageWidth - 2 * PAGE.inset);
    const layout = layoutPlainInstruction({ ...PAGE, text: LONG });
    assert.deepEqual(layout.lines, ["Zapisz strzałkami najkrótszą drogę do mety.", "Jedna strzałka to jeden krok."]);
    for (const line of layout.lines) {
      assert.ok(plainTextWidth(line, PAGE.size) <= PAGE.pageWidth - 2 * PAGE.inset, line);
    }
  });

  void test("the height of two lines is two font sizes and the gap between them", () => {
    const layout = layoutPlainInstruction({ ...PAGE, text: LONG });
    const gap = PAGE.size * (PLAIN_INSTRUCTION.lineHeightRatio - 1);
    assert.ok(Math.abs(layout.height - (2 * PAGE.size + gap)) < 1e-9);
  });

  void test("a line's baseline lies baselineShift font sizes under the centre of its box", () => {
    const layout = layoutPlainInstruction({ ...PAGE, text: LONG });
    const pitch = PAGE.size * PLAIN_INSTRUCTION.lineHeightRatio;
    const shift = PAGE.size * PLAIN_INSTRUCTION.baselineShift;
    assert.ok(Math.abs(layout.baselines[0] - (PAGE.size / 2 + shift)) < 1e-9);
    assert.ok(Math.abs(layout.baselines[1] - layout.baselines[0] - pitch) < 1e-9);
    // the last baseline plus what hangs under it stays inside the height
    assert.ok(layout.baselines[1] < layout.height);
  });

  void test("explicit lines are used as they are, with the gap the card asks for (the sudoku has two)", () => {
    const lines = ["Uzupełnij puste pola.", "Nic się nie powtarza w rzędzie, kolumnie i bloku."];
    const layout = layoutPlainInstruction({ pageWidth: 210, inset: 10, size: 6.5, lines, lineGap: 3 });
    assert.deepEqual(layout.lines, lines);
    assert.equal(layout.height, 2 * 6.5 + 3);
  });

  void test("a sentence that does not fit on a line of its own is an error, not a silent overflow", () => {
    const sentence = "Ta jedna bardzo długa instrukcja nie ma kropki w środku więc nie da się jej złamać na zdania";
    assert.throws(() => layoutPlainInstruction({ ...PAGE, text: sentence }), /wider than/);
    assert.throws(() => plainInstructionLines({ ...PAGE, lines: [sentence] }), /wider than/);
  });

  void test("a missing instruction is an error", () => {
    assert.throws(() => plainInstructionLines({ ...PAGE }), /needs/);
  });

  void test("the edge of the width is inclusive: a line exactly as wide as the space between margins fits", () => {
    const size = 7;
    const letters = Math.floor((PAGE.pageWidth - 2 * PAGE.inset) / (size * PLAIN_INSTRUCTION.widthRatio));
    const edge = "a".repeat(letters);
    assert.ok(plainTextWidth(edge, size) <= PAGE.pageWidth - 2 * PAGE.inset);
    assert.deepEqual(layoutPlainInstruction({ ...PAGE, text: edge }).lines, [edge]);
    const over = "a".repeat(letters + 1);
    assert.throws(() => layoutPlainInstruction({ ...PAGE, text: over }), /wider than/);
  });
});
