// Inventory of the card invariant (gh283, phase 1). One local adapter table in the shape of the future `CardEngine`:
// today's generator plus today's `*Problems` (for the maze, `generateMaze` plus `mazeForSheet`). It checks, for all
// seven card kinds, that generated cards are legal, differ from the previous one, come out in time, and that the guard
// is alive (`knownBad` cards are rejected with the expected code). A case that fails today is a `todo` with a finding
// code from context/changes/gh283-verified-card/phase0-findings.md; its assertion is the one the future engine keeps.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CardSettingsOf, DictationSettings, NonogramSettings, SudokuCardSettings } from "./card-settings.ts";
import { DICTATION_LEVELS, dictationLevelById } from "./dictation/levels.ts";
import { dictationCardProblems, generateDictationCard, type DictationCard } from "./dictation/generate.ts";
import { generateMaze, mazeForSheet, countPaths, type Maze } from "./maze/generate.ts";
import { LEVELS, levelById, type Level } from "./maze/levels.ts";
import { generateMoneyCard } from "./money/generate.ts";
import { MONEY_LEVELS, moneyLevelById } from "./money/levels.ts";
import { moneyCardProblems, type MoneyCard } from "./money/rules.ts";
import { generateNonogramCard, nonogramCardProblems, type NonogramCard } from "./nonogram/generate.ts";
import { simpleNonogramProblems, type SimpleNonogramCard } from "./nonogram/simple.ts";
import { NONOGRAM_SIZES, nonogramSizeById } from "./nonogram/sizes.ts";
import { generateSequenceCard, sequenceCardProblems, type SequenceCard } from "./sequence/generate.ts";
import { SEQUENCE_LEVELS, sequenceLevelById } from "./sequence/levels.ts";
import { generateSudokuCard, sudokuCardProblems, type SudokuCard } from "./sudoku/generate.ts";
import { SUDOKU_LEVELS, SUDOKU_SIZES, sudokuHasLevels, sudokuHasSymbolChoice } from "./sudoku/levels.ts";
import { generateSymmetryCard, mirrorAnswer, symmetryCardProblems, type SymmetryCard } from "./symmetry/generate.ts";
import { SYMMETRY_LEVELS, symmetryLevelById } from "./symmetry/levels.ts";
import { OBJECT_CATEGORY_CHOICES, type ObjectCategoryChoiceId } from "./symmetry/templates.ts";

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = [11, 22, 33, 44, 55];
const CHAIN_LENGTH = 4;
const TIME_BUDGET_MS = 5000;
const CATEGORIES: readonly ObjectCategoryChoiceId[] = OBJECT_CATEGORY_CHOICES.map((choice) => choice.id);

interface KnownBad<S, C> {
  name: string;
  card: C;
  settings: S;
  expectedCode: string;
  /** Finding code from phase0-findings.md when the guard misses this case today. */
  todo?: string;
}

/** The shape of the future `CardEngine`: `generate`, `problems`, `knownBad`. A null from `generate` is "exhausted". */
interface Adapter<S, C> {
  kind: string;
  settingsList: readonly S[];
  label(settings: S): string;
  generate(settings: S, random: () => number, previousKey: string | null): C | null;
  /** Today's guard: what the code rejects now. */
  problems(card: C, settings: S): readonly string[];
  /** Checks only this test has (the maze gate lacks them); they join `problems` for the legality check. */
  extraProblems?(card: C, settings: S): readonly string[];
  keyOf(card: C): string;
  /** False when the generator does not use `previousKey` (the maze). */
  usesPreviousKey: boolean;
  /** True where the PRD allows no other card (a narrow category). */
  mayExhaust(settings: S): boolean;
  knownBad(): readonly KnownBad<S, C>[];
}

