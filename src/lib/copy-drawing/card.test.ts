import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { symmetryTemplatesFor } from "../symmetry/templates.ts";
import {
  centerSilhouette,
  copyDrawingKey,
  copyDrawingProblems,
  expectedPattern,
  type CopyDrawingCard,
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
    template,
    template.parts.map(() => 0),
    level,
  );
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
    assert.equal(card.key, copyDrawingKey("sredni", card.templateId, card.variants));
    assert.match(card.key, /^sredni:/);
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
    assert.ok(copyDrawingProblems({ ...card, templateId: "nie-ma" }, level).includes("not-silhouette"));
    assert.ok(copyDrawingProblems({ ...card, variants: [99, 99, 99] }, level).includes("not-silhouette"));
    assert.equal(expectedPattern(level, "nie-ma", []), null);
  });
});
