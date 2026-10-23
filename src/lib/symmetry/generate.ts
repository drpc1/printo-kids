import { SYMMETRY_COLORS, SYMMETRY_TEMPLATES, type SymmetryCell, type SymmetryTemplate } from "./templates.ts";

export type SymmetryAxis = "vertical";

/** The one fixed setting of S-12, the "5 lat" row of the PRD. Levels arrive in S-13. */
export const SYMMETRY_SETTING = { columns: 12, rows: 16, cellSize: 15, axis: "vertical" } as const;

export interface SymmetryCard {
  columns: number;
  rows: number;
  axis: SymmetryAxis;
  /** Only the half with the pattern (columns 0..columns / 2 - 1). The other half is left for the child. */
  cells: readonly SymmetryCell[];
  /** Names the template, the variant of every part, and the row offset, so two cards with one key look the same. */
  key: string;
}

export type SymmetryProblem =
  | "no-filled-cell"
  | "no-empty-cell"
  | "outside-pattern-half"
  | "outside-grid"
  | "duplicate-cell"
  | "unknown-color"
  | "not-touching-axis";

/** Draws again at most this many times before giving up, so a single possible card cannot loop forever. */
const MAX_ATTEMPTS = 20;

/**
 * A valid card whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. The key includes the row offset,
 * so the same picture one row lower counts as a new card (plan: parts plus vertical shift are the variants).
 */
export function generateSymmetryCard(random: () => number, previousKey: string | null): SymmetryCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const template = SYMMETRY_TEMPLATES[pick(random, SYMMETRY_TEMPLATES.length)];
    const variants = template.parts.map((part) => pick(random, part.variants.length));
    const rowOffset = pick(random, symmetryRowOffsets(template));
    const card = composeSymmetryCard(template, variants, rowOffset);
    if (card.key !== previousKey && symmetryCardProblems(card).length === 0) {
      return card;
    }
  }
  return null;
}

/**
 * How many vertical positions the template frame has on the grid of the fixed setting. Throws for a template taller
 * than the grid: that is a broken template, not a card that failed to come out.
 */
export function symmetryRowOffsets(template: SymmetryTemplate): number {
  if (template.height > SYMMETRY_SETTING.rows) {
    throw new Error(`Template ${template.id} is ${template.height} rows tall, the grid has ${SYMMETRY_SETTING.rows}`);
  }
  return SYMMETRY_SETTING.rows - template.height + 1;
}

/** Builds the card for one template, one variant index per part, and one row offset. Does not validate. */
export function composeSymmetryCard(
  template: SymmetryTemplate,
  variants: readonly number[],
  rowOffset: number,
): SymmetryCard {
  const frame: SymmetryCell[] = [...template.base];
  template.parts.forEach((part, index) => {
    const variant = part.variants[variants[index]] as readonly SymmetryCell[] | undefined;
    if (variant === undefined) {
      throw new Error(`Template ${template.id} has no variant ${variants[index]} of part ${part.id}`);
    }
    frame.push(...variant);
  });
  return {
    columns: SYMMETRY_SETTING.columns,
    rows: SYMMETRY_SETTING.rows,
    axis: SYMMETRY_SETTING.axis,
    cells: frame.map((cell) => ({ col: cell.col, row: cell.row + rowOffset, color: cell.color })),
    key: `${template.id}:${variants.join("-")}:${rowOffset}`,
  };
}

/** The PRD rules for a symmetry card. An empty list means the card may be shown. */
export function symmetryCardProblems(card: SymmetryCard): readonly SymmetryProblem[] {
  const problems = new Set<SymmetryProblem>();
  const lastPatternCol = Math.floor(card.columns / 2) - 1;
  const seen = new Set<string>();
  let inHalf = 0;
  let touchesAxis = false;

  if (card.cells.length === 0) {
    problems.add("no-filled-cell");
  }

  for (const cell of card.cells) {
    if (!(SYMMETRY_COLORS as readonly string[]).includes(cell.color)) {
      problems.add("unknown-color");
    }
    const place = `${cell.col},${cell.row}`;
    if (seen.has(place)) {
      problems.add("duplicate-cell");
      continue;
    }
    seen.add(place);
    if (
      !Number.isInteger(cell.col) ||
      !Number.isInteger(cell.row) ||
      cell.col < 0 ||
      cell.col >= card.columns ||
      cell.row < 0 ||
      cell.row >= card.rows
    ) {
      problems.add("outside-grid");
    } else if (cell.col > lastPatternCol) {
      // On an odd grid the middle column is the axis itself, so it also lands here.
      problems.add("outside-pattern-half");
    } else {
      inHalf += 1;
      if (cell.col === lastPatternCol) {
        touchesAxis = true;
      }
    }
  }

  if (inHalf >= (lastPatternCol + 1) * card.rows) {
    problems.add("no-empty-cell");
  }
  if (card.cells.length > 0 && !touchesAxis) {
    problems.add("not-touching-axis");
  }
  return [...problems];
}

/** The one answer: every pattern cell reflected in the vertical axis, same row and color. */
export function mirrorAnswer(card: SymmetryCard): readonly SymmetryCell[] {
  return card.cells.map((cell) => ({ col: card.columns - 1 - cell.col, row: cell.row, color: cell.color }));
}

function pick(random: () => number, count: number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}
