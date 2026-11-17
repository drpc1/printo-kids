import { useState } from "react";
import { CardPage } from "@/components/CardPage";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { CodingModeChoice } from "@/components/CodingModeChoice";
import { CodingSheet } from "@/components/CodingSheet";
import { LevelChoice } from "@/components/LevelChoice";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { CodingSettings } from "@/lib/card-settings";
import type { CodingCard } from "@/lib/coding/card";
import { codingEngine, codingSpec } from "@/lib/coding/engine";
import { CODING_LEVELS, codingLevelById, type CodingLevelId, type CodingModeId } from "@/lib/coding/levels";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";

/**
 * The "Kodowanie" page: Generuj, the card, Drukuj, the character, level and mode buttons and the shared profile
 * corner. The chosen character stands by the instruction and says it, and on the grid it stands in the start cell. The
 * two settings come from `useCardSettings` and every change is remembered at once. Each of them changes the grid or the
 * task, so with a card shown every change draws a new card; so does a profile switch that changed one of them. The
 * card has no "Pokaż rozwiązanie", colors or category: the answer can be checked by following the arrows with a finger.
 */
export default function CodingGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<CodingCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("kodowanie", visit, handleProfileSwitch);
  const { level: levelId, mode: modeId } = memory.settings;
  const view = sheetView(sheet, codingSpec.contentKey(memory.settings));

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, codingEngine, memory.settings, Math.random));
  }

  /** Remembers a bar change and, with a card shown, draws a new card for it. */
  function change(patch: Partial<CodingSettings>): void {
    if (waitingForChild) {
      return;
    }
    const next = memory.remember(patch);
    setSheet(applySettings(sheet, codingEngine, next, Math.random));
  }

  function handleLevelSelect(id: CodingLevelId): void {
    change({ level: id });
  }

  function handleModeSelect(id: CodingModeId): void {
    change({ mode: id });
  }

  function handleProfileSwitch(next: CodingSettings): void {
    setSheet(applySettings(sheet, codingEngine, next, Math.random));
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
      level={codingLevelById(levelId)}
      levels={CODING_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
      disabled={waitingForChild}
    />
  );
  const modeControl = (
    <CodingModeChoice
      modeId={modeId}
      open={modeOpen}
      onOpenChange={setModeOpen}
      onSelect={handleModeSelect}
      disabled={waitingForChild}
    />
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
        view.failure === null ? undefined : failureReason(view.failure, { levelLabel: codingLevelById(levelId).label })
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
        </>
      }
      sheet={
        view.verified !== null ? (
          <CodingSheet
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
