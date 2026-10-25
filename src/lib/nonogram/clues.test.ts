import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { symmetryTemplatesFor, type SymmetryTemplate } from "../symmetry/templates.ts";
import { lineClue, nonogramClues, nonogramImage } from "./clues.ts";
import { NONOGRAM_SIZES, nonogramSizeById } from "./sizes.ts";

const MEDIUM = nonogramSizeById("sredni");
const LARGE = nonogramSizeById("duzy");

void describe("lineClue", () => {
  void test("an empty line has the clue [0]", () => {
    assert.deepEqual(lineClue([false, false, false]), [0]);
    assert.deepEqual(lineClue([]), [0]);
  });

  void test("lists the runs of filled cells in order (hand-written oracle)", () => {
    assert.deepEqual(lineClue([true, true, false, true, false, false, true, true, true]), [2, 1, 3]);
    assert.deepEqual(lineClue([false, true, false]), [1]);
    assert.deepEqual(lineClue([true, true, true]), [3]);
  });
});

void describe("nonogramClues", () => {
  void test("reads rows left to right and columns top to bottom (hand-written oracle)", () => {
    const clues = nonogramClues([
      [true, true, false],
      [false, false, false],
      [true, false, true],
    ]);

    assert.deepEqual(clues.rows, [[2], [0], [1, 1]]);
    assert.deepEqual(clues.columns, [[1, 1], [1], [1]]);
  });
});

void describe("nonogramImage", () => {
  const tower: SymmetryTemplate = {
    id: "wieza",
    holeColor: "blue",
    categories: ["budowle"],
    width: 2,
    height: 3,
    base: [
      { col: 1, row: 0, color: "red" },
      { col: 0, row: 1, color: "red" },
      { col: 1, row: 1, color: "red" },
    ],
    parts: [{ id: "top", variants: [[{ col: 1, row: 2, color: "red" }], []] }],
  };
  const size = { id: "sredni", columns: 6, rows: 4 } as const;

  void test("shifts the drawing to the axis, mirrors it, and starts at the top row (hand-written oracle)", () => {
    const image = nonogramImage(tower, [0], size);
    const row = (...cols: number[]): boolean[] => Array.from({ length: 6 }, (_, col) => cols.includes(col));

    assert.deepEqual(image, [row(2, 3), row(1, 2, 3, 4), row(2, 3), row()]);
  });

  void test("another variant of a part gives another picture", () => {
    assert.notDeepEqual(nonogramImage(tower, [0], size), nonogramImage(tower, [1], size));
  });

  void test("throws for a template wider or taller than the half grid, or a missing variant", () => {
    assert.throws(() => nonogramImage({ ...tower, width: 4 }, [0], size), /wieza/);
    assert.throws(() => nonogramImage({ ...tower, height: 5 }, [0], size), /wieza/);
    assert.throws(() => nonogramImage(tower, [2], size), /wieza/);
  });

  void test("every image is left-right symmetric and has the size of its grid", () => {
    for (const size of NONOGRAM_SIZES) {
      for (const template of symmetryTemplatesFor(size.templateLevel)) {
        const image = nonogramImage(
          template,
          template.parts.map(() => 0),
          size,
        );

        assert.equal(image.length, size.rows, template.id);
        for (const row of image) {
          assert.equal(row.length, size.columns, template.id);
          assert.deepEqual([...row].reverse(), row, template.id);
        }
      }
    }
  });

  void test("the 7 lat robot is 23 rows tall, so the last row of the 18 by 24 grid has the clue [0]", () => {
    const robot = symmetryTemplatesFor("lat7").find((template) => template.id === "robot");

    assert.ok(robot);
    const clues = nonogramClues(
      nonogramImage(
        robot,
        robot.parts.map(() => 0),
        LARGE,
      ),
    );
    assert.deepEqual(clues.rows[23], [0]);
    assert.notDeepEqual(clues.rows[22], [0]);
  });

  void test("the medium rocket with the open window leaves the window empty on both sides (hand-written oracle)", () => {
    const rocket = symmetryTemplatesFor("lat5")[0];
    const image = nonogramImage(rocket, [0, 0, 0], MEDIUM);

    assert.deepEqual(image[4], [false, false, false, true, false, false, false, false, true, false, false, false]);
  });
});
