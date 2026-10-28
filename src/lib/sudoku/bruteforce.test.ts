import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { countSudokuSolutions, generateSudokuCard, type SudokuGrid } from "./generate.ts";

// An oracle for 4×4 boards that shares nothing with the solver in generate.ts: it tries every way to fill the empty
// cells and checks each filling against the three sudoku rules. Only usable while the empty cells stay few.

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isCompleteSudoku(cells: readonly number[]): boolean {
  const groups: number[][] = [];
  for (let line = 0; line < 4; line += 1) {
    groups.push([0, 1, 2, 3].map((i) => cells[line * 4 + i]));
    groups.push([0, 1, 2, 3].map((i) => cells[i * 4 + line]));
  }
  for (const top of [0, 2]) {
    for (const left of [0, 2]) {
      groups.push([0, 1, 4, 5].map((offset) => cells[top * 4 + left + offset]));
    }
  }
  return groups.every((group) => [0, 1, 2, 3].every((symbol) => group.includes(symbol)));
}

/** Every filling of the empty cells that completes the board. */
function bruteForceCount(grid: SudokuGrid): number {
  const cells = grid.flat();
  const empty = cells.flatMap((value, index) => (value === null ? [index] : []));
  const filled = cells.map((value) => value ?? 0);
  let count = 0;
  const total = 4 ** empty.length;
  for (let combination = 0; combination < total; combination += 1) {
    let rest = combination;
    for (const index of empty) {
      filled[index] = rest % 4;
      rest = Math.floor(rest / 4);
    }
    if (isCompleteSudoku(filled) && cells.every((value, index) => value === null || value === filled[index])) {
      count += 1;
    }
  }
  return count;
}

/** True when two given cells in one row, column or block hold the same symbol. */
function givensConflict(grid: SudokuGrid): boolean {
  const cells = grid.flat();
  const groups: number[][] = [];
  for (let line = 0; line < 4; line += 1) {
    groups.push([0, 1, 2, 3].map((i) => line * 4 + i));
    groups.push([0, 1, 2, 3].map((i) => i * 4 + line));
  }
  for (const top of [0, 2]) {
    for (const left of [0, 2]) groups.push([0, 1, 4, 5].map((offset) => top * 4 + left + offset));
  }
  return groups.some((group) => {
    const values = group.map((index) => cells[index]).filter((value) => value !== null);
    return new Set(values).size !== values.length;
  });
}

const BOARD: readonly (readonly number[])[] = [
  [0, 1, 2, 3],
  [2, 3, 0, 1],
  [1, 0, 3, 2],
  [3, 2, 1, 0],
];

function withBlanks(cells: readonly (readonly [number, number])[]): (number | null)[][] {
  const grid: (number | null)[][] = BOARD.map((row) => [...row]);
  for (const [row, column] of cells) grid[row][column] = null;
  return grid;
}

void describe("the brute-force oracle", () => {
  void test("counts a full board, one blank block and a deadly rectangle by hand", () => {
    assert.equal(bruteForceCount(BOARD), 1);
    assert.equal(
      bruteForceCount(
        withBlanks([
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ]),
      ),
      1,
    );
    assert.equal(
      bruteForceCount(
        withBlanks([
          [0, 0],
          [0, 2],
          [1, 0],
          [1, 2],
        ]),
      ),
      2,
    );
  });
});

void describe("countSudokuSolutions against the brute-force oracle", () => {
  void test("a rectangle of four cells that can be swapped has two solutions in both counts", () => {
    for (const cells of [
      [
        [0, 0],
        [0, 2],
        [1, 0],
        [1, 2],
      ],
      [
        [0, 1],
        [0, 3],
        [1, 1],
        [1, 3],
      ],
      [
        [2, 0],
        [2, 2],
        [3, 0],
        [3, 2],
      ],
    ] as const) {
      const grid = withBlanks(cells);
      const expected = bruteForceCount(grid);

      assert.ok(expected >= 2, JSON.stringify(cells));
      assert.equal(countSudokuSolutions(grid, 4, 2), 2, JSON.stringify(cells));
      assert.equal(countSudokuSolutions(grid, 4, 100), expected, JSON.stringify(cells));
    }
  });

  void test("a board with one filling, a contradiction or a full board agrees too", () => {
    const unique = withBlanks([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
    const contradiction = withBlanks([[0, 0]]);
    contradiction[0][1] = 0;

    assert.equal(bruteForceCount(unique), 1);
    assert.equal(countSudokuSolutions(unique, 4), 1);
    assert.equal(bruteForceCount(contradiction), 0);
    assert.equal(countSudokuSolutions(contradiction, 4), 0);
    assert.equal(countSudokuSolutions(BOARD, 4), 1);
  });

  void test("random boards with up to seven blanks, some with a wrong given, give the same count", () => {
    const random = mulberry32(2024);
    let one = 0;
    let many = 0;

    for (let round = 0; round < 150; round += 1) {
      const grid = withBlanks([]);
      const blanks = 1 + Math.floor(random() * 7);
      for (let placed = 0; placed < blanks; placed += 1) {
        grid[Math.floor(random() * 4)][Math.floor(random() * 4)] = null;
      }
      if (round % 5 === 0) {
        const row = Math.floor(random() * 4);
        const column = Math.floor(random() * 4);
        grid[row][column] = (BOARD[row][column] + 1 + Math.floor(random() * 3)) % 4;
      }

      // The solver trusts the givens it is handed (a card's givens are checked against its solution elsewhere), so
      // only boards whose givens agree with each other are compared.
      if (givensConflict(grid)) continue;
      const expected = bruteForceCount(grid);
      if (expected === 1) one += 1;
      else many += 1;

      assert.equal(countSudokuSolutions(grid, 4, 2), Math.min(expected, 2), JSON.stringify(grid));
      assert.equal(countSudokuSolutions(grid, 4, 100), expected, JSON.stringify(grid));
    }

    assert.ok(one > 0 && many > 0, `${one} / ${many}`);
  });

  void test("a 6×6 board whose only solution needs a wrong guess first is counted as one", () => {
    // 22 empty cells, cut from a full board. A plain backtracking count (checked once by hand) finds exactly one solution.
    const grid: SudokuGrid = [
      [5, 0, null, null, null, null],
      [null, null, 3, null, 0, null],
      [null, null, 2, 4, null, 0],
      [null, null, null, 2, null, 5],
      [4, 2, null, null, null, 1],
      [null, null, 5, 0, null, null],
    ];

    assert.equal(countSudokuSolutions(grid, 6), 1);
    assert.equal(countSudokuSolutions(grid, 6, 100), 1);
  });

  void test("every generated 4×4 card has exactly one solution by the oracle", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const card = generateSudokuCard(mulberry32(seed), null);

      assert.ok(card);
      assert.equal(bruteForceCount(card.givens), 1, card.key);
    }
  });
});
