import { PIECES, type MoneyCurrencyId } from "./currencies.ts";

/** The file suffix of a currency's pictures: `5zl.png`, `5eur.png`, `5usd.png`. */
const SUFFIX: Record<MoneyCurrencyId, string> = { pln: "zl", eur: "eur", usd: "usd" };

/**
 * The coloured look of a coin or note on the "Kto ma więcej?" card: a stylised picture in `public/money/` (drawn by
 * the card's author, with the value printed on it), one per value and currency. Colour is a pure function of the value
 * and the currency; with colors off the card keeps its plain black drawing and there is no picture.
 */
export function moneyImage(value: number, currency: MoneyCurrencyId, colors: boolean): string | null {
  return colors ? `/money/${value}${SUFFIX[currency]}.png` : null;
}

/** The pictures every level of one currency can use, in one list so the page can load them before they are drawn. */
export function moneyImagePaths(currency: MoneyCurrencyId): readonly string[] {
  return PIECES[currency].flatMap((piece) => moneyImage(piece.value, currency, true) ?? []);
}
