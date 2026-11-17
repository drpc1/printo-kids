import {
  EQUATION_TOLERANCE,
  mathCrosswordLevelById,
  type MathCrosswordLevel,
  type MathCrosswordLevelId,
  type MathOp,
} from "./levels.ts";

export type { MathOp };

/** An equation lies on five cells: number, sign, number, "=", number. */
export const EQUATION_LENGTH = 5;

export type EquationDirection = "right" | "down";

/** "a op b = c" laid on five cells from `row`, `col`; `a`, `b` and `c` are ids of number cells (indexes into `values`). */
export interface Equation {
  a: number;
  op: MathOp;
  b: number;
  c: number;
  row: number;
  col: number;
  dir: EquationDirection;
}

export type MathCell =
  | { row: number; col: number; kind: "num"; id: number }
  | { row: number; col: number; kind: "op"; op: MathOp }
  | { row: number; col: number; kind: "eq" };

export interface MathCrosswordCard {
  level: MathCrosswordLevelId;
  /** Every cell that is drawn, one per position, rows and columns counted from 0. */
  cells: readonly MathCell[];
  equations: readonly Equation[];
  /** The value of every number cell, by id. */
  values: readonly number[];
  /** Ids of the number cells left empty for the child, ascending. */
  blanks: readonly number[];
}

export type MathCrosswordProblem =
  | "false-equation"
  | "number-out-of-range"
  | "op-not-allowed"
  | "cells-touch"
  | "needs-guessing"
  | "chain-too-long"
  | "too-many-blanks-in-equation"
  | "too-few-equations"
  | "no-blanks";

/** The result of `a op b`, or NaN where the sign has none (a division with a remainder, or by zero). */
export function compute(a: number, op: MathOp, b: number): number {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "·") return a * b;
  return b !== 0 && a % b === 0 ? a / b : Number.NaN;
}

/** The cell positions of an equation, in the order number, sign, number, "=", number. */
export function equationPositions(equation: Equation): { row: number; col: number }[] {
  return Array.from({ length: EQUATION_LENGTH }, (_, i) => ({
    row: equation.row + (equation.dir === "down" ? i : 0),
    col: equation.col + (equation.dir === "right" ? i : 0),
  }));
}

/**
 * The key of a card: the level, the shape of the crossword (equations and their places), the numbers and which are empty.
 * The generator and the engine use this one function, so a repeat means the same on both sides.
 */
export function mathCrosswordKey(card: MathCrosswordCard): string {
  const shape = card.equations
    .map((e) => `${e.row},${e.col}${e.dir === "right" ? "r" : "d"}${e.op}${e.a}.${e.b}.${e.c}`)
    .join(";");
  return `${card.level}:${shape}:${card.values.join(",")}:${card.blanks.join(",")}`;
}

/**
 * How many rounds the child needs to reach every empty number using only equations with one number missing: 1 when each
 * comes straight from numbers on the sheet, N when the last one needs a number worked out in round N-1. 0 when nothing is
 * empty, and null when a number cannot be reached that way (the child would have to guess). `max` is the level's greatest
 * number: the child tries 1..max for the missing one, and only a single fit counts.
 */
export function chainDepth(
  card: MathCrosswordCard,
  max: number = mathCrosswordLevelById(card.level).max,
): number | null {
  // 0 marks a number the child has not reached yet: a legal number is 1 or more.
  const known = card.values.map((value, id) => (card.blanks.includes(id) ? 0 : value));
  let rounds = 0;
  for (;;) {
    const found: [number, number][] = [];
    for (const e of card.equations) {
      const unknown = [e.a, e.b, e.c].filter((id) => known[id] === 0);
      if (unknown.length !== 1) continue;
      const target = unknown[0];
      const fits: number[] = [];
      for (let value = 1; value <= max; value += 1) {
        known[target] = value;
        if (compute(known[e.a], e.op, known[e.b]) === known[e.c]) fits.push(value);
      }
      known[target] = 0;
      if (fits.length === 1) found.push([target, fits[0]]);
    }
    if (found.length === 0) break;
    for (const [id, value] of found) known[id] = value;
    rounds += 1;
  }
  return known.every((value, id) => value === card.values[id]) ? rounds : null;
}

const posKey = (row: number, col: number): string => `${row},${col}`;

/**
 * True when the drawn cells are exactly what the equations lay down and nothing touches by side outside a crossing: every
 * equation has five cells in line with its numbers at the numbers' places, two equations share a cell only as a crossing of
 * a right and a down one at a number cell, the cell before and after every equation is empty, and any two cells that touch
 * by side belong to one equation.
 */
