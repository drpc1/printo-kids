import { Button } from "@/components/ui/button";
import type { SudokuSymbols } from "@/lib/sudoku/levels";
import { cn } from "@/lib/utils";

const OPTIONS: readonly { id: SudokuSymbols; label: string }[] = [
  { id: "shapes", label: "Kształty" },
  { id: "digits", label: "Cyfry" },
];

/** The "Kształty" and "Cyfry" buttons of the sudoku page, side by side so both options are always in view. */
export function SudokuSymbolsChoice({
  symbols,
  onSelect,
}: {
  symbols: SudokuSymbols;
  onSelect: (symbols: SudokuSymbols) => void;
}) {
  return (
    <div role="group" aria-label="Symbole" className={cn("flex items-center gap-1")}>
      {OPTIONS.map((option) => (
        <Button
          key={option.id}
          type="button"
          variant="ghost"
          aria-pressed={symbols === option.id}
          onClick={() => {
            onSelect(option.id);
          }}
          className={cn(
            "text-muted-foreground hover:text-foreground h-auto px-3 py-1 text-base font-normal",
            symbols === option.id && "bg-muted text-foreground",
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
