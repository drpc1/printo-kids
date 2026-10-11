import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import { countPaths, generateMaze, mazeForSheet, type Maze } from "./generate.ts";
import { DEFAULT_LEVEL_ID, LEVELS, levelById, type MazePoint } from "./levels.ts";

const defaultLevel = levelById(DEFAULT_LEVEL_ID);

void describe("LEVELS", () => {
  void test("lists six age levels with the sheet grid, openings, and bands", () => {
    assert.equal(DEFAULT_LEVEL_ID, "lat5");
    assert.deepEqual(
      LEVELS.map((level) => ({
        id: level.id,
        label: level.label,
        columns: level.columns,
        rows: level.rows,
        entrance: level.entrance,
        exit: level.exit,
        pathMin: level.pathMin,
        pathMax: level.pathMax,
        spurMin: level.spurMin,
        spurMax: level.spurMax,
        showCharacter: level.showCharacter,
      })),
      [
        {
          id: "lat3",
          label: "3 lata",
          columns: 9,
          rows: 11,
          entrance: { row: 0, col: 4 },
          exit: { row: 10, col: 4 },
          pathMin: null,
          pathMax: 25,
          spurMin: null,
          spurMax: 6,
          showCharacter: true,
        },
        {
          id: "lat4",
          label: "4 lata",
          columns: 9,
          rows: 11,
          entrance: { row: 0, col: 4 },
          exit: { row: 10, col: 4 },
          pathMin: 40,
          pathMax: null,
          spurMin: null,
          spurMax: 9,
          showCharacter: true,
        },
        {
          id: "lat5",
          label: "5 lat",
          columns: 13,
          rows: 16,
          entrance: { row: 0, col: 6 },
          exit: { row: 15, col: 6 },
          pathMin: null,
          pathMax: 40,
          spurMin: null,
          spurMax: 6,
          showCharacter: true,
        },
        {
          id: "lat6",
          label: "6 lat",
          columns: 13,
          rows: 16,
          entrance: { row: 0, col: 6 },
          exit: { row: 15, col: 6 },
          pathMin: 70,
          pathMax: null,
          spurMin: null,
          spurMax: null,
          showCharacter: true,
        },
        {
          id: "lat7",
          label: "7–8 lat",
          columns: 17,
          rows: 21,
          entrance: { row: 0, col: 8 },
          exit: { row: 20, col: 8 },
          pathMin: 80,
          pathMax: 120,
          spurMin: null,
          spurMax: null,
          showCharacter: true,
        },
        {
          id: "nastolatek",
          label: "nastolatek",
          columns: 27,
          rows: 33,
          entrance: { row: 0, col: 0 },
          exit: { row: 32, col: 26 },
          pathMin: 150,
          pathMax: 300,
          spurMin: 25,
          spurMax: null,
          showCharacter: false,
        },
      ],
    );
  });
});

void describe("generateMaze", () => {
  void test("a fixed seed meets each level's grid, one route, length band, and spur rule", () => {
    for (const level of LEVELS) {
      const maze = generateMaze(level.id, mulberry32(1));
      assert.equal(maze.width, level.columns, level.id);
      assert.equal(maze.height, level.rows, level.id);
      assert.equal(maze.cells.length, level.rows, level.id);
      for (const row of maze.cells) {
        assert.equal(row.length, level.columns, level.id);
      }
      assert.equal(maze.cells[level.entrance.row][level.entrance.col].north, false, level.id);
      assert.equal(maze.cells[level.exit.row][level.exit.col].south, false, level.id);
      assert.equal(countPaths(maze, level.entrance, level.exit), 1, level.id);
      const length = routeCells(maze, level.entrance, level.exit).length;
      if (level.pathMin !== null) {
        assert.ok(length >= level.pathMin, `${level.id} route ${length}`);
      }
      if (level.pathMax !== null) {
        assert.ok(length <= level.pathMax, `${level.id} route ${length}`);
      }
      const spur = longestSpur(maze, level.entrance, level.exit);
      if (level.spurMax !== null) {
        assert.ok(spur <= level.spurMax, `${level.id} spur ${spur}`);
      }
      if (level.spurMin !== null) {
        assert.ok(spur >= level.spurMin, `${level.id} spur ${spur}`);
      }
    }
  });

  void test("the same random sequence produces identical walls", () => {
    const mazeA = generateMaze(DEFAULT_LEVEL_ID, mulberry32(42));
    const mazeB = generateMaze(DEFAULT_LEVEL_ID, mulberry32(42));
    assert.deepEqual(mazeA, mazeB);
  });

  void test("two seeds do not print the same walls", () => {
    assert.notDeepEqual(generateMaze(DEFAULT_LEVEL_ID, mulberry32(0)), generateMaze(DEFAULT_LEVEL_ID, mulberry32(1)));
  });

  void test("generateMaze does not call Math.random", () => {
    const randomMock = mock.method(Math, "random", () => {
      throw new Error("Math.random must not be called");
    });
    try {
      generateMaze(DEFAULT_LEVEL_ID, mulberry32(7));
      assert.equal(randomMock.mock.callCount(), 0);
    } finally {
      randomMock.mock.restore();
    }
  });
});

