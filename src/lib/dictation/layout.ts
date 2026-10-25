export interface DictationSheetInput {
  pageWidth: number;
  pageHeight: number;
  inset: number;
  columns: number;
  rows: number;
  cellSize: number;
  commandCount: number;
  /** Command boxes per row. They share the inner page width equally. */
  commandsPerRow: number;
  commandRowHeight: number;
  /** Font size of the instruction sentence. Its box spans instruction.y ± instructionSize / 2. */
  instructionSize: number;
  /** Space between the instruction and the first command row. */
  instructionGap: number;
  /** Space between the last command row and the grid. */
  listGap: number;
}

export interface DictationBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DictationSheetLayout {
  page: { width: number; height: number };
  instruction: { x: number; y: number };
  /** One cell per command in reading order (left to right, row by row); a final partial row is left-aligned. */
  commands: readonly DictationBox[];
  grid: DictationBox;
}

/**
 * Places the instruction, the numbered command cells, and the grid on the page. The cells span the inner page width
 * and the grid is centered across the page. The instruction, the command rows, and the grid are centered down the page
 * inside the inset as one block. Throws when the setting does not fit, instead of returning a layout that crosses the
 * margin.
 */
export function layoutDictationSheet(input: DictationSheetInput): DictationSheetLayout {
  const {
    pageWidth,
    pageHeight,
    inset,
    columns,
    rows,
    cellSize,
    commandCount,
    commandsPerRow,
    commandRowHeight,
    instructionSize,
    instructionGap,
    listGap,
  } = input;
  const gridWidth = columns * cellSize;
  const gridHeight = rows * cellSize;
  const innerWidth = pageWidth - inset * 2;
  const innerHeight = pageHeight - inset * 2;
  const commandRows = Math.ceil(commandCount / commandsPerRow);
  const listHeight = commandRows * commandRowHeight;
  const blockHeight = instructionSize + instructionGap + listHeight + listGap + gridHeight;

  if (gridWidth > innerWidth || blockHeight > innerHeight) {
    throw new Error(
      `A ${columns} by ${rows} grid of ${cellSize} with ${commandCount} commands does not fit inside the ${inset} page margin`,
    );
  }

  const top = inset + (innerHeight - blockHeight) / 2;
  const listTop = top + instructionSize + instructionGap;
  const boxWidth = innerWidth / commandsPerRow;
  const commands = Array.from({ length: commandCount }, (_, index) => ({
    x: inset + (index % commandsPerRow) * boxWidth,
    y: listTop + Math.floor(index / commandsPerRow) * commandRowHeight,
    width: boxWidth,
    height: commandRowHeight,
  }));

  return {
    page: { width: pageWidth, height: pageHeight },
    instruction: { x: pageWidth / 2, y: top + instructionSize / 2 },
    commands,
    grid: { x: (pageWidth - gridWidth) / 2, y: listTop + listHeight + listGap, width: gridWidth, height: gridHeight },
  };
}
