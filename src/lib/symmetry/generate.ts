import { symmetryLevelById, type SymmetryLevel } from "./levels.ts";
import { SYMMETRY_COLORS, symmetryTemplatesFor, type SymmetryCell, type SymmetryTemplate } from "./templates.ts";

export type SymmetryAxis = "vertical";

export interface SymmetryCard {
  levelId: SymmetryLevel["id"];
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  axis: SymmetryAxis;
  /** Only the half with the pattern (columns 0..columns / 2 - 1). The other half is left for the child. */
  cells: readonly SymmetryCell[];
  /** Cells of the answer already filled in on the child's half. A subset of the mirror answer, never all of it. */
  hints: readonly SymmetryCell[];
  /** Holes of the silhouette on the pattern half (a window, an eye, a seed) in the template's hole color. Never on a filled cell. */
  details: readonly SymmetryCell[];
  /** Names the level, the template, the variant of every part, and the row offset, so two cards with one key look the same. */
  key: string;
}

export type SymmetryProblem =
  | "no-filled-cell"
  | "no-empty-cell"
  | "outside-pattern-half"
  | "outside-grid"
  | "duplicate-cell"
  | "unknown-color"
  | "detail-on-filled-cell"
  | "not-touching-axis"
  | "hint-not-in-answer"
  | "hints-reveal-all"
  | "hint-count-mismatch";

/** Draws again at most this many times before giving up, so a single possible card cannot loop forever. */
const MAX_ATTEMPTS = 20;

/**
 * A valid card of the level whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. The key includes the row offset, so the same picture one row lower counts as a new card.
 */
export function generateSymmetryCard(
  random: () => number,
  previousKey: string | null,
  level: SymmetryLevel,
): SymmetryCard | null {
  const templates = symmetryTemplatesFor(level.id);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const template = templates[pick(random, templates.length)];
    const variants = template.parts.map((part) => pick(random, part.variants.length));
    const rowOffset = pick(random, symmetryRowOffsets(template, level));
    const card = composeSymmetryCard(template, variants, rowOffset, level);
    if (card.key !== previousKey && symmetryCardProblems(card).length === 0) {
      return card;
    }
  }
  return null;
}

/**
 * How many vertical positions the template frame has on the grid of the level. Throws for a template taller or wider
 * than the half grid: that is a broken template, not a card that failed to come out.
 */
export function symmetryRowOffsets(template: SymmetryTemplate, level: SymmetryLevel): number {
  if (template.height > level.rows) {
    throw new Error(`Template ${template.id} is ${template.height} rows tall, the ${level.id} grid has ${level.rows}`);
  }
  if (template.width > level.columns / 2) {
    throw new Error(
      `Template ${template.id} is ${template.width} columns wide, the ${level.id} half grid has ${level.columns / 2}`,
    );
  }
  return level.rows - template.height + 1;
}

/** Builds the card for one template, one variant index per part, and one row offset. Does not validate. */
export function composeSymmetryCard(
  template: SymmetryTemplate,
  variants: readonly number[],
  rowOffset: number,
  level: SymmetryLevel,
): SymmetryCard {
  const frame: SymmetryCell[] = [...template.base];
  template.parts.forEach((part, index) => {
    const variant = part.variants[variants[index]] as readonly SymmetryCell[] | undefined;
    if (variant === undefined) {
      throw new Error(`Template ${template.id} has no variant ${variants[index]} of part ${part.id}`);
    }
    frame.push(...variant);
  });
  const half = level.columns / 2;
  const shift = half - template.width;
  const cells = frame.map((cell) => ({ col: cell.col + shift, row: cell.row + rowOffset, color: cell.color }));
  return {
    levelId: level.id,
    columns: level.columns,
    rows: level.rows,
    cellSize: level.cellSize,
    axis: "vertical",
    cells,
    hints: pickHints(cells, level),
    details: holeDetails(template, cells, level),
    key: `${level.id}:${template.id}:${variants.join("-")}:${rowOffset}`,
  };
}

/** The level's hint cells: mirrors of pattern cells on the axis column, spread evenly down the object. */
function pickHints(cells: readonly SymmetryCell[], level: SymmetryLevel): readonly SymmetryCell[] {
  if (level.hintCount === 0) {
    return [];
  }
  const half = level.columns / 2;
  const onAxis = cells.filter((cell) => cell.col === half - 1).sort((a, b) => a.row - b.row);
  const chosen = onAxis.length <= level.hintCount ? onAxis : spread(onAxis, level.hintCount);
  return chosen.map((cell) => ({ col: level.columns - 1 - cell.col, row: cell.row, color: cell.color }));
}

