import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { answerOf, shadowsCardKey, shadowsCardProblems } from "./card.ts";
import { familyOfPicture, shadowPictureById } from "./families.ts";
import { generateShadowsCard } from "./generate.ts";
import { layoutShadowsSheet } from "./layout.ts";
import { DEFAULT_SHADOWS_LEVEL_ID, SHADOWS_LEVELS, shadowsLevelById } from "./levels.ts";
import { MIN_SHADOW_DIFFERENCE, shadowDifference, shadowMask } from "./raster.ts";
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
  void test("Poziom 1 / 2 / 3 with 4 / 5 / 6 pairs; Poziom 1 is the default", () => {
    assert.deepEqual(
      SHADOWS_LEVELS.map((level) => [level.id, level.pairCount, level.familyRule]),
      [
        ["latwy", 4, "dowolne"],
        ["sredni", 5, "rozne"],
        ["trudny", 6, "warianty"],
      ],
    );
    assert.equal(DEFAULT_SHADOWS_LEVEL_ID, "latwy");
  });
});

void describe("shadows card", () => {
  for (const level of SHADOWS_LEVELS) {
    void test(`${level.label}: 100 cards are valid and follow the family rule (independent oracle)`, () => {
      const random = seeded(17);
      let previous: string | null = null;
      for (let n = 0; n < 100; n++) {
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
            assert.ok(shadowDifference(a, b) >= MIN_SHADOW_DIFFERENCE);
          });
        });
      }
    });
  }

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