function geometryIsSound(card: MathCrosswordCard): boolean {
  const byPosition = new Map<string, MathCell>();
  for (const cell of card.cells) {
    const key = posKey(cell.row, cell.col);
    if (byPosition.has(key)) return false;
    byPosition.set(key, cell);
  }
  const owners = new Map<string, number[]>();
  for (const [index, equation] of card.equations.entries()) {
    const positions = equationPositions(equation);
    const expected: MathCell["kind"][] = ["num", "op", "num", "eq", "num"];
    const numberIds = [equation.a, equation.b, equation.c];
    for (const [slot, { row, col }] of positions.entries()) {
      const cell = byPosition.get(posKey(row, col));
      if (cell?.kind !== expected[slot]) return false;
      if (cell.kind === "num" && cell.id !== numberIds[slot / 2]) return false;
      if (cell.kind === "op" && cell.op !== equation.op) return false;
      owners.set(posKey(row, col), [...(owners.get(posKey(row, col)) ?? []), index]);
    }
    const first = positions[0];
    const last = positions[EQUATION_LENGTH - 1];
    const stepRow = equation.dir === "down" ? 1 : 0;
    const stepCol = equation.dir === "right" ? 1 : 0;
    if (byPosition.has(posKey(first.row - stepRow, first.col - stepCol))) return false;
    if (byPosition.has(posKey(last.row + stepRow, last.col + stepCol))) return false;
  }
  for (const [key, cell] of byPosition) {
    const list = owners.get(key);
    if (list === undefined || list.length > 2) return false;
    if (list.length === 2 && (cell.kind !== "num" || card.equations[list[0]].dir === card.equations[list[1]].dir)) {
      return false;
    }
  }
  for (const cell of card.cells) {
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
    ] as const) {
      const next = posKey(cell.row + dr, cell.col + dc);
      if (!byPosition.has(next)) continue;
      const mine = owners.get(posKey(cell.row, cell.col)) ?? [];
      const theirs = owners.get(next) ?? [];
      if (!mine.some((index) => theirs.includes(index))) return false;
    }
  }
  return true;
}

/** True when the sign is a legal one for the level and its numbers sit in the times table (or the table's division). */
function opAllowed(equation: Equation, values: readonly number[], level: MathCrosswordLevel): boolean {
  if (!level.ops.includes(equation.op)) return false;
  const a = values[equation.a];
  const b = values[equation.b];
  const c = values[equation.c];
  if (equation.op === "·") {
    return a >= 2 && a <= 10 && b >= 2 && b <= 10;
  }
  if (equation.op === ":") {
    return b >= 2 && b <= 10 && c >= 2 && c <= 10 && a !== b && a % b === 0;
  }
  return true;
}

/**
 * The rules for a card at the level on the bar. An empty list means the card may be shown: true equations with numbers
 * from 1 to the level's greatest, signs of the level (and the times table for · and :), cells that touch only at
 * crossings, every empty number reachable without guessing inside the level's chain, no more empty numbers in one
 * equation than the level allows, at least one empty number and not fewer equations than the level aims at less
 * `EQUATION_TOLERANCE`. `cells-touch` stands for every defect of the grid: a cell off its equation, an overlap, two
 * neighbours that are not one equation.
 */
export function mathCrosswordProblems(
  card: MathCrosswordCard,
  level: MathCrosswordLevel,
): readonly MathCrosswordProblem[] {
  const problems = new Set<MathCrosswordProblem>();
  const { values, equations, blanks } = card;
  const outOfRange = values.some((value) => !Number.isInteger(value) || value < 1 || value > level.max);
  if (outOfRange) problems.add("number-out-of-range");
  const wired = equations.every((e) =>
    [e.a, e.b, e.c].every((id) => Number.isInteger(id) && id >= 0 && id < values.length),
  );
  const truth = wired && equations.every((e) => compute(values[e.a], e.op, values[e.b]) === values[e.c]);
  if (!truth) problems.add("false-equation");
  if (wired && equations.some((e) => !opAllowed(e, values, level))) problems.add("op-not-allowed");
  if (!geometryIsSound(card)) problems.add("cells-touch");
  if (wired) {
    const perEquation = equations.map((e) => [e.a, e.b, e.c].filter((id) => blanks.includes(id)).length);
    if (perEquation.some((count) => count > level.maxBlanksPerEquation)) problems.add("too-many-blanks-in-equation");
  }
  if (equations.length < level.equations - EQUATION_TOLERANCE) problems.add("too-few-equations");
  if (blanks.length === 0) problems.add("no-blanks");
  // The chain is only asked of a card whose numbers are true and in range: otherwise it would repeat the codes above.
  if (truth && !outOfRange && blanks.every((id) => Number.isInteger(id) && id >= 0 && id < values.length)) {
    const depth = chainDepth(card, level.max);
    if (depth === null) problems.add("needs-guessing");
    else if (depth > level.maxChain) problems.add("chain-too-long");
  }
  return [...problems];
}
