import type { SymmetryLevelId } from "../symmetry/levels.ts";

/** The nonogram levels. The ids name the old sizes: easy is the 8 by 12 grid, hard the 18 by 24 grid. */
export type NonogramSizeId = "latwy" | "sredni" | "trudny";

/**
 * "znaczki": every row is described in full by chips (white, gray or black, with a cell count), no column clues, for
 * preschoolers. "liczby": the classic nonogram with clue numbers by every row and column.
 */
export type NonogramKind = "znaczki" | "liczby";

export interface NonogramSize {
  id: NonogramSizeId;
  label: string;
  kind: NonogramKind;
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  /** Height of a clue digit in mm (the classic card; the chip card sizes its digits in `NONOGRAM_SHEET`). */
  digitSize: number;
  /** Symmetry level whose templates draw the picture: its half grid is the template frame, mirrored to the whole grid. */
  templateLevel: SymmetryLevelId;
}

export const DEFAULT_NONOGRAM_SIZE_ID: NonogramSizeId = "sredni";

export const NONOGRAM_SIZES: readonly NonogramSize[] = [
  {
    id: "latwy",
    label: "łatwy",
    kind: "znaczki",
    columns: 8,
    rows: 12,
    cellSize: 14,
    digitSize: 6,
    templateLevel: "lat4",
  },
  {
    id: "sredni",
    label: "średni",
    kind: "liczby",
    columns: 12,
    rows: 15,
    cellSize: 12,
    digitSize: 6,
    templateLevel: "lat5",
  },
  {
    id: "trudny",
    label: "trudny",
    kind: "liczby",
    columns: 18,
    rows: 24,
    cellSize: 7,
    digitSize: 5,
    templateLevel: "lat7",
  },
];

/** The levels drawn with clue numbers and checked by the line solver. */
export const CLASSIC_NONOGRAM_SIZES: readonly NonogramSize[] = NONOGRAM_SIZES.filter((size) => size.kind === "liczby");

export function nonogramSizeById(id: NonogramSizeId): NonogramSize {
  const size = NONOGRAM_SIZES.find((candidate) => candidate.id === id);
  if (size === undefined) {
    throw new Error(`Unknown nonogram size ${id}`);
  }
  return size;
}
