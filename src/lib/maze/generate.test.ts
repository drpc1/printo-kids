import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import { countPaths, generateMaze, mazeForSheet, type Maze } from "./generate.ts";

void describe("generateMaze", () => {
  for (const seed of [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 99, 12345,
  ]) {
    void test(`seed ${seed} is a 13 by 16 maze with one path`, () => {
      const maze = generateMaze(mulberry32(seed));
      assertSolvableMaze(maze);
    });
  }

  void test("the same random sequence produces identical walls", () => {
    const mazeA = generateMaze(mulberry32(42));
    const mazeB = generateMaze(mulberry32(42));
    assert.deepEqual(mazeA, mazeB);
  });

  void test("generateMaze does not call Math.random", () => {
    const randomMock = mock.method(Math, "random", () => {
      throw new Error("Math.random must not be called");
    });
    try {
      generateMaze(mulberry32(7));
      assert.equal(randomMock.mock.callCount(), 0);
    } finally {
      randomMock.mock.restore();
    }
  });
});

void describe("countPaths", () => {
  void test("an extra knocked-down wall yields more than one path", () => {
    const maze = generateMaze(mulberry32(1));
    const mutated = withExtraOpenWall(maze);
    assert.ok(countPaths(mutated) > 1);
  });

  void test("stops counting once a second path exists", () => {
    const maze = cloneMaze(generateMaze(mulberry32(1)));
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
    assert.equal(countPaths(maze), 2);
  });
});

void describe("mazeForSheet", () => {
  void test("returns null for a fully walled 13 by 16 grid", () => {
    const maze = cloneMaze(generateMaze(mulberry32(1)));
    for (const row of maze.cells) {
      for (const cell of row) {
        cell.north = true;
        cell.east = true;
        cell.south = true;
        cell.west = true;
      }
    }
    assert.equal(countPaths(maze), 0);
    assert.equal(mazeForSheet(maze), null);
  });

  void test("returns null when path counting stops at 2", () => {
    const maze = cloneMaze(generateMaze(mulberry32(1)));
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
    assert.equal(countPaths(maze), 2);
    assert.equal(mazeForSheet(maze), null);
  });

  void test("returns the same maze when one path exists", () => {
    const maze = generateMaze(mulberry32(1));
    assert.equal(countPaths(maze), 1);
    assert.equal(mazeForSheet(maze), maze);
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

function assertSolvableMaze(maze: Maze): void {
  assert.equal(maze.width, 13);
  assert.equal(maze.height, 16);
  assert.equal(maze.cells.length, 16);
  for (const row of maze.cells) {
    assert.equal(row.length, 13);
  }
  assert.equal(maze.cells[0][6].north, false);
  assert.equal(maze.cells[15][6].south, false);
  assert.equal(countPaths(maze), 1);
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
        if (countPaths(candidate) > 1) {
          return candidate;
        }
      }
      if (row < maze.height - 1 && cell.south) {
        const candidate = cloneMaze(maze);
        knockDown(candidate, row, col, "south");
        if (countPaths(candidate) > 1) {
          return candidate;
        }
      }
    }
  }
  throw new Error("Could not find an extra wall that creates a second path");
}
