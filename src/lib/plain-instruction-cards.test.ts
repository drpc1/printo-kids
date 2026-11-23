import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { CARD_KINDS } from "./cards.ts";
import { CLOCK_MODES } from "./clock/levels.ts";
import { CLOCK_SHEET } from "./clock/sheet.ts";
import { CODING_LEVELS, CODING_MODES, codingInstruction } from "./coding/levels.ts";
import { CODING_SHEET } from "./coding/sheet.ts";
import { COPY_DRAWING_SHEET } from "./copy-drawing/sheet.ts";
import { DICTATION_SHEET } from "./dictation/sheet.ts";
import { MATH_CROSSWORD_SHEET } from "./math-crossword/sheet.ts";
import { MONEY_SHEET } from "./money/sheet.ts";
import { NONOGRAM_SHEET, NONOGRAM_SIMPLE_SHEET } from "./nonogram/sheet.ts";
import { NUMBER_MAZE_LEVELS } from "./number-maze/levels.ts";
import { NUMBER_MAZE_SHEET } from "./number-maze/sheet.ts";
import { ODD_ONE_OUT_SHEET } from "./odd-one-out/sheet.ts";
import { PATTERN_LINES_LEVELS } from "./pattern-lines/levels.ts";
import { PATTERN_LINES_SHEET } from "./pattern-lines/sheet.ts";
import { SEQUENCE_SHEET } from "./sequence/sheet.ts";
import { layoutPlainInstruction } from "./sheet/plain-instruction.ts";
import { SHADOWS_SHEET } from "./shadows/sheet.ts";
import { SIZE_ORDER_SHEET } from "./size-order/sheet.ts";
import { SUDOKU_SHEET } from "./sudoku/sheet.ts";
import { SYMMETRY_SHEET } from "./symmetry/sheet.ts";

interface PlainInstruction {
  text?: string;
  lines?: readonly string[];
  lineGap?: number;
  size: number;
  pageWidth: number;
  inset: number;
}

/** Every instruction a card draws without a character, for every level and mode it has, by card kind id. */
const PLAIN_INSTRUCTIONS: Record<string, PlainInstruction[]> = {
  cienie: [{ text: SHADOWS_SHEET.instruction, size: SHADOWS_SHEET.plainInstructionSize, ...page(SHADOWS_SHEET) }],
  dyktando: [
    { text: DICTATION_SHEET.instructionText, size: DICTATION_SHEET.instructionSize, ...page(DICTATION_SHEET) },
  ],
  kodowanie: CODING_LEVELS.flatMap((level) =>
    CODING_MODES.map((mode) => ({
      text: codingInstruction(level, mode),
      size: CODING_SHEET.plainInstructionSize,
      ...page(CODING_SHEET),
    })),
  ),
  krzyzowka: [
    {
      text: MATH_CROSSWORD_SHEET.instruction,
      size: MATH_CROSSWORD_SHEET.plainInstructionSize,
      ...page(MATH_CROSSWORD_SHEET),
    },
  ],
  pieniadze: [
    { text: MONEY_SHEET.instructionLines.join(" "), size: MONEY_SHEET.plainInstructionSize, ...page(MONEY_SHEET) },
  ],
  niepasuje: [
    {
      text: ODD_ONE_OUT_SHEET.instructionLines.join(" "),
      size: ODD_ONE_OUT_SHEET.plainInstructionSize,
      ...page(ODD_ONE_OUT_SHEET),
    },
  ],
  liczby: NUMBER_MAZE_LEVELS.map((level) => ({
    text: level.instruction,
    size: NUMBER_MAZE_SHEET.plainInstructionSize,
    ...page(NUMBER_MAZE_SHEET),
  })),
  nonogram: [NONOGRAM_SHEET.instructionText, NONOGRAM_SIMPLE_SHEET.instructionText].map((text) => ({
    text,
    size: NONOGRAM_SHEET.instructionSize,
    ...page(NONOGRAM_SHEET),
  })),
  odnajmniejszego: [
    { text: SIZE_ORDER_SHEET.instruction, size: SIZE_ORDER_SHEET.plainInstructionSize, ...page(SIZE_ORDER_SHEET) },
  ],
  sekwencje: [{ text: SEQUENCE_SHEET.instructionText, size: SEQUENCE_SHEET.instructionSize, ...page(SEQUENCE_SHEET) }],
  kopiuj: [
    {
      text: COPY_DRAWING_SHEET.instructionText,
      size: COPY_DRAWING_SHEET.plainInstructionSize,
      ...page(COPY_DRAWING_SHEET),
    },
  ],
  sudoku: [
    {
      lines: SUDOKU_SHEET.instructionLines,
      lineGap: SUDOKU_SHEET.instructionLineGap,
      size: SUDOKU_SHEET.instructionSize,
      ...page(SUDOKU_SHEET),
    },
  ],
  symetria: [{ text: SYMMETRY_SHEET.instructionText, size: SYMMETRY_SHEET.instructionSize, ...page(SYMMETRY_SHEET) }],
  szlaczki: PATTERN_LINES_LEVELS.map((level) => ({
    text: level.instruction,
    size: PATTERN_LINES_SHEET.plainInstructionSize,
    ...page(PATTERN_LINES_SHEET),
  })),
  zegar: CLOCK_MODES.map((mode) => ({
    text: mode.instruction,
    size: CLOCK_SHEET.plainInstructionSize,
    ...page(CLOCK_SHEET),
  })),
};

