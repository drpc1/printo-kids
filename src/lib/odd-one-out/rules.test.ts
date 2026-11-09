// The rules are checked against rows written by hand, so the test does not repeat the code under test.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { SudokuShapeId } from "../sudoku/shapes.ts";
import { oddOneOutLevelById } from "./levels.ts";
import {
  oddOneOutCardProblems,
  oddOneOutRowProblems,
  type OddCrayon,
  type OddItem,
  type OddOneOutCard,
  type OddRow,
  type OddRule,
} from "./rules.ts";

function shape(id: SudokuShapeId, size: "big" | "small" = "big", count = 1, crayon: OddCrayon | null = null): OddItem {
  return { shape: id, icon: null, size, count, crayon };
}

function icon(id: string, size: "big" | "small" = "big"): OddItem {
  return { shape: null, icon: id, size, count: 1, crayon: null };
}

function row(rule: OddRule, answer: number, ...items: OddItem[]): OddRow {
  return { rule, items, answer };
}

void describe("oddOneOutRowProblems: good rows", () => {
  void test("shape rule: one heart among circles", () => {
    const items = [shape("circle"), shape("circle"), shape("circle"), shape("heart")];
    assert.deepEqual(oddOneOutRowProblems(row("shape", 3, ...items), false), []);
  });

  void test("size rule: one small circle among big ones", () => {
    const items = [shape("circle"), shape("circle"), shape("circle", "small"), shape("circle")];
    assert.deepEqual(oddOneOutRowProblems(row("size", 2, ...items), false), []);
  });

  void test("count rule: groups of 2 and one group of 3", () => {
    const items = [
      shape("heart", "big", 2),
      shape("heart", "big", 2),
      shape("heart", "big", 2),
      shape("heart", "big", 3),
      shape("heart", "big", 2),
    ];
    assert.deepEqual(oddOneOutRowProblems(row("count", 3, ...items), false), []);
  });

  void test("color rule: one blue square among red ones", () => {
    const red = shape("square", "big", 1, "red");
    const items = [red, shape("square", "big", 1, "blue"), red, red, red];
    assert.deepEqual(oddOneOutRowProblems(row("color", 1, ...items), true), []);
  });

  void test("category rule: one fruit among four animals", () => {
    const items = [icon("kot"), icon("jablko"), icon("ryba"), icon("ptak"), icon("zolw")];
    assert.deepEqual(oddOneOutRowProblems(row("category", 1, ...items), false), []);
  });

  void test("category rule: sizes in pairs are a distractor, not an answer", () => {
    // Two small, three big: no size stands alone.
    const items = [icon("kot"), icon("ryba", "small"), icon("ptak"), icon("jablko", "small"), icon("zolw")];
    assert.deepEqual(oddOneOutRowProblems(row("category", 3, ...items), false), []);
  });

  void test("a size distractor in pairs does not point at anything", () => {
    const items = [
      shape("square", "big"),
      shape("square", "small"),
      shape("cross", "big"),
      shape("square", "small"),
      shape("square", "big"),
    ];
    assert.deepEqual(oddOneOutRowProblems(row("shape", 2, ...items), false), []);
  });
});

