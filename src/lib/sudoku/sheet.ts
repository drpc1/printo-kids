/**
 * How the sudoku card is drawn, in page units (mm on an A4 sheet). The page component, the mockup script and the
 * catalog thumbnail script all read these, so none of them can drift from the printed card.
 */
export const SUDOKU_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  /** Side of a cell by board size: big enough for a child to draw a shape or write a digit with a crayon. */
  cellSize: { 4: 40, 6: 28, 9: 20 } as Record<4 | 6 | 9, number>,
  /** The instruction split into lines: at this size the whole sentence is wider than the page. */
  instructionLines: ["Uzupełnij puste pola.", "Nic się nie powtarza w rzędzie, kolumnie i bloku."],
  instructionSize: 6.5,
  instructionLineGap: 3,
  instructionGap: 9,
  /** Thin lines between cells. */
  cellStroke: 0.3,
  /** Thick lines between blocks, and the frame. */
  blockStroke: 1.1,
  frameStroke: 1.1,
  /** Side of a shape relative to its cell. */
  shapeScale: 0.65,
  /** Outline thickness of a shape, in mm. */
  shapeStroke: 1.2,
  /** Height of a digit relative to its cell. */
  digitScale: 0.6,
  /** How far a digit baseline sits below the cell center, relative to the digit size: about half the digit height. */
  digitBaselineShift: 0.35,
} as const;
