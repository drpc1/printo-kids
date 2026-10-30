import type { SudokuSymbols } from "./levels.ts";
import { SUDOKU_SHEET } from "./sheet.ts";
import { SUDOKU_SHAPES, type SudokuShapeId } from "./shapes.ts";

/** Side of every row drawing, in mm. The same square on 4×4, 6×6 and 9×9. */
const DRAWING_SIZE = 13;

/** Height of the frame around the row, in mm. */
const PANEL_HEIGHT = 17;

/** Space between the frame edge and its content on the left and right, in mm. */
export const PANEL_PADDING = 3;

/** Largest space between two drawings, in mm. A wider board packs the shapes instead of spreading them. */
export const MAX_GAP = 8;

/** The caption in front of the shapes. */
const LABEL_TEXT = "Użyj:";

/** Font size of the caption, in mm. */
const LABEL_SIZE = 5;

/** Width reserved for the caption, in mm. About 11 mm of text at the font size above. */
export const LABEL_WIDTH = 14;

/** Space between the caption and the first drawing, in mm. */
export const LABEL_GAP = 4;

export interface SudokuShapeListItem {
  id: SudokuShapeId;
  /** Center (x, y) and side of the drawing square, in mm. */
  drawing: { x: number; y: number; size: number };
}

export interface SudokuShapeListLayout {
  /** The frame around the row. Null when the card has no row. */
  panel: { x: number; y: number; width: number; height: number } | null;
  /** The caption: left edge x, baseline y and font size, in mm. Null when the card has no row. */
  label: { text: string; x: number; y: number; size: number } | null;
  items: SudokuShapeListItem[];
}

/**
 * Places the card's shapes in a frame under the grid. A digits card and a card with no shapes get no frame.
 * The frame has the width of the grid and starts one `instructionGap` below it, the same space as between the
 * instruction and the grid. The caption stands on the left. The shapes follow in catalog order with one equal gap,
 * at most `MAX_GAP`, as a group centered in the space after the caption. The drawing side is fixed.
 * The grid rectangle is read and left unchanged.
 */
export function layoutSudokuShapeList(input: {
  grid: { x: number; y: number; width: number; height: number };
  symbols: SudokuSymbols;
  shapes: readonly SudokuShapeId[];
}): SudokuShapeListLayout {
  if (input.symbols === "digits" || input.shapes.length === 0) {
    return { panel: null, label: null, items: [] };
  }

  const chosen = new Set(input.shapes);
  const ids = SUDOKU_SHAPES.filter((id) => chosen.has(id));
  const count = ids.length;
  const panel = {
    x: input.grid.x,
    y: input.grid.y + input.grid.height + SUDOKU_SHEET.instructionGap,
    width: input.grid.width,
    height: PANEL_HEIGHT,
  };
  const centerY = panel.y + PANEL_HEIGHT / 2;
  const fieldLeft = panel.x + PANEL_PADDING + LABEL_WIDTH + LABEL_GAP;
  const fieldWidth = panel.x + panel.width - PANEL_PADDING - fieldLeft;
  const gap = count > 1 ? Math.min(MAX_GAP, (fieldWidth - count * DRAWING_SIZE) / (count - 1)) : 0;
  const groupWidth = count * DRAWING_SIZE + (count - 1) * gap;
  const groupLeft = fieldLeft + (fieldWidth - groupWidth) / 2;

  return {
    panel,
    label: { text: LABEL_TEXT, x: panel.x + PANEL_PADDING, y: centerY + LABEL_SIZE * 0.32, size: LABEL_SIZE },
    items: ids.map((id, index) => ({
      id,
      drawing: { x: groupLeft + DRAWING_SIZE / 2 + index * (DRAWING_SIZE + gap), y: centerY, size: DRAWING_SIZE },
    })),
  };
}
