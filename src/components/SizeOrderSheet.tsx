import { CharacterInstruction } from "@/components/SpeechBand";
import { iconById, type IconFigure } from "@/lib/odd-one-out/icons";
import type { SizeOrderCard } from "@/lib/size-order/card";
import { iconBounds, layoutSizeOrderSheet } from "@/lib/size-order/layout";
import { SIZE_ORDER_SHEET } from "@/lib/size-order/sheet";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { sudokuShapePath } from "@/lib/sudoku/shapes";
import { cn } from "@/lib/utils";

const FONT = "ui-sans-serif, system-ui, sans-serif";

/** One figure of an icon: ink in the ink color of the row, paper (the white details) as the card. */
function Figure({ figure, ink }: { figure: IconFigure; ink: string }) {
  const color = figure.tone === "ink" ? ink : "var(--card)";
  switch (figure.kind) {
    case "circle":
      return <circle cx={figure.cx} cy={figure.cy} r={figure.r} fill={color} />;
    case "ellipse":
      return (
        <ellipse
          cx={figure.cx}
          cy={figure.cy}
          rx={figure.rx}
          ry={figure.ry}
          fill={color}
          transform={figure.rotate === undefined ? undefined : `rotate(${figure.rotate} ${figure.cx} ${figure.cy})`}
        />
      );
    case "rect":
      return (
        <rect
          x={figure.x}
          y={figure.y}
          width={figure.width}
          height={figure.height}
          rx={figure.rx}
          fill={color}
          transform={
            figure.rotate === undefined
              ? undefined
              : `rotate(${figure.rotate} ${figure.x + figure.width / 2} ${figure.y + figure.height / 2})`
          }
        />
      );
    case "polygon":
      return <polygon points={figure.points.map((point) => point.join(",")).join(" ")} fill={color} />;
    case "line":
      return (
        <line
          x1={figure.x1}
          y1={figure.y1}
          x2={figure.x2}
          y2={figure.y2}
          stroke={color}
          strokeWidth={figure.strokeWidth}
          strokeLinecap="round"
        />
      );
    case "path":
      return figure.strokeWidth === undefined ? (
        <path d={figure.d} fill={color} />
      ) : (
        <path
          d={figure.d}
          fill="none"
          stroke={color}
          strokeWidth={figure.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
  }
}

/** An icon as tall as `height`, centred on `cx` and standing on `baseline`; its drawing box is `ICON_BOX` wide. */
function IconPicture({
  iconId,
  cx,
  baseline,
  height,
  ink,
}: {
  iconId: string;
  cx: number;
  baseline: number;
  height: number;
  ink: string;
}) {
  const icon = iconById(iconId);
  if (icon === undefined) {
    return null;
  }
  const bounds = iconBounds(icon);
  const factor = height / (bounds.y1 - bounds.y0);
  const x = cx - ((bounds.x0 + bounds.x1) / 2) * factor;
  const y = baseline - bounds.y1 * factor;
  return (
    <g transform={`translate(${x} ${y}) scale(${factor})`}>
      {icon.figures.map((figure, index) => (
        <Figure key={index} figure={figure} ink={ink} />
      ))}
    </g>
  );
}

/**
 * The printed "Od najmniejszego" card: the instruction (the chosen character says it, or the plain line), then the
 * rows. A row is one picture in several sizes on a common baseline, each with an empty answer box under it. With
 * colors on a row has one crayon, so the color never says which picture is bigger. There is no answer on the sheet.
 * Every position comes from `layoutSizeOrderSheet`, the function the tests check.
 */
export function SizeOrderSheet({
  card,
  cardKey,
  colors,
  characterId,
  characterSrc,
}: {
  card: SizeOrderCard;
  cardKey: string;
  colors: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = SIZE_ORDER_SHEET;
  const layout = layoutSizeOrderSheet(card, instructionBoxHeight(characterSrc !== null, sheet.plainInstructionSize));

  return (
    <svg
      viewBox={`0 0 ${layout.page.width} ${layout.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Od najmniejszego"
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
        <text
          x={layout.page.width / 2}
          y={layout.band.y + layout.band.height / 2 + sheet.plainInstructionSize * sheet.baselineShift}
          fill="var(--foreground)"
          fontFamily={FONT}
          fontSize={sheet.plainInstructionSize}
          textAnchor="middle"
        >
          {sheet.instruction}
        </text>
      )}
      {card.rows.map((row, rowIndex) => {
        const rowLayout = layout.rows[rowIndex];
        const ink = colors ? `var(--symmetry-${row.crayon})` : "var(--foreground)";
        return (
          <g key={rowIndex} data-row>
            {rowIndex > 0 ? (
              <line
                x1={sheet.inset}
                y1={rowLayout.top}
                x2={layout.page.width - sheet.inset}
                y2={rowLayout.top}
                stroke="var(--border)"
                strokeWidth={sheet.rowDividerStroke}
                strokeDasharray="1.5 1.5"
              />
            ) : null}
            {rowLayout.slots.map((slot, slotIndex) => (
              <g key={slotIndex} data-picture>
                {row.picture.kind === "icon" ? (
                  <IconPicture
                    iconId={row.picture.id}
                    cx={slot.cx}
                    baseline={rowLayout.baseline}
                    height={slot.height}
                    ink={ink}
                  />
                ) : (
                  <path
                    d={sudokuShapePath(
                      row.picture.id,
                      slot.cx,
                      rowLayout.baseline - slot.height / 2,
                      slot.height - sheet.shapeStroke,
                    )}
                    fill={colors ? ink : "var(--card)"}
                    stroke={ink}
                    strokeWidth={sheet.shapeStroke}
                    strokeLinejoin="round"
                  />
                )}
                <rect
                  x={slot.box.x}
                  y={slot.box.y}
                  width={slot.box.width}
                  height={slot.box.height}
                  rx={sheet.boxRadius}
                  fill="var(--card)"
                  stroke="var(--foreground)"
                  strokeWidth={sheet.boxStroke}
                  data-answer-box
                />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
