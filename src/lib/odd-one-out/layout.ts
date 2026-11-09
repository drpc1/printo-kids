import { ODD_ONE_OUT_SHEET } from "./sheet.ts";

/** Dots of a die: offsets in steps from the center of the slot, x to the right and y down. */
const DICE: Partial<Record<number, readonly (readonly [number, number])[]>> = {
  1: [[0, 0]],
  2: [
    [-1, 0],
    [1, 0],
  ],
  3: [
    [-1, 0.9],
    [1, 0.9],
    [0, -0.9],
  ],
  4: [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ],
  5: [
    [-1, -1],
    [1, -1],
    [0, 0],
    [-1, 1],
    [1, 1],
  ],
  6: [
    [-1, -1.25],
    [1, -1.25],
    [-1, 0],
    [1, 0],
    [-1, 1.25],
    [1, 1.25],
  ],
};

/** Where the shapes of a group of `count` stand, in steps from the center, laid out like the dots of a die. */
export function groupOffsets(count: number): readonly (readonly [number, number])[] {
  const offsets = DICE[count];
  if (offsets === undefined) {
    throw new Error(`No group of ${count} shapes`);
  }
  return offsets;
}

export interface GroupLayout {
  /** Side of one shape (its box). */
  unit: number;
  /** Centers of the shapes, relative to the center of the slot. */
  points: readonly { x: number; y: number }[];
}

/** The shapes of one picture: one shape alone, or a die-like group, `scale` 1 for a big picture. */
export function groupLayout(count: number, slot: number, scale: number): GroupLayout {
  const sheet = ODD_ONE_OUT_SHEET;
  const unit = (count === 1 ? sheet.singleRatio : sheet.groupUnitRatio) * slot * scale;
  const step = unit * sheet.groupStepRatio;
  return { unit, points: groupOffsets(count).map(([dx, dy]) => ({ x: dx * step, y: dy * step })) };
}

/** Side of an icon in a slot, `scale` 1 for a big picture. */
export function iconSize(slot: number, scale: number): number {
  return ODD_ONE_OUT_SHEET.iconRatio * slot * scale;
}

export interface OddSheetInput {
  pageWidth: number;
  pageHeight: number;
  inset: number;
  rowCount: number;
  itemCount: number;
  bandHeight: number;
  bandGap: number;
  rowGap: number;
  slotPadding: number;
}

export interface OddRowLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Centers of the picture slots, left to right. */
  slots: readonly { cx: number; cy: number }[];
}

export interface OddSheetLayout {
  page: { width: number; height: number };
  /** Top of the band for the character and the instruction. */
  band: { y: number; height: number };
  /** Side of the square a picture stands in. */
  slot: number;
  rows: OddRowLayout[];
}

/**
 * Places the rows under the band, spread evenly down the page inside the inset, each with `itemCount` equal slots.
 * Throws when the rows or the slots would not fit.
 */
export function layoutOddOneOutSheet(input: OddSheetInput): OddSheetLayout {
  const { pageWidth, pageHeight, inset, rowCount, itemCount, bandHeight, bandGap, rowGap, slotPadding } = input;
  const width = pageWidth - inset * 2;
  const rowsTop = inset + bandHeight + bandGap;
  const rowHeight = (pageHeight - inset - rowsTop - (rowCount - 1) * rowGap) / rowCount;
  const slotWidth = width / itemCount;
  const slot = Math.min(slotWidth, rowHeight) - slotPadding;

  if (rowCount < 1 || itemCount < 1 || rowHeight <= 0 || slot <= 0) {
    throw new Error(`${rowCount} rows of ${itemCount} pictures do not fit inside the ${inset} page margin`);
  }

  return {
    page: { width: pageWidth, height: pageHeight },
    band: { y: inset, height: bandHeight },
    slot,
    rows: Array.from({ length: rowCount }, (_, index) => {
      const y = rowsTop + index * (rowHeight + rowGap);
      return {
        x: inset,
        y,
        width,
        height: rowHeight,
        slots: Array.from({ length: itemCount }, (_unused, column) => ({
          cx: inset + slotWidth * (column + 0.5),
          cy: y + rowHeight / 2,
        })),
      };
    }),
  };
}
