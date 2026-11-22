/** The levels of the shadows card ("Cienie"): the pictures get more alike, not smaller (PRD US-42). Named by numbers; ids keep the old names so saved profiles load. */
export type ShadowsLevelId = "latwy" | "sredni" | "trudny";

/** Which families a level draws from: different families of any kind, one "rozne" family or one "warianty" family. */
export type ShadowsFamilyRule = "dowolne" | "rozne" | "warianty";

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
}

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
  },
  {
    id: "sredni",
    label: "Poziom 2",
    barLabel: "2",
    description: "5 par, podobne kształty",
    pairCount: 5,
    familyRule: "rozne",
    pictureSize: 43,
  },
  {
    id: "trudny",
    label: "Poziom 3",
    barLabel: "3",
    description: "6 par, prawie takie same",
    pairCount: 6,
    familyRule: "warianty",
    pictureSize: 35,
  },
];

export function shadowsLevelById(id: ShadowsLevelId): ShadowsLevel {
  const level = SHADOWS_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown shadows level ${id}`);
  }
  return level;
}
