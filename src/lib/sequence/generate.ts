import { assignSequenceColors, type SequenceShapeColors } from "./colors.ts";
import type { SequenceLevel, SequenceLevelId } from "./levels.ts";
import { pick, shuffle } from "./random.ts";
import {
  followsRule,
  hypotheses,
  rowFromRule,
  SEQUENCE_NUMBER_MAX,
  shownBefore,
  type SequenceItem,
  type SequenceRuleId,
} from "./rules.ts";
import { SEQUENCE_SHAPES, type SequenceShape } from "./shapes.ts";

export interface SequenceRow {
  rule: SequenceRuleId;
  /** The full sequence, answer included. Only the fields outside `gaps` are drawn. */
  values: readonly SequenceItem[];
  /** Ascending indexes of the fields the child fills in. */
  gaps: readonly number[];
}

export interface SequenceCard {
  levelId: SequenceLevelId;
  fieldsPerRow: number;
  rows: readonly SequenceRow[];
  /** Names every row (rule and items, not the gaps or crayons), so two cards with one key show the same sequences. */
  key: string;
  /** Crayon of each shape present in `rows`. Written after the card is accepted, so it stays out of `key`. */
  shapeColors: SequenceShapeColors;
}

export type SequenceRowProblem =
  | "wrong-length"
  | "unknown-item"
  | "rule-mismatch"
  | "gap-count"
  | "last-not-gap"
  | "second-gap-outside-second-half"
  | "gap-before-rule-shown"
  | "no-answer"
  | "ambiguous"
  | "answer-mismatch";

export type SequenceProblem = SequenceRowProblem | "row-count" | "missing-rule" | "gap-row-count" | "duplicate-row";

/** Draws again at most this many times before giving up, so a single possible card cannot loop forever. */
const MAX_ATTEMPTS = 20;
/** Draws a row again at most this many times, since many draws are ambiguous at the longer, gappier levels. */
const MAX_ROW_ATTEMPTS = 50;

/** A valid card of the level whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. */
export function generateSequenceCard(
  random: () => number,
  previousKey: string | null,
  level: SequenceLevel,
): SequenceCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const card = drawSequenceCard(random, level);
    if (card !== null && card.key !== previousKey && sequenceCardProblems(card, level).length === 0) {
      return { ...card, shapeColors: assignSequenceColors(random, shapesIn(card.rows)) };
    }
  }
  return null;
}

function drawSequenceCard(random: () => number, level: SequenceLevel): Omit<SequenceCard, "shapeColors"> | null {
  const rules: SequenceRuleId[] = level.rules.flatMap(({ rule, minRows }) => Array<SequenceRuleId>(minRows).fill(rule));
  while (rules.length < level.rowCount) {
    rules.push(level.rules[pick(random, level.rules.length)].rule);
  }
  shuffle(random, rules);
  const extraGapRows = new Set(shuffle(random, [...rules.keys()]).slice(0, level.extraGapRows));

  const rows: SequenceRow[] = [];
  const taken = new Set<string>();
  for (const [index, rule] of rules.entries()) {
    const gapCount = level.gaps + (extraGapRows.has(index) ? 1 : 0);
    const row = drawRow(random, level, rule, gapCount, taken);
    if (row === null) {
      return null;
    }
    taken.add(valuesKey(row));
    rows.push(row);
  }
  return {
    levelId: level.id,
    fieldsPerRow: level.fieldsPerRow,
    rows,
    key: `${level.id}:${rows.map(valuesKey).join("|")}`,
  };
}

/** Shape identifiers in the rows, numbers left out. Order does not matter; the assignment sorts them. */
function shapesIn(rows: readonly SequenceRow[]): SequenceShape[] {
  return rows.flatMap((row) => row.values.filter((item): item is SequenceShape => typeof item === "string"));
}

/** A row of `rule` with `gapCount` gaps that passes the row rules and is not in `taken`, or null. */
function drawRow(
  random: () => number,
  level: SequenceLevel,
  rule: SequenceRuleId,
  gapCount: number,
  taken: ReadonlySet<string>,
): SequenceRow | null {
  const n = level.fieldsPerRow;
  for (let attempt = 0; attempt < MAX_ROW_ATTEMPTS; attempt += 1) {
    const row: SequenceRow = {
      rule,
      values: rowFromRule(rule, n, random),
      gaps: drawGaps(random, level, rule, gapCount),
    };
    if (!taken.has(valuesKey(row)) && sequenceRowProblems(row, level).length === 0) {
      return row;
    }
  }
  return null;
}

