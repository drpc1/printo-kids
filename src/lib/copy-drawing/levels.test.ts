import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { NONOGRAM_SIZES } from "../nonogram/sizes.ts";
import {
  COPY_DRAWING_LEVELS,
  DEFAULT_COPY_DRAWING_LEVEL_ID,
  copyDrawingLevelById,
  type CopyDrawingLevelId,
} from "./levels.ts";

void describe("COPY_DRAWING_LEVELS", () => {
  void test("easy, middle and hard have the 8x12, 12x15 and 18x24 grids", () => {
    const grids = COPY_DRAWING_LEVELS.map((level) => `${level.id} ${level.size.columns}x${level.size.rows}`);
    assert.deepEqual(grids, ["latwy 8x12", "sredni 12x15", "trudny 18x24"]);
  });

  void test("the cells are 11, 7.5 and 5 mm: the width-bound maximum for two equal grids side by side", () => {
    assert.deepEqual(
      COPY_DRAWING_LEVELS.map((level) => level.cellSize),
      [11, 7.5, 5],
    );
  });

  void test("every level points at the nonogram size of its id", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      assert.equal(
        level.size,
        NONOGRAM_SIZES.find((size) => size.id === level.id),
      );
    }
  });

  void test("every level has a label, a bar label and a description without an age", () => {
    for (const level of COPY_DRAWING_LEVELS) {
      assert.ok(level.label.length > 0 && level.barLabel.length > 0 && level.description.length > 0);
      assert.ok(!level.description.includes("lat"), level.id);
    }
  });

  void test("the default level exists", () => {
    assert.equal(copyDrawingLevelById(DEFAULT_COPY_DRAWING_LEVEL_ID).id, "sredni");
  });

  void test("an unknown level throws", () => {
    assert.throws(() => copyDrawingLevelById("nieznany" as CopyDrawingLevelId));
  });
});
