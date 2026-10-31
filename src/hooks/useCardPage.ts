import { useBarCharacter } from "@/hooks/useBarCharacter";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import { useFavoriteCharacter } from "@/hooks/useFavoriteCharacter";

/**
 * The profile and character side of a card page other than the maze: the child-profile visit, the "Postać" bar and
 * the favorite offer. A profile switch hands its bar to the character bar. The page adds `useCardSettings` on top.
 */
export function useCardPage(): {
  visit: ReturnType<typeof useChildProfileVisit>;
  bar: ReturnType<typeof useBarCharacter>;
  favorite: ReturnType<typeof useFavoriteCharacter>;
} {
  const visit = useChildProfileVisit({ onApply: applyProfileBar });
  const bar = useBarCharacter(visit);
  const favorite = useFavoriteCharacter(visit, bar);

  function applyProfileBar(next: ProfileBar): void {
    bar.applyBar(next);
  }

  return { visit, bar, favorite };
}
