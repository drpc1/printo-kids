import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { SymmetryLevelId } from "./levels.ts";
import { drawing } from "./template-format.ts";
import { OBJECT_CATEGORIES, symmetryTemplatesFor, type SymmetryTemplate } from "./templates.ts";

/** One level per half size: 4 by 12, 6 by 15 (shared by 5 and 6 lat), 9 by 24. */
const SIZES: readonly { levelId: SymmetryLevelId; width: number }[] = [
  { levelId: "lat4", width: 4 },
  { levelId: "lat5", width: 6 },
  { levelId: "lat7", width: 9 },
];

/**
 * No variant of today's strawberry is one piece without a corner touch (its leaves and seeds touch at corners); the
 * graphic dictation skips it. Every other object must leave the dictation at least one clean outline.
 */
const CORNER_TOUCH_ALLOWED = new Set(["truskawka"]);

void describe("template catalog", () => {
  void test("every size has the same objects with the same categories", () => {
    const catalogOf = (levelId: SymmetryLevelId): string[] =>
      symmetryTemplatesFor(levelId)
        .map((template) => `${template.id}:${template.categories.join("+")}`)
        .sort();

    assert.deepEqual(catalogOf("lat5"), catalogOf("lat4"));
    assert.deepEqual(catalogOf("lat7"), catalogOf("lat4"));
  });

  void test("every object has at least one known category and appears once per size", () => {
    const known = new Set<string>(OBJECT_CATEGORIES.map((category) => category.id));
    for (const { levelId } of SIZES) {
      const templates = symmetryTemplatesFor(levelId);

      assert.equal(new Set(templates.map((template) => template.id)).size, templates.length, levelId);
      for (const template of templates) {
        assert.ok(template.categories.length > 0, `${levelId} ${template.id}`);
        assert.ok(
          template.categories.every((category) => known.has(category)),
          `${levelId} ${template.id}`,
        );
      }
    }
  });

  void test("every category has at least four objects in every size", () => {
    for (const { levelId } of SIZES) {
      for (const category of OBJECT_CATEGORIES) {
        const objects = symmetryTemplatesFor(levelId).filter((template) => template.categories.includes(category.id));

        assert.ok(objects.length >= 4, `${levelId} ${category.label}: ${objects.length}`);
      }
    }
  });

  void test("4 lat templates are 4 wide, 5 and 6 lat ones 6 wide, 7 lat ones at most 9 wide", () => {
    for (const { levelId, width } of SIZES) {
      for (const template of symmetryTemplatesFor(levelId)) {
        if (levelId === "lat7") {
          assert.ok(template.width <= width, template.id);
        } else {
          assert.equal(template.width, width, `${levelId} ${template.id}`);
        }
      }
    }
  });

  void test("every object in every size has a variant set whose silhouette is one piece without a corner touch", () => {
    for (const { levelId } of SIZES) {
      for (const template of symmetryTemplatesFor(levelId)) {
        if (CORNER_TOUCH_ALLOWED.has(template.id)) {
          continue;
        }

        assert.ok(
          variantSets(template).some((variants) => isCleanOutline(silhouette(template, variants))),
          `${levelId} ${template.id}`,
        );
      }
    }
  });

  void test("the clean outline check rejects a corner touch and two pieces, and accepts a ring (hand-written oracle)", () => {
    assert.equal(isCleanOutline(new Set(["0,0", "1,1", "0,1"])), true);
    assert.equal(isCleanOutline(new Set(["0,0", "1,1"])), false);
    assert.equal(isCleanOutline(new Set(["0,0", "2,0"])), false);
    assert.equal(isCleanOutline(new Set(["0,0", "1,0", "2,0", "0,1", "2,1", "0,2", "1,2", "2,2"])), true);
  });

  void test("the letter n draws a brown cell", () => {
    assert.deepEqual(drawing([".n"], 2, 1), [{ col: 2, row: 2, color: "brown" }]);
  });
});

/** The whole silhouette (the half and its mirror) of one variant set, as "col,row" places. */
function silhouette(template: SymmetryTemplate, variants: readonly number[]): Set<string> {
  const cells = [...template.base, ...template.parts.flatMap((part, index) => part.variants[variants[index]])];
  const places = new Set<string>();
  for (const cell of cells) {
    places.add(`${cell.col},${cell.row}`);
    places.add(`${2 * template.width - 1 - cell.col},${cell.row}`);
  }
  return places;
}

/** One 4-connected piece, and no two filled cells that meet only at a corner. */
function isCleanOutline(places: ReadonlySet<string>): boolean {
  const filled = (col: number, row: number): boolean => places.has(`${col},${row}`);
  for (const place of places) {
    const [col, row] = place.split(",").map(Number);
    for (const side of [-1, 1]) {
      if (filled(col + side, row + 1) && !filled(col + side, row) && !filled(col, row + 1)) {
        return false;
      }
    }
  }
  const [first] = places;
  const reached = new Set([first]);
  const queue = [first];
  for (let place = queue.pop(); place !== undefined; place = queue.pop()) {
    const [col, row] = place.split(",").map(Number);
    for (const next of [`${col + 1},${row}`, `${col - 1},${row}`, `${col},${row + 1}`, `${col},${row - 1}`]) {
      if (places.has(next) && !reached.has(next)) {
        reached.add(next);
        queue.push(next);
      }
    }
  }
  return reached.size === places.size;
}

function variantSets(template: SymmetryTemplate): number[][] {
  let sets: number[][] = [[]];
  for (const part of template.parts) {
    sets = sets.flatMap((set) => part.variants.map((_, index) => [...set, index]));
  }
  return sets;
}
