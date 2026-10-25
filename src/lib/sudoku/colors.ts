import type { SudokuShapeId } from "./shapes.ts";

/**
 * The crayon color of each shape on a sudoku card with colors on. The names are the `--symmetry-*` tokens in
 * `src/styles/global.css`, which the symmetry and sudoku cards share. Every shape keeps its color on every board.
 */
export const SUDOKU_SHAPE_COLORS: Record<SudokuShapeId, string> = {
  heart: "red",
  circle: "blue",
  triangle: "green",
  square: "orange",
  cross: "purple",
  star: "yellow",
  diamond: "brown",
  moon: "gray",
  drop: "black",
};

/** A CSS color value, a theme token and never a hex: the shape's crayon with colors on, ink without. */
export function sudokuShapeInk(id: SudokuShapeId, colors: boolean): string {
  return colors ? `var(--symmetry-${SUDOKU_SHAPE_COLORS[id]})` : "var(--foreground)";
}
