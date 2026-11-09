import type { CopyDrawingLevel } from "./levels.ts";
import { COPY_DRAWING_SHEET } from "./sheet.ts";

/** Slack for floating point error at the edge of the margin: the hard level fills the width to the millimetre. */
const EPSILON = 1e-6;

export interface CopyDrawingGridRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CopyDrawingSheetLayout {
  page: { width: number; height: number };
  /** The instruction: the speech band with a character, the plain line without one. */
  band: { y: number; height: number };
  /** Side of one grid cell in mm: always the level's own size; a layout that cannot give it throws. */
  cell: number;
  columns: number;
  rows: number;
  /** The grid with the silhouette. */
  source: CopyDrawingGridRect;
  /** The empty grid the child draws in. */
  copy: CopyDrawingGridRect;
}

/**
 * Places the instruction and the two grids. The block of the two grids is centered across the page and sits right under the instruction (spare room stays at the bottom)
 * inside the 10 mm margin. `instructionBoxHeight` is the band with a character, the plain line
 * height without one. Throws when the level's cell size does not fit, instead of shrinking the cell or crossing the margin.
 */
export function layoutCopyDrawingSheet(level: CopyDrawingLevel, instructionBoxHeight: number): CopyDrawingSheetLayout {
  const sheet = COPY_DRAWING_SHEET;
  const { columns, rows } = level.size;
  const innerWidth = sheet.pageWidth - sheet.inset * 2;
  const areaTop = sheet.inset + instructionBoxHeight + sheet.bandGap;
  const areaBottom = sheet.pageHeight - sheet.inset;
  const fits = Math.min((innerWidth - sheet.gridGap) / (2 * columns), (areaBottom - areaTop) / rows);
  const cell = level.cellSize;
  if (fits < cell - EPSILON) {
    throw new Error(
      `Two ${columns} by ${rows} grids of ${cell} mm do not fit inside the ${sheet.inset} mm page margin`,
    );
  }

  const width = columns * cell;
  const height = rows * cell;
  const left = sheet.inset + (innerWidth - (2 * width + sheet.gridGap)) / 2;
  const top = areaTop;
  const source = { x: left, y: top, width, height };
  const copy = { x: left + width + sheet.gridGap, y: top, width, height };

  if (
    left < sheet.inset - EPSILON ||
    copy.x + copy.width > sheet.pageWidth - sheet.inset + EPSILON ||
    top < areaTop - EPSILON ||
    top + height > areaBottom + EPSILON
  ) {
    throw new Error(`Two ${columns} by ${rows} grids of ${cell} mm cross the ${sheet.inset} page margin`);
  }

  return {
    page: { width: sheet.pageWidth, height: sheet.pageHeight },
    band: { y: sheet.inset, height: instructionBoxHeight },
    cell,
    columns,
    rows,
    source,
    copy,
  };
}
