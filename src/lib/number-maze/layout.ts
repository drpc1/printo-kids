import type { NumberMazeCard } from "./card.ts";
import { numberMazeLevelById } from "./levels.ts";
import { NUMBER_MAZE_SHEET } from "./sheet.ts";

const EPSILON = 1e-9;

export interface NumberMazeCellLayout {
  x: number;
  y: number;
  /** The number, its font size and its baseline (centre plus the explicit shift; no `dominant-baseline`). */
  text: string;
  fontSize: number;
  baseline: number;
}

export interface NumberMazeLabelLayout {
  text: "Start" | "Meta";
  /** Centre of the label and its baseline. */
  x: number;
  baseline: number;
}

export interface NumberMazeSheetLayout {
  page: { width: number; height: number };
  /** The instruction: the speech band with a character, the plain line without one. */
  band: { y: number; height: number };
  /** Side of one cell, mm. */
  cell: number;
  /** The whole grid. */
  grid: { x: number; y: number; width: number; height: number };
  cells: NumberMazeCellLayout[];
  /** The thick frames of the start and goal cells. */
  endpoints: { x: number; y: number; size: number }[];
  labels: NumberMazeLabelLayout[];
}

/**
 * Places the instruction, the grid centred across the page, "Start" above the top left cell and "Meta" under the
 * bottom right one. The cell fills the width or the height under the instruction, up to `maxCell`. Throws when
 * something would cross the 10 mm margin.
 */
export function layoutNumberMazeSheet(card: NumberMazeCard, instructionBoxHeight: number): NumberMazeSheetLayout {
  const sheet = NUMBER_MAZE_SHEET;
  const level = numberMazeLevelById(card.levelId);
  const width = sheet.pageWidth - 2 * sheet.inset;
  const gridTop = sheet.inset + instructionBoxHeight + sheet.bandGap + sheet.labelBand;
  const available = sheet.pageHeight - sheet.inset - sheet.labelBand - gridTop;
  const cell = Math.min(sheet.maxCell, width / level.cols, available / level.rows);
  if (cell <= 0) {
    throw new Error("number-maze instruction leaves no room for the grid");
  }
  const gridWidth = cell * level.cols;
  const gridHeight = cell * level.rows;
  const gridX = sheet.inset + (width - gridWidth) / 2;
  const widest = String(Math.max(...card.values)).length;
  const fontSize = cell * (widest > 2 ? sheet.wideDigitShare : sheet.digitShare);

  const at = (index: number): { x: number; y: number } => ({
    x: gridX + (index % level.cols) * cell,
    y: gridTop + Math.floor(index / level.cols) * cell,
  });
  const cells = card.values.map((value, index): NumberMazeCellLayout => {
    const { x, y } = at(index);
    return { x, y, text: String(value), fontSize, baseline: y + cell / 2 + fontSize * sheet.baselineShift };
  });

  const goal = card.values.length - 1;
  const endpoints = [0, goal].map((index) => {
    const { x, y } = at(index);
    return { x: x + sheet.endpointInset, y: y + sheet.endpointInset, size: cell - 2 * sheet.endpointInset };
  });
  const start = at(0);
  const end = at(goal);
  const labels: NumberMazeLabelLayout[] = [
    { text: "Start", x: start.x + cell / 2, baseline: start.y - sheet.labelGap },
    { text: "Meta", x: end.x + cell / 2, baseline: end.y + cell + sheet.labelGap + sheet.labelSize },
  ];

  const bottom = Math.max(gridTop + gridHeight, labels[1].baseline);
  if (gridX < sheet.inset - EPSILON || gridX + gridWidth > sheet.pageWidth - sheet.inset + EPSILON) {
    throw new Error("number-maze grid crosses the side margin");
  }
  if (bottom > sheet.pageHeight - sheet.inset + EPSILON) {
    throw new Error("number-maze grid crosses the bottom margin");
  }
  return {
    page: { width: sheet.pageWidth, height: sheet.pageHeight },
    band: { y: sheet.inset, height: instructionBoxHeight },
    cell,
    grid: { x: gridX, y: gridTop, width: gridWidth, height: gridHeight },
    cells,
    endpoints,
    labels,
  };
}
