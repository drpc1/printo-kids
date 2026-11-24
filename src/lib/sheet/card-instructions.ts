import { CLOCK_MODES } from "../clock/levels.ts";
import { CLOCK_SHEET } from "../clock/sheet.ts";
import { CODING_LEVELS, CODING_MODES, codingInstruction } from "../coding/levels.ts";
import { CODING_SHEET } from "../coding/sheet.ts";
import { COPY_DRAWING_SHEET } from "../copy-drawing/sheet.ts";
import { DICTATION_SHEET } from "../dictation/sheet.ts";
import { MATH_CROSSWORD_SHEET } from "../math-crossword/sheet.ts";
import { MONEY_SHEET } from "../money/sheet.ts";
import { NONOGRAM_SHEET, NONOGRAM_SIMPLE_SHEET } from "../nonogram/sheet.ts";
import { NUMBER_MAZE_LEVELS } from "../number-maze/levels.ts";
import { NUMBER_MAZE_SHEET } from "../number-maze/sheet.ts";
import { ODD_ONE_OUT_SHEET } from "../odd-one-out/sheet.ts";
import { PATTERN_LINES_LEVELS } from "../pattern-lines/levels.ts";
import { PATTERN_LINES_SHEET } from "../pattern-lines/sheet.ts";
import { SEQUENCE_SHEET } from "../sequence/sheet.ts";
import { SHADOWS_SHEET } from "../shadows/sheet.ts";
import { SIZE_ORDER_SHEET } from "../size-order/sheet.ts";
import { SUDOKU_SHEET } from "../sudoku/sheet.ts";
import { SYMMETRY_SHEET } from "../symmetry/sheet.ts";
import type { PlainInstructionInput } from "./plain-instruction.ts";

/**
 * The input of `layoutPlainInstruction` for every card that draws its instruction without a character, in one place.
 * A card component and the test that checks every instruction fits between the margins both read it from here, so a
 * change of text, size or margin on a card cannot leave the test checking something else than the page draws.
 */
interface Page {
  pageWidth: number;
  inset: number;
}

function page(sheet: Page): Page {
  return { pageWidth: sheet.pageWidth, inset: sheet.inset };
}

export const clockPlainInstruction = (modeInstruction: string): PlainInstructionInput => ({
  text: modeInstruction,
  size: CLOCK_SHEET.plainInstructionSize,
  ...page(CLOCK_SHEET),
});

export const codingPlainInstruction = (text: string): PlainInstructionInput => ({
  text,
  size: CODING_SHEET.plainInstructionSize,
  ...page(CODING_SHEET),
});

export const copyDrawingPlainInstruction = (): PlainInstructionInput => ({
  text: COPY_DRAWING_SHEET.instructionText,
  size: COPY_DRAWING_SHEET.plainInstructionSize,
  ...page(COPY_DRAWING_SHEET),
});

export const dictationPlainInstruction = (): PlainInstructionInput => ({
  text: DICTATION_SHEET.instructionText,
  size: DICTATION_SHEET.instructionSize,
  ...page(DICTATION_SHEET),
});

export const mathCrosswordPlainInstruction = (): PlainInstructionInput => ({
  text: MATH_CROSSWORD_SHEET.instruction,
  size: MATH_CROSSWORD_SHEET.plainInstructionSize,
  ...page(MATH_CROSSWORD_SHEET),
});

export const moneyPlainInstruction = (): PlainInstructionInput => ({
  text: MONEY_SHEET.instructionLines.join(" "),
  size: MONEY_SHEET.plainInstructionSize,
  ...page(MONEY_SHEET),
});

export const nonogramPlainInstruction = (text: string): PlainInstructionInput => ({
  text,
  size: NONOGRAM_SHEET.instructionSize,
  ...page(NONOGRAM_SHEET),
});

export const numberMazePlainInstruction = (text: string): PlainInstructionInput => ({
  text,
  size: NUMBER_MAZE_SHEET.plainInstructionSize,
  ...page(NUMBER_MAZE_SHEET),
});

export const oddOneOutPlainInstruction = (): PlainInstructionInput => ({
  text: ODD_ONE_OUT_SHEET.instructionLines.join(" "),
  size: ODD_ONE_OUT_SHEET.plainInstructionSize,
  ...page(ODD_ONE_OUT_SHEET),
});

export const patternLinesPlainInstruction = (text: string): PlainInstructionInput => ({
  text,
  size: PATTERN_LINES_SHEET.plainInstructionSize,
  ...page(PATTERN_LINES_SHEET),
});

export const sequencePlainInstruction = (): PlainInstructionInput => ({
  text: SEQUENCE_SHEET.instructionText,
  size: SEQUENCE_SHEET.instructionSize,
  ...page(SEQUENCE_SHEET),
});

export const shadowsPlainInstruction = (): PlainInstructionInput => ({
  text: SHADOWS_SHEET.instruction,
  size: SHADOWS_SHEET.plainInstructionSize,
  ...page(SHADOWS_SHEET),
});

export const sizeOrderPlainInstruction = (): PlainInstructionInput => ({
  text: SIZE_ORDER_SHEET.instruction,
  size: SIZE_ORDER_SHEET.plainInstructionSize,
  ...page(SIZE_ORDER_SHEET),
});

export const sudokuPlainInstruction = (): PlainInstructionInput => ({
  lines: SUDOKU_SHEET.instructionLines,
  lineGap: SUDOKU_SHEET.instructionLineGap,
  size: SUDOKU_SHEET.instructionSize,
  ...page(SUDOKU_SHEET),
});

export const symmetryPlainInstruction = (): PlainInstructionInput => ({
  text: SYMMETRY_SHEET.instructionText,
  size: SYMMETRY_SHEET.instructionSize,
  ...page(SYMMETRY_SHEET),
});

/** Every instruction of every card without a character, for every level and mode it has, by card kind id. */
export function allPlainInstructions(): Record<string, PlainInstructionInput[]> {
  return {
    cienie: [shadowsPlainInstruction()],
    dyktando: [dictationPlainInstruction()],
    kodowanie: CODING_LEVELS.flatMap((level) =>
      CODING_MODES.map((mode) => codingPlainInstruction(codingInstruction(level, mode))),
    ),
    krzyzowka: [mathCrosswordPlainInstruction()],
    pieniadze: [moneyPlainInstruction()],
    niepasuje: [oddOneOutPlainInstruction()],
    liczby: NUMBER_MAZE_LEVELS.map((level) => numberMazePlainInstruction(level.instruction)),
    nonogram: [NONOGRAM_SHEET.instructionText, NONOGRAM_SIMPLE_SHEET.instructionText].map(nonogramPlainInstruction),
    odnajmniejszego: [sizeOrderPlainInstruction()],
    sekwencje: [sequencePlainInstruction()],
    kopiuj: [copyDrawingPlainInstruction()],
    sudoku: [sudokuPlainInstruction()],
    symetria: [symmetryPlainInstruction()],
    szlaczki: PATTERN_LINES_LEVELS.map((level) => patternLinesPlainInstruction(level.instruction)),
    zegar: CLOCK_MODES.map((mode) => clockPlainInstruction(mode.instruction)),
  };
}
