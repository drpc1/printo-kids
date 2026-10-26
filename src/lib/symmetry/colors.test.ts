import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { symmetryDrawnCells } from "./colors.ts";
import { composeSymmetryCard } from "./generate.ts";
import { symmetryLevelById } from "./levels.ts";
import { SYMMETRY_SHEET } from "./sheet.ts";
import { symmetryTemplatesFor } from "./templates.ts";

const LAT4 = symmetryLevelById("lat4");
const LAT5 = symmetryLevelById("lat5");

void describe("symmetryDrawnCells", () => {
  void test("without colors every pattern cell is ink and the hints are paler ink", () => {
    const card = composeSymmetryCard(symmetryTemplatesFor("lat4")[0], [0, 0, 0], 0, LAT4);
    const drawn = symmetryDrawnCells(card, false);

    assert.equal(drawn.length, card.cells.length + card.hints.length);
    assert.ok(drawn.every((item) => item.fill === "var(--foreground)"));
    assert.deepEqual(
      drawn.filter((item) => item.opacity === 1).map((item) => item.cell),
      card.cells,
    );
    assert.deepEqual(
      drawn.filter((item) => item.opacity === SYMMETRY_SHEET.hintOpacity).map((item) => item.cell),
      card.hints,
    );
    assert.equal(SYMMETRY_SHEET.hintOpacity, 0.35);
  });

  void test("with colors the window of the rocket is blue and the details add cells (hand-written oracle)", () => {
    const card = composeSymmetryCard(symmetryTemplatesFor("lat5")[0], [0, 0, 0], 0, LAT5);
    const drawn = symmetryDrawnCells(card, true);

    assert.equal(drawn.length, card.cells.length + card.details.length);
    const window = drawn.find((item) => item.cell.col === 4 && item.cell.row === 4);
    assert.deepEqual(window, { cell: { col: 4, row: 4, color: "blue" }, fill: "var(--symmetry-blue)", opacity: 1 });
    const nose = drawn.find((item) => item.cell.col === 5 && item.cell.row === 0);
    assert.equal(nose?.fill, "var(--symmetry-red)");
  });

  void test("with colors a hint keeps the crayon of the cell it mirrors, at the pale opacity", () => {
    const card = composeSymmetryCard(symmetryTemplatesFor("lat4")[0], [0, 0, 0], 0, LAT4);
    const hints = symmetryDrawnCells(card, true).filter((item) => item.opacity < 1);

    assert.equal(hints.length, 3);
    for (const { cell, fill, opacity } of hints) {
      assert.equal(fill, `var(--symmetry-${cell.color})`);
      assert.equal(opacity, 0.35);
    }
  });

  void test("a brown cell draws with the brown crayon token", () => {
    const card = composeSymmetryCard(
      {
        id: "pien",
        holeColor: null,
        categories: ["przyroda"],
        width: 6,
        height: 1,
        base: [{ col: 5, row: 0, color: "brown" }],
        parts: [],
      },
      [],
      0,
      LAT5,
    );

    assert.equal(symmetryDrawnCells(card, true)[0]?.fill, "var(--symmetry-brown)");
  });

  void test("every drawn cell uses a theme token, never a hex", () => {
    const card = composeSymmetryCard(symmetryTemplatesFor("lat7")[1], [0, 0, 0, 0], 0, symmetryLevelById("lat7"));

    for (const colors of [false, true]) {
      assert.ok(symmetryDrawnCells(card, colors).every((item) => /^var\(--[a-z-]+\)$/.test(item.fill)));
    }
  });
});
