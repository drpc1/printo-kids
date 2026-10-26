export const DEFAULT_SYMMETRY_LEVEL_ID = "lat5";

export type SymmetryLevelId = "lat4" | "lat5" | "lat6" | "lat7";

export interface SymmetryLevel {
  id: SymmetryLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  description: string;
  typicalAge: string;
  /** Whole grid; the axis splits it into two halves of `columns / 2` columns. */
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  /** How many cells of the answer are already filled in on the child's half. */
  hintCount: number;
}

export const SYMMETRY_LEVELS: readonly SymmetryLevel[] = [
  {
    id: "lat4",
    label: "Poziom 1",
    barLabel: "1",
    description: "duża kratka, podpowiedź przy osi",
    typicalAge: "zwykle ok. 4 lata",
    columns: 8,
    rows: 12,
    cellSize: 20,
    hintCount: 3,
  },
  {
    id: "lat5",
    label: "Poziom 2",
    barLabel: "2",
    description: "średnia kratka, bez podpowiedzi",
    typicalAge: "zwykle ok. 5 lat",
    columns: 12,
    rows: 16,
    cellSize: 15,
    hintCount: 0,
  },
  {
    id: "lat6",
    label: "Poziom 3",
    barLabel: "3",
    description: "mniejsza kratka, bez podpowiedzi",
    typicalAge: "zwykle ok. 6 lat",
    columns: 14,
    rows: 20,
    cellSize: 12,
    hintCount: 0,
  },
  {
    id: "lat7",
    label: "Poziom 4",
    barLabel: "4",
    description: "mała kratka, bogatsze obiekty",
    typicalAge: "zwykle ok. 7 lat",
    columns: 18,
    rows: 24,
    cellSize: 10,
    hintCount: 0,
  },
];

export function symmetryLevelById(id: SymmetryLevelId): SymmetryLevel {
  const level = SYMMETRY_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown symmetry level ${id}`);
  }
  return level;
}
