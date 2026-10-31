import { useState } from "react";
import { clearActiveProfile, NO_PROFILE, readActiveProfile, writeActiveProfile } from "@/lib/active-profile";
import type { CardSettingsMap } from "@/lib/card-settings";
import { openingVisit, readChildProfiles, type ChildProfile, type VisitAfterDelete } from "@/lib/child-profiles";
import { readLastUsed } from "@/lib/last-used";
import { ALLOWED_CHARACTER_IDS, characterChoice, OWN_IMAGE_ID, type SheetCharacterId } from "@/lib/sheet/character";
import { drawnVisitCharacter } from "@/lib/sheet/own-image-store";

export interface ProfileBar {
  character: SheetCharacterId;
  /** Omit to keep the copy already on the sheet. Null clears it. */
  ownImageHref?: string | null;
}

interface VisitStart extends ProfileBar {
  /** Card settings of the opening visit: the active profile's, or the device's without a profile. */
  cards: CardSettingsMap;
  profiles: ChildProfile[];
  activeId: string | null;
  ask: boolean;
}

export interface ProfileCornerHandlers {
  onCreated: (profile: ChildProfile) => void;
  onChoose: (profile: ChildProfile) => void;
  onFavoriteSaved: (profiles: ChildProfile[], barCharacter: string, ownImageHref?: string | null) => void;
  onDeleted: (next: VisitAfterDelete) => void;
  onClearProfile: () => void;
}

/**
 * Holds the child-profile side of a generator visit: the profiles, the active one, the "which
 * child?" question, and the ProfileCorner handlers, including writes of the active profile.
 * The page owns its bar; onApply hands it the bar values from a profile or from the last-used
 * parameters. The hook never writes the last-used parameters: the page does that on bar selection.
 * A stored `wlasne` with nothing to draw is shown as "none" and is not written back.
 */
export function useChildProfileVisit({ onApply }: { onApply: (bar: ProfileBar) => void }): {
  profiles: ChildProfile[];
  activeId: string | null;
  ask: boolean;
  waitingForChild: boolean;
  visitStart: ProfileBar;
  /** The card settings the visit opened with (see `useCardSettings`). */
  visitCards: CardSettingsMap;
  /** Replaces the profile list after a write that did not go through the corner (card settings). */
  replaceProfiles: (next: ChildProfile[]) => void;
  corner: ProfileCornerHandlers;
} {
  const [visit] = useState(() => readVisitStart(localStorage));
  const [profiles, setProfiles] = useState(visit.profiles);
  const [activeId, setActiveId] = useState(visit.activeId);
  const [ask, setAsk] = useState(visit.ask);
  const waitingForChild = profiles.length >= 2 && activeId === null;

  function handleCreated(profile: ChildProfile): void {
    setProfiles((current) => [...current, profile]);
    setActiveId(profile.id);
    onApply(barForStored(profile.character, profile.image ?? null));
    writeActiveProfile(localStorage, profile.id);
  }

  function handleChosen(profile: ChildProfile): void {
    setActiveId(profile.id);
    onApply(barForStored(profile.character, profile.image ?? null));
    writeActiveProfile(localStorage, profile.id);
  }

  function handleCleared(): void {
    const lastUsed = readLastUsed(localStorage, ALLOWED_CHARACTER_IDS);
    const drawn = drawnVisitCharacter(localStorage, null, lastUsed.character);
    setActiveId(null);
    onApply(barForStored(drawn.character, drawn.href));
    setAsk(false);
    writeActiveProfile(localStorage, NO_PROFILE);
  }

  function handleFavoriteSaved(nextProfiles: ChildProfile[], nextBar: string, ownImageHref?: string | null): void {
    setProfiles(nextProfiles);
    const character = characterChoice(nextBar);
    if (character !== OWN_IMAGE_ID) {
      onApply({ character, ownImageHref: null });
      return;
    }
    onApply({
      character,
      ...(ownImageHref !== undefined ? { ownImageHref } : {}),
    });
  }

  function handleDeleted(next: VisitAfterDelete): void {
    setProfiles(next.profiles);
    setActiveId(next.activeId);
    if (next.activeId !== activeId) {
      const nextActive =
        next.activeId === null ? null : (next.profiles.find((profile) => profile.id === next.activeId) ?? null);
      const drawn = drawnVisitCharacter(
        localStorage,
        nextActive === null ? null : { character: nextActive.character, image: nextActive.image },
        next.character,
      );
      onApply(barForStored(drawn.character, drawn.href));
    } else {
      onApply(barForStored(next.character, next.character === OWN_IMAGE_ID ? undefined : null));
    }
    setAsk(next.ask);
    if (next.activeId !== null) {
      writeActiveProfile(localStorage, next.activeId);
    } else if (readActiveProfile(localStorage) !== NO_PROFILE) {
      // An explicit "no profile" survives the delete; otherwise the default rule (single profile, or ask) applies.
      clearActiveProfile(localStorage);
    }
  }

  return {
    profiles,
    activeId,
    ask,
    waitingForChild,
    visitStart: { character: visit.character, ownImageHref: visit.ownImageHref },
    visitCards: visit.cards,
    replaceProfiles: setProfiles,
    corner: {
      onCreated: handleCreated,
      onChoose: handleChosen,
      onFavoriteSaved: handleFavoriteSaved,
      onDeleted: handleDeleted,
      onClearProfile: handleCleared,
    },
  };
}

function barForStored(character: string, href: string | null | undefined): ProfileBar {
  const choice = characterChoice(character);
  if (href === undefined) {
    return { character: choice };
  }
  return { character: choice, ownImageHref: choice === OWN_IMAGE_ID ? href : null };
}

function readVisitStart(storage: Pick<Storage, "getItem" | "setItem">): VisitStart {
  const profiles = readChildProfiles(storage, ALLOWED_CHARACTER_IDS);
  const lastUsed = readLastUsed(storage, ALLOWED_CHARACTER_IDS);
  const opening = openingVisit(profiles, lastUsed, readActiveProfile(storage));
  const active =
    opening.activeId === null ? null : (profiles.find((profile) => profile.id === opening.activeId) ?? null);
  const drawn = drawnVisitCharacter(
    storage,
    active === null ? null : { character: active.character, image: active.image },
    opening.character,
  );
  return {
    profiles,
    activeId: opening.activeId,
    ...barForStored(drawn.character, drawn.href),
    cards: active === null ? lastUsed.cards : (active.cards ?? {}),
    ask: opening.ask,
  };
}
