import { useState } from "react";
import { CardPage } from "@/components/CardPage";
import { CategoryChoice } from "@/components/CategoryChoice";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { CopyDrawingSheet } from "@/components/CopyDrawingSheet";
import { SettingToggle } from "@/components/SettingToggle";
import { SudokuChoice } from "@/components/SudokuChoice";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { CopyDrawingSettings } from "@/lib/card-settings";
import type { CopyDrawingCard } from "@/lib/copy-drawing/card";
import { copyDrawingEngine, copyDrawingSpec } from "@/lib/copy-drawing/engine";
import { COPY_DRAWING_LEVELS, copyDrawingLevelById } from "@/lib/copy-drawing/levels";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";
import { OBJECT_CATEGORY_CHOICES } from "@/lib/symmetry/templates";

/**
 * The "Skopiuj obrazek" page: Generuj, the card, Drukuj, the character, level and category choices, and the
 * shared profile corner. It has no colors and no solution switch: the left grid is the picture and prints, the right
 * grid is empty. The chosen character stands by the instruction on the card and says it. The level and the category come
 * from `useCardSettings` and every change is remembered at once; changing either with a card shown draws a new card, and
 * so does a profile switch that changed them. The page never shows the name of the object.
 */
export default function CopyDrawingGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<CopyDrawingCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("kopiuj", visit, handleProfileSwitch);
  const { level: levelId, category: categoryId, colors } = memory.settings;
  const view = sheetView(sheet, copyDrawingSpec.contentKey(memory.settings));

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, copyDrawingEngine, memory.settings, Math.random));
  }

  function handleSettingChange(change: Partial<CopyDrawingSettings>): void {
    if (waitingForChild) {
      return;
    }
    const next = memory.remember(change);
    setSheet(applySettings(sheet, copyDrawingEngine, next, Math.random));
  }

  function handleProfileSwitch(next: CopyDrawingSettings): void {
    setSheet(applySettings(sheet, copyDrawingEngine, next, Math.random));
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
    <SudokuChoice
      label="Poziom"
      dialogTitle="Poziom karty „Skopiuj obrazek”"
      options={COPY_DRAWING_LEVELS}
      value={levelId}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={(level) => {
        handleSettingChange({ level });
      }}
      disabled={waitingForChild}
    />
  );
  const categoryControl = (
    <CategoryChoice
      categoryId={categoryId}
      open={categoryOpen}
      onOpenChange={setCategoryOpen}
      onSelect={(category) => {
        handleSettingChange({ category });
      }}
      disabled={waitingForChild}
    />
  );

  const colorsControl = (
    <SettingToggle
      label="Kolory"
      checked={colors}
      onCheckedChange={(next) => {
        memory.remember({ colors: next });
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
          : failureReason(view.failure, {
              levelLabel: copyDrawingLevelById(levelId).label,
              categoryLabel: OBJECT_CATEGORY_CHOICES.find((choice) => choice.id === categoryId)?.label,
            })
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
          {categoryControl}
          {colorsControl}
        </>
      }
      sheet={
        view.verified !== null ? (
          <CopyDrawingSheet
            card={view.verified.card}
            colors={colors}
            characterId={bar.character}
            characterSrc={bar.characterSrc}
          />
        ) : null
      }
    />
  );
}
