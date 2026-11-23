import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { answerOf, shadowsCardKey, shadowsCardProblems } from "./card.ts";
import { SHADOW_FAMILIES, SHADOW_POSE_FAMILIES, familyOfPicture, shadowPictureById } from "./families.ts";
import { generateShadowsCard } from "./generate.ts";
import { layoutShadowsSheet } from "./layout.ts";
import { DEFAULT_SHADOWS_LEVEL_ID, SHADOWS_LEVELS, shadowsLevelById } from "./levels.ts";
import { shadowDifference, shadowMask } from "./raster.ts";
import { SHADOWS_SHEET } from "./sheet.ts";

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

void describe("shadows levels", () => {
  void test("Poziom 1 / 2 / 3 / 4 with 4 / 5 / 6 / 6 pairs; Poziom 1 is the default", () => {
    assert.deepEqual(
      SHADOWS_LEVELS.map((level) => [level.id, level.pairCount, level.familyRule]),
      [
        ["latwy", 4, "dowolne"],
        ["sredni", 5, "rozne"],
        ["trudny", 6, "warianty"],
        ["pozy", 6, "pozy"],
      ],
    );
    assert.equal(DEFAULT_SHADOWS_LEVEL_ID, "latwy");
  });
});
// Mutation runs (stryker/shadows.config.json) set MUTATION_RUN=1: 100 cards per level take about a minute, so a mutant
// would cost hours; 15 cards still exercise every rule.
const CARDS = process.env.MUTATION_RUN === "1" ? 15 : 100;

void describe("shadows card", () => {
  for (const level of SHADOWS_LEVELS) {
    void test(`${level.label}: 100 cards are valid and follow the family rule (independent oracle)`, () => {
      const random = seeded(17);
      let previous: string | null = null;
      for (let n = 0; n < CARDS; n++) {
        const card = generateShadowsCard(random, level, previous);
        assert.ok(card, `card ${n}`);
        assert.deepEqual(shadowsCardProblems(card, level), []);
        assert.notEqual(shadowsCardKey(card), previous);
        previous = shadowsCardKey(card);

        // Oracle, without the card module: pair count, distinct pictures, families, permutation, distinct shadows.
        assert.equal(card.pictures.length, level.pairCount);
        assert.equal(new Set(card.pictures).size, level.pairCount);
        const families = card.pictures.map((id) => familyOfPicture(id));
        if (level.familyRule === "dowolne") {
          assert.equal(new Set(families.map((family) => family?.id)).size, level.pairCount);
        } else {
          assert.equal(new Set(families.map((family) => family?.id)).size, 1);
          assert.equal(families[0]?.kind, level.familyRule);
        }
        assert.deepEqual(
          [...card.shadowOrder].sort((a, b) => a - b),
          card.pictures.map((_, index) => index),
        );
        card.shadowOrder.forEach((picture, row) => {
          assert.notEqual(picture, row);
        });
        const answer = answerOf(card);
        answer.forEach((row, picture) => {
          assert.equal(card.shadowOrder[row], picture);
        });
        const masks = card.pictures.map((id) => {
          const picture = shadowPictureById(id);
          assert.ok(picture);
          return shadowMask(picture);
        });
        masks.forEach((a, i) => {
          masks.slice(i + 1).forEach((b) => {
            assert.ok(shadowDifference(a, b) >= level.minShadowDifference);
          });
        });
      }
    });
  }

  void test("level 4 draws six poses of one family; level 1 never draws a pose", () => {
    const random = seeded(23);
    const poses = new Set(SHADOW_POSE_FAMILIES.flatMap((family) => family.pictures.map((picture) => picture.id)));
    for (let n = 0; n < 50; n++) {
      const card = generateShadowsCard(random, shadowsLevelById("pozy"));
      assert.ok(card);
      assert.equal(card.pictures.length, 6);
      assert.ok(card.pictures.every((id) => poses.has(id)));
      assert.equal(new Set(card.pictures.map((id) => familyOfPicture(id)?.id)).size, 1);
      const easy = generateShadowsCard(random, shadowsLevelById("latwy"));
      assert.ok(easy);
      assert.ok(easy.pictures.every((id) => !poses.has(id)));
    }
  });

  void test("families that do not fit the level are refused", () => {
    const pose = SHADOW_POSE_FAMILIES[0].pictures;
    const other = SHADOW_POSE_FAMILIES[1].pictures;
    const mixed = {
      levelId: "pozy" as const,
      pictures: [...pose.slice(0, 3), ...other.slice(0, 3)].map((p) => p.id),
      shadowOrder: [1, 2, 3, 4, 5, 0],
    };
    assert.ok(shadowsCardProblems(mixed, shadowsLevelById("pozy")).includes("families-not-level"));
    const posesOnEasy = {
      levelId: "latwy" as const,
      pictures: pose.slice(0, 4).map((p) => p.id),
      shadowOrder: [1, 2, 3, 0],
    };
    assert.ok(shadowsCardProblems(posesOnEasy, shadowsLevelById("latwy")).includes("families-not-level"));
    const catalog = {
      levelId: "pozy" as const,
      pictures: SHADOW_FAMILIES[0].pictures.slice(0, 6).map((p) => p.id),
      shadowOrder: [1, 2, 3, 4, 5, 0],
    };
    assert.ok(shadowsCardProblems(catalog, shadowsLevelById("pozy")).includes("families-not-level"));
  });

  void test("each rule is refused with its code", () => {
    const level = shadowsLevelById("trudny");
    const card = generateShadowsCard(seeded(5), level);
    assert.ok(card);
    const codes = (changed: Partial<typeof card>) => shadowsCardProblems({ ...card, ...changed }, level);
    assert.ok(codes({ levelId: "latwy" }).includes("settings-mismatch"));
    assert.ok(codes({ pictures: [...card.pictures.slice(0, -1), "nie-ma"] }).includes("unknown-picture"));
    assert.ok(codes({ shadowOrder: card.shadowOrder.map(() => 0) }).includes("shadow-order-invalid"));
    assert.ok(codes({ shadowOrder: card.pictures.map((_, index) => index) }).includes("shadow-in-own-row"));
  });
});

