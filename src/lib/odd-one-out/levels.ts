/** The rule of a row: the one feature in which a single picture differs from the rest. */
export type OddRule = "shape" | "size" | "count" | "color" | "category";

/** The levels of the "Który nie pasuje" card. The card does not name its levels after an age. */
export type OddOneOutLevelId = "latwy" | "sredni" | "trudny";

export interface OddOneOutLevel {
  id: OddOneOutLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes. */
  description: string;
  /** Pictures in a row. */
  itemCount: number;
  rowCount: number;
  /** Rules a row may have; `color` only counts when colors are on (see `rulesFor`). */
  rules: readonly OddRule[];
  /**
   * Most other features that vary in pairs in a row (each of their values shows at least twice, so they point at
   * nothing). An upper bound: a row gets fewer when fewer features are free.
   */
  distractors: number;
  /** Height of a small picture relative to a big one. Closer to 1 is harder to see. */
  smallRatio: number;
  /** Group sizes of the count rule: most pictures have one of these, the odd one has one more or one less. */
  counts: readonly number[];
}

export const DEFAULT_ODD_ONE_OUT_LEVEL_ID: OddOneOutLevelId = "sredni";

export const ODD_ONE_OUT_LEVELS: readonly OddOneOutLevel[] = [
  {
    id: "latwy",
    label: "łatwy",
    barLabel: "łatwy",
    description: "4 obrazki, kształt albo rozmiar, reszta jednakowa",
    itemCount: 4,
    rowCount: 5,
    rules: ["shape", "size"],
    distractors: 0,
    smallRatio: 0.5,
    counts: [],
  },
  {
    id: "sredni",
    label: "średni",
    barLabel: "średni",
    description: "5 obrazków, także liczba i kolor, jedna cecha myli",
    itemCount: 5,
    rowCount: 5,
    rules: ["shape", "size", "count", "color"],
    distractors: 1,
    smallRatio: 0.55,
    counts: [2, 3],
  },
  {
    id: "trudny",
    label: "trudny",
    barLabel: "trudny",
    description: "6 obrazków, także rodzaj obiektu, dwie cechy mylą",
    itemCount: 6,
    rowCount: 6,
    rules: ["shape", "size", "count", "color", "category"],
    distractors: 2,
    smallRatio: 0.72,
    counts: [4, 5],
  },
];

export function oddOneOutLevelById(id: OddOneOutLevelId): OddOneOutLevel {
  const level = ODD_ONE_OUT_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown odd-one-out level ${id}`);
  }
  return level;
}

/** The rules a card of this level may use: the color rule needs colors on. */
export function rulesFor(level: OddOneOutLevel, colors: boolean): readonly OddRule[] {
  return level.rules.filter((rule) => rule !== "color" || colors);
}
