import { CharacterInstruction } from "@/components/SpeechBand";
import { blockLines, layoutSimpleNonogramSheet } from "@/lib/nonogram/layout";
import { NONOGRAM_SHEET, NONOGRAM_SIMPLE_SHEET } from "@/lib/nonogram/sheet";
import type { SimpleNonogramCard, Tone } from "@/lib/nonogram/simple";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

const TONE_FILL: Record<Tone, string> = {
  white: "var(--card)",
  gray: "var(--symmetry-gray)",
  black: "var(--foreground)",
};

/**
 * The chip card of the easy nonogram: every row is described in full by chips (white, gray or black, with the number
 * of cells), the child colors the row left to right. White cells stay empty. The solution group paints the grays and
 * blacks on screen only; the print never shows it.
 */
export function NonogramSimpleSheet({
  card,
  showSolution,
  characterId,
  characterSrc,
}: {
  card: SimpleNonogramCard;
  showSolution: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const instructionHeight = instructionBoxHeight(characterSrc !== null, NONOGRAM_SHEET.instructionSize);
  const chips = NONOGRAM_SIMPLE_SHEET;
  const sheet = layoutSimpleNonogramSheet({
    pageWidth: NONOGRAM_SHEET.pageWidth,
    pageHeight: NONOGRAM_SHEET.pageHeight,
    inset: NONOGRAM_SHEET.inset,
    columns: card.columns,
    rows: card.rows,
    cellSize: card.cellSize,
    maxRuns: Math.max(...card.runs.map((row) => row.length)),
    instructionSize: instructionHeight,
    instructionGap: NONOGRAM_SHEET.instructionGap * 2,
    chipSize: chips.chipSize,
    chipGap: chips.chipGap,
    bandGap: chips.bandGap,
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
      aria-label="Nonogram ze znaczkami"
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={sheet.page.width}
          inset={NONOGRAM_SHEET.inset}
          top={sheet.instruction.y - instructionHeight / 2}
          characterId={characterId}
          characterSrc={characterSrc}
          text={chips.instructionText}
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
          {chips.instructionText}
        </text>
      )}
      {showSolution ? (
        <g className={cn("print:hidden")} data-solution>
          {card.tones.flatMap((row, rowIndex) =>
            row.map((tone, columnIndex) =>
              tone === "white" ? null : (
                <rect
                  key={`${columnIndex},${rowIndex}`}
                  x={grid.x + columnIndex * cellSize}
                  y={grid.y + rowIndex * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={TONE_FILL[tone]}
                />
              ),
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
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={chips.digitSize}
        fontWeight={NONOGRAM_SHEET.clueFontWeight}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {card.runs.flatMap((row, rowIndex) =>
          row.map((run, index) => {
            const x = sheet.chipX(index, row.length);
            const y = sheet.chipY(rowIndex);
            return (
              <g key={`chip${rowIndex},${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={chips.chipSize}
                  height={chips.chipSize}
                  rx={chips.chipRadius}
                  fill={TONE_FILL[run.tone]}
                  stroke="var(--foreground)"
                  strokeWidth={chips.chipStroke}
                />
                <text
                  x={x + chips.chipSize / 2}
                  y={y + chips.chipSize / 2}
                  fill={run.tone === "black" ? "var(--card)" : "var(--foreground)"}
                >
                  {run.count}
                </text>
              </g>
            );
          }),
        )}
      </g>
    </svg>
  );
}
