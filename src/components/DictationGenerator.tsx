import { useState } from "react";
import { CategoryChoice } from "@/components/CategoryChoice";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { Switch } from "@/components/ui/switch";
import { CharacterInstruction } from "@/components/SpeechBand";
import { CardPage } from "@/components/CardPage";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { DictationSettings } from "@/lib/card-settings";
import { generateDictationCard, type DictationCard } from "@/lib/dictation/generate";
import { dictationCellSize, layoutDictationSheet } from "@/lib/dictation/layout";
import { DICTATION_LEVELS, dictationLevelById, type DictationLevelId } from "@/lib/dictation/levels";
import { walkCommands } from "@/lib/dictation/outline";
import { DICTATION_SHEET, formatDictationCommand } from "@/lib/dictation/sheet";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

/**
 * The graphic dictation page: Generuj, the level and category buttons, the card, Drukuj, and the shared profile corner.
 * It has no colors; the chosen character stands by the instruction on the card and says it. The level and the category come from `useCardSettings` (the active
 * profile's, or the device's) and every change is remembered at once, the solution switch is not. The page never
 * touches the maze's last-used parameters; it only keeps the bar values the profile corner shows. A profile switch
 * with a card shown draws a new card when the level or the category changed.
 */
export default function DictationGenerator() {
  const { visit, bar, favorite, barLevel } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [card, setCard] = useState<DictationCard | null>(null);
  const [generateFailed, setGenerateFailed] = useState(false);
  const memory = useCardSettings("dyktando", visit, handleProfileSwitch);
  const { level: levelId, category: categoryId } = memory.settings;
  const sheetShown = card !== null;

  function generateFor(settings: DictationSettings): void {
    const next = generateDictationCard(
      Math.random,
      card?.key ?? null,
      dictationLevelById(settings.level),
      settings.category,
    );
    if (next === null) {
      setGenerateFailed(true);
      return;
    }
    setGenerateFailed(false);
    setShowSolution(false);
    setCard(next);
  }

  function handleGenerate(): void {
    generateFor(memory.settings);
  }

  function handleLevelSelect(id: DictationLevelId): void {
    const next = memory.remember({ level: id });
    if (card !== null && !waitingForChild) {
      generateFor(next);
    }
  }

  function handleProfileSwitch(next: DictationSettings, previous: DictationSettings): void {
    if (card !== null && (next.level !== previous.level || next.category !== previous.category)) {
      generateFor(next);
    }
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
      level={dictationLevelById(levelId)}
      levels={DICTATION_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
      disabled={waitingForChild}
    />
  );
  const categoryControl = (
    <CategoryChoice
      categoryId={categoryId}
      open={categoryOpen}
      onOpenChange={setCategoryOpen}
      onSelect={(category) => {
        memory.remember({ category });
      }}
      disabled={waitingForChild}
    />
  );
  const solutionControl = (
    <label className={cn("text-muted-foreground flex items-center gap-2 text-base max-sm:basis-full max-sm:px-3")}>
      <Switch checked={showSolution} onCheckedChange={setShowSolution} />
      Pokaż rozwiązanie
    </label>
  );
  return (
    <CardPage
      profiles={profiles}
      activeId={activeId}
      ask={ask}
      waitingForChild={waitingForChild}
      barCharacter={bar.character}
      barLevel={barLevel}
      corner={memory.corner}
      newProfileCards={memory.newProfileCards}
      note={memory.note ?? favorite.note}
      sheetShown={sheetShown}
      generateFailed={generateFailed}
      onGenerate={handleGenerate}
      controls={
        <>
          {characterControl}
          {levelControl}
          {categoryControl}
          {sheetShown ? solutionControl : null}
        </>
      }
      sheet={
        <>
          {card !== null ? (
            <DictationSheet
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

/** The printed card. It draws the commands, the grid, and the start dot. The outline stroke is only on screen. */
function DictationSheet({
  card,
  showSolution,
  characterId,
  characterSrc,
}: {
  card: DictationCard;
  showSolution: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const level = dictationLevelById(card.levelId);
  const withBand = characterSrc !== null;
  const instructionHeight = instructionBoxHeight(withBand, DICTATION_SHEET.instructionSize);
  // With a character the grid shrinks only as far as the commands of this card need; without one it keeps the level size.
  const cellSize = dictationCellSize(
    {
      pageHeight: DICTATION_SHEET.pageHeight,
      inset: DICTATION_SHEET.inset,
      nominal: card.cellSize,
      rows: card.rows,
      commandCount: card.commands.length,
      commandsPerRow: level.commandsPerRow,
      commandRowHeight: level.commandRowHeight,
      instructionGap: DICTATION_SHEET.instructionGap,
      listGap: DICTATION_SHEET.listGap,
    },
    withBand,
  );
  const sheet = layoutDictationSheet({
    pageWidth: DICTATION_SHEET.pageWidth,
    pageHeight: DICTATION_SHEET.pageHeight,
    inset: DICTATION_SHEET.inset,
    columns: card.columns,
    rows: card.rows,
    cellSize,
    commandCount: card.commands.length,
    commandsPerRow: level.commandsPerRow,
    commandRowHeight: level.commandRowHeight,
    instructionSize: instructionHeight,
    instructionGap: DICTATION_SHEET.instructionGap,
    listGap: DICTATION_SHEET.listGap,
  });
  const grid = sheet.grid;
  const columnLines = Array.from({ length: card.columns - 1 }, (_, index) => grid.x + (index + 1) * cellSize);
  const rowLines = Array.from({ length: card.rows - 1 }, (_, index) => grid.y + (index + 1) * cellSize);
  const inset = DICTATION_SHEET.commandBoxInset;
  const solutionPoints = walkCommands({ x: card.start.col, y: card.start.row }, card.commands)
    .map((vertex) => `${grid.x + vertex.x * cellSize},${grid.y + vertex.y * cellSize}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Dyktando graficzne"
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={sheet.page.width}
          inset={DICTATION_SHEET.inset}
          top={sheet.instruction.y - instructionHeight / 2}
          characterId={characterId}
          characterSrc={characterSrc}
          text={DICTATION_SHEET.instructionText}
        />
      ) : (
        <text
          x={sheet.instruction.x}
          y={sheet.instruction.y}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={DICTATION_SHEET.instructionSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {DICTATION_SHEET.instructionText}
        </text>
      )}
      {card.commands.map((command, index) => {
        const box = sheet.commands[index];
        return (
          <g key={index}>
            <rect
              x={box.x + inset}
              y={box.y + inset}
              width={box.width - inset * 2}
              height={box.height - inset * 2}
              rx={DICTATION_SHEET.commandBoxRadius}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={DICTATION_SHEET.commandBoxStroke}
            />
            <text
              x={box.x + DICTATION_SHEET.commandNumberOffsetX}
              y={box.y + DICTATION_SHEET.commandNumberOffsetY}
              fill="var(--muted-foreground)"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontSize={DICTATION_SHEET.commandNumberSize}
            >
              {index + 1}
            </text>
            <text
              x={box.x + box.width / 2}
              y={box.y + box.height / 2 + DICTATION_SHEET.commandNumberSize / 2}
              fill="var(--foreground)"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontSize={level.commandFontSize}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {formatDictationCommand(command)}
            </text>
          </g>
        );
      })}
      <g fill="none" stroke="var(--foreground)" strokeWidth={DICTATION_SHEET.gridStroke}>
        {columnLines.map((x) => (
          <line key={`c${x}`} x1={x} y1={grid.y} x2={x} y2={grid.y + grid.height} />
        ))}
        {rowLines.map((y) => (
          <line key={`r${y}`} x1={grid.x} y1={y} x2={grid.x + grid.width} y2={y} />
        ))}
      </g>
      <rect
        x={grid.x}
        y={grid.y}
        width={grid.width}
        height={grid.height}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={DICTATION_SHEET.frameStroke}
        strokeLinejoin="miter"
      />
      {showSolution ? (
        <g
          className={cn("print:hidden")}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={DICTATION_SHEET.solutionStroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          data-solution
        >
          <polyline points={solutionPoints} />
        </g>
      ) : null}
      <circle
        cx={grid.x + card.start.col * cellSize}
        cy={grid.y + card.start.row * cellSize}
        r={DICTATION_SHEET.startDotRadius}
        fill="var(--foreground)"
      />
    </svg>
  );
}
