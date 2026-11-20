import { lastNumber, type NumberMazeLevel } from "./levels.ts";

/** A "Labirynt liczbowy" card: a number in every cell, and the one path from the start to the goal. */
export interface NumberMazeCard {
  levelId: NumberMazeLevel["id"];
  /** One number per cell, row by row from the top left; cell index = row * cols + col. */
  values: number[];
  /** Cell indexes of the path from the start (top left) to the goal (bottom right). */
  path: number[];
}

export type NumberMazeProblemCode =
  | "settings-mismatch"
  | "wrong-grid-size"
  | "start-not-first"
  | "goal-not-last"
  | "path-wrong-length"
  | "path-wrong-ends"
  | "path-not-adjacent"
  | "path-revisits"
  | "path-values-wrong"
  | "ambiguous-next"
  | "trap-out-of-range"
  | "trap-repeats-endpoint";

/** The cells next to `cell` across an edge (no diagonals). */
export function neighbours(cell: number, cols: number, rows: number): number[] {
  const row = Math.floor(cell / cols);
  const col = cell % cols;
  const out: number[] = [];
  if (row > 0) out.push(cell - cols);
  if (row < rows - 1) out.push(cell + cols);
  if (col > 0) out.push(cell - 1);
  if (col < cols - 1) out.push(cell + 1);
  return out;
}

/** What makes two cards the same card: the numbers in the grid. */
export function numberMazeCardKey(card: NumberMazeCard): string {
  return `${card.levelId}|${card.values.join(",")}`;
}

/** The i-th number of the path (0 = start). */
function nth(level: NumberMazeLevel, index: number): number {
  return level.first + level.step * index;
}

/**
 * Follows the numbers from the start, looking only at `values`: on every step exactly one neighbour must hold the
 * next number. True when the walk reaches the last number on the goal.
 */
function walksOnce(values: readonly number[], level: NumberMazeLevel): boolean {
  const goal = level.cols * level.rows - 1;
  let current = 0;
  for (let index = 1; index < level.count; index += 1) {
    const next = neighbours(current, level.cols, level.rows).filter((cell) => values[cell] === nth(level, index));
    if (next.length !== 1) return false;
    current = next[0];
  }
  return current === goal;
}

/** Empty list = a legal card: one path, start and goal right, traps in range. */
export function numberMazeCardProblems(card: NumberMazeCard, level: NumberMazeLevel): NumberMazeProblemCode[] {
  const problems: NumberMazeProblemCode[] = [];
  if (card.levelId !== level.id) problems.push("settings-mismatch");
  const size = level.cols * level.rows;
  if (card.values.length !== size) {
    problems.push("wrong-grid-size");
    return problems;
  }
  const goal = size - 1;
  const last = lastNumber(level);
  if (card.values[0] !== level.first) problems.push("start-not-first");
  if (card.values[goal] !== last) problems.push("goal-not-last");

  const { path } = card;
  if (path.length !== level.count) problems.push("path-wrong-length");
  if (path[0] !== 0 || path.at(-1) !== goal) problems.push("path-wrong-ends");
  for (let index = 1; index < path.length; index += 1) {
    if (!neighbours(path[index - 1], level.cols, level.rows).includes(path[index])) {
      problems.push("path-not-adjacent");
      break;
    }
  }
  if (new Set(path).size !== path.length || path.some((cell) => cell < 0 || cell >= size))
    problems.push("path-revisits");
  if (path.some((cell, index) => card.values[cell] !== nth(level, index))) problems.push("path-values-wrong");
  if (!walksOnce(card.values, level)) problems.push("ambiguous-next");

  const onPath = new Set(path);
  const traps = card.values.filter((_, cell) => !onPath.has(cell));
  if (traps.some((value) => value < level.first || value > last || (value - level.first) % level.step !== 0)) {
    problems.push("trap-out-of-range");
  }
  if (traps.some((value) => value === level.first || value === last)) problems.push("trap-repeats-endpoint");
  return [...new Set(problems)];
}
