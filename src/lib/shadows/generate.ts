import { shadowsCardKey, shadowsCardProblems, type ShadowsCard } from "./card.ts";
import { SHADOW_FAMILIES, SHADOW_POSE_FAMILIES } from "./families.ts";
import type { ShadowsLevel } from "./levels.ts";

/** Draws again at most this many times before giving up. */
export const MAX_ATTEMPTS = 50;

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

/** Picture ids for the level: one from each of several families, or several from one family of the level's kind (poses for level 4). */
function drawPictures(level: ShadowsLevel, random: () => number): string[] {
  if (level.familyRule === "dowolne") {
    return shuffle(SHADOW_FAMILIES, random)
      .slice(0, level.pairCount)
      .map((family) => pick(family.pictures, random).id);
  }
  const family = pick(
    level.familyRule === "pozy"
      ? SHADOW_POSE_FAMILIES
      : SHADOW_FAMILIES.filter((candidate) => candidate.kind === level.familyRule),
    random,
  );
  return shuffle(family.pictures, random)
    .slice(0, level.pairCount)
    .map((picture) => picture.id);
}

/** An order of the shadows in which no shadow stands in the row of its picture (count ≥ 2). */
function derangement(count: number, random: () => number): number[] {
  for (;;) {
    const order = shuffle([...Array(count).keys()], random);
    if (order.every((picture, row) => picture !== row)) return order;
  }
}

/** A valid card of the level whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. */
export function generateShadowsCard(
  random: () => number,
  level: ShadowsLevel,
  previousKey: string | null = null,
): ShadowsCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const pictures = drawPictures(level, random);
    const card: ShadowsCard = { levelId: level.id, pictures, shadowOrder: derangement(pictures.length, random) };
    if (shadowsCardKey(card) !== previousKey && shadowsCardProblems(card, level).length === 0) {
      return card;
    }
  }
  return null;
}