function page(sheet: { pageWidth: number; inset: number }): { pageWidth: number; inset: number } {
  return { pageWidth: sheet.pageWidth, inset: sheet.inset };
}

/** The maze draws no instruction, so it has no plain line to fit. */
const WITHOUT_INSTRUCTION = ["labirynt"];

void describe("the instruction of every card without a character", () => {
  void test("every card kind but the maze is covered, so a new card cannot skip this test", () => {
    const expected = CARD_KINDS.map((kind) => kind.id)
      .filter((id) => !WITHOUT_INSTRUCTION.includes(id))
      .sort();
    assert.deepEqual(Object.keys(PLAIN_INSTRUCTIONS).sort(), expected);
  });

  void test("every instruction of every level and mode is laid out inside the margins", () => {
    for (const [card, instructions] of Object.entries(PLAIN_INSTRUCTIONS)) {
      assert.ok(instructions.length > 0, card);
      for (const instruction of instructions) {
        // layoutPlainInstruction throws when a line is wider than the page between margins
        const layout = layoutPlainInstruction(instruction);
        assert.ok(layout.lines.length >= 1, card);
        assert.ok(layout.height >= instruction.size, card);
      }
    }
  });

  void test("the long instructions of Kodowanie in Zapisz are broken into two lines, the short ones are not", () => {
    const zapisz = CODING_MODES.find((mode) => mode.id === "zapisz");
    const wykonaj = CODING_MODES.find((mode) => mode.id === "wykonaj");
    assert.ok(zapisz !== undefined && wykonaj !== undefined);
    for (const level of CODING_LEVELS) {
      const base = { size: CODING_SHEET.plainInstructionSize, ...page(CODING_SHEET) };
      assert.equal(
        layoutPlainInstruction({ ...base, text: codingInstruction(level, zapisz) }).lines.length,
        2,
        level.id,
      );
      assert.equal(
        layoutPlainInstruction({ ...base, text: codingInstruction(level, wykonaj) }).lines.length,
        1,
        level.id,
      );
    }
  });

  void test("Dyktando graficzne, whose instruction is 189 mm wide in the browser, is broken into two lines", () => {
    const layout = layoutPlainInstruction(PLAIN_INSTRUCTIONS.dyktando[0]);
    assert.equal(layout.lines.length, 2);
  });

  void test("every other card keeps its instruction on one line, so its layout does not move", () => {
    const broken = ["kodowanie", "dyktando"];
    for (const [card, instructions] of Object.entries(PLAIN_INSTRUCTIONS)) {
      if (broken.includes(card) || card === "sudoku") {
        continue;
      }
      for (const instruction of instructions) {
        const layout = layoutPlainInstruction(instruction);
        assert.equal(layout.lines.length, 1, `${card}: ${instruction.text}`);
        assert.equal(layout.height, instruction.size, card);
      }
    }
  });
});