function describeAdapter<S, C>(adapter: Adapter<S, C>): void {
  void describe(`card engine inventory: ${adapter.kind}`, () => {
    // First on purpose: a generator that builds a catalog lazily (the dictation) pays for it in its first call, so the cold call counts.
    void test("a card comes out in under 5 s, cold and on average, for every setting", () => {
      for (const settings of adapter.settingsList) {
        const started = performance.now();
        adapter.generate(settings, mulberry32(SEEDS[0]), null);
        const cold = performance.now() - started;
        assert.ok(cold < TIME_BUDGET_MS, `${adapter.label(settings)}: ${Math.round(cold)} ms for the first card`);
        for (const seed of SEEDS.slice(1)) {
          adapter.generate(settings, mulberry32(seed), null);
        }
        const mean = (performance.now() - started) / SEEDS.length;
        assert.ok(mean < TIME_BUDGET_MS, `${adapter.label(settings)}: ${Math.round(mean)} ms per card`);
      }
    });

    void test("generated cards are legal for every setting", () => {
      for (const settings of adapter.settingsList) {
        for (const seed of SEEDS) {
          const card = adapter.generate(settings, mulberry32(seed), null);
          assert.notEqual(card, null, `${adapter.label(settings)} seed ${seed}: no card`);
          if (card === null) continue;
          const problems = [...adapter.problems(card, settings), ...(adapter.extraProblems?.(card, settings) ?? [])];
          assert.deepEqual(problems, [], `${adapter.label(settings)} seed ${seed}`);
        }
      }
    });

    void test("the next card differs from the previous one", { skip: !adapter.usesPreviousKey }, () => {
      for (const settings of adapter.settingsList) {
        const random = mulberry32(777);
        let previousKey: string | null = null;
        for (let step = 0; step < CHAIN_LENGTH; step += 1) {
          const card = adapter.generate(settings, random, previousKey);
          if (card === null) {
            assert.ok(adapter.mayExhaust(settings), `${adapter.label(settings)} step ${step}: exhausted`);
            break;
          }
          const key = adapter.keyOf(card);
          assert.notEqual(key, previousKey, `${adapter.label(settings)} step ${step}: key repeated`);
          previousKey = key;
        }
      }
    });

    void describe("the guard rejects known bad cards", () => {
      for (const bad of adapter.knownBad()) {
        const options = bad.todo === undefined ? {} : { todo: bad.todo };
        void test(bad.name, options, () => {
          const problems = adapter.problems(bad.card, bad.settings);
          assert.ok(problems.includes(bad.expectedCode), `expected ${bad.expectedCode}, got [${problems.join(", ")}]`);
        });
      }
    });
  });
}

function generated<S, C>(adapter: Pick<Adapter<S, C>, "generate">, settings: S, seed: number): C {
  const card = adapter.generate(settings, mulberry32(seed), null);
  if (card === null) {
    throw new Error(`no card for seed ${seed}`);
  }
  return card;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

// ---------------------------------------------------------------- maze

type MazeSettings = CardSettingsOf<"labirynt">;

function mazeKey(maze: Maze): string {
  return maze.cells.map((row) => row.map((c) => `${+c.north}${+c.east}${+c.south}${+c.west}`).join(",")).join(";");
}

/** The checks D02 4.8 names, written here once more (the gate has only some of them). Codes are the future `mazeSpec` codes. */
function mazeReferenceProblems(maze: Maze, level: Level): string[] {
  const problems = new Set<string>();
  const { entrance, exit } = maze;
  const rows = level.rows;
  const columns = level.columns;
  if (
    maze.width !== columns ||
    maze.height !== rows ||
    maze.cells.length !== rows ||
    maze.cells.some((r) => r.length !== columns)
  ) {
    return ["grid-size"];
  }
  if (entrance.row !== level.entrance.row || entrance.col !== level.entrance.col) problems.add("entrance-position");
  if (maze.cells[entrance.row][entrance.col].north) problems.add("entrance-sealed");
  if (exit.row !== rows - 1 || !level.exitColumns.includes(exit.col)) problems.add("exit-position");
  if (maze.cells[exit.row][exit.col].south) problems.add("exit-sealed");
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const cell = maze.cells[row][col];
      if (col === 0 && !cell.west) problems.add("outer-wall-open");
      if (col === columns - 1 && !cell.east) problems.add("outer-wall-open");
      if (row === 0 && !cell.north && !(row === entrance.row && col === entrance.col)) problems.add("outer-wall-open");
      if (row === rows - 1 && !cell.south && !(row === exit.row && col === exit.col)) problems.add("outer-wall-open");
      if (col < columns - 1 && cell.east !== maze.cells[row][col + 1].west) problems.add("wall-mismatch");
      if (row < rows - 1 && cell.south !== maze.cells[row + 1][col].north) problems.add("wall-mismatch");
    }
  }
  const paths = countPaths(maze, entrance, exit);
  if (paths === 0) problems.add("no-route");
  if (paths > 1) problems.add("several-routes");
  if (reachableCells(maze).size !== rows * columns) problems.add("unreachable-cells");
  return [...problems];
}

