import { useEffect, type ReactNode } from "react";
import { Printer } from "lucide-react";
import { ACTION_BUTTON_CLASS, GenerateButton } from "@/components/GenerateButton";
import { ProfileCorner } from "@/components/ProfileCorner";
import { RememberedNote } from "@/components/RememberedNote";
import { Button } from "@/components/ui/button";
import type { ProfileCornerHandlers } from "@/hooks/useChildProfileVisit";
import type { CardSettingsMap } from "@/lib/card-settings";
import type { ChildProfile } from "@/lib/child-profiles";
import type { LevelId } from "@/lib/maze/levels";
import type { SheetCharacterId } from "@/lib/sheet/character";
import { cn } from "@/lib/utils";

const DEFAULT_FAILED_TEXT = "Nie udało się ułożyć karty.";

/**
 * The page shell of a card generator: the profile corner, the settings row, "Zapamiętane dla …", Generuj and Drukuj,
 * and the card under them. Before the first card the row sits above a large Generuj; after it the row, Generuj and
 * Drukuj sit above the card. The page owns the card's rules: it passes its settings controls as `controls`, its
 * drawing as `sheet`, and what Generuj does as `onGenerate`. The shell blocks Generuj while the page waits for the
 * parent to pick a child, marks `#worksheet-home` as showing a sheet, and keeps every control out of the print.
 */
export function CardPage({
  profiles,
  activeId,
  ask,
  waitingForChild,
  barCharacter,
  barLevel,
  corner,
  newProfileCards,
  note,
  sheetShown,
  controls,
  sheet,
  onGenerate,
  generateFailed,
  failedText = DEFAULT_FAILED_TEXT,
  printDisabled = false,
}: {
  profiles: readonly ChildProfile[];
  activeId: string | null;
  ask: boolean;
  waitingForChild: boolean;
  barCharacter: SheetCharacterId;
  barLevel: LevelId;
  corner: ProfileCornerHandlers;
  /** Omit when a new profile has no card settings to start with (the maze keeps its level in the profile). */
  newProfileCards?: CardSettingsMap;
  note: string | null;
  sheetShown: boolean;
  controls: ReactNode;
  sheet: ReactNode;
  onGenerate: () => void;
  generateFailed: boolean;
  failedText?: string;
  /** True while the shown bar has no card to print (the maze after a level change it could not lay out). */
  printDisabled?: boolean;
}) {
  useEffect(() => {
    const main = document.getElementById("worksheet-home");
    if (main === null) {
      return;
    }
    main.classList.toggle("has-sheet", sheetShown);
    main.classList.toggle("justify-start", sheetShown);
    main.classList.toggle("justify-center", !sheetShown);
  }, [sheetShown]);

  // The shell outlives this island only until the next page load, but a client-side navigation must not inherit the
  // classes of this page's last card.
  useEffect(
    () => () => {
      const main = document.getElementById("worksheet-home");
      main?.classList.remove("has-sheet", "justify-start");
      main?.classList.add("justify-center");
    },
    [],
  );

  function handleGenerate(): void {
    if (waitingForChild) {
      return;
    }
    onGenerate();
  }

  function handlePrint(): void {
    window.print();
  }

  // One row for every card, before and after the first card. A phone wraps it into lines that start at the left edge
  // and sit one gap apart; from sm up it centers before the first card and starts at the left after it.
  const settingsRow = (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-3 max-sm:gap-2",
        !sheetShown && "justify-center max-sm:justify-start",
      )}
    >
      {controls}
      {sheetShown && generateFailed ? <FailedNote text={failedText} /> : null}
    </div>
  );

  return (
    <div className={cn("flex w-full flex-col items-center gap-4")}>
      <ProfileCorner
        profiles={profiles}
        activeId={activeId}
        barCharacter={barCharacter}
        barLevel={barLevel}
        ask={ask}
        onCreated={corner.onCreated}
        onChoose={corner.onChoose}
        onFavoriteSaved={corner.onFavoriteSaved}
        onDeleted={corner.onDeleted}
        onClearProfile={corner.onClearProfile}
        newProfileCards={newProfileCards}
      />
      {sheetShown ? (
        <div className={cn("flex w-full flex-col gap-3 print:hidden")}>
          {settingsRow}
          <RememberedNote note={note} profileActive={activeId !== null} />
          <div className={cn("flex w-full items-center gap-3 sm:gap-4")}>
            <GenerateButton
              onClick={handleGenerate}
              tone="quiet"
              disabled={waitingForChild}
              className="flex-1 sm:flex-none"
            />
            <Button
              type="button"
              variant="default"
              onClick={handlePrint}
              disabled={printDisabled}
              className={cn(ACTION_BUTTON_CLASS, "flex-1 sm:ml-auto sm:flex-none")}
            >
              <Printer aria-hidden />
              Drukuj
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn("flex flex-col items-center gap-6 print:hidden")}>
          {settingsRow}
          <RememberedNote note={note} profileActive={activeId !== null} />
          <GenerateButton onClick={handleGenerate} tone="hero" disabled={waitingForChild} />
          {generateFailed ? <FailedNote text={failedText} /> : null}
        </div>
      )}
      {sheet}
    </div>
  );
}

function FailedNote({ text }: { text: string }) {
  return (
    <p role="alert" className={cn("text-destructive text-sm")}>
      {text}
    </p>
  );
}