void describe("oddOneOutRowProblems: bad rows", () => {
  void test("two pictures that stand alone in the rule are ambiguous", () => {
    const items = [shape("circle"), shape("circle"), shape("heart"), shape("cross"), shape("circle")];
    assert.ok(oddOneOutRowProblems(row("shape", 2, ...items), false).includes("ambiguous-row"));
  });

  void test("no picture standing alone in the rule is ambiguous", () => {
    const items = [shape("circle"), shape("circle"), shape("heart"), shape("heart")];
    assert.ok(oddOneOutRowProblems(row("shape", 0, ...items), false).includes("ambiguous-row"));
  });

  void test("a distractor with a lone picture is ambiguous", () => {
    // The heart is the answer, but the small circle is alone in size, so a child could pick it too.
    const items = [shape("circle"), shape("circle"), shape("circle", "small"), shape("heart"), shape("circle")];
    assert.ok(oddOneOutRowProblems(row("shape", 3, ...items), false).includes("ambiguous-row"));
  });

  void test("a crayon that stands alone is ambiguous in a shape row", () => {
    const items = [
      shape("circle", "big", 1, "red"),
      shape("circle", "big", 1, "red"),
      shape("circle", "big", 1, "blue"),
      shape("heart", "big", 1, "red"),
    ];
    assert.ok(oddOneOutRowProblems(row("shape", 3, ...items), true).includes("ambiguous-row"));
  });

  void test("the answer must be the picture that stands alone", () => {
    const items = [shape("circle"), shape("circle"), shape("circle"), shape("heart")];
    assert.deepEqual(oddOneOutRowProblems(row("shape", 0, ...items), false), ["answer"]);
  });

  void test("a crayon with colors off", () => {
    const items = [shape("circle"), shape("circle"), shape("circle", "big", 1, "red"), shape("heart")];
    assert.ok(oddOneOutRowProblems(row("shape", 3, ...items), false).includes("crayon-without-colors"));
  });

  void test("a shape without a crayon with colors on", () => {
    const items = [shape("circle"), shape("circle"), shape("circle"), shape("heart")];
    assert.ok(oddOneOutRowProblems(row("shape", 3, ...items), true).includes("crayon-missing"));
  });

  void test("a group of 7 or 0 is out of range", () => {
    const seven = [shape("heart", "big", 7), shape("heart", "big", 7), shape("heart", "big", 6)];
    assert.ok(oddOneOutRowProblems(row("count", 2, ...seven), false).includes("count-range"));
    const zero = [shape("heart", "big", 1), shape("heart", "big", 1), shape("heart", "big", 0)];
    assert.ok(oddOneOutRowProblems(row("count", 2, ...zero), false).includes("count-range"));
  });

  void test("an icon in a shape row", () => {
    const items = [shape("circle"), shape("circle"), shape("circle"), icon("kot")];
    assert.ok(oddOneOutRowProblems(row("shape", 3, ...items), false).includes("item-kind"));
  });

  void test("a picture that is a shape and an icon, or neither", () => {
    const both: OddItem = { shape: "circle", icon: "kot", size: "big", count: 1, crayon: null };
    const neither: OddItem = { shape: null, icon: null, size: "big", count: 1, crayon: null };
    assert.ok(oddOneOutRowProblems(row("shape", 0, both, shape("heart"), shape("heart")), false).includes("item-kind"));
    assert.ok(
      oddOneOutRowProblems(row("shape", 0, neither, shape("heart"), shape("heart")), false).includes("item-kind"),
    );
  });

  void test("an unknown icon id", () => {
    const items = [icon("kot"), icon("ryba"), icon("ptak"), icon("nie ma")];
    assert.ok(oddOneOutRowProblems(row("category", 3, ...items), false).includes("item-kind"));
  });

  void test("a category row where two icons are from the other category", () => {
    const items = [icon("kot"), icon("ryba"), icon("ptak"), icon("jablko"), icon("banan")];
    const problems = oddOneOutRowProblems(row("category", 3, ...items), false);
    assert.ok(problems.includes("category-row"));
    assert.ok(problems.includes("ambiguous-row"));
  });

  void test("a category row that repeats an icon", () => {
    const items = [icon("kot"), icon("kot", "small"), icon("ryba"), icon("jablko")];
    assert.ok(oddOneOutRowProblems(row("category", 3, ...items), false).includes("category-row"));
  });

  void test("a category row of shapes", () => {
    const items = [shape("circle"), shape("circle"), shape("circle"), shape("heart")];
    assert.ok(oddOneOutRowProblems(row("category", 3, ...items), false).includes("category-row"));
  });
});

const latwy = oddOneOutLevelById("latwy");

// A whole easy card: five rows alternating shape and size, written by hand.
const SHAPE_ROWS = [
  row("shape", 3, shape("circle"), shape("circle"), shape("circle"), shape("heart")),
  row("shape", 2, shape("square"), shape("square"), shape("cross"), shape("square")),
  row("shape", 1, shape("heart"), shape("triangle"), shape("heart"), shape("heart")),
];
const SIZE_ROWS = [
  row("size", 2, shape("circle"), shape("circle"), shape("circle", "small"), shape("circle")),
  row("size", 3, shape("heart", "small"), shape("heart", "small"), shape("heart", "small"), shape("heart")),
];

