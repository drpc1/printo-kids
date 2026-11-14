import {
  compute,
  EQUATION_LENGTH,
  equationPositions,
  mathCrosswordKey,
  mathCrosswordProblems,
  chainDepth,
  type Equation,
  type EquationDirection,
  type MathCell,
  type MathCrosswordCard,
  type MathOp,
} from "./card.ts";
import { EQUATION_TOLERANCE, type MathCrosswordLevel } from "./levels.ts";

/** Draws again at most this many times before giving up, so a level that cannot be laid out cannot loop forever. */
export const MAX_ATTEMPTS = 20;

/** How many crossword shapes are laid out per attempt; the one with the most equations (then the fullest) is kept. */
const LAYOUT_TRIES = 60;
/** How many times the numbers are drawn for one shape before the shape is given up. */
const FILL_TRIES = 5;
/** Steps of the backtracking that writes the numbers; past it the shape is given up. */
const FILL_BUDGET = 800;
/** How many shuffles of the numbers are tried when choosing the empty ones; the one with the most empty wins. */
const BLANK_TRIES = 8;
/** An equation with nothing written yet draws this many random pairs instead of listing every one. */
const FREE_SAMPLES = 80;
/** How many numbers for one equation the backtracking tries before it steps back. */
const FILL_OPTIONS = 12;

/** A shuffled copy (Fisher-Yates); `random` is the only source of chance. */
export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface Layout {
  cells: MathCell[];
  /** `a`, `b`, `c` are number cell ids; the values come later. */
  equations: Equation[];
  numbers: number;
  rows: number;
  cols: number;
}

const positionKey = (row: number, col: number): string => `${row},${col}`;

/** Lays equations one after another, each crossing the ones already standing at one or two number cells. */
function layOut(level: MathCrosswordLevel, random: () => number): Layout {
  const cells = new Map<string, MathCell>();
  // The directions an equation already runs through a number cell.
  const through = new Map<string, Set<EquationDirection>>();
  const equations: Equation[] = [];
  let numbers = 0;
  let box = { top: 0, bottom: 0, left: 0, right: 0 };

  const place = (row: number, col: number, dir: EquationDirection): void => {
    const op = level.ops[Math.floor(random() * level.ops.length)];
    const ids: number[] = [];
    for (const [slot, at] of equationPositions({ a: 0, op, b: 0, c: 0, row, col, dir }).entries()) {
      const key = positionKey(at.row, at.col);
      if (slot % 2 === 0) {
        const existing = cells.get(key);
        if (existing?.kind === "num") {
          through.get(key)?.add(dir);
          ids.push(existing.id);
        } else {
          cells.set(key, { row: at.row, col: at.col, kind: "num", id: numbers });
          through.set(key, new Set([dir]));
          ids.push(numbers);
          numbers += 1;
        }
      } else {
        cells.set(
          key,
          slot === 1 ? { row: at.row, col: at.col, kind: "op", op } : { row: at.row, col: at.col, kind: "eq" },
        );
      }
      box = {
        top: Math.min(box.top, at.row),
        bottom: Math.max(box.bottom, at.row),
        left: Math.min(box.left, at.col),
        right: Math.max(box.right, at.col),
      };
    }
    equations.push({ a: ids[0], op, b: ids[1], c: ids[2], row, col, dir });
  };

  const fits = (row: number, col: number, dir: EquationDirection): boolean => {
    const stepRow = dir === "down" ? 1 : 0;
    const stepCol = dir === "right" ? 1 : 0;
    if (
      cells.has(positionKey(row - stepRow, col - stepCol)) ||
      cells.has(positionKey(row + EQUATION_LENGTH * stepRow, col + EQUATION_LENGTH * stepCol))
    ) {
      return false;
    }
    let crossings = 0;
    let next = { ...box };
    for (let i = 0; i < EQUATION_LENGTH; i += 1) {
      const r = row + i * stepRow;
      const c = col + i * stepCol;
      const existing = cells.get(positionKey(r, c));
      if (existing !== undefined) {
        if (i % 2 !== 0 || existing.kind !== "num" || through.get(positionKey(r, c))?.has(dir) === true) return false;
        crossings += 1;
      } else if (cells.has(positionKey(r + stepCol, c + stepRow)) || cells.has(positionKey(r - stepCol, c - stepRow))) {
        return false;
      }
      next = {
        top: Math.min(next.top, r),
        bottom: Math.max(next.bottom, r),
        left: Math.min(next.left, c),
        right: Math.max(next.right, c),
      };
    }
    if (next.bottom - next.top + 1 > level.rows || next.right - next.left + 1 > level.cols) return false;
    return crossings >= 1 && crossings <= 2;
  };

  place(0, 0, "right");
  for (let step = 0; step < 200 && equations.length < level.equations; step += 1) {
    const options: [number, number, EquationDirection][] = [];
    for (const cell of cells.values()) {
      const directions = through.get(positionKey(cell.row, cell.col));
      if (cell.kind !== "num" || directions === undefined || directions.size > 1) continue;
      const dir: EquationDirection = directions.has("right") ? "down" : "right";
      for (const offset of [0, 2, 4]) {
        const row = dir === "down" ? cell.row - offset : cell.row;
        const col = dir === "down" ? cell.col : cell.col - offset;
        if (fits(row, col, dir)) options.push([row, col, dir]);
      }
    }
    if (options.length === 0) break;
    // One of the few options that keep the page's proportions best, so the crossword is not a thin strip.
    const score = ([row, col, dir]: [number, number, EquationDirection]): number => {
      const height =
        Math.max(box.bottom, row + (dir === "down" ? EQUATION_LENGTH - 1 : 0)) - Math.min(box.top, row) + 1;
      const width =
        Math.max(box.right, col + (dir === "right" ? EQUATION_LENGTH - 1 : 0)) - Math.min(box.left, col) + 1;
      return Math.abs(height / level.rows - width / level.cols) + random() * 0.15;
    };
    const ranked = options.map((option) => ({ option, score: score(option) })).sort((x, y) => x.score - y.score);
    const pick = ranked[Math.floor(random() * Math.min(4, ranked.length))].option;
    place(pick[0], pick[1], pick[2]);
  }

  // Shift so the crossword starts at row 0, column 0.
  const shift = <T extends { row: number; col: number }>(item: T): T => ({
    ...item,
    row: item.row - box.top,
    col: item.col - box.left,
  });
  return {
    cells: [...cells.values()].map(shift),
    equations: equations.map(shift),
    numbers,
    rows: box.bottom - box.top + 1,
    cols: box.right - box.left + 1,
  };
}

