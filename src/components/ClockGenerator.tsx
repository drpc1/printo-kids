import { useState } from "react";
import { CardPage } from "@/components/CardPage";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { ClockModeChoice } from "@/components/ClockModeChoice";
import { ClockSheet } from "@/components/ClockSheet";
import { LevelChoice } from "@/components/LevelChoice";
import { SettingToggle } from "@/components/SettingToggle";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { ClockSettings } from "@/lib/card-settings";
import type { ClockCard } from "@/lib/clock/card";
import { clockEngine, clockSpec } from "@/lib/clock/engine";
import { CLOCK_LEVELS, clockLevelById, type ClockLevelId, type ClockModeId } from "@/lib/clock/levels";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";

/**
 * The "Zegar" page: Generuj, the card, Drukuj, the character, level and mode buttons, the "24 h" switch and the shared
 * profile corner. The chosen character stands by the instruction and says it. The three settings come from
 * `useCardSettings` and every change is remembered at once. Each of them changes the times or how many dials there
 * are, so with a card shown every change draws a new card (as the currency does on "Kto ma więcej?"); so does a
 * profile switch that changed one of them. The card has no answer on it and no "Pokaż rozwiązanie", colors or category.
 */
export default function ClockGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<ClockCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("zegar", visit, handleProfileSwitch);
  const { level: levelId, mode: modeId, h24 } = memory.settings;
  const view = sheetView(sheet, clockSpec.contentKey(memory.settings));

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, clockEngine, memory.settings, Math.random));
  }

  /** Remembers a bar change and, with a card shown, draws a new card for it. */
  function change(patch: Partial<ClockSettings>): void {
    if (waitingForChild) {
      return;
    }
    const next = memory.remember(patch);
    setSheet(applySettings(sheet, clockEngine, next, Math.random));
  }

  function handleLevelSelect(id: ClockLevelId): void {
    change({ level: id });
  }

  function handleModeSelect(id: ClockModeId): void {
    change({ mode: id });
  }

  function handleH24Change(next: boolean): void {
    change({ h24: next });
  }

  function handleProfileSwitch(next: ClockSettings): void {
    setSheet(applySettings(sheet, clockEngine, next, Math.random));
  }

  const characterControl = (
    <CharacterChoiceControl
      character={bar.character}
      label={bar.label}
      thumbSrc={bar.thumbSrc}
      choiceOpen={bar.choiceOpen}
      onOpenChange={bar.setChoiceOpen}
      onSelect={bar.select}
      onCopied={bar.setOwnImage}
      favorite={favorite.offer}
    />
  );
  const levelControl = (
    <LevelChoice
      level={clockLevelById(levelId)}
      levels={CLOCK_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
      disabled={waitingForChild}
    />
  );
  const modeControl = (
    <ClockModeChoice
      modeId={modeId}
      open={modeOpen}
      onOpenChange={setModeOpen}
      onSelect={handleModeSelect}
      disabled={waitingForChild}
    />
  );
  const h24Control = (
    <SettingToggle label="24 h" checked={h24} onCheckedChange={handleH24Change} disabled={waitingForChild} />
  );

  return (
    <CardPage
      profiles={profiles}
      activeId={activeId}
      ask={ask}
      waitingForChild={waitingForChild}
      barCharacter={bar.character}
      corner={memory.corner}
      newProfileCards={memory.newProfileCards}
      note={memory.note ?? favorite.note}
      sheetShown={view.kind !== "idle"}
      generateFailed={view.failure !== null}
      failedText={
        view.failure === null ? undefined : failureReason(view.failure, { levelLabel: clockLevelById(levelId).label })
      }
      onGenerate={handleGenerate}
      printDisabled={view.kind !== "showing"}
      printedBefore={view.printed}
      onRegenerate={handleGenerate}
      onPrinted={() => {
        setSheet(markPrinted);
      }}
      controls={
        <>
          {characterControl}
          {levelControl}
          {modeControl}
          {h24Control}
        </>
      }
      sheet={
        view.verified !== null ? (
          <ClockSheet
            card={view.verified.card}
            cardKey={view.verified.key}
            characterId={bar.character}
            characterSrc={bar.characterSrc}
          />
        ) : null
      }
    />
  );
}
