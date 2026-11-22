import type { ShadowsCard } from "./card.ts";
import { shadowsLevelById } from "./levels.ts";
import { SHADOWS_SHEET } from "./sheet.ts";

/** Slack for floating point error at the edge of the margin. */
const EPSILON = 1e-6;

export interface PictureField {
  x: number;
  y: number;
  /** Side of the square field; the 100×100 drawing is scaled into it. */
  size: number;
}

export interface ShadowsRowLayout {
  /** Vertical centre of the row: pictures and dots stand on it. */
  cy: number;
  /** The picture of the left column and the shadow of the right column in this row. */
  picture: PictureField;
  shadow: PictureField;
  dotLeft: { cx: number; cy: number };
  dotRight: { cx: number; cy: number };
}

export interface ShadowsSheetLayout {
  page: { width: number; height: number };
  /** The instruction: the speech band with a character, the plain line without one. */
  band: { y: number; height: number };
  dotRadius: number;
  rows: ShadowsRowLayout[];
}

/**
 * Places the instruction and the pairs: rows spread evenly from under the instruction to the bottom margin, the
 * picture field in the left column, the shadow field in the right one, a dot on the inner side of each. Throws when
 * something would cross the 10 mm margin.
 */
export function layoutShadowsSheet(card: ShadowsCard, instructionBoxHeight: number): ShadowsSheetLayout {
  const sheet = SHADOWS_SHEET;
  const level = shadowsLevelById(card.levelId);
  const areaTop = sheet.inset + instructionBoxHeight + sheet.bandGap;
  const rowHeight = (sheet.pageHeight - sheet.inset - areaTop) / card.pictures.length;
  const size = Math.min(level.pictureSize, rowHeight - sheet.rowGap);
  const leftX = sheet.inset + sheet.columnInset;
  const rightX = sheet.pageWidth - sheet.inset - sheet.columnInset - size;
  if (size <= 0 || leftX + size + 2 * sheet.dotGap > rightX - EPSILON) {
    throw new Error("shadows: the two columns do not fit the page");
  }
  const rows = card.pictures.map((_, index): ShadowsRowLayout => {
    const cy = areaTop + (index + 0.5) * rowHeight;
    const y = cy - size / 2;
    return {
      cy,
      picture: { x: leftX, y, size },
      shadow: { x: rightX, y, size },
      dotLeft: { cx: leftX + size + sheet.dotGap, cy },
      dotRight: { cx: rightX - sheet.dotGap, cy },
    };
  });
  const last = rows.at(-1);
  if (last !== undefined && last.picture.y + size > sheet.pageHeight - sheet.inset + EPSILON) {
    throw new Error("shadows: rows cross the bottom margin");
  }
  return {
    page: { width: sheet.pageWidth, height: sheet.pageHeight },
    band: { y: sheet.inset, height: instructionBoxHeight },
    dotRadius: sheet.dotRadius,
    rows,
  };
}
