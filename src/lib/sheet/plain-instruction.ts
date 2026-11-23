import { instructionLines } from "./speech.ts";

/**
 * The instruction of a card without a character: plain text at the top of the sheet, with no band and no bubble.
 * Page units are mm on an A4 sheet. It is one line when it fits between the margins and one line per sentence
 * when it does not, and the card's layout gets the height it takes through `PlainInstructionLayout.height`
 * (the same number every card already passes on as `instructionBoxHeight`).
 */
export const PLAIN_INSTRUCTION = {
  /** Distance between two text lines as a multiple of the font size, the same as in the speech bubble. */
  lineHeightRatio: 1.25,
  /** How far below a line's centre its baseline lies, in font sizes; no `dominant-baseline` (GitHub 371). */
  baselineShift: 0.36,
  /**
   * Average width of a letter as a multiple of the font size, used to decide whether a line fits. Measured in the
   * browser on 2026-11-23 (GitHub 427): the card instructions come to 0.45–0.50 of the font size per letter in Inter
   * and the system sans-serif (Kodowanie 242 mm for 74 letters at 7 mm is 0.47). 0.50 leaves about 6% for fonts that
   * run wider, e.g. on phones. The speech bubble keeps the 0.52 of `estimatedTextWidth`.
   */
  widthRatio: 0.5,
} as const;

/** Rough width of a plain instruction line in mm. */
export function plainTextWidth(line: string, size: number): number {
  return line.length * size * PLAIN_INSTRUCTION.widthRatio;
}

export interface PlainInstructionInput {
  /** The whole instruction. It is cut into sentences only when it does not fit on one line. */
  text?: string;
  /** Lines that are already decided (the sudoku has two); they are used as they are. Wins over `text`. */
  lines?: readonly string[];
  size: number;
  pageWidth: number;
  inset: number;
  /** Space between two lines in mm; by default `size × (lineHeightRatio − 1)`. */
  lineGap?: number;
}

export interface PlainInstructionLayout {
  lines: string[];
  size: number;
  /** The height the instruction takes: `size` for one line, so a card that fits keeps its layout. */
  height: number;
  /** Where each line's baseline lies, measured from the top of the instruction. */
  baselines: number[];
}

/** Breaks the instruction into the lines it is drawn in; throws when a line is wider than the page between margins. */
export function plainInstructionLines(input: PlainInstructionInput): string[] {
  const { text, lines, size, pageWidth, inset } = input;
  const width = pageWidth - 2 * inset;
  const fits = (line: string) => plainTextWidth(line, size) <= width;

  let result: string[];
  if (lines !== undefined) {
    result = [...lines];
  } else if (text !== undefined) {
    result = fits(text) ? [text] : instructionLines(text);
  } else {
    throw new Error("A plain instruction needs `text` or `lines`");
  }
  const tooWide = result.find((line) => !fits(line));
  if (tooWide !== undefined) {
    throw new Error(`The instruction line "${tooWide}" is wider than the ${width} mm between the margins`);
  }
  return result;
}

export function layoutPlainInstruction(input: PlainInstructionInput): PlainInstructionLayout {
  const lines = plainInstructionLines(input);
  const { size } = input;
  const gap = input.lineGap ?? size * (PLAIN_INSTRUCTION.lineHeightRatio - 1);
  const pitch = size + gap;
  return {
    lines,
    size,
    height: lines.length * size + (lines.length - 1) * gap,
    baselines: lines.map((_, index) => size / 2 + index * pitch + size * PLAIN_INSTRUCTION.baselineShift),
  };
}
