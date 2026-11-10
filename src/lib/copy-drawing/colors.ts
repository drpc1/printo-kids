import { nonogramImage } from "../nonogram/clues.ts";
import { symmetryTemplatesFor, type SymmetryColor } from "../symmetry/templates.ts";
import { silhouetteRowShift, type CopyDrawingCard } from "./card.ts";
import { copyDrawingLevelById } from "./levels.ts";

/**
 * The crayon of every cell of the silhouette, rows by columns: the template's color for a filled cell, the template's
 * hole color for an empty cell the silhouette closes in (none when the template keeps its holes white), null for the
 * rest. Same grid and same vertical shift as `card.pattern`, so a non-null entry marks a cell the colored grid draws.
 * Returns null when the card names a template or variant that does not exist.
 */
export function copyDrawingCellColors(card: CopyDrawingCard): (SymmetryColor | null)[][] | null {
  const level = copyDrawingLevelById(card.levelId);
  const template = symmetryTemplatesFor(level.size.templateLevel, "wszystkie").find(
    (candidate) => candidate.id === card.templateId,
  );
  if (template === undefined) {
    return null;
  }
  const { columns, rows } = level.size;
  const cells = [...template.base];
  for (const [index, part] of template.parts.entries()) {
    const variant = part.variants[card.variants[index]] as (typeof part.variants)[number] | undefined;
    if (variant === undefined) {
      return null;
    }
    cells.push(...variant);
  }

  const shiftX = columns / 2 - template.width;
  const shiftY = silhouetteRowShift(nonogramImage(template, card.variants, level.size));
  const colors = Array.from({ length: rows }, () => new Array<SymmetryColor | null>(columns).fill(null));
  for (const cell of cells) {
    const row = cell.row + shiftY;
    const col = cell.col + shiftX;
    if (row >= 0 && row < rows) {
      colors[row][col] = cell.color;
      colors[row][columns - 1 - col] = cell.color;
    }
  }

  if (template.holeColor !== null) {
    for (const [row, col] of closedCells(colors)) {
      colors[row][col] = template.holeColor;
    }
  }
  return colors;
}

/** Empty cells that a flood from outside the grid, through empty cells only, never reaches. */
function closedCells(colors: readonly (readonly (SymmetryColor | null)[])[]): [number, number][] {
  const rows = colors.length;
  const columns = colors[0].length;
  const reached = new Set<number>();
  const queue: [number, number][] = [];
  const visit = (row: number, col: number): void => {
    const key = row * columns + col;
    if (row < 0 || row >= rows || col < 0 || col >= columns || colors[row][col] !== null || reached.has(key)) {
      return;
    }
    reached.add(key);
    queue.push([row, col]);
  };
  for (let row = 0; row < rows; row += 1) {
    visit(row, 0);
    visit(row, columns - 1);
  }
  for (let col = 0; col < columns; col += 1) {
    visit(0, col);
    visit(rows - 1, col);
  }
  for (let next = queue.pop(); next !== undefined; next = queue.pop()) {
    const [row, col] = next;
    visit(row - 1, col);
    visit(row + 1, col);
    visit(row, col - 1);
    visit(row, col + 1);
  }
  const closed: [number, number][] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      if (colors[row][col] === null && !reached.has(row * columns + col)) {
        closed.push([row, col]);
      }
    }
  }
  return closed;
}
