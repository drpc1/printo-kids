import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { cardLevelGroups } from "./card-levels.ts";
import { CARD_KINDS } from "./cards.ts";

const CARDS_WITH_TYPICAL_AGE = ["labirynt", "symetria", "sekwencje", "dyktando"];

void describe("cardLevelGroups", () => {
  void test("every card has at least one group with at least one named row", () => {
    for (const kind of CARD_KINDS) {
      const groups = cardLevelGroups(kind.id);
      assert.ok(groups.length > 0, `${kind.id} has no level group`);
      for (const group of groups) {
        assert.ok(group.rows.length > 0, `${kind.id} has an empty group`);
        for (const row of group.rows) {
          assert.ok(row.label.trim().length > 0, `${kind.id} has a row without a label`);
        }
      }
    }
  });

  void test("only the four cards with an old age name show a typical age", () => {
    for (const kind of CARD_KINDS) {
      const hasAge = cardLevelGroups(kind.id).some((group) => group.rows.some((row) => row.typicalAge !== undefined));
      assert.equal(hasAge, CARDS_WITH_TYPICAL_AGE.includes(kind.id), `typicalAge on ${kind.id}`);
    }
  });

  void test("sudoku has three groups by board size", () => {
    const groups = cardLevelGroups("sudoku");
    assert.deepEqual(
      groups.map((group) => group.heading),
      ["4×4", "6×6", "9×9"],
    );
    assert.equal(groups[0]?.rows.length, 1);
    assert.equal(groups[1]?.rows.length, 3);
    assert.equal(groups[2]?.rows.length, 3);
  });
});
