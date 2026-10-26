import {
  DEFAULT_OBJECT_CATEGORY_ID,
  symmetryTemplatesFor,
  type ObjectCategoryChoiceId,
  type SymmetryTemplate,
} from "../symmetry/templates.ts";
import { nonogramClues, nonogramImage, type NonogramClues } from "./clues.ts";
import type { NonogramSize, NonogramSizeId } from "./sizes.ts";
import { composeSimpleNonogramCard, simpleNonogramProblems, type SimpleNonogramCard } from "./simple.ts";
import { solveNonogram } from "./solve.ts";

export interface NonogramCard {
  kind: "liczby";
  sizeId: NonogramSizeId;
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  /** The one answer: the silhouette, rows by columns, holes empty. */
  solution: boolean[][];
  clues: NonogramClues;
  /** Names the size, the template, and the variant of every part, so two cards with one key look the same. Not shown to the child. */
  key: string;
}

export type NonogramProblem = "no-filled-cell" | "clue-mismatch" | "not-line-solvable" | "solution-mismatch";

export interface NonogramVariant {
  template: SymmetryTemplate;
  /** One variant index per part of the template. */
  variants: number[];
}

/** Draws again at most this many times before giving up, so a single possible card cannot loop forever. */
const MAX_ATTEMPTS = 20;

/** A valid card of the level whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. */
export function generateNonogramCard(
  random: () => number,
  previousKey: string | null,
  size: NonogramSize,
  category: ObjectCategoryChoiceId = DEFAULT_OBJECT_CATEGORY_ID,
): NonogramCard | SimpleNonogramCard | null {
  const templates = symmetryTemplatesFor(size.templateLevel, category);
  if (templates.length === 0) {
    return null;
  }
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const template = templates[pick(random, templates.length)];
    const variants = template.parts.map((part) => pick(random, part.variants.length));
    if (size.kind === "znaczki") {
      const simple = composeSimpleNonogramCard(template, variants, size);
      if (simple.key !== previousKey && simpleNonogramProblems(simple).length === 0) {
        return simple;
      }
      continue;
    }
    const card = composeNonogramCard(template, variants, size);
    if (card.key !== previousKey && nonogramCardProblems(card).length === 0) {
      return card;
    }
  }
  return null;
}

/** Builds the card for one template and one variant index per part. Does not validate. */
export function composeNonogramCard(
  template: SymmetryTemplate,
  variants: readonly number[],
  size: NonogramSize,
): NonogramCard {
  const solution = nonogramImage(template, variants, size);
  return {
    kind: "liczby",
    sizeId: size.id,
    columns: size.columns,
    rows: size.rows,
    cellSize: size.cellSize,
    solution,
    clues: nonogramClues(solution),
    key: `${size.id}:${template.id}:${variants.join("-")}`,
  };
}

/**
 * The rules for a nonogram card. An empty list means the card may be shown: the clues belong to the solution, and line
 * propagation alone, with no guessing, rebuilds exactly that solution.
 */
export function nonogramCardProblems(card: NonogramCard): readonly NonogramProblem[] {
  const problems = new Set<NonogramProblem>();
  if (!card.solution.some((row) => row.some(Boolean))) {
    problems.add("no-filled-cell");
  }
  if (JSON.stringify(nonogramClues(card.solution)) !== JSON.stringify(card.clues)) {
    problems.add("clue-mismatch");
  }

  const solved = solveNonogram(card.clues, card.columns, card.rows);
  if (solved.status !== "solved") {
    problems.add("not-line-solvable");
  } else if (JSON.stringify(solved.image) !== JSON.stringify(card.solution)) {
    problems.add("solution-mismatch");
  }
  return [...problems];
}

/** Every template of the size (in the category) with every combination of part variants. */
export function nonogramVariants(
  size: NonogramSize,
  category: ObjectCategoryChoiceId = DEFAULT_OBJECT_CATEGORY_ID,
): NonogramVariant[] {
  return symmetryTemplatesFor(size.templateLevel, category).flatMap((template) => {
    let sets: number[][] = [[]];
    for (const part of template.parts) {
      sets = sets.flatMap((set) => part.variants.map((_, index) => [...set, index]));
    }
    return sets.map((variants) => ({ template, variants }));
  });
}

function pick(random: () => number, count: number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}
