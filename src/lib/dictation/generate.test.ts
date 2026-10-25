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
import { DICTATION_LEVEL_LAT6 } from "./levels.ts";
import { dictationSilhouette, outlineProblems, walkCommands } from "./outline.ts";
import { DICTATION_MAX_COMMANDS } from "./sheet.ts";

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
      assert.ok(card.commands.length <= DICTATION_MAX_COMMANDS);
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

  void test("the same random gives the same card", () => {
    assert.deepEqual(cardAt(seeded(5)), cardAt(seeded(5)));
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
