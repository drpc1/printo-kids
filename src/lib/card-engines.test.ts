// Inventory of the card invariant (gh283). The test iterates over `CARD_ENGINES`, the registry the pages use: the generator plus
// the guard of each of the seven card kinds. It checks that generated cards are legal and frozen, differ from the
// previous one, come out in time, that the guard is alive (`knownBad` cards are rejected with the expected code), that
// the registry is complete, and that each kind's `contentKey` follows the "setting -> effect" table (I-9).
// There is no `todo` case any more: every known bad card is rejected by its spec.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { CARD_ENGINES } from "./card-engines.ts";
import { CardExhausted, type CardEngine, type CardKindId } from "./card-contract.ts";
import type { CardSettingsOf, SudokuCardSettings } from "./card-settings.ts";
import { CARD_KINDS } from "./cards.ts";
import { COPY_DRAWING_LEVELS } from "./copy-drawing/levels.ts";
import { DICTATION_LEVELS } from "./dictation/levels.ts";
import { LEVELS } from "./maze/levels.ts";
import { MONEY_CURRENCY_IDS } from "./money/currencies.ts";
import { MONEY_LEVEL_IDS } from "./money/levels.ts";
import { ODD_ONE_OUT_LEVELS } from "./odd-one-out/levels.ts";
import { PATTERN_LINES_LEVELS } from "./pattern-lines/levels.ts";
import { NONOGRAM_SIZES } from "./nonogram/sizes.ts";
import { SEQUENCE_LEVELS } from "./sequence/levels.ts";
import { SUDOKU_LEVELS, SUDOKU_SIZES, sudokuHasLevels, sudokuHasSymbolChoice } from "./sudoku/levels.ts";
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
        void test(bad.name, () => {
          const problems = adapter.problems(bad.card, bad.settings);
          assert.ok(problems.includes(bad.expectedCode), `expected ${bad.expectedCode}, got [${problems.join(", ")}]`);
        });
      }
    });
  });
}

// ---------------------------------------------------------------- inventory per kind

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

/** What only the test knows about a kind: the settings to run through, and the I-9 table ("setting -> effect"). */
interface KindInventory<S> {
  settingsList: readonly S[];
  label(settings: S): string;
  /** True where the PRD allows no other card (a narrow category). */
  mayExhaust(settings: S): boolean;
  /** False when the generator does not use `previousKey` (the maze). */
  usesPreviousKey: boolean;
  base: S;
  /** Settings whose change draws another card: the `contentKey` differs from the base's. */
  content: readonly S[];
  /** Settings whose change only repaints the same card: the `contentKey` equals the base's. */
  decoration: readonly S[];
}

type Inventory = { [K in CardKindId]: KindInventory<CardSettingsOf<K>> };

const narrowCategory = (settings: { category: ObjectCategoryChoiceId }): boolean => settings.category !== "wszystkie";

