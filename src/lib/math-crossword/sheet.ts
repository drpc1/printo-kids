/**
 * How the "Krzyżówka matematyczna" card is drawn, in page units (mm on an A4 sheet). The page component, the catalog thumbnail
 * script, the preview script and the tests all read these and nothing else, so none of them can drift from the printed card.
 * The values are a first guess: the trial print decides (PRD Open Questions, S-40). Keep every number here.
 */
export const MATH_CROSSWORD_SHEET = {
  /** A4 portrait. */
  pageWidth: 210,
  pageHeight: 297,
  /** Page margin: no cell leaves the area inside it. */
  inset: 10,
  /** Height of the band for the character and the speech bubble; equals the character size of the shared band. */
  bandHeight: 26,
  /** Space between the band (or the plain instruction) and the crossword area. */
  bandGap: 6,
  /** Font size of the instruction when no character stands in the band. */
  plainInstructionSize: 7,
  /** The one instruction of the card, two short sentences. */
  instruction: "Uzupełnij krzyżówkę. Działania czytaj w prawo i w dół.",
  /** Line width of a cell frame. */
  cellStroke: 0.45,
  /** Font size of a one- or two-character text as a share of the cell side. */
  glyphRatio: 0.52,
  /** Font size of a longer text (a three-digit number, 100) as a share of the cell side. */
  longGlyphRatio: 0.42,
  /** Texts longer than this many characters use `longGlyphRatio`. */
  longGlyphFrom: 3,
  /**
   * How far below the cell centre the text baseline lies, in font sizes. Digits are about 0.72 em tall, so this puts them in
   * the middle. `dominant-baseline` is not used: phone browsers (Safari, Chrome, Brave) place the text differently.
   */
  baselineShift: 0.36,
  /** Operation signs drawn bold: a thin dot and colon vanish on a home printer. */
  boldSigns: ["·", ":"],
} as const;
