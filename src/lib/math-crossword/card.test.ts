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

interface Placed {
  cells: MathCrosswordCard["cells"];
  equation: MathCrosswordCard["equations"][number];
}

// A right equation "a + b = c" on `row`, starting in column `col`, numbered from `id`.
function rightRow(row: number, col: number, id: number): Placed {
  return {
    cells: [
      { row, col, kind: "num", id },
      { row, col: col + 1, kind: "op", op: "+" },
      { row, col: col + 2, kind: "num", id: id + 1 },
      { row, col: col + 3, kind: "eq" },
      { row, col: col + 4, kind: "num", id: id + 2 },
    ],
    equation: { a: id, op: "+", b: id + 1, c: id + 2, row, col, dir: "right" },
  };
}
// The same equation going down column `col` from `row`.
function downColumn(col: number, row: number, id: number): Placed {
  const right = rightRow(0, 0, id);
  return {
    cells: right.cells.map((cell) => ({ ...cell, row: row + cell.col, col })),
    equation: { ...right.equation, row, col, dir: "down" },
  };
}
const twoSeparate = (first: Placed, second: Placed): MathCrosswordCard => ({
  level: "poziom2",
  cells: [...first.cells, ...second.cells],
  equations: [first.equation, second.equation],
  values: [3, 4, 7, 1, 2, 3],
  blanks: [0, 3],
});

void describe("mathCrosswordProblems: the grid and the wiring", () => {
  void test("equations side by side, in a row or in a column, are sound only when they do not touch", () => {
    assert.deepEqual(codes(twoSeparate(rightRow(0, 0, 0), rightRow(2, 0, 3))), []);
    assert.ok(codes(twoSeparate(rightRow(0, 0, 0), rightRow(1, 0, 3))).includes("cells-touch"));
    assert.deepEqual(codes(twoSeparate(downColumn(0, 0, 0), downColumn(2, 0, 3))), []);
    assert.ok(codes(twoSeparate(downColumn(0, 0, 0), downColumn(1, 0, 3))).includes("cells-touch"));
  });

  void test("too-few-equations starts one below the level's aim less the tolerance", () => {
    const first = mathCrosswordLevelById("poziom1");
    const stacked = (count: number): MathCrosswordCard => {
      const rows = Array.from({ length: count }, (_, i) => rightRow(i * 2, 0, i * 3));
      return {
        level: "poziom1",
        cells: rows.flatMap((row) => row.cells),
        equations: rows.map((row) => row.equation),
        values: rows.flatMap(() => [3, 4, 7]),
        blanks: rows.map((_, i) => i * 3),
      };
    };
    assert.equal(first.equations, 5);
    assert.deepEqual(mathCrosswordProblems(stacked(4), first), []);
    assert.deepEqual(mathCrosswordProblems(stacked(3), first), ["too-few-equations"]);
  });

  void test("cells-touch: a number or sign that is not the equation's, and a cell just before or after an equation", () => {
    const wrongId = { ...small(), cells: small().cells.map((c, i) => (i === 0 ? { ...c, id: 1 } : c)) };
    assert.ok(codes(wrongId).includes("cells-touch"));
    const wrongOp = {
      ...small(),
      cells: small().cells.map((c) => (c.kind === "op" && c.col === 1 ? { ...c, op: "·" as const } : c)),
    };
    assert.ok(codes(wrongOp).includes("cells-touch"));
    for (const [row, col] of [
      [0, -1],
      [-1, 4],
      [5, 4],
    ]) {
      const cells = [...small().cells, { row, col, kind: "eq" as const }];
      assert.ok(codes({ ...small(), cells }).includes("cells-touch"), `${row},${col}`);
    }
  });

  void test("cells-touch: three equations in one place, and a crossing at a sign", () => {
    const first = small().equations[0];
    assert.ok(codes({ ...small(), equations: [first, { ...first }, { ...first }] }).includes("cells-touch"));
    // A down equation whose sign cell is the right one's sign cell.
    const crossing: MathCrosswordCard = {
      ...small(),
      cells: [
        ...small().cells,
        { row: -1, col: 1, kind: "num", id: 5 },
        { row: 1, col: 1, kind: "num", id: 6 },
        { row: 2, col: 1, kind: "eq" },
        { row: 3, col: 1, kind: "num", id: 7 },
      ],
      equations: [...small().equations, { a: 5, op: "+", b: 6, c: 7, row: -1, col: 1, dir: "down" }],
      values: [3, 4, 7, 2, 5, 1, 2, 3],
    };
    assert.ok(codes(crossing).includes("cells-touch"));
  });

  void test("an equation that names a number the card does not have is a false equation", () => {
    const equations = small().equations;
    for (const bad of [-1, 5, 1.5]) {
      const broken = { ...small(), equations: [equations[0], { ...equations[1], c: bad }] };
      assert.ok(codes(broken).includes("false-equation"), String(bad));
    }
  });

  void test("the times table accepts 2 and 10 at both ends and refuses a factor of 1 or above 10", () => {
    const seventh = mathCrosswordLevelById("poziom7");
    const oneEquation = (op: "·" | ":", a: number, b: number, c: number): MathCrosswordCard => ({
      level: "poziom7",
      cells: rightRow(0, 0, 0).cells.map((cell) => (cell.kind === "op" ? { ...cell, op } : cell)),
      equations: [{ a: 0, op, b: 1, c: 2, row: 0, col: 0, dir: "right" }],
      values: [a, b, c],
      blanks: [0],
    });
    for (const [a, b] of [
      [2, 2],
      [10, 10],
      [2, 10],
      [10, 2],
    ]) {
      assert.deepEqual(codes(oneEquation("·", a, b, a * b), seventh), [], `${a}·${b}`);
    }
    assert.ok(codes(oneEquation("·", 3, 1, 3), seventh).includes("op-not-allowed"));
    for (const [a, b, c] of [
      [4, 2, 2],
      [100, 10, 10],
      [20, 2, 10],
      [30, 10, 3],
    ]) {
      assert.deepEqual(codes(oneEquation(":", a, b, c), seventh), [], `${a}:${b}`);
    }
    assert.ok(codes(oneEquation(":", 6, 1, 6), seventh).includes("op-not-allowed"));
    assert.ok(codes(oneEquation(":", 33, 3, 11), seventh).includes("op-not-allowed"));
    assert.ok(codes(oneEquation(":", 24, 12, 2), seventh).includes("op-not-allowed"));
  });
});

