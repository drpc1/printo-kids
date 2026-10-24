import { pick, shuffle } from "./random.ts";
import { SEQUENCE_SHAPES, type SequenceShape } from "./shapes.ts";

/** A field of a row is a shape outline or a number. */
export type SequenceItem = SequenceShape | number;

/** Numbers on a card run from 1 to this value, so a field never holds more than two digits. */
export const SEQUENCE_NUMBER_MAX = 20;

export type SequenceRuleId = "AB" | "AAB" | "ABC" | "up1" | "up2" | "down1" | "groups" | "mixed";

/** Which distinct shape of the unit sits at each position of a repeating pattern. */
const PATTERN_UNITS = {
  AB: [0, 1],
  AAB: [0, 0, 1],
  ABC: [0, 1, 2],
} as const;

const NUMBER_STEPS = { up1: 1, up2: 2, down1: -1 } as const;

/**
 * The first field a gap may take for a rule, so that the child sees the rule at work first: a whole unit of a pattern,
 * two numbers of a number rule, the blocks A and AB of the growing groups.
 */
const SHOWN_BEFORE: Record<SequenceRuleId, number> = {
  AB: 2,
  AAB: 3,
  ABC: 3,
  up1: 2,
  up2: 2,
  down1: 2,
  groups: 3,
  mixed: 2,
};

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
    case "ABC": {
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
    case "groups": {
      const [a, b] = shuffle(random, [...SEQUENCE_SHAPES]);
      return growingGroups(a, b, n);
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

/** The blocks A, AB, ABB, ABBB, … joined and cut to `n` fields. */
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
    case "ABC": {
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
    case "groups":
      return arrangements(2).map(([a, b]) => growingGroups(a, b, n));
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

const RULE_IDS: readonly SequenceRuleId[] = ["AB", "AAB", "ABC", "up1", "up2", "down1", "groups", "mixed"];

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
    for (const row of [...periodicSequences(n), ...RULE_IDS.flatMap((rule) => ruleSequences(rule, n))]) {
      byKey.set(row.join(","), row);
    }
    cached = [...byKey.values()];
    hypothesisCache.set(n, cached);
  }
  return cached;
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
