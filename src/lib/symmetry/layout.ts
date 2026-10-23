/** How far the dashed axis reaches past the top and bottom of the grid frame, in page units. */
export const SYMMETRY_AXIS_OVERHANG = 4;

export interface SymmetrySheetInput {
  pageWidth: number;
  pageHeight: number;
  inset: number;
  columns: number;
  rows: number;
  cellSize: number;
  /** Font size of the instruction sentence. Its box spans instruction.y ± instructionHeight / 2. */
  instructionHeight: number;
  /** Space between the instruction box and the grid frame. The top of the axis overhang sits in it. */
  instructionGap: number;
}

export interface SymmetrySheetLayout {
  page: { width: number; height: number };
  instruction: { x: number; y: number };
  grid: { x: number; y: number; width: number; height: number };
  axis: { x1: number; y1: number; x2: number; y2: number };
}

/**
 * Places the instruction, the grid, and the vertical axis on the page. The grid is centered across the page, and
 * the instruction with the grid (and the axis overhang below it) is centered down the page inside the inset.
 * Throws when the setting does not fit, instead of returning a layout that crosses the margin.
 */
export function layoutSymmetrySheet(input: SymmetrySheetInput): SymmetrySheetLayout {
  const { pageWidth, pageHeight, inset, columns, rows, cellSize, instructionHeight, instructionGap } = input;
  const width = columns * cellSize;
  const height = rows * cellSize;
  const innerWidth = pageWidth - inset * 2;
  const innerHeight = pageHeight - inset * 2;
  const blockHeight = instructionHeight + instructionGap + height + SYMMETRY_AXIS_OVERHANG;

  if (width > innerWidth || blockHeight > innerHeight) {
    throw new Error(`A ${columns} by ${rows} grid of ${cellSize} does not fit inside the ${inset} page margin`);
  }
  if (instructionGap < SYMMETRY_AXIS_OVERHANG) {
    throw new Error(`The instruction gap ${instructionGap} is smaller than the axis overhang`);
  }

  const top = inset + (innerHeight - blockHeight) / 2;
  const gridX = (pageWidth - width) / 2;
  const gridY = top + instructionHeight + instructionGap;
  const axisX = gridX + width / 2;

  return {
    page: { width: pageWidth, height: pageHeight },
    instruction: { x: pageWidth / 2, y: top + instructionHeight / 2 },
    grid: { x: gridX, y: gridY, width, height },
    axis: { x1: axisX, y1: gridY - SYMMETRY_AXIS_OVERHANG, x2: axisX, y2: gridY + height + SYMMETRY_AXIS_OVERHANG },
  };
}
