import { SUDOKU_SHAPES_4, type SudokuShapeId } from "./shapes.ts";

export type SudokuSize = 4 | 6 | 9;

/** Symbol indexes `0..size-1`; `null` is an empty cell. */
export type SudokuGrid = readonly (readonly (number | null)[])[];

export interface SudokuCard {
  size: 4;
  /** `shapes[i]` is the shape of symbol `i`. */
  shapes: readonly SudokuShapeId[];
  givens: SudokuGrid;
  solution: readonly (readonly number[])[];
  /** Names the shapes in symbol order and the givens, so one board with other shapes is another card. */
  key: string;
}

export type SudokuProblem =
  | "invalid-solution"
  | "givens-differ-from-solution"
  | "blank-count-per-row"
  | "shape-outside-pool"
  | "duplicate-shape"
  | "not-unique";

/** Draws a new full board and carves it again at most this many times before giving up. */
const MAX_PUZZLE_ATTEMPTS = 50;
/** Draws a 4×4 card again at most this many times when its key repeats the previous card. */
const MAX_ATTEMPTS = 20;

/** Rows and columns of cells in one block: 2×2, 2×3 (2 rows, 3 columns) or 3×3. */
export function sudokuBlock(size: SudokuSize): { rows: number; columns: number } {
  if (size === 4) return { rows: 2, columns: 2 };
  if (size === 6) return { rows: 2, columns: 3 };
  return { rows: 3, columns: 3 };
}

function pick(random: () => number, count: number): number {
  return Math.floor(random() * count);
}

function shuffled<T>(random: () => number, items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = pick(random, index + 1);
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

/** Bit masks of the symbols used in each row, column and block, kept in step with a flat copy of the grid. */
class Board {
  readonly cells: (number | null)[];
  private readonly rowMask: number[];
  private readonly columnMask: number[];
  private readonly blockMask: number[];
  private readonly blockOf: number[];
  private readonly size: number;
  private readonly all: number;

  constructor(grid: SudokuGrid, size: SudokuSize) {
    const block = sudokuBlock(size);
    const blocksAcross = size / block.columns;
    this.size = size;
    this.all = (1 << size) - 1;
    this.cells = grid.flat();
    this.rowMask = new Array<number>(size).fill(0);
    this.columnMask = new Array<number>(size).fill(0);
    this.blockMask = new Array<number>(size).fill(0);
    this.blockOf = this.cells.map(
      (_, index) =>
        Math.floor(Math.floor(index / size) / block.rows) * blocksAcross + Math.floor((index % size) / block.columns),
    );
    this.cells.forEach((value, index) => {
      if (value !== null) this.mark(index, value, true);
    });
  }

  private mark(index: number, value: number, on: boolean): void {
    const bit = 1 << value;
    const row = Math.floor(index / this.size);
    const column = index % this.size;
    const block = this.blockOf[index];
    if (on) {
      this.rowMask[row] |= bit;
      this.columnMask[column] |= bit;
      this.blockMask[block] |= bit;
    } else {
      this.rowMask[row] &= ~bit;
      this.columnMask[column] &= ~bit;
      this.blockMask[block] &= ~bit;
    }
  }

  candidates(index: number): number {
    const row = Math.floor(index / this.size);
    const used = this.rowMask[row] | this.columnMask[index % this.size] | this.blockMask[this.blockOf[index]];
    return this.all & ~used;
  }

  set(index: number, value: number): void {
    this.cells[index] = value;
    this.mark(index, value, true);
  }

  clear(index: number, value: number): void {
    this.cells[index] = null;
    this.mark(index, value, false);
  }
}

function bitCount(mask: number): number {
  let count = 0;
  for (let rest = mask; rest > 0; rest &= rest - 1) count += 1;
  return count;
}

/** A random valid full board: every symbol once in each row, column and block. */
export function fullSudoku(random: () => number, size: SudokuSize): number[][] {
  const empty = Array.from({ length: size }, () => new Array<number | null>(size).fill(null));
  const board = new Board(empty, size);

  const fill = (index: number): boolean => {
    if (index === size * size) return true;
    const mask = board.candidates(index);
    for (const value of shuffled(
      random,
      Array.from({ length: size }, (_, symbol) => symbol).filter((symbol) => mask & (1 << symbol)),
    )) {
      board.set(index, value);
      if (fill(index + 1)) return true;
      board.clear(index, value);
    }
    return false;
  };

  fill(0);
  return Array.from({ length: size }, (_, row) => board.cells.slice(row * size, (row + 1) * size) as number[]);
}

/**
 * How many ways the grid can be completed, counting no further than `limit`. The cell with the fewest candidates
 * is filled first, which keeps the hardest 9×9 boards fast.
 */
export function countSudokuSolutions(grid: SudokuGrid, size: SudokuSize, limit = 2): number {
  const board = new Board(grid, size);
  let found = 0;

  const search = (): void => {
    let best = -1;
    let bestMask = 0;
    let bestCount = size + 1;
    for (let index = 0; index < board.cells.length; index += 1) {
      if (board.cells[index] !== null) continue;
      const mask = board.candidates(index);
      const count = bitCount(mask);
      if (count < bestCount) {
        best = index;
        bestMask = mask;
        bestCount = count;
        if (count <= 1) break;
      }
    }
    if (best === -1) {
      found += 1;
      return;
    }
    for (let value = 0; value < size && found < limit; value += 1) {
      if (!(bestMask & (1 << value))) continue;
      board.set(best, value);
      search();
      board.clear(best, value);
    }
  };

  search();
  return found;
}

/**
 * Empties cells of a full board in random order, keeping only the removals after which the board still has exactly
 * one solution, until `blanks` cells are empty. Null when this one board cannot lose that many cells.
 */
export function carveSudoku(
  random: () => number,
  solution: readonly (readonly number[])[],
  size: SudokuSize,
  blanks: number,
): SudokuGrid | null {
  const grid: (number | null)[][] = solution.map((row) => [...row]);
  let removed = 0;
  const order = shuffled(
    random,
    Array.from({ length: size * size }, (_, index) => index),
  );
  for (const index of order) {
    if (removed === blanks) break;
    const row = Math.floor(index / size);
    const column = index % size;
    const value = grid[row][column];
    grid[row][column] = null;
    if (countSudokuSolutions(grid, size, 2) === 1) {
      removed += 1;
    } else {
      grid[row][column] = value;
    }
  }
  return removed === blanks ? grid : null;
}

/** A board with exactly `blanks` empty cells and one solution, or null after MAX_PUZZLE_ATTEMPTS new boards. */
export function generateSudokuPuzzle(
  random: () => number,
  size: SudokuSize,
  blanks: number,
): { givens: SudokuGrid; solution: number[][] } | null {
  for (let attempt = 0; attempt < MAX_PUZZLE_ATTEMPTS; attempt += 1) {
    const solution = fullSudoku(random, size);
    const givens = carveSudoku(random, solution, size, blanks);
    if (givens) return { givens, solution };
  }
  return null;
}

function cardKey(shapes: readonly SudokuShapeId[], givens: SudokuGrid): string {
  const rows = givens.map((row) => row.map((value) => (value === null ? "." : String(value))).join(""));
  return `${shapes.join(",")}|${rows.join("/")}`;
}

/**
 * A 4×4 card: four shapes from the pool of five, a full board, and one empty cell in every row at a random column.
 * Null after MAX_ATTEMPTS draws that all repeat `previousKey` or break a rule.
 */
export function generateSudokuCard4(random: () => number, previousKey: string | null): SudokuCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const shapes = shuffled(random, SUDOKU_SHAPES_4).slice(0, 4);
    const solution = fullSudoku(random, 4);
    const givens = solution.map((row) => {
      const blank = pick(random, 4);
      return row.map((value, column) => (column === blank ? null : value));
    });
    const card: SudokuCard = { size: 4, shapes, givens, solution, key: cardKey(shapes, givens) };
    if (card.key !== previousKey && sudokuCardProblems(card).length === 0) return card;
  }
  return null;
}

