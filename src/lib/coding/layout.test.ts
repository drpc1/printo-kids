import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { instructionBoxHeight } from "../sheet/speech.ts";
import { type CodingCard } from "./card.ts";
import { generateCodingCard } from "./generate.ts";
import { layoutCodingSheet, type CodingRect } from "./layout.ts";
import { CODING_LEVELS, CODING_MODES } from "./levels.ts";
import { CODING_SHEET } from "./sheet.ts";

const EPSILON = 1e-6;
const SHEET = CODING_SHEET;
const WITH_CHARACTER = instructionBoxHeight(true, SHEET.plainInstructionSize);
const WITHOUT_CHARACTER = instructionBoxHeight(false, SHEET.plainInstructionSize);

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const overlap = (a: CodingRect, b: CodingRect): boolean =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

void describe("layoutCodingSheet", () => {
  void test("the instruction box is 26 mm with a character and 7 mm without", () => {
    assert.equal(WITH_CHARACTER, 26);
    assert.equal(WITHOUT_CHARACTER, 7);
  });

  for (const level of CODING_LEVELS) {
    for (const mode of CODING_MODES) {
      for (const [name, boxHeight] of [
        ["with a character", WITH_CHARACTER],
        ["without a character (Start circle)", WITHOUT_CHARACTER],
      ] as const) {
        void test(`${level.label} ${mode.label} ${name} fits the 10 mm margin`, () => {
          for (const seed of [1, 2, 3, 4, 5, 6]) {
            const card = generateCodingCard(mulberry32(seed), null, level, mode);
            assert.ok(card);
            const layout = layoutCodingSheet(card, boxHeight);
            const areaTop = SHEET.inset + boxHeight + SHEET.bandGap;
            const left = SHEET.inset - EPSILON;
            const right = SHEET.pageWidth - SHEET.inset + EPSILON;
            const bottom = SHEET.pageHeight - SHEET.inset + EPSILON;
            assert.ok(layout.grid.x >= left && layout.grid.x + layout.grid.width <= right);
            assert.ok(layout.grid.y >= areaTop - EPSILON);
            for (const answer of layout.answers) {
              const r = answer.rect;
              assert.ok(r.x >= left && r.x + r.width <= right && r.y + r.height <= bottom);
              assert.ok(r.y >= layout.grid.y + layout.grid.height);
            }
            const lowest = Math.max(...layout.answers.map((a) => a.rect.y + a.rect.height));
            assert.ok(lowest <= SHEET.pageHeight - SHEET.inset + EPSILON);
          }
        });
      }
    }

    void test(`${level.label}: answer boxes do not overlap and Zapisz example boxes are the first ${level.exampleCells}`, () => {
      for (const mode of CODING_MODES) {
        const card: CodingCard | null = generateCodingCard(mulberry32(7), null, level, mode);
        assert.ok(card);
        const { answers } = layoutCodingSheet(card, WITH_CHARACTER);
        for (const [i, a] of answers.entries()) {
          for (const b of answers.slice(i + 1)) assert.equal(overlap(a.rect, b.rect), false);
        }
        if (mode.id === "zapisz") {
          assert.deepEqual(
            answers.map((a) => a.example),
            answers.map((_, i) => i < level.exampleCells),
          );
          assert.deepEqual(
            answers.map((a) => a.filled),
            answers.map((a) => a.example),
          );
        } else {
          assert.ok(answers.every((a) => a.filled && !a.example));
        }
      }
    });
  }

  void test("Zapisz has one box per step (levels 1-3) or per command (level 4), Wykonaj shows three pictures", () => {
    const zapisz = generateCodingCard(mulberry32(2), null, CODING_LEVELS[0], CODING_MODES[0]);
    assert.ok(zapisz);
    const layout = layoutCodingSheet(zapisz, WITH_CHARACTER);
    assert.equal(layout.answers.length, zapisz.path.length);
    assert.equal(layout.targets.length, 0);
    const wykonaj = generateCodingCard(mulberry32(2), null, CODING_LEVELS[0], CODING_MODES[1]);
    assert.ok(wykonaj);
    assert.equal(layoutCodingSheet(wykonaj, WITH_CHARACTER).targets.length, 3);
    const grouped = generateCodingCard(mulberry32(2), null, CODING_LEVELS[3], CODING_MODES[0]);
    assert.ok(grouped);
    const groupedLayout = layoutCodingSheet(grouped, WITH_CHARACTER);
    assert.ok(groupedLayout.answers.length <= grouped.path.length);
    assert.equal(
      groupedLayout.answers.reduce((sum, a) => sum + a.count, 0),
      grouped.path.length,
    );
  });

  void test("a card with more answers than fit under the grid throws instead of crossing the margin", () => {
    const card = generateCodingCard(mulberry32(2), null, CODING_LEVELS[3], CODING_MODES[1]);
    assert.ok(card);
    // A level 4 path written one arrow per command would need many rows: 10 columns of 18 mm cells leave no room.
    const zigzag = Array.from({ length: 24 }, (_, i) => (i % 2 === 0 ? "R" : "D")) as CodingCard["path"];
    assert.throws(() => layoutCodingSheet({ ...card, path: zigzag }, WITH_CHARACTER), /margin/);
  });
});