/** The numbers an equation may take at the level: the times table for · and its division for :. */
function operandRange(op: MathOp, level: MathCrosswordLevel): { a: number; b: number } {
  if (op === "·") return { a: 10, b: 10 };
  if (op === ":") return { a: level.max, b: 10 };
  return { a: level.max, b: level.max };
}

/** The other operand when the result and one operand are known (NaN when there is none). */
function otherOperand(op: MathOp, known: number, result: number, knownIsFirst: boolean): number {
  if (op === "+") return result - known;
  if (op === "·") return result / known;
  if (op === "−") return knownIsFirst ? known - result : result + known;
  return knownIsFirst ? known / result : result * known;
}

/** The values a number may take: the fixed one, one worked out from the other two, or the whole range. */
function candidates(fixed: number | null, derived: number | null, low: number, high: number): number[] {
  if (fixed !== null) return [fixed];
  if (derived !== null) return Number.isInteger(derived) && derived >= low && derived <= high ? [derived] : [];
  return Array.from({ length: Math.max(0, high - low + 1) }, (_, i) => low + i);
}

/** One way to write an equation: its sign, the two numbers and the result. */
type Triple = [MathOp, number, number, number];

/** Adds a, b and their result when the equation is legal at the level and agrees with the fixed result. */
function pushIfLegal(
  triples: Triple[],
  a: number,
  b: number,
  level: MathCrosswordLevel,
  op: MathOp,
  fixedC: number | null,
): void {
  const c = compute(a, op, b);
  if (!(c >= 1 && c <= level.max)) return;
  if (fixedC !== null && fixedC !== c) return;
  // The times table: factors 2-10; its division: divisor and quotient 2-10, never the number itself.
  if (op === "·" && (a < 2 || a > 10 || b < 2 || b > 10)) return;
  if (op === ":" && (a === b || b < 2 || b > 10 || c < 2 || c > 10)) return;
  triples.push([op, a, b, c]);
}

/** Every sign, a, b, c that the level allows for an equation and that agrees with the numbers already written. */
function triplesFor(
  equation: Equation,
  values: readonly (number | null)[],
  level: MathCrosswordLevel,
  random: () => number,
): Triple[] {
  const fixedA = values[equation.a];
  const fixedB = values[equation.b];
  const fixedC = values[equation.c];
  const triples: Triple[] = [];
  for (const op of level.ops) {
    const range = operandRange(op, level);
    const low = op === "·" || op === ":" ? 2 : 1;
    if (fixedA === null && fixedB === null && fixedC === null) {
      // Nothing is fixed: the whole range is thousands of pairs, so a few random ones stand for it.
      for (let n = 0; n < FREE_SAMPLES; n += 1) {
        const b = low + Math.floor(random() * (range.b - low + 1));
        // A division is drawn from its answer, or almost every random pair would leave a remainder.
        const a =
          op === ":"
            ? b * (2 + Math.floor(random() * Math.max(1, Math.min(9, Math.floor(level.max / b) - 1))))
            : low + Math.floor(random() * (range.a - low + 1));
        pushIfLegal(triples, a, b, level, op, null);
      }
      continue;
    }
    const derivedA = fixedB !== null && fixedC !== null ? otherOperand(op, fixedB, fixedC, false) : null;
    for (const a of candidates(fixedA, derivedA, low, range.a)) {
      const derivedB = fixedC !== null ? otherOperand(op, a, fixedC, true) : null;
      for (const b of candidates(fixedB, derivedB, low, range.b)) {
        pushIfLegal(triples, a, b, level, op, fixedC);
      }
    }
  }
  return triples;
}

