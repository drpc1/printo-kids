import { useEffect, useState } from "react";
import { ProfileCorner } from "@/components/ProfileCorner";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import { PROFILE_CHANGED_EVENT } from "@/lib/catalog-badges";

/**
 * The profile corner of the catalog page. It is the corner of the card pages without a bar of its own: the page keeps
 * the character and level the corner hands back only to give them to it again. The corner never opens by itself here;
 * "which child?" waits for the card page.
 */
function CatalogCorner() {
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

/**
 * The corner reads the stored profiles once, so a page restored from the back-forward cache, or a profile changed in
 * another tab, would leave it behind the badges of the catalog. Both events remount it, and the hook reads again.
 * A change made in this tab fires no storage event, so the corner never remounts under its own dialog.
 */
export default function CatalogProfileCorner() {
  const [reads, setReads] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setReads((count) => count + 1);
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refresh();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return <CatalogCorner key={reads} />;
}
