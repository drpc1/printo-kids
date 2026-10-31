import { useState } from "react";
import type { ProfileBar } from "@/hooks/useChildProfileVisit";
import {
  characterRow,
  characterSheetSrc,
  OWN_IMAGE_ID,
  OWN_IMAGE_LABEL,
  type SheetCharacterId,
} from "@/lib/sheet/character";
import { readOwnImage, recordBarCharacter } from "@/lib/sheet/own-image-store";

/**
 * The "Postać" bar of a card page other than the maze: the chosen character, its own image, and the writes that
 * follow a pick. It starts from the visit's bar (the profile's favorite or the last used) and, like the maze page,
 * remembers a pick as the last used character only when no profile is active.
 */
export function useBarCharacter(visit: { activeId: string | null; visitStart: ProfileBar }): {
  character: SheetCharacterId;
  ownImageHref: string | null;
  /** The file the sheet draws, or null for "Bez postaci" and for an own image with nothing to draw. */
  characterSrc: string | null;
  label: string;
  thumbSrc: string | null;
  choiceOpen: boolean;
  setChoiceOpen: (open: boolean) => void;
  select: (id: SheetCharacterId) => void;
  setOwnImage: (href: string) => void;
  /** Hand this to the page's `applyProfileBar`: a profile switch replaces the bar character. */
  applyBar: (bar: ProfileBar) => void;
} {
  const [character, setCharacter] = useState<SheetCharacterId>(visit.visitStart.character);
  const [ownImageHref, setOwnImageHref] = useState<string | null>(visit.visitStart.ownImageHref ?? null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const catalogChoice = characterRow(character === OWN_IMAGE_ID ? "none" : character);
  const label = character === OWN_IMAGE_ID ? OWN_IMAGE_LABEL : catalogChoice.label;
  const thumbSrc = character === OWN_IMAGE_ID ? ownImageHref : catalogChoice.src;
  const characterSrc = character === OWN_IMAGE_ID ? ownImageHref : characterSheetSrc(character);

  function select(id: SheetCharacterId): void {
    if (id === OWN_IMAGE_ID) {
      const href = readOwnImage(localStorage);
      if (href === null) {
        return;
      }
      setOwnImageHref(href);
    } else {
      setOwnImageHref(null);
    }
    setCharacter(id);
    recordBarCharacter(localStorage, visit.activeId, id);
  }

  function setOwnImage(href: string): void {
    setCharacter(OWN_IMAGE_ID);
    setOwnImageHref(href);
    recordBarCharacter(localStorage, visit.activeId, OWN_IMAGE_ID);
  }

  function applyBar(bar: ProfileBar): void {
    setCharacter(bar.character);
    if (bar.ownImageHref !== undefined) {
      setOwnImageHref(bar.character === OWN_IMAGE_ID ? bar.ownImageHref : null);
    } else if (bar.character !== OWN_IMAGE_ID) {
      setOwnImageHref(null);
    }
  }

  return {
    character,
    ownImageHref,
    characterSrc,
    label,
    thumbSrc,
    choiceOpen,
    setChoiceOpen,
    select,
    setOwnImage,
    applyBar,
  };
}
