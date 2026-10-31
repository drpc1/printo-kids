import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  followsRule,
  hypotheses,
  rowFromRule,
  SEQUENCE_NUMBER_MAX,
  shownBefore,
  visiblePeriodReadings,
  type SequenceItem,
  type SequenceRuleId,
} from "./rules.ts";
import { SEQUENCE_SHAPES, type SequenceShape } from "./shapes.ts";

// Direct tests of the row rules. The expected rows are written here from the PRD ("Karta sekwencji"), not read from
// rules.ts.

const [A, B, C] = SEQUENCE_SHAPES;
const RULES: readonly SequenceRuleId[] = ["AB", "AAB", "ABC", "ABB", "up1", "up2", "down1", "mixed"];
const LENGTHS = [5, 7, 8] as const;

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PATTERNS: Record<"AB" | "AAB" | "ABC" | "ABB", readonly number[]> = {
  AB: [0, 1],
  AAB: [0, 0, 1],
  ABC: [0, 1, 2],
  ABB: [0, 1, 1],
};
const STEPS = { up1: 1, up2: 2, down1: -1 } as const;

/** What a row of the rule must look like, checked field by field. */
function describesRule(rule: SequenceRuleId, row: readonly SequenceItem[]): string | null {
  const n = row.length;
  if (rule === "AB" || rule === "AAB" || rule === "ABC" || rule === "ABB") {
    const slots = PATTERNS[rule];
    const shapes = new Map<number, SequenceItem>();
    for (let index = 0; index < n; index += 1) {
      const slot = slots[index % slots.length];
      const seen = shapes.get(slot);
      if (typeof row[index] !== "string") return `field ${index} is not a shape`;
      if (seen !== undefined && seen !== row[index]) return `field ${index} breaks the pattern`;
      shapes.set(slot, row[index]);
    }
    if (new Set(shapes.values()).size !== shapes.size) return "two units share a shape";
    return null;
  }
  if (rule === "mixed") {
    const shapeFields = row.flatMap((item, index) => (typeof item === "string" ? [index] : []));
    const numbers = row.filter((item): item is number => typeof item === "number");
    if (new Set(shapeFields.map((index) => row[index])).size !== 1) return "not one shape";
    if (shapeFields.some((index) => index % 2 !== shapeFields[0] % 2)) return "shape fields do not alternate";
    if (shapeFields.length + numbers.length !== n || Math.abs(shapeFields.length - numbers.length) > 1) {
      return "shapes and numbers do not alternate";
    }
    if (numbers.some((value, index) => index > 0 && value !== numbers[index - 1] + 1)) return "numbers do not count up";
    return numbers.every((value) => Number.isInteger(value) && value >= 1 && value <= SEQUENCE_NUMBER_MAX)
      ? null
      : "number out of range";
  }
  const step = STEPS[rule];
  for (let index = 0; index < n; index += 1) {
    const value = row[index];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > SEQUENCE_NUMBER_MAX) {
      return `field ${index} is not a number from 1 to ${SEQUENCE_NUMBER_MAX}`;
    }
    if (index > 0 && value - (row[index - 1] as number) !== step) return `field ${index} is not a step of ${step}`;
  }
  return null;
}

