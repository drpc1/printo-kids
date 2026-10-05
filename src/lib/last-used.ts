const LAST_USED_KEY = "printo-kids:last-used";
const UNSET_CHARACTER = "none";

export interface LastUsedStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readLastUsed(storage: LastUsedStorage, allowed: readonly string[]): string {
  try {
    const raw = storage.getItem(LAST_USED_KEY);
    if (raw === null || raw === "") {
      return UNSET_CHARACTER;
    }

    const character = characterField(parseStored(raw));
    if (character !== null && allowed.includes(character)) {
      return character;
    }

    return UNSET_CHARACTER;
  } catch {
    return UNSET_CHARACTER;
  }
}

export function writeLastUsed(storage: LastUsedStorage, character: string): void {
  try {
    storage.setItem(LAST_USED_KEY, JSON.stringify({ character }));
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
