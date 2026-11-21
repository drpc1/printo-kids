import { dictationShapesFor } from "../dictation/shapes.ts";
import { nonogramImage } from "../nonogram/clues.ts";
import { symmetryColorOfLetter } from "../symmetry/template-format.ts";
import { symmetryTemplatesFor, type SymmetryColor } from "../symmetry/templates.ts";
import type { CopyDrawingLevel, CopyDrawingLevelId } from "./levels.ts";

/**
 * Where the picture of a card comes from: a symmetry template with one variant index per part, or a dictation shape
 * drawn as it is or flipped left to right (S-55).
 */
export type CopyDrawingPicture =
  | { kind: "template"; templateId: string; variants: readonly number[] }
  | { kind: "shape"; shapeId: string; mirrored: boolean };

export interface CopyDrawingCard {
  levelId: CopyDrawingLevelId;
  picture: CopyDrawingPicture;
  /** The silhouette, rows by columns. The left grid shows it, the right grid is empty; both have this grid. */
  pattern: readonly (readonly boolean[])[];
  /** Names the level and the picture (template and variants, or shape and flip), so two cards with one key look the same. Not shown to the child. */
  key: string;
}

export type CopyDrawingProblem = "grid-size" | "no-filled-cell" | "no-empty-cell" | "not-silhouette" | "level-mismatch";

/** The key of a card. The generator and `copyDrawingProblems` both read it here, so they count a repeat the same way. */
export function copyDrawingKey(levelId: CopyDrawingLevelId, picture: CopyDrawingPicture): string {
  if (picture.kind === "template") {
    return `${levelId}:${picture.templateId}:${picture.variants.join("-")}`;
  }
  // The "ksztalt" marker keeps a shape key from ever equalling a template key.
  return `${levelId}:ksztalt:${picture.shapeId}:${picture.mirrored ? "odbity" : "prosty"}`;
}

/** How many rows `centerSilhouette` moves the picture down (negative: up); 0 for an empty image. */
export function silhouetteRowShift(image: readonly (readonly boolean[])[]): number {
  const first = image.findIndex((row) => row.some(Boolean));
  if (first === -1) {
    return 0;
  }
  let last = first;
  image.forEach((row, index) => {
    if (row.some(Boolean)) {
      last = index;
    }
  });
  return Math.floor((image.length - (last - first + 1)) / 2) - first;
}

/**
 * The silhouette moved so the empty rows above and below it differ by at most one. Its height runs from the first to
 * the last filled row, so empty rows inside it count. An empty image is returned as a copy. The one place that decides
 * where the picture stands in the grid: the generator and `copyDrawingProblems` both use it.
 */
export function centerSilhouette(image: readonly (readonly boolean[])[]): boolean[][] {
  const rows = image.length;
  const shift = silhouetteRowShift(image);
  const columns = image[0].length;
  return Array.from({ length: rows }, (_, row) => {
    const source = image[row - shift] as readonly boolean[] | undefined;
    return source === undefined ? new Array<boolean>(columns).fill(false) : [...source];
  });
}

/**
 * The crayon of every cell of a dictation shape on the grid of the level, rows by columns, null for an empty cell: the
 * drawing flipped when `mirrored`, set `floor((columns - width) / 2)` columns from the left and at the top, then moved
 * down like `centerSilhouette` moves the pattern. Null when the shape does not exist, is not drawn for the level, is not
 * on the card, does not fit the grid or has a cell that is no crayon letter.
 */
export function shapeCrayonGrid(
  level: CopyDrawingLevel,
  shapeId: string,
  mirrored: boolean,
): (SymmetryColor | null)[][] | null {
  const shape = dictationShapesFor(level.dictationLevel, "wszystkie").find(
    (candidate) => candidate.id === shapeId && candidate.onCopyDrawing,
  );
  const drawing = shape?.byLevel[level.dictationLevel];
  if (drawing === undefined) {
    return null;
  }
  const { columns, rows } = level.size;
  const width = drawing[0].length;
  if (drawing.length > rows || width > columns || drawing.some((line) => line.length !== width)) {
    return null;
  }
  const offset = Math.floor((columns - width) / 2);
  const grid = Array.from({ length: rows }, () => new Array<SymmetryColor | null>(columns).fill(null));
  for (const [row, line] of drawing.entries()) {
    for (let col = 0; col < width; col += 1) {
      const letter = line.charAt(mirrored ? width - 1 - col : col);
      if (letter === ".") {
        continue;
      }
      const color = symmetryColorOfLetter(letter);
      if (color === undefined) {
        return null;
      }
      grid[row][offset + col] = color;
    }
  }
  const shift = silhouetteRowShift(grid.map((line) => line.map((color) => color !== null)));
  return Array.from({ length: rows }, (_, row) => {
    const source = grid[row - shift] as (SymmetryColor | null)[] | undefined;
    return source === undefined ? new Array<SymmetryColor | null>(columns).fill(null) : [...source];
  });
}

/** The pattern a card of this level and picture must have, or null when the template, a variant or the shape does not exist. */
export function expectedPattern(level: CopyDrawingLevel, picture: CopyDrawingPicture): boolean[][] | null {
  if (picture.kind === "shape") {
    const grid = shapeCrayonGrid(level, picture.shapeId, picture.mirrored);
    return grid === null ? null : grid.map((row) => row.map((color) => color !== null));
  }
  const template = symmetryTemplatesFor(level.size.templateLevel, "wszystkie").find(
    (candidate) => candidate.id === picture.templateId,
  );
  if (template === undefined) {
    return null;
  }
  try {
    return centerSilhouette(nonogramImage(template, picture.variants, level.size));
  } catch {
    return null;
  }
}

/**
 * The rules for a copy-drawing card at the level on the bar. An empty list means the card may be shown: the grid is the
 * level's grid, the pattern is neither empty nor full, and it is exactly the centered silhouette of the template and
 * variants, or of the shape and flip, the card names.
 */
export function copyDrawingProblems(card: CopyDrawingCard, level: CopyDrawingLevel): readonly CopyDrawingProblem[] {
  const problems = new Set<CopyDrawingProblem>();
  const { columns, rows } = level.size;
  if (card.levelId !== level.id) {
    problems.add("level-mismatch");
  }
  if (card.pattern.length !== rows || card.pattern.some((row) => row.length !== columns)) {
    problems.add("grid-size");
  }
  const cells = card.pattern.flat();
  if (!cells.some(Boolean)) {
    problems.add("no-filled-cell");
  }
  if (cells.every(Boolean)) {
    problems.add("no-empty-cell");
  }
  // The silhouette is rebuilt with the level of the card; a card of another level is already a level mismatch.
  if (card.levelId === level.id) {
    const expected = expectedPattern(level, card.picture);
    if (expected === null || JSON.stringify(expected) !== JSON.stringify(card.pattern)) {
      problems.add("not-silhouette");
    }
  }
  return [...problems];
}