const INVENTORY: Inventory = {
  labirynt: {
    settingsList: LEVELS.map((level) => ({ level: level.id })),
    label: (settings) => settings.level,
    mayExhaust: () => false,
    usesPreviousKey: false,
    base: { level: LEVELS[0].id },
    content: [{ level: LEVELS[1].id }],
    decoration: [],
  },
  symetria: {
    settingsList: SYMMETRY_LEVELS.flatMap((level) =>
      CATEGORIES.map((category) => ({ level: level.id, colors: false, category })),
    ),
    label: (settings) => `${settings.level}/${settings.category}`,
    mayExhaust: narrowCategory,
    usesPreviousKey: true,
    base: { level: SYMMETRY_LEVELS[0].id, colors: false, category: "wszystkie" },
    content: [
      { level: SYMMETRY_LEVELS[1].id, colors: false, category: "wszystkie" },
      { level: SYMMETRY_LEVELS[0].id, colors: false, category: "zwierzeta" },
    ],
    decoration: [{ level: SYMMETRY_LEVELS[0].id, colors: true, category: "wszystkie" }],
  },
  sekwencje: {
    settingsList: SEQUENCE_LEVELS.map((level) => ({ level: level.id, currency: "pln", colors: false })),
    label: (settings) => settings.level,
    mayExhaust: () => false,
    usesPreviousKey: true,
    base: { level: SEQUENCE_LEVELS[0].id, colors: false },
    content: [{ level: SEQUENCE_LEVELS[1].id, colors: false }],
    decoration: [{ level: SEQUENCE_LEVELS[0].id, colors: true }],
  },
  sudoku: {
    settingsList: sudokuSettingsList(),
    label: (settings) => `${settings.size}x${settings.size}/${settings.level}/${settings.symbols}`,
    mayExhaust: () => false,
    usesPreviousKey: true,
    base: { size: 6, level: "latwy", symbols: "shapes", colors: false },
    content: [
      { size: 9, level: "latwy", symbols: "shapes", colors: false },
      { size: 6, level: "trudny", symbols: "shapes", colors: false },
      { size: 6, level: "latwy", symbols: "digits", colors: false },
    ],
    decoration: [{ size: 6, level: "latwy", symbols: "shapes", colors: true }],
  },
  nonogram: {
    settingsList: NONOGRAM_SIZES.flatMap((size) => CATEGORIES.map((category) => ({ level: size.id, category }))),
    label: (settings) => `${settings.level}/${settings.category}`,
    mayExhaust: narrowCategory,
    usesPreviousKey: true,
    base: { level: "sredni", category: "wszystkie" },
    content: [
      { level: "trudny", category: "wszystkie" },
      { level: "sredni", category: "zwierzeta" },
    ],
    decoration: [],
  },
  dyktando: {
    settingsList: DICTATION_LEVELS.flatMap((level) => CATEGORIES.map((category) => ({ level: level.id, category }))),
    label: (settings) => `${settings.level}/${settings.category}`,
    mayExhaust: narrowCategory,
    usesPreviousKey: true,
    base: { level: "lat6", category: "wszystkie" },
    content: [
      { level: "lat7", category: "wszystkie" },
      { level: "lat6", category: "zwierzeta" },
    ],
    decoration: [],
  },
  pieniadze: {
    settingsList: MONEY_CURRENCY_IDS.flatMap((currency) =>
      MONEY_LEVEL_IDS.map((level) => ({ level, currency, colors: false })),
    ),
    label: (settings) => `${settings.currency}/${settings.level}`,
    mayExhaust: () => false,
    usesPreviousKey: true,
    base: { level: MONEY_LEVEL_IDS[0], currency: "pln", colors: false },
    content: [
      { level: MONEY_LEVEL_IDS[1], currency: "pln", colors: false },
      { level: MONEY_LEVEL_IDS[0], currency: "eur", colors: false },
    ],
    decoration: [{ level: MONEY_LEVEL_IDS[0], currency: "pln", colors: true }],
  },
  // Colors are part of the task here (the color rule), so they change the content, and nothing is only decoration.
  niepasuje: {
    settingsList: ODD_ONE_OUT_LEVELS.flatMap((level) => [
      { level: level.id, colors: false },
      { level: level.id, colors: true },
    ]),
    label: (settings) => `${settings.level}/${String(settings.colors)}`,
    mayExhaust: () => false,
    usesPreviousKey: true,
    base: { level: ODD_ONE_OUT_LEVELS[0].id, colors: false },
    content: [
      { level: ODD_ONE_OUT_LEVELS[1].id, colors: false },
      { level: ODD_ONE_OUT_LEVELS[0].id, colors: true },
    ],
    decoration: [],
  },
  // No colors and no "Pokaż rozwiązanie": level and category are the whole content, and nothing is only decoration.
  kopiuj: {
    settingsList: COPY_DRAWING_LEVELS.flatMap((level) => CATEGORIES.map((category) => ({ level: level.id, category }))),
    label: (settings) => `${settings.level}/${settings.category}`,
    mayExhaust: narrowCategory,
    usesPreviousKey: true,
    base: { level: "sredni", category: "wszystkie" },
    content: [
      { level: "trudny", category: "wszystkie" },
      { level: "sredni", category: "zwierzeta" },
    ],
    decoration: [],
  },
  // The level is the whole content; "Linie" only draws help lines, so it is decoration.
  szlaczki: {
    settingsList: PATTERN_LINES_LEVELS.flatMap((level) => [
      { level: level.id, lines: true },
      { level: level.id, lines: false },
    ]),
    label: (settings) => `${settings.level}/${String(settings.lines)}`,
    mayExhaust: () => false,
    usesPreviousKey: true,
    base: { level: "poziom3", lines: true },
    content: [{ level: "poziom2", lines: true }],
    decoration: [{ level: "poziom3", lines: false }],
  },
};

