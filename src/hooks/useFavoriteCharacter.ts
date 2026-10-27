import type { useChildProfileVisit } from "@/hooks/useChildProfileVisit";
import { useRememberNote } from "@/hooks/useCardSettings";
import { favoriteDiffers, readChildProfiles, withFavorite, writeChildProfiles } from "@/lib/child-profiles";
import { ALLOWED_CHARACTER_IDS, OWN_IMAGE_ID, type SheetCharacterId } from "@/lib/sheet/character";

export interface FavoriteOffer {
  name: string;
  /** Saves the bar's character as the active profile's favorite. False when the profile could not be written. */
  save: () => boolean;
}

/**
 * The "Ustaw jako ulubioną {imię}" offer of a card page's character list. It exists only with an active profile
 * and only while the bar's character differs from the favorite. The bar stays as it is: the pick is already on it.
 */
export function useFavoriteCharacter(
  visit: ReturnType<typeof useChildProfileVisit>,
  bar: { character: SheetCharacterId; ownImageHref: string | null },
): { offer: FavoriteOffer | null; note: string | null } {
  const { note, show } = useRememberNote();
  const active = visit.profiles.find((profile) => profile.id === visit.activeId) ?? null;
  if (active === null || !favoriteDiffers(active, bar.character, bar.ownImageHref)) {
    return { offer: null, note };
  }

  function save(): boolean {
    if (active === null) {
      return false;
    }
    // Read just before writing, so a change made on another open page is not overwritten with a stale list.
    const stored = readChildProfiles(localStorage, ALLOWED_CHARACTER_IDS);
    const current = stored.find((profile) => profile.id === active.id);
    if (current === undefined) {
      return false;
    }
    const href = bar.character === OWN_IMAGE_ID ? bar.ownImageHref : null;
    const next = withFavorite(stored, current.id, bar.character, current.level, ALLOWED_CHARACTER_IDS, href);
    if (next === null || !writeChildProfiles(localStorage, next)) {
      return false;
    }
    visit.replaceProfiles(next);
    show(active.name);
    return true;
  }

  return { offer: { name: active.name, save }, note };
}
