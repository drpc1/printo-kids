import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  chainDepth,
  compute,
  equationPositions,
  mathCrosswordKey,
  mathCrosswordProblems,
  type MathCrosswordCard,
} from "./card.ts";
import { MATH_CROSSWORD_LEVELS, mathCrosswordLevelById, type MathCrosswordLevel } from "./levels.ts";

// Two equations crossing at the number cell 2: 3 + 4 = 7 to the right and 7 − 2 = 5 down from that cell.
function small(): MathCrosswordCard {
  return {
    level: "poziom2",
    cells: [
      { row: 0, col: 0, kind: "num", id: 0 },
      { row: 0, col: 1, kind: "op", op: "+" },
      { row: 0, col: 2, kind: "num", id: 1 },
      { row: 0, col: 3, kind: "eq" },
      { row: 0, col: 4, kind: "num", id: 2 },
      { row: 1, col: 4, kind: "op", op: "−" },
      { row: 2, col: 4, kind: "num", id: 3 },
      { row: 3, col: 4, kind: "eq" },
      { row: 4, col: 4, kind: "num", id: 4 },
    ],
    equations: [
      { a: 0, op: "+", b: 1, c: 2, row: 0, col: 0, dir: "right" },
      { a: 2, op: "−", b: 3, c: 4, row: 0, col: 4, dir: "down" },
    ],
    values: [3, 4, 7, 2, 5],
    blanks: [0, 3],
  };
}

const level = mathCrosswordLevelById("poziom2");
// The small card has fewer equations than a real one; that rule has its own test, so the others filter it out.
const codes = (card: MathCrosswordCard, onLevel: MathCrosswordLevel = level): string[] =>
  mathCrosswordProblems(card, onLevel).filter((code) => code !== "too-few-equations");

void describe("compute", () => {
  void test("the four signs, and no answer for a division with a remainder or by zero", () => {
    assert.equal(compute(3, "+", 4), 7);
    assert.equal(compute(9, "−", 4), 5);
    assert.equal(compute(6, "·", 7), 42);
    assert.equal(compute(42, ":", 7), 6);
    assert.ok(Number.isNaN(compute(43, ":", 7)));
    assert.ok(Number.isNaN(compute(5, ":", 0)));
  });
});

