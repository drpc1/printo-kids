/**
 * How the nonogram card is drawn, in page units (mm on an A4 sheet). The page component and the catalog thumbnail
 * script both read these, so the thumbnail cannot drift from the printed card.
 */
export const NONOGRAM_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  instructionSize: 7,
  instructionGap: 6,
  instructionText: "Zamaluj kratki według liczb. Co się ukryło?",
  gridStroke: 0.3,
  /** Thicker line every `blockEvery` cells, so the child can count blocks of five. */
  blockStroke: 0.8,
  frameStroke: 0.8,
  blockEvery: 5,
  /** Space between the clue band and the grid, in page units. */
  clueGap: 2,
  /** Width and height of the slot of one clue number, as a multiple of the digit size. */
  clueSlot: 1.1,
  /** Weight of the clue numbers: bold, so the child reads them easily. */
  clueFontWeight: 600,
} as const;

/** The chip card of the easy level: a chip for every run of a row, white, gray or black, with its cell count. */
export const NONOGRAM_SIMPLE_SHEET = {
  instructionText: "Pokoloruj każdy rząd według znaczków.",
  /** Side of one chip; seven chips plus the 8 by 14 grid fit inside the 10 mm margin. */
  chipSize: 9.5,
  chipGap: 1.2,
  /** Space between the last chip and the grid. */
  bandGap: 2,
  chipRadius: 1.2,
  chipStroke: 0.4,
  /** Height of the count digit in a chip. */
  digitSize: 6,
} as const;
