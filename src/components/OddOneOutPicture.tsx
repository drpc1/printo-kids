import { groupLayout, iconSize } from "@/lib/odd-one-out/layout";
import { iconById, ICON_BOX, type IconFigure, type IconTone } from "@/lib/odd-one-out/icons";
import type { OddItem } from "@/lib/odd-one-out/rules";
import { ODD_ONE_OUT_SHEET } from "@/lib/odd-one-out/sheet";
import { sudokuShapePath } from "@/lib/sudoku/shapes";

const TONE: Record<IconTone, string> = { ink: "var(--foreground)", paper: "var(--card)" };

/**
 * One picture of a row, centered on (cx, cy) in a slot of side `slot`: a die-like group of shapes or an object icon.
 * `scale` is 1 for a big picture and the level's small ratio for a small one.
 */
export function OddOneOutPicture({
  item,
  cx,
  cy,
  slot,
  scale,
}: {
  item: OddItem;
  cx: number;
  cy: number;
  slot: number;
  scale: number;
}) {
  if (item.icon !== null) {
    return <IconPicture iconId={item.icon} cx={cx} cy={cy} size={iconSize(slot, scale)} />;
  }
  if (item.shape === null) {
    return null;
  }
  const sheet = ODD_ONE_OUT_SHEET;
  const group = groupLayout(item.count, slot, scale);
  const filled = item.crayon !== null;
  const strokeWidth = filled ? sheet.filledStroke : Math.max(sheet.shapeStrokeMin, group.unit * sheet.shapeStrokeRatio);

  return (
    <>
      {group.points.map((point, index) => (
        <path
          key={index}
          d={sudokuShapePath(item.shape ?? "circle", cx + point.x, cy + point.y, group.unit)}
          fill={item.crayon === null ? "var(--card)" : `var(--symmetry-${item.crayon})`}
          stroke="var(--foreground)"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      ))}
    </>
  );
}

function IconPicture({ iconId, cx, cy, size }: { iconId: string; cx: number; cy: number; size: number }) {
  const icon = iconById(iconId);
  if (icon === undefined) {
    return null;
  }
  const factor = size / ICON_BOX;

  return (
    <g transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${factor})`}>
      {icon.figures.map((figure, index) => (
        <Figure key={index} figure={figure} />
      ))}
    </g>
  );
}

function Figure({ figure }: { figure: IconFigure }) {
  const color = TONE[figure.tone];
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
  }
}
