import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { SUDOKU_SHAPE_COLORS, sudokuShapeInk } from "./colors.ts";
import { SUDOKU_SHAPES, SUDOKU_SHAPES_4 } from "./shapes.ts";

const GLOBAL_CSS = readFileSync(new URL("../../styles/global.css", import.meta.url), "utf8");

void describe("sudokuShapeInk", () => {
  void test("the nine shapes have nine different colors", () => {
    assert.equal(new Set(SUDOKU_SHAPES.map((id) => SUDOKU_SHAPE_COLORS[id])).size, 9);
  });

  void test("without colors every shape is drawn in ink", () => {
    for (const id of SUDOKU_SHAPES) {
      assert.equal(sudokuShapeInk(id, false), "var(--foreground)");
    }
  });

  void test("with colors the five simplest shapes have their crayon (hand-written oracle)", () => {
    assert.deepEqual(
      SUDOKU_SHAPES_4.map((id) => sudokuShapeInk(id, true)),
      [
        "var(--symmetry-blue)",
        "var(--symmetry-orange)",
        "var(--symmetry-green)",
        "var(--symmetry-red)",
        "var(--symmetry-purple)",
      ],
    );
  });

  void test("every crayon a shape uses is a token in global.css", () => {
    for (const id of SUDOKU_SHAPES) {
      const token = `--symmetry-${SUDOKU_SHAPE_COLORS[id]}:`;
      assert.ok(GLOBAL_CSS.includes(token), `${token} is missing in global.css`);
    }
  });
});
