import { pick, shuffle } from "./random.ts";
import { SEQUENCE_SHAPES, type SequenceShape } from "./shapes.ts";

/** A field of a row is a shape outline or a number. */
export type SequenceItem = SequenceShape | number;

/** Numbers on a card run from 1 to this value, so a field never holds more than two digits. */
export const SEQUENCE_NUMBER_MAX = 20;

export type SequenceRuleId = "AB" | "AAB" | "ABC" | "ABB" | "up1" | "up2" | "down1" | "mixed";

/** Which distinct shape of the unit sits at each position of a repeating pattern. */
const PATTERN_UNITS = {
  AB: [0, 1],
  AAB: [0, 0, 1],
  ABC: [0, 1, 2],
  ABB: [0, 1, 1],
} as const;

const NUMBER_STEPS = { up1: 1, up2: 2, down1: -1 } as const;

/**
 * The first field a gap may take for a rule, so that the child sees the rule at work first: a whole unit of a pattern,
 * two numbers of a number rule.
 */
const SHOWN_BEFORE: Record<SequenceRuleId, number> = {
  AB: 2,
  AAB: 3,
  ABC: 3,
  ABB: 3,
  up1: 2,
  up2: 2,
  down1: 2,
  mixed: 2,
};

/** A mixed row shows at least this many numbers, so the child can read the step of the counting from the row. */
export const MIXED_MIN_VISIBLE_NUMBERS = 2;

export function shownBefore(rule: SequenceRuleId): number {
  return SHOWN_BEFORE[rule];
}

/**
 * A full row of length `n` that follows `rule`, with its shapes and starting number drawn from `random`.
 * Number rules stay inside 1 to SEQUENCE_NUMBER_MAX.
 */
export function rowFromRule(rule: SequenceRuleId, n: number, random: () => number): SequenceItem[] {
  switch (rule) {
    case "AB":
    case "AAB":
    case "ABC":
    case "ABB": {
      const shapes = shuffle(random, [...SEQUENCE_SHAPES]);
      const unit = PATTERN_UNITS[rule].map((slot) => shapes[slot]);
      return Array.from({ length: n }, (_, position) => unit[position % unit.length]);
    }
    case "up1":
    case "up2":
    case "down1": {
      const step = NUMBER_STEPS[rule];
      const span = Math.abs(step) * (n - 1);
      const lowest = 1 + pick(random, SEQUENCE_NUMBER_MAX - span);
      return numbersFrom(step > 0 ? lowest : lowest + span, step, n);
    }
    case "mixed": {
      const shape = SEQUENCE_SHAPES[pick(random, SEQUENCE_SHAPES.length)];
      const shapeFirst = pick(random, 2) === 0;
      const numbers = shapeFirst ? Math.floor(n / 2) : Math.ceil(n / 2);
      const start = 1 + pick(random, SEQUENCE_NUMBER_MAX - numbers + 1);
      return mixedRow(shape, start, shapeFirst, n);
    }
  }
}

function numbersFrom(start: number, step: number, n: number): number[] {
  return Array.from({ length: n }, (_, position) => start + step * position);
}

/**
 * The blocks A, AB, ABB, ABBB, … joined and cut to `n` fields. Not a rule of a card: at 8 fields the growth shows only
 * in the third block, so these rows only make a row count as ambiguous when the child could read it this way.
 */
function growingGroups(a: SequenceShape, b: SequenceShape, n: number): SequenceShape[] {
  const row: SequenceShape[] = [];
  for (let repeats = 0; row.length < n; repeats += 1) {
    row.push(a, ...Array<SequenceShape>(repeats).fill(b));
  }
  return row.slice(0, n);
}

/** One shape on every other field, the fields between them counting up by one from `start`. */
function mixedRow(shape: SequenceShape, start: number, shapeFirst: boolean, n: number): SequenceItem[] {
  let next = start;
  return Array.from({ length: n }, (_, position): SequenceItem => {
    if ((position % 2 === 0) === shapeFirst) {
      return shape;
    }
    const value = next;
    next += 1;
    return value;
  });
}

/** Every ordered choice of `count` different shapes. */
function arrangements(count: number): SequenceShape[][] {
  let found: SequenceShape[][] = [[]];
  for (let slot = 0; slot < count; slot += 1) {
    found = found.flatMap((chosen) =>
      SEQUENCE_SHAPES.filter((shape) => !chosen.includes(shape)).map((shape) => [...chosen, shape]),
    );
  }
  return found;
}

/** Every row of length `n` that one rule can produce, as the rule is written in the PRD. */
function ruleSequences(rule: SequenceRuleId, n: number): SequenceItem[][] {
  switch (rule) {
    case "AB":
    case "AAB":
    case "ABC":
    case "ABB": {
      const slots = PATTERN_UNITS[rule];
      return arrangements(Math.max(...slots) + 1).map((shapes) =>
        Array.from({ length: n }, (_, position) => shapes[slots[position % slots.length]]),
      );
    }
    case "up1":
    case "up2":
    case "down1": {
      const step = NUMBER_STEPS[rule];
      const found: SequenceItem[][] = [];
      for (let start = 1; start <= SEQUENCE_NUMBER_MAX; start += 1) {
        const last = start + step * (n - 1);
        if (last >= 1 && last <= SEQUENCE_NUMBER_MAX) {
          found.push(numbersFrom(start, step, n));
        }
      }
      return found;
    }
    case "mixed": {
      const found: SequenceItem[][] = [];
      for (const shape of SEQUENCE_SHAPES) {
        for (const shapeFirst of [true, false]) {
          const numbers = shapeFirst ? Math.floor(n / 2) : Math.ceil(n / 2);
          for (let start = 1; start + numbers - 1 <= SEQUENCE_NUMBER_MAX; start += 1) {
            found.push(mixedRow(shape, start, shapeFirst, n));
          }
        }
      }
      return found;
    }
  }
}

