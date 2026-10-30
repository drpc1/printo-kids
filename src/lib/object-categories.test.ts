import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DICTATION_LEVELS } from "./dictation/levels.ts";
import { dictationVariantCount, generateDictationCard, type DictationCard } from "./dictation/generate.ts";
import {
  nonogramCardProblems,
  composeNonogramCard,
  generateNonogramCard,
  nonogramVariants,
} from "./nonogram/generate.ts";
import { composeSimpleNonogramCard, simpleNonogramProblems } from "./nonogram/simple.ts";
import { NONOGRAM_SIZES } from "./nonogram/sizes.ts";
import { generateSymmetryCard, type SymmetryCard } from "./symmetry/generate.ts";
import { SYMMETRY_LEVELS } from "./symmetry/levels.ts";
import {
  OBJECT_CATEGORIES,
  OBJECT_CATEGORY_CHOICES,
  symmetryTemplatesFor,
  type ObjectCategoryChoiceId,
} from "./symmetry/templates.ts";

const DRAWS = 40;
const CATEGORIES = OBJECT_CATEGORIES.map((category) => category.id);

/** The template id inside a card key: symmetry "level:template:...", nonogram "size:template:...". */
function templateOf(key: string): string {
  return key.split(":")[1];
}

/** A deterministic stream that still visits many draws, so a few draws cover the catalog. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Ids of the objects that list the category themselves, read from the full catalog and not from the filter under test. */
function idsOf(levelId: (typeof SYMMETRY_LEVELS)[number]["id"], category: ObjectCategoryChoiceId): Set<string> {
  const all = symmetryTemplatesFor(levelId, "wszystkie");
  const own = category === "wszystkie" ? all : all.filter((template) => template.categories.includes(category));
  return new Set(own.map((template) => template.id));
}

function drawn<Card>(card: Card | null): Card {
  assert.notEqual(card, null);
  return card as Card;
}

void describe("category choices", () => {
  void test("the bar lists Wszystkie first, then the six categories, each once", () => {
    assert.equal(OBJECT_CATEGORY_CHOICES[0].id, "wszystkie");
    assert.deepEqual(
      OBJECT_CATEGORY_CHOICES.slice(1).map((choice) => choice.id),
      CATEGORIES,
    );
    assert.deepEqual(
      OBJECT_CATEGORY_CHOICES.map((choice) => choice.label),
      ["Wszystkie", "Zwierzęta", "Jedzenie", "Przyroda", "Kosmos i maszyny", "Domy i budowle", "Kształty"],
    );
  });

  void test("Wszystkie is every object and each category is a proper non-empty part of it", () => {
    for (const level of SYMMETRY_LEVELS) {
      const all = idsOf(level.id, "wszystkie");
      for (const category of CATEGORIES) {
        const part = idsOf(level.id, category);
        assert.ok(part.size > 0, `${category} has no object at ${level.id}`);
        assert.ok(part.size < all.size, `${category} is not a part of all at ${level.id}`);
        for (const id of part) {
          assert.ok(all.has(id));
        }
      }
    }
  });
});

void describe("symmetry category", () => {
  for (const category of CATEGORIES) {
    for (const level of SYMMETRY_LEVELS) {
      void test(`${category} at ${level.id} draws only its objects and never repeats the last card`, () => {
        const allowed = idsOf(level.id, category);
        const random = seeded(7);
        let previous: string | null = null;
        for (let draw = 0; draw < DRAWS; draw += 1) {
          const card: SymmetryCard = drawn(generateSymmetryCard(random, previous, level, category));
          assert.ok(allowed.has(templateOf(card.key)), card.key);
          assert.notEqual(card.key, previous);
          previous = card.key;
        }
      });
    }
  }

  void test("a category without objects gives no card instead of throwing", () => {
    assert.equal(
      generateSymmetryCard(Math.random, null, SYMMETRY_LEVELS[0], "nieznana" as ObjectCategoryChoiceId),
      null,
    );
  });
});

void describe("nonogram category", () => {
  for (const category of CATEGORIES) {
    for (const size of NONOGRAM_SIZES) {
      void test(`${category} at ${size.id} draws only its objects, with at least two valid cards`, () => {
        const allowed = idsOf(size.templateLevel, category);
        const valid = nonogramVariants(size, category).filter(({ template, variants }) =>
          size.kind === "znaczki"
            ? simpleNonogramProblems(composeSimpleNonogramCard(template, variants, size)).length === 0
            : nonogramCardProblems(composeNonogramCard(template, variants, size)).length === 0,
        );
        assert.ok(valid.length >= 2, `${category} at ${size.id} has ${valid.length} valid card(s)`);
        const random = seeded(11);
        let previous: string | null = null;
        for (let draw = 0; draw < DRAWS; draw += 1) {
          const card: { key: string } = drawn(generateNonogramCard(random, previous, size, category));
          assert.ok(allowed.has(templateOf(card.key)), card.key);
          assert.notEqual(card.key, previous);
          previous = card.key;
        }
      });
    }
  }

  void test("a category without objects gives no card instead of throwing", () => {
    assert.equal(
      generateNonogramCard(Math.random, null, NONOGRAM_SIZES[0], "nieznana" as ObjectCategoryChoiceId),
      null,
    );
  });
});

void describe("dictation category", () => {
  for (const category of CATEGORIES) {
    for (const level of DICTATION_LEVELS) {
      void test(`${category} at ${level.id} has at least two outlines and never repeats the last one`, () => {
        const outlines = dictationVariantCount(level, category).distinctOutlines;
        assert.ok(outlines >= 2, `${category} at ${level.id} has ${outlines} outline(s)`);
        const random = seeded(13);
        let previous: string | null = null;
        const seen = new Set<string>();
        for (let draw = 0; draw < DRAWS; draw += 1) {
          const card: DictationCard = drawn(generateDictationCard(random, previous, level, category));
          assert.notEqual(card.key, previous);
          seen.add(card.key);
          previous = card.key;
        }
        assert.ok(seen.size <= outlines);
      });
    }
  }

  void test("a category narrows the outlines: no category has more than all objects", () => {
    for (const level of DICTATION_LEVELS) {
      const all = dictationVariantCount(level).distinctOutlines;
      for (const category of CATEGORIES) {
        assert.ok(dictationVariantCount(level, category).distinctOutlines < all);
      }
    }
  });

  void test("a category without objects gives no card instead of throwing", () => {
    assert.equal(
      generateDictationCard(Math.random, null, DICTATION_LEVELS[0], "nieznana" as ObjectCategoryChoiceId),
      null,
    );
  });
});
