import { LevelRow, levelRowClass } from "@/components/LevelRow";
import { DIALOG_ROW_CLASS } from "@/components/ProfileCorner";
import { Button } from "@/components/ui/button";
import { LEVELS, type LevelId } from "@/lib/maze/levels";
import { cn } from "@/lib/utils";

/** The maze's level rows: name, what changes and the typical age. Only the maze page lists these levels. */
export function LevelChoiceRows({ selected, onSelect }: { selected: LevelId; onSelect: (id: LevelId) => void }) {
  return (
    <div className={cn("flex flex-col gap-2")}>
      {LEVELS.map((option) => (
        <Button
          key={option.id}
          type="button"
          variant="ghost"
          aria-pressed={selected === option.id}
          className={cn(
            DIALOG_ROW_CLASS,
            "w-full",
            levelRowClass(option.description),
            selected === option.id && "bg-muted",
          )}
          onClick={() => {
            onSelect(option.id);
          }}
        >
          <LevelRow label={option.label} description={option.description} typicalAge={option.typicalAge} />
        </Button>
      ))}
    </div>
  );
}
