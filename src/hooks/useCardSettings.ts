import { useEffect, useRef, useState } from "react";
import type { ProfileCornerHandlers, useChildProfileVisit } from "@/hooks/useChildProfileVisit";
import {
  cardSettingsOf,
  withCardSettings,
  type CardSettingsId,
  type CardSettingsMap,
  type CardSettingsOf,
} from "@/lib/card-settings";
import { readChildProfiles, withProfileCards, withProfileLevel, writeChildProfiles } from "@/lib/child-profiles";
import { readLastUsed, writeLastUsedCards } from "@/lib/last-used";
import type { LevelId } from "@/lib/maze/levels";
import { ALLOWED_CHARACTER_IDS } from "@/lib/sheet/character";

type ProfileVisit = ReturnType<typeof useChildProfileVisit>;

const NOTE_VISIBLE_MS = 2000;

/** "Zapamiętane dla {imię}", shown for a moment after a bar change reached the active profile. */
export function useRememberNote(): { note: string | null; show: (name: string) => void } {
  const [note, setNote] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  function show(name: string): void {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    setNote(`Zapamiętane dla ${name}`);
    timer.current = setTimeout(() => {
      setNote(null);
    }, NOTE_VISIBLE_MS);
  }

  return { note, show };
}

function activeProfileName(visit: ProfileVisit): string | null {
  return visit.profiles.find((profile) => profile.id === visit.activeId)?.name ?? null;
}

/**
 * The bar settings of one card page (everything on the bar except the character and "Pokaż rozwiązanie").
 * They start from the active profile, or from the device without a profile, and every change is written at once:
 * to the profile when one is active, otherwise to the last-used parameters. A profile switch replaces them and
 * tells the page through `onSwitch` so it can draw a card that matches the bar. Writes read the stored profiles
 * just before they save, so a change made on another open page is not overwritten with a stale list.
 */
export function useCardSettings<K extends CardSettingsId>(
  cardId: K,
  visit: ProfileVisit,
  onSwitch?: (next: CardSettingsOf<K>, previous: CardSettingsOf<K>) => void,
): {
  settings: CardSettingsOf<K>;
  remember: (patch: Partial<CardSettingsOf<K>>) => CardSettingsOf<K>;
  note: string | null;
  /** Hand this to ProfileCorner: a profile created on this page starts with this bar. */
  newProfileCards: CardSettingsMap;
  corner: ProfileCornerHandlers;
} {
  const [settings, setSettings] = useState<CardSettingsOf<K>>(() => cardSettingsOf(visit.visitCards, cardId));
  const { note, show } = useRememberNote();

  function persist(next: CardSettingsOf<K>): void {
    const name = activeProfileName(visit);
    if (visit.activeId === null || name === null) {
      const cards = readLastUsed(localStorage, ALLOWED_CHARACTER_IDS).cards;
      writeLastUsedCards(localStorage, withCardSettings(cards, cardId, next));
      return;
    }

    const stored = readChildProfiles(localStorage, ALLOWED_CHARACTER_IDS);
    const current = stored.find((profile) => profile.id === visit.activeId);
    if (current === undefined) {
      return;
    }
    const nextProfiles = withProfileCards(stored, current.id, withCardSettings(current.cards ?? {}, cardId, next));
    if (nextProfiles !== null && writeChildProfiles(localStorage, nextProfiles)) {
      visit.replaceProfiles(nextProfiles);
      show(name);
    }
  }

  function remember(patch: Partial<CardSettingsOf<K>>): CardSettingsOf<K> {
    const next = cardSettingsOf(withCardSettings({ [cardId]: settings }, cardId, patch), cardId);
    setSettings(next);
    persist(next);
    return next;
  }

  function switchTo(cards: CardSettingsMap): void {
    const next = cardSettingsOf(cards, cardId);
    setSettings(next);
    onSwitch?.(next, settings);
  }

  const corner: ProfileCornerHandlers = {
    ...visit.corner,
    onChoose: (profile) => {
      visit.corner.onChoose(profile);
      switchTo(profile.cards ?? {});
    },
    onClearProfile: () => {
      visit.corner.onClearProfile();
      switchTo(readLastUsed(localStorage, ALLOWED_CHARACTER_IDS).cards);
    },
    onDeleted: (next) => {
      const activeChanged = next.activeId !== visit.activeId;
      visit.corner.onDeleted(next);
      if (!activeChanged) {
        return;
      }
      const nextActive = next.profiles.find((profile) => profile.id === next.activeId);
      switchTo(
        nextActive === undefined ? readLastUsed(localStorage, ALLOWED_CHARACTER_IDS).cards : (nextActive.cards ?? {}),
      );
    },
  };

  return { settings, remember, note, newProfileCards: { [cardId]: settings }, corner };
}

/**
 * The maze keeps its level in the profile's `level` field. With a profile active, a level picked on the bar is saved
 * at once; without one the page keeps writing the last-used parameters itself. Returns whether a profile took it.
 */
export function useMazeLevelMemory(visit: ProfileVisit): {
  note: string | null;
  remember: (level: LevelId) => boolean;
} {
  const { note, show } = useRememberNote();

  function remember(level: LevelId): boolean {
    const name = activeProfileName(visit);
    if (visit.activeId === null || name === null) {
      return false;
    }

    const stored = readChildProfiles(localStorage, ALLOWED_CHARACTER_IDS);
    const nextProfiles = withProfileLevel(stored, visit.activeId, level);
    if (nextProfiles === null || !writeChildProfiles(localStorage, nextProfiles)) {
      return true;
    }
    visit.replaceProfiles(nextProfiles);
    show(name);
    return true;
  }

  return { note, remember };
}
