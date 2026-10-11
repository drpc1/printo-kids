import { levelById, type Level, type LevelId, type MazePoint } from "./levels.ts";

export interface MazeCell {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
}

export interface Maze {
  width: number;
  height: number;
  cells: MazeCell[][];
}

export function generateMaze(levelId: LevelId, random: () => number): Maze {
  const level = levelById(levelId);
  const path = layPath(level, random);
  const cells = createCells(level.rows, level.columns);
  openPath(cells, path);
  const frozen = new Map<number, number>();
  if (level.spurMin !== null) {
    carveSpur(cells, level, path, frozen);
  }
  attachRemainder(cells, level, path, frozen, random);
  cells[level.entrance.row][level.entrance.col].north = false;
  cells[level.exit.row][level.exit.col].south = false;
  return { width: level.columns, height: level.rows, cells };
}

export function countPaths(maze: Maze, entrance: MazePoint, exit: MazePoint): number {
  let found = 0;
  const visited = Array.from({ length: maze.height }, () => Array.from({ length: maze.width }, () => false));

  function walk(row: number, col: number): void {
    if (found >= 2) {
      return;
    }
    if (row === exit.row && col === exit.col) {
      found += 1;
      return;
    }

    visited[row][col] = true;
    const cell = maze.cells[row][col];

    if (!cell.north && row > 0 && !visited[row - 1][col]) {
      walk(row - 1, col);
    }
    if (!cell.east && col < maze.width - 1 && !visited[row][col + 1]) {
      walk(row, col + 1);
    }
    if (!cell.south && row < maze.height - 1 && !visited[row + 1][col]) {
      walk(row + 1, col);
    }
    if (!cell.west && col > 0 && !visited[row][col - 1]) {
      walk(row, col - 1);
    }

    visited[row][col] = false;
  }

  walk(entrance.row, entrance.col);
  return found;
}

export function mazeForSheet(candidate: Maze, levelId: LevelId): Maze | null {
  const level = levelById(levelId);
  if (candidate.width !== level.columns || candidate.height !== level.rows) {
    return null;
  }
  if (countPaths(candidate, level.entrance, level.exit) !== 1) {
    return null;
  }
  const length = solutionLength(candidate, level.entrance, level.exit);
  if (level.pathMin !== null && length < level.pathMin) {
    return null;
  }
  if (level.pathMax !== null && length > level.pathMax) {
    return null;
  }
  const spur = longestOffPath(candidate, level.entrance, level.exit);
  if (spur === null) {
    return null;
  }
  if (level.spurMax !== null && spur > level.spurMax) {
    return null;
  }
  if (level.spurMin !== null && spur < level.spurMin) {
    return null;
  }
  return candidate;
}

function solutionLength(maze: Maze, entrance: MazePoint, exit: MazePoint): number {
  return solutionCells(maze, entrance, exit).length;
}

function solutionCells(maze: Maze, entrance: MazePoint, exit: MazePoint): MazePoint[] {
  const start = pointKey(entrance);
  const goal = pointKey(exit);
  const parent = new Map<string, string | null>();
  parent.set(start, null);
  const queue: MazePoint[] = [entrance];
  let found = false;
  let index = 0;
  while (index < queue.length) {
    const current = queue[index];
    index += 1;
    if (pointKey(current) === goal) {
      found = true;
      break;
    }
    for (const next of passages(maze, current)) {
      const key = pointKey(next);
      if (parent.has(key)) {
        continue;
      }
      parent.set(key, pointKey(current));
      queue.push(next);
    }
  }
  if (!found) {
    return [];
  }
  const cells: MazePoint[] = [];
  let cursor: string | null = goal;
  while (cursor !== null) {
    const [rowText, colText] = cursor.split(",");
    cells.push({ row: Number(rowText), col: Number(colText) });
    cursor = parent.get(cursor) ?? null;
  }
  cells.reverse();
  return cells;
}

function longestOffPath(maze: Maze, entrance: MazePoint, exit: MazePoint): number | null {
  const onPath = new Set(solutionCells(maze, entrance, exit).map(pointKey));
  if (onPath.size === 0) {
    return null;
  }
  const depth = new Map<string, number>();
  const queue: MazePoint[] = [];
  for (const key of onPath) {
    depth.set(key, 0);
    const [rowText, colText] = key.split(",");
    queue.push({ row: Number(rowText), col: Number(colText) });
  }
  let max = 0;
  const seen = new Set(onPath);
  let index = 0;
  while (index < queue.length) {
    const current = queue[index];
    index += 1;
    const currentDepth = depth.get(pointKey(current)) ?? 0;
    for (const next of passages(maze, current)) {
      const key = pointKey(next);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const nextDepth = currentDepth + 1;
      depth.set(key, nextDepth);
      if (nextDepth > max) {
        max = nextDepth;
      }
      queue.push(next);
    }
  }
  if (seen.size !== maze.width * maze.height) {
    return null;
  }
  return max;
}

