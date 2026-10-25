import type { SymmetryLevelId } from "../symmetry/levels.ts";

export type NonogramSizeId = "maly" | "sredni" | "duzy";

export interface NonogramSize {
  id: NonogramSizeId;
  label: string;
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  /** Height of a clue digit in mm. */
  digitSize: number;
  /** Symmetry level whose templates draw the picture: its half grid is the template frame, mirrored to the whole grid. */
  templateLevel: SymmetryLevelId;
}

export const DEFAULT_NONOGRAM_SIZE_ID: NonogramSizeId = "sredni";

export const NONOGRAM_SIZES: readonly NonogramSize[] = [
  { id: "maly", label: "mały", columns: 8, rows: 12, cellSize: 14, digitSize: 6, templateLevel: "lat4" },
  { id: "sredni", label: "średni", columns: 12, rows: 15, cellSize: 12, digitSize: 6, templateLevel: "lat5" },
  { id: "duzy", label: "duży", columns: 18, rows: 24, cellSize: 7, digitSize: 5, templateLevel: "lat7" },
];

export function nonogramSizeById(id: NonogramSizeId): NonogramSize {
  const size = NONOGRAM_SIZES.find((candidate) => candidate.id === id);
  if (size === undefined) {
    throw new Error(`Unknown nonogram size ${id}`);
  }
  return size;
}
