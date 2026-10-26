import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DIALOG_ROW_CLASS } from "@/components/ProfileCorner";
import { cn } from "@/lib/utils";

/**
 * A "Rozmiar: 4×4" or "Poziom: łatwy" button of the sudoku page and the dialog that lists its options. One component
 * for both bars, shaped like the symmetry page's level button.
 */
export function SudokuChoice<Id extends string | number>({
  label,
  dialogTitle,
  options,
  value,
  open,
  onOpenChange,
  onSelect,
  disabled = false,
}: {
  label: string;
  dialogTitle: string;
  options: readonly { id: Id; label: string }[];
  value: Id;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: Id) => void;
  disabled?: boolean;
}) {
  const selected = options.find((option) => option.id === value) ?? options[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          aria-label={`${label}: ${selected.label}`}
          className={cn("text-muted-foreground hover:text-foreground h-auto gap-1.5 px-2 py-1 text-base font-normal")}
        >
          <span>{label}:</span>
          {selected.label}
          <ChevronDown className={cn("size-4")} aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[calc(100dvh-2rem)] print:hidden")}>
        <DialogTitle className={cn("sr-only")}>{dialogTitle}</DialogTitle>
        <div className={cn("flex flex-col gap-2")}>
          {options.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              aria-pressed={value === option.id}
              className={cn(DIALOG_ROW_CLASS, "w-full", value === option.id && "bg-muted")}
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
