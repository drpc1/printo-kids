import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { dictationShapesFor } from "../dictation/shapes.ts";
import { symmetryTemplatesFor } from "../symmetry/templates.ts";
import {
  centerSilhouette,
  copyDrawingKey,
  copyDrawingProblems,
  expectedPattern,
  type CopyDrawingCard,
  type CopyDrawingPicture,
} from "./card.ts";
import { composeCopyDrawingCard } from "./generate.ts";
import { COPY_DRAWING_LEVELS, copyDrawingLevelById } from "./levels.ts";

function emptyImage(rows: number, columns: number): boolean[][] {
  return Array.from({ length: rows }, () => new Array<boolean>(columns).fill(false));
}

/** Rows of an image above its first and below its last filled row. */
function margins(image: readonly (readonly boolean[])[]): { above: number; below: number } {
  const first = image.findIndex((row) => row.some(Boolean));
  const last = image.map((row) => row.some(Boolean)).lastIndexOf(true);
  return { above: first, below: image.length - 1 - last };
}

function goodCard(levelId: "latwy" | "sredni" | "trudny" = "sredni"): CopyDrawingCard {
  const level = copyDrawingLevelById(levelId);
  const template = symmetryTemplatesFor(level.size.templateLevel, "wszystkie")[0];
  return composeCopyDrawingCard(
    { kind: "template", templateId: template.id, variants: template.parts.map(() => 0) },
    level,
  );
}

/** Every (shape, flip) the card draws at the level: straight first, then flipped, per shape. */
function shapePictures(levelId: "latwy" | "sredni" | "trudny"): CopyDrawingPicture[] {
  const level = copyDrawingLevelById(levelId);
  return dictationShapesFor(level.dictationLevel, "wszystkie")
    .filter((shape) => shape.onCopyDrawing)
    .flatMap((shape) => [
      { kind: "shape" as const, shapeId: shape.id, mirrored: false },
      { kind: "shape" as const, shapeId: shape.id, mirrored: true },
    ]);
}

/** First and last column of the grid that has a filled cell. */
function columnSpan(pattern: readonly (readonly boolean[])[]): { first: number; last: number } {
  const used = pattern[0].map((_, col) => pattern.some((row) => row[col]));
  return { first: used.indexOf(true), last: used.lastIndexOf(true) };
}

void describe("centerSilhouette", () => {
  void test("a silhouette lower than the grid gets the same empty rows above and below, give or take one", () => {
    for (const filled of [1, 2, 3, 4, 7]) {
      const image = emptyImage(12, 4);
      for (let row = 0; row < filled; row += 1) {
        image[row][1] = true;
      }
      const { above, below } = margins(centerSilhouette(image));
      assert.ok(Math.abs(above - below) <= 1, `${filled} rows: ${above} above, ${below} below`);
      assert.equal(above + below + filled, 12);
    }
  });

  void test("the shift is floor((rows - height) / 2)", () => {
    const image = emptyImage(12, 4);
    image[0][0] = true;
    image[1][0] = true;
    image[2][0] = true;
    assert.equal(margins(centerSilhouette(image)).above, 4);
  });

  void test("a silhouette as tall as the grid does not move", () => {
    const image = emptyImage(6, 3);
    image[0][1] = true;
    image[3][2] = true;
    image[5][0] = true;
    assert.deepEqual(centerSilhouette(image), image);
  });

  void test("empty rows inside the silhouette count toward its height and stay", () => {
    const image = emptyImage(10, 2);
    image[0][0] = true;
    image[4][1] = true;
    const centered = centerSilhouette(image);
    assert.deepEqual(margins(centered), { above: 2, below: 3 });
    assert.ok(centered[2][0] && centered[6][1]);
  });

  void test("the same cells are filled and an empty image stays empty", () => {
    const image = emptyImage(8, 3);
    image[1][0] = true;
    image[2][2] = true;
    assert.equal(centerSilhouette(image).flat().filter(Boolean).length, 2);
    assert.deepEqual(centerSilhouette(emptyImage(4, 3)), emptyImage(4, 3));
  });

  void test("it is idempotent and does not change its input", () => {
    const image = emptyImage(9, 3);
    image[0][1] = true;
    const before = structuredClone(image);
    const once = centerSilhouette(image);
    assert.deepEqual(image, before);
    assert.deepEqual(centerSilhouette(once), once);
  });
});

