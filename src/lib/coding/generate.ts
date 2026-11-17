import { codingKey, codingProblems, TARGET_KINDS, turnCount, type CodingCard, type CodingTarget } from "./card.ts";
import type { CodingLevel, CodingMode } from "./levels.ts";
import { cellKey, DIRS, isFree, shortestPaths, step, uniqueShortestPath, type Cell, type Dir } from "./search.ts";

/**
 * Draws a grid again at most this many times before giving up, so a card that cannot be made cannot loop forever. One
 * grid gives a Zapisz card as soon as any cell is a legal goal, but Poziom 4 Zapisz sometimes needs more than 500 draws (1 card in 300 in a trial of 300), so the cap is 3000; a run of 1500 cards had none that failed and the slowest took 64 ms.
 */
export const MAX_ATTEMPTS = 3000;

/** A shuffled copy (Fisher-Yates); `random` is the only source of chance. */
export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

function randomInt(count: number, random: () => number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}

/** Obstacles at random, then a free start. */
function randomGrid(level: CodingLevel, random: () => number): { blocked: boolean[][]; start: Cell } {
  const blocked = Array.from({ length: level.rows }, () =>
    Array.from({ length: level.cols }, () => random() < level.obstacles),
  );
  const start: Cell = [randomInt(level.cols, random), randomInt(level.rows, random)];
  blocked[start[1]][start[0]] = false;
  return { blocked, start };
}

function freeCells(blocked: readonly (readonly boolean[])[]): Cell[] {
  return blocked.flatMap((row, r) => row.flatMap((isBlocked, c) => (isBlocked ? [] : [[c, r] as Cell])));
}

/**
 * Zapisz: one search per grid, then the goal is picked from every cell that is far enough, near enough, reached by
 * exactly one shortest path and turns often enough (instead of drawing the goal blind and hoping).
 */
function zapiszCard(level: CodingLevel, previousKey: string | null, random: () => number): CodingCard | null {
  const { blocked, start } = randomGrid(level, random);
  const shortest = shortestPaths(blocked, start);
  const candidates = freeCells(blocked).filter(
    (cell) =>
      shortest.dist[cell[1]][cell[0]] >= level.pathMin &&
      shortest.dist[cell[1]][cell[0]] <= level.pathMax &&
      shortest.count[cell[1]][cell[0]] === 1,
  );
  for (const goal of shuffled(candidates, random)) {
    const path = uniqueShortestPath(blocked, start, goal, shortest);
    if (path === null || turnCount(path) < level.turnsMin) continue;
    const card: CodingCard = { level: level.id, mode: "zapisz", blocked, start, goal, path, targets: [] };
    if (codingKey(card) !== previousKey && codingProblems(card, card).length === 0) return card;
  }
  return null;
}

/** Wykonaj: a random walk over free cells that never steps back on itself, then three pictures near its end. */
function wykonajCard(level: CodingLevel, previousKey: string | null, random: () => number): CodingCard | null {
  const { blocked, start } = randomGrid(level, random);
  const length = level.pathMin + randomInt(level.pathMax - level.pathMin + 1, random);
  const seen = new Set([cellKey(start)]);
  const path: Dir[] = [];
  let at = start;
  while (path.length < length) {
    const options = DIRS.filter((dir) => isFree(blocked, step(at, dir)) && !seen.has(cellKey(step(at, dir))));
    if (options.length === 0) break;
    const last = path.at(-1);
    // Keeps going straight more often than a fair draw would, so the path is not all zigzag.
    const dir = last !== undefined && options.includes(last) && random() < 0.55 ? last : pick(options, random);
    at = step(at, dir);
    seen.add(cellKey(at));
    path.push(dir);
  }
  if (path.length < length || turnCount(path) < level.turnsMin) return null;
  const goal = at;
  const near = freeCells(blocked).filter(
    (cell) => !seen.has(cellKey(cell)) && Math.abs(cell[0] - goal[0]) + Math.abs(cell[1] - goal[1]) <= 3,
  );
  if (near.length < 2) return null;
  const first = pick(near, random);
  const second = pick(
    near.filter((cell) => cellKey(cell) !== cellKey(first)),
    random,
  );
  // Which picture is the goal is drawn with the card, so the answer is not always the same shape.
  const [goalKind, ...otherKinds] = shuffled(TARGET_KINDS, random);
  const targets: CodingTarget[] = shuffled(
    [
      { kind: goalKind, cell: goal, isGoal: true },
      { kind: otherKinds[0], cell: first, isGoal: false },
      { kind: otherKinds[1], cell: second, isGoal: false },
    ],
    random,
  );
  const card: CodingCard = { level: level.id, mode: "wykonaj", blocked, start, goal, path, targets };
  return codingKey(card) !== previousKey && codingProblems(card, card).length === 0 ? card : null;
}

/** A valid card of the level and mode whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. */
export function generateCodingCard(
  random: () => number,
  previousKey: string | null,
  level: CodingLevel,
  mode: CodingMode,
): CodingCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const card =
      mode.id === "zapisz" ? zapiszCard(level, previousKey, random) : wykonajCard(level, previousKey, random);
    if (card !== null) return card;
  }
  return null;
}
