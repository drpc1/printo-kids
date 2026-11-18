import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ICONS } from "../odd-one-out/icons.ts";
import { CHARACTER_CHOICES, characterContentLeft, characterContentRight } from "../sheet/character.ts";
import { estimatedTextWidth, instructionLines, layoutSpeechBand, SPEECH_BAND } from "../sheet/speech.ts";
import { generateSizeOrderCard } from "./generate.ts";
import { iconBounds, layoutSizeOrderSheet, pictureAspect } from "./layout.ts";
import { SIZE_ORDER_LEVELS } from "./levels.ts";
import { SIZE_ORDER_SHEET } from "./sheet.ts";

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHEET = SIZE_ORDER_SHEET;
const SEEDS = Array.from({ length: 100 }, (_, index) => index + 1);
const EPS = 1e-6;
// With a character the band is 26 mm; without one the plain instruction line.
const BANDS = [SPEECH_BAND.characterSize, SHEET.plainInstructionSize];

void describe("iconBounds", () => {
  void test("every icon has a positive box and an aspect", () => {
    for (const icon of ICONS) {
      const b = iconBounds(icon);
      assert.ok(b.x1 > b.x0 && b.y1 > b.y0, icon.id);
      assert.ok(pictureAspect({ kind: "icon", id: icon.id }));
    }
  });

  void test("a shape is square, an unknown icon has no aspect", () => {
    assert.equal(pictureAspect({ kind: "shape", id: "heart" }), 1);
    assert.equal(pictureAspect({ kind: "icon", id: "nope" }), null);
  });
});

void describe("layoutSizeOrderSheet", () => {
  for (const level of SIZE_ORDER_LEVELS) {
    for (const band of BANDS) {
      void test(`${level.id}, band ${band} mm: inside the margin, on one baseline, steps visible`, () => {
        for (const seed of SEEDS) {
          const card = generateSizeOrderCard(mulberry32(seed), level);
          assert.ok(card);
          const layout = layoutSizeOrderSheet(card, band);
          assert.equal(layout.rows.length, level.rowCount);
          for (const [r, row] of layout.rows.entries()) {
            assert.ok(row.top >= SHEET.inset + band);
            for (const slot of row.slots) {
              assert.ok(slot.cx - slot.width / 2 >= SHEET.inset - EPS);
              assert.ok(slot.cx + slot.width / 2 <= SHEET.pageWidth - SHEET.inset + EPS);
              assert.ok(slot.box.y + slot.box.height <= SHEET.pageHeight - SHEET.inset + EPS);
              assert.ok(row.baseline < slot.box.y);
              assert.ok(slot.box.x >= SHEET.inset - EPS);
              assert.ok(slot.box.x + slot.box.width <= SHEET.pageWidth - SHEET.inset + EPS);
            }
            const heights = row.slots.map((slot) => slot.height);
            const ranked = [...heights].sort((a, b) => a - b);
            for (let i = 1; i < ranked.length; i++) {
              assert.ok(ranked[i] - ranked[i - 1] >= SHEET.minStepMm - EPS, `row ${r} seed ${seed}`);
            }
            card.rows[r].heights.forEach((share, i) => {
              assert.ok(Math.abs(heights[i] / Math.max(...heights) - share) < 1e-9);
            });
          }
        }
      });
    }
  }

  void test("the tallest picture is about 36 mm on the easy and medium levels and 24 mm on the hard one", () => {
    const tallest = SIZE_ORDER_LEVELS.map((level) => {
      const card = generateSizeOrderCard(mulberry32(1), level);
      assert.ok(card);
      const layout = layoutSizeOrderSheet(card, SPEECH_BAND.characterSize);
      return Math.max(...layout.rows.flatMap((row) => row.slots.map((slot) => slot.height)));
    });
    assert.ok(Math.abs(tallest[0] - 36) < 1.5, String(tallest[0]));
    assert.ok(Math.abs(tallest[1] - 36) < 1.5, String(tallest[1]));
    assert.ok(Math.abs(tallest[2] - 24) < 1.5, String(tallest[2]));
  });

  void test("a card with an unknown picture is not laid out", () => {
    const card = generateSizeOrderCard(mulberry32(2), SIZE_ORDER_LEVELS[0]);
    assert.ok(card);
    const bad = {
      ...card,
      rows: [{ ...card.rows[0], picture: { kind: "icon" as const, id: "nope" } }, ...card.rows.slice(1)],
    };
    assert.throws(() => layoutSizeOrderSheet(bad, 26));
  });
});

void describe("the instruction", () => {
  void test("is set in the speech bubble of every character without running out of it", () => {
    const lines = instructionLines(SHEET.instruction);
    assert.ok(lines.length >= 2, "one line this long does not fit the bubble");
    for (const row of CHARACTER_CHOICES) {
      const layout = layoutSpeechBand({
        pageWidth: SHEET.pageWidth,
        inset: SHEET.inset,
        top: SHEET.inset,
        lines,
        contentLeft: characterContentLeft(row.id),
        contentRight: characterContentRight(row.id),
      });
      for (const line of lines) {
        assert.ok(estimatedTextWidth(line, layout.text.size) <= layout.text.maxWidth, row.id + ": " + line);
      }
    }
  });

  void test("fits the width of the page as one line when no character stands in the band", () => {
    const width = SHEET.pageWidth - 2 * SHEET.inset;
    assert.ok(estimatedTextWidth(SHEET.instruction, SHEET.plainInstructionSize) <= width);
  });
});
