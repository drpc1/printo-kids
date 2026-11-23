import { PlainInstruction } from "@/components/PlainInstruction";
import { CharacterInstruction } from "@/components/SpeechBand";
import { formatClockTime, type ClockCard } from "@/lib/clock/card";
import { drawDial, layoutClockSheet, type ClockLine, type ClockRect } from "@/lib/clock/layout";
import { clockLevelById, clockModeById } from "@/lib/clock/levels";
import { CLOCK_SHEET } from "@/lib/clock/sheet";
import { layoutPlainInstruction } from "@/lib/sheet/plain-instruction";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

const FONT = "ui-sans-serif, system-ui, sans-serif";

/**
 * A line of text centred on (x, y). The baseline is moved down by `baselineShift` font sizes instead of using
 * `dominant-baseline`, which phone browsers place differently (GitHub 371).
 */
function CentredText({
  x,
  y,
  size,
  bold = false,
  halo,
  children,
}: {
  x: number;
  y: number;
  size: number;
  bold?: boolean;
  /** Width of a halo in the page colour round the text, so a hand passing under it does not cross the digits. */
  halo?: number;
  children: string;
}) {
  return (
    <text
      x={x}
      y={y + size * CLOCK_SHEET.baselineShift}
      fill="var(--foreground)"
      fontFamily={FONT}
      fontSize={size}
      fontWeight={bold ? "bold" : undefined}
      textAnchor="middle"
      {...(halo === undefined
        ? {}
        : { stroke: "var(--card)", strokeWidth: halo, strokeLinejoin: "round" as const, paintOrder: "stroke" })}
    >
      {children}
    </text>
  );
}

function Line({ line, round = false }: { line: ClockLine; round?: boolean }) {
  return (
    <line
      x1={line.x1}
      y1={line.y1}
      x2={line.x2}
      y2={line.y2}
      stroke="var(--foreground)"
      strokeWidth={line.stroke}
      strokeLinecap={round ? "round" : undefined}
    />
  );
}

function Box({ rect, stroke, radius }: { rect: ClockRect; stroke: number; radius?: number }) {
  return (
    <rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      rx={radius}
      fill="var(--card)"
      stroke="var(--foreground)"
      strokeWidth={stroke}
    />
  );
}

/** A digital clock: a rounded frame with the time in bold digits ("7:30"). */
function DigitalClock({ frame, text }: { frame: ClockRect; text: string }) {
  const digital = CLOCK_SHEET.digital;
  return (
    <g data-digital>
      <Box rect={frame} stroke={digital.stroke} radius={digital.radius} />
      <CentredText x={frame.x + frame.width / 2} y={frame.y + frame.height / 2} size={digital.textSize} bold>
        {text}
      </CentredText>
    </g>
  );
}

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={CLOCK_SHEET.dotRadius} fill="var(--foreground)" data-dot />;
}

/**
 * The "Zegar" card: the instruction of the mode (the character's speech band, or the plain line without a character)
 * and the dials with numbers 1-12, hour ticks and, from level 4, minute ticks. Odczytaj has the hands and two boxes
 * "__ : __" under each dial; Dorysuj an empty dial with the time in a digital clock under it; Połącz the dials on the
 * left and the digital clocks in another order on the right, a dot beside each. With "24 h" the part of the day stands
 * under every dial. The card carries no answer, so nothing on it is screen-only. Every position comes from
 * `layoutClockSheet` and every dial from `drawDial`, the functions the tests check.
 */
export function ClockSheet({
  card,
  cardKey,
  characterId,
  characterSrc,
}: {
  card: ClockCard;
  cardKey: string;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = CLOCK_SHEET;
  const level = clockLevelById(card.level);
  const mode = clockModeById(card.mode);
  const plain = layoutPlainInstruction({
    text: mode.instruction,
    size: sheet.plainInstructionSize,
    pageWidth: sheet.pageWidth,
    inset: sheet.inset,
  });
  const instructionHeight = instructionBoxHeight(characterSrc !== null, plain.height);
  const layout = layoutClockSheet(card, instructionHeight);

  return (
    <svg
      viewBox={`0 0 ${layout.page.width} ${layout.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Zegar"
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
          text={mode.instruction}
        />
      ) : (
        <PlainInstruction layout={plain} centerX={layout.page.width / 2} top={layout.band.y} />
      )}
      {layout.dials.map((place) => {
        const time = card.times[place.time];
        const drawing = drawDial(
          place.cx,
          place.cy,
          layout.radius,
          level.minuteTicks,
          card.mode === "dorysuj" ? null : time,
        );
        return (
          <g key={place.time} data-dial>
            <circle
              cx={place.cx}
              cy={place.cy}
              r={layout.radius}
              fill="var(--card)"
              stroke="var(--foreground)"
              strokeWidth={drawing.rimStroke}
            />
            {drawing.ticks.map((tick, index) => (
              <Line key={index} line={tick} />
            ))}
            {drawing.hands !== null ? (
              <g data-hands>
                <Line line={drawing.hands.hour} round />
                <Line line={drawing.hands.minute} round />
              </g>
            ) : null}
            {drawing.numbers.map((number) => (
              <CentredText key={number.text} x={number.x} y={number.y} size={number.size} bold halo={number.halo}>
                {number.text}
              </CentredText>
            ))}
            <circle cx={place.cx} cy={place.cy} r={drawing.centreDot} fill="var(--foreground)" />
            {place.partOfDay !== null ? (
              <g data-part-of-day>
                <CentredText x={place.partOfDay.x} y={place.partOfDay.y} size={sheet.partOfDaySize}>
                  {place.partOfDay.text}
                </CentredText>
              </g>
            ) : null}
            {place.answer !== null ? (
              <g data-answer>
                <Box rect={place.answer.hours} stroke={sheet.answerBox.stroke} />
                <Box rect={place.answer.minutes} stroke={sheet.answerBox.stroke} />
                <CentredText x={place.answer.colon.x} y={place.answer.colon.y} size={sheet.answerBox.colonSize} bold>
                  :
                </CentredText>
              </g>
            ) : null}
            {place.digital !== null ? <DigitalClock frame={place.digital} text={formatClockTime(time)} /> : null}
            {place.dot !== null ? <Dot x={place.dot.x} y={place.dot.y} /> : null}
          </g>
        );
      })}
      {layout.digitals.map((digital) => (
        <g key={digital.time}>
          <DigitalClock frame={digital.frame} text={formatClockTime(card.times[digital.time])} />
          <Dot x={digital.dot.x} y={digital.dot.y} />
        </g>
      ))}
    </svg>
  );
}