void describe("countPaths", () => {
  void test("an extra knocked-down wall yields more than one path", () => {
    const maze = generateMaze(DEFAULT_LEVEL_ID, mulberry32(1));
    const mutated = withExtraOpenWall(maze);
    assert.ok(countPaths(mutated, defaultLevel.entrance, defaultLevel.exit) > 1);
  });

  void test("stops counting once a second path exists", () => {
    const maze = cloneMaze(generateMaze(DEFAULT_LEVEL_ID, mulberry32(1)));
    for (let row = 0; row < maze.height; row += 1) {
      for (let col = 0; col < maze.width; col += 1) {
        if (col < maze.width - 1) {
          knockDown(maze, row, col, "east");
        }
        if (row < maze.height - 1) {
          knockDown(maze, row, col, "south");
        }
      }
    }
    assert.equal(countPaths(maze, defaultLevel.entrance, defaultLevel.exit), 2);
  });
});

void describe("mazeForSheet", () => {
  void test("returns null for a fully walled 13 by 16 grid", () => {
    const maze = cloneMaze(generateMaze(DEFAULT_LEVEL_ID, mulberry32(1)));
    for (const row of maze.cells) {
      for (const cell of row) {
        cell.north = true;
        cell.east = true;
        cell.south = true;
        cell.west = true;
      }
    }
    assert.equal(countPaths(maze, defaultLevel.entrance, defaultLevel.exit), 0);
    assert.equal(mazeForSheet(maze, DEFAULT_LEVEL_ID), null);
  });

  void test("returns null when path counting stops at 2", () => {
    const maze = cloneMaze(generateMaze(DEFAULT_LEVEL_ID, mulberry32(1)));
    for (let row = 0; row < maze.height; row += 1) {
      for (let col = 0; col < maze.width; col += 1) {
        if (col < maze.width - 1) {
          knockDown(maze, row, col, "east");
        }
        if (row < maze.height - 1) {
          knockDown(maze, row, col, "south");
        }
      }
    }
    assert.equal(countPaths(maze, defaultLevel.entrance, defaultLevel.exit), 2);
    assert.equal(mazeForSheet(maze, DEFAULT_LEVEL_ID), null);
  });

  void test("returns the same maze when one path exists", () => {
    const maze = generateMaze(DEFAULT_LEVEL_ID, mulberry32(1));
    assert.equal(countPaths(maze, defaultLevel.entrance, defaultLevel.exit), 1);
    assert.equal(mazeForSheet(maze, DEFAULT_LEVEL_ID), maze);
  });

  void test("returns null when the only route is outside the level's length band", () => {
    const maze = generateMaze("lat6", mulberry32(1));
    const lat5 = levelById("lat5");
    const length = routeCells(maze, lat5.entrance, lat5.exit).length;
    assert.ok(lat5.pathMax !== null && length > lat5.pathMax);
    assert.equal(mazeForSheet(maze, "lat5"), null);
  });

  void test("returns null when the longest spur is past the level limit", () => {
    const maze = combFromLeftColumn();
    const lat3 = levelById("lat3");
    const length = routeCells(maze, lat3.entrance, lat3.exit).length;
    const spur = longestSpur(maze, lat3.entrance, lat3.exit);
    assert.ok(lat3.pathMax !== null && length <= lat3.pathMax);
    assert.ok(lat3.spurMax !== null && spur > lat3.spurMax);
    assert.equal(mazeForSheet(maze, "lat3"), null);
  });
});