/** The holes in the template's hole color, or none when the template keeps its holes white. */
function holeDetails(
  template: SymmetryTemplate,
  cells: readonly SymmetryCell[],
  level: SymmetryLevel,
): readonly SymmetryCell[] {
  const { holeColor } = template;
  if (holeColor === null) {
    return [];
  }
  return findHoles(cells, level).map((cell) => ({ ...cell, color: holeColor }));
}

/**
 * Empty cells of the pattern half that the full silhouette (pattern and its mirror) closes in: flooding the grid from
 * outside, through empty cells only, never reaches them.
 */
function findHoles(cells: readonly SymmetryCell[], level: SymmetryLevel): readonly Pick<SymmetryCell, "col" | "row">[] {
  const { columns, rows } = level;
  const filled = new Set<number>();
  for (const cell of cells) {
    filled.add((cell.row + 1) * (columns + 2) + cell.col + 1);
    filled.add((cell.row + 1) * (columns + 2) + (columns - 1 - cell.col) + 1);
  }
  // The grid is padded by one empty ring, so the flood starts at its corner and reaches every open edge.
  const width = columns + 2;
  const reached = new Set<number>([0]);
  const queue = [0];
  for (let index = queue.pop(); index !== undefined; index = queue.pop()) {
    const col = index % width;
    const row = Math.floor(index / width);
    for (const [nextCol, nextRow] of [
      [col - 1, row],
      [col + 1, row],
      [col, row - 1],
      [col, row + 1],
    ]) {
      const next = nextRow * width + nextCol;
      const inPaddedGrid = nextCol >= 0 && nextCol < width && nextRow >= 0 && nextRow < rows + 2;
      if (inPaddedGrid && !filled.has(next) && !reached.has(next)) {
        reached.add(next);
        queue.push(next);
      }
    }
  }
  const holes: Pick<SymmetryCell, "col" | "row">[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns / 2; col += 1) {
      const index = (row + 1) * width + col + 1;
      if (!filled.has(index) && !reached.has(index)) {
        holes.push({ col, row });
      }
    }
  }
  return holes;
}

function spread<T>(items: readonly T[], count: number): T[] {
  return Array.from({ length: count }, (_, index) => items[Math.floor(((index + 0.5) * items.length) / count)]);
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

  const filledPlaces = new Set(card.cells.map((cell) => `${cell.col},${cell.row}`));
  const detailPlaces = new Set<string>();
  for (const detail of card.details) {
    if (!(SYMMETRY_COLORS as readonly string[]).includes(detail.color)) {
      problems.add("unknown-color");
    }
    const place = `${detail.col},${detail.row}`;
    if (detailPlaces.has(place)) {
      problems.add("duplicate-cell");
    }
    detailPlaces.add(place);
    if (
      !Number.isInteger(detail.col) ||
      !Number.isInteger(detail.row) ||
      detail.col < 0 ||
      detail.col >= card.columns ||
      detail.row < 0 ||
      detail.row >= card.rows
    ) {
      problems.add("outside-grid");
    } else if (detail.col > lastPatternCol) {
      problems.add("outside-pattern-half");
    } else if (filledPlaces.has(place)) {
      problems.add("detail-on-filled-cell");
    }
  }

  const answer = new Set(mirrorAnswer(card).map((cell) => `${cell.col},${cell.row},${cell.color}`));
  const hinted = new Set<string>();
  for (const hint of card.hints) {
    const place = `${hint.col},${hint.row},${hint.color}`;
    if (!answer.has(place)) {
      problems.add("hint-not-in-answer");
    }
    hinted.add(place);
  }
  if (card.hints.length !== symmetryLevelById(card.levelId).hintCount || hinted.size !== card.hints.length) {
    problems.add("hint-count-mismatch");
  }
  if (card.cells.length > 0 && hinted.size >= answer.size) {
    problems.add("hints-reveal-all");
  }
  return [...problems];
}

/** The one answer: every pattern cell reflected in the vertical axis, same row and color. */
export function mirrorAnswer(card: SymmetryCard): readonly SymmetryCell[] {
  return card.cells.map((cell) => ({ col: card.columns - 1 - cell.col, row: cell.row, color: cell.color }));
}

/** The answer with its details: pattern cells and holes, both reflected, same row and color. */
export function mirrorAnswerWithDetails(card: SymmetryCard): readonly SymmetryCell[] {
  return [...card.cells, ...card.details].map((cell) => ({
    col: card.columns - 1 - cell.col,
    row: cell.row,
    color: cell.color,
  }));
}

function pick(random: () => number, count: number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}