function reachableCells(maze: Maze): Set<string> {
  const seen = new Set<string>([`${maze.entrance.row},${maze.entrance.col}`]);
  const queue = [maze.entrance];
  for (const { row, col } of queue) {
    const cell = maze.cells[row][col];
    const next = [
      !cell.north && row > 0 ? { row: row - 1, col } : null,
      !cell.south && row < maze.height - 1 ? { row: row + 1, col } : null,
      !cell.west && col > 0 ? { row, col: col - 1 } : null,
      !cell.east && col < maze.width - 1 ? { row, col: col + 1 } : null,
    ];
    for (const point of next) {
      if (point !== null && !seen.has(`${point.row},${point.col}`)) {
        seen.add(`${point.row},${point.col}`);
        queue.push(point);
      }
    }
  }
  return seen;
}

/** Cells on the route from entrance to exit, found by walking the tree. */
function routeCells(maze: Maze): Set<string> {
  const parent = new Map<string, string | null>([[`${maze.entrance.row},${maze.entrance.col}`, null]]);
  const queue = [maze.entrance];
  for (const { row, col } of queue) {
    const cell = maze.cells[row][col];
    const next = [
      !cell.north && row > 0 ? { row: row - 1, col } : null,
      !cell.south && row < maze.height - 1 ? { row: row + 1, col } : null,
      !cell.west && col > 0 ? { row, col: col - 1 } : null,
      !cell.east && col < maze.width - 1 ? { row, col: col + 1 } : null,
    ];
    for (const point of next) {
      const key = point === null ? "" : `${point.row},${point.col}`;
      if (point !== null && !parent.has(key)) {
        parent.set(key, `${row},${col}`);
        queue.push(point);
      }
    }
  }
  const route = new Set<string>();
  for (let key: string | null | undefined = `${maze.exit.row},${maze.exit.col}`; key; key = parent.get(key)) {
    route.add(key);
  }
  return route;
}

function openNeighborCount(maze: Maze, row: number, col: number): number {
  const cell = maze.cells[row][col];
  return [
    !cell.north && row > 0,
    !cell.south && row < maze.height - 1,
    !cell.west && col > 0,
    !cell.east && col < maze.width - 1,
  ].filter(Boolean).length;
}

function findCell(maze: Maze, test: (row: number, col: number) => boolean): { row: number; col: number } | undefined {
  for (let row = 0; row < maze.height; row += 1) {
    for (let col = 0; col < maze.width; col += 1) {
      if (test(row, col)) return { row, col };
    }
  }
  return undefined;
}

const MAZE_BAD_LEVEL: MazeSettings = { level: "lat3" };

