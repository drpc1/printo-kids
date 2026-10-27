import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CHARACTER_CHOICES, characterContentLeft, characterContentRight } from "./character.ts";
import {
  estimatedTextWidth,
  fitCellSize,
  instructionBoxHeight,
  instructionLines,
  layoutSpeechBand,
  SPEECH_BAND,
} from "./speech.ts";
import { DICTATION_SHEET } from "../dictation/sheet.ts";
import { NONOGRAM_SHEET } from "../nonogram/sheet.ts";
import { SEQUENCE_SHEET } from "../sequence/sheet.ts";
import { SUDOKU_SHEET } from "../sudoku/sheet.ts";
import { SYMMETRY_SHEET } from "../symmetry/sheet.ts";

const PAGE_WIDTH = 210;
const INSET = 10;
const INNER_HEIGHT = 297 - INSET * 2;

const INSTRUCTIONS = [
  SYMMETRY_SHEET.instructionText,
  SEQUENCE_SHEET.instructionText,
  SUDOKU_SHEET.instructionLines.join(" "),
  NONOGRAM_SHEET.instructionText,
  DICTATION_SHEET.instructionText,
];

const characters = CHARACTER_CHOICES.filter((row) => row.src !== null);

void describe("instruction lines", () => {
  void test("one line per sentence", () => {
    assert.deepEqual(instructionLines("Dorysuj drugą połowę tak, jak w lustrze."), [
      "Dorysuj drugą połowę tak, jak w lustrze.",
    ]);
    assert.deepEqual(instructionLines("Co pasuje w puste pole? Uzupełnij."), ["Co pasuje w puste pole?", "Uzupełnij."]);
    assert.deepEqual(instructionLines("Rysuj po liniach kratki według strzałek. Zacznij od kropki."), [
      "Rysuj po liniach kratki według strzałek.",
      "Zacznij od kropki.",
    ]);
  });
});

void describe("speech band", () => {
  void test("is 26 mm tall with a character and the plain height without one", () => {
    assert.equal(instructionBoxHeight(true, 7), 26);
    assert.equal(instructionBoxHeight(false, 7), 7);
  });

  void test("the character and the bubble stay inside the margins for every character and instruction", () => {
    for (const row of characters) {
      for (const text of INSTRUCTIONS) {
        const layout = layoutSpeechBand({
          pageWidth: PAGE_WIDTH,
          inset: INSET,
          lines: instructionLines(text),
          contentLeft: characterContentLeft(row.id),
          contentRight: characterContentRight(row.id),
        });
        const drawnLeft = layout.character.x + characterContentLeft(row.id) * layout.character.width;
        assert.ok(Math.abs(drawnLeft - INSET) < 1e-9, `${row.id} starts on the margin`);
        assert.equal(layout.character.y, INSET);
        assert.ok(layout.bubble.x + layout.bubble.width <= PAGE_WIDTH - INSET + 1e-9, `${row.id} bubble right edge`);
        assert.ok(
          layout.bubble.y >= INSET && layout.bubble.y + layout.bubble.height <= INSET + 26,
          `${row.id} bubble height`,
        );
        const drawnRight = layout.character.x + layout.character.width * (1 - characterContentRight(row.id));
        assert.ok(layout.bubble.x > drawnRight, `${row.id} bubble starts after the drawing`);
      }
    }
  });

  void test("the longest line of every card fits the bubble of every character", () => {
    for (const row of characters) {
      for (const text of INSTRUCTIONS) {
        const lines = instructionLines(text);
        const layout = layoutSpeechBand({
          pageWidth: PAGE_WIDTH,
          inset: INSET,
          lines,
          contentLeft: characterContentLeft(row.id),
          contentRight: characterContentRight(row.id),
        });
        for (const line of lines) {
          assert.ok(
            estimatedTextWidth(line, layout.text.size) <= layout.text.maxWidth,
            `${row.id}: "${line}" is wider than the bubble`,
          );
        }
      }
    }
  });

  void test("the tail points at the character from the bubble's left edge", () => {
    const layout = layoutSpeechBand({
      pageWidth: PAGE_WIDTH,
      inset: INSET,
      lines: ["Jedno zdanie."],
      contentLeft: 0.2,
      contentRight: 0.2,
    });
    assert.equal(layout.tail.baseX, layout.bubble.x);
    assert.ok(layout.tail.tipX < layout.tail.baseX);
    assert.ok(
      layout.tail.baseTopY >= layout.bubble.y && layout.tail.baseBottomY <= layout.bubble.y + layout.bubble.height,
    );
  });

  void test("one sentence is one larger line and two sentences are two smaller lines around the center", () => {
    const base = { pageWidth: PAGE_WIDTH, inset: INSET, contentLeft: 0, contentRight: 0 };
    const one = layoutSpeechBand({ ...base, lines: ["A."] });
    const two = layoutSpeechBand({ ...base, lines: ["A.", "B."] });
    assert.equal(one.text.size, SPEECH_BAND.singleLineSize);
    assert.equal(two.text.size, SPEECH_BAND.multiLineSize);
    assert.equal(one.text.ys[0], INSET + 13);
    assert.ok(Math.abs(((two.text.ys[0] ?? 0) + (two.text.ys[1] ?? 0)) / 2 - (INSET + 13)) < 1e-9);
  });

  void test("an own image without margins starts its bubble after the whole 26 mm box", () => {
    const layout = layoutSpeechBand({
      pageWidth: PAGE_WIDTH,
      inset: INSET,
      lines: ["A."],
      contentLeft: 0,
      contentRight: 0,
    });
    assert.equal(layout.character.x, INSET);
    assert.equal(layout.bubble.x, INSET + 26 + SPEECH_BAND.tailLength);
  });
});

void describe("fitCellSize", () => {
  void test("keeps the nominal size when the block fits", () => {
    assert.equal(fitCellSize({ nominal: 14, rows: 14, fixedHeight: 7 + 6 + 36 + 6, innerHeight: INNER_HEIGHT }), 14);
  });

  void test("returns the largest 0.1 mm size that fits the dictation hard level with six rows of commands", () => {
    // 26 band + 6 gap + 6 rows of 8.3 mm + 6 gap above the grid, 26 rows of cells.
    assert.equal(
      fitCellSize({ nominal: 8, rows: 26, fixedHeight: 26 + 6 + 6 * 8.3 + 6, innerHeight: INNER_HEIGHT }),
      7.2,
    );
  });

  void test("returns 7.5 mm for the same level with five rows of commands", () => {
    assert.equal(
      fitCellSize({ nominal: 8, rows: 26, fixedHeight: 26 + 6 + 5 * 8.3 + 6, innerHeight: INNER_HEIGHT }),
      7.5,
    );
  });

  void test("returns the easy and medium sizes for a full list of 55 commands", () => {
    assert.equal(fitCellSize({ nominal: 14, rows: 14, fixedHeight: 26 + 6 + 60 + 6, innerHeight: INNER_HEIGHT }), 12.7);
    assert.equal(fitCellSize({ nominal: 11, rows: 17, fixedHeight: 26 + 6 + 60 + 6, innerHeight: INNER_HEIGHT }), 10.5);
  });

  void test("never returns a negative size", () => {
    assert.equal(fitCellSize({ nominal: 8, rows: 10, fixedHeight: 400, innerHeight: INNER_HEIGHT }), 0);
  });
});
