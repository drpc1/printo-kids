import { familyOfPicture, shadowPictureById } from "./families.ts";
import type { ShadowsLevel, ShadowsLevelId } from "./levels.ts";
import { MIN_SHADOW_DIFFERENCE, shadowDifference, shadowMask } from "./raster.ts";

export interface ShadowsCard {
  levelId: ShadowsLevelId;
  /** Picture ids of the left column, top to bottom. */
  pictures: string[];
  /** For every row of the right column, the index (into `pictures`) of the picture whose shadow stands there. */
  shadowOrder: number[];
}

export type ShadowsProblem =
  | "settings-mismatch"
  | "wrong-pair-count"
  | "unknown-picture"
  | "duplicate-picture"
  | "families-not-level"
  | "shadow-order-invalid"
  | "shadow-in-own-row"
  | "shadows-too-similar";

/** Names the level, the pictures and the order of the shadows, so two cards with one key look the same. */
export function shadowsCardKey(card: ShadowsCard): string {
  return `${card.levelId}:${card.pictures.join(",")}:${card.shadowOrder.join(",")}`;
}

/** For every picture (left row), the row of the right column where its shadow stands. */
export function answerOf(card: ShadowsCard): number[] {
  return card.pictures.map((_, index) => card.shadowOrder.indexOf(index));
}

const maskCache = new Map<string, boolean[]>();

function maskOf(id: string): boolean[] | undefined {
  const cached = maskCache.get(id);
  if (cached !== undefined) return cached;
  const picture = shadowPictureById(id);
  if (picture === undefined) return undefined;
  const mask = shadowMask(picture);
  maskCache.set(id, mask);
  return mask;
}

function familiesFit(card: ShadowsCard, level: ShadowsLevel): boolean {
  const families = card.pictures.map((id) => familyOfPicture(id));
  if (families.some((family) => family === undefined)) return false;
  const ids = new Set(families.map((family) => family?.id));
  if (level.familyRule === "dowolne") return ids.size === card.pictures.length;
  return ids.size === 1 && families[0]?.kind === level.familyRule;
}

/**
 * The rules of a shadows card at the level on the bar (PRD Business Logic "Karta „Cienie”"). An empty list means
 * the card may be shown: the pair count of the level, known and distinct pictures from families that fit the level,
 * the shadows a permutation with no shadow in its own row, and every two shadows clearly different.
 */
export function shadowsCardProblems(card: ShadowsCard, level: ShadowsLevel): readonly ShadowsProblem[] {
  const problems: ShadowsProblem[] = [];
  if (card.levelId !== level.id) problems.push("settings-mismatch");
  if (card.pictures.length !== level.pairCount || card.shadowOrder.length !== card.pictures.length) {
    problems.push("wrong-pair-count");
  }
  const known = card.pictures.every((id) => shadowPictureById(id) !== undefined);
  if (!known) problems.push("unknown-picture");
  if (new Set(card.pictures).size !== card.pictures.length) problems.push("duplicate-picture");
  if (known && !familiesFit(card, level)) problems.push("families-not-level");

  const sorted = [...card.shadowOrder].sort((a, b) => a - b);
  const permutation = sorted.length === card.pictures.length && sorted.every((value, index) => value === index);
  if (!permutation) problems.push("shadow-order-invalid");
  else if (card.shadowOrder.some((picture, row) => picture === row)) problems.push("shadow-in-own-row");

  if (known) {
    const masks = card.pictures.map((id) => maskOf(id) ?? []);
    const tooClose = masks.some((a, i) =>
      masks.some(
        (b, j) => j > i && card.pictures[i] !== card.pictures[j] && shadowDifference(a, b) < MIN_SHADOW_DIFFERENCE,
      ),
    );
    if (tooClose) problems.push("shadows-too-similar");
  }
  return problems;
}
