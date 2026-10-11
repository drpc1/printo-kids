export const DEFAULT_LEVEL_ID = "lat5";

export type LevelId = "lat3" | "lat4" | "lat5" | "lat6" | "lat7" | "nastolatek";

export interface MazePoint {
  row: number;
  col: number;
}

export interface Level {
  id: LevelId;
  label: string;
  columns: number;
  rows: number;
  entrance: MazePoint;
  exit: MazePoint;
  pathMin: number | null;
  pathMax: number | null;
  spurMin: number | null;
  spurMax: number | null;
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
    pathMin: 24,
    pathMax: 44,
    spurMin: null,
    spurMax: 4,
    showCharacter: true,
  },
  {
    id: "lat4",
    label: "4 lata",
    columns: 9,
    rows: 11,
    entrance: { row: 0, col: 4 },
    exit: { row: 10, col: 4 },
    pathMin: 50,
    pathMax: 80,
    spurMin: null,
    spurMax: null,
    showCharacter: true,
  },
  {
    id: "lat5",
    label: "5 lat",
    columns: 13,
    rows: 16,
    entrance: { row: 0, col: 6 },
    exit: { row: 15, col: 6 },
    pathMin: 56,
    pathMax: 96,
    spurMin: null,
    spurMax: 4,
    showCharacter: true,
  },
  {
    id: "lat6",
    label: "6 lat",
    columns: 13,
    rows: 16,
    entrance: { row: 0, col: 6 },
    exit: { row: 15, col: 6 },
    pathMin: 110,
    pathMax: 170,
    spurMin: null,
    spurMax: null,
    showCharacter: true,
  },
  {
    id: "lat7",
    label: "7–8 lat",
    columns: 17,
    rows: 21,
    entrance: { row: 0, col: 8 },
    exit: { row: 20, col: 8 },
    pathMin: 150,
    pathMax: 240,
    spurMin: null,
    spurMax: null,
    showCharacter: true,
  },
  {
    id: "nastolatek",
    label: "nastolatek",
    columns: 27,
    rows: 33,
    entrance: { row: 0, col: 0 },
    exit: { row: 32, col: 26 },
    pathMin: 280,
    pathMax: 500,
    spurMin: 25,
    spurMax: null,
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
