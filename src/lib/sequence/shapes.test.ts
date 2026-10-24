import assert from "node:assert/strict";
import { describe, test } from "node:test";
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
});
