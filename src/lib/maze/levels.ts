export const DEFAULT_LEVEL_ID = "lat5";

export type LevelId = "lat3" | "lat4" | "lat5" | "lat6" | "lat7" | "nastolatek";

export interface MazePoint {
  row: number;
  col: number;
}

export type MazeAlgorithm = "kruskal" | "backtracker";

export interface Level {
  id: LevelId;
  label: string;
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
    label: "3 lata",
    columns: 9,
    rows: 11,
    entrance: { row: 0, col: 4 },
    exit: { row: 10, col: 4 },
    algorithm: "kruskal",
    showCharacter: true,
  },
  {
    id: "lat4",
    label: "4 lata",
    columns: 9,
    rows: 11,
    entrance: { row: 0, col: 4 },
    exit: { row: 10, col: 4 },
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "lat5",
    label: "5 lat",
    columns: 13,
    rows: 16,
    entrance: { row: 0, col: 6 },
    exit: { row: 15, col: 6 },
    algorithm: "kruskal",
    showCharacter: true,
  },
  {
    id: "lat6",
    label: "6 lat",
    columns: 13,
    rows: 16,
    entrance: { row: 0, col: 6 },
    exit: { row: 15, col: 6 },
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "lat7",
    label: "7–8 lat",
    columns: 17,
    rows: 21,
    entrance: { row: 0, col: 8 },
    exit: { row: 20, col: 8 },
    algorithm: "backtracker",
    showCharacter: true,
  },
  {
    id: "nastolatek",
    label: "nastolatek",
    columns: 27,
    rows: 33,
    entrance: { row: 0, col: 0 },
    exit: { row: 32, col: 26 },
    algorithm: "backtracker",
    showCharacter: false,
  },
];

export function levelById(id: LevelId): Level {
  const level = LEVELS.find((entry) => entry.id === id);
  if (level === undefined) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}
