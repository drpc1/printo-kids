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
          pathMin: 24,
          pathMax: 44,
          spurMin: null,
          spurMax: 4,
          showCharacter: true,
        },
        {
          id: "lat4",
          label: "4 lata",
          columns: 9,
          rows: 11,
          entrance: { row: 0, col: 4 },
          exit: { row: 10, col: 4 },
          pathMin: 50,
          pathMax: 80,
          spurMin: null,
          spurMax: null,
          showCharacter: true,
        },
        {
          id: "lat5",
          label: "5 lat",
          columns: 13,
          rows: 16,
          entrance: { row: 0, col: 6 },
          exit: { row: 15, col: 6 },
          pathMin: 56,
          pathMax: 96,
          spurMin: null,
          spurMax: 4,
          showCharacter: true,
        },
        {
          id: "lat6",
          label: "6 lat",
          columns: 13,
          rows: 16,
          entrance: { row: 0, col: 6 },
          exit: { row: 15, col: 6 },
          pathMin: 56,
          pathMax: 96,
          spurMin: null,
          spurMax: 4,
          showCharacter: true,
        },
        {
          id: "lat7",
          label: "7–8 lat",
          columns: 17,
          rows: 21,
          entrance: { row: 0, col: 8 },
          exit: { row: 20, col: 8 },
          pathMin: 150,
          pathMax: 240,
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
          pathMin: 280,
          pathMax: 500,
          spurMin: 25,
          spurMax: null,
          showCharacter: false,
        },
      ],
    );
  });
});

