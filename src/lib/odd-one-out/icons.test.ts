import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  ICON_BOX,
  ICON_CATEGORIES,
  ICON_CATEGORY_NAMES,
  ICONS,
  iconById,
  iconsOfCategory,
  type IconFigure,
} from "./icons.ts";
import { ODD_ONE_OUT_LEVELS } from "./levels.ts";

/** The coordinates a figure certainly reaches (rotation included). Curves of a path are checked at their end points. */
function reach(figure: IconFigure): { x: number; y: number }[] {
  switch (figure.kind) {
    case "circle":
      return [
        { x: figure.cx - figure.r, y: figure.cy - figure.r },
        { x: figure.cx + figure.r, y: figure.cy + figure.r },
      ];
    case "ellipse": {
      // A turned ellipse reaches at most its longer radius in every direction.
      const rx = figure.rotate === undefined ? figure.rx : Math.max(figure.rx, figure.ry);
      const ry = figure.rotate === undefined ? figure.ry : rx;
      return [
        { x: figure.cx - rx, y: figure.cy - ry },
        { x: figure.cx + rx, y: figure.cy + ry },
      ];
    }
    case "rect": {
      if (figure.rotate === undefined) {
        return [
          { x: figure.x, y: figure.y },
          { x: figure.x + figure.width, y: figure.y + figure.height },
        ];
      }
      const cx = figure.x + figure.width / 2;
      const cy = figure.y + figure.height / 2;
      const radius = Math.hypot(figure.width, figure.height) / 2;
      return [
        { x: cx - radius, y: cy - radius },
        { x: cx + radius, y: cy + radius },
      ];
    }
    case "polygon":
      return figure.points.map(([x, y]) => ({ x, y }));
    case "line":
      return [
        { x: figure.x1, y: figure.y1 },
        { x: figure.x2, y: figure.y2 },
      ];
    case "path": {
      const points: { x: number; y: number }[] = [];
      for (const match of figure.d.matchAll(/([MLQCAZ])([^MLQCAZ]*)/g)) {
        const numbers = (match[2].match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
        if (match[1] === "Z") {
          continue;
        }
        // Every command ends in its last pair: M and L have one pair, Q two, C three, A radii, flags and one pair.
        points.push({ x: numbers[numbers.length - 2], y: numbers[numbers.length - 1] });
      }
      return points;
    }
  }
}

void describe("ICONS", () => {
  void test("five categories with five icons each, 25 in all", () => {
    assert.equal(ICONS.length, 25);
    for (const category of ICON_CATEGORIES) {
      assert.equal(iconsOfCategory(category).length, 5, category);
      assert.ok(ICON_CATEGORY_NAMES[category].length > 0);
    }
    assert.deepEqual(
      ICON_CATEGORIES.map((category) => ICON_CATEGORY_NAMES[category]),
      ["Zwierzęta", "Jedzenie", "Przyroda", "Kosmos i maszyny", "Domy i budowle"],
    );
  });

  void test("every category has enough different icons for the majority of the widest category row", () => {
    // A category row puts itemCount - 1 different icons of one category next to one icon of another.
    const widest = Math.max(...ODD_ONE_OUT_LEVELS.map((level) => level.itemCount));
    for (const category of ICON_CATEGORIES) {
      assert.ok(iconsOfCategory(category).length >= widest - 1, category);
    }
  });

  void test("ids and names are unique and lookups work", () => {
    assert.equal(new Set(ICONS.map((icon) => icon.id)).size, ICONS.length);
    assert.equal(new Set(ICONS.map((icon) => icon.name)).size, ICONS.length);
    assert.equal(iconById("kot")?.category, "zwierzeta");
    assert.equal(iconById("nie ma"), undefined);
  });

  void test("every icon has a silhouette and every figure stays inside the 100 × 100 box", () => {
    for (const icon of ICONS) {
      assert.ok(
        icon.figures.some((figure) => figure.tone === "ink"),
        icon.id,
      );
      for (const figure of icon.figures) {
        const points = reach(figure);
        assert.ok(points.length > 0, `${icon.id} ${figure.kind}`);
        for (const { x, y } of points) {
          assert.ok(
            Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0 && x <= ICON_BOX && y <= ICON_BOX,
            `${icon.id} ${figure.kind} reaches ${x},${y}`,
          );
        }
      }
    }
  });

  void test("polygons have three points or more and strokes have a width", () => {
    for (const icon of ICONS) {
      for (const figure of icon.figures) {
        if (figure.kind === "polygon") {
          assert.ok(figure.points.length >= 3, icon.id);
        }
        if (figure.kind === "path" && figure.strokeWidth !== undefined) {
          assert.ok(figure.strokeWidth > 0, icon.id);
        }
        if (figure.kind === "line") {
          assert.ok(figure.strokeWidth > 0, icon.id);
        }
      }
    }
  });

  void test("the data holds no SVG text", () => {
    assert.ok(!JSON.stringify(ICONS).includes("<"));
  });
});
