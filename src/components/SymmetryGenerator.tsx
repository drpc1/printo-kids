import { useEffect, useState } from "react";
import { Printer, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCorner } from "@/components/ProfileCorner";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import { generateSymmetryCard, SYMMETRY_SETTING, type SymmetryCard } from "@/lib/symmetry/generate";
import { layoutSymmetrySheet } from "@/lib/symmetry/layout";
import { cn } from "@/lib/utils";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const INSTRUCTION_SIZE = 7;
const INSTRUCTION_GAP = 6;
const INSTRUCTION_TEXT = "Dorysuj drugą połowę tak, jak w lustrze.";
const GENERATE_FAILED_TEXT = "Nie udało się ułożyć karty.";
const GRID_STROKE = 0.3;
const FRAME_STROKE = 0.65;
const AXIS_STROKE = 1.4;
const AXIS_DASH = "4 2.5";

// Button's default size adds has-[>svg]:px-3; the has-[>svg] entries replace it so the icon keeps the full padding.
const ACTION_BUTTON_CLASS =
  "h-auto rounded-full px-6 py-2.5 text-base has-[>svg]:px-6 sm:px-8 sm:py-3.5 sm:text-lg sm:has-[>svg]:px-8";

/**
 * The symmetry card page: Generuj, the card, Drukuj, and the shared profile corner. It has no character or level
 * bar and never touches the maze's last-used parameters; it only keeps the bar values the profile corner shows.
 */
export default function SymmetryGenerator() {
  const { profiles, activeId, ask, waitingForChild, visitStart, corner } = useChildProfileVisit({
    onApply: applyProfileBar,
  });
  const [barCharacter, setBarCharacter] = useState(visitStart.character);
  const [barLevel, setBarLevel] = useState(visitStart.level);
  const [card, setCard] = useState<SymmetryCard | null>(null);
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

  function handleGenerate(): void {
    if (waitingForChild) {
      return;
    }
    const next = generateSymmetryCard(Math.random, card?.key ?? null);
    if (next === null) {
      setGenerateFailed(true);
      return;
    }
    setGenerateFailed(false);
    setCard(next);
  }

  function handlePrint(): void {
    window.print();
  }

  function applyProfileBar(bar: ProfileBar): void {
    setBarCharacter(bar.character);
    setBarLevel(bar.level);
  }

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
          {failedNote}
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
          <GenerateButton onClick={handleGenerate} tone="hero" disabled={waitingForChild} />
          {failedNote}
        </div>
      )}
      {card !== null ? <SymmetrySheet card={card} /> : null}
    </div>
  );
}

function GenerateButton({
  onClick,
  tone,
  disabled,
  className,
}: {
  onClick: () => void;
  tone: "hero" | "quiet";
  disabled: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={tone === "hero" ? "default" : "outline"}
      onClick={onClick}
      disabled={disabled}
      className={cn(ACTION_BUTTON_CLASS, className)}
    >
      <Shuffle aria-hidden />
      Generuj
    </Button>
  );
}

function SymmetrySheet({ card }: { card: SymmetryCard }) {
  const sheet = layoutSymmetrySheet({
    pageWidth: PAGE_WIDTH,
    pageHeight: PAGE_HEIGHT,
    inset: INSET,
    columns: card.columns,
    rows: card.rows,
    cellSize: SYMMETRY_SETTING.cellSize,
    instructionHeight: INSTRUCTION_SIZE,
    instructionGap: INSTRUCTION_GAP,
  });
  const grid = sheet.grid;
  const cellSize = grid.width / card.columns;
  const columnLines = Array.from({ length: card.columns - 1 }, (_, index) => grid.x + (index + 1) * cellSize);
  const rowLines = Array.from({ length: card.rows - 1 }, (_, index) => grid.y + (index + 1) * cellSize);

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      role="img"
      aria-label="Symetria"
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      <text
        x={sheet.instruction.x}
        y={sheet.instruction.y}
        fill="var(--foreground)"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={INSTRUCTION_SIZE}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {INSTRUCTION_TEXT}
      </text>
      {/* Colors arrive in S-15; every pattern cell prints black for now. */}
      <g fill="var(--foreground)">
        {card.cells.map((cell) => (
          <rect
            key={`${cell.col},${cell.row}`}
            x={grid.x + cell.col * cellSize}
            y={grid.y + cell.row * cellSize}
            width={cellSize}
            height={cellSize}
          />
        ))}
      </g>
      <g fill="none" stroke="var(--foreground)" strokeWidth={GRID_STROKE}>
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
        strokeWidth={FRAME_STROKE}
        strokeLinejoin="miter"
      />
      <line
        x1={sheet.axis.x1}
        y1={sheet.axis.y1}
        x2={sheet.axis.x2}
        y2={sheet.axis.y2}
        stroke="var(--foreground)"
        strokeWidth={AXIS_STROKE}
        strokeDasharray={AXIS_DASH}
      />
    </svg>
  );
}