function drawGaps(random: () => number, level: SequenceLevel, rule: SequenceRuleId, gapCount: number): number[] {
  const n = level.fieldsPerRow;
  if (level.gapPlacement === "end") {
    if (gapCount === 1) {
      return [n - 1];
    }
    const firstOfSecondHalf = Math.ceil(n / 2);
    return [firstOfSecondHalf + pick(random, n - 1 - firstOfSecondHalf), n - 1];
  }
  const candidates = Array.from({ length: n - shownBefore(rule) }, (_, offset) => shownBefore(rule) + offset);
  return shuffle(random, candidates)
    .slice(0, gapCount)
    .sort((a, b) => a - b);
}

/** The row without its gaps: one card never shows the same sequence twice, even with the gaps in other places. */
function valuesKey(row: SequenceRow): string {
  return `${row.rule}.${row.values.join("-")}`;
}

/**
 * What the visible fields of one row allow in the gaps: the distinct tuples that the gaps take in the rows of the whole
 * list of rules (`hypotheses`) that agree with every visible field.
 */
export function sequenceAnswers(visible: readonly (SequenceItem | null)[]): {
  answers: readonly (readonly SequenceItem[])[];
} {
  const gapIndexes = visible.flatMap((item, index) => (item === null ? [index] : []));
  const answers = new Map<string, readonly SequenceItem[]>();
  for (const candidate of hypotheses(visible.length)) {
    if (visible.every((item, index) => item === null || item === candidate[index])) {
      const tuple = gapIndexes.map((index) => candidate[index]);
      answers.set(tuple.join("-"), tuple);
    }
  }
  return { answers: [...answers.values()] };
}

function isKnownItem(item: SequenceItem): boolean {
  return typeof item === "number"
    ? Number.isInteger(item) && item >= 1 && item <= SEQUENCE_NUMBER_MAX
    : (SEQUENCE_SHAPES as readonly string[]).includes(item);
}

/** The rules of one row. An empty list means the row may be shown. The answer is derived from the visible fields only. */
export function sequenceRowProblems(row: SequenceRow, level: SequenceLevel): readonly SequenceRowProblem[] {
  const n = level.fieldsPerRow;
  const problems = new Set<SequenceRowProblem>();

  if (row.values.length !== n) {
    problems.add("wrong-length");
    return [...problems];
  }
  if (!row.values.every(isKnownItem)) {
    problems.add("unknown-item");
  }
  if (!followsRule(row.rule, row.values)) {
    problems.add("rule-mismatch");
  }

  if (row.gaps.length < level.gaps || row.gaps.length > level.gaps + 1) {
    problems.add("gap-count");
  }
  const gapsWellFormed =
    row.gaps.length > 0 &&
    row.gaps.every(
      (gap, position) =>
        Number.isInteger(gap) && gap >= 0 && gap < n && (position === 0 || gap > row.gaps[position - 1]),
    );
  if (!gapsWellFormed) {
    problems.add("gap-count");
    return [...problems];
  }

  if (level.gapPlacement === "end") {
    if (row.gaps[row.gaps.length - 1] !== n - 1) {
      problems.add("last-not-gap");
    }
    if (row.gaps.length === 2 && (row.gaps[0] < Math.ceil(n / 2) || row.gaps[0] > n - 2)) {
      problems.add("second-gap-outside-second-half");
    }
  }
  if (row.gaps[0] < shownBefore(row.rule)) {
    problems.add("gap-before-rule-shown");
  }

  const visible = row.values.map((item, index) => (row.gaps.includes(index) ? null : item));
  const { answers } = sequenceAnswers(visible);
  if (answers.length === 0) {
    problems.add("no-answer");
  } else if (answers.length > 1) {
    problems.add("ambiguous");
  } else if (answers[0].some((item, position) => item !== row.values[row.gaps[position]])) {
    problems.add("answer-mismatch");
  }
  return [...problems];
}

/** The rules for a sequence card, rows included. An empty list means the card may be shown. */
export function sequenceCardProblems(
  card: Omit<SequenceCard, "shapeColors">,
  level: SequenceLevel,
): readonly SequenceProblem[] {
  const problems = new Set<SequenceProblem>();

  if (card.rows.length !== level.rowCount) {
    problems.add("row-count");
  }
  for (const { rule, minRows } of level.rules) {
    if (card.rows.filter((row) => row.rule === rule).length < minRows) {
      problems.add("missing-rule");
    }
  }
  if (card.rows.filter((row) => row.gaps.length === level.gaps + 1).length !== level.extraGapRows) {
    problems.add("gap-row-count");
  }
  const seen = new Set<string>();
  for (const row of card.rows) {
    const key = valuesKey(row);
    if (seen.has(key)) {
      problems.add("duplicate-row");
    }
    seen.add(key);
    for (const problem of sequenceRowProblems(row, level)) {
      problems.add(problem);
    }
  }
  return [...problems];
}
