// Draws a "Labirynt liczbowy" card as in the accepted mockup: a random self-avoiding path from the top left to the
// bottom right through exactly `count` cells, then tempting traps in every other cell. The one-path rule holds by
// construction (no trap next to the path holds the next number); `numberMazeCardProblems` checks it again.
import { neighbours, numberMazeCardKey, numberMazeCardProblems, type NumberMazeCard } from "./card.ts";
import { lastNumber, type NumberMazeLevel } from "./levels.ts";

/** Cards drawn before giving up (a card equal to the previous one, or a path search over its node budget). */
export const MAX_ATTEMPTS = 50;
/**
 * Nodes one path search may visit before it starts over with a fresh random order. A fresh start is faster than a
 * deep dead end: on Poziom 4 (50 of 72 cells) most searches finish in under a hundred nodes.
 */
export const NODE_BUDGET = 20_000;
/** Nodes all path searches of one card may visit together; spent, the card is exhausted (NFR: a card within 5 s). */
export const TOTAL_NODE_BUDGET = 200_000;

/** What is left of the node budget of one card; every path search spends from it. */
export interface NodeBudget {
  left: number;
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let index = out.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [out[index], out[other]] = [out[other], out[index]];
  }
  return out;
}

/** A self-avoiding path from cell 0 to the last cell through exactly `level.count` cells, or null over budget. */
export function randomPath(
  level: NumberMazeLevel,
  random: () => number,
  budget: NodeBudget = { left: NODE_BUDGET },
): number[] | null {
  const { cols, rows, count } = level;
  const size = cols * rows;
  const goal = size - 1;
  const used = new Uint8Array(size);
  const path = [0];
  used[0] = 1;
  let nodes = 0;
  const limit = Math.min(NODE_BUDGET, budget.left);
  const distance = (cell: number): number => rows - 1 - Math.floor(cell / cols) + (cols - 1 - (cell % cols));

  // Whether the goal is still reachable over free cells from `from`, with at least `need` free cells to walk on.
  const reachable = (from: number, need: number): boolean => {
    const seen = new Uint8Array(size);
    const stack = [from];
    seen[from] = 1;
    let free = 0;
    let goalSeen = false;
    for (;;) {
      const cell = stack.pop();
      if (cell === undefined) break;
      free += 1;
      if (cell === goal) goalSeen = true;
      for (const next of neighbours(cell, cols, rows)) {
        if (used[next] === 0 && seen[next] === 0) {
          seen[next] = 1;
          stack.push(next);
        }
      }
    }
    return goalSeen && free - 1 >= need;
  };

  const search = (): boolean => {
    nodes += 1;
    if (nodes > limit) return false;
    const current = path[path.length - 1];
    const left = count - path.length;
    if (left === 0) return current === goal;
    for (const next of shuffled(neighbours(current, cols, rows), random)) {
      if (used[next] === 1 || (next === goal && left !== 1)) continue;
      const rest = left - 1;
      const away = distance(next);
      if (away > rest || (rest - away) % 2 !== 0) continue;
      used[next] = 1;
      path.push(next);
      if ((rest === 0 || reachable(next, rest)) && search()) return true;
      if (nodes > limit) return false;
      path.pop();
      used[next] = 0;
    }
    return false;
  };
  const found = search();
  budget.left -= Math.min(nodes, limit);
  return found ? path : null;
}

/** The numbers a trap in `cell` may hold: close to the path numbers next to it, never their next number. */
function trapChoices(cell: number, index: ReadonlyMap<number, number>, level: NumberMazeLevel): number[] {
  const { first, step, count, near } = level;
  const last = lastNumber(level);
  const pathNeighbours = neighbours(cell, level.cols, level.rows)
    .map((next) => index.get(next))
    .filter((position): position is number => position !== undefined);
  const banned = new Set([first, last]);
  for (const position of pathNeighbours) {
    if (position + 1 < count) banned.add(first + step * (position + 1));
  }
  const close = new Set<number>();
  for (const position of pathNeighbours) {
    for (let offset = -near; offset <= near; offset += 1) {
      const value = first + step * (position + offset);
      if (value > first && value < last && !banned.has(value)) close.add(value);
    }
  }
  if (close.size > 0) return [...close];
  const any: number[] = [];
  for (let value = first + step; value < last; value += step) {
    if (!banned.has(value)) any.push(value);
  }
  return any;
}

/** A legal card different from `previousKey`, or null after `MAX_ATTEMPTS` draws or `TOTAL_NODE_BUDGET` nodes. */
export function generateNumberMazeCard(
  random: () => number,
  level: NumberMazeLevel,
  previousKey: string | null = null,
): NumberMazeCard | null {
  const budget: NodeBudget = { left: TOTAL_NODE_BUDGET };
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    if (budget.left <= 0) return null;
    const path = randomPath(level, random, budget);
    if (path === null) continue;
    const values = new Array<number>(level.cols * level.rows).fill(0);
    const index = new Map<number, number>();
    path.forEach((cell, position) => {
      values[cell] = level.first + level.step * position;
      index.set(cell, position);
    });
    let complete = true;
    for (let cell = 0; cell < values.length; cell += 1) {
      if (index.has(cell)) continue;
      const choices = trapChoices(cell, index, level);
      if (choices.length === 0) {
        complete = false;
        break;
      }
      values[cell] = choices[Math.floor(random() * choices.length)];
    }
    if (!complete) continue;
    const card: NumberMazeCard = { levelId: level.id, values, path };
    if (numberMazeCardProblems(card, level).length > 0) continue;
    if (numberMazeCardKey(card) !== previousKey) return card;
  }
  return null;
}
