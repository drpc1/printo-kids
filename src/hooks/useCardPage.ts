import { useState } from "react";
import { useBarCharacter } from "@/hooks/useBarCharacter";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import { useFavoriteCharacter } from "@/hooks/useFavoriteCharacter";

/**
 * The profile and character side of a card page other than the maze: the child-profile visit, the "Postać" bar, the
 * favorite offer, and the maze level the visit carries (`barLevel`, written back unchanged so the last-used row keeps
 * it). A profile switch hands its bar to the character bar and to `barLevel`. The page adds `useCardSettings` on top.
 */
export function useCardPage(): {
  visit: ReturnType<typeof useChildProfileVisit>;
  bar: ReturnType<typeof useBarCharacter>;
  favorite: ReturnType<typeof useFavoriteCharacter>;
  barLevel: ProfileBar["level"];
} {
  const visit = useChildProfileVisit({ onApply: applyProfileBar });
  const [barLevel, setBarLevel] = useState(visit.visitStart.level);
  const bar = useBarCharacter(visit, barLevel);
  const favorite = useFavoriteCharacter(visit, bar);

  function applyProfileBar(next: ProfileBar): void {
    bar.applyBar(next);
    setBarLevel(next.level);
  }

  return { visit, bar, favorite, barLevel };
}
