/**
 * How the sudoku card is drawn, in page units (mm on an A4 sheet). The page component, the mockup script and the
 * catalog thumbnail script all read these, so none of them can drift from the printed card.
 */
export const SUDOKU_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  /** Side of a 4×4 cell. Big enough for a child to draw a shape with a crayon. */
  cellSize4: 40,
  /** The instruction sentence split into lines: at this size the whole sentence is wider than the page. */
  instructionLines: ["Dorysuj brakujący kształt.", "W każdym rzędzie, kolumnie i kwadracie", "każdy kształt jest raz."],
  instructionSize: 6.5,
  instructionLineGap: 3,
  instructionGap: 9,
  /** Thin lines between cells. */
  cellStroke: 0.3,
  /** Thick lines between the 2×2 blocks, and the frame. */
  blockStroke: 1.1,
  frameStroke: 1.1,
  /** Side of a shape relative to its cell. */
  shapeScale: 0.65,
  /** Outline thickness of a shape, in mm. */
  shapeStroke: 1.2,
} as const;