/** Every row of shapes that repeats with a period from 1 to half its length, whether or not a rule names it. */
function periodicSequences(n: number): SequenceShape[][] {
  const found: SequenceShape[][] = [];
  for (let period = 1; period <= Math.floor(n / 2); period += 1) {
    let units: SequenceShape[][] = [[]];
    for (let slot = 0; slot < period; slot += 1) {
      units = units.flatMap((unit) => SEQUENCE_SHAPES.map((shape) => [...unit, shape]));
    }
    for (const unit of units) {
      found.push(Array.from({ length: n }, (_, position) => unit[position % period]));
    }
  }
  return found;
}

/** The first block of a growing-groups variant holds between these numbers of repeats; shorter starts read as plain AB. */
const GROUP_VARIANT_MIN_START = 2;
const GROUP_VARIANT_MAX_START = 3;

/**
 * Other ways to read growing groups: the blocks may start further along (ABB, ABBB…) and either shape may be the
 * one that grows (A, AB, AAB…). They are not rules of a card; they only make a row count as ambiguous when the child
 * could read it this way.
 */
function groupVariants(n: number): SequenceShape[][] {
  const found: SequenceShape[][] = [];
  for (const [single, growing] of arrangements(2)) {
    for (const growingFirst of [false, true]) {
      for (let start = GROUP_VARIANT_MIN_START; start <= GROUP_VARIANT_MAX_START; start += 1) {
        const row: SequenceShape[] = [];
        for (let repeats = start; row.length < n; repeats += 1) {
          const block = Array<SequenceShape>(repeats).fill(growing);
          row.push(...(growingFirst ? [...block, single] : [single, ...block]));
        }
        found.push(row.slice(0, n));
      }
    }
  }
  return found;
}

const RULE_IDS: readonly SequenceRuleId[] = ["AB", "AAB", "ABC", "ABB", "up1", "up2", "down1", "mixed"];

const hypothesisCache = new Map<number, readonly (readonly SequenceItem[])[]>();
const ruleCache = new Map<string, ReadonlySet<string>>();

/**
 * Every row of length `n` that any rule of the list could have produced: all repeating shape patterns, the number
 * rules, the growing groups and the mixed rows. A row is unambiguous when exactly one answer fits its visible fields
 * among these.
 */
export function hypotheses(n: number): readonly (readonly SequenceItem[])[] {
  let cached = hypothesisCache.get(n);
  if (cached === undefined) {
    const byKey = new Map<string, readonly SequenceItem[]>();
    const rows = [
      ...periodicSequences(n),
      ...arrangements(2).map(([a, b]) => growingGroups(a, b, n)),
      ...groupVariants(n),
      ...RULE_IDS.flatMap((rule) => ruleSequences(rule, n)),
    ];
    for (const row of rows) {
      byKey.set(row.join(","), row);
    }
    cached = [...byKey.values()];
    hypothesisCache.set(n, cached);
  }
  return cached;
}

/** The longest repeating unit the child is assumed to read from a row. */
const LONGEST_VISIBLE_PERIOD = 6;

/**
 * What the gaps take when the shapes the child sees repeat with a period longer than half the row: every field of the
 * unit is visible and at least one of them twice, so the unit can be read off the row itself. Empty when no such
 * period fits. Rows with a number among the visible fields are never read this way.
 */
export function visiblePeriodReadings(visible: readonly (SequenceItem | null)[]): SequenceItem[][] {
  const n = visible.length;
  if (visible.some((item) => typeof item === "number")) {
    return [];
  }
  const readings: SequenceItem[][] = [];
  for (let period = Math.floor(n / 2) + 1; period <= Math.min(LONGEST_VISIBLE_PERIOD, n - 1); period += 1) {
    const unit: (SequenceItem | undefined)[] = Array<SequenceItem | undefined>(period).fill(undefined);
    const seen = Array<number>(period).fill(0);
    let consistent = true;
    for (const [position, item] of visible.entries()) {
      if (item === null) {
        continue;
      }
      const slot = position % period;
      if (unit[slot] !== undefined && unit[slot] !== item) {
        consistent = false;
        break;
      }
      unit[slot] = item;
      seen[slot] += 1;
    }
    if (consistent && seen.every((count) => count > 0) && seen.some((count) => count > 1)) {
      const resolved = unit.filter((item): item is SequenceItem => item !== undefined);
      readings.push(visible.map((_, position) => resolved[position % period]));
    }
  }
  return readings;
}

/** True when `values` is a row that `rule` can produce at its length. */
export function followsRule(rule: SequenceRuleId, values: readonly SequenceItem[]): boolean {
  const cacheKey = `${rule}:${values.length}`;
  let keys = ruleCache.get(cacheKey);
  if (keys === undefined) {
    keys = new Set(ruleSequences(rule, values.length).map((row) => row.join(",")));
    ruleCache.set(cacheKey, keys);
  }
  return keys.has(values.join(","));
}
