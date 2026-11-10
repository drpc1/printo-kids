import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { patternLinesKey, patternLinesProblems, type PatternLinesCard, type PatternRow } from "./card.ts";
import { patternLinesLevelById, type PatternLinesLevelId } from "./levels.ts";

function card(levelId: PatternLinesLevelId, rows: PatternRow[]): PatternLinesCard {
  return { levelId, rows, key: patternLinesKey(levelId, rows) };
}

const GOOD_2: PatternRow[] = [
  { patternId: "wave", period: 36, height: 10, count: 5 },
  { patternId: "zigzag", period: 36, height: 10, count: 5 },
  { patternId: "arcs", period: 36, height: 10, count: 5 },
  { patternId: "cups", period: 36, height: 10, count: 5 },
  { patternId: "stairs", period: 36, height: 10, count: 5 },
];
const GOOD_3: PatternRow[] = [
  { patternId: "zigzag", period: 26, height: 12, count: 7, traced: 2 },
  { patternId: "wave", period: 26, height: 12, count: 7, traced: 2 },
  { patternId: "arcs", period: 26, height: 12, count: 7, traced: 2 },
  { patternId: "cups", period: 26, height: 12, count: 7, traced: 2 },
  { patternId: "stairs", period: 26, height: 10, count: 7, traced: 2 },
  { patternId: "saw", period: 26, height: 10, count: 7, traced: 2 },
];
const GOOD_4: PatternRow[] = ["loops", "snails", "doubleArc", "saw", "trapez", "tallShort", "loopsDown"].map((id) => ({
  patternId: id as PatternRow["patternId"],
  period: 16,
  count: 11,
  traced: 4,
}));

const codes = (c: PatternLinesCard): readonly string[] =>
  patternLinesProblems(c, patternLinesLevelById(c.levelId)).slice().sort();

void describe("patternLinesProblems", () => {
  void test("good cards of levels 2, 3 and 4 have no problems", () => {
    assert.deepEqual(codes(card("poziom2", GOOD_2)), []);
    assert.deepEqual(codes(card("poziom3", GOOD_3)), []);
    assert.deepEqual(codes(card("poziom4", GOOD_4)), []);
  });

  void test("a repeated pattern", () => {
    const rows = [...GOOD_2.slice(0, 4), GOOD_2[0]];
    assert.deepEqual(codes(card("poziom2", rows)), ["duplicate-pattern"]);
  });

  void test("a pattern outside the pool of the level", () => {
    const rows = [...GOOD_2.slice(0, 4), { patternId: "loops" as const, period: 36, height: 10, count: 5 }];
    assert.ok(codes(card("poziom2", rows)).includes("not-in-pool"));
  });

  void test("the wrong number of rows", () => {
    assert.deepEqual(codes(card("poziom2", GOOD_2.slice(0, 4))), ["row-count"]);
  });

  void test("a card of another level", () => {
    const c = card("poziom2", GOOD_2);
    assert.ok(patternLinesProblems(c, patternLinesLevelById("poziom1")).includes("level-mismatch"));
  });

  void test("a crossing on level 2, but not on level 3, where the loops of the dotted part may cross", () => {
    const rows = [{ patternId: "loops" as const, period: 36, height: 10, count: 5 }, ...GOOD_2.slice(1)];
    assert.ok(codes(card("poziom2", rows)).includes("crossing"));
    const loops3 = [{ patternId: "loops" as const, period: 26, height: 12, count: 7, traced: 2 }, ...GOOD_3.slice(1)];
    assert.deepEqual(codes(card("poziom3", loops3)), []);
  });

  void test("dots that run together", () => {
    const rows = [{ patternId: "zigzag" as const, period: 2.3, height: 10, count: 80 }, ...GOOD_2.slice(1)];
    assert.ok(codes(card("poziom2", rows)).includes("dots-too-close"));
  });

  void test("level 3 with three dotted repeats, level 4 with two drawn ones, level 2 with a dotted count", () => {
    const three = [{ ...GOOD_3[0], traced: 3 }, ...GOOD_3.slice(1)];
    assert.deepEqual(codes(card("poziom3", three)), ["trace-repeats"]);
    const two = [{ ...GOOD_4[0], traced: 2 }, ...GOOD_4.slice(1)];
    assert.deepEqual(codes(card("poziom4", two)), ["trace-repeats"]);
    const stray = [{ ...GOOD_2[0], traced: 2 }, ...GOOD_2.slice(1)];
    assert.deepEqual(codes(card("poziom2", stray)), ["trace-repeats"]);
  });

  void test("a pattern taller than its row, or without a height on levels 1-3", () => {
    const tall = [{ ...GOOD_3[0], height: 40 }, ...GOOD_3.slice(1)];
    assert.deepEqual(codes(card("poziom3", tall)), ["out-of-row"]);
    const flat = [{ patternId: "zigzag" as const, period: 26, count: 7, traced: 2 }, ...GOOD_3.slice(1)];
    assert.deepEqual(codes(card("poziom3", flat)), ["out-of-row"]);
  });

  void test("a pattern that starts or ends outside the row", () => {
    // 20 repeats of a 36 mm step cannot be: the row is 184 mm long, so a larger count still fits; a count of 0 breaks it.
    const rows = [{ ...GOOD_2[0], count: 0 }, ...GOOD_2.slice(1)];
    assert.ok(codes(card("poziom2", rows)).includes("out-of-row"));
  });

  void test("the key names level, pattern, step and (levels 1-3) height, rounded to 0.1 mm, in order", () => {
    const rows: PatternRow[] = [
      { patternId: "wave", period: 36.04, height: 10.06, count: 5 },
      { patternId: "loops", period: 16, count: 11, traced: 4 },
    ];
    assert.equal(patternLinesKey("poziom3", rows), "poziom3:wave@36.0x10.1|loops@16.0");
    const reversed = [rows[1], rows[0]];
    assert.notEqual(patternLinesKey("poziom3", reversed), patternLinesKey("poziom3", rows));
  });

  void test("the key does not hold the repeat counts that Linie or the character could change", () => {
    const a = patternLinesKey("poziom3", GOOD_3);
    const b = patternLinesKey(
      "poziom3",
      GOOD_3.map((row) => ({ ...row })),
    );
    assert.equal(a, b);
  });
});
