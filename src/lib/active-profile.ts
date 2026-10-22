const ACTIVE_PROFILE_KEY = "printo-kids:active-profile";

// Stored when the parent explicitly chose "no profile"; an absent key means nothing was chosen yet.
export const NO_PROFILE = "none";

export interface ActiveProfileStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function readActiveProfile(storage: Pick<ActiveProfileStorage, "getItem">): string | null {
  try {
    const raw = storage.getItem(ACTIVE_PROFILE_KEY);
    return raw === null || raw === "" ? null : raw;
  } catch {
    return null;
  }
}

export function writeActiveProfile(storage: Pick<ActiveProfileStorage, "setItem">, idOrNone: string): void {
  try {
    storage.setItem(ACTIVE_PROFILE_KEY, idOrNone);
  } catch {
    // A blocked store must not surface to the caller.
  }
}

export function clearActiveProfile(storage: Pick<ActiveProfileStorage, "removeItem">): void {
  try {
    storage.removeItem(ACTIVE_PROFILE_KEY);
  } catch {
    // A blocked store must not surface to the caller.
  }
}
