import { LevelChoice } from "@/components/LevelChoice";
import { useToday } from "@/hooks/useToday";
import {
  objectCategoryChoicesOn,
  objectCategorySeparatorAfterOn,
  type ObjectCategoryChoiceId,
} from "@/lib/symmetry/templates";

/**
 * The "Kategoria: …" button of the pages that draw an object from the template catalog (symmetry, nonogram,
 * dictation) and the dialog listing "Wszystkie" and the categories open on the day of the visit. The parent picks exactly one; the choice
 * counts at the next Generuj and lives in the page state.
 */
export function CategoryChoice({
  categoryId,
  open,
  onOpenChange,
  onSelect,
  disabled = false,
}: {
  categoryId: ObjectCategoryChoiceId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: ObjectCategoryChoiceId) => void;
  disabled?: boolean;
}) {
  const today = useToday();
  const choices = objectCategoryChoicesOn(today);
  const category = choices.find((choice) => choice.id === categoryId) ?? choices[0];
  return (
    <LevelChoice
      label="Kategoria"
      dialogTitle="Wybierz kategorię"
      level={category}
      levels={choices}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      disabled={disabled}
      separatorAfter={objectCategorySeparatorAfterOn(today)}
    />
  );
}
