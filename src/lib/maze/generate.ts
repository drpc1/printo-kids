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
  if (!usesFiveYearRoute(level.id)) {
    return assembleMaze(level, random, 0);
  }
  const choice = Math.floor(random() * 4);
  return assembleMaze(level, random, choice);
}

function usesFiveYearRoute(id: LevelId): boolean {
  return id === "lat5" || id === "lat6";
}

function assembleMaze(level: Level, random: () => number, choice: number): Maze {
  const path = usesFiveYearRoute(level.id) ? layLat5Path(choice) : layPath(level, random);
  const cells = createCells(level.rows, level.columns);
  openPath(cells, path);
  attachRemainder(cells, level, path, random);
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
  if (mazeRuns(candidate, level.entrance, level.exit).some((run) => run >= 5)) {
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

function mazeRuns(maze: Maze, entrance: MazePoint, exit: MazePoint): number[] {
  const route = solutionCells(maze, entrance, exit);
  const runs = straightRuns(route);
  if (route.length === 0) {
    return runs;
  }
  const depth = new Map<string, number>();
  const parent = new Map<string, string>();
  const queue: MazePoint[] = [];
  for (const point of route) {
    depth.set(pointKey(point), 0);
    queue.push(point);
  }
  let index = 0;
  while (index < queue.length) {
    const current = queue[index];
    index += 1;
    const currentDepth = depth.get(pointKey(current)) ?? 0;
    for (const next of passages(maze, current)) {
      const key = pointKey(next);
      if (depth.has(key)) {
        continue;
      }
      depth.set(key, currentDepth + 1);
      parent.set(key, pointKey(current));
      queue.push(next);
    }
  }
  for (const [key, parentKey] of parent) {
    const point = pointFromText(key);
    const from = pointFromText(parentKey);
    const direction = stepDirection(from, point);
    const grandKey = parent.get(parentKey);
    if (grandKey !== undefined && stepDirection(pointFromText(grandKey), from) === direction) {
      continue;
    }
    let length = 1;
    let cursor = point;
    let cursorKey = key;
    let child = spurChild(maze, parent, cursor, cursorKey, direction);
    while (child !== undefined) {
      length += 1;
      cursor = child;
      cursorKey = pointKey(child);
      child = spurChild(maze, parent, cursor, cursorKey, direction);
    }
    runs.push(length);
  }
  return runs;
}

function straightRuns(route: readonly MazePoint[]): number[] {
  if (route.length < 2) {
    return route.length === 0 ? [] : [1];
  }
  const runs: number[] = [];
  let length = 2;
  let direction = stepDirection(route[0], route[1]);
  for (let index = 2; index < route.length; index += 1) {
    const next = stepDirection(route[index - 1], route[index]);
    if (next === direction) {
      length += 1;
    } else {
      runs.push(length);
      direction = next;
      length = 2;
    }
  }
  runs.push(length);
  return runs;
}

function pointFromText(key: string): MazePoint {
  const [rowText, colText] = key.split(",");
  return { row: Number(rowText), col: Number(colText) };
}

function spurChild(
  maze: Maze,
  parent: Map<string, string>,
  cursor: MazePoint,
  cursorKey: string,
  direction: "north" | "east" | "south" | "west",
): MazePoint | undefined {
  return passages(maze, cursor).find(
    (next) => parent.get(pointKey(next)) === cursorKey && stepDirection(cursor, next) === direction,
  );
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

const COVER_PAIRS: Partial<Record<LevelId, number>> = {
  lat5: 2,
};

function layPath(level: Level, random: () => number): MazePoint[] {
  if (level.id === "lat3") {
    return layLat3Path();
  }
  if (level.id === "lat5") {
    const flip = random() < 0.5;
    try {
      return laySpreadPath(level, flip);
    } catch {
      return laySpreadPath(level, !flip);
    }
  }
  const fixedPairs = COVER_PAIRS[level.id];
  const pairs = fixedPairs ?? pick(PAIRS_IN_BAND[level.id], random);
  const woven = weavePairs(level.columns, pairs);
  const descended = fixedPairs === undefined ? descendToExit(woven, level, random) : descendCovering(woven, level);
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

function descendCovering(woven: MazePoint[], level: Level): MazePoint[] {
  const path = woven.slice();
  const occupied = new Set(path.map((point) => keyOf(point, level.columns)));
  const steps: MazePoint[] = [
    { row: 4, col: 0 },
    { row: 5, col: 0 },
    { row: 5, col: 1 },
    { row: 6, col: 1 },
    { row: 7, col: 1 },
    { row: 8, col: 1 },
    { row: 8, col: 0 },
    { row: 9, col: 0 },
    { row: 10, col: 0 },
    { row: 11, col: 0 },
    { row: 11, col: 1 },
    { row: 11, col: 2 },
    { row: 11, col: 3 },
    { row: 10, col: 3 },
    { row: 10, col: 4 },
    { row: 11, col: 4 },
    { row: 11, col: 5 },
    { row: 11, col: 6 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 10, col: 8 },
    { row: 11, col: 8 },
    { row: 11, col: 9 },
    { row: 11, col: 10 },
    { row: 11, col: 11 },
    { row: 10, col: 11 },
    { row: 10, col: 12 },
    { row: 11, col: 12 },
    { row: 12, col: 12 },
    { row: 13, col: 12 },
    { row: 13, col: 11 },
    { row: 13, col: 10 },
    { row: 13, col: 9 },
    { row: 14, col: 9 },
    { row: 15, col: 9 },
    { row: 15, col: 8 },
    { row: 15, col: 7 },
    { row: 15, col: 6 },
  ];
  for (const step of steps) {
    const from = path[path.length - 1];
    const adjacent = Math.abs(from.row - step.row) + Math.abs(from.col - step.col) === 1;
    if (!adjacent || !inBounds(step, level) || occupied.has(keyOf(step, level.columns))) {
      throw new Error(`Winding path did not cover ${level.id}`);
    }
    path.push(step);
    if (straightRun(path) > 4) {
      throw new Error(`Winding path did not cover ${level.id}`);
    }
    occupied.add(keyOf(step, level.columns));
  }
  const end = path[path.length - 1];
  if (end.row !== level.exit.row || end.col !== level.exit.col) {
    throw new Error(`Winding path did not cover ${level.id}`);
  }
  return path;
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

function attachRemainder(cells: MazeCell[][], level: Level, path: MazePoint[], random: () => number): void {
  const columns = level.columns;
  const depth = new Map<number, number>();
  const parent = new Map<number, number>();
  const pathDistance = new Map<number, number>();
  for (let index = 0; index < path.length; index += 1) {
    const point = path[index];
    depth.set(keyOf(point, columns), 0);
    if (index > 0) {
      parent.set(keyOf(point, columns), keyOf(path[index - 1], columns));
    }
  }
  for (let row = 0; row < level.rows; row += 1) {
    for (let col = 0; col < level.columns; col += 1) {
      let nearest = level.rows + level.columns;
      for (const point of path) {
        const distance = Math.abs(point.row - row) + Math.abs(point.col - col);
        if (distance < nearest) {
          nearest = distance;
        }
      }
      pathDistance.set(keyOf({ row, col }, columns), nearest);
    }
  }

  const total = level.rows * level.columns;
  let attached = depth.size;
  if (level.spurMax === null) {
    let headKey: number | null = null;
    while (attached < total) {
      const fromHead = headKey === null ? undefined : turningStep(cells, level, depth, parent, headKey, random);
      const choice = fromHead ?? deepestTurningStep(cells, level, depth, parent, random);
      if (choice === undefined) {
        break;
      }
      openBetween(cells, choice.from, choice.to);
      const toKey = keyOf(choice.to, columns);
      depth.set(toKey, choice.nextDepth);
      parent.set(toKey, keyOf(choice.from, columns));
      headKey = toKey;
      attached += 1;
    }
    while (attached < total) {
      const rescued = rescueCell(cells, level, depth, parent);
      if (rescued === undefined) {
        break;
      }
      openBetween(cells, rescued.from, rescued.to);
      const rescuedKey = keyOf(rescued.to, columns);
      depth.set(rescuedKey, rescued.nextDepth);
      parent.set(rescuedKey, keyOf(rescued.from, columns));
      attached += 1;
    }
  } else {
    while (attached < total) {
      const route = routeToFarthest(cells, level, depth, parent, pathDistance, random);
      if (route === undefined) {
        const rescued = rescueCell(cells, level, depth, parent);
        if (rescued === undefined) {
          break;
        }
        openBetween(cells, rescued.from, rescued.to);
        const rescuedKey = keyOf(rescued.to, columns);
        depth.set(rescuedKey, rescued.nextDepth);
        parent.set(rescuedKey, keyOf(rescued.from, columns));
        attached += 1;
        continue;
      }
      for (const link of route) {
        const toKey = keyOf(link.to, columns);
        if (depth.has(toKey)) {
          continue;
        }
        openBetween(cells, link.from, link.to);
        depth.set(toKey, link.nextDepth);
        parent.set(toKey, keyOf(link.from, columns));
        attached += 1;
      }
    }
  }
  if (attached !== total) {
    const missing: string[] = [];
    for (let row = 0; row < level.rows; row += 1) {
      for (let col = 0; col < level.columns; col += 1) {
        if (!depth.has(keyOf({ row, col }, columns))) {
          missing.push(`${row},${col}`);
        }
      }
    }
    throw new Error(`Spurs left ${total - attached} cells unattached on ${level.id}: ${missing.join(" ")}`);
  }
}

interface SpurLink {
  from: MazePoint;
  to: MazePoint;
  nextDepth: number;
  run: number;
}

function openingRun(cells: MazeCell[][], from: MazePoint, to: MazePoint): number {
  const rowStep = from.row - to.row;
  const colStep = from.col - to.col;
  let length = 1;
  let row = from.row;
  let col = from.col;
  let behindRow = row + rowStep;
  let behindCol = col + colStep;
  while (
    behindRow >= 0 &&
    behindCol >= 0 &&
    behindRow < cells.length &&
    behindCol < cells[0].length &&
    wallsOpen(cells, row, col, behindRow, behindCol)
  ) {
    length += 1;
    row = behindRow;
    col = behindCol;
    behindRow = row + rowStep;
    behindCol = col + colStep;
  }
  return length + 1;
}

function wallsOpen(cells: MazeCell[][], row: number, col: number, nextRow: number, nextCol: number): boolean {
  if (nextCol === col + 1) {
    return !cells[row][col].east;
  }
  if (nextCol === col - 1) {
    return !cells[row][col].west;
  }
  if (nextRow === row + 1) {
    return !cells[row][col].south;
  }
  return !cells[row][col].north;
}

function legalLinks(
  cells: MazeCell[][],
  level: Level,
  depth: Map<number, number>,
  from: MazePoint,
  fromDepth: number,
): SpurLink[] {
  const links: SpurLink[] = [];
  for (const to of gridNeighbors(from, level)) {
    if (depth.has(keyOf(to, level.columns))) {
      continue;
    }
    const nextDepth = fromDepth + 1;
    if (level.spurMax !== null && nextDepth > level.spurMax) {
      continue;
    }
    const run = openingRun(cells, from, to);
    if (run > 4) {
      continue;
    }
    links.push({ from, to, nextDepth, run });
  }
  return links;
}

function turningStep(
  cells: MazeCell[][],
  level: Level,
  depth: Map<number, number>,
  parent: Map<number, number>,
  headKey: number,
  random: () => number,
): SpurLink | undefined {
  const from = pointFromKey(headKey, level.columns);
  const fromDepth = depth.get(headKey);
  if (fromDepth === undefined) {
    return undefined;
  }
  return preferTurn(legalLinks(cells, level, depth, from, fromDepth), random);
}

function deepestTurningStep(
  cells: MazeCell[][],
  level: Level,
  depth: Map<number, number>,
  parent: Map<number, number>,
  random: () => number,
): SpurLink | undefined {
  let bestDepth = -1;
  let ties: SpurLink[] = [];
  for (let row = 0; row < level.rows; row += 1) {
    for (let col = 0; col < level.columns; col += 1) {
      const from = { row, col };
      const fromDepth = depth.get(keyOf(from, level.columns));
      if (fromDepth === undefined) {
        continue;
      }
      for (const link of legalLinks(cells, level, depth, from, fromDepth)) {
        if (link.nextDepth > bestDepth) {
          bestDepth = link.nextDepth;
          ties = [link];
        } else if (link.nextDepth === bestDepth) {
          ties.push(link);
        }
      }
    }
  }
  return preferTurn(ties, random);
}

function preferTurn(links: SpurLink[], random: () => number): SpurLink | undefined {
  if (links.length === 0) {
    return undefined;
  }
  const turns = links.filter((link) => link.run === 1);
  if (turns.length > 0) {
    return pick(turns, random);
  }
  const oneMore = links.filter((link) => link.run === 2);
  if (oneMore.length > 0) {
    return pick(oneMore, random);
  }
  return pick(links, random);
}

function mirrorColumns(path: readonly MazePoint[]): MazePoint[] {
  const lastColumn = 12;
  return path.map((point) => ({ row: point.row, col: lastColumn - point.col }));
}

function mirrorRows(path: readonly MazePoint[]): MazePoint[] {
  const lastRow = 15;
  return path.map((point) => ({ row: lastRow - point.row, col: point.col })).reverse();
}

function layLat5Path(choice: number): MazePoint[] {
  const edge = layLat5Edge();
  const flipped = mirrorRows(edge);
  const templates = [edge, mirrorColumns(edge), flipped, mirrorColumns(flipped)];
  return templates[choice] ?? edge;
}

function layLat5Edge(): MazePoint[] {
  const steps: readonly (readonly [number, number])[] = [
    [0, 6],
    [1, 6],
    [1, 5],
    [1, 4],
    [0, 4],
    [0, 3],
    [1, 3],
    [1, 2],
    [1, 1],
    [0, 1],
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
    [3, 2],
    [3, 3],
    [2, 3],
    [2, 4],
    [3, 4],
    [3, 5],
    [2, 5],
    [2, 6],
    [2, 7],
    [2, 8],
    [3, 8],
    [3, 9],
    [2, 9],
    [2, 10],
    [3, 10],
    [3, 11],
    [2, 11],
    [2, 12],
    [3, 12],
    [4, 12],
    [4, 11],
    [5, 11],
    [5, 12],
    [6, 12],
    [7, 12],
    [7, 11],
    [8, 11],
    [8, 12],
    [9, 12],
    [10, 12],
    [10, 11],
    [11, 11],
    [11, 12],
    [12, 12],
    [13, 12],
    [14, 12],
    [14, 11],
    [14, 10],
    [14, 9],
    [13, 9],
    [12, 9],
    [11, 9],
    [11, 8],
    [10, 8],
    [9, 8],
    [8, 8],
    [8, 7],
    [7, 7],
    [6, 7],
    [5, 7],
    [5, 6],
    [5, 5],
    [5, 4],
    [4, 4],
    [4, 3],
    [4, 2],
    [4, 1],
    [5, 1],
    [5, 0],
    [6, 0],
    [7, 0],
    [8, 0],
    [8, 1],
    [9, 1],
    [10, 1],
    [11, 1],
    [11, 2],
    [12, 2],
    [13, 2],
    [13, 1],
    [13, 0],
    [14, 0],
    [15, 0],
    [15, 1],
    [15, 2],
    [14, 2],
    [14, 3],
    [14, 4],
    [14, 5],
    [15, 5],
    [15, 6],
  ];
  return steps.map(([row, col]) => ({ row, col }));
}

function layLat3Path(): MazePoint[] {
  const steps: readonly (readonly [number, number])[] = [
    [0, 4],
    [1, 4],
    [2, 4],
    [2, 5],
    [2, 6],
    [3, 6],
    [3, 5],
    [4, 5],
    [4, 4],
    [3, 4],
    [3, 3],
    [3, 2],
    [3, 1],
    [4, 1],
    [4, 0],
    [5, 0],
    [5, 1],
    [5, 2],
    [4, 2],
    [4, 3],
    [5, 3],
    [6, 3],
    [6, 4],
    [6, 5],
    [6, 6],
    [7, 6],
    [7, 7],
    [8, 7],
    [8, 6],
    [9, 6],
    [9, 5],
    [9, 4],
    [8, 4],
    [8, 3],
    [8, 2],
    [9, 2],
    [9, 1],
    [10, 1],
    [10, 2],
    [10, 3],
    [10, 4],
  ];
  return steps.map(([row, col]) => ({ row, col }));
}

function laySpreadPath(level: Level, flip: boolean): MazePoint[] {
  const columns = level.columns;
  const path: MazePoint[] = [{ ...level.entrance }];
  const occupied = new Set<number>([keyOf(path[0], columns)]);

  const runBlocked = (next: MazePoint): boolean => {
    if (path.length < 2) {
      return false;
    }
    const from = path[path.length - 1];
    return stepDirection(from, next) === stepDirection(path[path.length - 2], from) && straightRun(path) >= 3;
  };

  const place = (row: number, col: number, allowStraight = false): void => {
    const next = { row, col };
    const from = path[path.length - 1];
    if (
      !inBounds(next, level) ||
      occupied.has(keyOf(next, columns)) ||
      Math.abs(from.row - row) + Math.abs(from.col - col) !== 1 ||
      (!allowStraight && runBlocked(next))
    ) {
      throw new Error(`Winding path left ${level.id}`);
    }
    path.push(next);
    occupied.add(keyOf(next, columns));
  };

  const nudge = (vertical: boolean): boolean => {
    const from = path[path.length - 1];
    const sides = vertical
      ? [
          { row: from.row, col: from.col + 1 },
          { row: from.row, col: from.col - 1 },
        ]
      : [
          { row: from.row - 1, col: from.col },
          { row: from.row + 1, col: from.col },
        ];
    const side = sides.find(
      (point) => inBounds(point, level) && !occupied.has(keyOf(point, columns)) && !runBlocked(point),
    );
    if (side === undefined) {
      return false;
    }
    place(side.row, side.col);
    return true;
  };

  const advance = (vertical: boolean, target: number): void => {
    let guard = 0;
    while ((vertical ? path[path.length - 1].row : path[path.length - 1].col) !== target) {
      if (guard++ > level.rows * level.columns) {
        throw new Error(`Winding path left ${level.id}`);
      }
      const from = path[path.length - 1];
      const next = vertical
        ? { row: from.row + Math.sign(target - from.row), col: from.col }
        : { row: from.row, col: from.col + Math.sign(target - from.col) };
      const landsOnTarget = vertical ? next.row === target : next.col === target;
      const finishing = landsOnTarget && path.length >= 2 && straightRun(path) < 4;
      if ((!runBlocked(next) || finishing) && inBounds(next, level) && !occupied.has(keyOf(next, columns))) {
        place(next.row, next.col, finishing);
        continue;
      }
      if (runBlocked(next) && nudge(vertical)) {
        continue;
      }
      const here = path[path.length - 1];
      throw new Error(`Winding path left ${level.id} at ${path.length} ${here.row},${here.col}`);
    }
  };

  const reach = level.spurMax ?? 4;
  const bands: number[] = [];
  for (let row = 2; row < level.exit.row - reach; row += reach) {
    bands.push(row);
  }
  const bottom = level.exit.row - 1;
  if (bands[bands.length - 1] !== bottom) {
    bands.push(bottom);
  }
  bands.forEach((row, index) => {
    const leftToRight = flip ? index % 2 === 1 : index % 2 === 0;
    const startCol = leftToRight ? 0 : columns - 1;
    const endCol = leftToRight ? columns - 1 : 0;
    advance(false, startCol);
    advance(true, row);
    advance(false, endCol);
  });
  advance(true, level.exit.row);
  advance(false, level.exit.col);
  return path;
}

function spurRun(parent: Map<number, number>, columns: number, from: MazePoint, to: MazePoint): number {
  const direction = stepDirection(from, to);
  let length = 1;
  let current = from;
  let previousKey = parent.get(keyOf(current, columns));
  while (previousKey !== undefined) {
    const previous = pointFromKey(previousKey, columns);
    if (stepDirection(previous, current) !== direction) {
      break;
    }
    length += 1;
    current = previous;
    previousKey = parent.get(keyOf(current, columns));
  }
  return length;
}

function rescueCell(
  cells: MazeCell[][],
  level: Level,
  depth: Map<number, number>,
  parent: Map<number, number>,
): SpurLink | undefined {
  let best: SpurLink | undefined;
  for (let row = 0; row < level.rows; row += 1) {
    for (let col = 0; col < level.columns; col += 1) {
      const from = { row, col };
      const fromKey = keyOf(from, level.columns);
      const fromDepth = depth.get(fromKey);
      if (fromDepth === undefined) {
        continue;
      }
      for (const to of gridNeighbors(from, level)) {
        if (depth.has(keyOf(to, level.columns))) {
          continue;
        }
        const nextDepth = fromDepth + 1;
        const run = spurRun(parent, level.columns, from, to);
        if (run > 3 || openingRun(cells, from, to) > 4 || (level.spurMax !== null && nextDepth > level.spurMax)) {
          continue;
        }
        if (best === undefined || run < best.run || (run === best.run && nextDepth < best.nextDepth)) {
          best = { from, to, nextDepth, run };
        }
      }
    }
  }
  return best;
}

function routeToFarthest(
  cells: MazeCell[][],
  level: Level,
  depth: Map<number, number>,
  parent: Map<number, number>,
  pathDistance: Map<number, number>,
  random: () => number,
): SpurLink[] | undefined {
  const columns = level.columns;
  interface ReachState {
    key: number;
    keys: number[];
    fromKey: number;
    run: number;
    wall: number;
    direction: "north" | "east" | "south" | "west";
    depth: number;
    straights: number;
  }
  const queue: ReachState[] = [];
  const seen = new Set<string>();
  const rowOffset = Math.floor(random() * level.rows);
  for (let rowIndex = 0; rowIndex < level.rows; rowIndex += 1) {
    const row = (rowIndex + rowOffset) % level.rows;
    for (let col = 0; col < level.columns; col += 1) {
      const from = { row, col };
      const fromKey = keyOf(from, columns);
      const fromDepth = depth.get(fromKey);
      if (fromDepth === undefined) {
        continue;
      }
      for (const to of gridNeighbors(from, level)) {
        const toKey = keyOf(to, columns);
        if (depth.has(toKey)) {
          continue;
        }
        const run = spurRun(parent, columns, from, to);
        const wall = openingRun(cells, from, to);
        const nextDepth = fromDepth + 1;
        if (run > 2 || wall > 3 || (level.spurMax !== null && nextDepth > level.spurMax)) {
          continue;
        }
        const direction = stepDirection(from, to);
        const mark = `${toKey}:${direction}:${run}:${wall}`;
        if (seen.has(mark)) {
          continue;
        }
        seen.add(mark);
        queue.push({
          key: toKey,
          keys: [toKey],
          fromKey,
          run,
          wall,
          direction,
          depth: nextDepth,
          straights: run > 1 ? 1 : 0,
        });
      }
    }
  }

  const byTarget = new Map<number, ReachState[]>();
  let index = 0;
  while (index < queue.length) {
    const state = queue[index];
    index += 1;
    const group = byTarget.get(state.key);
    if (group === undefined) {
      byTarget.set(state.key, [state]);
    } else {
      group.push(state);
    }
    if (level.spurMax !== null && state.depth >= level.spurMax) {
      continue;
    }
    const current = pointFromKey(state.key, columns);
    for (const to of gridNeighbors(current, level)) {
      const toKey = keyOf(to, columns);
      if (depth.has(toKey) || state.keys.includes(toKey)) {
        continue;
      }
      const direction = stepDirection(current, to);
      const run = direction === state.direction ? state.run + 1 : 1;
      const wall = direction === state.direction ? state.wall + 1 : 2;
      const nextDepth = state.depth + 1;
      if (run > 2 || wall > 3 || (level.spurMax !== null && nextDepth > level.spurMax)) {
        continue;
      }
      const mark = `${toKey}:${direction}:${run}:${wall}`;
      if (seen.has(mark)) {
        continue;
      }
      seen.add(mark);
      queue.push({
        key: toKey,
        keys: [...state.keys, toKey],
        fromKey: state.fromKey,
        run,
        wall,
        direction,
        depth: nextDepth,
        straights: state.straights + (run > 1 ? 1 : 0),
      });
    }
  }
  let bestScore = Number.NEGATIVE_INFINITY;
  let chosenGroup: ReachState[] | undefined;
  for (const [targetKey, states] of byTarget) {
    let shortestRoute = Number.POSITIVE_INFINITY;
    for (const state of states) {
      if (state.keys.length < shortestRoute) {
        shortestRoute = state.keys.length;
      }
    }
    const distance = pathDistance.get(targetKey) ?? 0;
    const score = usesFiveYearRoute(level.id) ? shortestRoute * 100 + distance : -states.length * 100 + distance;
    if (score > bestScore) {
      bestScore = score;
      chosenGroup = states;
    }
  }
  if (chosenGroup === undefined) {
    return undefined;
  }
  let fewestStraights = Number.POSITIVE_INFINITY;
  let shortest = Number.POSITIVE_INFINITY;
  let shortlist: ReachState[] = [];
  for (const state of chosenGroup) {
    const better =
      state.straights < fewestStraights || (state.straights === fewestStraights && state.keys.length < shortest);
    if (better) {
      fewestStraights = state.straights;
      shortest = state.keys.length;
      shortlist = [state];
    } else if (state.straights === fewestStraights && state.keys.length === shortest) {
      shortlist.push(state);
    }
  }
  const chosen = pick(shortlist, random);
  const links: SpurLink[] = [];
  let fromKey = chosen.fromKey;
  let fromDepth = depth.get(fromKey);
  if (fromDepth === undefined) {
    return undefined;
  }
  for (const toKey of chosen.keys) {
    const from = pointFromKey(fromKey, columns);
    const to = pointFromKey(toKey, columns);
    fromDepth += 1;
    links.push({
      from,
      to,
      nextDepth: fromDepth,
      run: links.length === 0 ? chosen.run : 1,
    });
    fromKey = toKey;
  }
  return links;
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
