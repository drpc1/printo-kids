/** The levels of the "Od najmniejszego" card. The card does not name its levels after an age. */
export type SizeOrderLevelId = "latwy" | "sredni" | "trudny";

export interface SizeOrderLevel {
  id: SizeOrderLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes. */
  description: string;
  /** Pictures in a row. */
  itemCount: number;
  rowCount: number;
  /** Heights of the pictures from the smallest, as a share of the tallest. Fixed per level, never drawn. */
  heights: readonly number[];
  /** Smallest allowed ratio of two neighbouring heights; the heights below keep at least this step. */
  minStep: number;
}

export const DEFAULT_SIZE_ORDER_LEVEL_ID: SizeOrderLevelId = "latwy";

export const SIZE_ORDER_LEVELS: readonly SizeOrderLevel[] = [
  {
    id: "latwy",
    label: "łatwy",
    barLabel: "łatwy",
    description: "3 obrazki, wyraźne różnice",
    itemCount: 3,
    rowCount: 4,
    heights: [0.48, 0.74, 1],
    minStep: 1.35,
  },
  {
    id: "sredni",
    label: "średni",
    barLabel: "średni",
    description: "4 obrazki, mniejsze różnice",
    itemCount: 4,
    rowCount: 4,
    heights: [0.5, 0.63, 0.79, 1],
    minStep: 1.25,
  },
  {
    id: "trudny",
    label: "trudny",
    barLabel: "trudny",
    description: "5 obrazków, małe różnice",
    itemCount: 5,
    rowCount: 5,
    heights: [0.55, 0.65, 0.76, 0.87, 1],
    minStep: 1.14,
  },
];

export const SIZE_ORDER_LEVEL_IDS: readonly SizeOrderLevelId[] = SIZE_ORDER_LEVELS.map((level) => level.id);

export function sizeOrderLevelById(id: SizeOrderLevelId): SizeOrderLevel {
  const level = SIZE_ORDER_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown size-order level ${id}`);
  }
  return level;
}
