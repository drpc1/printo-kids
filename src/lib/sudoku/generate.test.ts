import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  carveSudoku,
  countSudokuSolutions,
  fullSudoku,
  generateSudokuCard,
  generateSudokuPuzzle,
  sudokuBlock,
  sudokuCardProblems,
  type SudokuCard,
  type SudokuGrid,
  type SudokuSize,
} from "./generate.ts";
import {
  DEFAULT_SUDOKU_SETTINGS,
  SUDOKU_LEVELS,
  SUDOKU_SIZES,
  sudokuBlankCount,
  type SudokuSettings,
} from "./levels.ts";
import { SUDOKU_SHAPES, SUDOKU_SHAPES_4, type SudokuShapeId } from "./shapes.ts";

// Mutation runs (stryker/*.config.json) set MUTATION_RUN=1: instrumented code is several times slower, so a wall-clock
// budget would kill mutants for the wrong reason. npm test keeps every time budget.
const MUTATION_RUN = process.env.MUTATION_RUN === "1";

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
  const card = generateSudokuCard(mulberry32(seed), null);
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

void describe("generateSudokuCard", () => {
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
      const card = generateSudokuCard(random, previous);

      assert.ok(card);
      assert.notEqual(card.key, previous);
      previous = card.key;
    }
  });

  void test("the key names the shapes in symbol order and the givens", () => {
    const card = goodCard();
    const rows = card.givens.map((row) => row.map((value) => (value === null ? "." : String(value))).join(""));

    assert.equal(card.key, `4|shapes|${card.shapes.join(",")}|${rows.join("/")}`);
  });

  void test("200 cards show every one of the five shapes and every blank column in every row", () => {
    const random = mulberry32(99);
    const shapes = new Set<SudokuShapeId>();
    const blankColumns = Array.from({ length: 4 }, () => new Set<number>());
    let previous: string | null = null;

    for (let round = 0; round < 200; round += 1) {
      const card = generateSudokuCard(random, previous);
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

  void test("a card with the wrong number of blanks for its size and level is reported", () => {
    const card = goodCard();
    const givens = card.givens.map((row, r) => (r === 0 ? row.map(() => null) : [...row]));

    assert.ok(sudokuCardProblems({ ...card, givens }).includes("blank-count"));
  });

  void test("the wrong number of shapes for the size is reported", () => {
    const card = goodCard();

    assert.ok(sudokuCardProblems({ ...card, shapes: card.shapes.slice(0, 3) }).includes("shape-count"));
  });

  void test("shapes on a digits card are reported", () => {
    const card = generateSudokuCard(mulberry32(3), null, { size: 6, level: "latwy", symbols: "digits" });
    assert.ok(card);

    assert.deepEqual(sudokuCardProblems(card), []);
    assert.ok(sudokuCardProblems({ ...card, shapes: ["circle"] }).includes("shapes-with-digits"));
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
      const card = generateSudokuCard(random, null);
      assert.ok(card);
      for (const id of card.shapes) assert.ok(!["star", "diamond", "moon", "drop"].includes(id), id);
    }
  });
});

const SETTINGS: readonly SudokuSettings[] = SUDOKU_SIZES.flatMap(({ id: size }) =>
  (size === 4 ? SUDOKU_LEVELS.slice(0, 1) : SUDOKU_LEVELS).flatMap(({ id: level }) =>
    (size === 4 ? (["shapes"] as const) : (["shapes", "digits"] as const)).map((symbols) => ({ size, level, symbols })),
  ),
);