/** The shape `describeAdapter` runs on, built from the registry's engine and the kind's inventory. */
function adapterOf<K extends CardKindId>(kind: K): Adapter<CardSettingsOf<K>, unknown> {
  const engine = CARD_ENGINES[kind] as unknown as CardEngine<CardSettingsOf<K>, unknown>;
  const inventory = INVENTORY[kind] as KindInventory<CardSettingsOf<K>>;
  return {
    kind,
    settingsList: inventory.settingsList,
    label: (settings) => inventory.label(settings),
    generate: (settings, random, previousKey) => {
      try {
        return engine.generate(settings, random, previousKey).card;
      } catch (error) {
        if (error instanceof CardExhausted) return null;
        throw error;
      }
    },
    problems: (card, settings) => engine.spec.problems(card, settings).map((problem) => problem.code),
    keyOf: (card) => engine.spec.keyOf(card),
    usesPreviousKey: inventory.usesPreviousKey,
    mayExhaust: (settings) => inventory.mayExhaust(settings),
    knownBad: () => engine.spec.knownBad,
  };
}

const KIND_IDS = CARD_KINDS.map((kind) => kind.id);

for (const kind of KIND_IDS) {
  describeAdapter(adapterOf(kind));
}

void describe("card engine inventory: registry", () => {
  void test("every card kind has an engine of its own kind, and no engine is without a kind", () => {
    assert.deepEqual(Object.keys(CARD_ENGINES).sort(), [...KIND_IDS].sort());
    for (const kind of KIND_IDS) {
      assert.equal(CARD_ENGINES[kind].spec.kind, kind);
    }
  });

  void test("every kind has known bad cards, the maze at least eleven", () => {
    for (const kind of KIND_IDS) {
      const bad = CARD_ENGINES[kind].spec.knownBad;
      assert.ok(bad.length >= 2, `${kind}: ${bad.length} known bad cards`);
    }
    assert.ok(CARD_ENGINES.labirynt.spec.knownBad.length >= 11);
  });

  void test("a verified card is frozen and carries the kind and the spec's key", () => {
    for (const kind of KIND_IDS) {
      const adapter = adapterOf(kind);
      const settings = INVENTORY[kind].base;
      const engine = CARD_ENGINES[kind] as unknown as CardEngine<typeof settings, unknown>;
      const verified = engine.generate(settings, mulberry32(7), null);
      assert.equal(verified.kind, kind);
      assert.ok(Object.isFrozen(verified.card), kind);
      assert.equal(verified.key, adapter.keyOf(verified.card), kind);
    }
  });

  void test("I-9: content settings change the contentKey, decorations do not", () => {
    for (const kind of KIND_IDS) {
      const { base, content, decoration } = INVENTORY[kind] as KindInventory<unknown>;
      const spec = CARD_ENGINES[kind].spec as unknown as { contentKey(settings: unknown): string };
      const key = spec.contentKey(base);
      assert.ok(content.length > 0, `${kind}: no content setting in the table`);
      for (const settings of content) {
        assert.notEqual(spec.contentKey(settings), key, `${kind}: ${JSON.stringify(settings)} should change the card`);
      }
      for (const settings of decoration) {
        assert.equal(spec.contentKey(settings), key, `${kind}: ${JSON.stringify(settings)} should keep the card`);
      }
    }
  });

  void test("the file has no todo case", () => {
    const source = readFileSync(new URL(import.meta.url), "utf8");
    const code = source
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("//"))
      .join("\n");
    assert.equal(/\btodo\s*:/.test(code), false);
  });
});
