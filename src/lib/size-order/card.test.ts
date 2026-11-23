import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ICONS } from "../odd-one-out/icons.ts";
import { answerOf, sizeOrderCardKey, sizeOrderCardProblems, type SizeOrderCard } from "./card.ts";
import { generateSizeOrderCard } from "./generate.ts";
import { SIZE_ORDER_LEVELS, sizeOrderLevelById, type SizeOrderLevelId } from "./levels.ts";

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

function card(levelId: SizeOrderLevelId, seed = 5): SizeOrderCard {
  const made = generateSizeOrderCard(seeded(seed), sizeOrderLevelById(levelId));
  assert.ok(made);
  return made;
}

function codes(c: SizeOrderCard, levelId: SizeOrderLevelId = c.levelId): string[] {
  return sizeOrderCardProblems(c, sizeOrderLevelById(levelId));
}

void describe("answerOf", () => {
  void test("counts the place from the smallest", () => {
    const row = {
      picture: { kind: "shape" as const, id: "heart" as const },
      heights: [1, 0.5, 0.74],
      crayon: "red" as const,
    };
    assert.deepEqual(answerOf(row), [3, 1, 2]);
  });
});

void describe("sizeOrderCardProblems", () => {
  void test("a drawn card of every level is legal", () => {
    for (const level of SIZE_ORDER_LEVELS) assert.deepEqual(codes(card(level.id)), []);
  });

  void test("each rule has a code", () => {
    const c = card("sredni");
    const [first, second, ...rest] = c.rows;
    const rows = (...r: SizeOrderCard["rows"]): SizeOrderCard => ({ ...c, rows: r });
    assert.ok(codes(c, "latwy").includes("settings-mismatch"));
    assert.ok(codes(rows(first, second, ...rest.slice(1))).includes("wrong-row-count"));
    assert.ok(codes(rows({ ...first, heights: first.heights.slice(1) }, second, ...rest)).includes("wrong-item-count"));
    assert.ok(codes(rows({ ...first, heights: [0.4, 0.6, 0.8, 1] }, second, ...rest)).includes("heights-not-level"));
    assert.ok(codes(rows({ ...first, heights: [0.5, 0.55, 0.79, 1] }, second, ...rest)).includes("step-too-small"));
    assert.ok(
      codes(rows({ ...first, heights: [0.5, 0.63, 0.79, 1] }, second, ...rest)).includes("row-already-ordered"),
    );
    assert.ok(
      codes(rows({ ...first, heights: [1, 0.79, 0.63, 0.5] }, second, ...rest)).includes("row-already-ordered"),
    );
    assert.ok(codes(rows(first, { ...second, picture: first.picture }, ...rest)).includes("duplicate-picture"));
    assert.ok(codes(rows(first, { ...second, crayon: first.crayon }, ...rest)).includes("crayon-repeated"));
    assert.ok(
      codes(rows({ ...first, picture: { kind: "icon", id: "nope" } }, second, ...rest)).includes("unknown-picture"),
    );
    assert.ok(codes(rows({ ...first, crayon: "gray" as never }, second, ...rest)).includes("unknown-crayon"));
    assert.ok(!codes(c).includes("unknown-crayon"));
  });

  void test("a card of shapes only misses an icon, a card of icons only misses a shape", () => {
    const c = card("sredni");
    const shapeIds = ["circle", "square", "triangle", "heart"] as const;
    const shapes: SizeOrderCard = {
      ...c,
      rows: c.rows.map((row, i) => ({ ...row, picture: { kind: "shape", id: shapeIds[i] } })),
    };
    assert.ok(codes(shapes).includes("missing-icon"));
    const icons: SizeOrderCard = {
      ...c,
      rows: c.rows.map((row, i) => ({ ...row, picture: { kind: "icon", id: ICONS[i].id } })),
    };
    assert.ok(codes(icons).includes("missing-shape"));
  });

  void test("a row too wide for a visible step on paper is refused, most icons still fit", () => {
    const c = card("trudny");
    const variants = ICONS.map((icon): SizeOrderCard => ({
      ...c,
      rows: [{ ...c.rows[0], picture: { kind: "icon", id: icon.id } }, ...c.rows.slice(1)],
    }));
    const refused = variants.filter((candidate) => codes(candidate).includes("step-too-small-mm"));
    assert.ok(refused.length >= 1, "at least one icon is too wide for the hard level");
    assert.ok(refused.length < variants.length / 2, "most icons still fit");
  });
});

void describe("sizeOrderCardKey", () => {
  void test("ignores the crayons, sees the pictures and the order", () => {
    const c = card("latwy");
    const recoloured: SizeOrderCard = {
      ...c,
      rows: c.rows.map((row, i) => ({ ...row, crayon: (["red", "blue", "green", "orange"] as const)[(i + 1) % 4] })),
    };
    assert.equal(sizeOrderCardKey(c), sizeOrderCardKey(recoloured));
    const swapped: SizeOrderCard = { ...c, rows: [...c.rows.slice(1), c.rows[0]] };
    assert.notEqual(sizeOrderCardKey(c), sizeOrderCardKey(swapped));
  });
});
