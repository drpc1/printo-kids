import { useEffect, useRef, useState } from "react";
import type { ProfileCornerHandlers, useChildProfileVisit } from "@/hooks/useChildProfileVisit";
import {
  cardSettingsOf,
  withCardSettings,
  type CardSettingsId,
  type CardSettingsMap,
  type CardSettingsOf,
} from "@/lib/card-settings";
import { updateProfiles, withProfileCards } from "@/lib/child-profiles";
import { readLastUsed, writeLastUsedCards } from "@/lib/last-used";
import { ALLOWED_CHARACTER_IDS } from "@/lib/sheet/character";

type ProfileVisit = ReturnType<typeof useChildProfileVisit>;

const NOTE_VISIBLE_MS = 2000;
export const REMEMBER_ERROR_TEXT = "Nie udało się zapamiętać ustawień";

/** The line under the bar: what was remembered for the profile, or that remembering failed. */
export interface RememberNote {
  text: string;
  tone: "saved" | "error";
}

/** "Zapamiętane dla {imię}", or the error, shown for a moment after a bar change reached (or missed) the active profile. */
export function useRememberNote(): {
  note: RememberNote | null;
  show: (name: string) => void;
  showError: () => void;
} {
  const [note, setNote] = useState<RememberNote | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  function display(next: RememberNote): void {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    setNote(next);
    timer.current = setTimeout(() => {
      setNote(null);
    }, NOTE_VISIBLE_MS);
  }

  function show(name: string): void {
    display({ text: `Zapamiętane dla ${name}`, tone: "saved" });
  }

  function showError(): void {
    display({ text: REMEMBER_ERROR_TEXT, tone: "error" });
  }

  return { note, show, showError };
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
  note: RememberNote | null;
  /** Hand this to ProfileCorner: a profile created on this page starts with this bar. */
  newProfileCards: CardSettingsMap;
  corner: ProfileCornerHandlers;
} {
  const [settings, setSettings] = useState<CardSettingsOf<K>>(() => cardSettingsOf(visit.visitCards, cardId));
  const { note, show, showError } = useRememberNote();

  function persist(next: CardSettingsOf<K>): void {
    const name = activeProfileName(visit);
    if (visit.activeId === null || name === null) {
      const cards = readLastUsed(localStorage, ALLOWED_CHARACTER_IDS).cards;
      writeLastUsedCards(localStorage, withCardSettings(cards, cardId, next));
      return;
    }

    const activeId = visit.activeId;
    const saved = updateProfiles(localStorage, ALLOWED_CHARACTER_IDS, (stored) => {
      const current = stored.find((profile) => profile.id === activeId);
      return current === undefined
        ? null
        : withProfileCards(stored, current.id, withCardSettings(current.cards ?? {}, cardId, next));
    });
    if (saved.ok) {
      visit.replaceProfiles(saved.profiles);
      show(name);
    } else {
      showError();
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
    onCreated: (profile) => {
      visit.corner.onCreated(profile);
      switchTo(profile.cards ?? {});
    },
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
