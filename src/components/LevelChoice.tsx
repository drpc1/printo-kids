import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DIALOG_ROW_CLASS } from "@/components/ProfileCorner";
import { cn } from "@/lib/utils";

/**
 * The "Poziom: …" button of a card page and the dialog that lists its age levels (`CategoryChoice` reuses it as "Kategoria: …"). Shared by the pages whose levels
 * are `{ id, label }` entries (symmetry, sequences). `disabled` keeps the level, the button and the card on screen in
 * step while the profile corner still waits for the parent to choose a child.
 */
export function LevelChoice<Id extends string>({
  level,
  levels,
  open,
  onOpenChange,
  onSelect,
  disabled = false,
  label = "Poziom",
  dialogTitle = "Wybierz poziom",
}: {
  level: { id: Id; label: string };
  levels: readonly { id: Id; label: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: Id) => void;
  disabled?: boolean;
  /** Name on the button; "Kategoria" reuses this control for the object category. */
  label?: string;
  dialogTitle?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          aria-label={`${label}: ${level.label}`}
          className={cn("text-muted-foreground hover:text-foreground h-auto gap-1.5 px-2 py-1 text-base font-normal")}
        >
          <span>{label}:</span>
          {level.label}
          <ChevronDown className={cn("size-4")} aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[calc(100dvh-2rem)] print:hidden")}>
        <DialogTitle className={cn("sr-only")}>{dialogTitle}</DialogTitle>
        <div className={cn("flex flex-col gap-2")}>
          {levels.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              aria-pressed={level.id === option.id}
              className={cn(DIALOG_ROW_CLASS, "w-full", level.id === option.id && "bg-muted")}
              onClick={() => {
                onSelect(option.id);
                onOpenChange(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
