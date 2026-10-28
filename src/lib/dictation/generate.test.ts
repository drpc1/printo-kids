import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { symmetryTemplatesFor } from "../symmetry/templates.ts";
import {
  dictationCardFor,
  dictationCardProblems,
  dictationVariantCount,
  generateDictationCard,
  variantCombinations,
  type DictationCard,
} from "./generate.ts";
import { DICTATION_LEVELS, DICTATION_LEVEL_LAT6 } from "./levels.ts";
import { dictationSilhouette, outlineProblems, walkCommands, type DictationCommand } from "./outline.ts";

const LEVEL = DICTATION_LEVEL_LAT6;

/** A small deterministic generator for tests that need many draws. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function cardAt(random: () => number, previousKey: string | null = null): DictationCard {
  const card = generateDictationCard(random, previousKey, LEVEL);
  assert.ok(card);
  return card;
}

void describe("dictationVariantCount", () => {
  void test("counts every combination, keeps a part of them and finds at least two distinct outlines", () => {
    const count = dictationVariantCount(LEVEL);

    assert.ok(count.total >= count.passing);
    assert.ok(count.passing >= count.distinctOutlines);
    assert.ok(count.distinctOutlines >= 2);
  });

  void test("rejects the strawberry combinations with the second leaves variant", () => {
    const strawberry = symmetryTemplatesFor(LEVEL.templateLevel).find((template) => template.id === "truskawka");
    assert.ok(strawberry);
    const rejected = strawberry.parts[1].variants.map(
      (_, seeds) => outlineProblems(dictationSilhouette(strawberry, [1, seeds])).length,
    );

    assert.ok(rejected.every((problems) => problems > 0));
    assert.ok(dictationVariantCount(LEVEL).passing < dictationVariantCount(LEVEL).total);
  });
});

void describe("generateDictationCard", () => {
  void test("every passing variant of today's templates gives a card without problems", () => {
    for (const template of symmetryTemplatesFor(LEVEL.templateLevel)) {
      for (const variants of variantCombinations(template.parts.map((part) => part.variants.length))) {
        if (outlineProblems(dictationSilhouette(template, variants)).length > 0) {
          continue;
        }
        const card = dictationCardFor(template, variants, LEVEL);

        assert.ok(card, `${template.id} ${variants.join("-")}`);
        assert.deepEqual(dictationCardProblems(card), [], `${template.id} ${variants.join("-")}`);
      }
    }
  });

  void test("many generated cards have no problems, fit the command limit and keep one free cell around the object", () => {
    const random = seeded(7);
    let previousKey: string | null = null;
    for (let index = 0; index < 100; index += 1) {
      const card = cardAt(random, previousKey);

      assert.deepEqual(dictationCardProblems(card), []);
      assert.ok(card.commands.length <= LEVEL.maxCommands);
      assert.equal(card.columns, 14);
      assert.equal(card.rows, 17);
      const cols = card.outline.map((cell) => cell.col);
      const rows = card.outline.map((cell) => cell.row);
      assert.ok(Math.min(...cols) >= 1 && Math.max(...cols) <= card.columns - 2);
      assert.ok(Math.min(...rows) >= 1 && Math.max(...rows) <= card.rows - 2);
      previousKey = card.key;
    }
  });

  void test("the commands walk from the start back to the start", () => {
    const card = cardAt(seeded(3));
    const vertices = walkCommands({ x: card.start.col, y: card.start.row }, card.commands);

    assert.deepEqual(vertices[0], vertices[vertices.length - 1]);
  });

  void test("two consecutive cards never share a key, and the first command is right", () => {
    const random = seeded(11);
    let previousKey: string | null = null;
    for (let index = 0; index < 100; index += 1) {
      const card = cardAt(random, previousKey);

      assert.notEqual(card.key, previousKey);
      assert.equal(card.commands[0].direction, "right");
      previousKey = card.key;
    }
  });

  void test("a constant random still avoids the previous key", () => {
    const first = cardAt(() => 0);

    assert.notEqual(cardAt(() => 0, first.key).key, first.key);
  });

  void test("a random that returns its highest value still gives a valid card", () => {
    const card = cardAt(() => 0.9999999999);

    assert.deepEqual(dictationCardProblems(card), []);
  });

  void test("many draws reach several different outlines on every level", () => {
    for (const level of DICTATION_LEVELS) {
      const random = seeded(21);
      const keys = new Set<string>();
      let previousKey: string | null = null;
      for (let index = 0; index < 200; index += 1) {
        const card = generateDictationCard(random, previousKey, level);
        assert.ok(card, level.id);
        keys.add(card.key);
        previousKey = card.key;
      }

      assert.ok(dictationVariantCount(level).distinctOutlines >= 5, level.id);
      assert.ok(keys.size >= 5, `${level.id} drew only ${keys.size} outlines`);
    }
  });

  void test("the same random gives the same card", () => {
    assert.deepEqual(cardAt(seeded(5)), cardAt(seeded(5)));
  });
});

void describe("every dictation level", () => {
  void test("gives distinct valid cards that fit the level grid and its command limit", () => {
    for (const level of DICTATION_LEVELS) {
      const count = dictationVariantCount(level);
      assert.ok(count.distinctOutlines >= 2, level.id);

      const random = seeded(13);
      let previousKey: string | null = null;
      for (let index = 0; index < 60; index += 1) {
        const card = generateDictationCard(random, previousKey, level);
        assert.ok(card, level.id);
        assert.equal(card.levelId, level.id);
        assert.equal(card.columns, level.columns);
        assert.equal(card.cellSize, level.cellSize);
        assert.deepEqual(dictationCardProblems(card), [], level.id);
        assert.ok(card.commands.length <= level.maxCommands, level.id);
        assert.notEqual(card.key, previousKey);
        previousKey = card.key;
      }
    }
  });

  void test("the grids grow and the cells shrink with the age", () => {
    const [lat5, lat6, lat7] = DICTATION_LEVELS;

    assert.ok(lat5.cellSize > lat6.cellSize && lat6.cellSize > lat7.cellSize);
    assert.ok(lat5.columns < lat6.columns && lat6.columns < lat7.columns);
  });
});

void describe("dictationCardProblems", () => {
  const card = cardAt(seeded(1));

  void test("flags commands that do not close", () => {
    const open: DictationCard = { ...card, commands: card.commands.slice(0, -1) };

    assert.ok(dictationCardProblems(open).includes("not-closed"));
  });

  void test("flags a zero-length command and two equal consecutive directions", () => {
    const [first, ...rest] = card.commands;

    assert.ok(dictationCardProblems({ ...card, commands: [{ ...first, length: 0 }, ...rest] }).includes("bad-length"));
    assert.ok(
      dictationCardProblems({
        ...card,
        commands: [{ direction: first.direction, length: 1 }, { ...first, length: first.length - 1 }, ...rest],
      }).includes("same-direction"),
    );
  });

  void test("flags a start on the outer cell ring of the grid", () => {
    const moved: DictationCard = { ...card, start: { col: 0, row: card.start.row } };

    assert.ok(dictationCardProblems(moved).includes("outside-margin"));
  });

  void test("flags commands that do not follow the silhouette", () => {
    const shifted: DictationCard = { ...card, outline: card.outline.slice(1) };

    assert.ok(dictationCardProblems(shifted).includes("not-the-outline"));
  });
});

void describe("dictationCardProblems on hand-built cards", () => {
  // Two cells side by side, traced clockwise from the top-left corner: right 2, down 1, left 2, up 1.
  const RECTANGLE: readonly DictationCommand[] = [
    { direction: "right", length: 2 },
    { direction: "down", length: 1 },
    { direction: "left", length: 2 },
    { direction: "up", length: 1 },
  ];

  /** The rectangle with its top-left corner at the given vertex, on a 6 by 5 grid. */
  function rectangleAt(col: number, row: number, commands: readonly DictationCommand[] = RECTANGLE): DictationCard {
    return {
      levelId: LEVEL.id,
      columns: 6,
      rows: 5,
      cellSize: LEVEL.cellSize,
      start: { col, row },
      commands,
      outline: [
        { col, row },
        { col: col + 1, row },
      ],
      key: "hand-built",
    };
  }

  void test("a clean rectangle has no problems, also with the outline on the last allowed lines", () => {
    assert.deepEqual(dictationCardProblems(rectangleAt(1, 1)), []);
    assert.deepEqual(dictationCardProblems(rectangleAt(3, 3)), []);
  });

  void test("a path that ends on the start row but not the start column is not closed", () => {
    const open = rectangleAt(1, 1, [{ direction: "right", length: 2 }]);

    assert.ok(dictationCardProblems(open).includes("not-closed"));
  });

  void test("no commands at all is its own problem", () => {
    const empty = { ...rectangleAt(1, 1), commands: [] };

    assert.ok(dictationCardProblems(empty).includes("no-commands"));
  });

  void test("a path that crosses itself repeats a vertex", () => {
    const crossing: readonly DictationCommand[] = [
      { direction: "right", length: 2 },
      { direction: "down", length: 1 },
      { direction: "left", length: 1 },
      { direction: "up", length: 1 },
    ];

    assert.ok(dictationCardProblems(rectangleAt(1, 1, crossing)).includes("repeated-vertex"));
  });

  void test("a closed path that touches itself at a corner repeats a vertex", () => {
    const touching: readonly DictationCommand[] = [
      { direction: "right", length: 1 },
      { direction: "down", length: 1 },
      { direction: "right", length: 1 },
      { direction: "down", length: 1 },
      { direction: "left", length: 1 },
      { direction: "up", length: 1 },
      { direction: "left", length: 1 },
      { direction: "up", length: 1 },
    ];
    const problems = dictationCardProblems(rectangleAt(1, 1, touching));

    assert.ok(problems.includes("repeated-vertex"));
    assert.ok(!problems.includes("not-closed"));
  });

  void test("the start vertex is not a repeat when the path simply closes", () => {
    assert.ok(!dictationCardProblems(rectangleAt(1, 1)).includes("repeated-vertex"));
  });

  void test("a path that leaves the free ring on any of the four sides is outside the margin", () => {
    // 6 by 5 grid: vertices must stay within columns 1..5 and rows 1..4.
    assert.ok(dictationCardProblems(rectangleAt(0, 1)).includes("outside-margin"));
    assert.ok(dictationCardProblems(rectangleAt(4, 1)).includes("outside-margin"));
    assert.ok(dictationCardProblems(rectangleAt(1, 0)).includes("outside-margin"));
    assert.ok(dictationCardProblems(rectangleAt(1, 4)).includes("outside-margin"));
    assert.ok(!dictationCardProblems(rectangleAt(3, 1)).includes("outside-margin"));
    assert.ok(!dictationCardProblems(rectangleAt(1, 3)).includes("outside-margin"));
  });

  void test("the same outline walked counter-clockwise is not the outline the child must draw", () => {
    const counterClockwise: readonly DictationCommand[] = [
      { direction: "down", length: 1 },
      { direction: "right", length: 2 },
      { direction: "up", length: 1 },
      { direction: "left", length: 2 },
    ];
    const problems = dictationCardProblems(rectangleAt(1, 1, counterClockwise));

    assert.ok(problems.includes("not-the-outline"));
    assert.ok(!problems.includes("not-closed"));
  });
});
