import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  MAX_RUNS_PER_ROW,
  composeSimpleNonogramCard,
  outlineTones,
  simpleNonogramProblems,
  toneRuns,
  type SimpleNonogramCard,
  type Tone,
} from "./simple.ts";
import { nonogramSizeById } from "./sizes.ts";
import { symmetryTemplatesFor } from "../symmetry/templates.ts";

const EASY = nonogramSizeById("latwy");

void describe("outlineTones", () => {
  void test("outline cells are black, cells with four filled neighbours are gray, holes and the rest are white", () => {
    const image = [
      [false, false, false, false, false],
      [false, true, true, true, false],
      [false, true, true, true, false],
      [false, true, true, true, false],
      [false, false, false, false, false],
    ];

    assert.deepEqual(outlineTones(image), [
      ["white", "white", "white", "white", "white"],
      ["white", "black", "black", "black", "white"],
      ["white", "black", "gray", "black", "white"],
      ["white", "black", "black", "black", "white"],
      ["white", "white", "white", "white", "white"],
    ]);
  });

  void test("a filled cell on the grid edge is black, and a hole in the body is white with black around it", () => {
    const image = [
      [true, true, true],
      [true, false, true],
      [true, true, true],
    ];

    assert.deepEqual(outlineTones(image), [
      ["black", "black", "black"],
      ["black", "white", "black"],
      ["black", "black", "black"],
    ]);
  });
});

void describe("outlineTones neighbours", () => {
  void test("the centre of a plus is gray: only the four side neighbours count, not the corners", () => {
    const plus = [
      [false, true, false],
      [true, true, true],
      [false, true, false],
    ];

    assert.equal(outlineTones(plus)[1][1], "gray");
  });

  void test("a filled cell missing any one of its four neighbours, or at the edge, is black", () => {
    const full = [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ];
    assert.equal(outlineTones(full)[1][1], "gray");

    for (const [row, column] of [
      [0, 1],
      [2, 1],
      [1, 0],
      [1, 2],
    ] as const) {
      const image = full.map((cells) => [...cells]);
      image[row][column] = false;

      assert.equal(outlineTones(image)[1][1], "black", `hole at ${row},${column}`);
    }
    // The grid edge counts as empty on all four sides.
    assert.equal(outlineTones(full)[0][1], "black");
    assert.equal(outlineTones(full)[2][1], "black");
    assert.equal(outlineTones(full)[1][0], "black");
    assert.equal(outlineTones(full)[1][2], "black");
  });

  void test("a ragged image does not read past the end of a shorter row", () => {
    assert.deepEqual(outlineTones([[true, true, true], [true]]), [["black", "black", "black"], ["black"]]);
  });
});

void describe("toneRuns", () => {
  void test("describes a row in full, white included, so the counts add up to the row", () => {
    assert.deepEqual(toneRuns(["white", "white", "gray", "gray", "gray", "black", "white", "white"]), [
      { tone: "white", count: 2 },
      { tone: "gray", count: 3 },
      { tone: "black", count: 1 },
      { tone: "white", count: 2 },
    ]);
  });
});

void describe("simpleNonogramProblems", () => {
  void test("accepts a card whose chips rebuild its tones", () => {
    assert.deepEqual(simpleNonogramProblems(cardOf([["white", "black", "white"]])), []);
  });

  void test("rejects a card with no filled cell", () => {
    assert.deepEqual(simpleNonogramProblems(cardOf([["white", "white"]])), ["no-filled-cell"]);
  });

  void test("accepts a row with exactly as many chips as fit beside the grid", () => {
    const row = Array.from({ length: MAX_RUNS_PER_ROW }, (_, index) => (index % 2 === 0 ? "black" : "white") as Tone);

    assert.deepEqual(simpleNonogramProblems(cardOf([row])), []);
  });

  void test("rejects a row with more chips than fit beside the grid", () => {
    const row = Array.from(
      { length: MAX_RUNS_PER_ROW + 1 },
      (_, index) => (index % 2 === 0 ? "black" : "white") as Tone,
    );

    assert.deepEqual(simpleNonogramProblems(cardOf([row])), ["too-many-runs"]);
  });

  void test("one row with too many chips is enough, even when the other rows are fine", () => {
    const crowded = Array.from(
      { length: MAX_RUNS_PER_ROW + 1 },
      (_, index) => (index % 2 === 0 ? "black" : "white") as Tone,
    );
    const calm: Tone[] = crowded.map(() => "black");

    assert.deepEqual(simpleNonogramProblems(cardOf([calm, crowded, calm])), ["too-many-runs"]);
  });

  void test("rejects chips that do not rebuild the tones", () => {
    const card = cardOf([["white", "black", "white"]]);

    assert.deepEqual(simpleNonogramProblems({ ...card, runs: [[{ tone: "white", count: 3 }]] }), ["runs-mismatch"]);
  });
});

void describe("composeSimpleNonogramCard", () => {
  void test("the chips of every row of the 4 lat rocket add up to the 8 columns and rebuild its tones", () => {
    const rocket = symmetryTemplatesFor("lat4")[0];
    const card = composeSimpleNonogramCard(
      rocket,
      rocket.parts.map(() => 0),
      EASY,
    );

    assert.equal(card.rows, 12);
    assert.equal(card.columns, 8);
    assert.ok(card.tones.flat().includes("gray"), "the rocket has an inside");
    assert.ok(card.tones.flat().includes("black"), "the rocket has an outline");
    for (const row of card.runs) {
      assert.equal(
        row.reduce((sum, run) => sum + run.count, 0),
        8,
      );
    }
    assert.deepEqual(simpleNonogramProblems(card), []);
    assert.equal(card.key, `latwy:rakieta:${rocket.parts.map(() => 0).join("-")}`);
  });
});

function cardOf(tones: SimpleNonogramCard["tones"]): SimpleNonogramCard {
  return {
    kind: "znaczki",
    sizeId: "latwy",
    columns: tones[0].length,
    rows: tones.length,
    cellSize: EASY.cellSize,
    tones,
    runs: tones.map(toneRuns),
    key: "test",
  };
}
