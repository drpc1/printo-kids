import { DEFAULT_LEVEL_ID, isLevelId, type LevelId } from "./maze/levels.ts";

const CHILD_PROFILES_KEY = "printo-kids:child-profiles";
const MAX_NAME_CODE_POINTS = 40;

export interface ChildProfileStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ChildProfile {
  id: string;
  name: string;
  character: string;
  level: LevelId;
}

export function readChildProfiles(storage: ChildProfileStorage, allowed: readonly string[]): ChildProfile[] {
  try {
    const raw = storage.getItem(CHILD_PROFILES_KEY);
    if (raw === null || raw === "") {
      return [];
    }

    const profiles = profilesField(parseStored(raw));
    if (profiles === null) {
      return [];
    }

    return keepProfiles(profiles, allowed);
  } catch {
    return [];
  }
}

export function profileNameError(
  name: string,
  existingNames: readonly string[],
): "empty" | "too-long" | "duplicate" | null {
  const trimmed = name.trim();
  if (trimmed === "") {
    return "empty";
  }

  if (codePointLength(trimmed) > MAX_NAME_CODE_POINTS) {
    return "too-long";
  }

  const folded = trimmed.toLocaleLowerCase("pl");
  if (existingNames.some((existing) => existing.toLocaleLowerCase("pl") === folded)) {
    return "duplicate";
  }

  return null;
}

export function writeChildProfiles(storage: ChildProfileStorage, profiles: readonly ChildProfile[]): boolean {
  try {
    storage.setItem(CHILD_PROFILES_KEY, JSON.stringify({ profiles }));
    return true;
  } catch {
    // A blocked store must not surface to the caller.
    return false;
  }
}

export interface BarChoice {
  character: string;
  level: LevelId;
}

export interface OpeningVisit {
  activeId: string | null;
  character: string;
  level: LevelId;
  ask: boolean;
}

export function withFavorite(
  profiles: readonly ChildProfile[],
  id: string,
  character: string,
  level: LevelId,
  allowed: readonly string[],
): ChildProfile[] | null {
  if (!allowed.includes(character) || !isLevelId(level) || !profiles.some((profile) => profile.id === id)) {
    return null;
  }

  return profiles.map((profile) => (profile.id === id ? { ...profile, character, level } : profile));
}

export function barAfterFavoriteSave<T extends string>(bar: T, previousFavorite: T, nextFavorite: T): T {
  return bar === previousFavorite ? nextFavorite : bar;
}

export function openingVisit(
  profiles: readonly ChildProfile[],
  lastUsed: BarChoice,
  stored: string | null,
): OpeningVisit {
  const remembered = stored === null ? undefined : profiles.find((profile) => profile.id === stored);
  if (remembered !== undefined) {
    return { activeId: remembered.id, character: remembered.character, level: remembered.level, ask: false };
  }

  if (stored === "none") {
    return { activeId: null, character: lastUsed.character, level: lastUsed.level, ask: false };
  }

  const only = profiles.length === 1 ? profiles[0] : undefined;
  if (only !== undefined) {
    return { activeId: only.id, character: only.character, level: only.level, ask: false };
  }

  return {
    activeId: null,
    character: lastUsed.character,
    level: lastUsed.level,
    ask: profiles.length >= 2,
  };
}

export interface VisitAfterDelete extends OpeningVisit {
  profiles: ChildProfile[];
}

export function visitAfterDelete(
  profiles: readonly ChildProfile[],
  deletedId: string,
  activeId: string | null,
  bar: BarChoice,
  lastUsed: BarChoice,
): VisitAfterDelete {
  if (!profiles.some((profile) => profile.id === deletedId)) {
    return {
      profiles: [...profiles],
      activeId,
      character: bar.character,
      level: bar.level,
      ask: activeId === null && profiles.length >= 2,
    };
  }

  const remaining = profiles.filter((profile) => profile.id !== deletedId);
  if (activeId !== null && activeId !== deletedId) {
    return {
      profiles: remaining,
      activeId,
      character: bar.character,
      level: bar.level,
      ask: false,
    };
  }

  return { profiles: remaining, ...openingVisit(remaining, lastUsed, null) };
}

export function sortProfiles(profiles: readonly ChildProfile[]): ChildProfile[] {
  return [...profiles].sort((left, right) => left.name.localeCompare(right.name, "pl"));
}

function parseStored(raw: string): unknown {
  return JSON.parse(raw) as unknown;
}

function profilesField(value: unknown): unknown[] | null {
  if (!isRecord(value)) {
    return null;
  }

  const profiles = value.profiles;
  return Array.isArray(profiles) ? profiles : null;
}

function keepProfiles(entries: unknown[], allowed: readonly string[]): ChildProfile[] {
  const kept: ChildProfile[] = [];
  for (const entry of entries) {
    const profile = acceptEntry(entry, allowed, kept);
    if (profile !== null) {
      kept.push(profile);
    }
  }

  return kept;
}

function acceptEntry(entry: unknown, allowed: readonly string[], kept: readonly ChildProfile[]): ChildProfile | null {
  if (!isRecord(entry)) {
    return null;
  }

  const id = entry.id;
  if (typeof id !== "string" || id === "") {
    return null;
  }
  if (kept.some((profile) => profile.id === id)) {
    return null;
  }

  const character = entry.character;
  if (typeof character !== "string" || !allowed.includes(character)) {
    return null;
  }

  const name = entry.name;
  if (
    typeof name !== "string" ||
    profileNameError(
      name,
      kept.map((profile) => profile.name),
    ) !== null
  ) {
    return null;
  }

  const level = isLevelId(entry.level) ? entry.level : DEFAULT_LEVEL_ID;

  return { id, name: name.trim(), character, level };
}

function codePointLength(value: string): number {
  let length = 0;
  for (let index = 0; index < value.length;) {
    index += (value.codePointAt(index) ?? 0) > 0xffff ? 2 : 1;
    length += 1;
  }

  return length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
