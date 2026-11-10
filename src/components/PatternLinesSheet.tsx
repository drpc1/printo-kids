import { CharacterInstruction } from "@/components/SpeechBand";
import type { PatternLinesCard } from "@/lib/pattern-lines/card";
import { layoutPatternLinesSheet } from "@/lib/pattern-lines/layout";
import { patternLinesLevelById } from "@/lib/pattern-lines/levels";
import { rowGeometry, type GuideLine } from "@/lib/pattern-lines/paths";
import type { Pt } from "@/lib/pattern-lines/patterns";
import { PATTERN_LINES_SHEET } from "@/lib/pattern-lines/sheet";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

function pathD(points: readonly Pt[]): string {
  return points.map((p, index) => `${index === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
}

/** "muted" guides use the muted text grey, "pale" ones the border grey. */
function guideColor(guide: GuideLine): string {
  return guide.tone === "muted" ? "var(--muted-foreground)" : "var(--border)";
}

/**
 * The "Szlaczki" card: the instruction (the character's speech band, or the plain line without a character) and the rows
 * of patterns. What every row draws comes from `rowGeometry`, the same function the tests check: dots on a pale track
 * with a ring at the start (levels 1-3) or a drawn line (level 4), and the help lines or the ruling. The help lines and
 * the ruling are part of the task and print. There is no answer on the card.
 */
export function PatternLinesSheet({
  card,
  lines,
  characterId,
  characterSrc,
}: {
  card: PatternLinesCard;
  lines: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = PATTERN_LINES_SHEET;
  const level = patternLinesLevelById(card.levelId);
  const instructionHeight = instructionBoxHeight(characterSrc !== null, sheet.plainInstructionSize);
  const layout = layoutPatternLinesSheet(level, instructionHeight);

  return (
    <svg
      viewBox={`0 0 ${layout.page.width} ${layout.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Szlaczki"
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
          text={level.instruction}
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
          {level.instruction}
        </text>
      )}
      {card.rows.map((row, index) => {
        const geometry = rowGeometry(row, level, lines);
        return (
          <g
            key={`${index}-${row.patternId}`}
            transform={`translate(${layout.left} ${layout.centers[index]})`}
            data-row={index}
            data-pattern={row.patternId}
            data-repeats={geometry.repeatsShown}
          >
            {geometry.guides.map((guide, guideIndex) => (
              <line
                key={guideIndex}
                x1={guide.x1}
                y1={guide.y}
                x2={guide.x2}
                y2={guide.y}
                stroke={guideColor(guide)}
                strokeWidth={guide.stroke}
                strokeDasharray={guide.dash ?? undefined}
                data-guide={guide.tone}
              />
            ))}
            {geometry.track ? (
              <path
                d={pathD(geometry.path)}
                fill="none"
                stroke="var(--border)"
                strokeWidth={sheet.trackStroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                data-track
              />
            ) : null}
            {geometry.lineStroke !== null ? (
              <path
                d={pathD(geometry.path)}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth={geometry.lineStroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                data-line
              />
            ) : null}
            {geometry.startRing !== null ? (
              <circle
                cx={geometry.startRing.x}
                cy={geometry.startRing.y}
                r={geometry.startRing.radius}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth={sheet.startRingStroke}
                data-start
              />
            ) : null}
            {geometry.dots.map((dot, dotIndex) => (
              <circle key={dotIndex} cx={dot.x} cy={dot.y} r={geometry.dotRadius} fill="var(--foreground)" data-dot />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
