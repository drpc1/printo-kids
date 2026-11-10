import { useState } from "react";
import { CardPage } from "@/components/CardPage";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { PatternLinesSheet } from "@/components/PatternLinesSheet";
import { SettingToggle } from "@/components/SettingToggle";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { PatternLinesSettings } from "@/lib/card-settings";
import type { PatternLinesCard } from "@/lib/pattern-lines/card";
import { patternLinesEngine, patternLinesSpec } from "@/lib/pattern-lines/engine";
import {
  PATTERN_LINES_LEVELS,
  patternLinesHasGuides,
  patternLinesLevelById,
  type PatternLinesLevelId,
} from "@/lib/pattern-lines/levels";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";

/**
 * The "Szlaczki" page: Generuj, the card, Drukuj, the character and level buttons, the "Linie" switch on the levels that
 * have help lines, and the shared profile corner. The chosen character stands by the instruction and says it. The level
 * and "Linie" come from `useCardSettings` and every change is remembered at once; a level change with a card shown
 * draws a new card (so does a profile switch that changed it), while "Linie" only redraws the help lines of the same
 * card. There are no colors and no solution on this card.
 */
export default function PatternLinesGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<PatternLinesCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("szlaczki", visit, handleProfileSwitch);
  const { level: levelId, lines } = memory.settings;
  const view = sheetView(sheet, patternLinesSpec.contentKey(memory.settings));

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, patternLinesEngine, memory.settings, Math.random));
  }

  function handleLevelSelect(id: PatternLinesLevelId): void {
    const next = memory.remember({ level: id });
    if (!waitingForChild) {
      setSheet(applySettings(sheet, patternLinesEngine, next, Math.random));
    }
  }

  function handleProfileSwitch(next: PatternLinesSettings): void {
    setSheet(applySettings(sheet, patternLinesEngine, next, Math.random));
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
      level={patternLinesLevelById(levelId)}
      levels={PATTERN_LINES_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
      disabled={waitingForChild}
    />
  );
  const linesControl = patternLinesHasGuides(levelId) ? (
    <SettingToggle
      label="Linie"
      checked={lines}
      onCheckedChange={(next) => {
        memory.remember({ lines: next });
      }}
    />
  ) : null;

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
        view.failure === null
          ? undefined
          : failureReason(view.failure, { levelLabel: patternLinesLevelById(levelId).label })
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
          {linesControl}
        </>
      }
      sheet={
        view.verified !== null ? (
          <PatternLinesSheet
            card={view.verified.card}
            lines={lines}
            characterId={bar.character}
            characterSrc={bar.characterSrc}
          />
        ) : null
      }
    />
  );
}