void describe("generateSudokuCard for every size, level and symbols", () => {
  void test("there are 13 settings: 4×4 once, 6×6 and 9×9 three levels with shapes and digits", () => {
    assert.equal(SETTINGS.length, 1 + 6 + 6);
  });

  void test("each setting gives a card with no problems, its blank count and one solution", () => {
    for (const settings of SETTINGS) {
      for (const seed of [1, 2, 3]) {
        const card = generateSudokuCard(mulberry32(seed), null, settings);
        const label = `${JSON.stringify(settings)} seed ${seed}`;

        assert.ok(card, label);
        assert.deepEqual(sudokuCardProblems(card), [], label);
        assert.equal(card.size, settings.size);
        assert.equal(card.symbols, settings.symbols);
        assert.equal(blankCount(card.givens), sudokuBlankCount(settings.size, settings.level), label);
        assert.equal(countSudokuSolutions(card.givens, settings.size), 1, label);
        assert.equal(card.shapes.length, settings.symbols === "digits" ? 0 : settings.size, label);
      }
    }
  });

  void test("4×4 ignores digits and the level and always draws shapes", () => {
    const card = generateSudokuCard(mulberry32(2), null, { size: 4, level: "trudny", symbols: "digits" });

    assert.ok(card);
    assert.equal(card.symbols, "shapes");
    assert.equal(blankCount(card.givens), 4);
  });

  void test("a 6×6 card draws six of the nine shapes, and across cards all nine appear", () => {
    const random = mulberry32(31);
    const seen = new Set<SudokuShapeId>();
    let previous: string | null = null;

    for (let round = 0; round < 60; round += 1) {
      const card = generateSudokuCard(random, previous, { size: 6, level: "latwy", symbols: "shapes" });
      assert.ok(card);
      previous = card.key;
      assert.equal(new Set(card.shapes).size, 6);
      card.shapes.forEach((id) => seen.add(id));
    }

    assert.deepEqual([...seen].sort(), [...SUDOKU_SHAPES].sort());
  });

  void test("a 9×9 card uses all nine shapes", () => {
    const card = generateSudokuCard(mulberry32(8), null, { size: 9, level: "latwy", symbols: "shapes" });

    assert.ok(card);
    assert.deepEqual([...card.shapes].sort(), [...SUDOKU_SHAPES].sort());
  });

  void test("two cards in a row never share a key, for every setting", () => {
    for (const settings of SETTINGS) {
      const random = mulberry32(5);
      let previous: string | null = null;
      for (let round = 0; round < 5; round += 1) {
        const card = generateSudokuCard(random, previous, settings);

        assert.ok(card, JSON.stringify(settings));
        assert.notEqual(card.key, previous);
        previous = card.key;
      }
    }
  });

  void test("the same board as shapes and as digits has different keys", () => {
    const shapes = generateSudokuCard(mulberry32(4), null, { size: 6, level: "sredni", symbols: "shapes" });
    const digits = generateSudokuCard(mulberry32(4), null, { size: 6, level: "sredni", symbols: "digits" });

    assert.ok(shapes && digits);
    assert.notEqual(shapes.key, digits.key);
  });

  void test("the default settings give a 4×4 card", () => {
    const card = generateSudokuCard(mulberry32(1), null);

    assert.ok(card);
    assert.equal(card.size, DEFAULT_SUDOKU_SETTINGS.size);
  });

  void test("a 9×9 card at the hardest level comes out well inside the 5 second budget", () => {
    const random = mulberry32(77);
    const hardest: SudokuSettings = { size: 9, level: "trudny", symbols: "shapes" };

    for (let round = 0; round < 20; round += 1) {
      const started = performance.now();
      const card = generateSudokuCard(random, null, hardest);

      assert.ok(card);
      assert.ok(MUTATION_RUN || performance.now() - started < 1000, "one card took over a second");
    }
  });
});

// Hand-built 6×6 and 9×9 cards. The solution is a fixed shifted pattern and the empty cells are fixed coordinates, so
// nothing the generator returns decides what a rule is checked against.
function patternSolution(size: 6 | 9): number[][] {
  const block = sudokuBlock(size);
  return Array.from({ length: size }, (_, row) =>
    Array.from(
      { length: size },
      (_, column) => (block.columns * (row % block.rows) + Math.floor(row / block.rows) + column) % size,
    ),
  );
}

