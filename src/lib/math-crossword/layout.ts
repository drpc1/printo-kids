import type { MathCell, MathCrosswordCard } from "./card.ts";
import { mathCrosswordLevelById } from "./levels.ts";
import { MATH_CROSSWORD_SHEET } from "./sheet.ts";

/** Slack for floating point error at the edge of the margin. */
const EPSILON = 1e-6;

export interface MathCrosswordSheetLayout {
  page: { width: number; height: number };
  /** The instruction: the speech band with a character, the plain line without one. */
  band: { y: number; height: number };
  /** Side of one cell in mm: the largest that fits, no larger than the level's `maxCell`. */
  cell: number;
  /** Where the top left corner of the crossword is on the page, mm. */
  left: number;
  top: number;
  /** The crossword in cells. */
  cols: number;
  rows: number;
  /** Every cell with its top left corner on the page, mm. */
  placed: { cell: MathCell; x: number; y: number }[];
}

/**
 * Places the instruction and the crossword. The crossword is centred in the area under the instruction, its cell the
 * largest that fits (never above the level's `maxCell`). `instructionBoxHeight` is the band with a character, the plain
 * line height without one. Throws when a cell would cross the 10 mm margin.
 */
export function layoutMathCrosswordSheet(
  card: MathCrosswordCard,
  instructionBoxHeight: number,
): MathCrosswordSheetLayout {
  const sheet = MATH_CROSSWORD_SHEET;
  const level = mathCrosswordLevelById(card.level);
  const cols = Math.max(...card.cells.map((cell) => cell.col)) + 1;
  const rows = Math.max(...card.cells.map((cell) => cell.row)) + 1;
  const areaLeft = sheet.inset;
  const areaTop = sheet.inset + instructionBoxHeight + sheet.bandGap;
  const areaWidth = sheet.pageWidth - 2 * sheet.inset;
  const areaHeight = sheet.pageHeight - sheet.inset - areaTop;
  if (areaHeight <= 0) {
    throw new Error(`No room under the instruction (${instructionBoxHeight} mm) inside the margin`);
  }
  const cell = Math.min(level.maxCell, areaWidth / cols, areaHeight / rows);
  const left = areaLeft + (areaWidth - cols * cell) / 2;
  const top = areaTop + (areaHeight - rows * cell) / 2;
  if (
    left < sheet.inset - EPSILON ||
    left + cols * cell > sheet.pageWidth - sheet.inset + EPSILON ||
    top < areaTop - EPSILON ||
    top + rows * cell > sheet.pageHeight - sheet.inset + EPSILON
  ) {
    throw new Error(`The crossword crosses the ${sheet.inset} mm page margin`);
  }
  return {
    page: { width: sheet.pageWidth, height: sheet.pageHeight },
    band: { y: sheet.inset, height: instructionBoxHeight },
    cell,
    left,
    top,
    cols,
    rows,
    placed: card.cells.map((item) => ({ cell: item, x: left + item.col * cell, y: top + item.row * cell })),
  };
}