void describe("copyDrawingProblems", () => {
  void test("a composed card of every level is legal", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      assert.deepEqual(copyDrawingProblems(goodCard(level.id), level), [], level.id);
    }
  });

  void test("the pattern is a centered silhouette of the level's grid", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      const card = goodCard(level.id);
      assert.equal(card.pattern.length, level.size.rows);
      assert.ok(card.pattern.every((row) => row.length === level.size.columns));
      const { above, below } = margins(card.pattern);
      assert.ok(Math.abs(above - below) <= 1, `${level.id}: ${above} above, ${below} below`);
    }
  });

  void test("the key names the level, the template and the variants", () => {
    const card = goodCard();
    assert.equal(card.picture.kind, "template");
    assert.equal(card.key, copyDrawingKey("sredni", card.picture));
    assert.match(card.key, /^sredni:/);
  });

  void test("a template key keeps its form: level, template id and variants joined by dashes", () => {
    const picture: CopyDrawingPicture = { kind: "template", templateId: "rakieta", variants: [1, 0, 2] };
    assert.equal(copyDrawingKey("latwy", picture), "latwy:rakieta:1-0-2");
  });

  void test("a shape key has its own marker and tells the flip", () => {
    assert.equal(
      copyDrawingKey("sredni", { kind: "shape", shapeId: "ryba", mirrored: false }),
      "sredni:ksztalt:ryba:prosty",
    );
    assert.equal(
      copyDrawingKey("sredni", { kind: "shape", shapeId: "ryba", mirrored: true }),
      "sredni:ksztalt:ryba:odbity",
    );
  });

  void test("the keys of every card of a level differ: all template variants, every shape and flip", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      const keys: string[] = [];
      for (const template of symmetryTemplatesFor(level.size.templateLevel, "wszystkie")) {
        let combos: number[][] = [[]];
        for (const part of template.parts) {
          combos = combos.flatMap((combo) => part.variants.map((_, variant) => [...combo, variant]));
        }
        for (const variants of combos) {
          keys.push(copyDrawingKey(level.id, { kind: "template", templateId: template.id, variants }));
        }
      }
      for (const picture of shapePictures(level.id)) {
        keys.push(copyDrawingKey(level.id, picture));
      }
      assert.equal(new Set(keys).size, keys.length, level.id);
    }
  });

  void test("a pattern turned half a circle is not the silhouette", () => {
    const level = copyDrawingLevelById("sredni");
    const card = goodCard();
    const turned = [...card.pattern].reverse().map((row) => [...row].reverse());
    assert.notDeepEqual(turned, card.pattern);
    assert.deepEqual(copyDrawingProblems({ ...card, pattern: turned }, level), ["not-silhouette"]);
  });

  void test("a picture one row off center is not the silhouette", () => {
    const level = copyDrawingLevelById("sredni");
    const card = goodCard();
    const moved = [...card.pattern.slice(1), card.pattern[0]];
    assert.ok(copyDrawingProblems({ ...card, pattern: moved }, level).includes("not-silhouette"));
  });

  void test("an empty pattern has no filled cell", () => {
    const level = copyDrawingLevelById("sredni");
    const card = goodCard();
    const blank = card.pattern.map((row) => row.map(() => false));
    const codes = copyDrawingProblems({ ...card, pattern: blank }, level);
    assert.ok(codes.includes("no-filled-cell"));
    assert.ok(!codes.includes("no-empty-cell"));
  });

  void test("a full pattern has no empty cell", () => {
    const level = copyDrawingLevelById("sredni");
    const card = goodCard();
    const full = card.pattern.map((row) => row.map(() => true));
    const codes = copyDrawingProblems({ ...card, pattern: full }, level);
    assert.ok(codes.includes("no-empty-cell"));
    assert.ok(!codes.includes("no-filled-cell"));
  });

  void test("a pattern of the wrong size is a grid-size problem", () => {
    const level = copyDrawingLevelById("sredni");
    const card = goodCard();
    assert.ok(copyDrawingProblems({ ...card, pattern: card.pattern.slice(1) }, level).includes("grid-size"));
    const narrow = card.pattern.map((row) => row.slice(1));
    assert.ok(copyDrawingProblems({ ...card, pattern: narrow }, level).includes("grid-size"));
  });

  void test("a card of another level than the bar is a level-mismatch", () => {
    const card = goodCard("sredni");
    const codes = copyDrawingProblems(card, copyDrawingLevelById("trudny"));
    assert.ok(codes.includes("level-mismatch"));
    assert.ok(codes.includes("grid-size"));
  });

  void test("an unknown template or variant is not the silhouette", () => {
    const level = copyDrawingLevelById("sredni");
    const card = goodCard();
    assert.equal(card.picture.kind, "template");
    const picture = card.picture;
    const unknown = { ...picture, templateId: "nie-ma" };
    assert.ok(copyDrawingProblems({ ...card, picture: unknown }, level).includes("not-silhouette"));
    const badVariants = { ...picture, variants: [99, 99, 99] };
    assert.ok(copyDrawingProblems({ ...card, picture: badVariants }, level).includes("not-silhouette"));
    assert.equal(expectedPattern(level, { kind: "template", templateId: "nie-ma", variants: [] }), null);
  });
});

