import type { useChildProfileVisit } from "@/hooks/useChildProfileVisit";
import { useRememberNote, type RememberNote } from "@/hooks/useCardSettings";
import { favoriteDiffers, updateProfiles, withFavorite } from "@/lib/child-profiles";
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
): { offer: FavoriteOffer | null; note: RememberNote | null } {
  const { note, show, showError } = useRememberNote();
  const active = visit.profiles.find((profile) => profile.id === visit.activeId) ?? null;
  if (active === null || !favoriteDiffers(active, bar.character, bar.ownImageHref)) {
    return { offer: null, note };
  }

  function save(): boolean {
    if (active === null) {
      return false;
    }
    const href = bar.character === OWN_IMAGE_ID ? bar.ownImageHref : null;
    // The list is read afresh, so a change made on another open page is not overwritten with a stale list.
    const saved = updateProfiles(localStorage, ALLOWED_CHARACTER_IDS, (stored) =>
      withFavorite(stored, active.id, bar.character, ALLOWED_CHARACTER_IDS, href),
    );
    if (!saved.ok) {
      showError();
      return false;
    }
    visit.replaceProfiles(saved.profiles);
    show(active.name);
    return true;
  }

  return { offer: { name: active.name, save }, note };
}
