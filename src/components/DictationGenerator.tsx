import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { CategoryChoice } from "@/components/CategoryChoice";
import { ACTION_BUTTON_CLASS, GenerateButton } from "@/components/GenerateButton";
import { Button } from "@/components/ui/button";
import { LevelChoice } from "@/components/LevelChoice";
import { ProfileCorner } from "@/components/ProfileCorner";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import { generateDictationCard, type DictationCard } from "@/lib/dictation/generate";
import { layoutDictationSheet } from "@/lib/dictation/layout";
import {
  DEFAULT_DICTATION_LEVEL_ID,
  DICTATION_LEVELS,
  dictationLevelById,
  type DictationLevelId,
} from "@/lib/dictation/levels";
import { DICTATION_SHEET, formatDictationCommand } from "@/lib/dictation/sheet";
import { DEFAULT_OBJECT_CATEGORY_ID, type ObjectCategoryChoiceId } from "@/lib/symmetry/templates";
import { cn } from "@/lib/utils";

const GENERATE_FAILED_TEXT = "Nie udało się ułożyć karty.";

/**
 * The graphic dictation page: Generuj, the level button, the card, Drukuj, and the shared profile corner. It has no
 * colors or character controls. The dictation level lives only in this component, and the page never touches the maze's last-used parameters; it only keeps the bar values the profile
 * corner shows.
 */
export default function DictationGenerator() {
  const { profiles, activeId, ask, waitingForChild, visitStart, corner } = useChildProfileVisit({
    onApply: applyProfileBar,
  });
  const [barCharacter, setBarCharacter] = useState(visitStart.character);
  const [barLevel, setBarLevel] = useState(visitStart.level);
  const [levelId, setLevelId] = useState<DictationLevelId>(DEFAULT_DICTATION_LEVEL_ID);
  const [levelOpen, setLevelOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<ObjectCategoryChoiceId>(DEFAULT_OBJECT_CATEGORY_ID);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [card, setCard] = useState<DictationCard | null>(null);
  const [generateFailed, setGenerateFailed] = useState(false);
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

  function generateFor(id: DictationLevelId): void {
    const next = generateDictationCard(Math.random, card?.key ?? null, dictationLevelById(id), categoryId);
    if (next === null) {
      setGenerateFailed(true);
      return;
    }
    setGenerateFailed(false);
    setCard(next);
  }

  function handleGenerate(): void {
    if (waitingForChild) {
      return;
    }
    generateFor(levelId);
  }

  function handleLevelSelect(id: DictationLevelId): void {
    setLevelId(id);
    if (card !== null && !waitingForChild) {
      generateFor(id);
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
      onSelect={setCategoryId}
      disabled={waitingForChild}
    />
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
        onCreated={corner.onCreated}
        onChoose={corner.onChoose}
        onFavoriteSaved={corner.onFavoriteSaved}
        onDeleted={corner.onDeleted}
        onClearProfile={corner.onClearProfile}
      />
      {sheetShown ? (
        <div className={cn("flex w-full flex-col gap-3 print:hidden")}>
          <div className={cn("flex w-full min-w-0 flex-wrap items-center gap-3")}>
            {levelControl}
            {categoryControl}
            {failedNote}
          </div>
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
          <GenerateButton onClick={handleGenerate} tone="hero" disabled={waitingForChild} />
          {failedNote}
        </div>
      )}
      {card !== null ? <DictationSheet card={card} /> : null}
    </div>
  );
}

/** The printed card. It draws the commands, the grid, and the start dot, and never the outline: that is the answer. */
function DictationSheet({ card }: { card: DictationCard }) {
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
      <circle
        cx={grid.x + card.start.col * card.cellSize}
        cy={grid.y + card.start.row * card.cellSize}
        r={DICTATION_SHEET.startDotRadius}
        fill="var(--foreground)"
      />
    </svg>
  );
}
