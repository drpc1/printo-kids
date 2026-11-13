import { nonogramImage } from "../nonogram/clues.ts";
import {
  DEFAULT_OBJECT_CATEGORY_ID,
  symmetryTemplatesFor,
  type ObjectCategoryChoiceId,
  type SymmetryTemplate,
} from "../symmetry/templates.ts";
import { centerSilhouette, copyDrawingKey, copyDrawingProblems, type CopyDrawingCard } from "./card.ts";
import type { CopyDrawingLevel } from "./levels.ts";

/** Draws again at most this many times before giving up, so a single possible card cannot loop forever. */
export const MAX_ATTEMPTS = 20;

/** A valid card of the level whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws (or without objects). */
export function generateCopyDrawingCard(
  random: () => number,
  previousKey: string | null,
  level: CopyDrawingLevel,
  category: ObjectCategoryChoiceId = DEFAULT_OBJECT_CATEGORY_ID,
): CopyDrawingCard | null {
  const templates = symmetryTemplatesFor(level.size.templateLevel, category);
  if (templates.length === 0) {
    return null;
  }
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const template = templates[pick(random, templates.length)];
    const variants = template.parts.map((part) => pick(random, part.variants.length));
    const card = composeCopyDrawingCard(template, variants, level);
    if (card.key !== previousKey && copyDrawingProblems(card, level).length === 0) {
      return card;
    }
  }
  return null;
}

/** Builds the card for one template and one variant index per part. Does not validate. */
export function composeCopyDrawingCard(
  template: SymmetryTemplate,
  variants: readonly number[],
  level: CopyDrawingLevel,
): CopyDrawingCard {
  return {
    levelId: level.id,
    templateId: template.id,
    variants: [...variants],
    pattern: centerSilhouette(nonogramImage(template, variants, level.size)),
    key: copyDrawingKey(level.id, template.id, variants),
  };
}

function pick(random: () => number, count: number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}
