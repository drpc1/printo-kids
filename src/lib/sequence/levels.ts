export const DEFAULT_SEQUENCE_LEVEL_ID = "lat5";

export interface SequenceLevel {
  id: "lat5";
  label: string;
  /** Fields in one row; the fields fill the width of the page. */
  fieldsPerRow: 7;
  rowCount: 6;
  /** Repeating patterns the card draws from. Each one appears at least once per card. */
  patterns: readonly ["AB", "AAB", "ABC"];
  /** Rows of the card that have two gaps; the remaining rows have one. */
  twoGapRows: 3;
}

export const SEQUENCE_LEVEL_LAT5: SequenceLevel = {
  id: "lat5",
  label: "5 lat",
  fieldsPerRow: 7,
  rowCount: 6,
  patterns: ["AB", "AAB", "ABC"],
  twoGapRows: 3,
};
