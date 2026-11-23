import { PlainInstruction } from "@/components/PlainInstruction";
import { CharacterInstruction } from "@/components/SpeechBand";
import type { NumberMazeCard } from "@/lib/number-maze/card";
import { layoutNumberMazeSheet } from "@/lib/number-maze/layout";
import { numberMazeLevelById } from "@/lib/number-maze/levels";
import { NUMBER_MAZE_SHEET } from "@/lib/number-maze/sheet";
import { layoutPlainInstruction } from "@/lib/sheet/plain-instruction";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

const FONT = "ui-sans-serif, system-ui, sans-serif";

/**
 * The printed "Labirynt liczbowy" card: the instruction of the level (the chosen character says it, or the plain line),
 * then the grid with a bold number in every cell. The start (top left) and the goal (bottom right) have a thick frame,
 * "Start" above and "Meta" below. The card is black and has no path on it. Every position comes from
 * `layoutNumberMazeSheet`, the function the tests check; text sits on an explicit baseline, not `dominant-baseline`.
 */
export function NumberMazeSheet({
  card,
  cardKey,
  characterId,
  characterSrc,
}: {
  card: NumberMazeCard;
  cardKey: string;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = NUMBER_MAZE_SHEET;
  const instruction = numberMazeLevelById(card.levelId).instruction;
  const plain = layoutPlainInstruction({
    text: instruction,
    size: sheet.plainInstructionSize,
    pageWidth: sheet.pageWidth,
    inset: sheet.inset,
  });
  const layout = layoutNumberMazeSheet(card, instructionBoxHeight(characterSrc !== null, plain.height));

  return (
    <svg
      viewBox={`0 0 ${layout.page.width} ${layout.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Labirynt liczbowy"
      data-card-key={cardKey}
    >
      <rect width={layout.page.width} height={layout.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={layout.page.width}
          inset={sheet.inset}
          top={layout.band.y}
          characterId={characterId}
          characterSrc={characterSrc}
          text={instruction}
        />
      ) : (
        <PlainInstruction layout={plain} centerX={layout.page.width / 2} top={layout.band.y} />
      )}
      <g fill="none" stroke="var(--foreground)" strokeWidth={sheet.cellStroke} data-cells>
        {layout.cells.map((cell, index) => (
          <rect key={index} x={cell.x} y={cell.y} width={layout.cell} height={layout.cell} />
        ))}
      </g>
      <rect
        x={layout.grid.x}
        y={layout.grid.y}
        width={layout.grid.width}
        height={layout.grid.height}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={sheet.frameStroke}
      />
      <g fill="none" stroke="var(--foreground)" strokeWidth={sheet.endpointStroke} data-endpoints>
        {layout.endpoints.map((end, index) => (
          <rect
            key={index}
            x={end.x}
            y={end.y}
            width={end.size}
            height={end.size}
            rx={sheet.endpointRadius}
            data-endpoint={index === 0 ? "start" : "goal"}
          />
        ))}
      </g>
      <g fill="var(--foreground)" fontFamily={FONT} fontWeight="bold" textAnchor="middle" data-numbers>
        {layout.cells.map((cell, index) => (
          <text key={index} x={cell.x + layout.cell / 2} y={cell.baseline} fontSize={cell.fontSize} data-number>
            {cell.text}
          </text>
        ))}
      </g>
      <g fill="var(--foreground)" fontFamily={FONT} fontWeight="bold" textAnchor="middle" fontSize={sheet.labelSize}>
        {layout.labels.map((label) => (
          <text key={label.text} x={label.x} y={label.baseline} data-label={label.text}>
            {label.text}
          </text>
        ))}
      </g>
    </svg>
  );
}