const BLANK_CELLS: Record<6 | 9, readonly (readonly [number, number])[]> = {
  6: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 1],
    [2, 4],
    [3, 1],
    [3, 3],
    [4, 0],
    [4, 2],
    [5, 1],
    [5, 2],
    [5, 3],
  ],
  9: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [1, 4],
    [1, 8],
    [2, 0],
    [2, 5],
    [2, 7],
    [3, 1],
    [3, 4],
    [3, 5],
    [3, 6],
    [4, 2],
    [4, 5],
    [4, 6],
    [5, 1],
    [5, 2],
    [5, 3],
    [5, 4],
    [5, 5],
    [5, 6],
    [5, 7],
    [6, 0],
    [6, 2],
    [6, 3],
    [6, 7],
    [7, 1],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 7],
  ],
};

function handCard(size: 6 | 9): SudokuCard {
  const solution = patternSolution(size);
  const givens: (number | null)[][] = solution.map((row) => [...row]);
  for (const [row, column] of BLANK_CELLS[size]) givens[row][column] = null;
  return {
    size,
    level: "latwy",
    symbols: "shapes",
    shapes: SUDOKU_SHAPES.slice(0, size),
    givens,
    solution,
    key: `hand-${size}`,
  };
}

const BIG_SIZES = [6, 9] as const;

