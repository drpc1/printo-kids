import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { circle, rect, stroke } from "./picture-format.ts";
import { pathPolylines, shadowDifference, shapesMask } from "./raster.ts";

const share = (mask: readonly boolean[]): number => mask.filter(Boolean).length / mask.length;

void describe("shadow mask", () => {
  void test("a rectangle covers its share of the box", () => {
    assert.ok(Math.abs(share(shapesMask([rect(0, 0, 50, 100, "red")])) - 0.5) < 0.02);
  });

  void test("a circle covers about πr² of the box", () => {
    assert.ok(Math.abs(share(shapesMask([circle(50, 50, 40, "red")])) - Math.PI * 0.16) < 0.02);
  });

  void test("a stroke covers a band of its width along the line", () => {
    assert.ok(Math.abs(share(shapesMask([stroke("M0 50 H100", 10, "red")])) - 0.1) < 0.03);
  });

  void test("curves are flattened and subpaths stay apart", () => {
    const lines = pathPolylines("M0 0 C10 0 20 10 20 20 Z M50 50 L60 60");
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0].at(-1), [0, 0]);
  });

  void test("difference is 0 for the same mask, symmetric and 1 for disjoint masks", () => {
    const a = shapesMask([rect(0, 0, 50, 100, "red")]);
    const b = shapesMask([rect(50, 0, 50, 100, "red")]);
    const c = shapesMask([rect(0, 0, 60, 100, "red")]);
    assert.equal(shadowDifference(a, a), 0);
    assert.equal(shadowDifference(a, b), 1);
    assert.equal(shadowDifference(a, c), shadowDifference(c, a));
  });
});
