import { codingLevelById, codingModeById, type CodingLevelId, type CodingModeId } from "./levels.ts";
import { cellKey, isFree, shortestPaths, step, type Cell, type Dir } from "./search.ts";

export type { Cell, Dir };

/** The pictures of a Wykonaj card: the child circles the one where the arrows end. */
export type TargetKind = "star" | "heart" | "circle";
export const TARGET_KINDS: readonly TargetKind[] = ["star", "heart", "circle"];

export interface CodingTarget {
  kind: TargetKind;
  cell: Cell;
  /** True for the one picture at the end of the path. */
  isGoal: boolean;
}

export interface CodingCard {
  level: CodingLevelId;
  mode: CodingModeId;
  /** `blocked[row][column]`: grey obstacles. */
  blocked: readonly (readonly boolean[])[];
  start: Cell;
  /** The flag (Zapisz) or the picture where the path ends (Wykonaj). */
  goal: Cell;
  /** The answer: Zapisz, the only shortest path; Wykonaj, the path the arrows show. */
  path: readonly Dir[];
  /** Wykonaj: three pictures; Zapisz: none. */
  targets: readonly CodingTarget[];
}

/** What a card must be made for: the settings that lay it out. */
export interface CodingCardTarget {
  level: CodingLevelId;
  mode: CodingModeId;
}

export type CodingProblem =
  | "settings-mismatch"
  | "wrong-grid-size"
  | "start-or-goal-blocked"
  | "path-leaves-grid-or-hits-obstacle"
  | "path-revisits-cell"
  | "path-length-not-in-level"
  | "too-few-turns"
  | "path-not-ending-at-goal"
  | "too-many-answers"
  | "shortest-path-not-unique"
  | "path-not-shortest"
  | "wrong-target-count"
  | "distractor-on-path"
  | "distractor-too-far";

/** A distractor picture lies at most this many cells (Manhattan) from the end of the path. */
export const MAX_DISTRACTOR_DISTANCE = 3;

/** Consecutive steps in one direction as one command: "RRRU" gives [[3, "R"], [1, "U"]]. */
export function groupSteps(path: readonly Dir[]): [number, Dir][] {
  const out: [number, Dir][] = [];
  for (const dir of path) {
    const last = out.at(-1);
    if (last?.[1] === dir) last[0] += 1;
    else out.push([1, dir]);
  }
  return out;
}

/** How many times the path changes direction. */
export function turnCount(path: readonly Dir[]): number {
  return path.filter((dir, i) => i > 0 && dir !== path[i - 1]).length;
}

/** The cells of the path from the start, the start included; may leave the grid when the path is wrong. */
export function walk(card: Pick<CodingCard, "start" | "path">): Cell[] {
  const cells: Cell[] = [card.start];
  for (const dir of card.path) cells.push(step(cells[cells.length - 1], dir));
  return cells;
}

/** One key for "a new card on every Generuj": the same grid, start, path and pictures give the same key. */
export function codingKey(card: CodingCard): string {
  const grid = card.blocked.map((row) => row.map((blocked) => (blocked ? "1" : "0")).join("")).join("/");
  const targets = card.targets.map((t) => `${t.kind}${t.isGoal ? "!" : ""}@${cellKey(t.cell)}`).join(";");
  return `${card.level}|${card.mode}|${grid}|${cellKey(card.start)}|${card.path.join("")}|${targets}`;
}

const manhattan = (a: Cell, b: Cell): number => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

/** Codes of every rule the card breaks for `target`; empty for a legal card. */
export function codingProblems(card: CodingCard, target: CodingCardTarget): CodingProblem[] {
  const problems: CodingProblem[] = [];
  if (card.level !== target.level || card.mode !== target.mode) problems.push("settings-mismatch");
  const level = codingLevelById(card.level);
  codingModeById(card.mode);

  if (card.blocked.length !== level.rows || card.blocked.some((row) => row.length !== level.cols)) {
    problems.push("wrong-grid-size");
    return problems;
  }
  if (!isFree(card.blocked, card.start) || !isFree(card.blocked, card.goal)) {
    problems.push("start-or-goal-blocked");
    return problems;
  }

  const cells = walk(card);
  if (cells.some((cell) => !isFree(card.blocked, cell))) {
    problems.push("path-leaves-grid-or-hits-obstacle");
    return problems;
  }
  if (new Set(cells.map(cellKey)).size !== cells.length) problems.push("path-revisits-cell");
  if (card.path.length < level.pathMin || card.path.length > level.pathMax) problems.push("path-length-not-in-level");
  if (turnCount(card.path) < level.turnsMin) problems.push("too-few-turns");
  if (cellKey(cells[cells.length - 1]) !== cellKey(card.goal)) problems.push("path-not-ending-at-goal");
  const answers = level.grouped ? groupSteps(card.path).length : card.path.length;
  if (answers > level.maxAnswers) problems.push("too-many-answers");

  if (card.mode === "zapisz") {
    const { dist, count } = shortestPaths(card.blocked, card.start);
    if (count[card.goal[1]][card.goal[0]] !== 1) problems.push("shortest-path-not-unique");
    if (dist[card.goal[1]][card.goal[0]] !== card.path.length) problems.push("path-not-shortest");
    if (card.targets.length !== 0) problems.push("wrong-target-count");
    return problems;
  }

  const onPath = new Set(cells.map(cellKey));
  const goals = card.targets.filter((t) => t.isGoal);
  const distinctKinds = new Set(card.targets.map((t) => t.kind)).size === card.targets.length;
  const distinctCells = new Set(card.targets.map((t) => cellKey(t.cell))).size === card.targets.length;
  if (
    card.targets.length !== 3 ||
    goals.length !== 1 ||
    !distinctKinds ||
    !distinctCells ||
    cellKey(goals[0].cell) !== cellKey(card.goal) ||
    card.targets.some((t) => !isFree(card.blocked, t.cell))
  ) {
    problems.push("wrong-target-count");
  }
  const distractors = card.targets.filter((t) => !t.isGoal);
  if (distractors.some((t) => onPath.has(cellKey(t.cell)))) problems.push("distractor-on-path");
  if (distractors.some((t) => manhattan(t.cell, card.goal) > MAX_DISTRACTOR_DISTANCE)) {
    problems.push("distractor-too-far");
  }
  return problems;
}
