import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { dictationCardFromSilhouette, dictationCardProblems, generateDictationCard } from "./generate.ts";
import { DICTATION_LEVELS, type DictationLevelId } from "./levels.ts";
import { outlineProblems, silhouetteOfCells } from "./outline.ts";
import { DICTATION_SHAPES, dictationShapesFor, shapeSilhouette, type DictationShape } from "./shapes.ts";

function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function levelIdsOf(shape: DictationShape): DictationLevelId[] {
  return DICTATION_LEVELS.filter((level) => shape.byLevel[level.id] !== undefined).map((level) => level.id);
}

void describe("dictation shapes", () => {
  void test("the catalog has shapes, each with an id, a category and at least one level", () => {
    assert.ok(DICTATION_SHAPES.length > 0);
    const ids = DICTATION_SHAPES.map((shape) => shape.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const shape of DICTATION_SHAPES) {
      assert.ok(shape.categories.length > 0, shape.id);
      assert.ok(levelIdsOf(shape).length > 0, shape.id);
    }
  });

  void test("every shape at every drawn level, plain and mirrored, gives a card without problems within the command limit", () => {
    for (const shape of DICTATION_SHAPES) {
      for (const level of DICTATION_LEVELS) {
        if (shape.byLevel[level.id] === undefined) {
          continue;
        }
        for (const mirrored of [false, true]) {
          const label = `${shape.id} ${level.id} ${mirrored ? "mirrored" : "plain"}`;
          const silhouette = shapeSilhouette(shape, level.id, mirrored);
          assert.deepEqual(outlineProblems(silhouette), [], label);
          const card = dictationCardFromSilhouette(silhouette, level);
          assert.ok(card, label);
          assert.deepEqual(dictationCardProblems(card), [], label);
          assert.ok(card.commands.length <= level.maxCommands, label);
        }
      }
    }
  });

  void test("no shape is symmetric left to right, so its mirror image is another outline", () => {
    for (const shape of DICTATION_SHAPES) {
      for (const level of DICTATION_LEVELS) {
        if (shape.byLevel[level.id] === undefined) {
          continue;
        }
        const plain = dictationCardFromSilhouette(shapeSilhouette(shape, level.id, false), level);
        const mirror = dictationCardFromSilhouette(shapeSilhouette(shape, level.id, true), level);
        assert.ok(plain && mirror, `${shape.id} ${level.id}`);
        assert.notEqual(plain.key, mirror.key, `${shape.id} ${level.id}`);
      }
    }
  });

  void test("a level without a drawing gives no shape and no silhouette", () => {
    const partial: DictationShape = { id: "partial", categories: ["zwierzeta"], byLevel: { lat6: ["##", "##"] } };

    assert.throws(() => shapeSilhouette(partial, "lat5", false), /no drawing for lat5/);
    assert.deepEqual(dictationShapesFor("lat5", "wszystkie", [partial]), []);
    assert.deepEqual(dictationShapesFor("lat6", "wszystkie", [partial]), [partial]);
    assert.deepEqual(dictationShapesFor("lat6", "jedzenie", [partial]), []);
  });

  void test("rows of different length are a broken drawing", () => {
    const ragged: DictationShape = { id: "ragged", categories: ["zwierzeta"], byLevel: { lat5: ["###", "##"] } };

    assert.throws(() => shapeSilhouette(ragged, "lat5", false), /row of 2 cells in a 3 wide drawing/);
  });

  void test("enclosed empty cells are filled: the child draws only the outer line", () => {
    const ring = silhouetteOfCells(
      [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 2, row: 0 },
        { col: 0, row: 1 },
        { col: 2, row: 1 },
        { col: 0, row: 2 },
        { col: 1, row: 2 },
        { col: 2, row: 2 },
      ],
      3,
      3,
    );

    assert.equal(ring.cells.length, 9);
  });

  void test("a shape only comes in its own categories", () => {
    for (const shape of DICTATION_SHAPES) {
      for (const level of levelIdsOf(shape)) {
        assert.ok(dictationShapesFor(level).includes(shape), shape.id);
        for (const category of shape.categories) {
          assert.ok(dictationShapesFor(level, category).includes(shape), `${shape.id} in ${category}`);
        }
        assert.equal(dictationShapesFor(level, "jedzenie").includes(shape), shape.categories.includes("jedzenie"));
      }
    }
  });
});

void describe("the approved shapes", () => {
  const ids = (levelId: DictationLevelId): string[] => dictationShapesFor(levelId).map((shape) => shape.id);

  void test("the fish, the duck and the helicopter come on the medium and hard levels only", () => {
    for (const id of ["ryba", "kaczka", "helikopter"]) {
      assert.ok(!ids("lat5").includes(id), `${id} at lat5`);
      assert.ok(ids("lat6").includes(id), `${id} at lat6`);
      assert.ok(ids("lat7").includes(id), `${id} at lat7`);
    }
  });

  void test("the other shapes come on all three levels", () => {
    const everywhere = [
      "dinozaur",
      "lokomotywa",
      "ciezarowka",
      "statek",
      "lodka-z-masztem",
      "parasol",
      "klucz-pionowy",
      "klucz-poziomy",
    ];
    for (const id of everywhere) {
      for (const level of DICTATION_LEVELS) {
        assert.ok(ids(level.id).includes(id), `${id} at ${level.id}`);
      }
    }
  });

  void test("each shape sits in the approved category", () => {
    const categoryOf = (id: string): readonly string[] | undefined =>
      DICTATION_SHAPES.find((shape) => shape.id === id)?.categories;

    assert.deepEqual(categoryOf("ryba"), ["zwierzeta"]);
    assert.deepEqual(categoryOf("kaczka"), ["zwierzeta"]);
    assert.deepEqual(categoryOf("dinozaur"), ["zwierzeta"]);
    for (const id of ["lokomotywa", "helikopter", "ciezarowka", "statek", "lodka-z-masztem"]) {
      assert.deepEqual(categoryOf(id), ["kosmos"], id);
    }
    assert.deepEqual(categoryOf("parasol"), ["przyroda"]);
    assert.deepEqual(categoryOf("klucz-pionowy"), ["budowle"]);
    assert.deepEqual(categoryOf("klucz-poziomy"), ["budowle"]);
  });
});

void describe("dictation cards from shapes", () => {
  void test("Generuj reaches every shape, plain and mirrored, in its own category at every level it is drawn for", () => {
    for (const shape of DICTATION_SHAPES) {
      for (const level of DICTATION_LEVELS) {
        if (shape.byLevel[level.id] === undefined) {
          continue;
        }
        const wanted = new Set(
          [false, true].map((mirrored) => {
            const card = dictationCardFromSilhouette(shapeSilhouette(shape, level.id, mirrored), level);
            assert.ok(card);
            return card.key;
          }),
        );
        const random = seeded(17);
        const seen = new Set<string>();
        let previous: string | null = null;
        for (let draw = 0; draw < 300; draw += 1) {
          const card = generateDictationCard(random, previous, level, shape.categories[0]);
          assert.ok(card);
          seen.add(card.key);
          previous = card.key;
        }
        for (const key of wanted) {
          assert.ok(seen.has(key), `${shape.id} ${level.id} ${key}`);
        }
      }
    }
  });
});
