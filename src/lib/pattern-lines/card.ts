import type { PatternLinesLevel, PatternLinesLevelId } from "./levels.ts";
import {
  dotProblems,
  dotSpecFor,
  rowGeometry,
  rowHalfExtent,
  rowLength,
  selfCrossings,
  type PatternRow,
} from "./paths.ts";

export type { PatternRow };

export interface PatternLinesCard {
  levelId: PatternLinesLevelId;
  rows: readonly PatternRow[];
  /** Names the level and the pattern, step and height of every row, so two cards with one key look the same. Not shown to the child. */
  key: string;
}

export type PatternLinesProblem =
  | "row-count"
  | "not-in-pool"
  | "duplicate-pattern"
  | "crossing"
  | "dots-too-close"
  | "trace-repeats"
  | "out-of-row"
  | "level-mismatch";

const tenth = (value: number): string => (Math.round(value * 10) / 10).toFixed(1);

/**
 * The key of a card: the level, then the pattern, the step and (levels 1-3) the height of every row in order, rounded to
 * 0.1 mm. The generator and `patternLinesProblems` read it here, so they count a repeat the same way.
 */
export function patternLinesKey(levelId: PatternLinesLevelId, rows: readonly PatternRow[]): string {
  const parts = rows.map(
    (row) => `${row.patternId}@${tenth(row.period)}${row.height === undefined ? "" : `x${tenth(row.height)}`}`,
  );
  return `${levelId}:${parts.join("|")}`;
}

const EPSILON = 1e-6;

function repeatsProblem(row: PatternRow, level: PatternLinesLevel): boolean {
  if (level.mode === "dots") {
    return row.traced !== undefined;
  }
  const traced = row.traced ?? 0;
  if (traced > row.count) {
    return true;
  }
  return level.mode === "dotsThenFree" ? traced !== level.repeats : traced < Math.min(level.repeats, row.count);
}

function outOfRow(row: PatternRow, level: PatternLinesLevel, lines: boolean): boolean {
  if (!Number.isInteger(row.count) || row.count < 1) {
    return true;
  }
  if (!level.ruled && (row.height === undefined || row.height < 0 || row.height > level.maxHeight + EPSILON)) {
    return true;
  }
  const half = rowHalfExtent(level);
  const length = rowLength();
  const { path } = rowGeometry(row, level, lines);
  return path.some((p) => p.x < -EPSILON || p.x > length + EPSILON || Math.abs(p.y) > half + EPSILON);
}

/**
 * The rules for a card at the level on the bar. An empty list means the card may be shown: the level's number of rows,
 * every pattern from the level's pool and none twice, no crossing in a path that is dotted all the way, dots that do not
 * run together, the right number of dotted or drawn repeats, and every pattern inside its row.
 */
export function patternLinesProblems(card: PatternLinesCard, level: PatternLinesLevel): readonly PatternLinesProblem[] {
  const problems = new Set<PatternLinesProblem>();
  if (card.levelId !== level.id) {
    problems.add("level-mismatch");
  }
  if (card.rows.length !== level.rows) {
    problems.add("row-count");
  }
  const seen = new Set<string>();
  for (const row of card.rows) {
    if (!level.pool.includes(row.patternId)) {
      problems.add("not-in-pool");
    }
    if (seen.has(row.patternId)) {
      problems.add("duplicate-pattern");
    }
    seen.add(row.patternId);
    if (repeatsProblem(row, level)) {
      problems.add("trace-repeats");
    }
  }
  if (card.rows.some((row) => outOfRow(row, level, true))) {
    problems.add("out-of-row");
  }
  // The geometry below needs a row that is sound enough to draw.
  if (!problems.has("out-of-row") && !problems.has("trace-repeats")) {
    const spec = dotSpecFor(level.id);
    for (const row of card.rows) {
      const { path, dots } = rowGeometry(row, level, true);
      const crossings = selfCrossings(path);
      if (level.mode === "dots" && crossings > 0) {
        problems.add("crossing");
      }
      if (spec !== null && dotProblems(dots, spec.radius, spec.spacing, crossings === 0).length > 0) {
        problems.add("dots-too-close");
      }
    }
  }
  return [...problems];
}