function goodCard(): OddOneOutCard {
  return {
    levelId: "latwy",
    colors: false,
    rows: [SHAPE_ROWS[0], SIZE_ROWS[0], SHAPE_ROWS[1], SIZE_ROWS[1], SHAPE_ROWS[2]],
    key: "hand",
  };
}

void describe("oddOneOutCardProblems", () => {
  void test("a good easy card has no problems", () => {
    assert.deepEqual(oddOneOutCardProblems(goodCard(), latwy, false), []);
  });

  void test("with colors on every shape needs a crayon", () => {
    const problems = oddOneOutCardProblems({ ...goodCard(), colors: true }, latwy, true);
    assert.deepEqual([...problems].sort(), ["crayon-missing"]);
  });

  void test("the level and colors of the card must match the settings", () => {
    assert.ok(oddOneOutCardProblems({ ...goodCard(), levelId: "sredni" }, latwy, false).includes("settings"));
    assert.ok(oddOneOutCardProblems({ ...goodCard(), colors: true }, latwy, false).includes("settings"));
  });

  void test("a missing row, a short row and a rule the level does not have", () => {
    const rows = goodCard().rows;
    assert.ok(oddOneOutCardProblems({ ...goodCard(), rows: rows.slice(0, 4) }, latwy, false).includes("row-count"));
    const shortRow = row("shape", 2, shape("circle"), shape("circle"), shape("heart"));
    const withShort = { ...goodCard(), rows: [shortRow, ...rows.slice(1)] };
    assert.ok(oddOneOutCardProblems(withShort, latwy, false).includes("row-size"));
    const counted = row(
      "count",
      3,
      shape("heart", "big", 2),
      shape("heart", "big", 2),
      shape("heart", "big", 2),
      shape("heart", "big", 3),
    );
    const withCount = { ...goodCard(), rows: [counted, ...rows.slice(1)] };
    assert.ok(oddOneOutCardProblems(withCount, latwy, false).includes("rule-not-in-level"));
  });

  void test("every rule of the level must show at least once", () => {
    // Five shape rows and no size row; neighbours match as well.
    const extra = [
      row("shape", 0, shape("cross"), shape("heart"), shape("heart"), shape("heart")),
      row("shape", 1, shape("circle"), shape("square"), shape("circle"), shape("circle")),
    ];
    const rows = [...SHAPE_ROWS, ...extra];
    const problems = oddOneOutCardProblems({ ...goodCard(), rows }, latwy, false);
    assert.ok(problems.includes("missing-rule"));
    assert.ok(problems.includes("adjacent-rule"));
  });

  void test("two neighbours with one rule", () => {
    const rows = [SHAPE_ROWS[0], SHAPE_ROWS[1], SIZE_ROWS[0], SIZE_ROWS[1], SHAPE_ROWS[2]];
    assert.deepEqual(oddOneOutCardProblems({ ...goodCard(), rows }, latwy, false), ["adjacent-rule"]);
  });

  void test("the same row twice, also with its pictures in another order", () => {
    const rows = [SHAPE_ROWS[0], SIZE_ROWS[0], SHAPE_ROWS[0], SIZE_ROWS[1], SHAPE_ROWS[2]];
    assert.deepEqual(oddOneOutCardProblems({ ...goodCard(), rows }, latwy, false), ["duplicate-row"]);
    const shuffled = row("shape", 0, shape("heart"), shape("circle"), shape("circle"), shape("circle"));
    const again = [SHAPE_ROWS[0], SIZE_ROWS[0], shuffled, SIZE_ROWS[1], SHAPE_ROWS[2]];
    assert.deepEqual(oddOneOutCardProblems({ ...goodCard(), rows: again }, latwy, false), ["duplicate-row"]);
  });

  void test("a bad row makes a bad card", () => {
    const wrong = row("shape", 0, shape("circle"), shape("circle"), shape("circle"), shape("heart"));
    const rows = [wrong, ...goodCard().rows.slice(1)];
    assert.deepEqual(oddOneOutCardProblems({ ...goodCard(), rows }, latwy, false), ["answer"]);
  });
});
