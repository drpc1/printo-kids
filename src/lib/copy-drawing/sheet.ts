/**
 * How the "Skopiuj rysunek na kratce" card is drawn, in page units (mm on an A4 sheet). The page component, the catalog
 * thumbnail script and the layout test all read these, so none of them can drift from the printed card.
 * Two grids of one size stand side by side under the instruction: the left one with the silhouette, the right one empty.
 */
export const COPY_DRAWING_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  /** Height of the band for the character and the speech bubble; equals the character size of the shared band. */
  bandHeight: 26,
  /** Space between the band (or the plain instruction) and the grids. */
  bandGap: 6,
  /** Space between the two grids. */
  gridGap: 10,
  /** Font size of the instruction when no character stands in the band (one line). */
  plainInstructionSize: 7,
  instructionText: "Przerysuj obrazek na pustą kratkę.",
  gridStroke: 0.3,
  /** Thicker line every `blockEvery` cells, so the child can count blocks of five. */
  blockStroke: 0.8,
  frameStroke: 0.8,
  blockEvery: 5,
} as const;
