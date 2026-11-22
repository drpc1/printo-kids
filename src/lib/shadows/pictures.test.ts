import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { SHADOW_FAMILIES, SHADOW_PICTURES, familyOfPicture, shadowPictureById } from "./families.ts";
import { PICTURE_BOX, PICTURE_COLORS } from "./picture-format.ts";
import { MIN_SHADOW_DIFFERENCE, pathPolylines, shadowDifference, shadowMask, shapesMask } from "./raster.ts";

void describe("shadows catalog", () => {
  void test("seven families of variants and six of different things, 6–8 pictures each, at least 72 pictures", () => {
    assert.equal(SHADOW_FAMILIES.filter((family) => family.kind === "warianty").length, 7);
    assert.equal(SHADOW_FAMILIES.filter((family) => family.kind === "rozne").length, 6);
    for (const family of SHADOW_FAMILIES) {
      assert.ok(family.pictures.length >= 6 && family.pictures.length <= 8, family.id);
    }
    assert.ok(SHADOW_PICTURES.length >= 72);
  });

  void test("ids are unique and every picture belongs to one family", () => {
    assert.equal(new Set(SHADOW_PICTURES.map((picture) => picture.id)).size, SHADOW_PICTURES.length);
    assert.equal(new Set(SHADOW_FAMILIES.map((family) => family.id)).size, SHADOW_FAMILIES.length);
    for (const picture of SHADOW_PICTURES) {
      assert.equal(shadowPictureById(picture.id), picture);
      assert.ok(familyOfPicture(picture.id));
    }
  });

  void test("shapes use the palette, absolute path commands and stay in the box", () => {
    for (const picture of SHADOW_PICTURES) {
      assert.ok(
        picture.shapes.some((shape) => shape.detail !== true),
        `${picture.id} has a shadow`,
      );
      for (const shape of picture.shapes) {
        assert.ok(PICTURE_COLORS.includes(shape.paint), `${picture.id}: ${shape.paint}`);
        if (shape.kind === "path" || shape.kind === "stroke") {
          assert.match(shape.d, /^[MLHVCQZ0-9.\s-]+$/, picture.id);
          for (const line of pathPolylines(shape.d)) {
            for (const [x, y] of line) {
              assert.ok(x >= 0 && x <= PICTURE_BOX && y >= 0 && y <= PICTURE_BOX, `${picture.id}: ${x},${y}`);
            }
          }
        }
      }
    }
  });

  void test("details lie inside the shadow, so they never change it", () => {
    for (const picture of SHADOW_PICTURES) {
      const details = picture.shapes.filter((shape) => shape.detail === true);
      if (details.length === 0) continue;
      const shadow = shadowMask(picture);
      const outside = shapesMask(details).filter((covered, k) => covered && !shadow[k]).length;
      assert.equal(outside, 0, picture.id);
    }
  });

  void test("every two shadows of the catalog differ by at least MIN_SHADOW_DIFFERENCE", () => {
    const masks = SHADOW_PICTURES.map((picture) => shadowMask(picture));
    for (let i = 0; i < masks.length; i++) {
      for (let j = i + 1; j < masks.length; j++) {
        const difference = shadowDifference(masks[i], masks[j]);
        assert.ok(
          difference >= MIN_SHADOW_DIFFERENCE,
          `${SHADOW_PICTURES[i].id} ~ ${SHADOW_PICTURES[j].id}: ${difference.toFixed(3)}`,
        );
      }
    }
  });
});
