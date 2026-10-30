import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { solveLine, solveNonogram, type CellState } from "./solve.ts";

// An oracle that shares nothing with solve.ts. It lists every way a line can be filled and keeps what all of them
// agree on, then repeats that over rows and columns until nothing changes. It is slow, so it only runs on small lines
// and grids.

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The clue of a line of cells: lengths of the runs of filled cells, [0] for none. */
function clueOf(line: readonly boolean[]): number[] {
  const runs: number[] = [];
  let run = 0;
  for (const cell of [...line, false]) {
    if (cell) run += 1;
    else if (run > 0) {
      runs.push(run);
      run = 0;
    }
  }
  return runs.length === 0 ? [0] : runs;
}

/** What every filling of the line that matches the clue and the known cells agrees on; null when none matches. */
const lineCache = new Map<string, CellState[] | null>();

function lineByEnumeration(known: readonly CellState[], clue: readonly number[]): CellState[] | null {
  const cacheKey = `${known.join(",")}|${clue.join(",")}`;
  if (!lineCache.has(cacheKey)) lineCache.set(cacheKey, enumerateLine(known, clue));
  const cached = lineCache.get(cacheKey) ?? null;
  return cached === null ? null : [...cached];
}

function enumerateLine(known: readonly CellState[], clue: readonly number[]): CellState[] | null {
  const length = known.length;
  const fits: boolean[][] = [];
  for (let bits = 0; bits < 1 << length; bits += 1) {
    const line = Array.from({ length }, (_, cell) => ((bits >> cell) & 1) === 1);
    const matchesKnown = line.every(
      (filled, cell) => known[cell] === "unknown" || (known[cell] === "filled") === filled,
    );
    if (matchesKnown && JSON.stringify(clueOf(line)) === JSON.stringify(clue)) fits.push(line);
  }
  if (fits.length === 0) return null;
  return known.map((_, cell): CellState => {
    if (fits.every((line) => line[cell])) return "filled";
    if (fits.every((line) => !line[cell])) return "empty";
    return "unknown";
  });
}

interface Clues {
  rows: number[][];
  columns: number[][];
}

function cluesOf(picture: readonly (readonly boolean[])[]): Clues {
  const columns = picture[0].map((_, col) => clueOf(picture.map((row) => row[col])));
  return { rows: picture.map((row) => clueOf(row)), columns };
}

type Reference = { status: "solved"; image: boolean[][]; rounds: number } | { status: "stuck" | "contradiction" };

/** Line by line propagation with no guessing, written from scratch. */
function reference(clues: Clues, width: number, height: number): Reference {
  const cells: CellState[][] = Array.from({ length: height }, () => new Array<CellState>(width).fill("unknown"));
  let rounds = 0;
  for (;;) {
    let changed = false as boolean;
    for (let row = 0; row < height; row += 1) {
      const next = lineByEnumeration(cells[row], clues.rows[row]);
      if (next === null) return { status: "contradiction" };
      next.forEach((state, col) => {
        if (state !== cells[row][col]) {
          cells[row][col] = state;
          changed = true;
        }
      });
    }
    for (let col = 0; col < width; col += 1) {
      const next = lineByEnumeration(
        cells.map((line) => line[col]),
        clues.columns[col],
      );
      if (next === null) return { status: "contradiction" };
      next.forEach((state, row) => {
        if (state !== cells[row][col]) {
          cells[row][col] = state;
          changed = true;
        }
      });
    }
    if (!changed) break;
    rounds += 1;
  }
  if (cells.some((line) => line.includes("unknown"))) return { status: "stuck" };
  return { status: "solved", image: cells.map((line) => line.map((state) => state === "filled")), rounds };
}

function pictureFromBits(bits: number, width: number, height: number): boolean[][] {
  return Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (_, col) => ((bits >> (row * width + col)) & 1) === 1),
  );
}

function knownFromCode(code: number, length: number): CellState[] {
  const states: CellState[] = ["unknown", "filled", "empty"];
  return Array.from({ length }, (_, cell) => states[Math.floor(code / 3 ** cell) % 3]);
}

