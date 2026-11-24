import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { CARD_KINDS } from "./cards.ts";
import { CODING_LEVELS, CODING_MODES, codingInstruction } from "./coding/levels.ts";
import { allPlainInstructions, codingPlainInstruction } from "./sheet/card-instructions.ts";
import { layoutPlainInstruction } from "./sheet/plain-instruction.ts";

// The inputs are the ones the card components lay out with (src/lib/sheet/card-instructions.ts), not a copy of them.
const PLAIN_INSTRUCTIONS = allPlainInstructions();

/** The maze draws no instruction, so it has no plain line to fit. */
const WITHOUT_INSTRUCTION = ["labirynt"];

void describe("the instruction of every card without a character", () => {
  void test("every card kind but the maze is covered, so a new card cannot skip this test", () => {
    const expected = CARD_KINDS.map((kind) => kind.id)
      .filter((id) => !WITHOUT_INSTRUCTION.includes(id))
      .sort();
    assert.deepEqual(Object.keys(PLAIN_INSTRUCTIONS).sort(), expected);
  });

  void test("every instruction of every level and mode is laid out inside the margins", () => {
    for (const [card, instructions] of Object.entries(PLAIN_INSTRUCTIONS)) {
      assert.ok(instructions.length > 0, card);
      for (const instruction of instructions) {
        // layoutPlainInstruction throws when a line is wider than the page between margins
        const layout = layoutPlainInstruction(instruction);
        assert.ok(layout.lines.length >= 1, card);
        assert.ok(layout.height >= instruction.size, card);
      }
    }
  });

  void test("the long instructions of Kodowanie in Zapisz are broken into two lines, the short ones are not", () => {
    const zapisz = CODING_MODES.find((mode) => mode.id === "zapisz");
    const wykonaj = CODING_MODES.find((mode) => mode.id === "wykonaj");
    assert.ok(zapisz !== undefined && wykonaj !== undefined);
    for (const level of CODING_LEVELS) {
      assert.equal(
        layoutPlainInstruction(codingPlainInstruction(codingInstruction(level, zapisz))).lines.length,
        2,
        level.id,
      );
      assert.equal(
        layoutPlainInstruction(codingPlainInstruction(codingInstruction(level, wykonaj))).lines.length,
        1,
        level.id,
      );
    }
  });

  void test("Dyktando graficzne, whose instruction is 189 mm wide in the browser, is broken into two lines", () => {
    const layout = layoutPlainInstruction(PLAIN_INSTRUCTIONS.dyktando[0]);
    assert.equal(layout.lines.length, 2);
  });

  void test("every other card keeps its instruction on one line, so its layout does not move", () => {
    const broken = ["kodowanie", "dyktando"];
    for (const [card, instructions] of Object.entries(PLAIN_INSTRUCTIONS)) {
      if (broken.includes(card) || card === "sudoku") {
        continue;
      }
      for (const instruction of instructions) {
        const layout = layoutPlainInstruction(instruction);
        assert.equal(layout.lines.length, 1, `${card}: ${instruction.text}`);
        assert.equal(layout.height, instruction.size, card);
      }
    }
  });
});
