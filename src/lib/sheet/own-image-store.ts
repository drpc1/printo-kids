import { writeLastUsed, type LastUsedStorage } from "../last-used.ts";
import { OWN_IMAGE_ID } from "./character.ts";

export const OWN_IMAGE_KEY = "printo-kids:own-image";

const HREF_PATTERN = /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/;

export interface OwnImageStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function isOwnImageDataUrl(value: unknown): value is string {
  return typeof value === "string" && HREF_PATTERN.test(value);
}

/** The device row. Bad JSON, a missing key, and any href that is not a JPEG or PNG data URL read as no copy. */
export function readOwnImage(storage: OwnImageStorage): string | null {
  try {
    const raw = storage.getItem(OWN_IMAGE_KEY);
    if (raw === null || raw === "") {
      return null;
    }

    const stored = JSON.parse(raw) as unknown;
    if (!isRecord(stored)) {
      return null;
    }

    return isOwnImageDataUrl(stored.href) ? stored.href : null;
  } catch {
    return null;
  }
}

/** Persist the device copy. A thrown write or a href this store does not keep returns false and leaves the key. */
export function writeOwnImage(storage: OwnImageStorage, href: string): boolean {
  if (!isOwnImageDataUrl(href)) {
    return false;
  }

  try {
    storage.setItem(OWN_IMAGE_KEY, JSON.stringify({ href }));
    return true;
  } catch {
    return false;
  }
}

export interface DrawnCharacter {
  character: string;
  href: string | null;
}

/**
 * The character a visit may draw. `profileCharacter` null means nobody is active, so last-used applies.
 * `wlasne` without a drawable copy becomes "none". This function does not write.
 */
export function drawnVisitCharacter(
  storage: OwnImageStorage,
  active: { character: string; image?: string } | null,
  lastUsedCharacter: string,
): DrawnCharacter {
  const deviceHref = readOwnImage(storage);
  if (active !== null) {
    if (active.character === OWN_IMAGE_ID && isOwnImageDataUrl(active.image)) {
      return { character: OWN_IMAGE_ID, href: active.image };
    }
    if (active.character === OWN_IMAGE_ID) {
      return { character: "none", href: null };
    }
    return { character: active.character, href: null };
  }

  if (lastUsedCharacter === OWN_IMAGE_ID) {
    if (isOwnImageDataUrl(deviceHref)) {
      return { character: OWN_IMAGE_ID, href: deviceHref };
    }
    return { character: "none", href: null };
  }

  return { character: lastUsedCharacter, href: null };
}

/** Remember a bar pick the way Kot is remembered. The device copy stays either way. */
export function recordBarCharacter(storage: LastUsedStorage, activeProfileId: string | null, character: string): void {
  if (activeProfileId !== null) {
    return;
  }

  writeLastUsed(storage, { character });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
