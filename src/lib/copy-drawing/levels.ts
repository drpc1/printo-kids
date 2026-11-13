import { NONOGRAM_SIZES, type NonogramSize, type NonogramSizeId } from "../nonogram/sizes.ts";

/** The levels of the "Skopiuj rysunek na kratce" card. They share their ids with the nonogram sizes and name no age. */
export type CopyDrawingLevelId = NonogramSizeId;

export interface CopyDrawingLevel {
  id: CopyDrawingLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes. */
  description: string;
  /** The nonogram size of the same id: it gives the grid and the symmetry level whose templates draw the picture. */
  size: NonogramSize;
  /** Nominal side of one grid cell in mm; the layout may shrink it when the two grids would not fit. */
  cellSize: number;
}

export const DEFAULT_COPY_DRAWING_LEVEL_ID: CopyDrawingLevelId = "sredni";

function sizeById(id: CopyDrawingLevelId): NonogramSize {
  const size = NONOGRAM_SIZES.find((candidate) => candidate.id === id);
  if (size === undefined) {
    throw new Error(`Unknown nonogram size ${id}`);
  }
  return size;
}

export const COPY_DRAWING_LEVELS: readonly CopyDrawingLevel[] = [
  {
    id: "latwy",
    label: "łatwy",
    barLabel: "łatwy",
    description: "duża kratka, prosty obrazek",
    size: sizeById("latwy"),
    cellSize: 11,
  },
  {
    id: "sredni",
    label: "średni",
    barLabel: "średni",
    description: "mniejsza kratka, więcej szczegółów",
    size: sizeById("sredni"),
    cellSize: 7.5,
  },
  {
    id: "trudny",
    label: "trudny",
    barLabel: "trudny",
    description: "drobna kratka, bogaty obrazek",
    size: sizeById("trudny"),
    cellSize: 5,
  },
];

export function copyDrawingLevelById(id: CopyDrawingLevelId): CopyDrawingLevel {
  const level = COPY_DRAWING_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown copy-drawing level ${id}`);
  }
  return level;
}
