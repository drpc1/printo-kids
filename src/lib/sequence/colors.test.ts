import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { assignSequenceColors, SEQUENCE_CRAYONS, sequenceShapeInk } from "./colors.ts";
import { SEQUENCE_SHAPES } from "./shapes.ts";

const GLOBAL_CSS = readFileSync(new URL("../../styles/global.css", import.meta.url), "utf8");

const KOLO_KWADRAT = ["kolo", "kwadrat"] as const;

void describe("assignSequenceColors", () => {
  void test("kolo and kwadrat get exactly those two keys and two different crayons", () => {
    const colors = assignSequenceColors(mulberry32(1), KOLO_KWADRAT);

    assert.deepEqual(Object.keys(colors).sort(), ["kolo", "kwadrat"]);
    assert.notEqual(colors.kolo, colors.kwadrat);
    assert.ok(colors.kolo !== undefined && SEQUENCE_CRAYONS.includes(colors.kolo));
    assert.ok(colors.kwadrat !== undefined && SEQUENCE_CRAYONS.includes(colors.kwadrat));
  });

  void test("the same random source gives the same assignment", () => {
    assert.deepEqual(
      assignSequenceColors(mulberry32(4), KOLO_KWADRAT),
      assignSequenceColors(mulberry32(4), KOLO_KWADRAT),
    );
  });

  void test("two seeds can give kolo different crayons", () => {
    const first = assignSequenceColors(mulberry32(1), KOLO_KWADRAT).kolo;
    const others = Array.from(
      { length: 30 },
      (_, index) => assignSequenceColors(mulberry32(index + 2), KOLO_KWADRAT).kolo,
    );

    assert.ok(others.some((crayon) => crayon !== first));
  });

  void test("shapes on one card do not share a crayon", () => {
    const colors = assignSequenceColors(mulberry32(8), SEQUENCE_SHAPES);
    const crayons = SEQUENCE_SHAPES.map((shape) => colors[shape]);

    assert.equal(new Set(crayons).size, SEQUENCE_SHAPES.length);
  });

  void test("every crayon name is a token in global.css", () => {
    for (const name of SEQUENCE_CRAYONS) {
      const token = `--symmetry-${name}:`;
      assert.ok(GLOBAL_CSS.includes(token), `${token} is missing in global.css`);
    }
  });
});

void describe("sequenceShapeInk", () => {
  void test("without colors a shape is drawn in ink", () => {
    const colors = assignSequenceColors(mulberry32(1), KOLO_KWADRAT);

    assert.equal(sequenceShapeInk("kolo", false, colors), "var(--foreground)");
  });

  void test("with colors a shape that has an entry uses its crayon", () => {
    const colors = assignSequenceColors(mulberry32(1), KOLO_KWADRAT);

    assert.equal(sequenceShapeInk("kolo", true, colors), `var(--symmetry-${colors.kolo})`);
  });
});

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
