import type { SequenceLevel } from "./levels.ts";
import { SEQUENCE_SHAPES, type SequenceShape } from "./shapes.ts";

export type SequencePattern = "AB" | "AAB" | "ABC";

export interface SequenceRow {
  pattern: SequencePattern;
  /** The full sequence, answer included. Only the fields outside `gaps` are drawn. */
  values: readonly SequenceShape[];
  /** Ascending indexes of the fields the child fills in. */
  gaps: readonly number[];
}

export interface SequenceCard {
  levelId: SequenceLevel["id"];
  fieldsPerRow: number;
  rows: readonly SequenceRow[];
  /** Names every row (pattern, shapes, gaps), so two cards with one key look the same. */
  key: string;
}

export type SequenceRowProblem =
  | "wrong-length"
  | "unknown-shape"
  | "pattern-mismatch"
  | "gap-count"
  | "last-not-gap"
  | "second-gap-outside-second-half"
  | "gap-before-pattern-shown"
  | "no-answer"
  | "ambiguous"
  | "answer-mismatch";

export type SequenceProblem =
  SequenceRowProblem | "row-count" | "missing-pattern" | "two-gap-row-count" | "duplicate-row";

/** Draws again at most this many times before giving up, so a single possible card cannot loop forever. */
const MAX_ATTEMPTS = 20;

/** Which distinct shape of the pattern unit sits at each position of the unit. */
const PATTERN_UNITS: Record<SequencePattern, readonly number[]> = {
  AB: [0, 1],
  AAB: [0, 0, 1],
  ABC: [0, 1, 2],
};

/** A valid card of the level whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. */
export function generateSequenceCard(
  random: () => number,
  previousKey: string | null,
  level: SequenceLevel,
): SequenceCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const card = drawSequenceCard(random, level);
    if (card.key !== previousKey && sequenceCardProblems(card, level).length === 0) {
      return card;
    }
  }
  return null;
}

function drawSequenceCard(random: () => number, level: SequenceLevel): SequenceCard {
  const n = level.fieldsPerRow;
  const patterns: SequencePattern[] = [...level.patterns];
  while (patterns.length < level.rowCount) {
    patterns.push(level.patterns[pick(random, level.patterns.length)]);
  }
  shuffle(random, patterns);
  const twoGapRows = new Set(shuffle(random, [...patterns.keys()]).slice(0, level.twoGapRows));
  const firstOfSecondHalf = Math.ceil(n / 2);

  const rows = patterns.map((pattern, index): SequenceRow => {
    const shapes = shuffle(random, [...SEQUENCE_SHAPES]);
    const unit = PATTERN_UNITS[pattern].map((slot) => shapes[slot]);
    const values = Array.from({ length: n }, (_, position) => unit[position % unit.length]);
    const secondGap = firstOfSecondHalf + pick(random, n - 1 - firstOfSecondHalf);
    return { pattern, values, gaps: twoGapRows.has(index) ? [secondGap, n - 1] : [n - 1] };
  });

  return { levelId: level.id, fieldsPerRow: n, rows, key: `${level.id}:${rows.map(rowKey).join("|")}` };
}

function rowKey(row: SequenceRow): string {
  return `${row.pattern}.${row.values.join("-")}.${row.gaps.join("-")}`;
}

/**
 * What the visible fields of one row allow in the gaps. Tries every repeating period from 1 to `maxPeriod` whose
 * visible fields agree (fields with the same index modulo the period are equal). A period gives an answer tuple when
 * every gap shares its remainder class with a visible field. `answers` holds the distinct tuples; `undetermined`
 * is true when an agreeing period leaves some gap without a visible counterpart, so any shape would fit there.
 */
