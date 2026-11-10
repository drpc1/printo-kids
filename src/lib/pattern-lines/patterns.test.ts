import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { PATTERNS, patternById } from "./patterns.ts";

void describe("PATTERNS", () => {
  void test("there is no bolt and no pyramid, and ids are unique", () => {
    const ids: string[] = PATTERNS.map((pattern) => pattern.id);
    assert.ok(!ids.includes("bolt"));
    assert.ok(!ids.includes("pyramid"));
    assert.equal(new Set(ids).size, ids.length);
  });

  for (const pattern of PATTERNS) {
    void test(`${pattern.id}: a unit of at least two points inside x 0..1, from x 0 to x 1`, () => {
      const unit = pattern.unit();
      assert.ok(unit.length >= 2);
      assert.equal(unit[0].x, 0);
      assert.ok(Math.abs(unit[unit.length - 1].x - 1) < 1e-9, `ends at ${unit[unit.length - 1].x}`);
      for (const point of unit) {
        assert.ok(point.x >= -1e-9 && point.x <= 1 + 1e-9, `x ${point.x}`);
      }
    });

    void test(`${pattern.id}: a fixed count is at least 1`, () => {
      if (pattern.count !== undefined) {
        assert.ok(pattern.count >= 1);
      }
    });
  }

  void test("houses come five to a row", () => {
    assert.equal(patternById("house").count, 5);
  });

  void test("sticks: a slanted stroke up, a nearly vertical stroke down and a hook back to the start height", () => {
    const unit = patternById("sticks").unit();
    assert.equal(unit[0].y, unit[unit.length - 1].y);
    const top = unit.reduce((best, p) => (p.y > best.y ? p : best));
    assert.equal(top.y, 1);
    assert.ok(top.x < 0.5);
    assert.ok(Math.min(...unit.map((p) => p.y)) >= 0);
  });

  void test("an unknown pattern throws", () => {
    assert.throws(() => patternById("bolt"));
  });
});
