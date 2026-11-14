import { useState } from "react";
import { CardPage } from "@/components/CardPage";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { MathCrosswordSheet } from "@/components/MathCrosswordSheet";
import { SettingToggle } from "@/components/SettingToggle";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { MathCrosswordSettings } from "@/lib/card-settings";
import type { MathCrosswordCard } from "@/lib/math-crossword/card";
import { mathCrosswordEngine, mathCrosswordSpec } from "@/lib/math-crossword/engine";
import { MATH_CROSSWORD_LEVELS, mathCrosswordLevelById, type MathCrosswordLevelId } from "@/lib/math-crossword/levels";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";

/**
 * The "Krzyżówka matematyczna" page: Generuj, the card, Drukuj, the character and level buttons, the solution switch and
 * the shared profile corner. The chosen character stands by the instruction and says it. The level comes from
 * `useCardSettings` and every change is remembered at once; a level change with a card shown draws a new card (so does a
 * profile switch that changed it). The solution switch is not a setting: it is tied to the card it was turned on for,
 * so every new card starts with it off, and it is not shown while there is no card. There are no colors on this card.
 */
export default function MathCrosswordGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [solutionFor, setSolutionFor] = useState<string | null>(null);
  const [levelOpen, setLevelOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<MathCrosswordCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("krzyzowka", visit, handleProfileSwitch);
  const levelId = memory.settings.level;
  const view = sheetView(sheet, mathCrosswordSpec.contentKey(memory.settings));
  const cardKey = view.verified?.key ?? null;
  const showSolution = cardKey !== null && solutionFor === cardKey;

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, mathCrosswordEngine, memory.settings, Math.random));
  }

  function handleLevelSelect(id: MathCrosswordLevelId): void {
    if (waitingForChild) {
      return;
    }
    const next = memory.remember({ level: id });
    setSheet(applySettings(sheet, mathCrosswordEngine, next, Math.random));
  }

  function handleProfileSwitch(next: MathCrosswordSettings): void {
    setSheet(applySettings(sheet, mathCrosswordEngine, next, Math.random));
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
      level={mathCrosswordLevelById(levelId)}
      levels={MATH_CROSSWORD_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
      disabled={waitingForChild}
    />
  );
  const solutionControl = (
    <SettingToggle
      label="Pokaż rozwiązanie"
      checked={showSolution}
      onCheckedChange={(next) => {
        setSolutionFor(next ? cardKey : null);
      }}
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
        view.failure === null
          ? undefined
          : failureReason(view.failure, { levelLabel: mathCrosswordLevelById(levelId).label })
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
          {cardKey !== null ? solutionControl : null}
        </>
      }
      sheet={
        view.verified !== null ? (
          <MathCrosswordSheet
            card={view.verified.card}
            cardKey={view.verified.key}
            showSolution={showSolution}
            characterId={bar.character}
            characterSrc={bar.characterSrc}
          />
        ) : null
      }
    />
  );
}
