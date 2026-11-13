import type { SudokuSize } from "./levels.ts";

/** Rows and columns of cells in one block: 2×2, 2×3 (2 rows, 3 columns) or 3×3. */
export function sudokuBlock(size: SudokuSize): { rows: number; columns: number } {
  if (size === 4) return { rows: 2, columns: 2 };
  if (size === 6) return { rows: 2, columns: 3 };
  return { rows: 3, columns: 3 };
}
