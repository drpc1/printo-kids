import type { ReactElement } from "react";
import { PlainInstruction } from "@/components/PlainInstruction";
import { CharacterInstruction } from "@/components/SpeechBand";
import type { ShadowsCard } from "@/lib/shadows/card";
import { shadowPictureById } from "@/lib/shadows/families";
import { layoutShadowsSheet, type PictureField } from "@/lib/shadows/layout";
import { PICTURE_BOX, PICTURE_LINE_WIDTH, type ShadowPicture, type ShadowShape } from "@/lib/shadows/picture-format";
import { SHADOWS_SHEET } from "@/lib/shadows/sheet";
import { layoutPlainInstruction } from "@/lib/sheet/plain-instruction";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

/** The outline pass thickens every body shape by this stroke; half of it shows outside the fill. */
const OUTLINE = 2 * PICTURE_LINE_WIDTH;
const LINE_COLOR = "var(--picture-line)";
const SHADOW_COLOR = "var(--foreground)";

function paintOf(shape: ShadowShape): string {
  return `var(--picture-${shape.paint})`;
}

/** One shape in one color; `pad` thickens it by a stroke of that width (the outline pass), 0 draws the fill. */
function shapeElement(shape: ShadowShape, color: string, pad: number, key: string): ReactElement {
  const edge = pad > 0 ? { stroke: color, strokeWidth: pad, strokeLinejoin: "round" as const } : {};
  switch (shape.kind) {
    case "path":
      return <path key={key} d={shape.d} fill={color} {...edge} />;
    case "rect":
      return (
        <rect
          key={key}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.rx ?? 0}
          fill={color}
          {...edge}
        />
      );
    case "circle":
      return <circle key={key} cx={shape.cx} cy={shape.cy} r={shape.r} fill={color} {...edge} />;
    case "ellipse":
      return (
        <ellipse
          key={key}
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          transform={`rotate(${shape.rotate ?? 0} ${shape.cx} ${shape.cy})`}
          fill={color}
          {...edge}
        />
      );
    case "stroke":
      return (
        <path
          key={key}
          d={shape.d}
          fill="none"
          stroke={color}
          strokeWidth={shape.width - OUTLINE + pad}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
  }
}

/**
 * A picture, or its shadow, in its field. The picture draws in two passes: the outline of every body shape first
 * (thickened by the line width), then the fills on top, so two parts that overlap show no line inside the shape
 * (the Christmas tree, a bear's ears on its head). Details go last with their own outline; a detail line (whiskers,
 * onion skin) is a plain line in its own color. The shadow is the body shapes in black, without details.
 */
function PictureInField({ picture, field, shadow }: { picture: ShadowPicture; field: PictureField; shadow: boolean }) {
  const body = picture.shapes.filter((shape) => shape.detail !== true);
  const details = picture.shapes.filter((shape) => shape.detail === true);
  const parts = shadow
    ? body.map((shape, index) => shapeElement(shape, SHADOW_COLOR, OUTLINE, `s${index}`))
    : [
        ...body.map((shape, index) => shapeElement(shape, LINE_COLOR, OUTLINE, `o${index}`)),
        ...body.map((shape, index) => shapeElement(shape, paintOf(shape), 0, `f${index}`)),
        ...details.flatMap((shape, index) =>
          shape.kind === "stroke"
            ? [
                <path
                  key={`d${index}`}
                  d={shape.d}
                  fill="none"
                  stroke={paintOf(shape)}
                  strokeWidth={shape.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />,
              ]
            : [
                shapeElement(shape, LINE_COLOR, OUTLINE, `do${index}`),
                shapeElement(shape, paintOf(shape), 0, `df${index}`),
              ],
        ),
      ];
  return (
    <g
      transform={`translate(${field.x} ${field.y}) scale(${field.size / PICTURE_BOX})`}
      data-picture={picture.id}
      data-shadow={shadow ? "" : undefined}
    >
      {parts}
    </g>
  );
}

/**
 * The printed "Cienie" card: the instruction (the chosen character says it, or the plain line), then the pairs:
 * colored pictures in the left column, their black shadows in the right column in another order, a dot on the inner
 * side of each. The pictures always print in color; there is no answer line on the sheet. Every position comes from
 * `layoutShadowsSheet`, the function the tests check.
 */
export function ShadowsSheet({
  card,
  cardKey,
  characterId,
  characterSrc,
}: {
  card: ShadowsCard;
  cardKey: string;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = SHADOWS_SHEET;
  const plain = layoutPlainInstruction({
    text: sheet.instruction,
    size: sheet.plainInstructionSize,
    pageWidth: sheet.pageWidth,
    inset: sheet.inset,
  });
  const layout = layoutShadowsSheet(card, instructionBoxHeight(characterSrc !== null, plain.height));

  return (
    <svg
      viewBox={`0 0 ${layout.page.width} ${layout.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Cienie"
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
      {layout.rows.map((row, index) => {
        const picture = shadowPictureById(card.pictures[index]);
        const shadow = shadowPictureById(card.pictures[card.shadowOrder[index]]);
        if (picture === undefined || shadow === undefined) {
          return null;
        }
        return (
          <g key={index} data-row={index}>
            <PictureInField picture={picture} field={row.picture} shadow={false} />
            <PictureInField picture={shadow} field={row.shadow} shadow />
            <circle cx={row.dotLeft.cx} cy={row.dotLeft.cy} r={layout.dotRadius} fill="var(--foreground)" data-dot />
            <circle cx={row.dotRight.cx} cy={row.dotRight.cy} r={layout.dotRadius} fill="var(--foreground)" data-dot />
          </g>
        );
      })}
    </svg>
  );
}
