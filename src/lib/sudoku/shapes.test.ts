import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { SUDOKU_SHAPES, SUDOKU_SHAPES_4, SUDOKU_SHAPE_NAMES, sudokuShapePath } from "./shapes.ts";

const CX = 100;
const CY = 50;
const SIZE = 26;

function numbers(path: string): number[] {
  return (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
}

void describe("sudoku shapes", () => {
  void test("there are nine distinct shapes, each with a name", () => {
    assert.equal(SUDOKU_SHAPES.length, 9);
    assert.equal(new Set(SUDOKU_SHAPES).size, 9);
    for (const id of SUDOKU_SHAPES) assert.ok(SUDOKU_SHAPE_NAMES[id].length > 0, id);
  });

  void test("the 4×4 pool is the five simplest shapes, all among the nine", () => {
    assert.deepEqual([...SUDOKU_SHAPES_4], ["circle", "square", "triangle", "heart", "cross"]);
    for (const id of SUDOKU_SHAPES_4) assert.ok(SUDOKU_SHAPES.includes(id), id);
  });

  void test("every path is a closed outline whose points stay inside the square around the center", () => {
    for (const id of SUDOKU_SHAPES) {
      const path = sudokuShapePath(id, CX, CY, SIZE);
      assert.ok(path.startsWith("M") && path.endsWith("Z"), id);
      const values = numbers(path);
      assert.ok(values.length >= 6 && values.length % 2 === 0, id);
      for (let index = 0; index < values.length; index += 2) {
        assert.ok(Math.abs(values[index] - CX) <= SIZE / 2 + 1e-9, `${id} x ${values[index]}`);
        assert.ok(Math.abs(values[index + 1] - CY) <= SIZE / 2 + 1e-9, `${id} y ${values[index + 1]}`);
      }
    }
  });

  void test("every shape fills most of its square, so it is not drawn tiny", () => {
    for (const id of SUDOKU_SHAPES) {
      const values = numbers(sudokuShapePath(id, CX, CY, SIZE));
      const xs = values.filter((_, index) => index % 2 === 0);
      const ys = values.filter((_, index) => index % 2 === 1);
      const extent = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
      assert.ok(extent >= SIZE * 0.8, `${id} extent ${extent}`);
    }
  });

  void test("the path scales with the size and keeps its shape, so stroke width is not scaled", () => {
    const small = sudokuShapePath("heart", 0, 0, 10);
    const large = sudokuShapePath("heart", 0, 0, 20);
    assert.notEqual(small, large);
    assert.deepEqual(
      numbers(large).map((value) => value / 2),
      numbers(small),
    );
  });
});
