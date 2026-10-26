import { DEFAULT_DICTATION_LEVEL_ID, DICTATION_LEVELS, type DictationLevelId } from "./dictation/levels.ts";
import { DEFAULT_NONOGRAM_SIZE_ID, NONOGRAM_SIZES, type NonogramSizeId } from "./nonogram/sizes.ts";
import { DEFAULT_SEQUENCE_LEVEL_ID, SEQUENCE_LEVELS, type SequenceLevelId } from "./sequence/levels.ts";
import {
  DEFAULT_SUDOKU_SETTINGS,
  SUDOKU_LEVELS,
  SUDOKU_SIZES,
  sudokuHasSymbolChoice,
  type SudokuLevelId,
  type SudokuSettings,
  type SudokuSize,
  type SudokuSymbols,
} from "./sudoku/levels.ts";
import { DEFAULT_SYMMETRY_LEVEL_ID, SYMMETRY_LEVELS, type SymmetryLevelId } from "./symmetry/levels.ts";
import {
  DEFAULT_OBJECT_CATEGORY_ID,
  OBJECT_CATEGORY_CHOICES,
  type ObjectCategoryChoiceId,
} from "./symmetry/templates.ts";

/** The bar settings the profile and the device remember for each card kind except the maze (its level stays in `level`). */
export interface SymmetrySettings {
  level: SymmetryLevelId;
  colors: boolean;
  category: ObjectCategoryChoiceId;
}

export interface SequenceSettings {
  level: SequenceLevelId;
}

export interface SudokuCardSettings extends SudokuSettings {
  colors: boolean;
}

export interface NonogramSettings {
  level: NonogramSizeId;
  category: ObjectCategoryChoiceId;
}

export interface DictationSettings {
  level: DictationLevelId;
  category: ObjectCategoryChoiceId;
}

export interface CardSettingsMap {
  symetria?: SymmetrySettings;
  sekwencje?: SequenceSettings;
  sudoku?: SudokuCardSettings;
  nonogram?: NonogramSettings;
  dyktando?: DictationSettings;
}

export type CardSettingsId = keyof CardSettingsMap;

export const CARD_SETTINGS_IDS: readonly CardSettingsId[] = ["symetria", "sekwencje", "sudoku", "nonogram", "dyktando"];

type Defaults = { [K in CardSettingsId]-?: NonNullable<CardSettingsMap[K]> };

const DEFAULTS: Defaults = {
  symetria: { level: DEFAULT_SYMMETRY_LEVEL_ID, colors: false, category: DEFAULT_OBJECT_CATEGORY_ID },
  sekwencje: { level: DEFAULT_SEQUENCE_LEVEL_ID },
  sudoku: { ...DEFAULT_SUDOKU_SETTINGS, colors: false },
  nonogram: { level: DEFAULT_NONOGRAM_SIZE_ID, category: DEFAULT_OBJECT_CATEGORY_ID },
  dyktando: { level: DEFAULT_DICTATION_LEVEL_ID, category: DEFAULT_OBJECT_CATEGORY_ID },
};

export function defaultCardSettings<K extends CardSettingsId>(cardId: K): Defaults[K] {
  return { ...DEFAULTS[cardId] };
}

/** The settings of one card: the stored ones when there are some, otherwise the defaults. */
export function cardSettingsOf<K extends CardSettingsId>(map: CardSettingsMap, cardId: K): Defaults[K] {
  return (map[cardId] ?? defaultCardSettings(cardId)) as Defaults[K];
}

/** A new map with `patch` applied to one card. The result is normalized, so an impossible combination never persists. */
export function withCardSettings<K extends CardSettingsId>(
  map: CardSettingsMap,
  cardId: K,
  patch: Partial<Defaults[K]>,
): CardSettingsMap {
  const next = normalizeCard(cardId, { ...cardSettingsOf(map, cardId), ...patch });
  return { ...map, [cardId]: next };
}

/**
 * Reads the stored `cards` field of a profile or of the last-used parameters. Anything unreadable becomes the
 * default of that one field; a card that is absent stays absent, so the page starts from its defaults.
 */
export function parseCardSettings(raw: unknown): CardSettingsMap {
  if (!isRecord(raw)) {
    return {};
  }

  const map: CardSettingsMap = {};
  for (const cardId of CARD_SETTINGS_IDS) {
    const stored = raw[cardId];
    if (isRecord(stored)) {
      Object.assign(map, { [cardId]: parseCard(cardId, stored) });
    }
  }

  return map;
}

function parseCard<K extends CardSettingsId>(cardId: K, stored: Record<string, unknown>): Defaults[K] {
  const defaults = defaultCardSettings(cardId);
  const parsed: Record<string, unknown> = {};
  for (const [field, fallback] of Object.entries(defaults)) {
    parsed[field] = fieldValue(cardId, field, stored[field], fallback);
  }

  return normalizeCard(cardId, parsed as unknown as Defaults[K]);
}

function fieldValue(cardId: CardSettingsId, field: string, value: unknown, fallback: unknown): unknown {
  if (field === "colors") {
    return typeof value === "boolean" ? value : fallback;
  }
  if (field === "category") {
    return OBJECT_CATEGORY_CHOICES.some((choice) => choice.id === value) ? value : fallback;
  }
  if (field === "size") {
    return SUDOKU_SIZES.some((size) => size.id === value) ? value : fallback;
  }
  if (field === "symbols") {
    return value === "shapes" || value === "digits" ? value : fallback;
  }

  return levelIds(cardId).includes(value as string) ? value : fallback;
}

/** The ids a card's `level` field may hold. */
function levelIds(cardId: CardSettingsId): readonly string[] {
  switch (cardId) {
    case "symetria":
      return SYMMETRY_LEVELS.map((level) => level.id);
    case "sekwencje":
      return SEQUENCE_LEVELS.map((level) => level.id);
    case "sudoku":
      return SUDOKU_LEVELS.map((level) => level.id);
    case "nonogram":
      return NONOGRAM_SIZES.map((size) => size.id);
    case "dyktando":
      return DICTATION_LEVELS.map((level) => level.id);
  }
}

function normalizeCard<K extends CardSettingsId>(cardId: K, settings: Defaults[K]): Defaults[K] {
  if (cardId !== "sudoku") {
    return settings;
  }

  return normalizeSudoku(settings as Defaults["sudoku"]) as Defaults[K];
}

/** 4×4 offers only shapes and has one level; digits carry no colors. */
function normalizeSudoku(settings: SudokuCardSettings): SudokuCardSettings {
  const size: SudokuSize = settings.size;
  const level: SudokuLevelId = size === 4 ? DEFAULT_SUDOKU_SETTINGS.level : settings.level;
  const symbols: SudokuSymbols = sudokuHasSymbolChoice(size) ? settings.symbols : "shapes";
  const colors = symbols === "shapes" ? settings.colors : false;
  return { size, level, symbols, colors };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
