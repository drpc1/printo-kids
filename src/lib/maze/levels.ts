export const DEFAULT_LEVEL_ID = "lat5";

export type LevelId = "lat3" | "lat4" | "lat5" | "lat6" | "lat7" | "nastolatek";

export interface MazePoint {
  row: number;
  col: number;
}

export type MazeAlgorithm = "kruskal" | "backtracker";

export interface Level {
  id: LevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  description: string;
  typicalAge: string;
  columns: number;
  rows: number;
  entrance: MazePoint;
  /** Columns of the bottom row the exit is drawn from. */
  exitColumns: readonly number[];
  algorithm: MazeAlgorithm;
  showCharacter: boolean;
}

export const LEVELS: readonly Level[] = [
  {
    id: "lat3",
    label: "Poziom 1",
    barLabel: "1",
    description: "najszersze alejki, krótka droga",
    typicalAge: "zwykle ok. 3 lata",
    columns: 9,
    rows: 11,
    entrance: { row: 0, col: 4 },
    exitColumns: [0, 1, 2, 6, 7, 8],
    algorithm: "kruskal",
    showCharacter: true,
  },
  {
    id: "lat4",
    label: "Poziom 2",
    barLabel: "2",
    description: "szerokie alejki, kręta droga",
    typicalAge: "zwykle ok. 4 lata",
    columns: 11,
    rows: 13,
    entrance: { row: 0, col: 5 },
    exitColumns: [0, 1, 2, 3, 7, 8, 9, 10],
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "lat5",
    label: "Poziom 3",
    barLabel: "3",
    description: "węższe alejki, dłuższa kręta droga",
    typicalAge: "zwykle ok. 5 lat",
    columns: 13,
    rows: 16,
    entrance: { row: 0, col: 6 },
    exitColumns: [0, 1, 2, 3, 4, 8, 9, 10, 11, 12],
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "lat6",
    label: "Poziom 4",
    barLabel: "4",
    description: "wąskie alejki, długa kręta droga",
    typicalAge: "zwykle ok. 6 lat",
    columns: 15,
    rows: 18,
    entrance: { row: 0, col: 7 },
    exitColumns: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14],
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "lat7",
    label: "Poziom 5",
    barLabel: "5",
    description: "bardzo wąskie alejki, bardzo długa droga",
    typicalAge: "zwykle 7–8 lat",
    columns: 19,
    rows: 23,
    entrance: { row: 0, col: 9 },
    exitColumns: [0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18],
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "nastolatek",
    label: "Poziom 6",
    barLabel: "6",
    description: "najwęższe alejki, start i meta w rogach",
    typicalAge: "zwykle nastolatki",
    columns: 29,
    rows: 35,
    entrance: { row: 0, col: 0 },
    exitColumns: [28],
    algorithm: "backtracker",
    showCharacter: true,
  },
];

export function isLevelId(value: unknown): value is LevelId {
  return LEVELS.some((level) => level.id === value);
}

export function levelById(id: LevelId): Level {
  const level = LEVELS.find((entry) => entry.id === id);
  if (level === undefined) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}
