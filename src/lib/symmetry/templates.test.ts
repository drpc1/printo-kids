import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { SymmetryLevelId } from "./levels.ts";
import { drawing } from "./template-format.ts";
import { OBJECT_CATEGORIES, symmetryTemplatesFor, type SymmetryTemplate } from "./templates.ts";
// TEMP gh198 report imports (removed in phase 2)
import { KSZTALTY } from "./objects/ksztalty.ts";
import { composeSymmetryCard, symmetryCardProblems } from "./generate.ts";
import { symmetryLevelById } from "./levels.ts";
import { composeNonogramCard, nonogramCardProblems } from "../nonogram/generate.ts";
import { composeSimpleNonogramCard, simpleNonogramProblems } from "../nonogram/simple.ts";
import { nonogramSizeById } from "../nonogram/sizes.ts";
import { dictationCardFor, variantCombinations } from "../dictation/generate.ts";
import { dictationLevelById } from "../dictation/levels.ts";
import type { SymmetryObjectSizes } from "./template-format.ts";

// TEMP gh198 report: which figures of Kształty pass the rules of the three cards (removed in phase 2).
void describe("ksztalty report", () => {
  const sizes: [keyof SymmetryObjectSizes, SymmetryLevelId, "latwy" | "sredni" | "trudny", "lat5" | "lat6" | "lat7"][] =
    [
      ["half4", "lat4", "latwy", "lat5"],
      ["half6", "lat5", "sredni", "lat6"],
      ["half9", "lat7", "trudny", "lat7"],
    ];
  void test("report", () => {
    const lines: string[] = [];
    for (const [half, symLevel, nonoSize, dictLevel] of sizes) {
      for (const template of KSZTALTY[half]) {
        const sets = variantSets(template);
        const clean = sets.filter((variants) => isCleanOutline(silhouette(template, variants))).length;
        const level = symmetryLevelById(symLevel);
        const symBad = new Set<string>();
        let symOk = 0;
        for (const variants of sets) {
          const problems = symmetryCardProblems(composeSymmetryCard(template, variants, 0, level));
          if (problems.length === 0) {
            symOk += 1;
          }
          problems.forEach((problem) => symBad.add(problem));
        }
        const size = nonogramSizeById(nonoSize);
        let nonoOk = 0;
        for (const variants of sets) {
          const problems =
            size.kind === "znaczki"
              ? simpleNonogramProblems(composeSimpleNonogramCard(template, variants, size))
              : nonogramCardProblems(composeNonogramCard(template, variants, size));
          if (problems.length === 0) {
            nonoOk += 1;
          }
        }
        const dict = dictationLevelById(dictLevel);
        const outlines = new Set<string>();
        for (const variants of variantCombinations(template.parts.map((part) => part.variants.length))) {
          const card = dictationCardFor(template, variants, dict);
          if (card !== null && card.commands.length <= dict.maxCommands) {
            outlines.add(card.key);
          }
        }
        lines.push(
          `${half} ${template.id.padEnd(8)} ${template.width}x${template.height} sets=${sets.length} clean=${clean} sym=${symOk}${symBad.size > 0 ? ` (${[...symBad].join(",")})` : ""} nono=${nonoOk} dict=${outlines.size}`,
        );
      }
    }
    console.log(`\n${lines.join("\n")}`);
  });
});

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

  void test("the car and the bus are in Kosmos i maszyny in every size", () => {
    for (const { levelId } of SIZES) {
      const kosmos = symmetryTemplatesFor(levelId, "kosmos").map((template) => template.id);

      assert.ok(kosmos.includes("auto"), `${levelId} auto`);
      assert.ok(kosmos.includes("autobus"), `${levelId} autobus`);
    }
  });

  void test("the anchor is in Kosmos i maszyny and the lollipop in Jedzenie in every size", () => {
    for (const { levelId } of SIZES) {
      assert.ok(
        symmetryTemplatesFor(levelId, "kosmos").some((template) => template.id === "kotwica"),
        `${levelId} kotwica`,
      );
      assert.ok(
        symmetryTemplatesFor(levelId, "jedzenie").some((template) => template.id === "lizak"),
        `${levelId} lizak`,
      );
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
