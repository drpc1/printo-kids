import { patternLinesKey, patternLinesProblems, type PatternLinesCard, type PatternRow } from "./card.ts";
import type { PatternLinesLevel } from "./levels.ts";
import { patternById } from "./patterns.ts";
import { rowLength } from "./paths.ts";

/** Draws again at most this many times before giving up, so a single possible card cannot loop forever. */
export const MAX_ATTEMPTS = 20;

/** A shuffled copy (Fisher-Yates); `random` is the only source of chance. */
export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function between(random: () => number, [low, high]: readonly [number, number]): number {
  return low + random() * (high - low);
}

/** One row: the pattern's step and, on levels 1-3, its height from the level's gentleness. Does not validate. */
export function composeRow(
  patternId: PatternRow["patternId"],
  level: PatternLinesLevel,
  random: () => number,
): PatternRow {
  const pattern = patternById(patternId);
  const span = pattern.span ?? 1;
  const period = between(random, level.period) * span;
  const count = pattern.count ?? Math.max(1, Math.round(rowLength() / period));
  const traced =
    level.mode === "dots"
      ? undefined
      : level.mode === "dotsThenFree"
        ? Math.min(count, level.repeats)
        : Math.min(count, Math.max(level.repeats, Math.round(count * 0.35)));
  if (level.ratio === null) {
    return { patternId, period, count, traced };
  }
  const ratio = between(random, level.ratio);
  const height =
    pattern.id === "line"
      ? 0
      : Math.min(level.maxHeight, (period / span) * (pattern.fixedRatio ?? ratio * (pattern.sharp ?? 1)));
  return { patternId, period, height, count, traced };
}

/** A valid card of the level whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. */
export function generatePatternLinesCard(
  random: () => number,
  previousKey: string | null,
  level: PatternLinesLevel,
): PatternLinesCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const ids = shuffled(level.pool, random);
    const rows = Array.from({ length: level.rows }, (_, i) => composeRow(ids[i % ids.length], level, random));
    const card: PatternLinesCard = { levelId: level.id, rows, key: patternLinesKey(level.id, rows) };
    if (card.key !== previousKey && patternLinesProblems(card, level).length === 0) {
      return card;
    }
  }
  return null;
}
