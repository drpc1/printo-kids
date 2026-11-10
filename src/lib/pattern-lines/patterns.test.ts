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

  void test("oChain: the connector stays out of the ring and no two points of the unit coincide", () => {
    const unit = patternById("oChain").unit();
    const inside = (p: { x: number; y: number }): number => ((p.x - 0.6) / 0.24) ** 2 + ((p.y - 0.4) / 0.4) ** 2;
    const ringStart = unit.findIndex((p) => Math.abs(p.x - 0.6) < 1e-9 && Math.abs(p.y - 0.8) < 1e-9);
    assert.ok(ringStart > 0);
    for (let i = 0; i < ringStart; i += 1) {
      const a = unit[i];
      const b = unit[i + 1];
      for (let t = 0; t <= 1; t += 0.1) {
        const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        assert.ok(inside(p) >= 1 - 1e-6, `connector point ${p.x},${p.y} is inside the ring (${inside(p)})`);
      }
    }
    // The ring does not close: its last point is well away from its first.
    const lastOfRing = unit.findLastIndex((p) => Math.abs(inside(p) - 1) < 1e-6);
    assert.ok(Math.hypot(unit[lastOfRing].x - unit[ringStart].x, unit[lastOfRing].y - unit[ringStart].y) > 0.05);
    // After the ring the way leaves it and stays out.
    for (const p of unit.slice(lastOfRing + 1)) {
      assert.ok(inside(p) >= 1 - 1e-6, `exit point ${p.x},${p.y}`);
    }
    for (let i = 0; i < unit.length; i += 1) {
      for (let j = i + 1; j < unit.length; j += 1) {
        assert.ok(Math.hypot(unit[i].x - unit[j].x, unit[i].y - unit[j].y) > 1e-6, `points ${i} and ${j} coincide`);
      }
    }
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
