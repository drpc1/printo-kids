import { useState } from "react";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { OddOneOutPicture } from "@/components/OddOneOutPicture";
import { SettingToggle } from "@/components/SettingToggle";
import { CharacterInstruction } from "@/components/SpeechBand";
import { CardPage } from "@/components/CardPage";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { OddOneOutSettings } from "@/lib/card-settings";
import { oddOneOutEngine, oddOneOutSpec } from "@/lib/odd-one-out/engine";
import { layoutOddOneOutSheet } from "@/lib/odd-one-out/layout";
import { ODD_ONE_OUT_LEVELS, oddOneOutLevelById, type OddOneOutLevelId } from "@/lib/odd-one-out/levels";
import type { OddOneOutCard } from "@/lib/odd-one-out/rules";
import { ODD_ONE_OUT_SHEET } from "@/lib/odd-one-out/sheet";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";
import { cn } from "@/lib/utils";

const INSTRUCTION_TEXT = ODD_ONE_OUT_SHEET.instructionLines.join(" ");

/**
 * The "Który nie pasuje" card page: Generuj, the character, level and Kolory controls, the card, Drukuj, and the shared
 * profile corner. The chosen character stands by the instruction on the card and says it. Level and colors both
 * belong to the task (the color rule needs colors), so a change of either with a card shown draws a new card; a
 * failed draw switches the card off with its reason, and Drukuj on a card that was already printed asks first. The
 * card has no answer on it: the child circles the picture that does not fit.
 */
export default function OddOneOutGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<OddOneOutCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("niepasuje", visit, handleProfileSwitch);
  const { level: levelId, colors } = memory.settings;
  const view = sheetView(sheet, oddOneOutSpec.contentKey(memory.settings));

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, oddOneOutEngine, memory.settings, Math.random));
  }

  function handleLevelSelect(id: OddOneOutLevelId): void {
    const next = memory.remember({ level: id });
    if (!waitingForChild) {
      setSheet(applySettings(sheet, oddOneOutEngine, next, Math.random));
    }
  }

  function handleColorsChange(value: boolean): void {
    const next = memory.remember({ colors: value });
    if (!waitingForChild) {
      setSheet(applySettings(sheet, oddOneOutEngine, next, Math.random));
    }
  }

  function handleProfileSwitch(next: OddOneOutSettings): void {
    setSheet(applySettings(sheet, oddOneOutEngine, next, Math.random));
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
      level={oddOneOutLevelById(levelId)}
      levels={ODD_ONE_OUT_LEVELS}
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
          : failureReason(view.failure, { levelLabel: oddOneOutLevelById(levelId).label })
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
            <OddOneOutSheet card={view.verified.card} characterId={bar.character} characterSrc={bar.characterSrc} />
          ) : null}
        </>
      }
    />
  );
}

function OddOneOutSheet({
  card,
  characterId,
  characterSrc,
}: {
  card: OddOneOutCard;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = layoutOddOneOutSheet({
    pageWidth: ODD_ONE_OUT_SHEET.pageWidth,
    pageHeight: ODD_ONE_OUT_SHEET.pageHeight,
    inset: ODD_ONE_OUT_SHEET.inset,
    rowCount: card.rows.length,
    itemCount: card.rows[0].items.length,
    bandHeight: ODD_ONE_OUT_SHEET.bandHeight,
    bandGap: ODD_ONE_OUT_SHEET.bandGap,
    rowGap: ODD_ONE_OUT_SHEET.rowGap,
    slotPadding: ODD_ONE_OUT_SHEET.slotPadding,
  });
  const smallScale = oddOneOutLevelById(card.levelId).smallRatio;

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Który nie pasuje"
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={sheet.page.width}
          inset={ODD_ONE_OUT_SHEET.inset}
          top={sheet.band.y}
          characterId={characterId}
          characterSrc={characterSrc}
          text={INSTRUCTION_TEXT}
        />
      ) : (
        <text
          x={sheet.page.width / 2}
          y={sheet.band.y + sheet.band.height / 2}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={ODD_ONE_OUT_SHEET.plainInstructionSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {INSTRUCTION_TEXT}
        </text>
      )}
      {card.rows.map((row, rowIndex) => {
        const rowLayout = sheet.rows[rowIndex];
        return (
          <g key={rowIndex} data-row>
            <rect
              x={rowLayout.x}
              y={rowLayout.y}
              width={rowLayout.width}
              height={rowLayout.height}
              rx={ODD_ONE_OUT_SHEET.rowFrameRadius}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={ODD_ONE_OUT_SHEET.rowFrameStroke}
            />
            {row.items.map((item, itemIndex) => (
              <g key={itemIndex} data-picture>
                <OddOneOutPicture
                  item={item}
                  cx={rowLayout.slots[itemIndex].cx}
                  cy={rowLayout.slots[itemIndex].cy}
                  slot={sheet.slot}
                  scale={item.size === "small" ? smallScale : 1}
                />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