function mazeBadCases(): KnownBad<MazeSettings, Maze>[] {
  const base = generated(mazeAdapter, MAZE_BAD_LEVEL, 5);
  const route = routeCells(base);
  const settings = MAZE_BAD_LEVEL;
  const cases: KnownBad<MazeSettings, Maze>[] = [];
  const add = (name: string, card: Maze, expectedCode: string, todo: string): void => {
    cases.push({ name, card, settings, expectedCode, todo });
  };

  // N3: the entrance is walled shut.
  const n3 = clone(base);
  n3.cells[n3.entrance.row][n3.entrance.col].north = true;
  add("N3 north wall of the entrance closed", n3, "entrance-sealed", "M-N3");

  // N5: the exit is walled shut.
  const n5 = clone(base);
  n5.cells[n5.exit.row][n5.exit.col].south = true;
  add("N5 south wall of the exit closed", n5, "exit-sealed", "M-N5");

  // N6: an outer wall is open somewhere else (four variants).
  const n6a = clone(base);
  n6a.cells[1][0].west = false;
  add("N6 west wall of column 0 open", n6a, "outer-wall-open", "M-N6a");
  const n6b = clone(base);
  n6b.cells[1][n6b.width - 1].east = false;
  add("N6 east wall of the last column open", n6b, "outer-wall-open", "M-N6b");
  const n6c = clone(base);
  const northCol = n6c.entrance.col === 0 ? 1 : 0;
  n6c.cells[0][northCol].north = false;
  add("N6 north wall of row 0 open outside the entrance", n6c, "outer-wall-open", "M-N6c");
  const n6d = clone(base);
  const southCol = n6d.exit.col === 0 ? 1 : 0;
  n6d.cells[n6d.height - 1][southCol].south = false;
  add("N6 south wall of the last row open outside the exit", n6d, "outer-wall-open", "M-N6d");

  // N7: one-sided walls between two cells that are both off the route, so the route count stays 1.
  const offRoutePair = (row: number, col: number, dRow: number, dCol: number): boolean =>
    !route.has(`${row},${col}`) && !route.has(`${row + dRow},${col + dCol}`);
  const openEast = findCell(
    base,
    (row, col) => col < base.width - 1 && offRoutePair(row, col, 0, 1) && !base.cells[row][col].east,
  );
  const closedEast = findCell(
    base,
    (row, col) => col < base.width - 1 && offRoutePair(row, col, 0, 1) && base.cells[row][col].east,
  );
  const closedSouth = findCell(
    base,
    (row, col) => row < base.height - 1 && offRoutePair(row, col, 1, 0) && base.cells[row][col].south,
  );
  if (openEast !== undefined && closedEast !== undefined && closedSouth !== undefined) {
    const n7a = clone(base);
    n7a.cells[openEast.row][openEast.col + 1].west = true; // A.east=false, B.west=true
    add("N7 A.east open, B.west closed", n7a, "wall-mismatch", "M-N7a");
    const n7b = clone(base);
    n7b.cells[closedEast.row][closedEast.col + 1].west = false; // B.west=false, A.east=true
    add("N7 B.west open, A.east closed", n7b, "wall-mismatch", "M-N7b");
    const n7c = clone(base);
    n7c.cells[closedSouth.row][closedSouth.col].south = false; // A.south=false, B.north=true
    add("N7 A.south open, B.north closed", n7c, "wall-mismatch", "M-N7c");
  }

  // N13: a cell, and a group of two cells, cut off by closed walls on every side.
  const tip = findCell(
    base,
    (row, col) =>
      row > 0 &&
      col > 0 &&
      row < base.height - 1 &&
      col < base.width - 1 &&
      !route.has(`${row},${col}`) &&
      openNeighborCount(base, row, col) === 1,
  );
  if (tip !== undefined) {
    const { row, col } = tip;
    const cut = (maze: Maze, from: { row: number; col: number }, to: { row: number; col: number }): void => {
      if (to.row === from.row - 1) {
        maze.cells[from.row][from.col].north = true;
        maze.cells[to.row][to.col].south = true;
      } else if (to.row === from.row + 1) {
        maze.cells[from.row][from.col].south = true;
        maze.cells[to.row][to.col].north = true;
      } else if (to.col === from.col - 1) {
        maze.cells[from.row][from.col].west = true;
        maze.cells[to.row][to.col].east = true;
      } else {
        maze.cells[from.row][from.col].east = true;
        maze.cells[to.row][to.col].west = true;
      }
    };
    const neighborOf = (
      maze: Maze,
      at: { row: number; col: number },
      avoid: string | null,
    ): { row: number; col: number } => {
      const cell = maze.cells[at.row][at.col];
      const options = [
        !cell.north ? { row: at.row - 1, col: at.col } : null,
        !cell.south ? { row: at.row + 1, col: at.col } : null,
        !cell.west ? { row: at.row, col: at.col - 1 } : null,
        !cell.east ? { row: at.row, col: at.col + 1 } : null,
      ].filter((p): p is { row: number; col: number } => p !== null && `${p.row},${p.col}` !== avoid);
      return options[0];
    };
    const n13a = clone(base);
    cut(n13a, tip, neighborOf(n13a, tip, null));
    add("N13 one cell cut off", n13a, "unreachable-cells", "M-N13a");

    // Group: the dead-end cell plus its neighbour, when that neighbour has exactly two openings and is off the route.
    const parentCell = neighborOf(base, tip, null);
    if (
      openNeighborCount(base, parentCell.row, parentCell.col) === 2 &&
      !route.has(`${parentCell.row},${parentCell.col}`)
    ) {
      const n13b = clone(base);
      const grandParent = neighborOf(n13b, parentCell, `${row},${col}`);
      cut(n13b, parentCell, grandParent);
      add("N13 group of two cells cut off", n13b, "unreachable-cells", "M-N13b");
    }
  }
  return cases;
}