void describe("mathCrosswordProblems", () => {
  void test("a sound card has no problem but the missing equations", () => {
    assert.deepEqual(codes(small()), []);
    assert.deepEqual(mathCrosswordProblems(small(), level), ["too-few-equations"]);
  });

  void test("false-equation and number-out-of-range", () => {
    assert.ok(codes({ ...small(), values: [3, 4, 8, 2, 5] }).includes("false-equation"));
    assert.ok(codes({ ...small(), values: [3, 8, 11, 6, 5] }).includes("number-out-of-range"));
    assert.ok(codes({ ...small(), values: [0, 7, 7, 2, 5] }).includes("number-out-of-range"));
  });

  void test("op-not-allowed: a sign of another level, and a product or quotient outside the times table", () => {
    const first = mathCrosswordLevelById("poziom1");
    assert.ok(codes(small(), first).includes("op-not-allowed"));
    const fifth = mathCrosswordLevelById("poziom5");
    const product = (a: number, b: number): MathCrosswordCard => ({
      level: "poziom5",
      cells: [
        { row: 0, col: 0, kind: "num", id: 0 },
        { row: 0, col: 1, kind: "op", op: "·" },
        { row: 0, col: 2, kind: "num", id: 1 },
        { row: 0, col: 3, kind: "eq" },
        { row: 0, col: 4, kind: "num", id: 2 },
      ],
      equations: [{ a: 0, op: "·", b: 1, c: 2, row: 0, col: 0, dir: "right" }],
      values: [a, b, a * b],
      blanks: [0],
    });
    assert.deepEqual(codes(product(3, 7), fifth), []);
    assert.ok(codes(product(11, 2), fifth).includes("op-not-allowed"));
    assert.ok(codes(product(1, 9), fifth).includes("op-not-allowed"));
    const sixth = mathCrosswordLevelById("poziom6");
    const quotient = (a: number, b: number, c: number): MathCrosswordCard => ({
      ...product(2, 3),
      level: "poziom6",
      cells: product(2, 3).cells.map((cell) => (cell.kind === "op" ? { ...cell, op: ":" as const } : cell)),
      equations: [{ a: 0, op: ":", b: 1, c: 2, row: 0, col: 0, dir: "right" }],
      values: [a, b, c],
    });
    assert.deepEqual(codes(quotient(42, 7, 6), sixth), []);
    assert.ok(codes(quotient(4, 4, 1), sixth).includes("op-not-allowed"));
    assert.ok(codes(quotient(22, 11, 2), sixth).includes("op-not-allowed"));
  });

  void test("cells-touch: a stray neighbour, a missing cell, an overlap and two equations in one direction", () => {
    const stray = { ...small(), cells: [...small().cells, { row: 1, col: 0, kind: "eq" as const }] };
    assert.ok(codes(stray).includes("cells-touch"));
    assert.ok(codes({ ...small(), cells: small().cells.slice(1) }).includes("cells-touch"));
    assert.ok(codes({ ...small(), cells: [...small().cells, small().cells[0]] }).includes("cells-touch"));
    const sameDirection: MathCrosswordCard = {
      ...small(),
      equations: [small().equations[0], { ...small().equations[0] }],
    };
    assert.ok(codes(sameDirection).includes("cells-touch"));
    // A cell right after an equation continues it, which the five-cell shape forbids.
    const after = { ...small(), cells: [...small().cells, { row: 0, col: 5, kind: "eq" as const }] };
    assert.ok(codes(after).includes("cells-touch"));
  });

  void test("too-many-blanks-in-equation, no-blanks, needs-guessing and chain-too-long", () => {
    assert.ok(codes({ ...small(), blanks: [0, 1] }).includes("too-many-blanks-in-equation"));
    assert.ok(codes({ ...small(), blanks: [] }).includes("no-blanks"));
    // [ ] + [ ] = 7 and 7 − [ ] = 5: the sum has two unknowns that nothing else fixes.
    const third = mathCrosswordLevelById("poziom3");
    assert.ok(codes({ ...small(), blanks: [0, 1, 3] }, third).includes("needs-guessing"));
    // The 7 is empty: 7 − 2 = 5 gives it first, then 3 + 4 = 7 checks... the empty 3 needs the 7, so the chain is 2.
    const chained = { ...small(), blanks: [0, 2] };
    assert.equal(chainDepth(chained, 10), 2);
    assert.ok(codes(chained, level).includes("chain-too-long"));
    assert.ok(!codes(chained, third).includes("chain-too-long"));
  });

  void test("too-few-equations: fewer than the level aims at, less the tolerance", () => {
    for (const lv of MATH_CROSSWORD_LEVELS) {
      assert.ok(mathCrosswordProblems(small(), lv).includes("too-few-equations"), lv.id);
    }
  });
});

void describe("chainDepth, the key and the positions", () => {
  void test("1 when every empty number comes straight from the sheet, 0 with none empty, null when out of reach", () => {
    assert.equal(chainDepth(small(), 10), 1);
    assert.equal(chainDepth({ ...small(), blanks: [] }, 10), 0);
    assert.equal(chainDepth({ ...small(), blanks: [0, 1, 3] }, 10), null);
  });

  void test("two cards with different numbers or empty numbers have different keys", () => {
    const base = mathCrosswordKey(small());
    assert.notEqual(base, mathCrosswordKey({ ...small(), blanks: [1, 3] }));
    assert.notEqual(base, mathCrosswordKey({ ...small(), values: [3, 4, 7, 1, 6] }));
    assert.equal(base, mathCrosswordKey(small()));
  });

  void test("equationPositions runs right or down in five cells", () => {
    assert.deepEqual(
      equationPositions(small().equations[1]).map((p) => `${p.row},${p.col}`),
      ["0,4", "1,4", "2,4", "3,4", "4,4"],
    );
    assert.equal(equationPositions(small().equations[0])[4].col, 4);
  });
});
