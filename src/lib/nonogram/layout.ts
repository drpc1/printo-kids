import type { NonogramClues } from "./clues.ts";

export interface NonogramSheetInput {
  pageWidth: number;
  pageHeight: number;
  inset: number;
  columns: number;
  rows: number;
  cellSize: number;
  /** Height of a clue digit. */
  digitSize: number;
  /** Most numbers in one row clue. */
  maxRowClues: number;
  /** Most numbers in one column clue. */
  maxColumnClues: number;
  /** Font size of the instruction sentence. Its box spans instruction.y ± instructionSize / 2. */
  instructionSize: number;
  /** Space between the instruction box and the top of the column clue band. */
  instructionGap: number;
  /** Space between the clue bands and the grid. */
  clueGap: number;
  /** Slot of one clue number as a multiple of digitSize. */
  clueSlot: number;
}

export interface NonogramSheetLayout {
  page: { width: number; height: number };
  instruction: { x: number; y: number };
  grid: { x: number; y: number; width: number; height: number };
  /**
   * Center x of the slot of a row clue number. Index 0 is the last number of the row, right next to the grid, and the
   * index grows outward (to the left), so the page can right-align the numbers of a row against the grid.
   */
  rowClueX(index: number): number;
  /**
   * Center y of the slot of a column clue number. Index 0 is the last number of the column, right above the grid, and
   * the index grows outward (upward), so the page can bottom-align the numbers of a column against the grid.
   */
  columnClueY(index: number): number;
}

/** The most numbers in one row clue and in one column clue. */
export function longestClues(clues: NonogramClues): { maxRowClues: number; maxColumnClues: number } {
  return {
    maxRowClues: Math.max(0, ...clues.rows.map((clue) => clue.length)),
    maxColumnClues: Math.max(0, ...clues.columns.map((clue) => clue.length)),
  };
}

/** Indexes of the thicker grid lines: 0, every `every` lines, and the closing line at `count`. */
export function blockLines(count: number, every = 5): number[] {
  const lines: number[] = [];
  for (let index = 0; index < count; index += every) {
    lines.push(index);
  }
  lines.push(count);
  return lines;
}

/**
 * Places the instruction, the clue bands, and the grid on the page. The block of row clue band and grid is centered
 * across the page, and the instruction with the column clue band and the grid is centered down the page inside the
 * inset. Throws when the setting does not fit, instead of returning a layout that crosses the margin.
 */
export function layoutNonogramSheet(input: NonogramSheetInput): NonogramSheetLayout {
  const { pageWidth, pageHeight, inset, columns, rows, cellSize, digitSize, maxRowClues, maxColumnClues } = input;
  const slot = digitSize * input.clueSlot;
  const width = columns * cellSize;
  const height = rows * cellSize;
  const bandWidth = maxRowClues * slot + input.clueGap;
  const bandHeight = maxColumnClues * slot + input.clueGap;
  const innerWidth = pageWidth - inset * 2;
  const innerHeight = pageHeight - inset * 2;
  const blockWidth = bandWidth + width;
  const blockHeight = input.instructionSize + input.instructionGap + bandHeight + height;

  if (blockWidth > innerWidth || blockHeight > innerHeight) {
    throw new Error(
      `A ${columns} by ${rows} grid of ${cellSize} with clues of ${maxRowClues} by ${maxColumnClues} numbers does not fit inside the ${inset} page margin`,
    );
  }

  const left = inset + (innerWidth - blockWidth) / 2;
  const top = inset + (innerHeight - blockHeight) / 2;
  const gridX = left + bandWidth;
  const gridY = top + input.instructionSize + input.instructionGap + bandHeight;

  return {
    page: { width: pageWidth, height: pageHeight },
    instruction: { x: pageWidth / 2, y: top + input.instructionSize / 2 },
    grid: { x: gridX, y: gridY, width, height },
    rowClueX: (index) => gridX - input.clueGap - slot * (index + 0.5),
    columnClueY: (index) => gridY - input.clueGap - slot * (index + 0.5),
  };
}

export interface SimpleNonogramSheetInput {
  pageWidth: number;
  pageHeight: number;
  inset: number;
  columns: number;
  rows: number;
  cellSize: number;
  /** Most chips in one row. */
  maxRuns: number;
  /** Font size of the instruction sentence. Its box spans instruction.y ± instructionSize / 2. */
  instructionSize: number;
  /** Space between the instruction box and the grid. */
  instructionGap: number;
  /** Side of one chip. */
  chipSize: number;
  /** Space between two chips of a row. */
  chipGap: number;
  /** Space between the last chip and the grid. */
  bandGap: number;
}

export interface SimpleNonogramSheetLayout {
  page: { width: number; height: number };
  instruction: { x: number; y: number };
  grid: { x: number; y: number; width: number; height: number };
  /** Left edge of chip `index` (0 is the leftmost) of a row with `count` chips; the chips are right-aligned against the grid. */
  chipX(index: number, count: number): number;
  /** Top edge of the chips of a row: they are centered in the row. */
  chipY(row: number): number;
}

/**
 * Places the instruction, the chip band, and the grid of the chip card on the page. The block of chip band and grid is
 * centered across the page, and the instruction with the grid is centered down the page inside the inset. Throws when
 * the setting does not fit, instead of returning a layout that crosses the margin.
 */
export function layoutSimpleNonogramSheet(input: SimpleNonogramSheetInput): SimpleNonogramSheetLayout {
  const { pageWidth, pageHeight, inset, columns, rows, cellSize, maxRuns, chipSize, chipGap } = input;
  const width = columns * cellSize;
  const height = rows * cellSize;
  const bandWidth = maxRuns * chipSize + Math.max(0, maxRuns - 1) * chipGap + input.bandGap;
  const blockWidth = bandWidth + width;
  const blockHeight = input.instructionSize + input.instructionGap + height;

  if (blockWidth > pageWidth - inset * 2 || blockHeight > pageHeight - inset * 2 || chipSize > cellSize) {
    throw new Error(
      `A ${columns} by ${rows} grid of ${cellSize} with rows of ${maxRuns} chips does not fit inside the ${inset} page margin`,
    );
  }

  const left = inset + (pageWidth - inset * 2 - blockWidth) / 2;
  const top = inset + (pageHeight - inset * 2 - blockHeight) / 2;
  const gridX = left + bandWidth;
  const gridY = top + input.instructionSize + input.instructionGap;

  return {
    page: { width: pageWidth, height: pageHeight },
    instruction: { x: pageWidth / 2, y: top + input.instructionSize / 2 },
    grid: { x: gridX, y: gridY, width, height },
    chipX: (index, count) => gridX - input.bandGap - (count - index) * chipSize - (count - index - 1) * chipGap,
    chipY: (row) => gridY + row * cellSize + (cellSize - chipSize) / 2,
  };
}
