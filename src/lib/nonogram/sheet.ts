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
