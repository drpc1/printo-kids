import { useState } from "react";
import { CardPage } from "@/components/CardPage";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { ShadowsSheet } from "@/components/ShadowsSheet";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { ShadowsSettings } from "@/lib/card-settings";
import type { ShadowsCard } from "@/lib/shadows/card";
import { shadowsEngine, shadowsSpec } from "@/lib/shadows/engine";
import { SHADOWS_LEVELS, shadowsLevelById, type ShadowsLevelId } from "@/lib/shadows/levels";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";

/**
 * The "Cienie" card page: Generuj, the character and level controls, the card, Drukuj, and the shared profile corner.
 * The chosen character stands by the instruction on the card and says it. The level is the only setting: it comes
 * from `useCardSettings`, every change is remembered at once, and a level change with a card shown lays out a new card
 * (so does a profile switch that changed it). A failed draw switches the card off with its reason, and Drukuj on a card
 * that was already printed asks first. The card has no colors switch (the pictures are always in color), no category
 * and no "Pokaż rozwiązanie".
 */
export default function ShadowsGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<ShadowsCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("cienie", visit, handleProfileSwitch);
  const levelId = memory.settings.level;
  const view = sheetView(sheet, shadowsSpec.contentKey(memory.settings));

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, shadowsEngine, memory.settings, Math.random));
  }

  function handleLevelSelect(id: ShadowsLevelId): void {
    if (waitingForChild) {
      return;
    }
    const next = memory.remember({ level: id });
    setSheet(applySettings(sheet, shadowsEngine, next, Math.random));
  }

  function handleProfileSwitch(next: ShadowsSettings): void {
    setSheet(applySettings(sheet, shadowsEngine, next, Math.random));
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
      level={shadowsLevelById(levelId)}
      levels={SHADOWS_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
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
        view.failure === null ? undefined : failureReason(view.failure, { levelLabel: shadowsLevelById(levelId).label })
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
        </>
      }
      sheet={
        view.verified !== null ? (
          <ShadowsSheet
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
