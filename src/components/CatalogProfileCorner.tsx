import { useEffect, useState } from "react";
import { ProfileCorner } from "@/components/ProfileCorner";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import { PROFILE_CHANGED_EVENT } from "@/lib/catalog-badges";

/**
 * The profile corner of the catalog page. It is the corner of the card pages without a bar of its own: the page keeps
 * the character and level the corner hands back only to give them to it again. The corner never opens by itself here;
 * "which child?" waits for the card page.
 */
export default function CatalogProfileCorner() {
  const [applied, setApplied] = useState<Pick<ProfileBar, "character" | "level"> | null>(null);
  const { profiles, activeId, visitStart, corner } = useChildProfileVisit({
    onApply: (next) => {
      setApplied({ character: next.character, level: next.level });
    },
  });
  const bar = applied ?? visitStart;

  // The corner writes the profiles before it reports a change, so the catalog reads the new state.
  useEffect(() => {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));
  }, [profiles, activeId]);

  return (
    <ProfileCorner
      profiles={profiles}
      activeId={activeId}
      barCharacter={bar.character}
      barLevel={bar.level}
      ask={false}
      onCreated={corner.onCreated}
      onChoose={corner.onChoose}
      onFavoriteSaved={corner.onFavoriteSaved}
      onDeleted={corner.onDeleted}
      onClearProfile={corner.onClearProfile}
    />
  );
}
