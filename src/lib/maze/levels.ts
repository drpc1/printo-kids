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
  exit: MazePoint;
  algorithm: MazeAlgorithm;
  showCharacter: boolean;
}

export const LEVELS: readonly Level[] = [
  {
    id: "lat3",
    label: "Poziom 1",
    barLabel: "1",
    description: "szerokie alejki, krótka droga",
    typicalAge: "zwykle ok. 3 lata",
    columns: 9,
    rows: 11,
    entrance: { row: 0, col: 4 },
    exit: { row: 10, col: 4 },
    algorithm: "kruskal",
    showCharacter: true,
  },
  {
    id: "lat4",
    label: "Poziom 2",
    barLabel: "2",
    description: "szerokie alejki, długa kręta droga",
    typicalAge: "zwykle ok. 4 lata",
    columns: 9,
    rows: 11,
    entrance: { row: 0, col: 4 },
    exit: { row: 10, col: 4 },
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "lat5",
    label: "Poziom 3",
    barLabel: "3",
    description: "węższe alejki, krótka droga",
    typicalAge: "zwykle ok. 5 lat",
    columns: 13,
    rows: 16,
    entrance: { row: 0, col: 6 },
    exit: { row: 15, col: 6 },
    algorithm: "kruskal",
    showCharacter: true,
  },
  {
    id: "lat6",
    label: "Poziom 4",
    barLabel: "4",
    description: "węższe alejki, długa kręta droga",
    typicalAge: "zwykle ok. 6 lat",
    columns: 13,
    rows: 16,
    entrance: { row: 0, col: 6 },
    exit: { row: 15, col: 6 },
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "lat7",
    label: "Poziom 5",
    barLabel: "5",
    description: "wąskie alejki, bardzo długa droga",
    typicalAge: "zwykle 7–8 lat",
    columns: 17,
    rows: 21,
    entrance: { row: 0, col: 8 },
    exit: { row: 20, col: 8 },
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "nastolatek",
    label: "Poziom 6",
    barLabel: "6",
    description: "najwęższe alejki, start i meta w rogach",
    typicalAge: "zwykle nastolatki",
    columns: 27,
    rows: 33,
    entrance: { row: 0, col: 0 },
    exit: { row: 32, col: 26 },
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
