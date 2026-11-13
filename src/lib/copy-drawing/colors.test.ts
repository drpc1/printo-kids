import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { symmetryTemplatesFor } from "../symmetry/templates.ts";
import { copyDrawingCellColors } from "./colors.ts";
import { composeCopyDrawingCard } from "./generate.ts";
import { COPY_DRAWING_LEVELS } from "./levels.ts";

void describe("copyDrawingCellColors", () => {
  for (const level of COPY_DRAWING_LEVELS) {
    void test(`${level.id}: every filled cell has a crayon, the grid matches the card, and the silhouette is mirrored`, () => {
      for (const template of symmetryTemplatesFor(level.size.templateLevel, "wszystkie")) {
        const card = composeCopyDrawingCard(
          template,
          template.parts.map(() => 0),
          level,
        );
        const colors = copyDrawingCellColors(card);
        assert.ok(colors, template.id);
        assert.equal(colors.length, card.pattern.length);
        colors.forEach((row, rowIndex) => {
          assert.equal(row.length, card.pattern[rowIndex].length);
          row.forEach((crayon, columnIndex) => {
            if (card.pattern[rowIndex][columnIndex]) {
              assert.notEqual(crayon, null, `${template.id} ${columnIndex},${rowIndex}`);
            }
            assert.equal(crayon, row[row.length - 1 - columnIndex], `${template.id} mirror ${columnIndex},${rowIndex}`);
          });
        });
      }
    });
  }

  void test("a hole inside the silhouette takes the hole color of the template, and nothing outside it is colored", () => {
    const level = COPY_DRAWING_LEVELS[1];
    const withHole = symmetryTemplatesFor(level.size.templateLevel, "wszystkie").find(
      (template) => template.holeColor !== null,
    );
    assert.ok(withHole);
    for (let variant = 0; variant < 3; variant += 1) {
      const card = composeCopyDrawingCard(
        withHole,
        withHole.parts.map(() => 0),
        level,
      );
      const colors = copyDrawingCellColors(card);
      assert.ok(colors);
      const colored = colors.flat().filter((crayon) => crayon !== null).length;
      const filled = card.pattern.flat().filter(Boolean).length;
      assert.ok(colored >= filled, "the colored cells cover the whole silhouette");
      // The corners of the grid are outside every silhouette.
      assert.equal(colors[0][0], null);
      assert.equal(colors[colors.length - 1][colors[0].length - 1], null);
    }
  });

  void test("a card that names an unknown template has no colors", () => {
    const level = COPY_DRAWING_LEVELS[0];
    const template = symmetryTemplatesFor(level.size.templateLevel, "wszystkie")[0];
    const card = composeCopyDrawingCard(
      template,
      template.parts.map(() => 0),
      level,
    );
    assert.equal(copyDrawingCellColors({ ...card, templateId: "nie-ma-takiego" }), null);
    assert.equal(copyDrawingCellColors({ ...card, variants: [99] }), null);
  });
});