/** The numbers of every number cell and the sign of every equation. */
interface Filling {
  values: number[];
  ops: MathOp[];
}

/** Writes the numbers and picks each equation's sign: equations in order (each crosses an earlier one), with backtracking. */
function fill(layout: Layout, level: MathCrosswordLevel, random: () => number): Filling | null {
  const values: (number | null)[] = Array.from({ length: layout.numbers }, () => null);
  const ops: MathOp[] = layout.equations.map((equation) => equation.op);
  const used = new Set<string>();
  let budget = FILL_BUDGET;
  const signature = (op: MathOp, a: number, b: number): string => `${a}${op}${b}`;

  const go = (index: number): boolean => {
    if (index === layout.equations.length) return true;
    budget -= 1;
    if (budget < 0) return false;
    const equation = layout.equations[index];
    // The same equation (1 + 1 = 2) a second time only when there is no other: unused ones go first.
    const options = shuffled(triplesFor(equation, values, level, random), random).sort(
      (x, y) => Number(used.has(signature(x[0], x[1], x[2]))) - Number(used.has(signature(y[0], y[1], y[2]))),
    );
    const before = [values[equation.a], values[equation.b], values[equation.c]];
    for (const [op, a, b, c] of options.slice(0, FILL_OPTIONS)) {
      values[equation.a] = a;
      values[equation.b] = b;
      values[equation.c] = c;
      ops[index] = op;
      const sign = signature(op, a, b);
      const fresh = !used.has(sign);
      used.add(sign);
      if (go(index + 1)) return true;
      if (fresh) used.delete(sign);
      [values[equation.a], values[equation.b], values[equation.c]] = before;
    }
    return false;
  };

  if (!go(0)) return null;
  return values.every((value) => value !== null) ? { values, ops } : null;
}

/** Empties numbers in a shuffled order while every equation keeps its limit and the card stays within the level's chain. */
function chooseBlanks(
  equations: readonly Equation[],
  values: readonly number[],
  level: MathCrosswordLevel,
  random: () => number,
): number[] {
  const target = Math.round(values.length * level.blankShare);
  let best: number[] = [];
  for (let round = 0; round < BLANK_TRIES && best.length < target; round += 1) {
    const blanks: number[] = [];
    for (const id of shuffled(
      values.map((_, i) => i),
      random,
    )) {
      if (blanks.length >= target) break;
      const trial = [...blanks, id];
      const limitOk = equations.every(
        (e) => [e.a, e.b, e.c].filter((n) => trial.includes(n)).length <= level.maxBlanksPerEquation,
      );
      if (!limitOk) continue;
      const depth = chainDepth(
        { level: level.id, cells: [], equations, values, blanks: [...trial].sort((x, y) => x - y) },
        level.max,
      );
      if (depth !== null && depth <= level.maxChain) blanks.push(id);
    }
    if (blanks.length > best.length) best = blanks;
  }
  return best.sort((x, y) => x - y);
}

/** The cells with every sign cell showing the sign its equation was given. */
function withOps(layout: Layout, ops: readonly MathOp[]): MathCell[] {
  const signs = new Map<string, MathOp>();
  for (const [i, equation] of layout.equations.entries()) {
    const at = equationPositions(equation)[1];
    signs.set(positionKey(at.row, at.col), ops[i]);
  }
  return layout.cells.map((cell) => {
    const op = cell.kind === "op" ? signs.get(positionKey(cell.row, cell.col)) : undefined;
    return op === undefined ? cell : { ...cell, op };
  });
}

/** How much of the level's crossword frame the layout fills: the smaller of the width and the height share. */
function fillRatio(layout: Layout, level: MathCrosswordLevel): number {
  return Math.min(layout.cols / level.cols, layout.rows / level.rows);
}

/** The best of several layouts: most equations first, then the fullest frame. */
function bestLayout(level: MathCrosswordLevel, random: () => number): Layout {
  let best = layOut(level, random);
  for (let i = 1; i < LAYOUT_TRIES; i += 1) {
    const layout = layOut(level, random);
    if (
      layout.equations.length > best.equations.length ||
      (layout.equations.length === best.equations.length && fillRatio(layout, level) > fillRatio(best, level))
    ) {
      best = layout;
    }
  }
  return best;
}

/** A valid card of the level whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. */
export function generateMathCrosswordCard(
  random: () => number,
  previousKey: string | null,
  level: MathCrosswordLevel,
): MathCrosswordCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const layout = bestLayout(level, random);
    if (layout.equations.length < level.equations - EQUATION_TOLERANCE) continue;
    for (let tries = 0; tries < FILL_TRIES; tries += 1) {
      const filling = fill(layout, level, random);
      if (filling === null) continue;
      const { values, ops } = filling;
      const equations = layout.equations.map((equation, i) => ({ ...equation, op: ops[i] }));
      const card: MathCrosswordCard = {
        level: level.id,
        cells: withOps(layout, ops),
        equations,
        values,
        blanks: chooseBlanks(equations, values, level, random),
      };
      if (mathCrosswordKey(card) !== previousKey && mathCrosswordProblems(card, level).length === 0) {
        return card;
      }
      break;
    }
  }
  return null;
}