void describe("generateMaze", () => {
  void test("a fixed seed meets each level's grid, one winding route, and the run rule", () => {
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
      const route = routeCells(maze, level.entrance, level.exit);
      assert.ok(level.pathMin !== null && route.length >= level.pathMin, `${level.id} route ${route.length}`);
      assert.ok(level.pathMax !== null && route.length <= level.pathMax, `${level.id} route ${route.length}`);
      const third = Math.floor(level.columns / 3);
      assert.ok(
        route.some((point) => point.col < third),
        `${level.id} left third`,
      );
      assert.ok(
        route.some((point) => point.col >= level.columns - third),
        `${level.id} right third`,
      );
      assert.ok(
        route.some((point, index) => index > 0 && point.row < route[index - 1].row),
        `${level.id} upward step`,
      );
      const runs = straightRuns(route);
      assert.ok(
        runs.every((run) => run < 5),
        `${level.id} runs ${runs.join(",")}`,
      );
      const fours = runs.filter((run) => run === 4).length;
      const shorts = runs.filter((run) => run <= 3).length;
      assert.ok(fours < shorts, `${level.id} fours ${fours} shorts ${shorts}`);
    }
  });

  void test("a fixed seed keeps every spur inside the level threshold and the whole maze winding", () => {
    for (const level of LEVELS) {
      const maze = generateMaze(level.id, mulberry32(1));
      const spur = longestSpur(maze, level.entrance, level.exit);
      if (level.spurMax !== null) {
        assert.ok(spur <= level.spurMax, `${level.id} spur ${spur}`);
      }
      if (level.spurMin !== null) {
        assert.ok(spur >= level.spurMin, `${level.id} spur ${spur}`);
      }
      const runs = wholeMazeRuns(maze, level.entrance, level.exit);
      assert.ok(
        runs.every((run) => run < 5),
        `${level.id} runs ${runs.join(",")}`,
      );
      const fours = runs.filter((run) => run === 4).length;
      const shorts = runs.filter((run) => run <= 3).length;
      assert.ok(fours < shorts, `${level.id} fours ${fours} shorts ${shorts}`);
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

  void test("six years keeps the five-year winding maze", () => {
    assert.deepEqual(generateMaze("lat6", mulberry32(1)), generateMaze("lat5", mulberry32(1)));
  });

  void test("several seeds draw more than one solution route", () => {
    const signatures = new Set<string>();
    for (let seed = 0; seed < 8; seed += 1) {
      const maze = generateMaze(DEFAULT_LEVEL_ID, mulberry32(seed));
      assert.equal(countPaths(maze, defaultLevel.entrance, defaultLevel.exit), 1, `seed ${seed}`);
      const route = routeCells(maze, defaultLevel.entrance, defaultLevel.exit);
      assert.ok(defaultLevel.pathMin !== null && route.length >= defaultLevel.pathMin, `seed ${seed} ${route.length}`);
      assert.ok(defaultLevel.pathMax !== null && route.length <= defaultLevel.pathMax, `seed ${seed} ${route.length}`);
      const third = Math.floor(defaultLevel.columns / 3);
      assert.ok(
        route.some((point) => point.col < third),
        `seed ${seed} left`,
      );
      assert.ok(
        route.some((point) => point.col >= defaultLevel.columns - third),
        `seed ${seed} right`,
      );
      assert.ok(
        route.some((point, index) => index > 0 && point.row < route[index - 1].row),
        `seed ${seed} up`,
      );
      const routeRuns = straightRuns(route);
      assert.ok(
        routeRuns.every((run) => run < 5),
        `seed ${seed} route`,
      );
      const mazeRuns = wholeMazeRuns(maze, defaultLevel.entrance, defaultLevel.exit);
      assert.ok(
        mazeRuns.every((run) => run < 5),
        `seed ${seed} maze`,
      );
      assert.ok(longestSpur(maze, defaultLevel.entrance, defaultLevel.exit) <= 4, `seed ${seed} spur`);
      signatures.add(route.map((point) => `${point.row},${point.col}`).join(" "));
    }
    assert.ok(signatures.size > 1);
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
    const level = levelById("lat4");
    const maze = generateMaze(level.id, mulberry32(1));
    assert.equal(countPaths(maze, level.entrance, level.exit), 1);
    assert.equal(mazeForSheet(maze, level.id), maze);
  });

  void test("returns null when the only route is outside the level's length band", () => {
    const maze = longFiveYearSheet();
    const lat5 = levelById("lat5");
    const length = routeCells(maze, lat5.entrance, lat5.exit).length;
    assert.equal(maze.width, lat5.columns);
    assert.equal(maze.height, lat5.rows);
    assert.equal(countPaths(maze, lat5.entrance, lat5.exit), 1);
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

  void test("returns null when the maze contains a run of 5 cells", () => {
    const level = levelById("lat4");
    const maze = lat4WithStraightRun();
    const route = routeCells(maze, level.entrance, level.exit);
    const spur = longestSpur(maze, level.entrance, level.exit);
    assert.equal(countPaths(maze, level.entrance, level.exit), 1);
    assert.ok(level.pathMin !== null && route.length >= level.pathMin);
    assert.ok(level.pathMax !== null && route.length <= level.pathMax);
    assert.equal(level.spurMin, null);
    assert.equal(level.spurMax, null);
    assert.ok(Number.isFinite(spur));
    assert.ok(wholeMazeRuns(maze, level.entrance, level.exit).some((run) => run >= 5));
    assert.equal(mazeForSheet(maze, "lat4"), null);
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

function straightRuns(route: MazePoint[]): number[] {
  if (route.length < 2) {
    return route.length === 0 ? [] : [1];
  }
  const runs: number[] = [];
  let length = 2;
  let direction = runDirection(route[0], route[1]);
  for (let index = 2; index < route.length; index += 1) {
    const next = runDirection(route[index - 1], route[index]);
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

function runDirection(from: MazePoint, to: MazePoint): "north" | "east" | "south" | "west" {
  if (to.row === from.row) {
    return to.col > from.col ? "east" : "west";
  }
  return to.row > from.row ? "south" : "north";
}

function wholeMazeRuns(maze: Maze, entrance: MazePoint, exit: MazePoint): number[] {
  const route = routeCells(maze, entrance, exit);
  const runs = straightRuns(route);
  if (route.length === 0) {
    return runs;
  }
  const depth = new Map<string, number>();
  const parent = new Map<string, string>();
  const queue: MazePoint[] = [...route];
  for (const point of route) {
    depth.set(cellKey(point), 0);
  }
  let index = 0;
  while (index < queue.length) {
    const current = queue[index];
    index += 1;
    const currentDepth = depth.get(cellKey(current)) ?? 0;
    for (const next of openNeighbors(maze, current)) {
      const key = cellKey(next);
      if (depth.has(key)) {
        continue;
      }
      depth.set(key, currentDepth + 1);
      parent.set(key, cellKey(current));
      queue.push(next);
    }
  }
  for (const [key, parentKey] of parent) {
    const point = keyToPoint(key);
    const from = keyToPoint(parentKey);
    const direction = runDirection(from, point);
    const grandKey = parent.get(parentKey);
    if (grandKey !== undefined && runDirection(keyToPoint(grandKey), from) === direction) {
      continue;
    }
    let length = 1;
    let cursor = point;
    let cursorKey = key;
    let child = continuingChild(maze, parent, cursor, cursorKey, direction);
    while (child !== undefined) {
      length += 1;
      cursor = child;
      cursorKey = cellKey(child);
      child = continuingChild(maze, parent, cursor, cursorKey, direction);
    }
    runs.push(length);
  }
  return runs;
}

function continuingChild(
  maze: Maze,
  parent: Map<string, string>,
  cursor: MazePoint,
  cursorKey: string,
  direction: "north" | "east" | "south" | "west",
): MazePoint | undefined {
  return openNeighbors(maze, cursor).find(
    (next) => parent.get(cellKey(next)) === cursorKey && runDirection(cursor, next) === direction,
  );
}

function keyToPoint(key: string): MazePoint {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}

function lat4WithStraightRun(): Maze {
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
  const path: MazePoint[] = [];
  for (let col = 4; col <= 8; col += 1) {
    path.push({ row: 0, col });
  }
  for (let col = 8; col >= 0; col -= 1) {
    path.push({ row: 1, col });
  }
  for (let col = 0; col <= 8; col += 1) {
    path.push({ row: 2, col });
  }
  for (let col = 8; col >= 0; col -= 1) {
    path.push({ row: 3, col });
  }
  for (let col = 0; col <= 8; col += 1) {
    path.push({ row: 4, col });
  }
  for (let col = 8; col >= 4; col -= 1) {
    path.push({ row: 5, col });
  }
  for (let row = 6; row <= 10; row += 1) {
    path.push({ row, col: 4 });
  }
  for (let index = 0; index < path.length - 1; index += 1) {
    openOrthogonal(maze, path[index], path[index + 1]);
  }
  const seen = new Set(path.map(cellKey));
  let grew = true;
  while (grew) {
    grew = false;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const key = `${row},${col}`;
        if (seen.has(key)) {
          continue;
        }
        const neighbors = [
          { row: row - 1, col },
          { row, col: col + 1 },
          { row: row + 1, col },
          { row, col: col - 1 },
        ].filter(
          (point) =>
            point.row >= 0 && point.col >= 0 && point.row < rows && point.col < columns && seen.has(cellKey(point)),
        );
        const anchor = neighbors.at(0);
        if (anchor === undefined) {
          continue;
        }
        openOrthogonal(maze, { row, col }, anchor);
        seen.add(key);
        grew = true;
      }
    }
  }
  return maze;
}

function longFiveYearSheet(): Maze {
  const columns = 13;
  const rows = 16;
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
  const path: MazePoint[] = [];
  for (let row = 0; row < 10; row += 1) {
    const leftToRight = row % 2 === 0;
    for (let index = 0; index < columns; index += 1) {
      path.push({ row, col: leftToRight ? index : columns - 1 - index });
    }
  }
  for (let row = 10; row <= 15; row += 1) {
    path.push({ row, col: 0 });
  }
  for (let col = 1; col <= 6; col += 1) {
    path.push({ row: 15, col });
  }
  for (let index = 0; index < path.length - 1; index += 1) {
    openOrthogonal(maze, path[index], path[index + 1]);
  }
  return maze;
}

function openOrthogonal(maze: Maze, from: MazePoint, to: MazePoint): void {
  if (from.row === to.row && to.col === from.col + 1) {
    knockDown(maze, from.row, from.col, "east");
    return;
  }
  if (from.row === to.row && from.col === to.col + 1) {
    knockDown(maze, to.row, to.col, "east");
    return;
  }
  if (from.col === to.col && to.row === from.row + 1) {
    knockDown(maze, from.row, from.col, "south");
    return;
  }
  if (from.col === to.col && from.row === to.row + 1) {
    knockDown(maze, to.row, to.col, "south");
    return;
  }
  throw new Error("Passage is not between orthogonal cells");
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
