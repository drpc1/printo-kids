import type { SymmetryCell, SymmetryTemplate } from "../symmetry/templates.ts";
import type { NonogramSize } from "./sizes.ts";

export interface NonogramClues {
  /** One clue per row, top to bottom. */
  rows: number[][];
  /** One clue per column, left to right. */
  columns: number[][];
}

/**
 * The silhouette of one template as rows of filled cells: the base and the chosen variant of every part, shifted so
 * the drawing touches the axis, then mirrored. The drawing starts at the top row; rows below it stay empty.
 * Throws for a template larger than the half grid: that is a broken template, not a card that failed to come out.
 */
export function nonogramImage(
  template: SymmetryTemplate,
  variants: readonly number[],
  size: Pick<NonogramSize, "id" | "columns" | "rows">,
): boolean[][] {
  const half = size.columns / 2;
  if (template.width > half || template.height > size.rows) {
    throw new Error(
      `Template ${template.id} is ${template.width} by ${template.height}, the ${size.id} half grid is ${half} by ${size.rows}`,
    );
  }
  const cells: SymmetryCell[] = [...template.base];
  template.parts.forEach((part, index) => {
    const variant = part.variants[variants[index]] as readonly SymmetryCell[] | undefined;
    if (variant === undefined) {
      throw new Error(`Template ${template.id} has no variant ${variants[index]} of part ${part.id}`);
    }
    cells.push(...variant);
  });

  const image = Array.from({ length: size.rows }, () => new Array<boolean>(size.columns).fill(false));
  const shift = half - template.width;
  for (const cell of cells) {
    const col = cell.col + shift;
    image[cell.row][col] = true;
    image[cell.row][size.columns - 1 - col] = true;
  }
  return image;
}

/** Lengths of the runs of filled cells in a line, in order. A line without filled cells has the clue [0]. */
export function lineClue(cells: readonly boolean[]): number[] {
  const clue: number[] = [];
  let run = 0;
  for (const filled of cells) {
    if (filled) {
      run += 1;
    } else if (run > 0) {
      clue.push(run);
      run = 0;
    }
  }
  if (run > 0) {
    clue.push(run);
  }
  return clue.length === 0 ? [0] : clue;
}

export function nonogramClues(image: readonly (readonly boolean[])[]): NonogramClues {
  const columnCount = image.length === 0 ? 0 : image[0].length;
  return {
    rows: image.map((row) => lineClue(row)),
    columns: Array.from({ length: columnCount }, (_, col) => lineClue(image.map((row) => row[col]))),
  };
}