void describe("solveLine against the enumeration oracle", () => {
  void test("every clue and every set of known cells on lines up to 5 cells", () => {
    for (let length = 1; length <= 5; length += 1) {
      const clues = new Set<string>();
      for (let bits = 0; bits < 1 << length; bits += 1) {
        clues.add(JSON.stringify(clueOf(Array.from({ length }, (_, cell) => ((bits >> cell) & 1) === 1))));
      }
      // A clue that fits no line of this length too.
      clues.add(JSON.stringify([length + 1]));
      clues.add(JSON.stringify([length, 1]));

      for (const text of clues) {
        const clue = JSON.parse(text) as number[];
        for (let code = 0; code < 3 ** length; code += 1) {
          const known = knownFromCode(code, length);

          assert.deepEqual(solveLine(known, clue), lineByEnumeration(known, clue), `${known.join(",")} | ${text}`);
        }
      }
    }
  });

  void test("random lines of 6 to 8 cells with random known cells", () => {
    const random = mulberry32(31);
    let nulls = 0;
    let open = 0;

    for (let round = 0; round < 400; round += 1) {
      const length = 6 + Math.floor(random() * 3);
      const picture = Array.from({ length }, () => random() < 0.5);
      const clue = clueOf(picture);
      const known = picture.map((filled): CellState => {
        const roll = random();
        if (roll < 0.25) return filled ? "filled" : "empty";
        if (roll < 0.3) return filled ? "empty" : "filled";
        return "unknown";
      });
      const expected = lineByEnumeration(known, clue);
      if (expected === null) nulls += 1;
      else if (expected.includes("unknown")) open += 1;

      assert.deepEqual(solveLine(known, clue), expected, `${known.join(",")} | ${JSON.stringify(clue)}`);
    }

    assert.ok(nulls > 0 && open > 0, `${nulls} / ${open}`);
  });
});

void describe("solveNonogram against the propagation oracle", () => {
  void test("every picture of 3×3, 4×3 and 3×4 gives the same status and image", () => {
    for (const [width, height] of [
      [3, 3],
      [4, 3],
      [3, 4],
    ] as const) {
      for (let bits = 0; bits < 1 << (width * height); bits += 1) {
        const clues = cluesOf(pictureFromBits(bits, width, height));
        const expected = reference(clues, width, height);
        const actual = solveNonogram(clues, width, height);

        assert.equal(actual.status, expected.status, `${width}×${height} picture ${bits}`);
        if (expected.status === "solved") {
          assert.deepEqual((actual as { image: boolean[][] }).image, expected.image, `picture ${bits}`);
        }
      }
    }
  });

  void test("every 13th picture of 4×4 (about 5000), with solved, stuck and several-round cases all present", () => {
    const seen = { solved: 0, stuck: 0, manyRounds: 0 };

    // Every 13th keeps this fast; the full 65 536 pictures passed once, and 13 is coprime with 2^16 so the sample is spread over all clue shapes.
    for (let bits = 0; bits < 1 << 16; bits += 13) {
      const picture = pictureFromBits(bits, 4, 4);
      const clues = cluesOf(picture);
      const expected = reference(clues, 4, 4);
      const actual = solveNonogram(clues, 4, 4);

      assert.equal(actual.status, expected.status, `picture ${bits}`);
      if (expected.status === "solved") {
        seen.solved += 1;
        if (expected.rounds >= 3) seen.manyRounds += 1;
        assert.deepEqual((actual as { image: boolean[][] }).image, expected.image, `picture ${bits}`);
        assert.deepEqual((actual as { image: boolean[][] }).image, picture, `picture ${bits}`);
      } else if (expected.status === "stuck") {
        seen.stuck += 1;
      }
    }

    assert.ok(seen.solved > 0 && seen.stuck > 0 && seen.manyRounds > 0, JSON.stringify(seen));
  });

  void test("random 5×5 pictures, and clues of two different pictures, give the same status", () => {
    const random = mulberry32(5);
    const seen = new Set<string>();

    for (let round = 0; round < 300; round += 1) {
      const first = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => random() < 0.55));
      const second = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => random() < 0.55));
      const clues: Clues =
        round % 3 === 2 ? { rows: cluesOf(first).rows, columns: cluesOf(second).columns } : cluesOf(first);
      const expected = reference(clues, 5, 5);
      const actual = solveNonogram(clues, 5, 5);

      seen.add(expected.status);
      assert.equal(actual.status, expected.status, JSON.stringify(clues));
      if (expected.status === "solved") {
        assert.deepEqual((actual as { image: boolean[][] }).image, expected.image);
      }
    }

    assert.ok(seen.has("solved") && seen.has("stuck") && seen.has("contradiction"), [...seen].join(","));
  });
});