void describe("sudokuCardProblems on hand-built 6×6 and 9×9 cards", () => {
  void test("the untouched hand-built card has no problem", () => {
    for (const size of BIG_SIZES) {
      const card = handCard(size);

      assert.equal(blankCount(card.givens), sudokuBlankCount(size, "latwy"));
      assert.deepEqual(sudokuCardProblems(card), [], `${size}×${size}`);
    }
  });

  void test("one given more is a blank-count problem and nothing else", () => {
    for (const size of BIG_SIZES) {
      const card = handCard(size);
      const [row, column] = BLANK_CELLS[size][0];
      const givens = card.givens.map((givensRow) => [...givensRow]);
      givens[row][column] = card.solution[row][column];

      assert.deepEqual(sudokuCardProblems({ ...card, givens }), ["blank-count"], `${size}×${size}`);
    }
  });

  void test("one given less is a blank-count problem", () => {
    for (const size of BIG_SIZES) {
      const card = handCard(size);
      const givens = card.givens.map((givensRow) => [...givensRow]);
      givens[1][1] = null;

      assert.equal(blankCount(givens), sudokuBlankCount(size, "latwy") + 1);
      assert.ok(sudokuCardProblems({ ...card, givens }).includes("blank-count"), `${size}×${size}`);
    }
  });

  void test("a level that wants another number of blanks is a blank-count problem and nothing else", () => {
    for (const size of BIG_SIZES) {
      for (const level of ["sredni", "trudny"] as const) {
        assert.deepEqual(sudokuCardProblems({ ...handCard(size), level }), ["blank-count"], `${size}×${size} ${level}`);
      }
    }
  });

  void test("a shape outside the pool of nine is reported, and a shape outside the pool of five is not", () => {
    for (const size of BIG_SIZES) {
      const card = handCard(size);
      const unknown: SudokuShapeId[] = [...card.shapes];
      unknown[0] = "hexagon" as SudokuShapeId;
      const rare: SudokuShapeId[] = ["star", "moon", ...card.shapes.filter((id) => id !== "star" && id !== "moon")];

      assert.deepEqual(sudokuCardProblems({ ...card, shapes: unknown }), ["shape-outside-pool"], `${size}×${size}`);
      assert.deepEqual(
        sudokuCardProblems({ ...card, shapes: rare.slice(0, size) }),
        [],
        `${size}×${size} star and moon`,
      );
    }
  });

  void test("too few or too many shapes is a shape-count problem", () => {
    for (const size of BIG_SIZES) {
      const card = handCard(size);
      const fewer = SUDOKU_SHAPES.slice(0, size - 1);
      const more: SudokuShapeId[] = [...SUDOKU_SHAPES.slice(0, size), SUDOKU_SHAPES[size % SUDOKU_SHAPES.length]];

      assert.deepEqual(sudokuCardProblems({ ...card, shapes: fewer }), ["shape-count"], `${size}×${size} one less`);
      assert.ok(sudokuCardProblems({ ...card, shapes: more }).includes("shape-count"), `${size}×${size} one more`);
    }
  });

  void test("a column that repeats a symbol is an invalid solution", () => {
    for (const size of BIG_SIZES) {
      // Two cells of one row and one block swapped: the row and the block stay full, two columns do not.
      const solution = patternSolution(size).map((row) => [...row]);
      [solution[0][0], solution[0][1]] = [solution[0][1], solution[0][0]];
      const givens = solution.map((row) => [...row]);

      assert.ok(
        sudokuCardProblems({ ...handCard(size), solution, givens }).includes("invalid-solution"),
        `${size}×${size}`,
      );
    }
  });

  void test("a block that repeats a symbol while rows and columns stay full is an invalid solution", () => {
    for (const size of BIG_SIZES) {
      // A cyclic Latin square: every row and column holds each symbol once, but the blocks do not.
      const solution = Array.from({ length: size }, (_, row) =>
        Array.from({ length: size }, (_, column) => (row + column) % size),
      );
      const givens = solution.map((row) => [...row]);

      assert.ok(
        sudokuCardProblems({ ...handCard(size), solution, givens }).includes("invalid-solution"),
        `${size}×${size}`,
      );
    }
  });

  void test("a solution with a symbol out of range, a short or long row or too few rows is an invalid solution", () => {
    for (const size of BIG_SIZES) {
      const card = handCard(size);
      const high = card.solution.map((row) => [...row]);
      high[0][0] = size;
      const negative = card.solution.map((row) => [...row]);
      negative[0][0] = -1;
      const fraction = card.solution.map((row) => [...row]);
      fraction[0][0] = 0.5;
      const short = card.solution.map((row, r) => (r === 0 ? row.slice(0, size - 1) : [...row]));
      const long = card.solution.map((row, r) => (r === 0 ? [...row, row[0]] : [...row]));
      const fewRows = card.solution.slice(0, size - 1);

      for (const solution of [high, negative, fraction, short, long, fewRows]) {
        assert.ok(sudokuCardProblems({ ...card, solution }).includes("invalid-solution"), `${size}×${size}`);
      }
    }
  });

  void test("a given that is not part of the solution is reported on a big card too", () => {
    for (const size of BIG_SIZES) {
      const card = handCard(size);
      const givens = card.givens.map((row) => [...row]);
      givens[1][1] = (card.solution[1][1] + 1) % size;

      assert.ok(sudokuCardProblems({ ...card, givens }).includes("givens-differ-from-solution"), `${size}×${size}`);
    }
  });
});

void describe("a card that repeats or that is cut short", () => {
  void test("a card is drawn again when the draw repeats the previous key", () => {
    const first = goodCard(1);
    const next = generateSudokuCard(mulberry32(1), first.key);

    assert.ok(next);
    assert.notEqual(next.key, first.key);
  });

  void test("givens with a row missing are reported as differing from the solution and as not unique", () => {
    for (const card of [goodCard(), handCard(6), handCard(9)]) {
      const givens = card.givens.slice(0, card.size - 1);
      const problems = sudokuCardProblems({ ...card, givens });

      assert.ok(problems.includes("givens-differ-from-solution"), `${card.size}×${card.size}`);
      assert.ok(problems.includes("not-unique"), `${card.size}×${card.size}`);
    }
  });

  void test("a full board with one row cut short is not unique even though the solver would count one solution", () => {
    for (const card of [goodCard(), handCard(6), handCard(9)]) {
      const givens = card.solution.map((row, r) => (r === 0 ? row.slice(0, card.size - 1) : [...row]));

      assert.ok(sudokuCardProblems({ ...card, givens }).includes("not-unique"), `${card.size}×${card.size}`);
    }
  });
});
