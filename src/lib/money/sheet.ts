/**
 * How the "Kto ma więcej?" card is drawn, in page units (mm on an A4 sheet). The page component, the catalog
 * thumbnail script and the mockup script all read these, so none of them can drift from the printed card.
 * Coins and notes are simplified drawings (a circle and a rectangle with the value as a bold number); they do not copy
 * the real ones, and every coin is the same size and every note the same size, so size never gives the value away.
 */
export const MONEY_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  rowCount: 5,
  /** Height of the band for the character and the speech bubble; equals the character size of the shared band. */
  bandHeight: 26,
  /** Space between the band and the first row. */
  bandGap: 6,
  /** Smallest space between two rows. */
  rowGap: 5,
  /** Side of the empty square between two piles, where the child writes <, > or =. */
  signSize: 20,
  /** Space between the empty square and each pile. */
  signGap: 4,
  signStroke: 0.5,
  /** Space between a pile frame and the pieces inside it. */
  pilePadding: 3,
  pileFrameStroke: 0.3,
  pileFrameRadius: 3,
  /** Space between two pieces of a pile, in a row and between rows. */
  pieceGap: 1.5,
  coinDiameter: 11,
  coinStroke: 0.8,
  coinFontSize: 5.6,
  noteWidth: 18,
  noteHeight: 10,
  noteStroke: 0.6,
  /** Space between a note's outer edge and its inner frame. */
  noteInnerInset: 1,
  noteInnerStroke: 0.3,
  noteFontSize: 6,
  fontWeight: 700,
  /** Font size of the instruction when no character stands in the band (one line). */
  plainInstructionSize: 7,
  /** The instruction, one entry per line of the speech bubble. */
  instructionLines: ["Gdzie jest więcej pieniędzy?", "Wskaż <, > lub =."],
} as const;

/** Most pieces one pile may have on each level; the generator keeps to it and the layout test draws it. */
export const MAX_PIECES = {
  latwy: 5,
  sredni: 8,
  trudny: 10,
} as const;
