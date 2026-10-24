import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  carveSudoku,
  countSudokuSolutions,
  fullSudoku,
  generateSudokuCard4,
  generateSudokuPuzzle,
  sudokuBlock,
  sudokuCardProblems,
  type SudokuCard,
  type SudokuGrid,
  type SudokuSize,
} from "./generate.ts";
import { SUDOKU_SHAPES_4, type SudokuShapeId } from "./shapes.ts";

const SIZES: readonly SudokuSize[] = [4, 6, 9];

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function emptyGrid(size: number): SudokuGrid {
  return Array.from({ length: size }, () => new Array<number | null>(size).fill(null));
}

function assertValidFullBoard(board: readonly (readonly number[])[], size: SudokuSize): void {
  const block = sudokuBlock(size);
  const blocksAcross = size / block.columns;
  const symbols = Array.from({ length: size }, (_, index) => index);
  for (let index = 0; index < size; index += 1) {
    assert.deepEqual([...board[index]].sort(), symbols, `row ${index}`);
    assert.deepEqual(board.map((row) => row[index]).sort(), symbols, `column ${index}`);
  }
  for (let blockIndex = 0; blockIndex < size; blockIndex += 1) {
    const top = Math.floor(blockIndex / blocksAcross) * block.rows;
    const left = (blockIndex % blocksAcross) * block.columns;
    const values: number[] = [];
    for (let row = top; row < top + block.rows; row += 1) {
      for (let column = left; column < left + block.columns; column += 1) values.push(board[row][column]);
    }
    assert.deepEqual(values.sort(), symbols, `block ${blockIndex}`);
  }
}

function blankCount(grid: SudokuGrid): number {
  return grid.flat().filter((value) => value === null).length;
}

function goodCard(seed = 1): SudokuCard {
  const card = generateSudokuCard4(mulberry32(seed), null);
  assert.ok(card);
  return card;
}

void describe("sudokuBlock", () => {
  void test("4×4 has 2×2 blocks, 6×6 has 2 rows by 3 columns, 9×9 has 3×3", () => {
    assert.deepEqual(sudokuBlock(4), { rows: 2, columns: 2 });
    assert.deepEqual(sudokuBlock(6), { rows: 2, columns: 3 });
    assert.deepEqual(sudokuBlock(9), { rows: 3, columns: 3 });
  });
});

void describe("fullSudoku", () => {
  void test("gives every symbol once per row, column and block for 4, 6 and 9", () => {
    for (const size of SIZES) {
      for (const seed of [1, 2, 3, 4]) {
        assertValidFullBoard(fullSudoku(mulberry32(seed), size), size);
      }
    }
  });

  void test("different seeds give different boards", () => {
    const boards = new Set([1, 2, 3, 4, 5].map((seed) => JSON.stringify(fullSudoku(mulberry32(seed), 9))));
    assert.ok(boards.size > 1);
  });
});

void describe("countSudokuSolutions", () => {
  void test("a full board has one solution, and so does a board with one empty cell", () => {
    for (const size of SIZES) {
      const board = fullSudoku(mulberry32(7), size);
      assert.equal(countSudokuSolutions(board, size), 1);
      const grid: (number | null)[][] = board.map((row) => [...row]);
      grid[0][0] = null;
      assert.equal(countSudokuSolutions(grid, size), 1);
    }
  });

  void test("an empty board stops at the limit", () => {
    assert.equal(countSudokuSolutions(emptyGrid(4), 4), 2);
    assert.equal(countSudokuSolutions(emptyGrid(4), 4, 5), 5);
  });

  void test("a board that contradicts itself has no solution", () => {
    const grid = emptyGrid(4).map((row) => [...row]);
    grid[0][0] = 1;
    grid[0][1] = 1;
    assert.equal(countSudokuSolutions(grid, 4), 0);
  });
});

void describe("carveSudoku", () => {
  void test("empties exactly the asked cells and keeps one solution", () => {
    const solution = fullSudoku(mulberry32(3), 6);
    const grid = carveSudoku(mulberry32(4), solution, 6, 12);

    assert.ok(grid);
    assert.equal(blankCount(grid), 12);
    assert.equal(countSudokuSolutions(grid, 6), 1);
  });

  void test("is null when more cells are asked than a board can lose", () => {
    const solution = fullSudoku(mulberry32(3), 4);
    assert.equal(carveSudoku(mulberry32(4), solution, 4, 16), null);
  });
});

void describe("generateSudokuPuzzle", () => {
  void test("6×6 at 22 blanks and 9×9 at 52 blanks come out with one solution and matching givens", () => {
    for (const [size, blanks] of [
      [6, 22],
      [9, 52],
    ] as const) {
      for (const seed of [1, 2, 3]) {
        const puzzle = generateSudokuPuzzle(mulberry32(seed), size, blanks);

        assert.ok(puzzle, `${size}×${size} seed ${seed}`);
        assert.equal(blankCount(puzzle.givens), blanks);
        assert.equal(countSudokuSolutions(puzzle.givens, size), 1);
        assertValidFullBoard(puzzle.solution, size);
        puzzle.givens.forEach((row, r) => {
          row.forEach((value, c) => {
            if (value !== null) assert.equal(value, puzzle.solution[r][c]);
          });
        });
      }
    }
  });

  void test("is null when no board can lose that many cells", () => {
    assert.equal(generateSudokuPuzzle(mulberry32(1), 4, 16), null);
  });
});