void describe("rowFromRule", () => {
  void test("every rule gives a row of the asked length that follows it, for many seeds and lengths", () => {
    for (const rule of RULES) {
      for (const n of LENGTHS) {
        for (let seed = 1; seed <= 60; seed += 1) {
          const row = rowFromRule(rule, n, mulberry32(seed));

          assert.equal(row.length, n, `${rule} ${n}`);
          assert.equal(describesRule(rule, row), null, `${rule} ${n} seed ${seed}: ${row.join(",")}`);
        }
      }
    }
  });

  void test("number rows reach both ends of 1 to 20 and a mixed row reaches 20", () => {
    for (const [rule, n] of [
      ["up1", 8],
      ["up2", 7],
      ["down1", 8],
      ["mixed", 8],
      ["mixed", 7],
    ] as const) {
      const numbers = new Set<number>();
      for (let seed = 1; seed <= 400; seed += 1) {
        for (const item of rowFromRule(rule, n, mulberry32(seed))) {
          if (typeof item === "number") numbers.add(item);
        }
      }

      assert.ok(numbers.has(SEQUENCE_NUMBER_MAX), `${rule} ${n} reaches 20`);
      assert.ok(numbers.has(1), `${rule} ${n} reaches 1`);
    }
  });

  void test("a mixed row starts with a shape for some seeds and with a number for others", () => {
    const starts = new Set<string>();
    for (let seed = 1; seed <= 60; seed += 1) {
      starts.add(typeof rowFromRule("mixed", 8, mulberry32(seed))[0]);
    }

    assert.deepEqual([...starts].sort(), ["number", "string"]);
  });

  void test("pattern rows draw every shape of the catalog across seeds", () => {
    const seen = new Set<SequenceItem>();
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const item of rowFromRule("ABC", 8, mulberry32(seed))) seen.add(item);
      for (const item of rowFromRule("AB", 5, mulberry32(seed))) seen.add(item);
    }

    assert.deepEqual([...seen].sort(), [...SEQUENCE_SHAPES].sort());
  });
});

void describe("shownBefore", () => {
  void test("a pattern shows a whole unit before its first gap and a number rule shows two numbers", () => {
    assert.deepEqual(
      RULES.map((rule) => shownBefore(rule)),
      [2, 3, 3, 3, 2, 2, 2, 2],
    );
  });
});

void describe("followsRule", () => {
  void test("accepts hand-written rows of every rule", () => {
    assert.ok(followsRule("AB", [A, B, A, B, A]));
    assert.ok(followsRule("AAB", [A, A, B, A, A, B, A]));
    assert.ok(followsRule("ABC", [A, B, C, A, B, C, A, B]));
    assert.ok(followsRule("ABB", [A, B, B, A, B, B, A, B]));
    assert.ok(followsRule("up1", [3, 4, 5, 6, 7]));
    assert.ok(followsRule("up2", [1, 3, 5, 7, 9, 11, 13]));
    assert.ok(followsRule("down1", [20, 19, 18, 17, 16, 15, 14, 13]));
    assert.ok(followsRule("mixed", [A, 4, A, 5, A, 6, A, 7]));
    assert.ok(followsRule("mixed", [4, A, 5, A, 6, A, 7]));
  });

  void test("rejects rows that break the rule in one field", () => {
    assert.ok(!followsRule("AB", [A, A, A, A, A]));
    assert.ok(!followsRule("AB", [A, B, A, B, B]));
    assert.ok(!followsRule("AAB", [A, B, A, A, B, A, A]));
    assert.ok(!followsRule("ABC", [A, B, C, A, B, A, B, C]));
    assert.ok(!followsRule("ABB", [A, B, A, A, B, B, A, B]));
    assert.ok(!followsRule("up1", [3, 4, 5, 6, 8]));
    assert.ok(!followsRule("up1", [7, 6, 5, 4, 3]));
    assert.ok(!followsRule("up2", [1, 2, 3, 4, 5, 6, 7]));
    assert.ok(!followsRule("down1", [13, 14, 15, 16, 17, 18, 19, 20]));
    assert.ok(!followsRule("down1", [21, 20, 19, 18, 17, 16, 15, 14]));
    assert.ok(!followsRule("up1", [14, 15, 16, 17, 18, 19, 20, 21]));
    assert.ok(!followsRule("mixed", [A, 4, A, 6, A, 8, A, 10]));
    assert.ok(!followsRule("mixed", [A, 4, B, 5, A, 6, A, 7]));
  });

  void test("answers for one length do not leak into another length of the same rule", () => {
    assert.ok(followsRule("AB", [A, B, A, B, A]));
    assert.ok(followsRule("AB", [A, B, A, B, A, B, A]));
    assert.ok(!followsRule("AB", [A, B, A, B, A, A, A]));
    assert.ok(followsRule("up1", [1, 2, 3, 4, 5]));
    assert.ok(followsRule("up1", [13, 14, 15, 16, 17, 18, 19, 20]));
    assert.ok(!followsRule("up1", [14, 15, 16, 17, 18, 19, 20, 21]));
  });

  void test("every row rowFromRule draws follows its rule and no other number rule", () => {
    for (const rule of RULES) {
      for (let seed = 1; seed <= 30; seed += 1) {
        assert.ok(followsRule(rule, rowFromRule(rule, 8, mulberry32(seed))), `${rule} ${seed}`);
      }
    }
    assert.ok(!followsRule("up2", rowFromRule("up1", 8, mulberry32(1))));
    assert.ok(!followsRule("down1", rowFromRule("up1", 8, mulberry32(1))));
  });
});