const mazeAdapter: Adapter<MazeSettings, Maze> = {
  kind: "labirynt",
  settingsList: LEVELS.map((level): MazeSettings => ({ level: level.id })),
  label: (settings) => settings.level,
  generate: (settings, random) => generateMaze(settings.level, random),
  // Today's guard is the gate and nothing else; it only says yes or no, so the code is a placeholder.
  problems: (card, settings) => (mazeForSheet(card, settings.level) === null ? ["gate-rejected"] : []),
  extraProblems: (card, settings) => mazeReferenceProblems(card, levelById(settings.level)),
  keyOf: mazeKey,
  usesPreviousKey: false,
  mayExhaust: () => false,
  knownBad: mazeBadCases,
};

// ---------------------------------------------------------------- symmetry

type SymmetrySettings = CardSettingsOf<"symetria">;

const symmetryAdapter: Adapter<SymmetrySettings, SymmetryCard> = {
  kind: "symetria",
  settingsList: SYMMETRY_LEVELS.flatMap((level) =>
    CATEGORIES.map((category): SymmetrySettings => ({ level: level.id, colors: false, category })),
  ),
  label: (settings) => `${settings.level}/${settings.category}`,
  generate: (settings, random, previousKey) =>
    generateSymmetryCard(random, previousKey, symmetryLevelById(settings.level), settings.category),
  problems: (card) => symmetryCardProblems(card),
  keyOf: (card) => card.key,
  usesPreviousKey: true,
  mayExhaust: (settings) => settings.category !== "wszystkie",
  knownBad: () => {
    const settings: SymmetrySettings = { level: "lat4", colors: false, category: "wszystkie" };
    const base = generated(symmetryAdapter, settings, 3);
    const answer = mirrorAnswer(base);
    const wrongHint = {
      ...base.hints[0],
      color: base.hints[0].color === "red" ? "blue" : "red",
    } as SymmetryCard["hints"][number];
    return [
      { name: "no filled cell", card: { ...clone(base), cells: [] }, settings, expectedCode: "no-filled-cell" },
      {
        name: "hints reveal the whole answer",
        card: { ...clone(base), hints: [...answer] },
        settings,
        expectedCode: "hints-reveal-all",
      },
      {
        name: "a hint outside the answer",
        card: { ...clone(base), hints: [wrongHint, ...base.hints.slice(1)] },
        settings,
        expectedCode: "hint-not-in-answer",
      },
    ];
  },
};

// ---------------------------------------------------------------- sequences

type SequenceSettings = CardSettingsOf<"sekwencje">;

