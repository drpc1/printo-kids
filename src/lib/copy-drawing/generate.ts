import { dictationShapesFor } from "../dictation/shapes.ts";
import {
  DEFAULT_OBJECT_CATEGORY_ID,
  symmetryTemplatesFor,
  type ObjectCategoryChoiceId,
} from "../symmetry/templates.ts";
import {
  copyDrawingKey,
  copyDrawingProblems,
  expectedPattern,
  type CopyDrawingCard,
  type CopyDrawingPicture,
} from "./card.ts";
import type { CopyDrawingLevel } from "./levels.ts";

/** Draws again at most this many times before giving up, so a single possible card cannot loop forever. */
export const MAX_ATTEMPTS = 20;

/**
 * A valid card of the level whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws (or without objects).
 * Every object of the level and category has the same chance, whether it is a symmetry template or a dictation shape
 * (S-55); only then comes its variant, or the flip of the shape.
 */
export function generateCopyDrawingCard(
  random: () => number,
  previousKey: string | null,
  level: CopyDrawingLevel,
  category: ObjectCategoryChoiceId = DEFAULT_OBJECT_CATEGORY_ID,
): CopyDrawingCard | null {
  const templates = symmetryTemplatesFor(level.size.templateLevel, category);
  const shapes = dictationShapesFor(level.dictationLevel, category).filter((shape) => shape.onCopyDrawing);
  const count = templates.length + shapes.length;
  if (count === 0) {
    return null;
  }
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const index = pick(random, count);
    const picture: CopyDrawingPicture =
      index < templates.length
        ? {
            kind: "template",
            templateId: templates[index].id,
            variants: templates[index].parts.map((part) => pick(random, part.variants.length)),
          }
        : { kind: "shape", shapeId: shapes[index - templates.length].id, mirrored: pick(random, 2) === 1 };
    const card = composeCopyDrawingCard(picture, level);
    if (card.key !== previousKey && copyDrawingProblems(card, level).length === 0) {
      return card;
    }
  }
  return null;
}

/**
 * Builds the card for one picture. Does not validate: a picture that does not exist gives an empty pattern, which
 * `copyDrawingProblems` refuses.
 */
export function composeCopyDrawingCard(picture: CopyDrawingPicture, level: CopyDrawingLevel): CopyDrawingCard {
  const { columns, rows } = level.size;
  const pattern =
    expectedPattern(level, picture) ?? Array.from({ length: rows }, () => new Array<boolean>(columns).fill(false));
  return {
    levelId: level.id,
    picture: picture.kind === "template" ? { ...picture, variants: [...picture.variants] } : { ...picture },
    pattern,
    key: copyDrawingKey(level.id, picture),
  };
}

function pick(random: () => number, count: number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}