function isValidFullBoard(solution: readonly (readonly number[])[], size: SudokuSize): boolean {
  const block = sudokuBlock(size);
  const blocksAcross = size / block.columns;
  const rows = Array.from({ length: size }, () => new Set<number>());
  const columns = Array.from({ length: size }, () => new Set<number>());
  const blocks = Array.from({ length: size }, () => new Set<number>());
  if (solution.length !== size) return false;
  for (let row = 0; row < size; row += 1) {
    if (solution[row].length !== size) return false;
    for (let column = 0; column < size; column += 1) {
      const value = solution[row][column];
      if (!Number.isInteger(value) || value < 0 || value >= size) return false;
      rows[row].add(value);
      columns[column].add(value);
      blocks[Math.floor(row / block.rows) * blocksAcross + Math.floor(column / block.columns)].add(value);
    }
  }
  return [...rows, ...columns, ...blocks].every((set) => set.size === size);
}

/** Every rule a shown 4×4 card must keep. An empty list means the card can be shown. */
export function sudokuCardProblems(card: SudokuCard): readonly SudokuProblem[] {
  const problems: SudokuProblem[] = [];

  if (!isValidFullBoard(card.solution, 4)) problems.push("invalid-solution");

  const differs = card.givens.some((row, r) =>
    row.some((value, c) => value !== null && value !== card.solution[r]?.[c]),
  );
  if (differs || card.givens.length !== 4) problems.push("givens-differ-from-solution");

  if (card.givens.some((row) => row.filter((value) => value === null).length !== 1)) {
    problems.push("blank-count-per-row");
  }

  if (card.shapes.some((id) => !SUDOKU_SHAPES_4.includes(id))) problems.push("shape-outside-pool");
  if (new Set(card.shapes).size !== card.shapes.length || card.shapes.length !== 4) problems.push("duplicate-shape");

  // The solver reads a 4×4 grid; a board of another shape has no unique solution to count.
  const wellFormed = card.givens.length === 4 && card.givens.every((row) => row.length === 4);
  if (!wellFormed || countSudokuSolutions(card.givens, 4, 2) !== 1) problems.push("not-unique");

  return problems;
}
