import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import { countPaths, generateMaze, mazeForSheet, type Maze } from "./generate.ts";
import { DEFAULT_LEVEL_ID, LEVELS, levelById, type LevelId, type MazePoint } from "./levels.ts";

const defaultLevel = levelById(DEFAULT_LEVEL_ID);

void describe("LEVELS", () => {
  void test("lists six levels with the sheet grid, openings, and algorithm", () => {
    assert.equal(DEFAULT_LEVEL_ID, "lat5");
    for (const level of LEVELS) {
      assert.doesNotMatch(level.label + level.barLabel, /lat|nastolat/, level.id);
    }
    assert.deepEqual(
      LEVELS.map((level) => ({
        id: level.id,
        label: level.label,
        barLabel: level.barLabel,
        description: level.description,
        typicalAge: level.typicalAge,
        columns: level.columns,
        rows: level.rows,
        entrance: level.entrance,
        exit: level.exit,
        algorithm: level.algorithm,
        showCharacter: level.showCharacter,
      })),
      [
        {
          id: "lat3",
          label: "Poziom 1",
          barLabel: "1",
          description: "szerokie alejki, krótka droga",
          typicalAge: "zwykle ok. 3 lata",
          columns: 9,
          rows: 11,
          entrance: { row: 0, col: 4 },
          exit: { row: 10, col: 4 },
          algorithm: "kruskal",
          showCharacter: true,
        },
        {
          id: "lat4",
          label: "Poziom 2",
          barLabel: "2",
          description: "szerokie alejki, długa kręta droga",
          typicalAge: "zwykle ok. 4 lata",
          columns: 9,
          rows: 11,
          entrance: { row: 0, col: 4 },
          exit: { row: 10, col: 4 },
          algorithm: "backtracker",
          showCharacter: true,
        },
        {
          id: "lat5",
          label: "Poziom 3",
          barLabel: "3",
          description: "węższe alejki, krótka droga",
          typicalAge: "zwykle ok. 5 lat",
          columns: 13,
          rows: 16,
          entrance: { row: 0, col: 6 },
          exit: { row: 15, col: 6 },
          algorithm: "kruskal",
          showCharacter: true,
        },
        {
          id: "lat6",
          label: "Poziom 4",
          barLabel: "4",
          description: "węższe alejki, długa kręta droga",
          typicalAge: "zwykle ok. 6 lat",
          columns: 13,
          rows: 16,
          entrance: { row: 0, col: 6 },
          exit: { row: 15, col: 6 },
          algorithm: "backtracker",
          showCharacter: true,
        },
        {
          id: "lat7",
          label: "Poziom 5",
          barLabel: "5",
          description: "wąskie alejki, bardzo długa droga",
          typicalAge: "zwykle 7–8 lat",
          columns: 17,
          rows: 21,
          entrance: { row: 0, col: 8 },
          exit: { row: 20, col: 8 },
          algorithm: "backtracker",
          showCharacter: true,
        },
        {
          id: "nastolatek",
          label: "Poziom 6",
          barLabel: "6",
          description: "najwęższe alejki, start i meta w rogach",
          typicalAge: "zwykle nastolatki",
          columns: 27,
          rows: 33,
          entrance: { row: 0, col: 0 },
          exit: { row: 32, col: 26 },
          algorithm: "backtracker",
          showCharacter: true,
        },
      ],
    );
  });
});

