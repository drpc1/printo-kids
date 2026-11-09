/** The currencies of the "Kto ma więcej?" card. Coins and notes of a currency are listed in `PIECES`. */
export type MoneyCurrencyId = "pln" | "eur" | "usd";

export interface MoneyCurrency {
  id: MoneyCurrencyId;
  /** Name in the currency list. */
  label: string;
  /** Text after "Waluta:" on the bar. */
  barLabel: string;
  /** Half a sentence in the currency list. */
  description: string;
  /** The sign written after a value ("5 zł"). */
  symbol: string;
}

export const DEFAULT_MONEY_CURRENCY_ID: MoneyCurrencyId = "pln";

export const MONEY_CURRENCIES: readonly MoneyCurrency[] = [
  { id: "pln", label: "złote", barLabel: "zł", description: "monety i banknoty w złotych", symbol: "zł" },
  { id: "eur", label: "euro", barLabel: "€", description: "monety i banknoty w euro", symbol: "€" },
  { id: "usd", label: "dolary", barLabel: "$", description: "moneta i banknoty w dolarach", symbol: "$" },
];

export const MONEY_CURRENCY_IDS: readonly MoneyCurrencyId[] = MONEY_CURRENCIES.map((currency) => currency.id);

export function moneyCurrencyById(id: MoneyCurrencyId): MoneyCurrency {
  const currency = MONEY_CURRENCIES.find((candidate) => candidate.id === id);
  if (currency === undefined) {
    throw new Error(`Unknown money currency ${id}`);
  }
  return currency;
}

/** A coin below 10 zł, a note from 10 zł; the other currencies have their own split. */
export type PieceKind = "coin" | "note";

/**
 * The values of each currency in whole units, with what each one is. The card never uses cents, so the euro coins
 * below 1 € and all dollar coins are not here: the dollar has notes only, because the 1 $ coin is rare (decision
 * 2026-11-09). A pile is a list of values, so one value must have one shape within a currency.
 */
export const PIECES: Record<MoneyCurrencyId, readonly { value: number; kind: PieceKind }[]> = {
  pln: [
    { value: 1, kind: "coin" },
    { value: 2, kind: "coin" },
    { value: 5, kind: "coin" },
    { value: 10, kind: "note" },
    { value: 20, kind: "note" },
    { value: 50, kind: "note" },
    { value: 100, kind: "note" },
  ],
  eur: [
    { value: 1, kind: "coin" },
    { value: 2, kind: "coin" },
    { value: 5, kind: "note" },
    { value: 10, kind: "note" },
    { value: 20, kind: "note" },
    { value: 50, kind: "note" },
    { value: 100, kind: "note" },
  ],
  usd: [
    { value: 1, kind: "note" },
    { value: 5, kind: "note" },
    { value: 10, kind: "note" },
    { value: 20, kind: "note" },
    { value: 50, kind: "note" },
    { value: 100, kind: "note" },
  ],
};

/** Whether `value` is a coin or a note in `currency`. Throws for a value the currency does not have. */
export function pieceKind(value: number, currency: MoneyCurrencyId): PieceKind {
  const piece = PIECES[currency].find((candidate) => candidate.value === value);
  if (piece === undefined) {
    throw new Error(`${value} is not a value of ${currency}`);
  }
  return piece.kind;
}
