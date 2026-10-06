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

const WIDTH = 13;
const HEIGHT = 16;
const ENTRANCE_ROW = 0;
const ENTRANCE_COL = 6;
const EXIT_ROW = 15;
const EXIT_COL = 6;

interface WallEdge {
  row: number;
  col: number;
  direction: "east" | "south";
}

export function generateMaze(random: () => number): Maze {
  const cells = createCells();
  const edges = listInternalEdges();
  shuffle(edges, random);
  const { union } = createUnionFind(WIDTH * HEIGHT);

  for (const edge of edges) {
    const from = cellIndex(edge.row, edge.col);
    const to = edge.direction === "east" ? cellIndex(edge.row, edge.col + 1) : cellIndex(edge.row + 1, edge.col);
    if (union(from, to)) {
      openPassage(cells, edge.row, edge.col, edge.direction);
    }
  }

  cells[ENTRANCE_ROW][ENTRANCE_COL].north = false;
  cells[EXIT_ROW][EXIT_COL].south = false;

  return { width: WIDTH, height: HEIGHT, cells };
}

export function countPaths(maze: Maze): number {
  let found = 0;
  const visited = Array.from({ length: maze.height }, () => Array.from({ length: maze.width }, () => false));

  function walk(row: number, col: number): void {
    if (found >= 2) {
      return;
    }
    if (row === EXIT_ROW && col === EXIT_COL) {
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

  walk(ENTRANCE_ROW, ENTRANCE_COL);
  return found;
}

export function mazeForSheet(candidate: Maze): Maze | null {
  if (countPaths(candidate) === 1) {
    return candidate;
  }
  return null;
}

function createCells(): MazeCell[][] {
  return Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, (): MazeCell => ({
      north: true,
      east: true,
      south: true,
      west: true,
    })),
  );
}

function listInternalEdges(): WallEdge[] {
  const edges: WallEdge[] = [];
  for (let row = 0; row < HEIGHT; row += 1) {
    for (let col = 0; col < WIDTH; col += 1) {
      if (col < WIDTH - 1) {
        edges.push({ row, col, direction: "east" });
      }
      if (row < HEIGHT - 1) {
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

function cellIndex(row: number, col: number): number {
  return row * WIDTH + col;
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