const sequenceAdapter: Adapter<SequenceSettings, SequenceCard> = {
  kind: "sekwencje",
  settingsList: SEQUENCE_LEVELS.map((level): SequenceSettings => ({ level: level.id, colors: false })),
  label: (settings) => settings.level,
  generate: (settings, random, previousKey) =>
    generateSequenceCard(random, previousKey, sequenceLevelById(settings.level)),
  problems: (card, settings) => sequenceCardProblems(card, sequenceLevelById(settings.level)),
  keyOf: (card) => card.key,
  usesPreviousKey: true,
  mayExhaust: () => false,
  knownBad: () => {
    const settings: SequenceSettings = { level: "lat5", colors: false };
    const base = generated(sequenceAdapter, settings, 3);
    const duplicated = clone(base);
    duplicated.rows = [duplicated.rows[0], duplicated.rows[0], ...duplicated.rows.slice(2)];
    const unknown = clone(base);
    unknown.rows = [
      { ...unknown.rows[0], values: ["?" as never, ...unknown.rows[0].values.slice(1)] },
      ...unknown.rows.slice(1),
    ];
    const noGaps = clone(base);
    noGaps.rows = [{ ...noGaps.rows[0], gaps: [] }, ...noGaps.rows.slice(1)];
    return [
      { name: "the same row twice", card: duplicated, settings, expectedCode: "duplicate-row" },
      { name: "an item that is no shape or number", card: unknown, settings, expectedCode: "unknown-item" },
      { name: "a row without gaps", card: noGaps, settings, expectedCode: "gap-count" },
    ];
  },
};

// ---------------------------------------------------------------- sudoku

function sudokuSettingsList(): SudokuCardSettings[] {
  const list: SudokuCardSettings[] = [];
  for (const { id: size } of SUDOKU_SIZES) {
    const levels = sudokuHasLevels(size) ? SUDOKU_LEVELS.map((level) => level.id) : [SUDOKU_LEVELS[0].id];
    const symbols = sudokuHasSymbolChoice(size) ? (["shapes", "digits"] as const) : (["shapes"] as const);
    for (const level of levels) {
      for (const symbol of symbols) {
        list.push({ size, level, symbols: symbol, colors: false });
      }
    }
  }
  return list;
}

const sudokuAdapter: Adapter<SudokuCardSettings, SudokuCard> = {
  kind: "sudoku",
  settingsList: sudokuSettingsList(),
  label: (settings) => `${settings.size}x${settings.size}/${settings.level}/${settings.symbols}`,
  generate: (settings, random, previousKey) => generateSudokuCard(random, previousKey, settings),
  problems: (card) => sudokuCardProblems(card),
  keyOf: (card) => card.key,
  usesPreviousKey: true,
  mayExhaust: () => false,
  knownBad: () => {
    const six: SudokuCardSettings = { size: 6, level: "latwy", symbols: "shapes", colors: false };
    const four: SudokuCardSettings = { size: 4, level: "latwy", symbols: "shapes", colors: false };
    const base6 = generated(sudokuAdapter, six, 3);
    const base4 = generated(sudokuAdapter, four, 3);
    const brokenSolution = clone(base6);
    const [first, ...otherRows] = brokenSolution.solution;
    brokenSolution.solution = [[first[1], first[0], ...first.slice(2)], ...otherRows];
    const manyBlanks = clone(base6);
    manyBlanks.givens = manyBlanks.givens.map((row) => row.map(() => null));
    const twoBlanksInRow = clone(base4);
    twoBlanksInRow.givens = twoBlanksInRow.givens.map((row, index) =>
      index === 0 ? row.map((value, col) => (col < 2 ? null : value)) : row,
    );
    return [
      {
        name: "a solution that breaks the sudoku rule",
        card: brokenSolution,
        settings: six,
        expectedCode: "invalid-solution",
      },
      { name: "an empty board has no unique solution", card: manyBlanks, settings: six, expectedCode: "not-unique" },
      {
        name: "4x4 with two blanks in a row",
        card: twoBlanksInRow,
        settings: four,
        expectedCode: "blank-count-per-row",
      },
    ];
  },
};

// ---------------------------------------------------------------- nonogram

type AnyNonogramCard = NonogramCard | SimpleNonogramCard;

