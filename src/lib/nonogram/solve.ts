import type { NonogramClues } from "./clues.ts";

export type CellState = "filled" | "empty" | "unknown";

export type NonogramSolution =
  { status: "solved"; image: boolean[][] } | { status: "stuck" } | { status: "contradiction" };

/**
 * What one line must contain: a cell that is filled (or empty) in every way the clue fits the known cells stays filled
 * (or empty), the others stay unknown. Null when the clue fits no way. The clue [0] means an empty line.
 */
export function solveLine(known: readonly CellState[], clue: readonly number[]): CellState[] | null {
  const blocks = clue.filter((size) => size > 0);
  const length = known.length;
  const count = blocks.length;

  // A state (i, j) means: j blocks are placed before cell i, and a block may start at i. A block of L cells starting
  // at i is followed by one empty cell, so it moves to (i + L + 1, j + 1); a block that ends the line moves to
  // (length + 1, j + 1). An empty cell moves to (i + 1, j).
  const fitsBlock = (start: number, size: number): boolean => {
    const end = start + size;
    if (end > length) {
      return false;
    }
    for (let cell = start; cell < end; cell += 1) {
      if (known[cell] === "empty") {
        return false;
      }
    }
    return end === length || known[end] !== "filled";
  };
  const afterBlock = (start: number, size: number): number => Math.min(start + size + 1, length + 1);

  const reachable = table(length + 2, count + 1);
  reachable[0][0] = true;
  for (let i = 0; i <= length; i += 1) {
    for (let j = 0; j <= count; j += 1) {
      if (!reachable[i][j]) {
        continue;
      }
      if (i < length && known[i] !== "filled") {
        reachable[i + 1][j] = true;
      }
      if (j < count && fitsBlock(i, blocks[j])) {
        reachable[afterBlock(i, blocks[j])][j + 1] = true;
      }
    }
  }

  const finishes = table(length + 2, count + 1);
  finishes[length][count] = true;
  finishes[length + 1][count] = true;
  for (let i = length - 1; i >= 0; i -= 1) {
    for (let j = count; j >= 0; j -= 1) {
      const emptyOk = known[i] !== "filled" && finishes[i + 1][j];
      const blockOk = j < count && fitsBlock(i, blocks[j]) && finishes[afterBlock(i, blocks[j])][j + 1];
      finishes[i][j] = emptyOk || blockOk;
    }
  }
  if (!finishes[0][0]) {
    return null;
  }

  const canFill = new Array<boolean>(length).fill(false);
  const canEmpty = new Array<boolean>(length).fill(false);
  for (let i = 0; i < length; i += 1) {
    for (let j = 0; j <= count; j += 1) {
      if (!reachable[i][j]) {
        continue;
      }
      if (known[i] !== "filled" && finishes[i + 1][j]) {
        canEmpty[i] = true;
      }
      if (j < count && fitsBlock(i, blocks[j]) && finishes[afterBlock(i, blocks[j])][j + 1]) {
        for (let cell = i; cell < i + blocks[j]; cell += 1) {
          canFill[cell] = true;
        }
        if (i + blocks[j] < length) {
          canEmpty[i + blocks[j]] = true;
        }
      }
    }
  }
  return known.map((_, cell): CellState => {
    if (canFill[cell] && canEmpty[cell]) {
      return "unknown";
    }
    return canFill[cell] ? "filled" : "empty";
  });
}

/**
 * Solves the picture from the clues by line propagation alone, with no guessing: every row and column is solved again
 * and again until nothing changes. "solved" means every cell is determined, so the clues have exactly one picture.
 * "stuck" means some cells stay open (the clues may have several pictures or need guessing), "contradiction" that no
 * picture fits.
 */
export function solveNonogram(clues: NonogramClues, columns: number, rows: number): NonogramSolution {
  const cells: CellState[][] = Array.from({ length: rows }, () => new Array<CellState>(columns).fill("unknown"));
  let changed = true;
  while (changed) {
    changed = false;
    for (let row = 0; row < rows; row += 1) {
      const solved = solveLine(cells[row], clues.rows[row]);
      if (solved === null) {
        return { status: "contradiction" };
      }
      solved.forEach((state, col) => {
        if (state !== cells[row][col]) {
          cells[row][col] = state;
          changed = true;
        }
      });
    }
    for (let col = 0; col < columns; col += 1) {
      const solved = solveLine(
        cells.map((line) => line[col]),
        clues.columns[col],
      );
      if (solved === null) {
        return { status: "contradiction" };
      }
      solved.forEach((state, row) => {
        if (state !== cells[row][col]) {
          cells[row][col] = state;
          changed = true;
        }
      });
    }
  }
  if (cells.some((line) => line.includes("unknown"))) {
    return { status: "stuck" };
  }
  return { status: "solved", image: cells.map((line) => line.map((state) => state === "filled")) };
}

function table(height: number, width: number): boolean[][] {
  return Array.from({ length: height }, () => new Array<boolean>(width).fill(false));
}
