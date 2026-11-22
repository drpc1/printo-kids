import { MIN_SHADOW_DIFFERENCE } from "./raster.ts";

/** The levels of the shadows card ("Cienie"): the pictures get more alike, not smaller (PRD US-42). Named by numbers; ids keep the old names so saved profiles load. */
export type ShadowsLevelId = "latwy" | "sredni" | "trudny" | "pozy";

/** Which families a level draws from: different families of any kind, one "rozne" family, one "warianty" family or one family of poses. */
export type ShadowsFamilyRule = "dowolne" | "rozne" | "warianty" | "pozy";

export interface ShadowsLevel {
  id: ShadowsLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes. */
  description: string;
  pairCount: number;
  familyRule: ShadowsFamilyRule;
  /** Largest side of a picture field, mm; a row too low for it shrinks the field. */
  pictureSize: number;
  /** Smallest share of cells in which two shadows of a card may differ (see raster.ts). */
  minShadowDifference: number;
}

/**
 * Poses differ in a smaller part of the outline than variants do (the closest pair of the mockup, a bird's beak open
 * or shut, is about 0.03), so level 4 has a lower floor; the print decides whether it is enough (PRD Open Questions 22).
 */
const POSES_MIN_SHADOW_DIFFERENCE = 0.025;

export const DEFAULT_SHADOWS_LEVEL_ID: ShadowsLevelId = "latwy";

export const SHADOWS_LEVELS: readonly ShadowsLevel[] = [
  {
    id: "latwy",
    label: "Poziom 1",
    barLabel: "1",
    description: "4 pary, różne rzeczy",
    pairCount: 4,
    familyRule: "dowolne",
    pictureSize: 52,
    minShadowDifference: MIN_SHADOW_DIFFERENCE,
  },
  {
    id: "sredni",
    label: "Poziom 2",
    barLabel: "2",
    description: "5 par, podobne kształty",
    pairCount: 5,
    familyRule: "rozne",
    pictureSize: 43,
    minShadowDifference: MIN_SHADOW_DIFFERENCE,
  },
  {
    id: "trudny",
    label: "Poziom 3",
    barLabel: "3",
    description: "6 par, prawie takie same",
    pairCount: 6,
    familyRule: "warianty",
    pictureSize: 35,
    minShadowDifference: MIN_SHADOW_DIFFERENCE,
  },
  {
    id: "pozy",
    label: "Poziom 4",
    barLabel: "4",
    description: "6 par, jedna rzecz w różnych pozach",
    pairCount: 6,
    familyRule: "pozy",
    pictureSize: 35,
    minShadowDifference: POSES_MIN_SHADOW_DIFFERENCE,
  },
];

export function shadowsLevelById(id: ShadowsLevelId): ShadowsLevel {
  const level = SHADOWS_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown shadows level ${id}`);
  }
  return level;
}
