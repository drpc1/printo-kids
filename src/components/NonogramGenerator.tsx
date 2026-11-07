import { useState } from "react";
import { CategoryChoice } from "@/components/CategoryChoice";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { NonogramSimpleSheet } from "@/components/NonogramSimpleSheet";
import { SudokuChoice } from "@/components/SudokuChoice";
import { CharacterInstruction } from "@/components/SpeechBand";
import { CardPage } from "@/components/CardPage";
import { SettingToggle } from "@/components/SettingToggle";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { NonogramSettings } from "@/lib/card-settings";
import { nonogramEngine, nonogramSpec } from "@/lib/nonogram/engine";
import type { NonogramCard } from "@/lib/nonogram/generate";
import { blockLines, layoutNonogramSheet, longestClues } from "@/lib/nonogram/layout";
import { NONOGRAM_SHEET } from "@/lib/nonogram/sheet";
import { NONOGRAM_SIZES, nonogramSizeById } from "@/lib/nonogram/sizes";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";
import type { SimpleNonogramCard } from "@/lib/nonogram/simple";
import { OBJECT_CATEGORY_CHOICES } from "@/lib/symmetry/templates";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

/**
 * The nonogram page: Generuj, the card, Drukuj, the level and category choices, the solution switch, and the shared
 * profile corner. It has no colors; the chosen character stands by the instruction on the card and says it. The level
 * and the category come from `useCardSettings` (the active profile's, or the device's) and every change is remembered at
 * once, the solution switch is not. The card is a `SheetState`: changing the level or the category with a card shown
 * draws a new card for the new bar, and so does a profile switch that changed them. The solution switch is tied to the
 * card it was turned on for, so every new card (Generuj, level, category, "Nowa karta") starts with it off; switching
 * it on redraws the same card, and the page never shows the name of the hidden object.
 */
