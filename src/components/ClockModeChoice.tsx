import { LevelChoice } from "@/components/LevelChoice";
import { CLOCK_MODES, clockModeById, type ClockModeId } from "@/lib/clock/levels";

/**
 * The "Tryb: …" button of the "Zegar" page and the dialog listing the three modes (Odczytaj, Dorysuj, Połącz), each
 * with half a sentence about what the child does. A thin wrapper over `LevelChoice`, like `CategoryChoice`.
 */
export function ClockModeChoice({
  modeId,
  open,
  onOpenChange,
  onSelect,
  disabled = false,
}: {
  modeId: ClockModeId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: ClockModeId) => void;
  disabled?: boolean;
}) {
  return (
    <LevelChoice
      label="Tryb"
      dialogTitle="Wybierz tryb"
      level={clockModeById(modeId)}
      levels={CLOCK_MODES}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      disabled={disabled}
    />
  );
}