void describe("a card with a dictation shape", () => {
  void test("every shape of the card, on every level it is drawn, straight and flipped, is a legal card with an empty cell", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      const pictures = shapePictures(level.id);
      assert.ok(pictures.length > 0, level.id);
      for (const picture of pictures) {
        const card = composeCopyDrawingCard(picture, level);
        const label = `${level.id} ${card.key}`;
        assert.deepEqual(copyDrawingProblems(card, level), [], label);
        assert.equal(card.pattern.length, level.size.rows, label);
        assert.ok(
          card.pattern.every((row) => row.length === level.size.columns),
          label,
        );
        assert.ok(card.pattern.flat().includes(true) && card.pattern.flat().includes(false), label);
      }
    }
  });

  void test("a flipped shape differs from the straight one, with the same number of cells in the same columns", () => {
    const level = copyDrawingLevelById("sredni");
    const straight = composeCopyDrawingCard({ kind: "shape", shapeId: "dinozaur", mirrored: false }, level).pattern;
    const flipped = composeCopyDrawingCard({ kind: "shape", shapeId: "dinozaur", mirrored: true }, level).pattern;
    assert.notDeepEqual(flipped, straight);
    const span = columnSpan(straight);
    assert.deepEqual(columnSpan(flipped), span, "the flip stands in the same columns");
    // Same silhouette cells, only mirrored.
    assert.equal(flipped.flat().filter(Boolean).length, straight.flat().filter(Boolean).length);
  });

  void test("a shape narrower than the grid has floor((columns - width) / 2) empty columns left of its drawing, and the rows above and below differ by at most one", () => {
    const level = copyDrawingLevelById("sredni");
    const shape = dictationShapesFor("lat6").find((candidate) => candidate.id === "ryba");
    assert.ok(shape);
    const drawing = shape.byLevel.lat6;
    assert.ok(drawing);
    const width = drawing[0].length;
    assert.ok(width < level.size.columns);
    const firstDrawn = Math.min(...drawing.map((line) => line.search(/[^.]/)).filter((index) => index >= 0));
    const pattern = composeCopyDrawingCard({ kind: "shape", shapeId: "ryba", mirrored: false }, level).pattern;
    assert.equal(columnSpan(pattern).first, Math.floor((level.size.columns - width) / 2) + firstDrawn);
    const { above, below } = margins(pattern);
    assert.ok(Math.abs(above - below) <= 1, `${above} above, ${below} below`);
  });

  void test("a shape that does not fit the grid of the level has no pattern, in width or in height", () => {
    const level = copyDrawingLevelById("sredni");
    const picture: CopyDrawingPicture = { kind: "shape", shapeId: "dinozaur", mirrored: false };
    assert.ok(expectedPattern(level, picture) !== null);
    // The middle drawing of the dinosaur is 12 columns wide and 10 rows high.
    assert.equal(expectedPattern({ ...level, size: { ...level.size, columns: 11 } }, picture), null);
    assert.ok(expectedPattern({ ...level, size: { ...level.size, columns: 12 } }, picture) !== null);
    assert.ok(expectedPattern({ ...level, size: { ...level.size, rows: 10 } }, picture) !== null);
    assert.equal(expectedPattern({ ...level, size: { ...level.size, rows: 9 } }, picture), null);
  });

  void test("the horizontal key is not on the card", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      const picture: CopyDrawingPicture = { kind: "shape", shapeId: "klucz-poziomy", mirrored: false };
      assert.equal(expectedPattern(level, picture), null, level.id);
      assert.ok(
        copyDrawingProblems(composeCopyDrawingCard(picture, level), level).includes("not-silhouette"),
        level.id,
      );
    }
  });

  void test("a foreign shape, a flip the pattern does not show and a level without a drawing are not the silhouette", () => {
    const level = copyDrawingLevelById("sredni");
    const card = composeCopyDrawingCard({ kind: "shape", shapeId: "dinozaur", mirrored: false }, level);
    const foreign: CopyDrawingCard = { ...card, picture: { kind: "shape", shapeId: "nie-ma", mirrored: false } };
    assert.deepEqual(copyDrawingProblems(foreign, level), ["not-silhouette"]);
    const flipped: CopyDrawingCard = { ...card, picture: { kind: "shape", shapeId: "dinozaur", mirrored: true } };
    assert.deepEqual(copyDrawingProblems(flipped, level), ["not-silhouette"]);
    // The renifer is drawn for the hard level only, so it has no pattern at the middle level.
    const reindeer: CopyDrawingCard = { ...card, picture: { kind: "shape", shapeId: "renifer", mirrored: false } };
    assert.deepEqual(copyDrawingProblems(reindeer, level), ["not-silhouette"]);
  });
});
