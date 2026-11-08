/**
 * The coloured look of a coin or note on the "Kto ma więcej?" card: a stylised picture in `public/money/` (drawn by
 * the card's author, with the value printed on it), one per value. Colour is a pure function of the value; with colors
 * off the card keeps its plain black drawing and there is no picture.
 */
export function moneyImage(value: number, colors: boolean): string | null {
  return colors ? `/money/${value}zl.png` : null;
}

/** The pictures every level can use, in one list so the page can load them before they are drawn. */
export function moneyImagePaths(): readonly string[] {
  return [1, 2, 5, 10, 20].flatMap((value) => moneyImage(value, true) ?? []);
}
