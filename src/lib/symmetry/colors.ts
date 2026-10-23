import type { SymmetryCard } from "./generate.ts";
import { SYMMETRY_SHEET } from "./sheet.ts";
import type { SymmetryCell } from "./templates.ts";

export interface SymmetryDrawnCell {
  cell: SymmetryCell;
  /** A CSS color value: a theme token, never a hex. */
  fill: string;
  opacity: number;
}

const INK = "var(--foreground)";

function crayon(cell: SymmetryCell): string {
  return `var(--symmetry-${cell.color})`;
}

/**
 * What the page draws on the card: the pattern cells, the details (holes) when colors are on, and the hint cells,
 * always paler than the pattern. Without colors everything is ink; with colors every cell has its own crayon.
 */
export function symmetryDrawnCells(card: SymmetryCard, colors: boolean): readonly SymmetryDrawnCell[] {
  const solid = colors ? [...card.cells, ...card.details] : card.cells;
  return [
    ...solid.map((cell) => ({ cell, fill: colors ? crayon(cell) : INK, opacity: 1 })),
    ...card.hints.map((cell) => ({
      cell,
      fill: colors ? crayon(cell) : INK,
      opacity: SYMMETRY_SHEET.hintOpacity,
    })),
  ];
}
