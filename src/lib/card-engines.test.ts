// Inventory of the card invariant (gh283). One local adapter table in the shape of `CardEngine`: the generator plus the
// guard of each of the seven card kinds (the maze already goes through `mazeEngine`, phase 4). It checks that generated
// cards are legal, differ from the previous one, come out in time, and that the guard is alive (`knownBad` cards are
// rejected with the expected code). A case that fails today is a `todo` with a finding code from
// context/changes/gh283-verified-card/phase0-findings.md; its assertion is the one the future engine keeps.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted } from "./card-contract.ts";
import type { CardSettingsOf, DictationSettings, NonogramSettings, SudokuCardSettings } from "./card-settings.ts";
import { DICTATION_LEVELS, dictationLevelById } from "./dictation/levels.ts";
import { dictationCardProblems, generateDictationCard, type DictationCard } from "./dictation/generate.ts";
import { mazeEngine, mazeSpec } from "./maze/engine.ts";
import type { Maze } from "./maze/generate.ts";
import { LEVELS } from "./maze/levels.ts";
import { moneyEngine, moneySpec } from "./money/engine.ts";
import { MONEY_LEVELS } from "./money/levels.ts";
import type { MoneyCard } from "./money/rules.ts";
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

const mazeAdapter: Adapter<MazeSettings, Maze> = {
  kind: "labirynt",
  settingsList: LEVELS.map((level): MazeSettings => ({ level: level.id })),
  label: (settings) => settings.level,
  generate: (settings, random, previousKey) => mazeEngine.generate(settings, random, previousKey).card,
  problems: (card, settings) => mazeSpec.problems(card, settings).map((problem) => problem.code),
  keyOf: (card) => mazeSpec.keyOf(card),
  usesPreviousKey: false,
  mayExhaust: () => false,
  knownBad: () => mazeSpec.knownBad,
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
    return [
      { name: "commands that do not return to the start", card: open, settings, expectedCode: "not-closed" },
      {
        name: "a start that moves the whole walk off the outline",
        card: shifted,
        settings,
        expectedCode: "not-the-outline",
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
  generate: (settings, random, previousKey) => {
    try {
      return moneyEngine.generate(settings, random, previousKey).card;
    } catch (error) {
      if (error instanceof CardExhausted) return null;
      throw error;
    }
  },
  problems: (card, settings) => moneySpec.problems(card, settings).map((problem) => problem.code),
  keyOf: (card) => moneySpec.keyOf(card),
  usesPreviousKey: true,
  mayExhaust: () => false,
  knownBad: () => moneySpec.knownBad,
};

describeAdapter(mazeAdapter);
describeAdapter(symmetryAdapter);
describeAdapter(sequenceAdapter);
describeAdapter(sudokuAdapter);
describeAdapter(nonogramAdapter);
describeAdapter(dictationAdapter);
describeAdapter(moneyAdapter);

void describe("card engine inventory: coverage", () => {
  void test("the maze has no todo: its engine rejects every known bad card (phase 4)", () => {
    assert.ok(mazeAdapter.knownBad().length >= 11);
  });

  void test("the todo probes of the easy nonogram pass today's guard too", () => {
    const easy = nonogramAdapter.knownBad().filter((bad) => bad.todo !== undefined);
    assert.equal(easy.length, 2);
    for (const bad of easy) {
      assert.deepEqual(nonogramAdapter.problems(bad.card, bad.settings), [], bad.name);
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
