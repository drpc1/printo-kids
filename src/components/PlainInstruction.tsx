import type { PlainInstructionLayout } from "@/lib/sheet/plain-instruction";

/**
 * The instruction of a card without a character, drawn from `layoutPlainInstruction`: one centred text per line.
 * The baseline comes from the layout (a shift in font sizes), not from `dominant-baseline`, which phone browsers
 * place differently (GitHub 371). `top` is where the instruction starts on the page, the card's own layout says it.
 */
export function PlainInstruction({
  layout,
  centerX,
  top,
}: {
  layout: PlainInstructionLayout;
  centerX: number;
  top: number;
}) {
  // No wrapping <g>: the sheets' structure (and tests that count their groups) stays as it was with a plain <text>.
  return (
    <>
      {layout.lines.map((line, index) => (
        <text
          key={`${index}-${line}`}
          data-plain-instruction
          x={centerX}
          y={top + layout.baselines[index]}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={layout.size}
          textAnchor="middle"
        >
          {line}
        </text>
      ))}
    </>
  );
}
