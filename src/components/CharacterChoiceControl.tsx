import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CharacterChoiceRows, DIALOG_ROW_CLASS } from "@/components/ProfileCorner";
import type { FavoriteOffer } from "@/hooks/useFavoriteCharacter";
import type { SheetCharacterId } from "@/lib/sheet/character";
import { cn } from "@/lib/utils";

/** The "Postać" button of a card page's bar and the list of characters it opens. The maze page and the other cards share it. */
export function CharacterChoiceControl({
  character,
  label,
  thumbSrc,
  choiceOpen,
  onOpenChange,
  onSelect,
  onCopied,
  disabled,
  favorite,
}: {
  character: SheetCharacterId;
  label: string;
  thumbSrc: string | null;
  choiceOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: SheetCharacterId) => void;
  onCopied: (href: string) => void;
  disabled?: boolean;
  /** With an active profile and a character other than its favorite: the footer that saves it as the favorite. */
  favorite?: FavoriteOffer | null;
}) {
  const [saveFailed, setSaveFailed] = useState(false);
  const noteId = useId();

  function handleOpenChange(open: boolean): void {
    setSaveFailed(false);
    onOpenChange(open);
  }

  function handleSetFavorite(): void {
    if (favorite === null || favorite === undefined) {
      return;
    }
    if (favorite.save()) {
      onOpenChange(false);
      return;
    }
    setSaveFailed(true);
  }

  return (
    <Dialog open={choiceOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Postać: ${label}`}
          disabled={disabled}
          className={cn("text-muted-foreground hover:text-foreground h-auto gap-1.5 px-2 py-1 text-base font-normal")}
        >
          <span>Postać:</span>
          {thumbSrc !== null ? <img src={thumbSrc} alt="" width={24} height={24} className={cn("size-6")} /> : null}
          {label}
          <ChevronDown className={cn("size-4")} aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[calc(100dvh-2rem)] print:hidden")}>
        <DialogTitle className={cn("sr-only")}>Wybierz postać</DialogTitle>
        <CharacterChoiceRows
          selected={character}
          onSelect={(id) => {
            onSelect(id);
            onOpenChange(false);
          }}
          onCopied={(href) => {
            onCopied(href);
            onOpenChange(false);
          }}
        />
        {favorite !== null && favorite !== undefined ? (
          <div
            className={cn("border-border bg-background sticky bottom-0 mt-2 flex flex-col gap-2 border-t pt-3 pb-1")}
          >
            <p id={noteId} className={cn("text-muted-foreground text-sm")}>
              Tylko na tę kartę
            </p>
            {saveFailed ? (
              <p role="alert" className={cn("text-destructive text-sm")}>
                Nie udało się zapisać profilu
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              aria-describedby={noteId}
              className={cn(DIALOG_ROW_CLASS, "min-h-11 w-full justify-center break-words whitespace-normal")}
              onClick={handleSetFavorite}
            >
              {`Ustaw jako ulubioną ${favorite.name}`}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
