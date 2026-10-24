import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { layoutSymmetrySheet } from "./layout.ts";
import { DEFAULT_SYMMETRY_LEVEL_ID, SYMMETRY_LEVELS, symmetryLevelById } from "./levels.ts";
import { SYMMETRY_SHEET } from "./sheet.ts";

void describe("SYMMETRY_LEVELS", () => {
  void test("are the four age levels of the PRD table (hand-written oracle)", () => {
    assert.deepEqual(
      SYMMETRY_LEVELS.map(({ id, label, columns, rows, cellSize, hintCount }) => [
        id,
        label,
        columns,
        rows,
        cellSize,
        hintCount,
      ]),
      [
        ["lat4", "4 lata", 8, 12, 20, 3],
        ["lat5", "5 lat", 12, 16, 15, 0],
        ["lat6", "6 lat", 14, 20, 12, 0],
        ["lat7", "7 lat", 18, 24, 10, 0],
      ],
    );
  });

  void test("the default level is 5 lat, the setting of the first symmetry card", () => {
    assert.equal(DEFAULT_SYMMETRY_LEVEL_ID, "lat5");
    assert.equal(symmetryLevelById(DEFAULT_SYMMETRY_LEVEL_ID).columns, 12);
  });

  void test("every grid has an even width, so the axis splits it into two equal halves", () => {
    for (const level of SYMMETRY_LEVELS) {
      assert.equal(level.columns % 2, 0, level.id);
    }
  });

  void test("every level fits an A4 sheet inside the 10 mm margin", () => {
    for (const level of SYMMETRY_LEVELS) {
      const sheet = layoutSymmetrySheet({
        pageWidth: SYMMETRY_SHEET.pageWidth,
        pageHeight: SYMMETRY_SHEET.pageHeight,
        inset: SYMMETRY_SHEET.inset,
        columns: level.columns,
        rows: level.rows,
        cellSize: level.cellSize,
        instructionHeight: SYMMETRY_SHEET.instructionSize,
        instructionGap: SYMMETRY_SHEET.instructionGap,
      });

      assert.ok(sheet.grid.x >= SYMMETRY_SHEET.inset, level.id);
      assert.ok(sheet.grid.x + sheet.grid.width <= SYMMETRY_SHEET.pageWidth - SYMMETRY_SHEET.inset, level.id);
      assert.ok(sheet.axis.y2 <= SYMMETRY_SHEET.pageHeight - SYMMETRY_SHEET.inset, level.id);
    }
  });

  void test("an unknown level id throws", () => {
    assert.throws(() => symmetryLevelById("lat9" as never), /lat9/);
  });
});
