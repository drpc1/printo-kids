import { useState } from "react";
import { CardPage } from "@/components/CardPage";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { SettingToggle } from "@/components/SettingToggle";
import { SizeOrderSheet } from "@/components/SizeOrderSheet";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { SizeOrderSettings } from "@/lib/card-settings";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";
import type { SizeOrderCard } from "@/lib/size-order/card";
import { sizeOrderEngine, sizeOrderSpec } from "@/lib/size-order/engine";
import { SIZE_ORDER_LEVELS, sizeOrderLevelById, type SizeOrderLevelId } from "@/lib/size-order/levels";

/**
 * The "Od najmniejszego" card page: Generuj, the character, level and Kolory controls, the card, Drukuj, and the shared
 * profile corner. The chosen character stands by the instruction on the card and says it. Only the level lays out a
 * new card; the colors (one crayon per row) keep the card shown, so the toggle only remembers the choice. A failed
 * draw switches the card off with its reason, and Drukuj on a card that was already printed asks first. The card has
 * no answer on it and no "Pokaż rozwiązanie": the child numbers the pictures from the smallest.
 */
export default function SizeOrderGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<SizeOrderCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("odnajmniejszego", visit, handleProfileSwitch);
  const { level: levelId, colors } = memory.settings;
  const view = sheetView(sheet, sizeOrderSpec.contentKey(memory.settings));

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, sizeOrderEngine, memory.settings, Math.random));
  }

  function handleLevelSelect(id: SizeOrderLevelId): void {
    const next = memory.remember({ level: id });
    if (!waitingForChild) {
      setSheet(applySettings(sheet, sizeOrderEngine, next, Math.random));
    }
  }

  function handleColorsChange(value: boolean): void {
    // The content key has no colors, so `applySettings` would keep the card anyway; remembering is all there is to do.
    memory.remember({ colors: value });
  }

  function handleProfileSwitch(next: SizeOrderSettings): void {
    setSheet(applySettings(sheet, sizeOrderEngine, next, Math.random));
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
      level={sizeOrderLevelById(levelId)}
      levels={SIZE_ORDER_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
      disabled={waitingForChild}
    />
  );
  const colorsControl = <SettingToggle label="Kolory" checked={colors} onCheckedChange={handleColorsChange} />;

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
          : failureReason(view.failure, { levelLabel: sizeOrderLevelById(levelId).label })
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
          {colorsControl}
        </>
      }
      sheet={
        <>
          {view.verified !== null ? (
            <SizeOrderSheet
              card={view.verified.card}
              cardKey={view.verified.key}
              colors={colors}
              characterId={bar.character}
              characterSrc={bar.characterSrc}
            />
          ) : null}
        </>
      }
    />
  );
}
