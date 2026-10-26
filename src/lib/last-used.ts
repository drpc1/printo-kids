import { parseCardSettings, type CardSettingsMap } from "./card-settings.ts";
import { DEFAULT_LEVEL_ID, isLevelId, type LevelId } from "./maze/levels.ts";

const LAST_USED_KEY = "printo-kids:last-used";
const UNSET_CHARACTER = "none";

export interface LastUsedStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LastUsed {
  character: string;
  level: LevelId;
  /** Bar settings of the cards other than the maze, kept apart per card. */
  cards: CardSettingsMap;
}

const UNSET: LastUsed = { character: UNSET_CHARACTER, level: DEFAULT_LEVEL_ID, cards: {} };

export function readLastUsed(storage: LastUsedStorage, allowed: readonly string[]): LastUsed {
  try {
    const raw = storage.getItem(LAST_USED_KEY);
    if (raw === null || raw === "") {
      return { ...UNSET, cards: {} };
    }

    const stored = parseStored(raw);
    const character = characterField(stored);
    return {
      character: character !== null && allowed.includes(character) ? character : UNSET_CHARACTER,
      level: levelField(stored),
      cards: cardsField(stored),
    };
  } catch {
    return { ...UNSET, cards: {} };
  }
}

/** Writes the maze part (character and level). The stored card settings stay as they are. */
export function writeLastUsed(storage: LastUsedStorage, lastUsed: Pick<LastUsed, "character" | "level">): void {
  try {
    const cards = storedCards(storage);
    const maze = { character: lastUsed.character, level: lastUsed.level };
    storage.setItem(LAST_USED_KEY, JSON.stringify(Object.keys(cards).length === 0 ? maze : { ...maze, cards }));
  } catch {
    // A blocked store must not surface to the caller.
  }
}

/** Writes the card settings. The stored character and level stay as they are. */
export function writeLastUsedCards(storage: LastUsedStorage, cards: CardSettingsMap): boolean {
  try {
    const stored = storedRecord(storage);
    storage.setItem(LAST_USED_KEY, JSON.stringify({ ...stored, cards }));
    return true;
  } catch {
    // A blocked store must not surface to the caller.
    return false;
  }
}

function storedRecord(storage: LastUsedStorage): Record<string, unknown> {
  try {
    const raw = storage.getItem(LAST_USED_KEY);
    const stored = raw === null || raw === "" ? null : parseStored(raw);
    return isRecord(stored) ? stored : {};
  } catch {
    return {};
  }
}

function storedCards(storage: LastUsedStorage): CardSettingsMap {
  return cardsField(storedRecord(storage));
}

function cardsField(value: unknown): CardSettingsMap {
  return isRecord(value) ? parseCardSettings(value.cards) : {};
}

function parseStored(raw: string): unknown {
  return JSON.parse(raw) as unknown;
}

function characterField(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const character = value.character;
  return typeof character === "string" ? character : null;
}

function levelField(value: unknown): LevelId {
  if (!isRecord(value)) {
    return DEFAULT_LEVEL_ID;
  }

  return isLevelId(value.level) ? value.level : DEFAULT_LEVEL_ID;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
