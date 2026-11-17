import { LevelChoice } from "@/components/LevelChoice";
import { CODING_MODES, codingModeById, type CodingModeId } from "@/lib/coding/levels";

/**
 * The "Tryb: …" button of the "Kodowanie" page and the dialog listing the two modes (Zapisz, Wykonaj), each with half
 * a sentence about what the child does. A thin wrapper over `LevelChoice`, like `ClockModeChoice`.
 */
export function CodingModeChoice({
  modeId,
  open,
  onOpenChange,
  onSelect,
  disabled = false,
}: {
  modeId: CodingModeId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: CodingModeId) => void;
  disabled?: boolean;
}) {
  return (
    <LevelChoice
      label="Tryb"
      dialogTitle="Wybierz tryb"
      level={codingModeById(modeId)}
      levels={CODING_MODES}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      disabled={disabled}
    />
  );
}
