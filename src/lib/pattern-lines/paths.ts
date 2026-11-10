import type { PatternLinesLevel, PatternLinesLevelId } from "./levels.ts";
import { patternById, type PatternId, type Pt } from "./patterns.ts";
import { PATTERN_LINES_SHEET } from "./sheet.ts";

const SHEET = PATTERN_LINES_SHEET;

/** The spec of one row of a card: which pattern, how long its step is, how high it stands and how often it repeats. */
export interface PatternRow {
  patternId: PatternId;
  /** Nominal step in mm (already times the pattern's span). The drawn step is the row length divided by `count`. */
  period: number;
  /** Height in mm. Levels 1-3 only: on level 4 the ruling gives the height. */
  height?: number;
  /** Repeats in the whole row. */
  count: number;
  /** Repeats that are dotted (level 3) or drawn (level 4). Absent on levels 1 and 2, which dot the whole row. */
  traced?: number;
}

export interface GuideLine {
  y: number;
  x1: number;
  x2: number;
  stroke: number;
  dash: string | null;
  /** "muted" is the darker grey of a guide, "pale" the light grey of a faded line. */
  tone: "muted" | "pale";
}

export interface RowGeometry {
  /** The way of the pattern, in mm from the left end of the row and from the middle of the row (y runs down). */
  path: Pt[];
  /** True where the path is drawn as a pale track under the dots (levels 1-3). */
  track: boolean;
  /** Stroke of the black line, or null where the child draws the line (levels 1-3). */
  lineStroke: number | null;
  dots: Pt[];
  dotRadius: number;
  startRing: { x: number; y: number; radius: number } | null;
  guides: GuideLine[];
  /** How many repeats are shown (dotted or drawn). */
  repeatsShown: number;
}

export function rowLength(): number {
  return SHEET.pageWidth - 2 * SHEET.inset - 2 * SHEET.rowIndent;
}

/**
 * Half the height a row of this level takes: the pattern height plus the start ring that can stand on its edge, or the ruling
 * from the top line to the faded line.
 */
export function rowHalfExtent(level: PatternLinesLevel): number {
  if (level.ruled) {
    return 1.5 * SHEET.ruling.unit;
  }
  const dots = dotSpecFor(level.id);
  const ring = dots === null ? 0 : dots.radius + SHEET.startRingGap + SHEET.startRingStroke / 2;
  return level.maxHeight / 2 + ring;
}

export function dotSpecFor(levelId: PatternLinesLevelId): { radius: number; spacing: number } | null {
  return levelId === "poziom4" ? null : SHEET.dots[levelId];
}

/** How many repeats of the whole row show (dots on level 3, the drawn line on level 4, everything on levels 1 and 2). */
export function repeatsShownOf(row: PatternRow, level: PatternLinesLevel): number {
  if (level.mode === "dots") {
    return row.count;
  }
  return row.traced ?? level.repeats;
}

/** The path of `repeats` repeats of a pattern, y from the mid-line of the unit, up as negative y (page coordinates). */
export function patternPath(
  patternId: PatternId,
  count: number,
  length: number,
  repeats: number,
  y: (p: Pt) => number,
): Pt[] {
  const unit = patternById(patternId).unit();
  const step = length / count;
  const points: Pt[] = [];
  for (let r = 0; r < repeats; r += 1) {
    unit.forEach((p, i) => {
      if (r > 0 && i === 0) return;
      points.push({ x: (r + p.x) * step, y: y(p), corner: p.corner });
    });
  }
  return points;
}

function ruledY(patternId: PatternId): (p: Pt) => number {
  const unit = SHEET.ruling.unit;
  const base = unit / 2;
  const ling = patternById(patternId).ling;
  const [lift, scale] = ling === "tall" ? [0, 2] : ling === "desc" ? [-1, 2] : [0, 1];
  return (p) => base - (lift + p.y * scale) * unit;
}

/**
 * The dots along a path. Corners and the end of the path always get a dot; between corners a dot comes every `spacing`.
 * A dot closer than `minDotGap * spacing` to the one before is not put; a corner replaces a close dot that is not a corner.
 */
export function dotsOn(path: readonly Pt[], spacing: number): Pt[] {
  const minimum = SHEET.minDotGap * spacing;
  const dots: Pt[] = [{ ...path[0], corner: true }];
  const add = (point: Pt, corner: boolean): void => {
    const last = dots[dots.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) >= minimum - 1e-9) {
      dots.push({ x: point.x, y: point.y, corner });
    } else if (corner && last.corner !== true) {
      dots[dots.length - 1] = { x: point.x, y: point.y, corner };
    }
  };
  let walked = 0;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    if (a.corner === true && b.corner === true) {
      const n = Math.max(1, Math.round(d / spacing));
      for (let k = 1; k <= n; k += 1) {
        add({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n }, k === n);
      }
      walked = 0;
      continue;
    }
    walked += d;
    if (walked >= spacing * 0.95 || b.corner === true || i === path.length - 1) {
      add(b, b.corner === true);
      walked = 0;
    }
  }
  return dots;
}