const nonogramAdapter: Adapter<NonogramSettings, AnyNonogramCard> = {
  kind: "nonogram",
  settingsList: NONOGRAM_SIZES.flatMap((size) =>
    CATEGORIES.map((category): NonogramSettings => ({ level: size.id, category })),
  ),
  label: (settings) => `${settings.level}/${settings.category}`,
  generate: (settings, random, previousKey) =>
    generateNonogramCard(random, previousKey, nonogramSizeById(settings.level), settings.category),
  problems: (card) => (card.kind === "znaczki" ? simpleNonogramProblems(card) : nonogramCardProblems(card)),
  keyOf: (card) => card.key,
  usesPreviousKey: true,
  mayExhaust: (settings) => settings.category !== "wszystkie",
  knownBad: () => {
    const classic: NonogramSettings = { level: "sredni", category: "wszystkie" };
    const easy: NonogramSettings = { level: "latwy", category: "wszystkie" };
    const base = generated(nonogramAdapter, classic, 3);
    const baseEasy = generated(nonogramAdapter, easy, 3);
    if (base.kind !== "liczby" || baseEasy.kind !== "znaczki") {
      throw new Error("fixture: wrong nonogram kinds");
    }
    const flipped = clone(base);
    flipped.solution[0][0] = !flipped.solution[0][0];
    const blank = clone(base);
    blank.solution = blank.solution.map((row) => row.map(() => false));
    // A5: today's guard checks the chips only against the tones, not against the row length or the chip shape.
    const shortRow = clone(baseEasy);
    shortRow.tones = shortRow.tones.map((row, index) => (index === 0 ? row.slice(0, -1) : row));
    shortRow.runs = shortRow.tones.map((row) => {
      const runs: SimpleNonogramCard["runs"][number] = [];
      for (const tone of row) {
        const last = runs[runs.length - 1] as SimpleNonogramCard["runs"][number][number] | undefined;
        if (last?.tone === tone) last.count += 1;
        else runs.push({ tone, count: 1 });
      }
      return runs;
    });
    const splitChips = clone(baseEasy);
    const rowWithRun = splitChips.runs.findIndex((row) => row.some((run) => run.count >= 2));
    const target = splitChips.runs[rowWithRun];
    const at = target.findIndex((run) => run.count >= 2);
    target.splice(at, 1, { tone: target[at].tone, count: 1 }, { tone: target[at].tone, count: target[at].count - 1 });
    return [
      {
        name: "a flipped cell: clues no longer match the picture",
        card: flipped,
        settings: classic,
        expectedCode: "clue-mismatch",
      },
      { name: "a picture without filled cells", card: blank, settings: classic, expectedCode: "no-filled-cell" },
      {
        name: "A5 easy: a row shorter than the grid is not rejected",
        card: shortRow,
        settings: easy,
        expectedCode: "runs-mismatch",
        todo: "A5-a",
      },
      {
        name: "A5 easy: two chips of one tone in a row are not rejected",
        card: splitChips,
        settings: easy,
        expectedCode: "runs-mismatch",
        todo: "A5-b",
      },
    ];
  },
};

// ---------------------------------------------------------------- dictation

type DictationCardSettings = DictationSettings;

const dictationAdapter: Adapter<DictationCardSettings, DictationCard> = {
  kind: "dyktando",
  settingsList: DICTATION_LEVELS.flatMap((level) =>
    CATEGORIES.map((category): DictationCardSettings => ({ level: level.id, category })),
  ),
  label: (settings) => `${settings.level}/${settings.category}`,
  generate: (settings, random, previousKey) =>
    generateDictationCard(random, previousKey, dictationLevelById(settings.level), settings.category),
  problems: (card) => dictationCardProblems(card),
  keyOf: (card) => card.key,
  usesPreviousKey: true,
  mayExhaust: (settings) => settings.category !== "wszystkie",
  knownBad: () => {
    const settings: DictationCardSettings = { level: "lat6", category: "wszystkie" };
    const base = generated(dictationAdapter, settings, 3);
    const open = clone(base);
    open.commands = open.commands.slice(0, -1);
    const shifted = clone(base);
    shifted.start = { col: shifted.start.col + 1, row: shifted.start.row };
    // R-9: the same outline walked from the next vertex. The set of walked edges is unchanged, so the guard says yes.
    const [first, ...rest] = clone(base).commands;
    const step = { right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1] }[first.direction];
    const moved = clone(base);
    moved.commands = [...rest, first];
    moved.start = { col: moved.start.col + step[0] * first.length, row: moved.start.row + step[1] * first.length };
    return [
      { name: "commands that do not return to the start", card: open, settings, expectedCode: "not-closed" },
      {
        name: "a start that moves the whole walk off the outline",
        card: shifted,
        settings,
        expectedCode: "not-the-outline",
      },
      {
        name: "R-9 the start is not the top-left of the silhouette",
        card: moved,
        settings,
        expectedCode: "start-not-top-left",
        todo: "R-9",
      },
    ];
  },
};

