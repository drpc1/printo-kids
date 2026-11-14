import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { instructionBoxHeight } from "../sheet/speech.ts";
import { generateMathCrosswordCard } from "./generate.ts";
import { layoutMathCrosswordSheet } from "./layout.ts";
import { MATH_CROSSWORD_LEVELS } from "./levels.ts";
import { MATH_CROSSWORD_SHEET } from "./sheet.ts";

const EPSILON = 1e-6;
const WITH_CHARACTER = instructionBoxHeight(true, MATH_CROSSWORD_SHEET.plainInstructionSize);
const WITHOUT_CHARACTER = instructionBoxHeight(false, MATH_CROSSWORD_SHEET.plainInstructionSize);
const GAP = MATH_CROSSWORD_SHEET.bandGap;

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

void describe("layoutMathCrosswordSheet", () => {
  void test("the instruction box is 26 mm with a character and 7 mm without", () => {
    assert.equal(WITH_CHARACTER, 26);
    assert.equal(WITHOUT_CHARACTER, 7);
  });

  for (const level of MATH_CROSSWORD_LEVELS) {
    for (const [name, boxHeight] of [
      ["with a character", WITH_CHARACTER],
      ["without a character", WITHOUT_CHARACTER],
    ] as const) {
      void test(`${level.id} ${name}: inside the 10 mm margin, under the instruction, cell at most ${level.maxCell} mm`, () => {
        for (let seed = 1; seed <= 6; seed += 1) {
          const card = generateMathCrosswordCard(mulberry32(seed), null, level);
          assert.ok(card);
          const sheet = layoutMathCrosswordSheet(card, boxHeight);
          assert.ok(sheet.cell <= level.maxCell + EPSILON && sheet.cell > 0);
          assert.equal(sheet.placed.length, card.cells.length);
          for (const { x, y } of sheet.placed) {
            assert.ok(x >= 10 - EPSILON && x + sheet.cell <= 200 + EPSILON, `x ${x}`);
            assert.ok(y >= 10 + boxHeight + GAP - EPSILON && y + sheet.cell <= 287 + EPSILON, `y ${y}`);
          }
          // Centred in the area under the instruction.
          const areaTop = 10 + boxHeight + GAP;
          assert.ok(Math.abs(sheet.left - 10 - (190 - sheet.cols * sheet.cell) / 2) < EPSILON);
          assert.ok(Math.abs(sheet.top - areaTop - (287 - areaTop - sheet.rows * sheet.cell) / 2) < EPSILON);
        }
      });
    }
  }

  void test("gaps are exactly the free places inside the grid with drawn cells on all four sides", () => {
    for (const level of MATH_CROSSWORD_LEVELS) {
      const card = generateMathCrosswordCard(mulberry32(3), null, level);
      assert.ok(card);
      const sheet = layoutMathCrosswordSheet(card, WITH_CHARACTER);
      const key = (x: number, y: number) =>
        `${Math.round((x - sheet.left) / sheet.cell)},${Math.round((y - sheet.top) / sheet.cell)}`;
      const taken = new Set(sheet.placed.map(({ x, y }) => key(x, y)));
      const gaps = new Set(sheet.gaps.map(({ x, y }) => key(x, y)));
      assert.equal(gaps.size, sheet.gaps.length);
      for (const place of gaps) assert.ok(!taken.has(place), `gap ${place} is on a cell`);
      for (let row = 0; row < sheet.rows; row += 1) {
        for (let col = 0; col < sheet.cols; col += 1) {
          const place = `${col},${row}`;
          if (taken.has(place)) continue;
          const walls = [`${col - 1},${row}`, `${col + 1},${row}`, `${col},${row - 1}`, `${col},${row + 1}`].filter(
            (neighbour) => taken.has(neighbour),
          ).length;
          assert.equal(gaps.has(place), walls === 4, `place ${place}`);
        }
      }
    }
  });

  void test("the band starts at the margin with the height it was given, and the page is A4", () => {
    const card = generateMathCrosswordCard(mulberry32(2), null, MATH_CROSSWORD_LEVELS[1]);
    assert.ok(card);
    const sheet = layoutMathCrosswordSheet(card, WITH_CHARACTER);
    assert.deepEqual(sheet.band, { y: 10, height: 26 });
    assert.deepEqual(sheet.page, { width: 210, height: 297 });
  });

  void test("the cell is the largest that fits: the level's cap, the width or the height, whichever is least", () => {
    for (const level of MATH_CROSSWORD_LEVELS) {
      const card = generateMathCrosswordCard(mulberry32(2), null, level);
      assert.ok(card);
      const sheet = layoutMathCrosswordSheet(card, WITH_CHARACTER);
      const limit = Math.min(level.maxCell, 190 / sheet.cols, (287 - (10 + 26 + GAP)) / sheet.rows);
      assert.ok(Math.abs(sheet.cell - limit) < EPSILON, level.id);
    }
  });

  void test("throws when there is no room under the instruction", () => {
    const card = generateMathCrosswordCard(mulberry32(2), null, MATH_CROSSWORD_LEVELS[1]);
    assert.ok(card);
    assert.throws(() => layoutMathCrosswordSheet(card, 300), /No room/);
  });
});