function passages(maze: Maze, point: MazePoint): MazePoint[] {
  const cell = maze.cells[point.row][point.col];
  const neighbors: MazePoint[] = [];
  if (!cell.north && point.row > 0) {
    neighbors.push({ row: point.row - 1, col: point.col });
  }
  if (!cell.east && point.col < maze.width - 1) {
    neighbors.push({ row: point.row, col: point.col + 1 });
  }
  if (!cell.south && point.row < maze.height - 1) {
    neighbors.push({ row: point.row + 1, col: point.col });
  }
  if (!cell.west && point.col > 0) {
    neighbors.push({ row: point.row, col: point.col - 1 });
  }
  return neighbors;
}

function pointKey(point: MazePoint): string {
  return `${point.row},${point.col}`;
}

// Pair counts whose full-width weave, then a run-limited descent, lands in the length band.
const PAIRS_IN_BAND: Record<LevelId, readonly number[]> = {
  lat3: [2],
  lat4: [3, 4],
  lat5: [2, 3],
  lat6: [5, 6],
  lat7: [5, 6, 7],
  nastolatek: [5, 6, 7, 8],
};

function layPath(level: Level, random: () => number): MazePoint[] {
  const pairs = pick(PAIRS_IN_BAND[level.id], random);
  const woven = weavePairs(level.columns, pairs);
  const descended = descendToExit(woven, level, random);
  const start = descended.findIndex((point) => point.row === level.entrance.row && point.col === level.entrance.col);
  if (start < 0) {
    throw new Error("Winding path missed the entrance");
  }
  return descended.slice(start);
}

function weavePairs(columns: number, pairs: number): MazePoint[] {
  const path: MazePoint[] = [];
  for (let pair = 0; pair < pairs; pair += 1) {
    const top = pair * 2;
    if (pair % 2 === 0) {
      for (let col = 0; col < columns - 1; col += 2) {
        path.push({ row: top, col }, { row: top + 1, col }, { row: top + 1, col: col + 1 }, { row: top, col: col + 1 });
      }
      path.push({ row: top, col: columns - 1 }, { row: top + 1, col: columns - 1 });
    } else {
      for (let col = columns - 1; col > 0; col -= 2) {
        path.push({ row: top, col }, { row: top + 1, col }, { row: top + 1, col: col - 1 }, { row: top, col: col - 1 });
      }
      path.push({ row: top, col: 0 }, { row: top + 1, col: 0 });
    }
  }
  return path;
}

function descendToExit(path: MazePoint[], level: Level, random: () => number): MazePoint[] {
  const occupied = new Set(path.map((point) => keyOf(point, level.columns)));
  const guardLimit = level.columns * level.rows * 4;
  for (let guard = 0; guard < guardLimit; guard += 1) {
    const current = path[path.length - 1];
    if (current.row === level.exit.row && current.col === level.exit.col) {
      return path;
    }
    const rowStep = Math.sign(level.exit.row - current.row);
    const colStep = Math.sign(level.exit.col - current.col);
    const options: MazePoint[] = [];
    if (colStep !== 0) {
      options.push({ row: current.row, col: current.col + colStep });
    }
    if (rowStep !== 0) {
      options.push({ row: current.row + rowStep, col: current.col });
    }
    if (colStep === 0) {
      const sides = random() < 0.5 ? [1, -1] : [-1, 1];
      for (const side of sides) {
        options.push({ row: current.row, col: current.col + side });
      }
    }
    const next = options.find((candidate) => canAppend(path, occupied, candidate, level));
    if (next === undefined) {
      break;
    }
    path.push(next);
    occupied.add(keyOf(next, level.columns));
  }
  throw new Error("Winding path did not reach the exit");
}

function canAppend(path: readonly MazePoint[], occupied: Set<number>, next: MazePoint, level: Level): boolean {
  if (!inBounds(next, level) || occupied.has(keyOf(next, level.columns))) {
    return false;
  }
  const from = path[path.length - 1];
  if (Math.abs(from.row - next.row) + Math.abs(from.col - next.col) !== 1) {
    return false;
  }
  const direction = stepDirection(from, next);
  const continued = path.length >= 2 && stepDirection(path[path.length - 2], from) === direction;
  const length = continued ? straightRun(path) + 1 : 2;
  return length <= 3;
}

