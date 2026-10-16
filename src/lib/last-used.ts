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
}

const UNSET: LastUsed = { character: UNSET_CHARACTER, level: DEFAULT_LEVEL_ID };

export function readLastUsed(storage: LastUsedStorage, allowed: readonly string[]): LastUsed {
  try {
    const raw = storage.getItem(LAST_USED_KEY);
    if (raw === null || raw === "") {
      return { ...UNSET };
    }

    const stored = parseStored(raw);
    const character = characterField(stored);
    return {
      character: character !== null && allowed.includes(character) ? character : UNSET_CHARACTER,
      level: levelField(stored),
    };
  } catch {
    return { ...UNSET };
  }
}

export function writeLastUsed(storage: LastUsedStorage, lastUsed: LastUsed): void {
  try {
    storage.setItem(LAST_USED_KEY, JSON.stringify({ character: lastUsed.character, level: lastUsed.level }));
  } catch {
    // A blocked store must not surface to the caller.
  }
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
