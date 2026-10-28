import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CARD_KINDS, cardsInCatalogOrder } from "./cards.ts";

void describe("cardsInCatalogOrder", () => {
  void test("orders titles alphabetically and leaves CARD_KINDS in insertion order", () => {
    const ordered = cardsInCatalogOrder();

    assert.deepEqual(
      ordered.map((kind) => kind.title),
      ["Dyktando graficzne", "Labirynt", "Nonogram", "Sekwencje", "Sudoku", "Symetria"],
    );
    assert.equal(CARD_KINDS[0].title, "Labirynt");
    assert.equal(CARD_KINDS[CARD_KINDS.length - 1].title, "Dyktando graficzne");
    assert.notEqual(ordered, CARD_KINDS);
  });
});