void describe("generateMaze", () => {
  void test("every level draws its grid, open entrance and exit, one route, and reaches every cell", () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < 5; seed += 1) {
        const label = `${level.id} seed ${seed}`;
        const maze = generateMaze(level.id, mulberry32(seed));
        assert.equal(maze.width, level.columns, label);
        assert.equal(maze.height, level.rows, label);
        assert.equal(maze.cells.length, level.rows, label);
        for (const row of maze.cells) {
          assert.equal(row.length, level.columns, label);
        }
        assert.equal(maze.cells[level.entrance.row][level.entrance.col].north, false, label);
        assert.equal(maze.cells[level.exit.row][level.exit.col].south, false, label);
        assert.equal(countPaths(maze, level.entrance, level.exit), 1, label);
        assert.equal(reachableCount(maze, level.entrance), level.columns * level.rows, label);
      }
    }
  });

  void test("on 200 seeds the median route of 4 years is longer than 3 years, and 6 years than 5 years", () => {
    const lat3 = medianRoute("lat3");
    const lat4 = medianRoute("lat4");
    const lat5 = medianRoute("lat5");
    const lat6 = medianRoute("lat6");
    assert.ok(lat4 > lat3, `lat4 ${lat4} lat3 ${lat3}`);
    assert.ok(lat6 > lat5, `lat6 ${lat6} lat5 ${lat5}`);
  });

  void test("no level repeats one fixed route", () => {
    for (const level of LEVELS) {
      const routes = new Set<string>();
      for (let seed = 0; seed < 8; seed += 1) {
        const route = routeCells(generateMaze(level.id, mulberry32(seed)), level.entrance, level.exit);
        routes.add(route.map(cellKey).join(" "));
      }
      assert.ok(routes.size >= 2, `${level.id} routes ${routes.size}`);
    }
  });

  void test("Kruskal levels close both east and south somewhere above the last corner", () => {
    for (const level of LEVELS.filter((entry) => entry.algorithm === "kruskal")) {
      for (let seed = 0; seed < 5; seed += 1) {
        const maze = generateMaze(level.id, mulberry32(seed));
        const closed = maze.cells.some((row, rowIndex) =>
          row.some(
            (cell, colIndex) =>
              cell.east && cell.south && !(rowIndex === maze.height - 1 && colIndex === maze.width - 1),
          ),
        );
        assert.ok(closed, `${level.id} seed ${seed}`);
      }
    }
  });

  void test("the same random sequence produces identical walls", () => {
    for (const level of LEVELS) {
      assert.deepEqual(generateMaze(level.id, mulberry32(42)), generateMaze(level.id, mulberry32(42)), level.id);
    }
  });

  void test("two seeds do not print the same walls", () => {
    assert.notDeepEqual(generateMaze(DEFAULT_LEVEL_ID, mulberry32(0)), generateMaze(DEFAULT_LEVEL_ID, mulberry32(1)));
  });

  void test("generateMaze does not call Math.random", () => {
    const randomMock = mock.method(Math, "random", () => {
      throw new Error("Math.random must not be called");
    });
    try {
      for (const level of LEVELS) {
        generateMaze(level.id, mulberry32(7));
      }
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
    const maze = fullyOpen(generateMaze(DEFAULT_LEVEL_ID, mulberry32(1)));
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
    const maze = fullyOpen(generateMaze(DEFAULT_LEVEL_ID, mulberry32(1)));
    assert.equal(countPaths(maze, defaultLevel.entrance, defaultLevel.exit), 2);
    assert.equal(mazeForSheet(maze, DEFAULT_LEVEL_ID), null);
  });

  void test("returns null when the maze grid is not the level grid", () => {
    const lat3 = levelById("lat3");
    const maze = generateMaze("lat5", mulberry32(1));
    assert.equal(countPaths(maze, lat3.entrance, lat3.exit), 1);
    assert.equal(mazeForSheet(maze, lat3.id), null);
  });

  void test("returns the same maze when one path exists", () => {
    for (const level of LEVELS) {
      const maze = generateMaze(level.id, mulberry32(1));
      assert.equal(mazeForSheet(maze, level.id), maze, level.id);
    }
  });
});

function medianRoute(id: LevelId): number {
  const level = levelById(id);
  const lengths: number[] = [];
  for (let seed = 0; seed < 200; seed += 1) {
    lengths.push(routeCells(generateMaze(id, mulberry32(seed)), level.entrance, level.exit).length);
  }
  lengths.sort((a, b) => a - b);
  return (lengths[99] + lengths[100]) / 2;
}

function reachableCount(maze: Maze, start: MazePoint): number {
  const seen = new Set<string>([cellKey(start)]);
  const queue: MazePoint[] = [start];
  for (const current of queue) {
    for (const next of openNeighbors(maze, current)) {
      const key = cellKey(next);
      if (!seen.has(key)) {
        seen.add(key);
        queue.push(next);
      }
    }
  }
  return seen.size;
}

function fullyOpen(source: Maze): Maze {
  const maze = cloneMaze(source);
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
  return maze;
}

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
