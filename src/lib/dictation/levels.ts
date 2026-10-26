import type { SymmetryLevelId } from "../symmetry/levels.ts";

export type DictationLevelId = "lat5" | "lat6" | "lat7";

export interface DictationLevel {
  id: DictationLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  description: string;
  typicalAge: string;
  /** Whole grid the child draws on, in cells. The object keeps at least one empty cell on every side. */
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  /** The symmetry level whose templates give the objects of this level. */
  templateLevel: SymmetryLevelId;
  /** Command boxes per row; they share the inner page width equally. */
  commandsPerRow: number;
  commandRowHeight: number;
  /** Font size of the bold "n →" in a command box. */
  commandFontSize: number;
  /** The most commands the sheet fits: whole rows of command boxes that still leave the grid inside the margin. */
  maxCommands: number;
}

export const DEFAULT_DICTATION_LEVEL_ID: DictationLevelId = "lat6";

export const DICTATION_LEVEL_LAT5: DictationLevel = {
  id: "lat5",
  label: "łatwy",
  barLabel: "łatwy",
  description: "duża kratka, prosty obiekt",
  typicalAge: "zwykle ok. 5 lat",
  columns: 10,
  rows: 14,
  cellSize: 14,
  templateLevel: "lat4",
  commandsPerRow: 11,
  commandRowHeight: 12,
  commandFontSize: 6,
  maxCommands: 55,
};

export const DICTATION_LEVEL_LAT6: DictationLevel = {
  id: "lat6",
  label: "średni",
  barLabel: "średni",
  description: "mniejsza kratka, więcej poleceń",
  typicalAge: "zwykle ok. 6 lat",
  columns: 14,
  rows: 17,
  cellSize: 11,
  templateLevel: "lat6",
  commandsPerRow: 11,
  commandRowHeight: 12,
  commandFontSize: 6,
  maxCommands: 55,
};

/** The 7 lat grid (20 by 26 cells of 8 mm) leaves 50 mm for the list, so its boxes are denser: 6 rows of 14. */
export const DICTATION_LEVEL_LAT7: DictationLevel = {
  id: "lat7",
  label: "trudny",
  barLabel: "trudny",
  description: "mała kratka, bogaty obiekt, najwięcej poleceń",
  typicalAge: "zwykle ok. 7 lat",
  columns: 20,
  rows: 26,
  cellSize: 8,
  templateLevel: "lat7",
  commandsPerRow: 14,
  commandRowHeight: 8.3,
  commandFontSize: 4.8,
  maxCommands: 84,
};

export const DICTATION_LEVELS: readonly DictationLevel[] = [
  DICTATION_LEVEL_LAT5,
  DICTATION_LEVEL_LAT6,
  DICTATION_LEVEL_LAT7,
];

export function dictationLevelById(id: DictationLevelId): DictationLevel {
  const level = DICTATION_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown dictation level ${id}`);
  }
  return level;
}