void describe("chainDepth, the key and the positions", () => {
  void test("1 when every empty number comes straight from the sheet, 0 with none empty, null when out of reach", () => {
    assert.equal(chainDepth(small(), 10), 1);
    assert.equal(chainDepth({ ...small(), blanks: [] }, 10), 0);
    assert.equal(chainDepth({ ...small(), blanks: [0, 1, 3] }, 10), null);
    // The empty number is the greatest the level allows: found only when the search reaches max itself.
    assert.equal(chainDepth({ ...small(), blanks: [2] }, 7), 1);
  });

  void test("two cards with different numbers or empty numbers have different keys", () => {
    const base = mathCrosswordKey(small());
    assert.notEqual(base, mathCrosswordKey({ ...small(), blanks: [1, 3] }));
    assert.notEqual(base, mathCrosswordKey({ ...small(), values: [3, 4, 7, 1, 6] }));
    assert.equal(base, mathCrosswordKey(small()));
    // The separators keep 1,23 apart from 12,3, and the direction, sign and place of an equation are part of the key.
    const key = (card: Partial<MathCrosswordCard>): string => mathCrosswordKey({ ...small(), ...card });
    assert.notEqual(key({ values: [1, 23, 7, 2, 5] }), key({ values: [12, 3, 7, 2, 5] }));
    assert.notEqual(key({ blanks: [1, 2, 3] }), key({ blanks: [12, 3] }));
    const [first, second] = small().equations;
    assert.notEqual(base, key({ equations: [{ ...first, dir: "down" }, second] }));
    assert.notEqual(base, key({ equations: [first, { ...second, dir: "right" }] }));
    assert.notEqual(base, key({ equations: [{ ...first, op: "−" }, second] }));
    assert.notEqual(base, key({ equations: [first, { ...second, row: 1 }] }));
    assert.notEqual(key({ equations: [first, second] }), key({ equations: [first] }));
  });

  void test("equationPositions runs right or down in five cells", () => {
    assert.deepEqual(
      equationPositions(small().equations[1]).map((p) => `${p.row},${p.col}`),
      ["0,4", "1,4", "2,4", "3,4", "4,4"],
    );
    assert.equal(equationPositions(small().equations[0])[4].col, 4);
  });
});
