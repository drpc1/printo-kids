import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { CategoryChoice } from "@/components/CategoryChoice";
import { ACTION_BUTTON_CLASS, GenerateButton } from "@/components/GenerateButton";
import { Button } from "@/components/ui/button";
import { LevelChoice } from "@/components/LevelChoice";
import { ProfileCorner } from "@/components/ProfileCorner";
import { Switch } from "@/components/ui/switch";
import { RememberedNote } from "@/components/RememberedNote";
import { useCardSettings } from "@/hooks/useCardSettings";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import type { DictationSettings } from "@/lib/card-settings";
import { generateDictationCard, type DictationCard } from "@/lib/dictation/generate";
import { layoutDictationSheet } from "@/lib/dictation/layout";
import { DICTATION_LEVELS, dictationLevelById, type DictationLevelId } from "@/lib/dictation/levels";
import { walkCommands } from "@/lib/dictation/outline";
import { DICTATION_SHEET, formatDictationCommand } from "@/lib/dictation/sheet";
import { cn } from "@/lib/utils";

const GENERATE_FAILED_TEXT = "Nie udało się ułożyć karty.";

/**
 * The graphic dictation page: Generuj, the level and category buttons, the card, Drukuj, and the shared profile corner.
 * It has no colors or character controls. The level and the category come from `useCardSettings` (the active
 * profile's, or the device's) and every change is remembered at once, the solution switch is not. The page never
 * touches the maze's last-used parameters; it only keeps the bar values the profile corner shows. A profile switch
 * with a card shown draws a new card when the level or the category changed.
 */
export default function DictationGenerator() {
  const visit = useChildProfileVisit({ onApply: applyProfileBar });
  const { profiles, activeId, ask, waitingForChild, visitStart } = visit;
  const [barCharacter, setBarCharacter] = useState(visitStart.character);
  const [barLevel, setBarLevel] = useState(visitStart.level);
  const [levelOpen, setLevelOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [card, setCard] = useState<DictationCard | null>(null);
  const [generateFailed, setGenerateFailed] = useState(false);
  const memory = useCardSettings("dyktando", visit, handleProfileSwitch);
  const { level: levelId, category: categoryId } = memory.settings;
  const sheetShown = card !== null;

  useEffect(() => {
    const main = document.getElementById("worksheet-home");
    if (main === null) {
      return;
    }
    main.classList.toggle("has-sheet", sheetShown);
    main.classList.toggle("justify-start", sheetShown);
    main.classList.toggle("justify-center", !sheetShown);
  }, [sheetShown]);

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
    if (waitingForChild) {
      return;
    }
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

  function handlePrint(): void {
    window.print();
  }

  function applyProfileBar(bar: ProfileBar): void {
    setBarCharacter(bar.character);
    setBarLevel(bar.level);
  }

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
    <label className={cn("text-muted-foreground flex items-center gap-2 text-base")}>
      <Switch checked={showSolution} onCheckedChange={setShowSolution} />
      Pokaż rozwiązanie
    </label>
  );
  const failedNote = generateFailed ? (
    <p role="alert" className={cn("text-destructive text-sm")}>
      {GENERATE_FAILED_TEXT}
    </p>
  ) : null;

  return (
    <div className={cn("flex w-full flex-col items-center gap-4")}>
      <ProfileCorner
        profiles={profiles}
        activeId={activeId}
        barCharacter={barCharacter}
        barLevel={barLevel}
        ask={ask}
        onCreated={memory.corner.onCreated}
        onChoose={memory.corner.onChoose}
        onFavoriteSaved={memory.corner.onFavoriteSaved}
        onDeleted={memory.corner.onDeleted}
        onClearProfile={memory.corner.onClearProfile}
        newProfileCards={memory.newProfileCards}
      />
      {sheetShown ? (
        <div className={cn("flex w-full flex-col gap-3 print:hidden")}>
          <div className={cn("flex w-full min-w-0 flex-wrap items-center gap-3")}>
            {levelControl}
            {categoryControl}
            {solutionControl}
            {failedNote}
          </div>
          <RememberedNote note={memory.note} profileActive={activeId !== null} />
          <div className={cn("flex w-full items-center gap-3 sm:gap-4")}>
            <GenerateButton
              onClick={handleGenerate}
              tone="quiet"
              disabled={waitingForChild}
              className="flex-1 sm:flex-none"
            />
            <Button
              type="button"
              variant="default"
              onClick={handlePrint}
              className={cn(ACTION_BUTTON_CLASS, "flex-1 sm:ml-auto sm:flex-none")}
            >
              <Printer aria-hidden />
              Drukuj
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn("flex flex-col items-center gap-6 print:hidden")}>
          <div className={cn("flex flex-wrap items-center justify-center gap-3")}>
            {levelControl}
            {categoryControl}
          </div>
          <RememberedNote note={memory.note} profileActive={activeId !== null} />
          <GenerateButton onClick={handleGenerate} tone="hero" disabled={waitingForChild} />
          {failedNote}
        </div>
      )}
      {card !== null ? <DictationSheet card={card} showSolution={showSolution} /> : null}
    </div>
  );
}

/** The printed card. It draws the commands, the grid, and the start dot. The outline stroke is only on screen. */
function DictationSheet({ card, showSolution }: { card: DictationCard; showSolution: boolean }) {
  const level = dictationLevelById(card.levelId);
  const sheet = layoutDictationSheet({
    pageWidth: DICTATION_SHEET.pageWidth,
    pageHeight: DICTATION_SHEET.pageHeight,
    inset: DICTATION_SHEET.inset,
    columns: card.columns,
    rows: card.rows,
    cellSize: card.cellSize,
    commandCount: card.commands.length,
    commandsPerRow: level.commandsPerRow,
    commandRowHeight: level.commandRowHeight,
    instructionSize: DICTATION_SHEET.instructionSize,
    instructionGap: DICTATION_SHEET.instructionGap,
    listGap: DICTATION_SHEET.listGap,
  });
  const grid = sheet.grid;
  const columnLines = Array.from({ length: card.columns - 1 }, (_, index) => grid.x + (index + 1) * card.cellSize);
  const rowLines = Array.from({ length: card.rows - 1 }, (_, index) => grid.y + (index + 1) * card.cellSize);
  const inset = DICTATION_SHEET.commandBoxInset;
  const solutionPoints = walkCommands({ x: card.start.col, y: card.start.row }, card.commands)
    .map((vertex) => `${grid.x + vertex.x * card.cellSize},${grid.y + vertex.y * card.cellSize}`)
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
        cx={grid.x + card.start.col * card.cellSize}
        cy={grid.y + card.start.row * card.cellSize}
        r={DICTATION_SHEET.startDotRadius}
        fill="var(--foreground)"
      />
    </svg>
  );
}
