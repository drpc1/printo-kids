import { nonogramImage } from "../nonogram/clues.ts";
import { symmetryTemplatesFor } from "../symmetry/templates.ts";
import type { CopyDrawingLevel, CopyDrawingLevelId } from "./levels.ts";

export interface CopyDrawingCard {
  levelId: CopyDrawingLevelId;
  templateId: string;
  /** One variant index per part of the template. */
  variants: readonly number[];
  /** The silhouette, rows by columns. The left grid shows it, the right grid is empty; both have this grid. */
  pattern: readonly (readonly boolean[])[];
  /** Names the level, the template and the variant of every part, so two cards with one key look the same. Not shown to the child. */
  key: string;
}

export type CopyDrawingProblem = "grid-size" | "no-filled-cell" | "no-empty-cell" | "not-silhouette" | "level-mismatch";

/** The key of a card. The generator and `copyDrawingProblems` both read it here, so they count a repeat the same way. */
export function copyDrawingKey(levelId: CopyDrawingLevelId, templateId: string, variants: readonly number[]): string {
  return `${levelId}:${templateId}:${variants.join("-")}`;
}

/**
 * The silhouette moved so the empty rows above and below it differ by at most one. Its height runs from the first to
 * the last filled row, so empty rows inside it count. An empty image is returned as a copy. The one place that decides
 * where the picture stands in the grid: the generator and `copyDrawingProblems` both use it.
 */
export function centerSilhouette(image: readonly (readonly boolean[])[]): boolean[][] {
  const rows = image.length;
  const first = image.findIndex((row) => row.some(Boolean));
  if (first === -1) {
    return image.map((row) => [...row]);
  }
  let last = first;
  image.forEach((row, index) => {
    if (row.some(Boolean)) {
      last = index;
    }
  });
  const height = last - first + 1;
  const shift = Math.floor((rows - height) / 2) - first;
  const columns = image[0].length;
  return Array.from({ length: rows }, (_, row) => {
    const source = image[row - shift] as readonly boolean[] | undefined;
    return source === undefined ? new Array<boolean>(columns).fill(false) : [...source];
  });
}

/** The pattern a card of this level, template and variants must have, or null when the template or a variant does not exist. */
export function expectedPattern(
  level: CopyDrawingLevel,
  templateId: string,
  variants: readonly number[],
): boolean[][] | null {
  const template = symmetryTemplatesFor(level.size.templateLevel, "wszystkie").find(
    (candidate) => candidate.id === templateId,
  );
  if (template === undefined) {
    return null;
  }
  try {
    return centerSilhouette(nonogramImage(template, variants, level.size));
  } catch {
    return null;
  }
}

/**
 * The rules for a copy-drawing card at the level on the bar. An empty list means the card may be shown: the grid is the
 * level's grid, the pattern is neither empty nor full, and it is exactly the centered silhouette of the template and
 * variants the card names.
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
    const expected = expectedPattern(level, card.templateId, card.variants);
    if (expected === null || JSON.stringify(expected) !== JSON.stringify(card.pattern)) {
      problems.add("not-silhouette");
    }
  }
  return [...problems];
}