/** Every row any reading of the PRD can give at length `n`, built here independently. */
function expectedHypotheses(n: number): Set<string> {
  const rows: SequenceItem[][] = [];
  const shapes = SEQUENCE_SHAPES;
  const pairs = shapes.flatMap((a) => shapes.filter((b) => b !== a).map((b) => [a, b] as const));
  const triples = pairs.flatMap(([a, b]) => shapes.filter((c) => c !== a && c !== b).map((c) => [a, b, c] as const));

  // Shapes repeating with a period from 1 to half the row.
  const units = (length: number): SequenceShape[][] =>
    length === 0 ? [[]] : units(length - 1).flatMap((unit) => shapes.map((shape) => [...unit, shape]));
  for (let period = 1; period <= Math.floor(n / 2); period += 1) {
    for (const unit of units(period)) rows.push(Array.from({ length: n }, (_, index) => unit[index % period]));
  }
  // The named unit patterns with distinct shapes (already periodic, kept for clarity).
  for (const [a, b] of pairs) {
    rows.push(Array.from({ length: n }, (_, index) => (index % 2 === 0 ? a : b)));
    // Growing groups A, AB, ABB, ... cut to n.
    const growing: SequenceShape[] = [];
    for (let repeats = 0; growing.length < n; repeats += 1) growing.push(a, ...Array<SequenceShape>(repeats).fill(b));
    rows.push(growing.slice(0, n));
    // Later starts, either shape growing: ABB ABBB ... and BB A, BBB A, ...
    for (const start of [2, 3]) {
      for (const growingFirst of [false, true]) {
        const row: SequenceShape[] = [];
        for (let repeats = start; row.length < n; repeats += 1) {
          const block = Array<SequenceShape>(repeats).fill(b);
          row.push(...(growingFirst ? [...block, a] : [a, ...block]));
        }
        rows.push(row.slice(0, n));
      }
    }
  }
  for (const [a, b] of pairs) {
    rows.push(Array.from({ length: n }, (_, index) => [a, b, b][index % 3]));
  }
  for (const [a, b, c] of triples) {
    rows.push(Array.from({ length: n }, (_, index) => [a, b, c][index % 3]));
    rows.push(Array.from({ length: n }, (_, index) => [a, a, b][index % 3]));
  }
  // Numbers: up by 1, up by 2, down by 1, wholly inside 1 to 20.
  for (const step of [1, 2, -1]) {
    for (let start = 1; start <= SEQUENCE_NUMBER_MAX; start += 1) {
      const last = start + step * (n - 1);
      if (last >= 1 && last <= SEQUENCE_NUMBER_MAX) {
        rows.push(Array.from({ length: n }, (_, index) => start + step * index));
      }
    }
  }
  // Mixed: one shape on every other field, counting between.
  for (const shape of shapes) {
    for (const shapeFirst of [true, false]) {
      const count = shapeFirst ? Math.floor(n / 2) : Math.ceil(n / 2);
      for (let start = 1; start + count - 1 <= SEQUENCE_NUMBER_MAX; start += 1) {
        let next = start;
        rows.push(Array.from({ length: n }, (_, index) => ((index % 2 === 0) === shapeFirst ? shape : next++)));
      }
    }
  }
  return new Set(rows.map((row) => row.join(",")));
}

