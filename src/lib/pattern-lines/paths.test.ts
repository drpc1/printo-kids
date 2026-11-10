import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { patternLinesLevelById } from "./levels.ts";
import { dotProblems, dotsOn, rowGeometry, rowHalfExtent, rowLength, segmentsCross, selfCrossings } from "./paths.ts";
import type { Pt } from "./patterns.ts";
import { PATTERN_LINES_SHEET } from "./sheet.ts";

const corner = (x: number, y: number): Pt => ({ x, y, corner: true });

void describe("selfCrossings", () => {
  void test("a zigzag does not cross itself", () => {
    assert.equal(selfCrossings([corner(0, 0), corner(5, 8), corner(10, 0), corner(15, 8), corner(20, 0)]), 0);
  });

  void test("a figure eight crosses itself once", () => {
    assert.equal(selfCrossings([corner(0, 0), corner(10, 10), corner(10, 0), corner(0, 10), corner(0, 0.5)]), 1);
  });

  void test("segments that only touch at an end do not cross", () => {
    assert.equal(segmentsCross(corner(0, 0), corner(5, 5), corner(5, 5), corner(10, 0)), false);
    assert.equal(segmentsCross(corner(0, 0), corner(10, 10), corner(0, 10), corner(10, 0)), true);
  });
});

void describe("dotsOn", () => {
  const path = [corner(0, 0), corner(20, 12), corner(40, 0)];

  void test("the first and the last point and the corner have dots, and every dot lies on the path", () => {
    const dots = dotsOn(path, 4);
    assert.deepEqual([dots[0].x, dots[0].y], [0, 0]);
    assert.deepEqual([dots[dots.length - 1].x, dots[dots.length - 1].y], [40, 0]);
    assert.ok(dots.some((d) => d.x === 20 && d.y === 12));
    for (const d of dots) {
      const onFirst = Math.abs(d.y - 0.6 * d.x) < 1e-6 && d.x <= 20;
      const onSecond = Math.abs(d.y - 0.6 * (40 - d.x)) < 1e-6 && d.x >= 20;
      assert.ok(onFirst || onSecond, `${d.x},${d.y}`);
    }
  });

  void test("neighbouring dots are at least 0.7 of the spacing apart", () => {
    const dots = dotsOn(path, 4);
    for (let i = 1; i < dots.length; i += 1) {
      assert.ok(Math.hypot(dots[i].x - dots[i - 1].x, dots[i].y - dots[i - 1].y) >= 2.8 - 1e-9);
    }
  });

  void test("a smooth stretch ending just before a corner does not leave a dot next to the corner", () => {
    const curve: Pt[] = [corner(0, 0), { x: 3.6, y: 0 }, { x: 7, y: 0 }, { x: 10.3, y: 0 }, corner(11, 0)];
    const dots = dotsOn(curve, 4);
    for (let i = 1; i < dots.length; i += 1) {
      assert.ok(dots[i].x - dots[i - 1].x >= 2.8 - 1e-9, `${dots[i - 1].x} -> ${dots[i].x}`);
    }
    assert.equal(dots[dots.length - 1].x, 11);
  });

  void test("dotProblems finds neighbours that run together and arms that touch", () => {
    assert.deepEqual(
      dotProblems(
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        0.9,
        3.5,
      ),
      ["neighbours"],
    );
    const arms = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
      { x: 0.5, y: 1 },
    ];
    assert.ok(dotProblems(arms, 0.9, 3.5).includes("arms"));
    assert.deepEqual(dotProblems(arms, 0.9, 3.5, false), []);
  });
});

