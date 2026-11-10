import type { PatternLinesLevel } from "./levels.ts";
import { rowHalfExtent, rowLength } from "./paths.ts";
import { PATTERN_LINES_SHEET } from "./sheet.ts";

/** Slack for floating point error at the edge of the margin. */
const EPSILON = 1e-6;

export interface PatternLinesSheetLayout {
  page: { width: number; height: number };
  /** The instruction: the speech band with a character, the plain line without one. */
  band: { y: number; height: number };
  /** Where the rows start on the page and how long they are, mm. */
  left: number;
  length: number;
  /** Middle line of each row, from the top. Equal steps, the first under the instruction, the last at the bottom margin. */
  centers: number[];
  /** Distance between the middle lines of two neighbouring rows. */
  step: number;
  /** Half the height one row takes (the pattern, or the ruling). */
  halfExtent: number;
}

/**
 * Places the instruction and the rows. The first row stands under the instruction, the last ends at the bottom margin (less
 * the level's extra bottom strip) and the gaps between the rows are equal. `instructionBoxHeight` is the band with a
 * character, the plain line height without one. Throws when a row would cross the 10 mm margin or its neighbour.
 */
export function layoutPatternLinesSheet(
  level: PatternLinesLevel,
  instructionBoxHeight: number,
): PatternLinesSheetLayout {
  const sheet = PATTERN_LINES_SHEET;
  const halfExtent = rowHalfExtent(level);
  const top = sheet.inset + instructionBoxHeight + sheet.bandGap + sheet.captionSpace;
  const bottom = sheet.pageHeight - sheet.inset - level.bottomPad;
  const first = top + halfExtent;
  const last = bottom - halfExtent;
  const step = level.rows > 1 ? (last - first) / (level.rows - 1) : 0;
  if (last < first - EPSILON || (level.rows > 1 && step < 2 * halfExtent - EPSILON)) {
    throw new Error(`${level.rows} rows of ${2 * halfExtent} mm do not fit under the instruction inside the margin`);
  }
  const centers = Array.from({ length: level.rows }, (_, i) => first + step * i);
  const left = sheet.inset + sheet.rowIndent;
  const length = rowLength();
  if (
    left < sheet.inset - EPSILON ||
    left + length > sheet.pageWidth - sheet.inset + EPSILON ||
    centers[0] - halfExtent < top - EPSILON ||
    centers[centers.length - 1] + halfExtent > sheet.pageHeight - sheet.inset + EPSILON
  ) {
    throw new Error(`The rows cross the ${sheet.inset} mm page margin`);
  }
  return {
    page: { width: sheet.pageWidth, height: sheet.pageHeight },
    band: { y: sheet.inset, height: instructionBoxHeight },
    left,
    length,
    centers,
    step,
    halfExtent,
  };
}
