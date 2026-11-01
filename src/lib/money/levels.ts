import { MAX_PIECES, MONEY_SHEET } from "./sheet.ts";

/** The levels of the "Kto ma więcej?" card. The card does not name its levels after an age. */
export type MoneyLevelId = "latwy" | "sredni" | "trudny";

export interface MoneyLevel {
  id: MoneyLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes. */
  description: string;
  /** The values (zł) a pile may hold; 1, 2 and 5 are coins, 10 and 20 are notes. */
  nominals: readonly number[];
  /** Largest value of one pile in zł. */
  maxSum: number;
  /** Most pieces in one pile (the layout draws exactly this many). */
  maxPieces: number;
  rowCount: number;
  /** A row "misleads" when the pile with fewer pieces is worth more. The card has between these two many such rows. */
  misleadingMin: number;
  misleadingMax: number;
}

export const DEFAULT_MONEY_LEVEL_ID: MoneyLevelId = "sredni";

export const MONEY_LEVELS: readonly MoneyLevel[] = [
  {
    id: "latwy",
    label: "łatwy",
    barLabel: "łatwy",
    description: "monety 1, 2 i 5 zł, małe kupki, liczba sztuk nie myli",
    nominals: [1, 2, 5],
    maxSum: 10,
    maxPieces: MAX_PIECES.latwy,
    rowCount: MONEY_SHEET.rowCount,
    misleadingMin: 0,
    misleadingMax: 0,
  },
  {
    id: "sredni",
    label: "średni",
    barLabel: "średni",
    description: "monety 1, 2 i 5 zł, liczba sztuk czasem myli",
    nominals: [1, 2, 5],
    maxSum: 20,
    maxPieces: MAX_PIECES.sredni,
    rowCount: MONEY_SHEET.rowCount,
    misleadingMin: 2,
    misleadingMax: 2,
  },
  {
    id: "trudny",
    label: "trudny",
    barLabel: "trudny",
    description: "także banknoty, liczba sztuk często myli",
    nominals: [1, 2, 5, 10, 20],
    maxSum: 50,
    maxPieces: MAX_PIECES.trudny,
    rowCount: MONEY_SHEET.rowCount,
    misleadingMin: 3,
    misleadingMax: 5,
  },
];

export function moneyLevelById(id: MoneyLevelId): MoneyLevel {
  const level = MONEY_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown money level ${id}`);
  }
  return level;
}
