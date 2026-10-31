import { readActiveProfile } from "./active-profile.ts";
import { cardSummaries } from "./card-summary.ts";
import { openingVisit, readChildProfiles, type ChildProfileStorage } from "./child-profiles.ts";
import { readLastUsed } from "./last-used.ts";
import { ALLOWED_CHARACTER_IDS } from "./sheet/character.ts";

/** Sent on the window by the catalog's profile corner after the profile or the chosen child changed in this tab. */
export const PROFILE_CHANGED_EVENT = "printokids:profile-changed";

export interface CatalogBadges {
  /** The profile whose settings the catalog shows; null when no profile is chosen. */
  profileName: string | null;
  /** The level text by card id, only for the cards the profile has used. */
  badges: Record<string, string>;
}

const NO_BADGES: CatalogBadges = { profileName: null, badges: {} };

/**
 * What the catalog shows for the device's profile. The profile is the one a card page would open with (the stored
 * choice, or the only profile); with several profiles and none chosen, or "Bez profilu", the catalog stays plain.
 */
export function catalogBadges(storage: ChildProfileStorage): CatalogBadges {
  const profiles = readChildProfiles(storage, ALLOWED_CHARACTER_IDS);
  const lastUsed = readLastUsed(storage, ALLOWED_CHARACTER_IDS);
  const opening = openingVisit(profiles, lastUsed, readActiveProfile(storage));
  const active = profiles.find((profile) => profile.id === opening.activeId);
  if (active === undefined) {
    return { ...NO_BADGES, badges: {} };
  }

  const badges: Record<string, string> = {};
  for (const summary of cardSummaries(active)) {
    if (summary.used && summary.badge !== null) {
      badges[summary.id] = summary.badge;
    }
  }
  return { profileName: active.name, badges };
}