function straightRun(path: readonly MazePoint[]): number {
  const last = path.length - 1;
  const direction = stepDirection(path[last - 1], path[last]);
  let length = 2;
  for (let index = last - 1; index > 0; index -= 1) {
    if (stepDirection(path[index - 1], path[index]) !== direction) {
      break;
    }
    length += 1;
  }
  return length;
}

function stepDirection(from: MazePoint, to: MazePoint): "north" | "east" | "south" | "west" {
  if (to.col === from.col + 1) {
    return "east";
  }
  if (to.col === from.col - 1) {
    return "west";
  }
  if (to.row === from.row + 1) {
    return "south";
  }
  return "north";
}

function carveSpur(cells: MazeCell[][], level: Level, path: MazePoint[], frozen: Map<number, number>): void {
  const spurMin = level.spurMin;
  if (spurMin === null) {
    return;
  }
  const onPath = new Set(path.map((point) => keyOf(point, level.columns)));
  let current = level.entrance;
  for (let depth = 1; depth <= spurMin; depth += 1) {
    const next = { row: current.row + 1, col: current.col };
    if (!inBounds(next, level) || onPath.has(keyOf(next, level.columns))) {
      return;
    }
    openBetween(cells, current, next);
    frozen.set(keyOf(next, level.columns), depth);
    current = next;
  }
}

function attachRemainder(
  cells: MazeCell[][],
  level: Level,
  path: MazePoint[],
  frozen: Map<number, number>,
  random: () => number,
): void {
  const best = new Map<number, number>();
  const parents = new Map<number, MazePoint[]>();
  const queue: MazePoint[] = [];

  for (const point of path) {
    best.set(keyOf(point, level.columns), 0);
    queue.push(point);
  }
  for (const [key, depth] of frozen) {
    best.set(key, depth);
  }

  let index = 0;
  while (index < queue.length) {
    const current = queue[index];
    index += 1;
    const depth = best.get(keyOf(current, level.columns));
    if (depth === undefined) {
      continue;
    }
    for (const next of gridNeighbors(current, level)) {
      const nextKey = keyOf(next, level.columns);
      const nextDepth = depth + 1;
      const known = best.get(nextKey);
      if (known === undefined) {
        best.set(nextKey, nextDepth);
        if (!frozen.has(nextKey)) {
          parents.set(nextKey, [current]);
        }
        queue.push(next);
      } else if (known === nextDepth && parents.has(nextKey)) {
        parents.get(nextKey)?.push(current);
      }
    }
  }

  for (const [key, options] of parents) {
    openBetween(cells, pick(options, random), pointFromKey(key, level.columns));
  }
}

function createCells(rows: number, columns: number): MazeCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, (): MazeCell => ({
      north: true,
      east: true,
      south: true,
      west: true,
    })),
  );
}

function openPath(cells: MazeCell[][], path: MazePoint[]): void {
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index];
    const to = path[index + 1];
    openBetween(cells, from, to);
  }
}

function openBetween(cells: MazeCell[][], from: MazePoint, to: MazePoint): void {
  if (from.row === to.row && to.col === from.col + 1) {
    cells[from.row][from.col].east = false;
    cells[to.row][to.col].west = false;
    return;
  }
  if (from.row === to.row && from.col === to.col + 1) {
    openBetween(cells, to, from);
    return;
  }
  if (from.col === to.col && to.row === from.row + 1) {
    cells[from.row][from.col].south = false;
    cells[to.row][to.col].north = false;
    return;
  }
  if (from.col === to.col && from.row === to.row + 1) {
    openBetween(cells, to, from);
    return;
  }
  throw new Error("Passage is not between orthogonal cells");
}

function gridNeighbors(point: MazePoint, level: Level): MazePoint[] {
  const neighbors: MazePoint[] = [];
  if (point.row > 0) {
    neighbors.push({ row: point.row - 1, col: point.col });
  }
  if (point.col < level.columns - 1) {
    neighbors.push({ row: point.row, col: point.col + 1 });
  }
  if (point.row < level.rows - 1) {
    neighbors.push({ row: point.row + 1, col: point.col });
  }
  if (point.col > 0) {
    neighbors.push({ row: point.row, col: point.col - 1 });
  }
  return neighbors;
}

function inBounds(point: MazePoint, level: Level): boolean {
  return point.row >= 0 && point.col >= 0 && point.row < level.rows && point.col < level.columns;
}

function keyOf(point: MazePoint, columns: number): number {
  return point.row * columns + point.col;
}

function pointFromKey(key: number, columns: number): MazePoint {
  return { row: Math.floor(key / columns), col: key % columns };
}

function pick<T>(items: readonly T[], random: () => number): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) {
    throw new Error("Cannot pick from an empty list");
  }
  return item;
}
