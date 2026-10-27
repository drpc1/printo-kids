import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CharacterChoiceRows } from "@/components/ProfileCorner";
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
}: {
  character: SheetCharacterId;
  label: string;
  thumbSrc: string | null;
  choiceOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: SheetCharacterId) => void;
  onCopied: (href: string) => void;
  disabled?: boolean;
}) {
  return (
    <Dialog open={choiceOpen} onOpenChange={onOpenChange}>
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
      </DialogContent>
    </Dialog>
  );
}
