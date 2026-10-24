import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DIALOG_ROW_CLASS } from "@/components/ProfileCorner";
import { SYMMETRY_LEVELS, type SymmetryLevel, type SymmetryLevelId } from "@/lib/symmetry/levels";
import { cn } from "@/lib/utils";

/** The "Poziom: …" button of the symmetry page and the dialog that lists its four age levels. */
export function SymmetryLevelChoice({
  level,
  open,
  onOpenChange,
  onSelect,
}: {
  level: SymmetryLevel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: SymmetryLevelId) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Poziom: ${level.label}`}
          className={cn("text-muted-foreground hover:text-foreground h-auto gap-1.5 px-2 py-1 text-base font-normal")}
        >
          <span>Poziom:</span>
          {level.label}
          <ChevronDown className={cn("size-4")} aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[calc(100dvh-2rem)] print:hidden")}>
        <DialogTitle className={cn("sr-only")}>Wybierz poziom</DialogTitle>
        <div className={cn("flex flex-col gap-2")}>
          {SYMMETRY_LEVELS.map((option) => (
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
