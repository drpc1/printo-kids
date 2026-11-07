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
import { nonogramEngine, nonogramSpec, type AnyNonogramCard } from "./nonogram/engine.ts";
import { NONOGRAM_SIZES } from "./nonogram/sizes.ts";
import { sequenceEngine, sequenceSpec } from "./sequence/engine.ts";
import type { SequenceCard } from "./sequence/generate.ts";
import { SEQUENCE_LEVELS } from "./sequence/levels.ts";
import { sudokuEngine, sudokuSpec } from "./sudoku/engine.ts";
import type { SudokuCard } from "./sudoku/generate.ts";
import { SUDOKU_LEVELS, SUDOKU_SIZES, sudokuHasLevels, sudokuHasSymbolChoice } from "./sudoku/levels.ts";
import { symmetryEngine, symmetrySpec } from "./symmetry/engine.ts";
import type { SymmetryCard } from "./symmetry/generate.ts";
import { SYMMETRY_LEVELS } from "./symmetry/levels.ts";
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
  generate: (settings, random, previousKey) => {
    try {
      return symmetryEngine.generate(settings, random, previousKey).card;
    } catch (error) {
      if (error instanceof CardExhausted) return null;
      throw error;
    }
  },
  problems: (card, settings) => symmetrySpec.problems(card, settings).map((problem) => problem.code),
  keyOf: (card) => symmetrySpec.keyOf(card),
  usesPreviousKey: true,
  mayExhaust: (settings) => settings.category !== "wszystkie",
  knownBad: () => symmetrySpec.knownBad,
};

// ---------------------------------------------------------------- sequences

type SequenceSettings = CardSettingsOf<"sekwencje">;

const sequenceAdapter: Adapter<SequenceSettings, SequenceCard> = {
  kind: "sekwencje",
  settingsList: SEQUENCE_LEVELS.map((level): SequenceSettings => ({ level: level.id, colors: false })),
  label: (settings) => settings.level,
  generate: (settings, random, previousKey) => {
    try {
      return sequenceEngine.generate(settings, random, previousKey).card;
    } catch (error) {
      if (error instanceof CardExhausted) return null;
      throw error;
    }
  },
  problems: (card, settings) => sequenceSpec.problems(card, settings).map((problem) => problem.code),
  keyOf: (card) => sequenceSpec.keyOf(card),
  usesPreviousKey: true,
  mayExhaust: () => false,
  knownBad: () => sequenceSpec.knownBad,
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
  generate: (settings, random, previousKey) => {
    try {
      return sudokuEngine.generate(settings, random, previousKey).card;
    } catch (error) {
      if (error instanceof CardExhausted) return null;
      throw error;
    }
  },
  problems: (card, settings) => sudokuSpec.problems(card, settings).map((problem) => problem.code),
  keyOf: (card) => sudokuSpec.keyOf(card),
  usesPreviousKey: true,
  mayExhaust: () => false,
  knownBad: () => sudokuSpec.knownBad,
};

// ---------------------------------------------------------------- nonogram

const nonogramAdapter: Adapter<NonogramSettings, AnyNonogramCard> = {
  kind: "nonogram",
  settingsList: NONOGRAM_SIZES.flatMap((size) =>
    CATEGORIES.map((category): NonogramSettings => ({ level: size.id, category })),
  ),
  label: (settings) => `${settings.level}/${settings.category}`,
  generate: (settings, random, previousKey) => {
    try {
      return nonogramEngine.generate(settings, random, previousKey).card;
    } catch (error) {
      if (error instanceof CardExhausted) return null;
      throw error;
    }
  },
  problems: (card, settings) => nonogramSpec.problems(card, settings).map((problem) => problem.code),
  keyOf: (card) => nonogramSpec.keyOf(card),
  usesPreviousKey: true,
  mayExhaust: (settings) => settings.category !== "wszystkie",
  knownBad: () => nonogramSpec.knownBad,
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

  void test("the easy nonogram has no todo: its spec rejects a short row and split chips (phase 9)", () => {
    const easy = nonogramAdapter.knownBad().filter((bad) => bad.settings.level === "latwy");
    assert.equal(easy.length, 2);
    assert.ok(nonogramAdapter.knownBad().every((bad) => bad.todo === undefined));
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
