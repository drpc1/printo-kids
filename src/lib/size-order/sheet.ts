/**
 * How the "Od najmniejszego" card is drawn, in page units (mm on an A4 sheet). The page component, the thumbnail
 * script, the preview script and the tests all read these and nothing else, so none of them can drift from the
 * printed card. The values come from the accepted mockup (context/changes/size-order-card/mockup.mts); the trial
 * print decides (phase 3).
 */
export const SIZE_ORDER_SHEET = {
  /** A4 portrait. */
  pageWidth: 210,
  pageHeight: 297,
  /** Page margin: nothing of the task leaves the area inside it. */
  inset: 10,
  /** Height of the band for the character and the speech bubble; equals the character size of the shared band. */
  bandHeight: 26,
  /** Space between the band (or the plain instruction) and the first row. */
  bandGap: 8,
  /** Font size of the plain instruction when no character stands in the band (one line). */
  plainInstructionSize: 7,
  /** The instruction; the child writes 1, 2, 3… or draws dots (no key, decision 2026-11-18). */
  instruction: "Od najmniejszego: wpisz 1, 2, 3… albo narysuj kropki.",
  /** Answer box under every picture: wide enough for a digit or up to five dots. */
  answerBox: { height: 13, maxWidth: 30, slotMargin: 6 },
  /** Line width and corner radius of an answer box. */
  boxStroke: 0.5,
  boxRadius: 1,
  /** Space between the common baseline of the pictures and the answer boxes. */
  baselineToBox: 4,
  /** Space under the box of a row and above its tallest picture. */
  rowPad: 4,
  /** Dashed line between two rows. */
  rowDividerStroke: 0.25,
  /** Share of its slot the widest picture of a row may take; a wide icon shrinks the whole row (no new size cue). */
  slotShare: 0.85,
  /** Outline of a shape; the same for every size, so the line is no second cue for size. */
  shapeStroke: 1,
  /**
   * Smallest difference of two neighbouring heights of a row on paper, mm. Starting value; the trial print decides
   * (phase 3). The hard level's tightest step is 0.10 of the tallest picture, so this also bounds how far a wide
   * icon may shrink a row (2 mm needs a tallest picture of at least 20 mm).
   */
  minStepMm: 2,
  /** How far below a text's centre its baseline lies, in font sizes; no `dominant-baseline` (GitHub 371). */
  baselineShift: 0.36,
} as const;
