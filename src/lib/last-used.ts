import { parseStoredCards, type CardSettingsMap } from "./card-settings.ts";

const LAST_USED_KEY = "printo-kids:last-used";
const UNSET_CHARACTER = "none";

export interface LastUsedStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LastUsed {
  character: string;
  /** Bar settings of every card, the maze level included, kept apart per card. */
  cards: CardSettingsMap;
}

const UNSET: LastUsed = { character: UNSET_CHARACTER, cards: {} };

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
      cards: cardsField(stored),
    };
  } catch {
    return { ...UNSET, cards: {} };
  }
}

/** Writes the character. The stored card settings stay as they are, and a legacy `level` moves into them. */
export function writeLastUsed(storage: LastUsedStorage, lastUsed: Pick<LastUsed, "character">): void {
  try {
    const cards = storedCards(storage);
    const character = { character: lastUsed.character };
    storage.setItem(
      LAST_USED_KEY,
      JSON.stringify(Object.keys(cards).length === 0 ? character : { ...character, cards }),
    );
  } catch {
    // A blocked store must not surface to the caller.
  }
}

/** Writes the card settings. The stored character stays as it is, and a legacy `level` is dropped. */
export function writeLastUsedCards(storage: LastUsedStorage, cards: CardSettingsMap): boolean {
  try {
    const stored = storedRecord(storage);
    delete stored.level;
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
  return parseStoredCards(value);
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
