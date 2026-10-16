import { levelById, type LevelId, type MazePoint } from "./levels.ts";

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

interface WallEdge {
  row: number;
  col: number;
  direction: "east" | "south";
}

export function generateMaze(levelId: LevelId, random: () => number): Maze {
  const level = levelById(levelId);
  const cells = createCells(level.rows, level.columns);
  if (level.algorithm === "kruskal") {
    carveKruskal(cells, level.rows, level.columns, random);
  } else {
    carveBacktracker(cells, level.rows, level.columns, level.entrance, random);
  }
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
  return candidate;
}

function carveKruskal(cells: MazeCell[][], rows: number, columns: number, random: () => number): void {
  const edges = listInternalEdges(rows, columns);
  shuffle(edges, random);
  const { union } = createUnionFind(rows * columns);

  for (const edge of edges) {
    const from = edge.row * columns + edge.col;
    const to = edge.direction === "east" ? from + 1 : from + columns;
    if (union(from, to)) {
      openPassage(cells, edge.row, edge.col, edge.direction);
    }
  }
}

function carveBacktracker(
  cells: MazeCell[][],
  rows: number,
  columns: number,
  start: MazePoint,
  random: () => number,
): void {
  const visited = Array.from({ length: rows }, () => Array.from({ length: columns }, () => false));
  visited[start.row][start.col] = true;
  const stack: MazePoint[] = [start];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const options = unvisitedNeighbors(current, rows, columns, visited);
    if (options.length === 0) {
      stack.pop();
      continue;
    }
    const next = options[Math.floor(random() * options.length)];
    openBetween(cells, current, next);
    visited[next.row][next.col] = true;
    stack.push(next);
  }
}

function unvisitedNeighbors(point: MazePoint, rows: number, columns: number, visited: boolean[][]): MazePoint[] {
  const neighbors: MazePoint[] = [];
  if (point.row > 0 && !visited[point.row - 1][point.col]) {
    neighbors.push({ row: point.row - 1, col: point.col });
  }
  if (point.col < columns - 1 && !visited[point.row][point.col + 1]) {
    neighbors.push({ row: point.row, col: point.col + 1 });
  }
  if (point.row < rows - 1 && !visited[point.row + 1][point.col]) {
    neighbors.push({ row: point.row + 1, col: point.col });
  }
  if (point.col > 0 && !visited[point.row][point.col - 1]) {
    neighbors.push({ row: point.row, col: point.col - 1 });
  }
  return neighbors;
}

function openBetween(cells: MazeCell[][], from: MazePoint, to: MazePoint): void {
  if (to.row === from.row) {
    openPassage(cells, from.row, Math.min(from.col, to.col), "east");
  } else {
    openPassage(cells, Math.min(from.row, to.row), from.col, "south");
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

function listInternalEdges(rows: number, columns: number): WallEdge[] {
  const edges: WallEdge[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      if (col < columns - 1) {
        edges.push({ row, col, direction: "east" });
      }
      if (row < rows - 1) {
        edges.push({ row, col, direction: "south" });
      }
    }
  }
  return edges;
}

function shuffle(items: WallEdge[], random: () => number): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = items[i];
    items[i] = items[j];
    items[j] = current;
  }
}

function createUnionFind(size: number): { union: (a: number, b: number) => boolean } {
  const parent = Array.from({ length: size }, (_, index) => index);
  const rank = Array.from({ length: size }, () => 0);

  function find(index: number): number {
    if (parent[index] !== index) {
      parent[index] = find(parent[index]);
    }
    return parent[index];
  }

  function union(a: number, b: number): boolean {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) {
      return false;
    }
    if (rank[rootA] < rank[rootB]) {
      parent[rootA] = rootB;
    } else if (rank[rootA] > rank[rootB]) {
      parent[rootB] = rootA;
    } else {
      parent[rootB] = rootA;
      rank[rootA] += 1;
    }
    return true;
  }

  return { union };
}

function openPassage(cells: MazeCell[][], row: number, col: number, direction: "east" | "south"): void {
  const cell = cells[row][col];
  if (direction === "east") {
    cell.east = false;
    cells[row][col + 1].west = false;
  } else {
    cell.south = false;
    cells[row + 1][col].north = false;
  }
}
