import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { CategoryChoice } from "@/components/CategoryChoice";
import { ACTION_BUTTON_CLASS, GenerateButton } from "@/components/GenerateButton";
import { Button } from "@/components/ui/button";
import { ProfileCorner } from "@/components/ProfileCorner";
import { NonogramSimpleSheet } from "@/components/NonogramSimpleSheet";
import { SudokuChoice } from "@/components/SudokuChoice";
import { Switch } from "@/components/ui/switch";
import { RememberedNote } from "@/components/RememberedNote";
import { useCardSettings } from "@/hooks/useCardSettings";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import type { NonogramSettings } from "@/lib/card-settings";
import { generateNonogramCard, type NonogramCard } from "@/lib/nonogram/generate";
import { blockLines, layoutNonogramSheet, longestClues } from "@/lib/nonogram/layout";
import { NONOGRAM_SHEET } from "@/lib/nonogram/sheet";
import { NONOGRAM_SIZES, nonogramSizeById, type NonogramSizeId } from "@/lib/nonogram/sizes";
import type { SimpleNonogramCard } from "@/lib/nonogram/simple";
import { cn } from "@/lib/utils";

const GENERATE_FAILED_TEXT = "Nie udało się ułożyć karty.";

/**
 * The nonogram page: Generuj, the card, Drukuj, the level and category choices, the solution switch, and the shared
 * profile corner. It has no colors and no character bar; the level and the category come from `useCardSettings` (the
 * active profile's, or the device's) and every change is remembered at once, the solution switch is not. Changing the
 * level with a card shown draws a new card at that level, and so does a profile switch that changed the level or the
 * category. Switching the solution on redraws the same card; it never generates a
 * new one, and the page never shows the name of the hidden object.
 */
export default function NonogramGenerator() {
  const visit = useChildProfileVisit({ onApply: applyProfileBar });
  const { profiles, activeId, ask, waitingForChild, visitStart } = visit;
  const [barCharacter, setBarCharacter] = useState(visitStart.character);
  const [barLevel, setBarLevel] = useState(visitStart.level);
  const [showSolution, setShowSolution] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [card, setCard] = useState<NonogramCard | SimpleNonogramCard | null>(null);
  const [generateFailed, setGenerateFailed] = useState(false);
  const memory = useCardSettings("nonogram", visit, handleProfileSwitch);
  const { level: sizeId, category: categoryId } = memory.settings;
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

  function generateFor(settings: NonogramSettings): void {
    const next = generateNonogramCard(
      Math.random,
      card?.key ?? null,
      nonogramSizeById(settings.level),
      settings.category,
    );
    if (next === null) {
      setGenerateFailed(true);
      return;
    }
    setGenerateFailed(false);
    // A new card starts the way the child sees it; the parent turns the solution on again to check it.
    setShowSolution(false);
    setCard(next);
  }

  function handleGenerate(): void {
    if (waitingForChild) {
      return;
    }
    generateFor(memory.settings);
  }

  function handleSizeSelect(id: NonogramSizeId): void {
    const next = memory.remember({ level: id });
    if (sheetShown) {
      generateFor(next);
    }
  }

  function handleProfileSwitch(next: NonogramSettings, previous: NonogramSettings): void {
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

  const sizeControl = (
    <SudokuChoice
      label="Poziom"
      dialogTitle="Poziom nonogramu"
      options={NONOGRAM_SIZES}
      value={sizeId}
      open={sizeOpen}
      onOpenChange={setSizeOpen}
      onSelect={handleSizeSelect}
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
            {sizeControl}
            {categoryControl}
            {solutionControl}
            {failedNote}
          </div>
          <RememberedNote note={memory.note} profileActive={activeId !== null} />
          <div className={cn("flex w-full items-center gap-3 sm:gap-4")}>
            <GenerateButton
              onClick={() => {
                handleGenerate();
              }}
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
          {sizeControl}
          {categoryControl}
          <RememberedNote note={memory.note} profileActive={activeId !== null} />
          <GenerateButton
            onClick={() => {
              handleGenerate();
            }}
            tone="hero"
            disabled={waitingForChild}
          />
          {failedNote}
        </div>
      )}
      {card?.kind === "liczby" ? <NonogramSheet card={card} showSolution={showSolution} /> : null}
      {card?.kind === "znaczki" ? <NonogramSimpleSheet card={card} showSolution={showSolution} /> : null}
    </div>
  );
}

function NonogramSheet({ card, showSolution }: { card: NonogramCard; showSolution: boolean }) {
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
    instructionSize: NONOGRAM_SHEET.instructionSize,
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
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
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
