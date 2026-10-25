import type { SymmetryLevelId } from "../symmetry/levels.ts";

export interface DictationLevel {
  id: "lat6";
  label: string;
  /** Whole grid the child draws on, in cells. The object keeps at least one empty cell on every side. */
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  /** The symmetry level whose templates give the objects of this level. */
  templateLevel: SymmetryLevelId;
}

export const DICTATION_LEVEL_LAT6: DictationLevel = {
  id: "lat6",
  label: "6 lat",
  columns: 14,
  rows: 17,
  cellSize: 11,
  templateLevel: "lat6",
};
