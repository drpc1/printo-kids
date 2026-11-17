import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { shortestPaths, uniqueShortestPath } from "./search.ts";

const grid = (rows: string[]): boolean[][] => rows.map((row) => Array.from(row, (c) => c === "#"));

void describe("shortestPaths", () => {
  void test("two equal ways round a block give the count 2", () => {
    const blocked = grid(["...", ".#.", "..."]);
    const { dist, count } = shortestPaths(blocked, [0, 0]);
    assert.equal(dist[2][2], 4);
    assert.equal(count[2][2], 2);
    assert.equal(dist[2][0], 2);
    assert.equal(count[2][0], 1);
    assert.equal(uniqueShortestPath(blocked, [0, 0], [2, 2]), null);
  });

  void test("a corridor has one shortest path and it is returned in order", () => {
    const blocked = grid(["...", "##.", "..."]);
    assert.deepEqual(uniqueShortestPath(blocked, [0, 0], [0, 2]), ["R", "R", "D", "D", "L", "L"]);
  });

  void test("a cell behind obstacles is not reached", () => {
    const blocked = grid([".#.", "###", "..."]);
    const { dist, count } = shortestPaths(blocked, [0, 0]);
    assert.equal(dist[2][2], -1);
    assert.equal(count[2][2], 0);
    assert.equal(uniqueShortestPath(blocked, [0, 0], [2, 2]), null);
  });

  void test("an obstacle blocks the straight way and the start is distance 0", () => {
    const blocked = grid([".#.", "...", "..."]);
    const { dist } = shortestPaths(blocked, [0, 0]);
    assert.equal(dist[0][0], 0);
    assert.equal(dist[0][2], 4);
  });
});
