import { CharacterInstruction } from "@/components/SpeechBand";
import type { CopyDrawingCard } from "@/lib/copy-drawing/card";
import { copyDrawingCellColors } from "@/lib/copy-drawing/colors";
import { layoutCopyDrawingSheet, type CopyDrawingGridRect } from "@/lib/copy-drawing/layout";
import { copyDrawingLevelById } from "@/lib/copy-drawing/levels";
import { COPY_DRAWING_SHEET } from "@/lib/copy-drawing/sheet";
import { blockLines } from "@/lib/nonogram/layout";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

/**
 * The "Skopiuj obrazek" card: the instruction (the character's speech band, or the plain line without a
 * character) and two grids of one size side by side. The left grid carries the black silhouette and always prints; the
 * right grid is empty, the child fills it in. The silhouette is black, or in the crayon colors of the template when the
 * colors switch is on. There is no answer and no object name on the card.
 */
export function CopyDrawingSheet({
  card,
  colors,
  characterId,
  characterSrc,
}: {
  card: CopyDrawingCard;
  /** Draw the silhouette in its crayon colors instead of black. */
  colors: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = COPY_DRAWING_SHEET;
  const level = copyDrawingLevelById(card.levelId);
  const instructionHeight = instructionBoxHeight(characterSrc !== null, sheet.plainInstructionSize);
  const layout = layoutCopyDrawingSheet(level, instructionHeight);

  return (
    <svg
      viewBox={`0 0 ${layout.page.width} ${layout.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Skopiuj obrazek"
      data-card-key={card.key}
    >
      <rect width={layout.page.width} height={layout.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={layout.page.width}
          inset={sheet.inset}
          top={layout.band.y}
          characterId={characterId}
          characterSrc={characterSrc}
          text={sheet.instructionText}
        />
      ) : (
        <text
          x={layout.page.width / 2}
          y={layout.band.y + layout.band.height / 2}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={sheet.plainInstructionSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {sheet.instructionText}
        </text>
      )}
      <Grid
        rect={layout.source}
        cell={layout.cell}
        columns={layout.columns}
        rows={layout.rows}
        pattern={card.pattern}
        colors={colors ? copyDrawingCellColors(card) : null}
        name="source"
      />
      <Grid
        rect={layout.copy}
        cell={layout.cell}
        columns={layout.columns}
        rows={layout.rows}
        pattern={null}
        colors={null}
        name="copy"
      />
    </svg>
  );
}

function Grid({
  rect,
  cell,
  columns,
  rows,
  pattern,
  colors,
  name,
}: {
  rect: CopyDrawingGridRect;
  cell: number;
  columns: number;
  rows: number;
  /** The filled cells, or null for the empty grid. */
  pattern: CopyDrawingCard["pattern"] | null;
  /** The crayon of every cell (see `copyDrawingCellColors`), or null for black. */
  colors: ReturnType<typeof copyDrawingCellColors>;
  name: "source" | "copy";
}) {
  const sheet = COPY_DRAWING_SHEET;
  const thickColumns = new Set(blockLines(columns, sheet.blockEvery));
  const thickRows = new Set(blockLines(rows, sheet.blockEvery));
  const columnLines = Array.from({ length: columns + 1 }, (_, index) => index);
  const rowLines = Array.from({ length: rows + 1 }, (_, index) => index);

  return (
    <g data-grid={name}>
      {pattern !== null ? (
        <g fill="var(--foreground)" data-filled>
          {pattern.flatMap((row, rowIndex) =>
            row.map((filled, columnIndex) => {
              const crayon = colors?.[rowIndex][columnIndex] ?? null;
              return filled || crayon !== null ? (
                <rect
                  key={`${columnIndex},${rowIndex}`}
                  x={rect.x + columnIndex * cell}
                  y={rect.y + rowIndex * cell}
                  width={cell}
                  height={cell}
                  fill={crayon === null ? undefined : `var(--symmetry-${crayon})`}
                />
              ) : null;
            }),
          )}
        </g>
      ) : null}
      <g fill="none" stroke="var(--foreground)">
        {columnLines.map((index) => (
          <line
            key={`c${index}`}
            x1={rect.x + index * cell}
            y1={rect.y}
            x2={rect.x + index * cell}
            y2={rect.y + rect.height}
            strokeWidth={thickColumns.has(index) ? sheet.blockStroke : sheet.gridStroke}
          />
        ))}
        {rowLines.map((index) => (
          <line
            key={`r${index}`}
            x1={rect.x}
            y1={rect.y + index * cell}
            x2={rect.x + rect.width}
            y2={rect.y + index * cell}
            strokeWidth={thickRows.has(index) ? sheet.blockStroke : sheet.gridStroke}
          />
        ))}
      </g>
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={sheet.frameStroke}
        strokeLinejoin="miter"
      />
    </g>
  );
}
