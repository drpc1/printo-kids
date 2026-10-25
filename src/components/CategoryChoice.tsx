import { LevelChoice } from "@/components/LevelChoice";
import { OBJECT_CATEGORY_CHOICES, type ObjectCategoryChoiceId } from "@/lib/symmetry/templates";

/**
 * The "Kategoria: …" button of the pages that draw an object from the template catalog (symmetry, nonogram,
 * dictation) and the dialog listing "Wszystkie" and the five categories. The parent picks exactly one; the choice
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
  const category = OBJECT_CATEGORY_CHOICES.find((choice) => choice.id === categoryId) ?? OBJECT_CATEGORY_CHOICES[0];
  return (
    <LevelChoice
      label="Kategoria"
      dialogTitle="Wybierz kategorię"
      level={category}
      levels={OBJECT_CATEGORY_CHOICES}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      disabled={disabled}
    />
  );
}
