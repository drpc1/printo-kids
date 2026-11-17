import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CODING_LEVELS, CODING_MODES, codingInstruction, codingLevelById, codingModeById } from "./levels.ts";
import { CODING_SHEET } from "./sheet.ts";

void describe("coding levels and modes", () => {
  void test("four levels with growing grids, paths and turns", () => {
    assert.deepEqual(
      CODING_LEVELS.map((level) => [level.cols, level.rows, level.pathMin, level.pathMax, level.turnsMin]),
      [
        [5, 5, 6, 8, 1],
        [6, 6, 9, 12, 2],
        [8, 8, 13, 17, 3],
        [10, 10, 18, 24, 4],
      ],
    );
    for (const level of CODING_LEVELS) {
      assert.equal(level.cols, level.rows);
      assert.ok(level.pathMax < level.cols * level.rows);
    }
  });

  void test("only level 4 writes the commands as n and an arrow, and the boxes follow the table", () => {
    assert.deepEqual(
      CODING_LEVELS.map((level) => level.grouped),
      [false, false, false, true],
    );
    assert.deepEqual(
      CODING_LEVELS.map((level) => level.exampleCells),
      [1, 1, 2, 2],
    );
    assert.deepEqual(Object.values(CODING_SHEET.box), [22, 20, 16, 16]);
  });

  void test("lookups return the level and the mode, and throw for an unknown id", () => {
    assert.equal(codingLevelById("poziom3").cell, 22);
    assert.equal(codingModeById("wykonaj").label, "Wykonaj");
    assert.throws(() => codingLevelById("poziom9" as never));
    assert.throws(() => codingModeById("nic" as never));
  });

  void test("the instruction names the number of cells only for Zapisz on a grouped level", () => {
    const [one, , , four] = CODING_LEVELS;
    const [zapisz, wykonaj] = CODING_MODES;
    assert.equal(codingInstruction(one, zapisz), "Zapisz strzałkami drogę do mety. Jedna strzałka to jeden krok.");
    assert.equal(codingInstruction(four, zapisz), "Zapisz drogę do mety. Liczba kratek i strzałka.");
    assert.equal(codingInstruction(one, wykonaj), codingInstruction(four, wykonaj));
  });
});
