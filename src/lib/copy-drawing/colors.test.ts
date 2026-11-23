import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { symmetryTemplatesFor, type SymmetryTemplate } from "../symmetry/templates.ts";
import { dictationShapesFor } from "../dictation/shapes.ts";
import { copyDrawingCellColors } from "./colors.ts";
import type { CopyDrawingPicture } from "./card.ts";
import { composeCopyDrawingCard } from "./generate.ts";
import { COPY_DRAWING_LEVELS } from "./levels.ts";

/** The picture of a template with its first variant for every part. */
function templatePicture(template: SymmetryTemplate): CopyDrawingPicture {
  return { kind: "template", templateId: template.id, variants: template.parts.map(() => 0) };
}

void describe("copyDrawingCellColors", () => {
  for (const level of COPY_DRAWING_LEVELS) {
    void test(`${level.id}: every filled cell has a crayon, the grid matches the card, and the silhouette is mirrored`, () => {
      for (const template of symmetryTemplatesFor(level.size.templateLevel, "wszystkie")) {
        const card = composeCopyDrawingCard(templatePicture(template), level);
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
      const card = composeCopyDrawingCard(templatePicture(withHole), level);
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
    const card = composeCopyDrawingCard(templatePicture(template), level);
    assert.equal(card.picture.kind, "template");
    const picture = card.picture;
    assert.equal(copyDrawingCellColors({ ...card, picture: { ...picture, templateId: "nie-ma-takiego" } }), null);
    assert.equal(copyDrawingCellColors({ ...card, picture: { ...picture, variants: [99] } }), null);
  });

  void test("a shape card colors every cell of the pattern with the crayon of its letter, and nothing else", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      for (const shape of dictationShapesFor(level.dictationLevel).filter((candidate) => candidate.onCopyDrawing)) {
        for (const mirrored of [false, true]) {
          const card = composeCopyDrawingCard({ kind: "shape", shapeId: shape.id, mirrored }, level);
          const colors = copyDrawingCellColors(card);
          assert.ok(colors, shape.id);
          card.pattern.forEach((row, rowIndex) => {
            row.forEach((filled, columnIndex) => {
              assert.equal(
                colors[rowIndex][columnIndex] !== null,
                filled,
                `${level.id} ${shape.id} ${columnIndex},${rowIndex}`,
              );
            });
          });
        }
      }
    }
  });

  void test("the stocking has a gray cuff and red and green stripes, and the flip mirrors the colors", () => {
    const level = COPY_DRAWING_LEVELS[1];
    const straight = copyDrawingCellColors(
      composeCopyDrawingCard({ kind: "shape", shapeId: "skarpeta", mirrored: false }, level),
    );
    const flipped = copyDrawingCellColors(
      composeCopyDrawingCard({ kind: "shape", shapeId: "skarpeta", mirrored: true }, level),
    );
    assert.ok(straight && flipped);
    // lat6: 12 wide in a 12 wide grid, 14 rows in 15, so no horizontal offset and no vertical shift.
    assert.deepEqual(straight[0].slice(0, 7), ["gray", "gray", "gray", "gray", "gray", "gray", null]);
    assert.equal(straight[3][0], "red");
    assert.equal(straight[5][0], "green");
    assert.deepEqual(
      flipped,
      straight.map((row) => [...row].reverse()),
    );
  });

  void test("the sledge keeps its enclosed empty cells white", () => {
    const level = COPY_DRAWING_LEVELS[1];
    const card = composeCopyDrawingCard({ kind: "shape", shapeId: "sanki", mirrored: false }, level);
    const colors = copyDrawingCellColors(card);
    assert.ok(colors);
    const colored = colors.flat().filter((crayon) => crayon !== null).length;
    assert.equal(colored, card.pattern.flat().filter(Boolean).length, "no hole color is added");
    // Drawing row 3 is "..k.....k..k" and the 5 rows stand 5 rows down in the 15 row grid; column 4 is between the legs.
    assert.equal(card.pattern[8][4], false);
    assert.equal(colors[8][4], null);
    assert.equal(card.pattern[8][2], true);
  });

  void test("a shape card with an unknown shape, the horizontal key or a level without a drawing has no colors", () => {
    const level = COPY_DRAWING_LEVELS[1];
    const card = composeCopyDrawingCard({ kind: "shape", shapeId: "dinozaur", mirrored: false }, level);
    assert.equal(
      copyDrawingCellColors({ ...card, picture: { kind: "shape", shapeId: "nie-ma", mirrored: false } }),
      null,
    );
    assert.equal(
      copyDrawingCellColors({ ...card, picture: { kind: "shape", shapeId: "klucz-poziomy", mirrored: false } }),
      null,
    );
    assert.equal(
      copyDrawingCellColors({ ...card, picture: { kind: "shape", shapeId: "renifer", mirrored: false } }),
      null,
    );
  });
});

/** Empty cells of `pattern` that cannot be reached from outside the grid through empty cells (own flood, no shared code). */
function enclosedEmptyCells(pattern: readonly (readonly boolean[])[]): Set<string> {
  const outside = new Set<string>();
  const stack: [number, number][] = [];
  const rows = pattern.length;
  const columns = pattern[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (!pattern[r][c] && (r === 0 || c === 0 || r === rows - 1 || c === columns - 1)) stack.push([r, c]);
    }
  }
  for (let next = stack.pop(); next !== undefined; next = stack.pop()) {
    const [r, c] = next;
    if (r < 0 || c < 0 || r >= rows || c >= columns || pattern[r][c] || outside.has(`${r},${c}`)) continue;
    outside.add(`${r},${c}`);
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  const closed = new Set<string>();
  pattern.forEach((row, r) => {
    row.forEach((filled, c) => {
      if (!filled && !outside.has(`${r},${c}`)) closed.add(`${r},${c}`);
    });
  });
  return closed;
}

void describe("copyDrawingCellColors: holes (independent flood)", () => {
  for (const level of COPY_DRAWING_LEVELS) {
    void test(`${level.id}: enclosed empty cells take the hole color or stay white, the rest of the grid is bare`, () => {
      for (const template of symmetryTemplatesFor(level.size.templateLevel, "wszystkie")) {
        const card = composeCopyDrawingCard(templatePicture(template), level);
        const colors = copyDrawingCellColors(card);
        assert.ok(colors, template.id);
        const closed = enclosedEmptyCells(card.pattern);
        colors.forEach((row, r) => {
          row.forEach((crayon, c) => {
            const where = `${template.id} ${c},${r}`;
            if (card.pattern[r][c]) assert.notEqual(crayon, null, where);
            else if (closed.has(`${r},${c}`)) assert.equal(crayon, template.holeColor, where);
            else assert.equal(crayon, null, where);
          });
        });
      }
    });
  }
});