function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function routeCells(maze: Maze, entrance: MazePoint, exit: MazePoint): MazePoint[] {
  const start = cellKey(entrance);
  const goal = cellKey(exit);
  const parent = new Map<string, string | null>();
  parent.set(start, null);
  const queue: MazePoint[] = [entrance];
  let found = false;
  let index = 0;
  while (index < queue.length) {
    const current = queue[index];
    index += 1;
    if (cellKey(current) === goal) {
      found = true;
      break;
    }
    for (const next of openNeighbors(maze, current)) {
      const key = cellKey(next);
      if (parent.has(key)) {
        continue;
      }
      parent.set(key, cellKey(current));
      queue.push(next);
    }
  }
  if (!found) {
    return [];
  }
  const cells: MazePoint[] = [];
  let cursor: string | null = goal;
  while (cursor !== null) {
    const [row, col] = cursor.split(",").map(Number);
    cells.push({ row, col });
    cursor = parent.get(cursor) ?? null;
  }
  cells.reverse();
  return cells;
}

function longestSpur(maze: Maze, entrance: MazePoint, exit: MazePoint): number {
  const onPath = new Set(routeCells(maze, entrance, exit).map(cellKey));
  if (onPath.size === 0) {
    return Number.POSITIVE_INFINITY;
  }
  const depth = new Map<string, number>();
  const queue: MazePoint[] = [];
  for (const key of onPath) {
    depth.set(key, 0);
    const [row, col] = key.split(",").map(Number);
    queue.push({ row, col });
  }
  let max = 0;
  const seen = new Set(onPath);
  let index = 0;
  while (index < queue.length) {
    const current = queue[index];
    index += 1;
    const currentDepth = depth.get(cellKey(current)) ?? 0;
    for (const next of openNeighbors(maze, current)) {
      const key = cellKey(next);
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
    return Number.POSITIVE_INFINITY;
  }
  return max;
}

function openNeighbors(maze: Maze, point: MazePoint): MazePoint[] {
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

function cellKey(point: MazePoint): string {
  return `${point.row},${point.col}`;
}

function combFromLeftColumn(): Maze {
  const columns = 9;
  const rows = 11;
  const maze: Maze = {
    width: columns,
    height: rows,
    cells: Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => ({
        north: true,
        east: true,
        south: true,
        west: true,
      })),
    ),
  };
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns - 1; col += 1) {
      knockDown(maze, row, col, "east");
    }
    if (row < rows - 1) {
      knockDown(maze, row, 0, "south");
    }
  }
  return maze;
}

function cloneMaze(maze: Maze): Maze {
  return {
    width: maze.width,
    height: maze.height,
    cells: maze.cells.map((row) => row.map((cell) => ({ ...cell }))),
  };
}

function knockDown(maze: Maze, row: number, col: number, direction: "east" | "south"): void {
  const cell = maze.cells[row][col];
  if (direction === "east") {
    cell.east = false;
    maze.cells[row][col + 1].west = false;
  } else {
    cell.south = false;
    maze.cells[row + 1][col].north = false;
  }
}

function withExtraOpenWall(maze: Maze): Maze {
  for (let row = 0; row < maze.height; row += 1) {
    for (let col = 0; col < maze.width; col += 1) {
      const cell = maze.cells[row][col];
      if (col < maze.width - 1 && cell.east) {
        const candidate = cloneMaze(maze);
        knockDown(candidate, row, col, "east");
        if (countPaths(candidate, defaultLevel.entrance, defaultLevel.exit) > 1) {
          return candidate;
        }
      }
      if (row < maze.height - 1 && cell.south) {
        const candidate = cloneMaze(maze);
        knockDown(candidate, row, col, "south");
        if (countPaths(candidate, defaultLevel.entrance, defaultLevel.exit) > 1) {
          return candidate;
        }
      }
    }
  }
  throw new Error("Could not find an extra wall that creates a second path");
}
