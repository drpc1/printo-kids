// Levels and modes of the "Kodowanie" card (S-42): one place shared by the generator, the sheet, the thumbnail and the
// tests. The tables follow the plan (context/changes/coding-card/plan.md) and the PRD (US-35, US-36, Business Logic
// "Karta kodowania").

export type CodingLevelId = "poziom1" | "poziom2" | "poziom3" | "poziom4";

export interface CodingLevel {
  id: CodingLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes; it names no age. */
  description: string;
  /** Grid size in cells. */
  cols: number;
  rows: number;
  /** Side of a grid cell, mm. */
  cell: number;
  /** Share of cells that are obstacles (each cell is drawn with this chance). */
  obstacles: number;
  /** Length of the path in steps, both ends included. */
  pathMin: number;
  pathMax: number;
  /** The path turns at least this many times. */
  turnsMin: number;
  /** Whether consecutive steps in one direction are written as one command ("3 →"). */
  grouped: boolean;
  /** How many of the first answer boxes of a Zapisz card are filled in grey as an example. */
  exampleCells: number;
  /** The most answer boxes (steps, or commands when grouped) a card of this level has; they must fit under the grid. */
  maxAnswers: number;
}

export const DEFAULT_CODING_LEVEL_ID: CodingLevelId = "poziom1";

export const CODING_LEVELS: readonly CodingLevel[] = [
  {
    id: "poziom1",
    label: "Poziom 1",
    barLabel: "1",
    description: "kratka 5×5, krótka droga",
    cols: 5,
    rows: 5,
    cell: 34,
    obstacles: 0.24,
    pathMin: 6,
    pathMax: 8,
    turnsMin: 1,
    grouped: false,
    exampleCells: 1,
    maxAnswers: 8,
  },
  {
    id: "poziom2",
    label: "Poziom 2",
    barLabel: "2",
    description: "kratka 6×6, dłuższa droga",
    cols: 6,
    rows: 6,
    cell: 29,
    obstacles: 0.26,
    pathMin: 9,
    pathMax: 12,
    turnsMin: 2,
    grouped: false,
    exampleCells: 1,
    maxAnswers: 12,
  },
  {
    id: "poziom3",
    label: "Poziom 3",
    barLabel: "3",
    description: "kratka 8×8, więcej zakrętów",
    cols: 8,
    rows: 8,
    cell: 22,
    obstacles: 0.28,
    pathMin: 13,
    pathMax: 17,
    turnsMin: 3,
    grouped: false,
    exampleCells: 2,
    maxAnswers: 17,
  },
  {
    id: "poziom4",
    label: "Poziom 4",
    barLabel: "4",
    description: "kratka 10×10, zapis „3 →”",
    cols: 10,
    rows: 10,
    cell: 18,
    obstacles: 0.3,
    pathMin: 18,
    pathMax: 24,
    turnsMin: 4,
    grouped: true,
    exampleCells: 2,
    // Four rows of "3 →" boxes (27 × 16 mm, six to a row) no longer fit under a 180 mm grid; three rows do.
    maxAnswers: 18,
  },
];

export function codingLevelById(id: CodingLevelId): CodingLevel {
  const level = CODING_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown coding level ${id}`);
  }
  return level;
}

/** What the child does: write the way down, or follow the given arrows. */
export type CodingModeId = "zapisz" | "wykonaj";

export interface CodingMode {
  id: CodingModeId;
  /** Name in the mode list and after "Tryb:" on the bar. */
  label: string;
  /** Half a sentence about what the child does. */
  description: string;
  /** The one instruction of the card in this mode. */
  instruction: string;
  /** Zapisz on a level that writes "n →": the instruction names the number of cells. */
  instructionGrouped: string;
}

export const DEFAULT_CODING_MODE_ID: CodingModeId = "zapisz";

export const CODING_MODES: readonly CodingMode[] = [
  {
    id: "zapisz",
    label: "Zapisz",
    description: "dziecko zapisuje drogę",
    instruction: "Zapisz strzałkami drogę do mety. Jedna strzałka to jeden krok.",
    instructionGrouped: "Zapisz drogę do mety. Liczba kratek i strzałka.",
  },
  {
    id: "wykonaj",
    label: "Wykonaj",
    description: "dziecko idzie za strzałkami",
    instruction: "Idź za strzałkami. Zakreśl, dokąd dojdziesz.",
    instructionGrouped: "Idź za strzałkami. Zakreśl, dokąd dojdziesz.",
  },
];

export const CODING_MODE_IDS: readonly CodingModeId[] = CODING_MODES.map((mode) => mode.id);

export function codingModeById(id: CodingModeId): CodingMode {
  const mode = CODING_MODES.find((candidate) => candidate.id === id);
  if (mode === undefined) {
    throw new Error(`Unknown coding mode ${id}`);
  }
  return mode;
}

/** The sentence at the top of the card for a level and a mode. */
export function codingInstruction(level: CodingLevel, mode: CodingMode): string {
  return level.grouped ? mode.instructionGrouped : mode.instruction;
}
