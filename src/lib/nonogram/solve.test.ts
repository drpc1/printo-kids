import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { solveLine, solveNonogram, type CellState } from "./solve.ts";

const UNKNOWN: CellState[] = ["unknown", "unknown", "unknown", "unknown", "unknown"];

void describe("solveLine", () => {
  void test("a clue that fills the line fixes every cell", () => {
    assert.deepEqual(solveLine(UNKNOWN, [5]), ["filled", "filled", "filled", "filled", "filled"]);
    assert.deepEqual(solveLine(UNKNOWN, [2, 2]), ["filled", "filled", "empty", "filled", "filled"]);
  });

  void test("the clue [0] is an empty line", () => {
    assert.deepEqual(solveLine(UNKNOWN, [0]), ["empty", "empty", "empty", "empty", "empty"]);
  });

  void test("a block with slack fixes only the overlap (hand-written oracle)", () => {
    assert.deepEqual(solveLine(UNKNOWN, [3]), ["unknown", "unknown", "filled", "unknown", "unknown"]);
    assert.deepEqual(solveLine(UNKNOWN, [1]), UNKNOWN);
  });

  void test("known cells narrow the places of a block", () => {
    assert.deepEqual(solveLine(["unknown", "unknown", "unknown", "unknown", "empty"], [3]), [
      "unknown",
      "filled",
      "filled",
      "unknown",
      "empty",
    ]);
    assert.deepEqual(solveLine(["filled", "unknown", "unknown", "unknown", "unknown"], [2]), [
      "filled",
      "filled",
      "empty",
      "empty",
      "empty",
    ]);
  });

  void test("returns null when the clue does not fit the known cells", () => {
    assert.equal(solveLine(UNKNOWN, [3, 3]), null);
    assert.equal(solveLine(["filled", "empty", "filled", "unknown", "unknown"], [3]), null);
    assert.equal(solveLine(["filled", "unknown", "unknown", "unknown", "unknown"], [0]), null);
  });
});

void describe("solveNonogram", () => {
  void test("a plus sign is solved from its clues (hand-written oracle)", () => {
    const result = solveNonogram({ rows: [[1], [3], [1]], columns: [[1], [3], [1]] }, 3, 3);

    assert.deepEqual(result, {
      status: "solved",
      image: [
        [false, true, false],
        [true, true, true],
        [false, true, false],
      ],
    });
  });

  void test("two pictures with the same clues (a 2 by 2 diagonal) are stuck", () => {
    assert.deepEqual(solveNonogram({ rows: [[1], [1]], columns: [[1], [1]] }, 2, 2), { status: "stuck" });
  });

  void test("clues no picture can satisfy are a contradiction", () => {
    assert.deepEqual(solveNonogram({ rows: [[2], [2]], columns: [[1], [1]] }, 2, 2), { status: "contradiction" });
  });
});
