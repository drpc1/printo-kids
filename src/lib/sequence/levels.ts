import type { SequenceRuleId } from "./rules.ts";

export const DEFAULT_SEQUENCE_LEVEL_ID = "lat5";

export type SequenceLevelId = "lat4" | "lat5" | "lat6" | "lat7";

export interface SequenceLevel {
  id: SequenceLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  description: string;
  typicalAge: string;
  /** Fields in one row; the fields fill the width of the page. */
  fieldsPerRow: number;
  rowCount: number;
  /** Rules the card draws from. Each one appears in at least `minRows` rows; the other rows take any of them. */
  rules: readonly { rule: SequenceRuleId; minRows: number }[];
  /** Gaps in a row. */
  gaps: number;
  /** Rows of the card that have one gap more than `gaps`. */
  extraGapRows: number;
  /**
   * "end": the last field is a gap and a second gap lies in the second half of the row.
   * "free": the gaps lie anywhere after the fields that show the rule.
   */
  gapPlacement: "end" | "free";
}

export const SEQUENCE_LEVELS: readonly SequenceLevel[] = [
  {
    id: "lat4",
    label: "Poziom 1",
    barLabel: "1",
    description: "dwa kształty na zmianę, 1 puste pole",
    typicalAge: "zwykle ok. 4 lata",
    fieldsPerRow: 5,
    rowCount: 5,
    rules: [{ rule: "AB", minRows: 5 }],
    gaps: 1,
    extraGapRows: 0,
    gapPlacement: "end",
  },
  {
    id: "lat5",
    label: "Poziom 2",
    barLabel: "2",
    description: "wzory z kształtów, 1–2 puste pola",
    typicalAge: "zwykle ok. 5 lat",
    fieldsPerRow: 7,
    rowCount: 6,
    rules: [
      { rule: "AB", minRows: 1 },
      { rule: "AAB", minRows: 1 },
      { rule: "ABC", minRows: 1 },
    ],
    gaps: 1,
    extraGapRows: 3,
    gapPlacement: "end",
  },
  {
    id: "lat6",
    label: "Poziom 3",
    barLabel: "3",
    description: "liczby i wzory, 2 puste pola",
    typicalAge: "zwykle ok. 6 lat",
    fieldsPerRow: 8,
    rowCount: 7,
    rules: [
      { rule: "up1", minRows: 1 },
      { rule: "up2", minRows: 1 },
      { rule: "AB", minRows: 1 },
      { rule: "AAB", minRows: 1 },
      { rule: "ABC", minRows: 1 },
    ],
    gaps: 2,
    extraGapRows: 0,
    gapPlacement: "free",
  },
  {
    id: "lat7",
    label: "Poziom 4",
    barLabel: "4",
    description: "kształt z liczbą, liczby w dół, grupy; 2–3 puste pola",
    typicalAge: "zwykle ok. 7 lat",
    fieldsPerRow: 8,
    rowCount: 7,
    rules: [
      { rule: "mixed", minRows: 2 },
      { rule: "down1", minRows: 2 },
      { rule: "groups", minRows: 2 },
    ],
    gaps: 2,
    extraGapRows: 3,
    gapPlacement: "free",
  },
];

export function sequenceLevelById(id: SequenceLevelId): SequenceLevel {
  const level = SEQUENCE_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown sequence level ${id}`);
  }
  return level;
}

/** The setting of the first sequence card; the catalog thumbnail is drawn at this level. */
export const SEQUENCE_LEVEL_LAT5: SequenceLevel = sequenceLevelById("lat5");
