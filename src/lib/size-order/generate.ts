import { ICONS } from "../odd-one-out/icons.ts";
import { ODD_CRAYONS } from "../odd-one-out/rules.ts";
import { pick, shuffle } from "../sequence/random.ts";
import { SPEECH_BAND } from "../sheet/speech.ts";
import { SUDOKU_SHAPES } from "../sudoku/shapes.ts";
import { isOrdered, sizeOrderCardKey, type SizeOrderCard, type SizeOrderPicture } from "./card.ts";
import { rowTallestMm, sizeOrderGeometry, smallestGapShare } from "./layout.ts";
import type { SizeOrderLevel } from "./levels.ts";
import { SIZE_ORDER_SHEET } from "./sheet.ts";

export type { SizeOrderCard, SizeRow } from "./card.ts";

export const MAX_ATTEMPTS = 50;

const ICON_PICTURES: readonly SizeOrderPicture[] = ICONS.map((icon) => ({ kind: "icon", id: icon.id }));
const SHAPE_PICTURES: readonly SizeOrderPicture[] = SUDOKU_SHAPES.map((id) => ({ kind: "shape", id }));

/** Whether a row of this picture keeps a visible step on paper: a wide icon shrinks its row (`minStepMm`). */
function fitsLevel(picture: SizeOrderPicture, level: SizeOrderLevel): boolean {
  const geometry = sizeOrderGeometry(level, SPEECH_BAND.characterSize);
  const tallest = rowTallestMm(picture, geometry);
  return tallest !== null && tallest * smallestGapShare(level) >= SIZE_ORDER_SHEET.minStepMm;
}

/** Heights of one row in an order that is neither rising nor falling. */
function mixedHeights(random: () => number, level: SizeOrderLevel): number[] {
  for (;;) {
    const candidate = shuffle(random, [...level.heights]);
    if (!isOrdered(candidate)) return candidate;
  }
}

/**
 * Draws a card: one picture per row (at least one icon and one shape, no repeats), the sizes in a mixed order and one
 * crayon per row, the next row in another crayon. The answer follows from the construction, so there is nothing to
 * search; null only when the card equals the previous one `MAX_ATTEMPTS` times.
 */
export function generateSizeOrderCard(
  random: () => number,
  level: SizeOrderLevel,
  previousKey: string | null = null,
): SizeOrderCard | null {
  const icons = ICON_PICTURES.filter((picture) => fitsLevel(picture, level));
  const shapes = SHAPE_PICTURES.filter((picture) => fitsLevel(picture, level));
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const firstIcon = icons[pick(random, icons.length)];
    const firstShape = shapes[pick(random, shapes.length)];
    const rest = shuffle(
      random,
      [...icons, ...shapes].filter((picture) => picture !== firstIcon && picture !== firstShape),
    ).slice(0, level.rowCount - 2);
    const pictures = shuffle(random, [firstIcon, firstShape, ...rest]);
    const crayons = shuffle(random, [...ODD_CRAYONS]);
    const card: SizeOrderCard = {
      levelId: level.id,
      rows: pictures.map((picture, index) => ({
        picture,
        heights: mixedHeights(random, level),
        crayon: crayons[index],
      })),
    };
    if (sizeOrderCardKey(card) !== previousKey) return card;
  }
  return null;
}
