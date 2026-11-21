import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { dictationShapesFor } from "../dictation/shapes.ts";
import { OBJECT_CATEGORY_CHOICES, symmetryTemplatesFor } from "../symmetry/templates.ts";
import { copyDrawingProblems } from "./card.ts";
import { composeCopyDrawingCard, generateCopyDrawingCard } from "./generate.ts";
import { COPY_DRAWING_LEVELS } from "./levels.ts";

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

void describe("generateCopyDrawingCard", () => {
  for (const level of COPY_DRAWING_LEVELS) {
    for (const choice of OBJECT_CATEGORY_CHOICES) {
      void test(`${level.id}, ${choice.id}: at least two different legal cards, the next one differs`, () => {
        const random = mulberry32(7);
        const first = generateCopyDrawingCard(random, null, level, choice.id);
        assert.ok(first !== null);
        assert.deepEqual(copyDrawingProblems(first, level), []);
        const second = generateCopyDrawingCard(random, first.key, level, choice.id);
        assert.ok(second !== null);
        assert.notEqual(second.key, first.key);
        assert.deepEqual(copyDrawingProblems(second, level), []);
      });
    }
  }

  void test("every level draws templates, shapes and both flips, and never the horizontal key", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      const random = mulberry32(21);
      let previous: string | null = null;
      const kinds = new Set<string>();
      const flips = new Set<boolean>();
      for (let count = 0; count < 300; count += 1) {
        const card = generateCopyDrawingCard(random, previous, level, "wszystkie");
        assert.ok(card !== null);
        kinds.add(card.picture.kind);
        if (card.picture.kind === "shape") {
          flips.add(card.picture.mirrored);
          assert.notEqual(card.picture.shapeId, "klucz-poziomy");
        }
        previous = card.key;
      }
      assert.deepEqual([...kinds].sort(), ["shape", "template"], level.id);
      assert.deepEqual([...flips].sort(), [false, true], level.id);
    }
  });

  void test("a shape of another category never appears, and a Christmas shape appears in its category", () => {
    const easy = COPY_DRAWING_LEVELS[0];
    const random = mulberry32(8);
    const shapeIds = new Set<string>();
    let previous: string | null = null;
    for (let count = 0; count < 200; count += 1) {
      const card = generateCopyDrawingCard(random, previous, easy, "boze-narodzenie");
      assert.ok(card !== null);
      if (card.picture.kind === "shape") {
        shapeIds.add(card.picture.shapeId);
      }
      previous = card.key;
    }
    assert.ok(shapeIds.has("skarpeta"));
    const allowed = new Set(dictationShapesFor("lat5", "boze-narodzenie").map((shape) => shape.id));
    assert.ok([...shapeIds].every((id) => allowed.has(id)));
    // "Domy i budowle" has the vertical key, not the horizontal one.
    const houses = new Set<string>();
    for (let count = 0; count < 200; count += 1) {
      const card = generateCopyDrawingCard(random, previous, easy, "budowle");
      assert.ok(card !== null);
      if (card.picture.kind === "shape") {
        houses.add(card.picture.shapeId);
      }
      previous = card.key;
    }
    assert.ok(houses.has("klucz-pionowy"));
    assert.ok(!houses.has("klucz-poziomy"));
  });

  void test("every object has the same chance: the i-th of the pool is drawn when random falls in its i-th share", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      const templates = symmetryTemplatesFor(level.size.templateLevel, "wszystkie");
      const shapes = dictationShapesFor(level.dictationLevel, "wszystkie").filter((shape) => shape.onCopyDrawing);
      const count = templates.length + shapes.length;
      for (let index = 0; index < count; index += 1) {
        const values = [(index + 0.5) / count];
        const card = generateCopyDrawingCard(() => values.shift() ?? 0, null, level, "wszystkie");
        assert.ok(card !== null, `${level.id} ${index}`);
        if (index < templates.length) {
          assert.equal(card.picture.kind === "template" && card.picture.templateId, templates[index].id);
        } else {
          const shape = shapes[index - templates.length];
          assert.deepEqual(card.picture, { kind: "shape", shapeId: shape.id, mirrored: false });
        }
      }
    }
  });

  void test("the flip is drawn at one half and above, the straight shape below", () => {
    const level = COPY_DRAWING_LEVELS[1];
    const templates = symmetryTemplatesFor(level.size.templateLevel, "wszystkie");
    const shapes = dictationShapesFor(level.dictationLevel, "wszystkie").filter((shape) => shape.onCopyDrawing);
    const first = (templates.length + 0.5) / (templates.length + shapes.length);
    const draw = (flip: number) => {
      const values = [first, flip];
      return generateCopyDrawingCard(() => values.shift() ?? 0, null, level, "wszystkie");
    };
    assert.deepEqual(draw(0.49)?.picture, { kind: "shape", shapeId: shapes[0].id, mirrored: false });
    assert.deepEqual(draw(0.5)?.picture, { kind: "shape", shapeId: shapes[0].id, mirrored: true });
  });

  void test("a card composed from a picture is the card the generator makes", () => {
    const level = COPY_DRAWING_LEVELS[2];
    const card = generateCopyDrawingCard(mulberry32(4), null, level, "wszystkie");
    assert.ok(card !== null);
    assert.deepEqual(composeCopyDrawingCard(card.picture, level), card);
  });

  void test("a repeat is only refused by key: the same seed and the previous key give another card", () => {
    const level = COPY_DRAWING_LEVELS[1];
    const first = generateCopyDrawingCard(mulberry32(5), null, level, "wszystkie");
    assert.ok(first !== null);
    const second = generateCopyDrawingCard(mulberry32(5), first.key, level, "wszystkie");
    assert.notEqual(second?.key, first.key);
  });

  void test("a random source that always draws the same card runs out of attempts and gives null", () => {
    const level = COPY_DRAWING_LEVELS[0];
    const constant = () => 0.5;
    const only = generateCopyDrawingCard(constant, null, level, "wszystkie");
    assert.ok(only !== null);
    assert.equal(generateCopyDrawingCard(constant, only.key, level, "wszystkie"), null);
  });

  void test("a category without objects gives null", () => {
    const level = COPY_DRAWING_LEVELS[0];
    assert.equal(generateCopyDrawingCard(mulberry32(1), null, level, "nie-ma" as "wszystkie"), null);
  });

  void test("200 cards come out in under 2 seconds", () => {
    const random = mulberry32(11);
    let previous: string | null = null;
    const start = performance.now();
    for (let count = 0; count < 200; count += 1) {
      const level = COPY_DRAWING_LEVELS[count % COPY_DRAWING_LEVELS.length];
      const card = generateCopyDrawingCard(random, previous, level, "wszystkie");
      assert.ok(card !== null);
      previous = card.key;
    }
    assert.ok(performance.now() - start < 2000);
  });
});