export function sequenceAnswers(
  visible: readonly (SequenceShape | null)[],
  maxPeriod: number,
): { answers: readonly (readonly SequenceShape[])[]; undetermined: boolean } {
  const gapIndexes = visible.flatMap((shape, index) => (shape === null ? [index] : []));
  const answers = new Map<string, readonly SequenceShape[]>();
  let undetermined = false;

  for (let period = 1; period <= maxPeriod; period += 1) {
    const classes = new Map<number, SequenceShape>();
    let agrees = true;
    for (const [index, shape] of visible.entries()) {
      if (shape === null) {
        continue;
      }
      const known = classes.get(index % period);
      if (known !== undefined && known !== shape) {
        agrees = false;
      }
      classes.set(index % period, shape);
    }
    if (!agrees) {
      continue;
    }
    const tuple: SequenceShape[] = [];
    for (const index of gapIndexes) {
      const shape = classes.get(index % period);
      if (shape === undefined) {
        undetermined = true;
        break;
      }
      tuple.push(shape);
    }
    if (tuple.length === gapIndexes.length) {
      answers.set(tuple.join("-"), tuple);
    }
  }
  return { answers: [...answers.values()], undetermined };
}

/** The rules of one row. An empty list means the row may be shown. The answer is derived from the visible fields only. */
export function sequenceRowProblems(row: SequenceRow, n: number): readonly SequenceRowProblem[] {
  const problems = new Set<SequenceRowProblem>();

  if (row.values.length !== n) {
    problems.add("wrong-length");
    return [...problems];
  }
  if (row.values.some((shape) => !(SEQUENCE_SHAPES as readonly string[]).includes(shape))) {
    problems.add("unknown-shape");
  }

  const slots = PATTERN_UNITS[row.pattern];
  const unitShapes = new Map<number, SequenceShape>();
  slots.forEach((slot, position) => unitShapes.set(slot, row.values[position]));
  const distinct = new Set(unitShapes.values());
  const matches = row.values.every((shape, position) => shape === unitShapes.get(slots[position % slots.length]));
  if (!matches || distinct.size !== unitShapes.size) {
    problems.add("pattern-mismatch");
  }

  if (row.gaps.length < 1 || row.gaps.length > 2) {
    problems.add("gap-count");
  }
  const gapsValid =
    row.gaps.length >= 1 &&
    row.gaps.every(
      (gap, position) =>
        Number.isInteger(gap) && gap >= 0 && gap < n && (position === 0 || gap > row.gaps[position - 1]),
    );
  if (!gapsValid) {
    problems.add("gap-count");
    return [...problems];
  }

  if (row.gaps[row.gaps.length - 1] !== n - 1) {
    problems.add("last-not-gap");
  }
  if (row.gaps.length === 2 && (row.gaps[0] < Math.ceil(n / 2) || row.gaps[0] > n - 2)) {
    problems.add("second-gap-outside-second-half");
  }
  if (row.gaps[0] < slots.length) {
    problems.add("gap-before-pattern-shown");
  }

  const visible = row.values.map((shape, index) => (row.gaps.includes(index) ? null : shape));
  const { answers, undetermined } = sequenceAnswers(visible, Math.floor(n / 2));
  if (answers.length === 0 && !undetermined) {
    problems.add("no-answer");
  } else if (undetermined || answers.length > 1) {
    problems.add("ambiguous");
  } else if (answers[0].some((shape, position) => shape !== row.values[row.gaps[position]])) {
    problems.add("answer-mismatch");
  }
  return [...problems];
}

/** The rules for a sequence card, rows included. An empty list means the card may be shown. */
export function sequenceCardProblems(card: SequenceCard, level: SequenceLevel): readonly SequenceProblem[] {
  const problems = new Set<SequenceProblem>();

  if (card.rows.length !== level.rowCount) {
    problems.add("row-count");
  }
  for (const pattern of level.patterns) {
    if (!card.rows.some((row) => row.pattern === pattern)) {
      problems.add("missing-pattern");
    }
  }
  if (card.rows.filter((row) => row.gaps.length === 2).length !== level.twoGapRows) {
    problems.add("two-gap-row-count");
  }
  const seen = new Set<string>();
  for (const row of card.rows) {
    const key = rowKey(row);
    if (seen.has(key)) {
      problems.add("duplicate-row");
    }
    seen.add(key);
    for (const problem of sequenceRowProblems(row, level.fieldsPerRow)) {
      problems.add(problem);
    }
  }
  return [...problems];
}

function pick(random: () => number, count: number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}

/** Fisher-Yates, in place. Returns the same array. */
function shuffle<T>(random: () => number, items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = pick(random, index + 1);
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}
