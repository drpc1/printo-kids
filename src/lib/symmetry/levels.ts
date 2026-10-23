export const DEFAULT_SYMMETRY_LEVEL_ID = "lat5";

export type SymmetryLevelId = "lat4" | "lat5" | "lat6" | "lat7";

export interface SymmetryLevel {
  id: SymmetryLevelId;
  label: string;
  /** Whole grid; the axis splits it into two halves of `columns / 2` columns. */
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  /** How many cells of the answer are already filled in on the child's half. */
  hintCount: number;
}

export const SYMMETRY_LEVELS: readonly SymmetryLevel[] = [
  { id: "lat4", label: "4 lata", columns: 8, rows: 12, cellSize: 20, hintCount: 3 },
  { id: "lat5", label: "5 lat", columns: 12, rows: 16, cellSize: 15, hintCount: 0 },
  { id: "lat6", label: "6 lat", columns: 14, rows: 20, cellSize: 12, hintCount: 0 },
  { id: "lat7", label: "7 lat", columns: 18, rows: 24, cellSize: 10, hintCount: 0 },
];

export function symmetryLevelById(id: SymmetryLevelId): SymmetryLevel {
  const level = SYMMETRY_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown symmetry level ${id}`);
  }
  return level;
}