function orientation(a: Pt, b: Pt, c: Pt): number {
  return Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
}

/** True when the segments cross at a point inside both; touching at an end or running along each other is not crossing. */
export function segmentsCross(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  return o1 * o2 < 0 && o3 * o4 < 0;
}

/** How many pairs of segments of the path that do not share a point cross each other. */
export function selfCrossings(path: readonly Pt[]): number {
  let crossings = 0;
  for (let i = 0; i + 1 < path.length; i += 1) {
    const a = path[i];
    const b = path[i + 1];
    const left = Math.min(a.x, b.x);
    const right = Math.max(a.x, b.x);
    for (let j = i + 2; j + 1 < path.length; j += 1) {
      const c = path[j];
      const d = path[j + 1];
      // Segments whose x ranges do not overlap cannot cross; this skips most pairs.
      if (Math.max(c.x, d.x) < left || Math.min(c.x, d.x) > right) {
        continue;
      }
      if (segmentsCross(a, b, c, d)) {
        crossings += 1;
      }
    }
  }
  return crossings;
}

function guidesFor(row: PatternRow, level: PatternLinesLevel, lines: boolean, length: number): GuideLine[] {
  if (level.ruled) {
    const { unit, stroke, paleStroke, midDash, paleDash } = SHEET.ruling;
    const base = unit / 2;
    if (!lines) {
      return [{ y: base, x1: 0, x2: length, stroke, dash: null, tone: "pale" }];
    }
    return [
      { y: base - 2 * unit, x1: 0, x2: length, stroke, dash: null, tone: "muted" },
      { y: base - unit, x1: 0, x2: length, stroke, dash: midDash, tone: "muted" },
      { y: base, x1: 0, x2: length, stroke, dash: null, tone: "muted" },
      { y: base + unit, x1: 0, x2: length, stroke: paleStroke, dash: paleDash, tone: "pale" },
    ];
  }
  if (level.mode !== "dotsThenFree") {
    return [];
  }
  const half = (row.height ?? 0) / 2;
  if (!lines) {
    return [{ y: half, x1: 0, x2: length, stroke: SHEET.guides.paleStroke, dash: null, tone: "pale" }];
  }
  return [-half, half].map((y) => ({
    y,
    x1: 0,
    x2: length,
    stroke: SHEET.guides.stroke,
    dash: SHEET.guides.dash,
    tone: "muted" as const,
  }));
}

/** What is drawn for one row, in mm. The page draws exactly this and the tests check exactly this. */
export function rowGeometry(row: PatternRow, level: PatternLinesLevel, lines: boolean): RowGeometry {
  const length = rowLength();
  const repeatsShown = Math.min(row.count, repeatsShownOf(row, level));
  const guides = guidesFor(row, level, lines, length);
  if (level.ruled) {
    const path = patternPath(row.patternId, row.count, length, repeatsShown, ruledY(row.patternId));
    return {
      path,
      track: false,
      lineStroke: SHEET.patternStroke,
      dots: [],
      dotRadius: 0,
      startRing: null,
      guides,
      repeatsShown,
    };
  }
  const height = row.height ?? 0;
  const path = patternPath(row.patternId, row.count, length, repeatsShown, (p) => -(p.y - 0.5) * height);
  const spec = dotSpecFor(level.id);
  if (spec === null) {
    throw new Error(`Level ${level.id} has no dots`);
  }
  const dots = dotsOn(path, spec.spacing);
  return {
    path,
    track: true,
    lineStroke: null,
    dots,
    dotRadius: spec.radius,
    startRing: { x: path[0].x, y: path[0].y, radius: spec.radius + SHEET.startRingGap },
    guides,
    repeatsShown,
  };
}

/**
 * The dots that are too close: neighbours under the minimum, or dots of different arms with less clear space than allowed.
 * A path that crosses itself (loops and rings on level 3) has dots of two arms at the crossing by construction, so the
 * caller turns the arms check off for it.
 */
export function dotProblems(
  dots: readonly Pt[],
  radius: number,
  spacing: number,
  checkArms = true,
): ("neighbours" | "arms")[] {
  const found = new Set<"neighbours" | "arms">();
  const minimum = SHEET.minDotGap * spacing - 1e-9;
  const clearance = 2 * radius + SHEET.minArmClearance - 1e-9;
  for (let i = 0; i < dots.length; i += 1) {
    for (let j = i + 1; j < dots.length; j += 1) {
      const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
      if (j === i + 1 && d < minimum) {
        found.add("neighbours");
      }
      if (checkArms && j >= i + SHEET.minArmIndexGap && d < clearance) {
        found.add("arms");
      }
    }
  }
  return [...found];
}
