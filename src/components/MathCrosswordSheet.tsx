import { PlainInstruction } from "@/components/PlainInstruction";
import { CharacterInstruction } from "@/components/SpeechBand";
import type { MathCell, MathCrosswordCard } from "@/lib/math-crossword/card";
import { layoutMathCrosswordSheet } from "@/lib/math-crossword/layout";
import { MATH_CROSSWORD_SHEET } from "@/lib/math-crossword/sheet";
import { mathCrosswordPlainInstruction } from "@/lib/sheet/card-instructions";
import { layoutPlainInstruction } from "@/lib/sheet/plain-instruction";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

const TEXT_PROPS = {
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  textAnchor: "middle",
} as const;

/** The text of one cell: a number, a sign or "=", centred in its square. */
function glyph(card: MathCrosswordCard, cell: MathCell, x: number, y: number, side: number) {
  const sheet = MATH_CROSSWORD_SHEET;
  const text = cell.kind === "num" ? String(card.values[cell.id]) : cell.kind === "op" ? cell.op : "=";
  const size = side * (text.length >= sheet.longGlyphFrom ? sheet.longGlyphRatio : sheet.glyphRatio);
  const bold = cell.kind === "num" || (sheet.boldSigns as readonly string[]).includes(text);
  return (
    <text
      key={`t${cell.row},${cell.col}`}
      x={x + side / 2}
      y={y + side / 2 + size * sheet.baselineShift}
      fontSize={size}
      fontWeight={bold ? "bold" : undefined}
    >
      {text}
    </text>
  );
}

/**
 * The "Krzyżówka matematyczna" card: the instruction (the character's speech band, or the plain line without a
 * character) and the crossword, every cell with its own frame; the places between cells that are not to be filled in are hatched. Numbers and the signs "·" and ":" are bold. An empty
 * number stays empty on paper; with `showSolution` the missing numbers appear in grey, on screen only (`print:hidden`).
 * What is drawn comes from `layoutMathCrosswordSheet`, the same function the tests check.
 */
export function MathCrosswordSheet({
  card,
  cardKey,
  showSolution,
  characterId,
  characterSrc,
}: {
  card: MathCrosswordCard;
  cardKey: string;
  showSolution: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = MATH_CROSSWORD_SHEET;
  const plain = layoutPlainInstruction(mathCrosswordPlainInstruction());
  const instructionHeight = instructionBoxHeight(characterSrc !== null, plain.height);
  const layout = layoutMathCrosswordSheet(card, instructionHeight);
  const blanks = new Set(card.blanks);

  return (
    <svg
      viewBox={`0 0 ${layout.page.width} ${layout.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Krzyżówka matematyczna"
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
          text={sheet.instruction}
        />
      ) : (
        <PlainInstruction layout={plain} centerX={layout.page.width / 2} top={layout.band.y} />
      )}
      <defs>
        <pattern
          id="math-crossword-gap"
          width="2"
          height="2"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="2" stroke="var(--muted-foreground)" strokeWidth="0.35" />
        </pattern>
      </defs>
      <g fill="url(#math-crossword-gap)" data-gaps>
        {layout.gaps.map(({ x, y }) => (
          <rect key={`g${x},${y}`} x={x} y={y} width={layout.cell} height={layout.cell} />
        ))}
      </g>
      <g fill="none" stroke="var(--foreground)" strokeWidth={sheet.cellStroke} data-frames>
        {layout.placed.map(({ cell, x, y }) => (
          <rect key={`${cell.row},${cell.col}`} x={x} y={y} width={layout.cell} height={layout.cell} />
        ))}
      </g>
      <g {...TEXT_PROPS} fill="var(--foreground)">
        {layout.placed.map(({ cell, x, y }) =>
          cell.kind === "num" && blanks.has(cell.id) ? null : glyph(card, cell, x, y, layout.cell),
        )}
      </g>
      {showSolution ? (
        <g {...TEXT_PROPS} className={cn("print:hidden")} fill="var(--muted-foreground)" data-solution>
          {layout.placed.map(({ cell, x, y }) =>
            cell.kind === "num" && blanks.has(cell.id) ? glyph(card, cell, x, y, layout.cell) : null,
          )}
        </g>
      ) : null}
    </svg>
  );
}