// ---------------------------------------------------------------- money

type MoneySettings = CardSettingsOf<"pieniadze">;

const moneyAdapter: Adapter<MoneySettings, MoneyCard> = {
  kind: "pieniadze",
  settingsList: MONEY_LEVELS.map((level): MoneySettings => ({ level: level.id })),
  label: (settings) => settings.level,
  generate: (settings, random, previousKey) => generateMoneyCard(random, previousKey, moneyLevelById(settings.level)),
  problems: (card, settings) => moneyCardProblems(card, moneyLevelById(settings.level)),
  keyOf: (card) => card.key,
  usesPreviousKey: true,
  mayExhaust: () => false,
  knownBad: () => {
    const settings: MoneySettings = { level: "sredni" };
    const base = generated(moneyAdapter, settings, 3);
    const twoTies = clone(base);
    twoTies.rows = [
      { left: [5], right: [2, 2, 1], answer: "equal" },
      { left: [2, 1], right: [1, 1, 1], answer: "equal" },
      ...twoTies.rows.slice(2),
    ];
    const wrongAnswer = clone(base);
    wrongAnswer.rows = [
      { ...wrongAnswer.rows[0], answer: wrongAnswer.rows[0].answer === "left" ? "right" : "left" },
      ...wrongAnswer.rows.slice(1),
    ];
    const repeated = clone(base);
    repeated.rows = [repeated.rows[0], repeated.rows[0], ...repeated.rows.slice(2)];
    return [
      { name: "two tie rows on one card", card: twoTies, settings, expectedCode: "tie-rows" },
      { name: "a wrong answer in a row", card: wrongAnswer, settings, expectedCode: "answer" },
      { name: "the same row twice", card: repeated, settings, expectedCode: "duplicate-row" },
    ];
  },
};

describeAdapter(mazeAdapter);
describeAdapter(symmetryAdapter);
describeAdapter(sequenceAdapter);
describeAdapter(sudokuAdapter);
describeAdapter(nonogramAdapter);
describeAdapter(dictationAdapter);
describeAdapter(moneyAdapter);

void describe("card engine inventory: coverage", () => {
  void test("the 11 maze mutants all pass today's gate, so each todo is a real gap", () => {
    const mutants = mazeAdapter.knownBad();
    assert.equal(mutants.length, 11);
    for (const mutant of mutants) {
      assert.deepEqual(mazeAdapter.problems(mutant.card, mutant.settings), [], mutant.name);
      const reference = mazeReferenceProblems(mutant.card, levelById(mutant.settings.level));
      assert.ok(reference.includes(mutant.expectedCode), `${mutant.name}: reference says [${reference.join(", ")}]`);
    }
  });

  void test("the todo probes of the nonogram and the dictation pass today's guard too", () => {
    const easy = nonogramAdapter.knownBad().filter((bad) => bad.todo !== undefined);
    const start = dictationAdapter.knownBad().filter((bad) => bad.todo !== undefined);
    assert.equal(easy.length + start.length, 3);
    for (const bad of easy) {
      assert.deepEqual(nonogramAdapter.problems(bad.card, bad.settings), [], bad.name);
    }
    for (const bad of start) {
      assert.deepEqual(dictationAdapter.problems(bad.card, bad.settings), [], bad.name);
    }
  });

  void test("all seven card kinds have an adapter", () => {
    const kinds = [
      mazeAdapter,
      symmetryAdapter,
      sequenceAdapter,
      sudokuAdapter,
      nonogramAdapter,
      dictationAdapter,
      moneyAdapter,
    ].map((adapter) => adapter.kind);
    assert.deepEqual([...kinds].sort(), [
      "dyktando",
      "labirynt",
      "nonogram",
      "pieniadze",
      "sekwencje",
      "sudoku",
      "symetria",
    ]);
  });
});