void describe("rowGeometry", () => {
  const length = rowLength();

  void test("the row is 184 mm long; level 4 takes the ruling from the top line to the faded one", () => {
    assert.equal(length, 184);
    assert.equal(rowHalfExtent(patternLinesLevelById("poziom4")), 9.75);
    // Half the pattern height plus the start ring (dot radius + ring gap + half the ring stroke).
    assert.equal(rowHalfExtent(patternLinesLevelById("poziom2")), 9 + 0.9 + 1.2 + 0.25);
  });

  void test("level 2 dots the whole row, with a ring around the first dot and a pale track", () => {
    const level = patternLinesLevelById("poziom2");
    const geometry = rowGeometry({ patternId: "zigzag", period: 36, height: 12, count: 5 }, level, true);
    assert.equal(geometry.repeatsShown, 5);
    assert.equal(geometry.track, true);
    assert.equal(geometry.lineStroke, null);
    assert.equal(geometry.dotRadius, 0.9);
    assert.deepEqual(geometry.startRing, { x: 0, y: 6, radius: 0.9 + PATTERN_LINES_SHEET.startRingGap });
    const last = geometry.dots[geometry.dots.length - 1];
    assert.ok(Math.abs(last.x - length) < 1e-9);
    assert.deepEqual(geometry.guides, []);
  });

  void test("a flat line has a height of zero", () => {
    const level = patternLinesLevelById("poziom1");
    const geometry = rowGeometry({ patternId: "line", period: 46, height: 0, count: 4 }, level, true);
    assert.ok(geometry.path.every((p) => p.y === 0));
    assert.equal(geometry.dotRadius, 1.1);
  });

  void test("level 3 dots exactly two repeats and nothing after them", () => {
    const level = patternLinesLevelById("poziom3");
    const geometry = rowGeometry({ patternId: "zigzag", period: 26, height: 12, count: 7, traced: 2 }, level, true);
    const step = length / 7;
    assert.equal(geometry.repeatsShown, 2);
    assert.ok(Math.abs(Math.max(...geometry.dots.map((d) => d.x)) - 2 * step) < 1e-9);
    assert.equal(geometry.lineStroke, null);
  });

  void test("level 3 guides: two dashed lines at the top and the bottom of the pattern; off leaves one pale bottom line", () => {
    const level = patternLinesLevelById("poziom3");
    const row = { patternId: "wave", period: 26, height: 12, count: 7, traced: 2 } as const;
    const on = rowGeometry(row, level, true).guides;
    assert.deepEqual(
      on.map((guide) => [guide.y, guide.dash, guide.tone, guide.x2]),
      [
        [-6, "1.2 1.2", "muted", length],
        [6, "1.2 1.2", "muted", length],
      ],
    );
    const off = rowGeometry(row, level, false).guides;
    assert.deepEqual(
      off.map((guide) => [guide.y, guide.dash, guide.tone]),
      [[6, null, "pale"]],
    );
  });

  void test("level 4 draws at least three repeats with a line and has the four-line ruling", () => {
    const level = patternLinesLevelById("poziom4");
    const row = { patternId: "loops", period: 16, count: 11, traced: 4 } as const;
    const geometry = rowGeometry(row, level, true);
    const step = length / 11;
    assert.equal(geometry.lineStroke, 0.6);
    assert.equal(geometry.dots.length, 0);
    assert.equal(geometry.startRing, null);
    assert.equal(geometry.track, false);
    assert.ok(Math.abs(Math.max(...geometry.path.map((p) => p.x)) - 4 * step) < 1e-9);
    assert.deepEqual(
      geometry.guides.map((guide) => guide.y),
      [-9.75, -3.25, 3.25, 9.75],
    );
    assert.deepEqual(
      geometry.guides.map((guide) => guide.tone),
      ["muted", "muted", "muted", "pale"],
    );
  });

  void test("level 4 with Linie off keeps one pale bottom line", () => {
    const level = patternLinesLevelById("poziom4");
    const guides = rowGeometry({ patternId: "loops", period: 16, count: 11, traced: 4 }, level, false).guides;
    assert.deepEqual(
      guides.map((guide) => [guide.y, guide.tone]),
      [[3.25, "pale"]],
    );
  });

  void test("level 4: small letters reach the middle line, tall ones the top line, j g go under the bottom line", () => {
    const level = patternLinesLevelById("poziom4");
    const extent = (patternId: "loops" | "tallShort" | "loopsDown"): number[] => {
      const path = rowGeometry({ patternId, period: 16, count: 11, traced: 4 }, level, true).path;
      return [Math.min(...path.map((p) => p.y)), Math.max(...path.map((p) => p.y))];
    };
    assert.deepEqual(extent("loops"), [-3.25, 3.25]);
    assert.deepEqual(extent("tallShort"), [-9.75, 3.25]);
    assert.deepEqual(extent("loopsDown"), [-3.25, 9.75]);
  });

  void test("Linie does not change the path or the dots", () => {
    const level = patternLinesLevelById("poziom3");
    const row = { patternId: "wave", period: 26, height: 12, count: 7, traced: 2 } as const;
    const on = rowGeometry(row, level, true);
    const off = rowGeometry(row, level, false);
    assert.deepEqual(off.path, on.path);
    assert.deepEqual(off.dots, on.dots);
  });
});
