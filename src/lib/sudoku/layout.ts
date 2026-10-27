export interface SudokuLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SudokuSheetInput {
  pageWidth: number;
  pageHeight: number;
  inset: number;
  /** Cells per side: 4, 6 or 9. */
  size: number;
  /** Cell rows and cell columns in one block: 2×2, 2×3 or 3×3. */
  blockRows: number;
  blockColumns: number;
  cellSize: number;
  instructionLineCount: number;
  /** Font size of one instruction line. */
  instructionSize: number;
  /** Space between two instruction lines. */
  instructionLineGap: number;
  /** Space between the last instruction line and the grid frame. */
  instructionGap: number;
  /** Height of the whole instruction when a speech band replaces the lines of text; the line count then only places `ys`. */
  instructionBoxHeight?: number;
}

export interface SudokuSheetLayout {
  page: { width: number; height: number };
  /** Horizontal center of the instruction, and the vertical center of each of its lines. */
  instruction: { x: number; ys: number[]; top: number; height: number };
  grid: { x: number; y: number; width: number; height: number };
  /** Thin lines between cells, without the ones that sit on a block border. */
  cellLines: SudokuLine[];
  /** Thick lines on block borders inside the frame. */
  blockLines: SudokuLine[];
  cellCenter: (row: number, column: number) => { x: number; y: number };
}

/**
 * Places the instruction and the square grid on the page. The grid is centered across the page, and the
 * instruction with the grid is centered down the page inside the inset. Throws when the setting does not fit,
 * instead of returning a layout that crosses the margin.
 */
export function layoutSudokuSheet(input: SudokuSheetInput): SudokuSheetLayout {
  const { pageWidth, pageHeight, inset, size, blockRows, blockColumns, cellSize } = input;
  const { instructionLineCount, instructionSize, instructionLineGap, instructionGap } = input;
  const side = size * cellSize;
  const textHeight =
    instructionLineCount * instructionSize + Math.max(0, instructionLineCount - 1) * instructionLineGap;
  const instructionHeight = input.instructionBoxHeight ?? textHeight;
  const blockHeight = instructionHeight + instructionGap + side;

  if (side > pageWidth - inset * 2 || blockHeight > pageHeight - inset * 2) {
    throw new Error(`A ${size} by ${size} grid of ${cellSize} does not fit inside the ${inset} page margin`);
  }

  const top = inset + (pageHeight - inset * 2 - blockHeight) / 2;
  const gridX = (pageWidth - side) / 2;
  const gridY = top + instructionHeight + instructionGap;

  const ys = Array.from(
    { length: instructionLineCount },
    (_, index) => top + instructionSize / 2 + index * (instructionSize + instructionLineGap),
  );

  const cellLines: SudokuLine[] = [];
  const blockLines: SudokuLine[] = [];
  for (let index = 1; index < size; index += 1) {
    const offset = index * cellSize;
    const vertical = { x1: gridX + offset, y1: gridY, x2: gridX + offset, y2: gridY + side };
    const horizontal = { x1: gridX, y1: gridY + offset, x2: gridX + side, y2: gridY + offset };
    (index % blockColumns === 0 ? blockLines : cellLines).push(vertical);
    (index % blockRows === 0 ? blockLines : cellLines).push(horizontal);
  }

  return {
    page: { width: pageWidth, height: pageHeight },
    instruction: { x: pageWidth / 2, ys, top, height: instructionHeight },
    grid: { x: gridX, y: gridY, width: side, height: side },
    cellLines,
    blockLines,
    cellCenter: (row, column) => ({ x: gridX + (column + 0.5) * cellSize, y: gridY + (row + 0.5) * cellSize }),
  };
}
