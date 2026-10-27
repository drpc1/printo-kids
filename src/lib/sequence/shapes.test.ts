import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { sudokuShapePath } from "../sudoku/shapes.ts";
import { SEQUENCE_SHAPES, sequenceShapeOutline } from "./shapes.ts";

const CX = 50;
const CY = 80;
const SIZE = 20;
const EPSILON = 1e-6;

function pointsOf(points: string): [number, number][] {
  return points.split(" ").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return [x, y];
  });
}

void describe("sequenceShapeOutline", () => {
  void test("every shape fits inside the square of its size around the center", () => {
    for (const shape of SEQUENCE_SHAPES) {
      const outline = sequenceShapeOutline(shape, CX, CY, SIZE);
      const box =
        outline.kind === "circle"
          ? [outline.cx - outline.r, outline.cx + outline.r, outline.cy - outline.r, outline.cy + outline.r]
          : (() => {
              if (outline.kind !== "polygon") {
                assert.fail(`${shape} is ${outline.kind}`);
              }
              const xs = pointsOf(outline.points).map(([x]) => x);
              const ys = pointsOf(outline.points).map(([, y]) => y);
              return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
            })();
      assert.ok(box[0] >= CX - SIZE / 2 - EPSILON && box[1] <= CX + SIZE / 2 + EPSILON, `${shape} x ${box.join(",")}`);
      assert.ok(box[2] >= CY - SIZE / 2 - EPSILON && box[3] <= CY + SIZE / 2 + EPSILON, `${shape} y ${box.join(",")}`);
    }
  });

  void test("every shape is centered on the given point", () => {
    for (const shape of SEQUENCE_SHAPES) {
      const outline = sequenceShapeOutline(shape, CX, CY, SIZE);
      if (outline.kind === "circle") {
        assert.deepEqual([outline.cx, outline.cy], [CX, CY]);
        continue;
      }
      if (outline.kind !== "polygon") {
        assert.fail(`${shape} is ${outline.kind}`);
      }
      const points = pointsOf(outline.points);
      const ys = points.map(([, y]) => y);
      const xs = points.map(([x]) => x);
      assert.ok(Math.abs((Math.min(...xs) + Math.max(...xs)) / 2 - CX) < 0.01, `${shape} x`);
      assert.ok(Math.abs((Math.min(...ys) + Math.max(...ys)) / 2 - CY) < 0.01, `${shape} y`);
    }
  });

  void test("the four shapes have four different outlines with the expected corner counts", () => {
    const outlines = SEQUENCE_SHAPES.map((shape) => sequenceShapeOutline(shape, CX, CY, SIZE));

    assert.equal(new Set(outlines.map((outline) => JSON.stringify(outline))).size, 4);
    const corners = outlines.map((outline) => (outline.kind === "polygon" ? pointsOf(outline.points).length : 0));
    assert.deepEqual(corners, [0, 4, 3, 10]);
  });

  void test("the same input gives the same outline", () => {
    for (const shape of SEQUENCE_SHAPES) {
      assert.deepEqual(sequenceShapeOutline(shape, CX, CY, SIZE), sequenceShapeOutline(shape, CX, CY, SIZE));
    }
  });

  void test("serce and krzyzyk copy the sudoku paths and strzalka points up-right", () => {
    const heart = sequenceShapeOutline("serce", CX, CY, SIZE);
    const cross = sequenceShapeOutline("krzyzyk", CX, CY, SIZE);
    const arrow = sequenceShapeOutline("strzalka", CX, CY, SIZE);
    if (heart.kind !== "path" || cross.kind !== "path" || arrow.kind !== "path") {
      assert.fail("serce, krzyzyk and strzalka are paths");
    }

    assert.equal(heart.d, sudokuShapePath("heart", CX, CY, SIZE));
    assert.equal(cross.d, sudokuShapePath("cross", CX, CY, SIZE));

    assert.ok(arrow.d.startsWith("M") && arrow.d.endsWith("Z"), arrow.d);
    const values = (arrow.d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    assert.ok(values.length >= 6 && values.length % 2 === 0, arrow.d);
    const xs = values.filter((_, index) => index % 2 === 0);
    const ys = values.filter((_, index) => index % 2 === 1);
    for (let index = 0; index < xs.length; index += 1) {
      assert.ok(Math.abs(xs[index] - CX) <= SIZE / 2 + EPSILON, `x ${xs[index]}`);
      assert.ok(Math.abs(ys[index] - CY) <= SIZE / 2 + EPSILON, `y ${ys[index]}`);
    }
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    assert.ok(Math.abs((minX + maxX) / 2 - CX) < 0.01, "center x");
    assert.ok(Math.abs((minY + maxY) / 2 - CY) < 0.01, "center y");
    assert.ok(maxX - minX >= SIZE * 0.8, `width ${maxX - minX}`);
    assert.ok(maxY - minY >= SIZE * 0.8, `height ${maxY - minY}`);
    assert.ok(
      ys.every((y, index) => xs[index] !== maxX || y < CY),
      "tip above center",
    );
    assert.ok(
      ys.every((y, index) => xs[index] !== minX || y > CY),
      "tail below center",
    );
  });
});
