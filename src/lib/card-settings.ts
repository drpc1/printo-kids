import { DEFAULT_DICTATION_LEVEL_ID, DICTATION_LEVELS, type DictationLevelId } from "./dictation/levels.ts";
import { DEFAULT_LEVEL_ID, LEVELS, type LevelId } from "./maze/levels.ts";
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

/** The bar settings the profile and the device remember for each card kind. */
export interface LabiryntSettings {
  level: LevelId;
}

export interface SymmetrySettings {
  level: SymmetryLevelId;
  colors: boolean;
  category: ObjectCategoryChoiceId;
}

export interface SequenceSettings {
  level: SequenceLevelId;
  colors: boolean;
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
  labirynt?: LabiryntSettings;
  symetria?: SymmetrySettings;
  sekwencje?: SequenceSettings;
  sudoku?: SudokuCardSettings;
  nonogram?: NonogramSettings;
  dyktando?: DictationSettings;
}

export type CardSettingsId = keyof CardSettingsMap;

export const CARD_SETTINGS_IDS: readonly CardSettingsId[] = [
  "labirynt",
  "symetria",
  "sekwencje",
  "sudoku",
  "nonogram",
  "dyktando",
];

/** The settings of one card. */
export type CardSettingsOf<K extends CardSettingsId> = NonNullable<CardSettingsMap[K]>;

type Defaults = { [K in CardSettingsId]-?: NonNullable<CardSettingsMap[K]> };

const DEFAULTS: Defaults = {
  labirynt: { level: DEFAULT_LEVEL_ID },
  symetria: { level: DEFAULT_SYMMETRY_LEVEL_ID, colors: false, category: DEFAULT_OBJECT_CATEGORY_ID },
  sekwencje: { level: DEFAULT_SEQUENCE_LEVEL_ID, colors: false },
  sudoku: { ...DEFAULT_SUDOKU_SETTINGS, colors: false },
  nonogram: { level: DEFAULT_NONOGRAM_SIZE_ID, category: DEFAULT_OBJECT_CATEGORY_ID },
  dyktando: { level: DEFAULT_DICTATION_LEVEL_ID, category: DEFAULT_OBJECT_CATEGORY_ID },
};

export function defaultCardSettings<K extends CardSettingsId>(cardId: K): CardSettingsOf<K> {
  return { ...DEFAULTS[cardId] };
}

/** The settings of one card: the stored ones when there are some, otherwise the defaults. */
export function cardSettingsOf<K extends CardSettingsId>(map: CardSettingsMap, cardId: K): CardSettingsOf<K> {
  return map[cardId] ?? defaultCardSettings(cardId);
}

/** A new map with `patch` applied to one card. The result is normalized, so an impossible combination never persists. */
export function withCardSettings<K extends CardSettingsId>(
  map: CardSettingsMap,
  cardId: K,
  patch: Partial<CardSettingsOf<K>>,
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

/**
 * Reads the `cards` field of a stored record together with the maze level it used to carry in a top-level `level`
 * (profiles and last-used parameters before the maze joined `cards`). The maze level is the stored `cards.labirynt`
 * level when it is valid, otherwise a valid legacy `level`, otherwise the default. A record that has neither a
 * maze card nor a valid legacy level gets no maze entry, so the page starts from its default.
 */
export function parseStoredCards(record: unknown): CardSettingsMap {
  if (!isRecord(record)) {
    return {};
  }

  const map = parseCardSettings(record.cards);
  const legacy = record.level;
  if (!isMazeLevel(legacy)) {
    return map;
  }

  const stored = isRecord(record.cards) ? record.cards.labirynt : undefined;
  const storedLevel = isRecord(stored) ? stored.level : undefined;
  if (isMazeLevel(storedLevel)) {
    return map;
  }

  return { ...map, labirynt: { level: legacy } };
}

function isMazeLevel(value: unknown): value is LevelId {
  return typeof value === "string" && LEVELS.some((level) => level.id === value);
}

function parseCard<K extends CardSettingsId>(cardId: K, stored: Record<string, unknown>): CardSettingsOf<K> {
  const defaults = defaultCardSettings(cardId);
  const parsed: Record<string, unknown> = {};
  for (const [field, fallback] of Object.entries(defaults)) {
    parsed[field] = fieldValue(cardId, field, stored[field], fallback);
  }

  return normalizeCard(cardId, parsed as unknown as CardSettingsOf<K>);
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
    case "labirynt":
      return LEVELS.map((level) => level.id);
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

function normalizeCard<K extends CardSettingsId>(cardId: K, settings: CardSettingsOf<K>): CardSettingsOf<K> {
  if (cardId !== "sudoku") {
    return settings;
  }

  return normalizeSudoku(settings as unknown as SudokuCardSettings) as unknown as CardSettingsOf<K>;
}

/**
 * 4×4 offers only shapes. The bar hides the level at 4×4 and the colors switch for digits, but both values stay, so
 * going back to 6×6 or to shapes brings them back as they were.
 */
function normalizeSudoku(settings: SudokuCardSettings): SudokuCardSettings {
  const size: SudokuSize = settings.size;
  const level: SudokuLevelId = settings.level;
  const symbols: SudokuSymbols = sudokuHasSymbolChoice(size) ? settings.symbols : "shapes";
  const colors = settings.colors;
  return { size, level, symbols, colors };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
