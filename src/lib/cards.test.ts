import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CARD_KINDS, cardPageTitle, cardTitle, cardsInCatalogOrder } from "./cards.ts";

void describe("cardsInCatalogOrder", () => {
  void test("orders titles alphabetically and leaves CARD_KINDS in insertion order", () => {
    const ordered = cardsInCatalogOrder();

    assert.deepEqual(
      ordered.map((kind) => kind.title),
      CARD_KINDS.map((kind) => kind.title).sort((a, b) => a.localeCompare(b, "pl")),
    );
    assert.equal(CARD_KINDS[0].title, "Labirynt");
    assert.notEqual(ordered, CARD_KINDS);
  });
});

void describe("cardTitle", () => {
  void test("returns the catalog title for every card kind", () => {
    for (const kind of CARD_KINDS) {
      assert.equal(cardTitle(kind.id), kind.title);
    }
  });

  void test("throws for an unknown id", () => {
    assert.throws(() => cardTitle("nie-ma"), /Unknown card kind/);
  });
});

void describe("card descriptions", () => {
  void test("every card kind has a non-empty description for the how-it-works page", () => {
    for (const kind of CARD_KINDS) {
      assert.ok(kind.description.trim().length > 0, `${kind.id} has no description`);
    }
  });
});

void describe("cardPageTitle", () => {
  void test("prefixes the card title with the product name", () => {
    assert.equal(cardPageTitle("labirynt"), "PrintoKids - Labirynt");
    assert.equal(cardPageTitle("dyktando"), "PrintoKids - Dyktando graficzne");
  });
});
