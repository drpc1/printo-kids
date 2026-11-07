import { useState } from "react";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { CharacterInstruction } from "@/components/SpeechBand";
import { CardPage } from "@/components/CardPage";
import { SettingToggle } from "@/components/SettingToggle";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { SequenceSettings } from "@/lib/card-settings";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";
import { sequenceShapeInk } from "@/lib/sequence/colors";
import { sequenceEngine, sequenceSpec } from "@/lib/sequence/engine";
import type { SequenceCard } from "@/lib/sequence/generate";
import { layoutSequenceSheet } from "@/lib/sequence/layout";
import { SEQUENCE_LEVELS, sequenceLevelById, type SequenceLevelId } from "@/lib/sequence/levels";
import { SEQUENCE_SHEET } from "@/lib/sequence/sheet";
import { sequenceShapeOutline } from "@/lib/sequence/shapes";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

/**
 * The sequence card page: Generuj, the character and level buttons, the colors switch, the card, Drukuj, and the shared
 * profile corner. The chosen character stands by the instruction on the card and says it. The level and colors come
 * from `useCardSettings` (the active profile's, or the device's) and every change is remembered at once; the page never
 * touches the maze's last-used parameters, it only keeps the bar values the profile corner shows. Switching colors
 * redraws the same card; it never generates a new one. The page keeps one `SheetState`: a level change (bar or profile
 * switch) with a card shown draws a new card, a failed draw switches the card off with its reason, and Drukuj on a card
 * that was already printed asks first.
 */
export default function SequenceGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<SequenceCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("sekwencje", visit, handleProfileSwitch);
  const { level: levelId, colors } = memory.settings;
  const view = sheetView(sheet, sequenceSpec.contentKey(memory.settings));

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, sequenceEngine, memory.settings, Math.random));
  }

  function handleLevelSelect(id: SequenceLevelId): void {
    const next = memory.remember({ level: id });
    if (!waitingForChild) {
      setSheet(applySettings(sheet, sequenceEngine, next, Math.random));
    }
  }

  function handleProfileSwitch(next: SequenceSettings): void {
    setSheet(applySettings(sheet, sequenceEngine, next, Math.random));
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
      level={sequenceLevelById(levelId)}
      levels={SEQUENCE_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
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
          : failureReason(view.failure, { levelLabel: sequenceLevelById(levelId).label })
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
            <SequenceSheet
              card={view.verified.card}
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

function SequenceSheet({
  card,
  colors,
  characterId,
  characterSrc,
}: {
  card: SequenceCard;
  colors: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const instructionHeight = instructionBoxHeight(characterSrc !== null, SEQUENCE_SHEET.instructionSize);
  const sheet = layoutSequenceSheet({
    pageWidth: SEQUENCE_SHEET.pageWidth,
    pageHeight: SEQUENCE_SHEET.pageHeight,
    inset: SEQUENCE_SHEET.inset,
    fieldsPerRow: card.fieldsPerRow,
    rowCount: card.rows.length,
    fieldGapRatio: SEQUENCE_SHEET.fieldGapRatio,
    instructionHeight,
    instructionGap: SEQUENCE_SHEET.instructionGap,
  });
  const fieldSize = sheet.fieldSize;
  const shapeSize = fieldSize * SEQUENCE_SHEET.shapeScale;

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Sekwencje"
      data-card-key={card.key}
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={sheet.page.width}
          inset={SEQUENCE_SHEET.inset}
          top={sheet.instruction.y - instructionHeight / 2}
          characterId={characterId}
          characterSrc={characterSrc}
          text={SEQUENCE_SHEET.instructionText}
        />
      ) : (
        <text
          x={sheet.instruction.x}
          y={sheet.instruction.y}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={SEQUENCE_SHEET.instructionSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {SEQUENCE_SHEET.instructionText}
        </text>
      )}
      {card.rows.map((row, rowIndex) =>
        sheet.rows[rowIndex].fields.map((field, fieldIndex) => {
          const empty = row.gaps.includes(fieldIndex);
          const item = row.values[fieldIndex];
          const shape = empty || typeof item === "number" ? null : item;
          const outline =
            shape === null
              ? null
              : sequenceShapeOutline(shape, field.x + fieldSize / 2, field.y + fieldSize / 2, shapeSize);
          const number = !empty && typeof item === "number" ? item : null;
          const shapeInk = shape === null ? null : sequenceShapeInk(shape, colors, card.shapeColors);
          const shapeFill = colors && shapeInk !== null ? shapeInk : "none";
          const shapeStroke = colors && shapeInk !== null ? shapeInk : "var(--foreground)";
          return (
            <g key={`${rowIndex},${fieldIndex}`}>
              <rect
                x={field.x}
                y={field.y}
                width={fieldSize}
                height={fieldSize}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth={empty ? SEQUENCE_SHEET.emptyFieldStroke : SEQUENCE_SHEET.fieldStroke}
                strokeDasharray={empty ? SEQUENCE_SHEET.emptyFieldDash : undefined}
              />
              {empty ? (
                <text
                  x={field.x + fieldSize - SEQUENCE_SHEET.questionInset}
                  y={field.y + SEQUENCE_SHEET.questionInset}
                  fill="var(--foreground)"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontSize={SEQUENCE_SHEET.questionSize}
                  textAnchor="end"
                  dominantBaseline="hanging"
                >
                  ?
                </text>
              ) : null}
              {number !== null ? (
                <text
                  x={field.x + fieldSize / 2}
                  y={field.y + fieldSize / 2}
                  fill="var(--foreground)"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontSize={fieldSize * SEQUENCE_SHEET.numberFontScale}
                  fontWeight={SEQUENCE_SHEET.numberFontWeight}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {number}
                </text>
              ) : null}
              {outline?.kind === "circle" ? (
                <circle
                  cx={outline.cx}
                  cy={outline.cy}
                  r={outline.r}
                  fill={shapeFill}
                  stroke={shapeStroke}
                  strokeWidth={SEQUENCE_SHEET.shapeStroke}
                />
              ) : null}
              {outline?.kind === "polygon" ? (
                <polygon
                  points={outline.points}
                  fill={shapeFill}
                  stroke={shapeStroke}
                  strokeWidth={SEQUENCE_SHEET.shapeStroke}
                  strokeLinejoin="round"
                />
              ) : null}
              {outline?.kind === "path" ? (
                <path
                  d={outline.d}
                  fill={shapeFill}
                  stroke={shapeStroke}
                  strokeWidth={SEQUENCE_SHEET.shapeStroke}
                  strokeLinejoin="round"
                />
              ) : null}
            </g>
          );
        }),
      )}
    </svg>
  );
}
