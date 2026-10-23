import { useState } from "react";
import { clearActiveProfile, NO_PROFILE, readActiveProfile, writeActiveProfile } from "@/lib/active-profile";
import { openingVisit, readChildProfiles, type ChildProfile, type VisitAfterDelete } from "@/lib/child-profiles";
import { readLastUsed } from "@/lib/last-used";
import type { LevelId } from "@/lib/maze/levels";
import { CHARACTER_CHOICES } from "@/lib/sheet/character";

const ALLOWED_CHARACTER_IDS = CHARACTER_CHOICES.map((option) => option.id);

type CharacterChoice = (typeof CHARACTER_CHOICES)[number]["id"];

export interface ProfileBar {
  character: CharacterChoice;
  level: LevelId;
}

interface VisitStart extends ProfileBar {
  profiles: ChildProfile[];
  activeId: string | null;
  ask: boolean;
}

export interface ProfileCornerHandlers {
  onCreated: (profile: ChildProfile) => void;
  onChoose: (profile: ChildProfile) => void;
  onFavoriteSaved: (profiles: ChildProfile[], barCharacter: string, barLevel: LevelId) => void;
  onDeleted: (next: VisitAfterDelete) => void;
  onClearProfile: () => void;
}

/**
 * Holds the child-profile side of a generator visit: the profiles, the active one, the "which
 * child?" question, and the ProfileCorner handlers, including writes of the active profile.
 * The page owns its bar; onApply hands it the bar values from a profile or from the last-used
 * parameters. The hook never writes the last-used parameters: the page does that on bar selection.
 */
export function useChildProfileVisit({ onApply }: { onApply: (bar: ProfileBar) => void }): {
  profiles: ChildProfile[];
  activeId: string | null;
  ask: boolean;
  waitingForChild: boolean;
  visitStart: ProfileBar;
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
    onApply({ character: characterChoice(profile.character), level: profile.level });
    writeActiveProfile(localStorage, profile.id);
  }

  function handleChosen(profile: ChildProfile): void {
    setActiveId(profile.id);
    onApply({ character: characterChoice(profile.character), level: profile.level });
    writeActiveProfile(localStorage, profile.id);
  }

  function handleCleared(): void {
    const lastUsed = readLastUsed(localStorage, ALLOWED_CHARACTER_IDS);
    setActiveId(null);
    onApply({ character: characterChoice(lastUsed.character), level: lastUsed.level });
    setAsk(false);
    writeActiveProfile(localStorage, NO_PROFILE);
  }

  function handleFavoriteSaved(nextProfiles: ChildProfile[], nextBar: string, nextLevel: LevelId): void {
    setProfiles(nextProfiles);
    onApply({ character: characterChoice(nextBar), level: nextLevel });
  }

  function handleDeleted(next: VisitAfterDelete): void {
    setProfiles(next.profiles);
    setActiveId(next.activeId);
    onApply({ character: characterChoice(next.character), level: next.level });
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
    visitStart: { character: visit.character, level: visit.level },
    corner: {
      onCreated: handleCreated,
      onChoose: handleChosen,
      onFavoriteSaved: handleFavoriteSaved,
      onDeleted: handleDeleted,
      onClearProfile: handleCleared,
    },
  };
}

function readVisitStart(storage: Pick<Storage, "getItem" | "setItem">): VisitStart {
  const profiles = readChildProfiles(storage, ALLOWED_CHARACTER_IDS);
  const opening = openingVisit(profiles, readLastUsed(storage, ALLOWED_CHARACTER_IDS), readActiveProfile(storage));
  return {
    profiles,
    activeId: opening.activeId,
    character: characterChoice(opening.character),
    level: opening.level,
    ask: opening.ask,
  };
}

function characterChoice(value: string): CharacterChoice {
  const match = CHARACTER_CHOICES.find((option) => option.id === value);
  if (match === undefined) {
    return "none";
  }
  return match.id;
}
