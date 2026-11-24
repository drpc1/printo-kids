import { PlainInstruction } from "@/components/PlainInstruction";
import { CharacterInstruction } from "@/components/SpeechBand";
import type { CodingCard, Dir, TargetKind } from "@/lib/coding/card";
import { layoutCodingSheet } from "@/lib/coding/layout";
import { codingInstruction, codingLevelById, codingModeById } from "@/lib/coding/levels";
import { CODING_SHEET } from "@/lib/coding/sheet";
import { codingPlainInstruction } from "@/lib/sheet/card-instructions";
import { layoutPlainInstruction } from "@/lib/sheet/plain-instruction";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

const FONT = "ui-sans-serif, system-ui, sans-serif";
const INK = CODING_SHEET.colors.ink;
const PAPER = CODING_SHEET.colors.paper;

/**
 * A line of text centred on (x, y). The baseline is moved down by `baselineShift` font sizes instead of using
 * `dominant-baseline`, which phone browsers place differently (GitHub 371).
 */
function CentredText({
  x,
  y,
  size,
  fill = INK,
  bold = false,
  children,
}: {
  x: number;
  y: number;
  size: number;
  fill?: string;
  bold?: boolean;
  children: string;
}) {
  return (
    <text
      x={x}
      y={y + size * CODING_SHEET.baselineShift}
      fill={fill}
      fontFamily={FONT}
      fontSize={size}
      fontWeight={bold ? "bold" : undefined}
      textAnchor="middle"
    >
      {children}
    </text>
  );
}

const ROTATION: Record<Dir, number> = { R: 0, D: 90, L: 180, U: 270 };

