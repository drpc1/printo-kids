import type { SudokuSymbols } from "./levels.ts";
import { SUDOKU_SHEET } from "./sheet.ts";
import { SUDOKU_SHAPES, SUDOKU_SHAPE_NAMES, type SudokuShapeId } from "./shapes.ts";

/** Side of every row drawing, in mm. The same square on 4×4, 6×6 and 9×9. */
const DRAWING_SIZE = 16;

/** Font size of every Polish name, in mm. The same size on every board. */
const LABEL_SIZE = 4;

/** Space between the bottom of a drawing and the top of its name, in mm. */
const LABEL_GAP = 1.5;

export interface SudokuShapeListItem {
  id: SudokuShapeId;
  name: string;
  /** Center (x, y) and side of the drawing square, in mm. */
  drawing: { x: number; y: number; size: number };
  /** Center (x, y) and font size of the Polish name, in mm. */
  label: { x: number; y: number; size: number };
}

/**
 * Places the card's shapes in one row under the grid. A digits card and a card with no shapes return no positions.
 * Centers sit on equal slots across the width inside the margin. The drawing side and the name size are fixed.
 * The grid rectangle is read and left unchanged.
 */
export function layoutSudokuShapeList(input: {
  grid: { x: number; y: number; width: number; height: number };
  pageWidth: number;
  pageHeight: number;
  inset: number;
  symbols: SudokuSymbols;
  shapes: readonly SudokuShapeId[];
}): { items: SudokuShapeListItem[] } {
  if (input.symbols === "digits" || input.shapes.length === 0) {
    return { items: [] };
  }

  const chosen = new Set(input.shapes);
  const ids = SUDOKU_SHAPES.filter((id) => chosen.has(id));
  const slotWidth = (input.pageWidth - 2 * input.inset) / ids.length;
  const top = input.grid.y + input.grid.height + SUDOKU_SHEET.frameStroke / 2;
  const drawingY = top + DRAWING_SIZE / 2;
  const labelY = top + DRAWING_SIZE + LABEL_GAP + LABEL_SIZE / 2;

  return {
    items: ids.map((id, index) => {
      const x = input.inset + (index + 0.5) * slotWidth;
      return {
        id,
        name: SUDOKU_SHAPE_NAMES[id],
        drawing: { x, y: drawingY, size: DRAWING_SIZE },
        label: { x, y: labelY, size: LABEL_SIZE },
      };
    }),
  };
}