void describe("generateSudokuCard4", () => {
  void test("cards from several seeds have no problems and one empty cell per row", () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const card = goodCard(seed);

      assert.deepEqual(sudokuCardProblems(card), [], card.key);
      assert.equal(card.size, 4);
      assert.equal(card.shapes.length, 4);
      card.givens.forEach((row) => {
        assert.equal(row.filter((value) => value === null).length, 1);
      });
    }
  });

  void test("two cards in a row never share a key", () => {
    const random = mulberry32(12);
    let previous: string | null = null;

    for (let round = 0; round < 50; round += 1) {
      const card = generateSudokuCard4(random, previous);

      assert.ok(card);
      assert.notEqual(card.key, previous);
      previous = card.key;
    }
  });

  void test("the key names the shapes in symbol order and the givens", () => {
    const card = goodCard();
    const rows = card.givens.map((row) => row.map((value) => (value === null ? "." : String(value))).join(""));

    assert.equal(card.key, `${card.shapes.join(",")}|${rows.join("/")}`);
  });

  void test("200 cards show every one of the five shapes and every blank column in every row", () => {
    const random = mulberry32(99);
    const shapes = new Set<SudokuShapeId>();
    const blankColumns = Array.from({ length: 4 }, () => new Set<number>());
    let previous: string | null = null;

    for (let round = 0; round < 200; round += 1) {
      const card = generateSudokuCard4(random, previous);
      assert.ok(card);
      previous = card.key;
      card.shapes.forEach((id) => shapes.add(id));
      card.givens.forEach((row, r) => blankColumns[r].add(row.indexOf(null)));
    }

    assert.deepEqual([...shapes].sort(), [...SUDOKU_SHAPES_4].sort());
    blankColumns.forEach((columns, row) => {
      assert.equal(columns.size, 4, `row ${row}`);
    });
  });
});

void describe("sudokuCardProblems", () => {
  void test("a wrong solution is invalid", () => {
    const card = goodCard();
    const solution = card.solution.map((row) => [...row]);
    solution[0][0] = solution[0][1];

    assert.ok(sudokuCardProblems({ ...card, solution }).includes("invalid-solution"));
  });

  void test("a given that differs from the solution is reported", () => {
    const card = goodCard();
    const givens = card.givens.map((row) => [...row]);
    const column = givens[0].findIndex((value) => value !== null);
    givens[0][column] = (card.solution[0][column] + 1) % 4;

    assert.ok(sudokuCardProblems({ ...card, givens }).includes("givens-differ-from-solution"));
  });

  void test("a row with no blank or two blanks is reported", () => {
    const card = goodCard();
    const full = card.givens.map((row, r) => (r === 0 ? [...card.solution[0]] : [...row]));
    const two = card.givens.map((row, r) => (r === 0 ? row.map((value, c) => (c < 2 ? null : value)) : [...row]));

    assert.ok(sudokuCardProblems({ ...card, givens: full }).includes("blank-count-per-row"));
    assert.ok(sudokuCardProblems({ ...card, givens: two }).includes("blank-count-per-row"));
  });

  void test("a shape outside the pool of five is reported", () => {
    const card = goodCard();
    const shapes: SudokuShapeId[] = [...card.shapes];
    shapes[0] = "star";

    assert.ok(sudokuCardProblems({ ...card, shapes }).includes("shape-outside-pool"));
  });

  void test("a repeated shape is reported", () => {
    const card = goodCard();
    const shapes: SudokuShapeId[] = [...card.shapes];
    shapes[1] = shapes[0];

    assert.ok(sudokuCardProblems({ ...card, shapes }).includes("duplicate-shape"));
  });

  void test("a board with two solutions is reported as not unique", () => {
    const card = goodCard();
    const givens = emptyGrid(4).map((row) => [...row]);
    givens.forEach((row, r) => {
      row[0] = card.solution[r][0];
      row[1] = card.solution[r][1];
    });
    givens[0][2] = null;

    const problems = sudokuCardProblems({ ...card, givens });
    assert.ok(problems.includes("not-unique"));
  });

  void test("a board that is not 4×4 is reported as not unique without running the solver", () => {
    const card = goodCard();
    const short = card.givens.slice(0, 3);
    const narrow = card.givens.map((row, r) => (r === 0 ? row.slice(0, 3) : [...row]));

    assert.ok(sudokuCardProblems({ ...card, givens: short }).includes("not-unique"));
    assert.ok(sudokuCardProblems({ ...card, givens: narrow }).includes("not-unique"));
  });

  void test("no card uses the star, diamond, moon or drop", () => {
    const random = mulberry32(5);
    for (let round = 0; round < 100; round += 1) {
      const card = generateSudokuCard4(random, null);
      assert.ok(card);
      for (const id of card.shapes) assert.ok(!["star", "diamond", "moon", "drop"].includes(id), id);
    }
  });
});