void describe("shadows layout", () => {
  for (const level of SHADOWS_LEVELS) {
    for (const band of [SHADOWS_SHEET.bandHeight, SHADOWS_SHEET.plainInstructionSize]) {
      void test(`${level.label}, instruction ${band} mm: fields inside the margin, columns apart, one size`, () => {
        const card = generateShadowsCard(seeded(9), level);
        assert.ok(card);
        const layout = layoutShadowsSheet(card, band);
        const { inset, pageWidth, pageHeight } = SHADOWS_SHEET;
        assert.equal(layout.rows.length, level.pairCount);
        for (const row of layout.rows) {
          for (const field of [row.picture, row.shadow]) {
            assert.ok(field.x >= inset && field.x + field.size <= pageWidth - inset);
            assert.ok(field.y >= inset + band && field.y + field.size <= pageHeight - inset + 1e-6);
            assert.ok(field.size <= level.pictureSize);
          }
          assert.ok(row.dotLeft.cx < row.dotRight.cx);
          assert.ok(row.picture.x + row.picture.size < row.dotLeft.cx);
          assert.ok(row.dotRight.cx < row.shadow.x);
        }
        layout.rows.slice(1).forEach((row, index) => {
          assert.ok(row.picture.y >= layout.rows[index].picture.y + row.picture.size);
        });
      });
    }
  }
});

void describe("shadows card: pair count, duplicates, similar shadows and key", () => {
  const level = shadowsLevelById("trudny");
  const card = generateShadowsCard(seeded(5), level);
  assert.ok(card);
  const codes = (changed: Partial<typeof card>) => shadowsCardProblems({ ...card, ...changed }, level);

  void test("a card with the wrong number of pairs or an order of another length is named", () => {
    assert.ok(codes({ pictures: card.pictures.slice(0, 5) }).includes("wrong-pair-count"));
    assert.ok(codes({ shadowOrder: card.shadowOrder.slice(0, 5) }).includes("wrong-pair-count"));
    assert.ok(!codes({}).includes("wrong-pair-count"));
  });

  void test("the same picture twice is named", () => {
    assert.ok(codes({ pictures: [card.pictures[0], ...card.pictures.slice(0, -1)] }).includes("duplicate-picture"));
    assert.ok(!codes({}).includes("duplicate-picture"));
  });

  void test("two pictures of one family on a level of different families are refused", () => {
    const easy = shadowsLevelById("latwy");
    const family = SHADOW_FAMILIES[0].pictures.slice(0, 2).map((p) => p.id);
    const other = SHADOW_FAMILIES.slice(1, 3).map((f) => f.pictures[0].id);
    const sameFamily = { levelId: "latwy" as const, pictures: [...family, ...other], shadowOrder: [1, 2, 3, 0] };
    assert.ok(shadowsCardProblems(sameFamily, easy).includes("families-not-level"));
    const fine = { ...sameFamily, pictures: [family[0], ...other, SHADOW_FAMILIES[3].pictures[0].id] };
    assert.ok(!shadowsCardProblems(fine, easy).includes("families-not-level"));
  });

  void test("the threshold on shadow difference decides: a card is refused only when its closest pair is below it", () => {
    const masks = card.pictures.map((id) => {
      const picture = shadowPictureById(id);
      assert.ok(picture);
      return shadowMask(picture);
    });
    const gaps = masks.flatMap((a, i) => masks.slice(i + 1).map((b) => shadowDifference(a, b)));
    const closest = Math.min(...gaps);
    const withThreshold = (minShadowDifference: number) => shadowsCardProblems(card, { ...level, minShadowDifference });
    assert.ok(!withThreshold(closest).includes("shadows-too-similar"));
    assert.ok(withThreshold(closest + 1e-6).includes("shadows-too-similar"));
    assert.ok(withThreshold(2).includes("shadows-too-similar"));
    assert.ok(!withThreshold(0).includes("shadows-too-similar"));
    // The same picture twice is a duplicate, not a pair of alike shadows.
    const twice = shadowsCardProblems(
      { ...card, pictures: [card.pictures[0], card.pictures[0], ...card.pictures.slice(2)] },
      { ...level, minShadowDifference: 2 },
    );
    assert.equal(twice.includes("shadows-too-similar"), true);
  });

  void test("the key is the level, the pictures and the order, each told apart", () => {
    assert.equal(shadowsCardKey({ levelId: "latwy", pictures: ["a", "b"], shadowOrder: [1, 0] }), "latwy:a,b:1,0");
    assert.notEqual(shadowsCardKey(card), shadowsCardKey({ ...card, shadowOrder: [...card.shadowOrder].reverse() }));
  });
});
