import { moneyCurrencyById, pieceKind, PIECES, type MoneyCurrencyId } from "./currencies.ts";
import { MAX_NOTES, MAX_NOTES_WITHOUT_COINS, MAX_PIECES, MONEY_SHEET } from "./sheet.ts";

/** The levels of the "Kto ma więcej?" card. The card does not name its levels after an age. */
export type MoneyLevelId = "latwy" | "sredni" | "trudny";

export const MONEY_LEVEL_IDS: readonly MoneyLevelId[] = ["latwy", "sredni", "trudny"];

export interface MoneyLevel {
  id: MoneyLevelId;
  currency: MoneyCurrencyId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes. */
  description: string;
  /** The values (whole units of the currency) a pile may hold; what is a coin and what a note is in `currencies.ts`. */
  nominals: readonly number[];
  /** Largest value of one pile. */
  maxSum: number;
  /** Most pieces in one pile (the layout draws exactly this many). */
  maxPieces: number;
  /** Most notes in one pile; more would not fit the pile frame. */
  maxNotes: number;
  rowCount: number;
  /** A row "misleads" when the pile with fewer pieces is worth more. The card has between these two many such rows. */
  misleadingMin: number;
  misleadingMax: number;
}

export const DEFAULT_MONEY_LEVEL_ID: MoneyLevelId = "sredni";

/**
 * The nominals and the largest pile of each level and currency. The easy level has coins only, except in dollars, which have
 * notes only (1 and 5 $ on the easy level). The hard level reaches 100 (notes of 50 and 100).
 */
const SPECS: Record<MoneyCurrencyId, Record<MoneyLevelId, { nominals: readonly number[]; maxSum: number }>> = {
  pln: {
    latwy: { nominals: [1, 2, 5], maxSum: 10 },
    sredni: { nominals: [1, 2, 5], maxSum: 20 },
    trudny: { nominals: [1, 2, 5, 10, 20, 50, 100], maxSum: 200 },
  },
  eur: {
    latwy: { nominals: [1, 2], maxSum: 10 },
    sredni: { nominals: [1, 2, 5], maxSum: 20 },
    trudny: { nominals: [1, 2, 5, 10, 20, 50, 100], maxSum: 200 },
  },
  usd: {
    latwy: { nominals: [1, 5], maxSum: 10 },
    sredni: { nominals: [1, 5, 10], maxSum: 20 },
    trudny: { nominals: [1, 5, 10, 20, 50, 100], maxSum: 200 },
  },
};

const LABELS: Record<MoneyLevelId, string> = { latwy: "łatwy", sredni: "średni", trudny: "trudny" };

const MISLEADING: Record<MoneyLevelId, { min: number; max: number }> = {
  latwy: { min: 0, max: 0 },
  sredni: { min: 2, max: 2 },
  trudny: { min: 3, max: 5 },
};

/** "1", "1 i 2", "1, 2 i 5". */
function joinValues(values: readonly number[]): string {
  if (values.length < 2) {
    return values.join("");
  }
  return `${values.slice(0, -1).join(", ")} i ${values[values.length - 1]}`;
}

function describe(id: MoneyLevelId, currency: MoneyCurrencyId, nominals: readonly number[]): string {
  const symbol = moneyCurrencyById(currency).symbol;
  if (id === "trudny") {
    return `monety i banknoty do ${nominals[nominals.length - 1]} ${symbol}, liczba sztuk często myli`;
  }
  const parts = (["coin", "note"] as const).flatMap((kind) => {
    const values = nominals.filter((value) => pieceKind(value, currency) === kind);
    if (values.length === 0) {
      return [];
    }
    const word =
      kind === "coin" ? (values.length === 1 ? "moneta" : "monety") : values.length === 1 ? "banknot" : "banknoty";
    return `${word} ${joinValues(values)} ${symbol}`;
  });
  const tail = id === "latwy" ? "małe kupki, liczba sztuk nie myli" : "liczba sztuk czasem myli";
  return `${parts.join(", ")}, ${tail}`;
}

function buildLevel(id: MoneyLevelId, currency: MoneyCurrencyId): MoneyLevel {
  const { nominals, maxSum } = SPECS[currency][id];
  return {
    id,
    currency,
    label: LABELS[id],
    barLabel: LABELS[id],
    description: describe(id, currency, nominals),
    nominals,
    maxSum,
    maxPieces: MAX_PIECES[id],
    maxNotes: PIECES[currency].some((piece) => piece.kind === "coin") ? MAX_NOTES : MAX_NOTES_WITHOUT_COINS,
    rowCount: MONEY_SHEET.rowCount,
    misleadingMin: MISLEADING[id].min,
    misleadingMax: MISLEADING[id].max,
  };
}

/** The three levels of one currency, from the easiest. */
export function moneyLevels(currency: MoneyCurrencyId): readonly MoneyLevel[] {
  return MONEY_LEVEL_IDS.map((id) => buildLevel(id, currency));
}

export function moneyLevelById(id: MoneyLevelId, currency: MoneyCurrencyId): MoneyLevel {
  if (!MONEY_LEVEL_IDS.includes(id)) {
    throw new Error(`Unknown money level ${id}`);
  }
  return buildLevel(id, currency);
}