export default function NonogramGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [solutionFor, setSolutionFor] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<NonogramCard | SimpleNonogramCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("nonogram", visit, handleProfileSwitch);
  const { level: sizeId, category: categoryId } = memory.settings;
  const view = sheetView(sheet, nonogramSpec.contentKey(memory.settings));
  const card = view.verified?.card ?? null;
  // A new card starts the way the child sees it; the parent turns the solution on again to check it.
  const showSolution = card !== null && solutionFor === card.key;

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, nonogramEngine, memory.settings, Math.random));
  }

  function handleSettingChange(change: Partial<NonogramSettings>): void {
    if (waitingForChild) {
      return;
    }
    const next = memory.remember(change);
    setSheet(applySettings(sheet, nonogramEngine, next, Math.random));
  }

  function handleProfileSwitch(next: NonogramSettings): void {
    setSheet(applySettings(sheet, nonogramEngine, next, Math.random));
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
  const sizeControl = (
    <SudokuChoice
      label="Poziom"
      dialogTitle="Poziom nonogramu"
      options={NONOGRAM_SIZES}
      value={sizeId}
      open={sizeOpen}
      onOpenChange={setSizeOpen}
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
  const solutionControl = (
    <SettingToggle
      label="Pokaż rozwiązanie"
      checked={showSolution}
      onCheckedChange={(next) => {
        setSolutionFor(next && card !== null ? card.key : null);
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
              levelLabel: nonogramSizeById(sizeId).label,
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
          {sizeControl}
          {categoryControl}
          {card !== null ? solutionControl : null}
        </>
      }
      sheet={
        <>
          {card?.kind === "liczby" ? (
            <NonogramSheet
              card={card}
              showSolution={showSolution}
              characterId={bar.character}
              characterSrc={bar.characterSrc}
            />
          ) : null}
          {card?.kind === "znaczki" ? (
            <NonogramSimpleSheet
              card={card}
              showSolution={showSolution}
              characterId={bar.character}
              characterSrc={bar.characterSrc}
            />
          ) : null}
        </>
      }
    />
  );
}

function NonogramSheet({
  card,
  showSolution,
  characterId,
  characterSrc,
}: {
  card: NonogramCard;
  showSolution: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const instructionHeight = instructionBoxHeight(characterSrc !== null, NONOGRAM_SHEET.instructionSize);
  const size = nonogramSizeById(card.sizeId);
  const sheet = layoutNonogramSheet({
    pageWidth: NONOGRAM_SHEET.pageWidth,
    pageHeight: NONOGRAM_SHEET.pageHeight,
    inset: NONOGRAM_SHEET.inset,
    columns: card.columns,
    rows: card.rows,
    cellSize: card.cellSize,
    digitSize: size.digitSize,
    ...longestClues(card.clues),
    instructionSize: instructionHeight,
    instructionGap: NONOGRAM_SHEET.instructionGap,
    clueGap: NONOGRAM_SHEET.clueGap,
    clueSlot: NONOGRAM_SHEET.clueSlot,
  });
  const grid = sheet.grid;
  const cellSize = card.cellSize;
  const thickColumns = new Set(blockLines(card.columns, NONOGRAM_SHEET.blockEvery));
  const thickRows = new Set(blockLines(card.rows, NONOGRAM_SHEET.blockEvery));
  const columnLines = Array.from({ length: card.columns + 1 }, (_, index) => index);
  const rowLines = Array.from({ length: card.rows + 1 }, (_, index) => index);

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Nonogram"
      data-card-key={card.key}
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={sheet.page.width}
          inset={NONOGRAM_SHEET.inset}
          top={sheet.instruction.y - instructionHeight / 2}
          characterId={characterId}
          characterSrc={characterSrc}
          text={NONOGRAM_SHEET.instructionText}
        />
      ) : (
        <text
          x={sheet.instruction.x}
          y={sheet.instruction.y}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={NONOGRAM_SHEET.instructionSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {NONOGRAM_SHEET.instructionText}
        </text>
      )}
      {showSolution ? (
        <g className={cn("print:hidden")} fill="var(--foreground)" data-solution>
          {card.solution.flatMap((row, rowIndex) =>
            row.map((filled, columnIndex) =>
              filled ? (
                <rect
                  key={`${columnIndex},${rowIndex}`}
                  x={grid.x + columnIndex * cellSize}
                  y={grid.y + rowIndex * cellSize}
                  width={cellSize}
                  height={cellSize}
                />
              ) : null,
            ),
          )}
        </g>
      ) : null}
      <g fill="none" stroke="var(--foreground)">
        {columnLines.map((index) => (
          <line
            key={`c${index}`}
            x1={grid.x + index * cellSize}
            y1={grid.y}
            x2={grid.x + index * cellSize}
            y2={grid.y + grid.height}
            strokeWidth={thickColumns.has(index) ? NONOGRAM_SHEET.blockStroke : NONOGRAM_SHEET.gridStroke}
          />
        ))}
        {rowLines.map((index) => (
          <line
            key={`r${index}`}
            x1={grid.x}
            y1={grid.y + index * cellSize}
            x2={grid.x + grid.width}
            y2={grid.y + index * cellSize}
            strokeWidth={thickRows.has(index) ? NONOGRAM_SHEET.blockStroke : NONOGRAM_SHEET.gridStroke}
          />
        ))}
      </g>
      <rect
        x={grid.x}
        y={grid.y}
        width={grid.width}
        height={grid.height}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={NONOGRAM_SHEET.frameStroke}
        strokeLinejoin="miter"
      />
      <g
        fill="var(--foreground)"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={size.digitSize}
        fontWeight={NONOGRAM_SHEET.clueFontWeight}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {card.clues.rows.flatMap((clue, rowIndex) =>
          clue.map((value, position) => (
            <text
              key={`rc${rowIndex},${position}`}
              x={sheet.rowClueX(clue.length - 1 - position)}
              y={grid.y + (rowIndex + 0.5) * cellSize}
            >
              {value}
            </text>
          )),
        )}
        {card.clues.columns.flatMap((clue, columnIndex) =>
          clue.map((value, position) => (
            <text
              key={`cc${columnIndex},${position}`}
              x={grid.x + (columnIndex + 0.5) * cellSize}
              y={sheet.columnClueY(clue.length - 1 - position)}
            >
              {value}
            </text>
          )),
        )}
      </g>
    </svg>
  );
}
