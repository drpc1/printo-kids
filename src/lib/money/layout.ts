import { MONEY_SHEET } from "./sheet.ts";

/** A coin below 10 zł, a note from 10 zł. */
export type PieceKind = "coin" | "note";

export function pieceKind(value: number): PieceKind {
  return value >= 10 ? "note" : "coin";
}

export interface PilePiece {
  kind: PieceKind;
  value: number;
  /** Top left corner, relative to the top left corner of the pile. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PileLayout {
  pieces: PilePiece[];
  height: number;
}

/**
 * Places the pieces of one pile inside `width`: notes first, largest value first, then coins, each kind in its own
 * rows, every row centered. Throws when one piece is wider than `width`.
 */
export function layoutPile(values: readonly number[], width: number): PileLayout {
  const gap = MONEY_SHEET.pieceGap;
  const sizes = {
    note: { width: MONEY_SHEET.noteWidth, height: MONEY_SHEET.noteHeight },
    coin: { width: MONEY_SHEET.coinDiameter, height: MONEY_SHEET.coinDiameter },
  };
  const sorted = [...values].sort((left, right) => right - left);
  const pieces: PilePiece[] = [];
  let y = 0;

  for (const kind of ["note", "coin"] as const) {
    const size = sizes[kind];
    const ofKind = sorted.filter((value) => pieceKind(value) === kind);
    const perRow = Math.floor((width + gap) / (size.width + gap));
    if (ofKind.length > 0 && perRow < 1) {
      throw new Error(`A ${kind} of ${size.width} mm does not fit a pile ${width} mm wide`);
    }
    for (let start = 0; start < ofKind.length; start += perRow) {
      const row = ofKind.slice(start, start + perRow);
      const rowWidth = row.length * size.width + (row.length - 1) * gap;
      const left = (width - rowWidth) / 2;
      row.forEach((value, index) => {
        pieces.push({
          kind,
          value,
          x: left + index * (size.width + gap),
          y,
          width: size.width,
          height: size.height,
        });
      });
      y += size.height + gap;
    }
  }

  return { pieces, height: pieces.length === 0 ? 0 : y - gap };
}

export interface MoneySheetInput {
  pageWidth: number;
  pageHeight: number;
  inset: number;
  rowCount: number;
  bandHeight: number;
  bandGap: number;
  rowGap: number;
  signSize: number;
  signGap: number;
  pilePadding: number;
}

export interface MoneyPileArea {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Width and height left for the pieces after the padding. */
  innerWidth: number;
  innerHeight: number;
}

export interface MoneyRowLayout {
  y: number;
  height: number;
  left: MoneyPileArea;
  sign: { x: number; y: number; size: number };
  right: MoneyPileArea;
}

export interface MoneySheetLayout {
  page: { width: number; height: number };
  /** Top of the band for the character and the instruction. */
  band: { y: number; height: number };
  rows: MoneyRowLayout[];
}

/**
 * Places the rows under the band: two pile areas with an empty square between them, the rows spread evenly down the
 * page. Throws when the rows would not fit inside the inset.
 */
export function layoutMoneySheet(input: MoneySheetInput): MoneySheetLayout {
  const { pageWidth, pageHeight, inset, rowCount, bandHeight, bandGap, rowGap, signSize, signGap, pilePadding } = input;
  const innerWidth = pageWidth - inset * 2;
  const innerHeight = pageHeight - inset * 2;
  const rowsTop = inset + bandHeight + bandGap;
  const rowHeight = (innerHeight - bandHeight - bandGap - (rowCount - 1) * rowGap) / rowCount;
  const pileWidth = (innerWidth - signSize - signGap * 2) / 2;

  if (rowCount < 1 || rowHeight <= 2 * pilePadding || pileWidth <= 2 * pilePadding || signSize > rowHeight) {
    throw new Error(`${rowCount} rows do not fit inside the ${inset} page margin`);
  }

  const area = (x: number, y: number): MoneyPileArea => ({
    x,
    y,
    width: pileWidth,
    height: rowHeight,
    innerWidth: pileWidth - 2 * pilePadding,
    innerHeight: rowHeight - 2 * pilePadding,
  });

  return {
    page: { width: pageWidth, height: pageHeight },
    band: { y: inset, height: bandHeight },
    rows: Array.from({ length: rowCount }, (_, index) => {
      const y = rowsTop + index * (rowHeight + rowGap);
      const signX = inset + pileWidth + signGap;
      return {
        y,
        height: rowHeight,
        left: area(inset, y),
        sign: { x: signX, y: y + (rowHeight - signSize) / 2, size: signSize },
        right: area(signX + signSize + signGap, y),
      };
    }),
  };
}
