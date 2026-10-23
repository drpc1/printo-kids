import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { generateMaze, type Maze, type MazeCell } from "../maze/generate.ts";
import { collectWalls } from "./walls.ts";

const closed: MazeCell = { north: true, east: true, south: true, west: true };

function mazeOf(cells: MazeCell[][]): Maze {
  return { width: cells[0]?.length ?? 0, height: cells.length, cells };
}

function geometry(walls: ReturnType<typeof collectWalls>): string[] {
  return walls.map((wall) => `${wall.x1},${wall.y1}-${wall.x2},${wall.y2}`);
}

void describe("collectWalls", () => {
  void test("a closed single cell gets its four outer walls at the given origin and size", () => {
    const walls = collectWalls(mazeOf([[closed]]), 10, 20, 5);

    assert.deepEqual(geometry(walls).sort(), ["10,20-10,25", "10,20-15,20", "10,25-15,25", "15,20-15,25"]);
  });

  void test("a wall shared by two cells is drawn once", () => {
    const left: MazeCell = { north: true, east: true, south: true, west: true };
    const right: MazeCell = { north: true, east: true, south: true, west: true };
    const walls = collectWalls(mazeOf([[left, right]]), 0, 0, 10);

    const shared = geometry(walls).filter((line) => line === "10,0-10,10");
    assert.equal(shared.length, 1);
    assert.equal(walls.length, 7);
  });

  void test("an open cell draws no wall on its open sides", () => {
    const open: MazeCell = { north: false, east: false, south: false, west: false };

    assert.deepEqual(collectWalls(mazeOf([[open]]), 0, 0, 10), []);
  });

  void test("a generated maze has unique walls that stay inside the maze frame", () => {
    const maze = generateMaze("lat5", () => 0.5);
    const size = 7;
    const walls = collectWalls(maze, 3, 4, size);
    const lines = geometry(walls);

    assert.equal(new Set(lines).size, lines.length);
    for (const wall of walls) {
      for (const x of [wall.x1, wall.x2]) {
        assert.ok(x >= 3 && x <= 3 + maze.width * size);
      }
      for (const y of [wall.y1, wall.y2]) {
        assert.ok(y >= 4 && y <= 4 + maze.height * size);
      }
    }
  });
});