void describe("hypotheses", () => {
  void test("holds exactly the rows the PRD lists, for the three row lengths of the levels", () => {
    for (const n of LENGTHS) {
      const actual = new Set(hypotheses(n).map((row) => row.join(",")));
      const expected = expectedHypotheses(n);

      assert.equal(hypotheses(n).length, actual.size, `${n} has no duplicates`);
      assert.deepEqual([...actual].filter((key) => !expected.has(key)).slice(0, 3), [], `${n}: rows nobody asked for`);
      assert.deepEqual([...expected].filter((key) => !actual.has(key)).slice(0, 3), [], `${n}: rows that are missing`);
    }
  });

  void test("the growing groups of the PRD are in it, written out by hand for 8 fields", () => {
    const keys = new Set(hypotheses(8).map((row) => row.join(",")));

    assert.ok(keys.has([A, A, B, A, B, B, A, B].join(",")), "A AB ABB ABBB cut to 8");
    assert.ok(keys.has([A, B, B, A, B, B, B, A].join(",")), "ABB ABBB A");
    assert.ok(keys.has([B, B, A, B, B, B, A, B].join(",")), "BBA BBBA B");
    assert.ok(keys.has([A, B, B, B, A, B, B, B].join(",")), "ABBB ABBB");
    assert.ok(!keys.has([A, B, A, A, B, C, A, B].join(",")), "not a reading");
  });

  void test("asking twice gives the same rows and a different length gives rows of that length", () => {
    assert.equal(hypotheses(8), hypotheses(8));
    assert.ok(hypotheses(5).every((row) => row.length === 5));
    assert.ok(hypotheses(7).every((row) => row.length === 7));
    assert.ok(hypotheses(8).every((row) => row.length === 8));
  });
});

void describe("visiblePeriodReadings", () => {
  void test("a unit longer than half the row, read off the row itself", () => {
    const readings = visiblePeriodReadings([A, B, C, SEQUENCE_SHAPES[3], A, B, null]);

    assert.deepEqual(readings, [[A, B, C, SEQUENCE_SHAPES[3], A, B, C]]);
  });

  void test("a row with a number among the visible fields has no reading", () => {
    assert.deepEqual(visiblePeriodReadings([A, B, C, SEQUENCE_SHAPES[3], A, B, 3]), []);
    assert.deepEqual(visiblePeriodReadings([1, 2, 3, 4, 1, 2, null]), []);
  });

  void test("a unit field that is hidden, or a unit seen once only, gives no reading", () => {
    assert.deepEqual(visiblePeriodReadings([A, B, null, SEQUENCE_SHAPES[3], A, B, null]), []);
    assert.deepEqual(
      visiblePeriodReadings([A, B, C, SEQUENCE_SHAPES[3], SEQUENCE_SHAPES[4], SEQUENCE_SHAPES[5], null]),
      [],
    );
  });

  void test("visible fields that disagree with a period give no reading for it", () => {
    assert.deepEqual(visiblePeriodReadings([A, B, C, A, B, C, null]), []);
  });

  void test("periods of five and six are read, and the row length bounds them", () => {
    const [, , , D, E, F] = SEQUENCE_SHAPES;
    // Period 5 in 8 fields: A B C D E A B C, the last field hidden.
    assert.deepEqual(visiblePeriodReadings([A, B, C, D, E, A, B, null]), [[A, B, C, D, E, A, B, C]]);
    // Period 6 in 8 fields.
    assert.deepEqual(visiblePeriodReadings([A, B, C, D, E, F, A, null]), [[A, B, C, D, E, F, A, B]]);
  });
});
