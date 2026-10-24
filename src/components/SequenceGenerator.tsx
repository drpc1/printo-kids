import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { ACTION_BUTTON_CLASS, GenerateButton } from "@/components/GenerateButton";
import { Button } from "@/components/ui/button";
import { ProfileCorner } from "@/components/ProfileCorner";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import { generateSequenceCard, type SequenceCard } from "@/lib/sequence/generate";
import { layoutSequenceSheet } from "@/lib/sequence/layout";
import { SEQUENCE_LEVEL_LAT5 } from "@/lib/sequence/levels";
import { SEQUENCE_SHEET } from "@/lib/sequence/sheet";
import { sequenceShapeOutline } from "@/lib/sequence/shapes";
import { cn } from "@/lib/utils";

const GENERATE_FAILED_TEXT = "Nie udało się ułożyć karty.";

/**
 * The sequence card page: Generuj, the card, Drukuj, and the shared profile corner. It has one fixed setting (5 lat),
 * so no level button, and no character bar. The page never touches the maze's last-used parameters; it only keeps
 * the bar values the profile corner shows.
 */
export default function SequenceGenerator() {
  const { profiles, activeId, ask, waitingForChild, visitStart, corner } = useChildProfileVisit({
    onApply: applyProfileBar,
  });
  const [barCharacter, setBarCharacter] = useState(visitStart.character);
  const [barLevel, setBarLevel] = useState(visitStart.level);
  const [card, setCard] = useState<SequenceCard | null>(null);
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
    const next = generateSequenceCard(Math.random, card?.key ?? null, SEQUENCE_LEVEL_LAT5);
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
      {card !== null ? <SequenceSheet card={card} /> : null}
    </div>
  );
}

function SequenceSheet({ card }: { card: SequenceCard }) {
  const sheet = layoutSequenceSheet({
    pageWidth: SEQUENCE_SHEET.pageWidth,
    pageHeight: SEQUENCE_SHEET.pageHeight,
    inset: SEQUENCE_SHEET.inset,
    fieldsPerRow: card.fieldsPerRow,
    rowCount: card.rows.length,
    fieldGapRatio: SEQUENCE_SHEET.fieldGapRatio,
    instructionHeight: SEQUENCE_SHEET.instructionSize,
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
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
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
      {card.rows.map((row, rowIndex) =>
        sheet.rows[rowIndex].fields.map((field, fieldIndex) => {
          const empty = row.gaps.includes(fieldIndex);
          const outline = empty
            ? null
            : sequenceShapeOutline(row.values[fieldIndex], field.x + fieldSize / 2, field.y + fieldSize / 2, shapeSize);
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
              {outline?.kind === "circle" ? (
                <circle
                  cx={outline.cx}
                  cy={outline.cy}
                  r={outline.r}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth={SEQUENCE_SHEET.shapeStroke}
                />
              ) : null}
              {outline?.kind === "polygon" ? (
                <polygon
                  points={outline.points}
                  fill="none"
                  stroke="var(--foreground)"
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
