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

interface Jog {
  index: number;
  sideA: MazePoint;
  sideB: MazePoint;
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

function layPath(level: Level, random: () => number): MazePoint[] {
  if (level.id === "nastolatek") {
    return nastolatekPath(random);
  }
  if (level.id === "lat4") {
    return pairedSweep(level, 4);
  }
  if (level.id === "lat6") {
    return pairedSweep(level, 6);
  }
  if (level.id === "lat7") {
    return pairedSweep(level, 3);
  }
  const path = spine(level);
  extendWithJogs(path, level, random);
  return path;
}

function spine(level: Level): MazePoint[] {
  const path: MazePoint[] = [];
  for (let row = level.entrance.row; row <= level.exit.row; row += 1) {
    path.push({ row, col: level.entrance.col });
  }
  return path;
}

function pairedSweep(level: Level, reach: number): MazePoint[] {
  const col = level.entrance.col;
  const path: MazePoint[] = [];
  let row = level.entrance.row;
  let pair = 0;
  while (row + 1 <= level.exit.row) {
    const side = pair % 2 === 0 ? 1 : -1;
    path.push({ row, col });
    for (let step = 1; step <= reach; step += 1) {
      path.push({ row, col: col + side * step });
    }
    path.push({ row: row + 1, col: col + side * reach });
    for (let step = reach - 1; step >= 1; step -= 1) {
      path.push({ row: row + 1, col: col + side * step });
    }
    path.push({ row: row + 1, col });
    row += 2;
    pair += 1;
  }
  for (let leftover = row; leftover <= level.exit.row; leftover += 1) {
    path.push({ row: leftover, col });
  }
  return path;
}

function nastolatekPath(random: () => number): MazePoint[] {
  // Columns 19–23 keep a left-to-right serpentine inside 150–300 cells and an odd length.
  const startCol = 19 + Math.floor(random() * 5);
  const endCol = 26;
  const path: MazePoint[] = [];
  for (let col = 0; col < startCol; col += 1) {
    path.push({ row: 0, col });
  }
  for (let row = 0; row < 33; row += 1) {
    if (row % 2 === 0) {
      for (let col = startCol; col <= endCol; col += 1) {
        path.push({ row, col });
      }
    } else {
      for (let col = endCol; col >= startCol; col -= 1) {
        path.push({ row, col });
      }
    }
  }
  return path;
}

function extendWithJogs(path: MazePoint[], level: Level, random: () => number): void {
  const occupied = new Set(path.map((point) => keyOf(point, level.columns)));
  while (level.pathMax === null || path.length + 2 <= level.pathMax) {
    const candidates = jogCandidates(path, occupied, level);
    if (candidates.length === 0) {
      return;
    }
    applyJog(path, occupied, pick(candidates, random), level.columns);
  }
}

function jogCandidates(path: MazePoint[], occupied: Set<number>, level: Level): Jog[] {
  const candidates: Jog[] = [];
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index];
    const to = path[index + 1];
    const perpendicular =
      from.row !== to.row
        ? [
            { row: 0, col: 1 },
            { row: 0, col: -1 },
          ]
        : [
            { row: 1, col: 0 },
            { row: -1, col: 0 },
          ];
    for (const step of perpendicular) {
      const sideA = { row: from.row + step.row, col: from.col + step.col };
      const sideB = { row: to.row + step.row, col: to.col + step.col };
      if (!inBounds(sideA, level) || !inBounds(sideB, level)) {
        continue;
      }
      if (occupied.has(keyOf(sideA, level.columns)) || occupied.has(keyOf(sideB, level.columns))) {
        continue;
      }
      candidates.push({ index, sideA, sideB });
    }
  }
  return candidates;
}

function applyJog(path: MazePoint[], occupied: Set<number>, jog: Jog, columns: number): void {
  path.splice(jog.index + 1, 0, jog.sideA, jog.sideB);
  occupied.add(keyOf(jog.sideA, columns));
  occupied.add(keyOf(jog.sideB, columns));
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
