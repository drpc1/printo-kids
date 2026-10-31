import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import { countPaths, generateCandidate, generateMaze, mazeForSheet, scoreMaze, type Maze } from "./generate.ts";
import { DEFAULT_LEVEL_ID, LEVELS, levelById, type LevelId, type MazePoint } from "./levels.ts";

void describe("LEVELS", () => {
  void test("lists six levels with the sheet grid, entrance, exit columns, and algorithm", () => {
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
        exitColumns: level.exitColumns,
        algorithm: level.algorithm,
        showCharacter: level.showCharacter,
      })),
      [
        {
          id: "lat3",
          label: "Poziom 1",
          barLabel: "1",
          description: "najszersze alejki, krótka droga",
          typicalAge: "zwykle ok. 3 lata",
          columns: 9,
          rows: 11,
          entrance: { row: 0, col: 4 },
          exitColumns: [0, 1, 2, 6, 7, 8],
          algorithm: "kruskal",
          showCharacter: true,
        },
        {
          id: "lat4",
          label: "Poziom 2",
          barLabel: "2",
          description: "szerokie alejki, kręta droga",
          typicalAge: "zwykle ok. 4 lata",
          columns: 11,
          rows: 13,
          entrance: { row: 0, col: 5 },
          exitColumns: [0, 1, 2, 3, 7, 8, 9, 10],
          algorithm: "backtracker",
          showCharacter: true,
        },
        {
          id: "lat5",
          label: "Poziom 3",
          barLabel: "3",
          description: "węższe alejki, dłuższa kręta droga",
          typicalAge: "zwykle ok. 5 lat",
          columns: 13,
          rows: 16,
          entrance: { row: 0, col: 6 },
          exitColumns: [0, 1, 2, 3, 4, 8, 9, 10, 11, 12],
          algorithm: "backtracker",
          showCharacter: true,
        },
        {
          id: "lat6",
          label: "Poziom 4",
          barLabel: "4",
          description: "wąskie alejki, długa kręta droga",
          typicalAge: "zwykle ok. 6 lat",
          columns: 15,
          rows: 18,
          entrance: { row: 0, col: 7 },
          exitColumns: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14],
          algorithm: "backtracker",
          showCharacter: true,
        },
        {
          id: "lat7",
          label: "Poziom 5",
          barLabel: "5",
          description: "bardzo wąskie alejki, bardzo długa droga",
          typicalAge: "zwykle 7–8 lat",
          columns: 19,
          rows: 23,
          entrance: { row: 0, col: 9 },
          exitColumns: [0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 18],
          algorithm: "backtracker",
          showCharacter: true,
        },
        {
          id: "nastolatek",
          label: "Poziom 6",
          barLabel: "6",
          description: "najwęższe alejki, start i meta w rogach",
          typicalAge: "zwykle nastolatki",
          columns: 29,
          rows: 35,
          entrance: { row: 0, col: 0 },
          exitColumns: [28],
          algorithm: "backtracker",
          showCharacter: true,
        },
      ],
    );
  });

  void test("every level has its own aisle width", () => {
    const widths = LEVELS.map((level) => 190 / level.columns);
    assert.equal(new Set(widths).size, LEVELS.length);
    assert.deepEqual(
      [...widths].sort((a, b) => b - a),
      widths,
    );
  });

  void test("younger levels keep every exit column at least two columns from the entrance", () => {
    for (const level of LEVELS.filter((entry) => entry.id !== "nastolatek")) {
      for (const column of level.exitColumns) {
        assert.ok(Math.abs(column - level.entrance.col) >= 2, `${level.id} ${column}`);
      }
    }
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
        assert.deepEqual(maze.entrance, level.entrance, label);
        assert.equal(maze.exit.row, level.rows - 1, label);
        assert.ok(level.exitColumns.includes(maze.exit.col), label);
        assert.equal(maze.cells[maze.entrance.row][maze.entrance.col].north, false, label);
        assert.equal(maze.cells[maze.exit.row][maze.exit.col].south, false, label);
        assert.equal(countPaths(maze, maze.entrance, maze.exit), 1, label);
        assert.equal(reachableCount(maze, level.entrance), level.columns * level.rows, label);
      }
    }
  });

  void test("the median route grows with the level", () => {
    const medians = LEVELS.map((level) => median(routeLengths(level.id)));
    for (let index = 1; index < medians.length; index += 1) {
      assert.ok(medians[index] > medians[index - 1], `${LEVELS[index].id} ${medians[index]} vs ${medians[index - 1]}`);
    }
  });

  void test("picking the best of several mazes lifts the weakest cards on every level", () => {
    for (const level of LEVELS) {
      const picked = percentile(deepBranchCounts(level.id, "picked"), 0.1);
      const single = percentile(deepBranchCounts(level.id, "single"), 0.1);
      assert.ok(picked > single, `${level.id} picked ${picked} single ${single}`);
    }
  });

  void test("deep branches sit on both halves of the route", () => {
    for (const level of LEVELS.filter((entry) => entry.id !== "lat3")) {
      const halves = routeHalves(level.id);
      assert.ok(halves.first >= 0.7 * halves.second, `${level.id} first ${halves.first} second ${halves.second}`);
    }
  });

  void test("the route does not hug the middle of the page on the younger levels", () => {
    for (const level of LEVELS.filter((entry) => entry.id !== "nastolatek")) {
      const share = mean(sample(level.id).map((maze) => centralShare(maze)));
      assert.ok(share < 0.5, `${level.id} ${share}`);
    }
  });

  void test("Poziom 1 keeps a short route: under a third of its cells", () => {
    const level = levelById("lat3");
    assert.ok(median(routeLengths("lat3")) < (level.columns * level.rows) / 3);
  });

  void test("the exit lands in several columns on the younger levels", () => {
    for (const level of LEVELS.filter((entry) => entry.id !== "nastolatek")) {
      const columns = new Set(sample(level.id).map((maze) => maze.exit.col));
      assert.ok(columns.size >= 3, `${level.id} ${columns.size}`);
    }
  });

  void test("a Poziom 6 sheet is drawn in well under a second", () => {
    const started = performance.now();
    for (let seed = 0; seed < 20; seed += 1) {
      generateMaze("nastolatek", mulberry32(seed));
    }
    assert.ok((performance.now() - started) / 20 < 500);
  });

  void test("no level repeats one fixed route", () => {
    for (const level of LEVELS) {
      const routes = new Set<string>();
      for (let seed = 0; seed < 8; seed += 1) {
        const maze = generateMaze(level.id, mulberry32(seed));
        const route = routeCells(maze, maze.entrance, maze.exit);
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

void describe("scoreMaze", () => {
  void test("a bare corridor in the middle column scores minus ten", () => {
    assert.equal(scoreMaze(corridorWithBranch(0)), -10);
  });

  void test("a side branch four cells deep is not deep, five cells deep is worth three", () => {
    assert.equal(scoreMaze(corridorWithBranch(4)), -10);
    assert.equal(scoreMaze(corridorWithBranch(5)), -7);
    assert.equal(scoreMaze(corridorWithBranch(6)), -7);
  });

  void test("the middle third ends before the last column", () => {
    assert.equal(scoreMaze(corridorWithBranch(0, 2)), 0);
    assert.equal(scoreMaze(corridorWithBranch(0, 0)), 0);
  });

  void test("a route outside the middle third scores higher than one inside it", () => {
    assert.ok(scoreMaze(corridorWithBranch(0, 0)) > scoreMaze(corridorWithBranch(0, 1)));
  });
});

void describe("countPaths", () => {
  void test("an extra knocked-down wall yields more than one path", () => {
    const maze = generateMaze(DEFAULT_LEVEL_ID, mulberry32(1));
    const mutated = withExtraOpenWall(maze);
    assert.ok(countPaths(mutated, mutated.entrance, mutated.exit) > 1);
  });

  void test("stops counting once a second path exists", () => {
    const maze = fullyOpen(generateMaze(DEFAULT_LEVEL_ID, mulberry32(1)));
    assert.equal(countPaths(maze, maze.entrance, maze.exit), 2);
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
    assert.equal(countPaths(maze, maze.entrance, maze.exit), 0);
    assert.equal(mazeForSheet(maze, DEFAULT_LEVEL_ID), null);
  });

  void test("returns null when path counting stops at 2", () => {
    const maze = fullyOpen(generateMaze(DEFAULT_LEVEL_ID, mulberry32(1)));
    assert.equal(countPaths(maze, maze.entrance, maze.exit), 2);
    assert.equal(mazeForSheet(maze, DEFAULT_LEVEL_ID), null);
  });

  void test("returns null when the maze grid is not the level grid", () => {
    const maze = generateMaze("lat5", mulberry32(1));
    assert.equal(countPaths(maze, maze.entrance, maze.exit), 1);
    assert.equal(mazeForSheet(maze, "lat3"), null);
  });

  void test("returns null when the exit is not in one of the level's exit columns", () => {
    const level = levelById("lat5");
    const maze = cloneMaze(generateMaze("lat5", mulberry32(1)));
    const wrong = level.entrance.col;
    assert.ok(!level.exitColumns.includes(wrong));
    maze.cells[maze.exit.row][maze.exit.col].south = true;
    maze.exit = { row: maze.height - 1, col: wrong };
    maze.cells[maze.exit.row][maze.exit.col].south = false;
    assert.equal(mazeForSheet(maze, "lat5"), null);
  });

  void test("returns null when the exit is not in the bottom row", () => {
    const maze = cloneMaze(generateMaze("lat5", mulberry32(1)));
    maze.exit = { row: maze.height - 2, col: maze.exit.col };
    assert.equal(mazeForSheet(maze, "lat5"), null);
  });

  void test("returns null when the entrance is not in the level's entrance row", () => {
    const maze = cloneMaze(generateMaze("lat5", mulberry32(1)));
    maze.entrance = { row: 1, col: maze.entrance.col };
    assert.equal(mazeForSheet(maze, "lat5"), null);
  });

  void test("returns null when the entrance is not the level's entrance", () => {
    const maze = cloneMaze(generateMaze("lat5", mulberry32(1)));
    maze.entrance = { row: 0, col: maze.entrance.col + 1 };
    assert.equal(mazeForSheet(maze, "lat5"), null);
  });

  void test("returns the same maze when one path exists", () => {
    for (const level of LEVELS) {
      const maze = generateMaze(level.id, mulberry32(1));
      assert.equal(mazeForSheet(maze, level.id), maze, level.id);
    }
  });
});

const SAMPLE_SEEDS = 100;
const samples = new Map<string, Maze[]>();

function sample(id: LevelId, kind: "picked" | "single" = "picked"): Maze[] {
  const key = `${id}/${kind}`;
  let mazes = samples.get(key);
  if (mazes === undefined) {
    const make = kind === "picked" ? generateMaze : generateCandidate;
    mazes = Array.from({ length: SAMPLE_SEEDS }, (_, seed) => make(id, mulberry32(seed)));
    samples.set(key, mazes);
  }
  return mazes;
}

function routeLengths(id: LevelId): number[] {
  return sample(id).map((maze) => routeCells(maze, maze.entrance, maze.exit).length);
}

/** A 3 by 8 maze with a straight route down `column` and, when `branchCells` > 0, a dead end of that many cells beside it. */
function corridorWithBranch(branchCells: number, column = 1): Maze {
  const maze: Maze = {
    width: 3,
    height: 8,
    cells: Array.from({ length: 8 }, () =>
      Array.from({ length: 3 }, () => ({ north: true, east: true, south: true, west: true })),
    ),
    entrance: { row: 0, col: column },
    exit: { row: 7, col: column },
  };
  for (let row = 0; row < 7; row += 1) {
    knockDown(maze, row, column, "south");
  }
  if (branchCells > 0) {
    const side = column === 1 ? 0 : 1;
    knockDown(maze, 0, Math.min(side, column), "east");
    for (let row = 0; row < branchCells - 1; row += 1) {
      knockDown(maze, row, side, "south");
    }
  }
  return maze;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  return percentile(values, 0.5);
}

function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(fraction * (sorted.length - 1))];
}

function centralShare(maze: Maze): number {
  const route = routeCells(maze, maze.entrance, maze.exit);
  const inMiddle = route.filter(
    (point) => point.col >= maze.width / 3 - 0.5 && point.col <= (2 * maze.width) / 3 - 0.5,
  );
  return inMiddle.length / route.length;
}

/** Side branches off the route whose dead-end part is at least 5 cells deep, per maze. */
function deepBranchCounts(id: LevelId, kind: "picked" | "single"): number[] {
  return sample(id, kind).map((maze) => deepBranchesByRouteIndex(maze).length);
}

function routeHalves(id: LevelId): { first: number; second: number } {
  let first = 0;
  let second = 0;
  for (const maze of sample(id)) {
    const route = routeCells(maze, maze.entrance, maze.exit);
    for (const index of deepBranchesByRouteIndex(maze)) {
      if (index < route.length / 2) {
        first += 1;
      } else {
        second += 1;
      }
    }
  }
  return { first: first / SAMPLE_SEEDS, second: second / SAMPLE_SEEDS };
}

/** The route index each deep side branch leaves from. */
function deepBranchesByRouteIndex(maze: Maze): number[] {
  const route = routeCells(maze, maze.entrance, maze.exit);
  const onRoute = new Set(route.map(cellKey));
  const indexes: number[] = [];
  route.forEach((point, index) => {
    for (const side of openNeighbors(maze, point)) {
      if (!onRoute.has(cellKey(side)) && deadEndDepth(maze, point, side) >= 5) {
        indexes.push(index);
      }
    }
  });
  return indexes;
}

function deadEndDepth(maze: Maze, from: MazePoint, side: MazePoint): number {
  let deepest = 1;
  const pending: [MazePoint, MazePoint, number][] = [[side, from, 1]];
  for (const [point, previous, depth] of pending) {
    deepest = Math.max(deepest, depth);
    for (const next of openNeighbors(maze, point)) {
      if (cellKey(next) !== cellKey(previous)) {
        pending.push([next, point, depth + 1]);
      }
    }
  }
  return deepest;
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
    entrance: { ...maze.entrance },
    exit: { ...maze.exit },
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
        if (countPaths(candidate, candidate.entrance, candidate.exit) > 1) {
          return candidate;
        }
      }
      if (row < maze.height - 1 && cell.south) {
        const candidate = cloneMaze(maze);
        knockDown(candidate, row, col, "south");
        if (countPaths(candidate, candidate.entrance, candidate.exit) > 1) {
          return candidate;
        }
      }
    }
  }
  throw new Error("Could not find an extra wall that creates a second path");
}