/** An arrow drawn with strokes, not a font character; centred on (cx, cy) and pointing right before the rotation. */
function Arrow({ cx, cy, length, dir, color }: { cx: number; cy: number; length: number; dir: Dir; color: string }) {
  const half = length / 2;
  const head = length * 0.32;
  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(${ROTATION[dir]})`}
      stroke={color}
      strokeWidth={CODING_SHEET.arrowStroke}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-arrow={dir}
    >
      <line x1={-half} y1={0} x2={half} y2={0} />
      <polyline points={`${half - head},${-head} ${half},0 ${half - head},${head}`} />
    </g>
  );
}

/** The finish flag: a pole and a chequered cloth, drawn with strokes and filled squares. */
function Flag({ x, y, size }: { x: number; y: number; size: number }) {
  const pole = x - size * 0.3;
  const top = y - size / 2;
  const width = size * 0.75;
  const height = size * 0.5;
  const squares: { key: string; i: number; j: number }[] = [];
  for (let i = 0; i < 4; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      if ((i + j) % 2 === 0) squares.push({ key: `${i}-${j}`, i, j });
    }
  }
  return (
    <g data-flag>
      <line
        x1={pole}
        y1={top}
        x2={pole}
        y2={y + size / 2}
        stroke={INK}
        strokeWidth={Math.max(0.8, size * 0.06)}
        strokeLinecap="round"
      />
      <rect x={pole} y={top} width={width} height={height} fill={PAPER} />
      {squares.map((square) => (
        <rect
          key={square.key}
          x={pole + (square.i * width) / 4}
          y={top + (square.j * height) / 2}
          width={width / 4}
          height={height / 2}
          fill={INK}
        />
      ))}
      <rect x={pole} y={top} width={width} height={height} fill="none" stroke={INK} strokeWidth={0.4} />
    </g>
  );
}

/** One of the three pictures of a Wykonaj card, drawn as a thick outline. */
function Picture({ kind, cx, cy, r }: { kind: TargetKind; cx: number; cy: number; r: number }) {
  const strokeWidth = Math.max(0.9, r * 0.12);
  const common = { fill: "none", stroke: INK, strokeLinejoin: "round" as const };
  if (kind === "circle") {
    return <circle cx={cx} cy={cy} r={r * 0.8} strokeWidth={strokeWidth} {...common} data-picture={kind} />;
  }
  if (kind === "star") {
    const points = Array.from({ length: 10 }, (_, i) => {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const radius = i % 2 === 1 ? r * 0.42 : r;
      return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    });
    return <polygon points={points.join(" ")} strokeWidth={strokeWidth} {...common} data-picture={kind} />;
  }
  const scale = r * 0.95;
  return (
    <path
      transform={`translate(${cx} ${cy}) scale(${scale})`}
      d="M 0 0.85 C -1.3 0 -0.7 -1 0 -0.4 C 0.7 -1 1.3 0 0 0.85 Z"
      strokeWidth={strokeWidth / scale}
      {...common}
      data-picture={kind}
    />
  );
}

/**
 * The "Kodowanie" card: the instruction of the mode (the character's speech band, or the plain line without a
 * character), a grid with grey obstacles, the character in the start cell (a "Start" circle without one) and then
 * either the flag and empty answer boxes under the grid (Zapisz; the first ones are filled in grey as an example) or
 * three pictures on the grid and the given arrows under it (Wykonaj). The card carries no answer, so nothing on it is
 * screen-only. Every position comes from `layoutCodingSheet`, the function the tests check.
 */
export function CodingSheet({
  card,
  cardKey,
  characterId,
  characterSrc,
}: {
  card: CodingCard;
  cardKey: string;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = CODING_SHEET;
  const level = codingLevelById(card.level);
  const mode = codingModeById(card.mode);
  const instruction = codingInstruction(level, mode);
  const plain = layoutPlainInstruction(codingPlainInstruction(instruction));
  const instructionHeight = instructionBoxHeight(characterSrc !== null, plain.height);
  const layout = layoutCodingSheet(card, instructionHeight);
  const grid = layout.grid;
  const start = layout.start;

  return (
    <svg
      viewBox={`0 0 ${layout.page.width} ${layout.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Kodowanie"
      data-card-key={cardKey}
    >
      <rect width={layout.page.width} height={layout.page.height} fill={PAPER} />
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
      <g data-grid>
        {card.blocked.flatMap((row, r) =>
          row.map((blocked, c) => (
            <rect
              key={`${r}-${c}`}
              x={grid.x + c * grid.cell}
              y={grid.y + r * grid.cell}
              width={grid.cell}
              height={grid.cell}
              fill={blocked ? sheet.colors.obstacle : PAPER}
              stroke={INK}
              strokeWidth={sheet.gridStroke}
              data-obstacle={blocked ? "" : undefined}
            />
          )),
        )}
        <rect
          x={grid.x}
          y={grid.y}
          width={grid.width}
          height={grid.height}
          fill="none"
          stroke={INK}
          strokeWidth={sheet.frameStroke}
        />
      </g>
      {characterSrc !== null ? (
        <image
          href={characterSrc}
          x={start.x - start.characterSize / 2}
          y={start.y - start.characterSize / 2}
          width={start.characterSize}
          height={start.characterSize}
          preserveAspectRatio="xMidYMid meet"
          data-start
        />
      ) : (
        <g data-start>
          <circle cx={start.x} cy={start.y} r={start.circleRadius} fill={PAPER} stroke={INK} strokeWidth={1} />
          <CentredText x={start.x} y={start.y} size={start.textSize} bold>
            Start
          </CentredText>
        </g>
      )}
      {card.mode === "zapisz" ? <Flag x={layout.goal.x} y={layout.goal.y} size={layout.goal.flagSize} /> : null}
      {layout.targets.map((target) => (
        <Picture key={target.kind} kind={target.kind} cx={target.cx} cy={target.cy} r={target.radius} />
      ))}
      <g data-answers>
        {layout.answers.map((answer, index) => {
          const rect = answer.rect;
          const color = answer.example ? sheet.colors.example : INK;
          return (
            <g key={index} data-answer-box>
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                rx={sheet.boxRadius}
                fill={PAPER}
                stroke={INK}
                strokeWidth={sheet.boxStroke}
              />
              {!answer.filled ? null : level.grouped ? (
                <>
                  <CentredText
                    x={rect.x + rect.width * 0.3}
                    y={rect.y + rect.height / 2}
                    size={rect.height * 0.55}
                    fill={color}
                    bold
                  >
                    {String(answer.count)}
                  </CentredText>
                  <Arrow
                    cx={rect.x + rect.width * 0.68}
                    cy={rect.y + rect.height / 2}
                    length={rect.height * 0.55}
                    dir={answer.dir}
                    color={color}
                  />
                </>
              ) : (
                <Arrow
                  cx={rect.x + rect.width / 2}
                  cy={rect.y + rect.height / 2}
                  length={rect.width * 0.6}
                  dir={answer.dir}
                  color={color}
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
