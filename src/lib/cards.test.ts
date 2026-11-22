import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CARD_KINDS, CARD_SKILLS, cardPageTitle, cardSkillLabels, cardTitle, cardsInCatalogOrder } from "./cards.ts";

void describe("cardsInCatalogOrder", () => {
  void test("keeps CARD_KINDS in Polish alphabetical order and returns a sorted copy", () => {
    const titles = CARD_KINDS.map((kind) => kind.title);
    const ordered = cardsInCatalogOrder();

    assert.deepEqual(
      titles,
      [...titles].sort((a, b) => a.localeCompare(b, "pl")),
    );
    assert.deepEqual(
      ordered.map((kind) => kind.title),
      titles,
    );
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

void describe("card skills", () => {
  const titlesWith = (skillId: string) =>
    CARD_KINDS.filter((kind) => (kind.skills as readonly string[]).includes(skillId)).map((kind) => kind.title);

  void test("assigns the skills decided on 2026-11-22", () => {
    assert.deepEqual(titlesWith("liczby"), ["Krzyżówka matematyczna", "Kto ma więcej", "Labirynt liczbowy"]);
    assert.deepEqual(titlesWith("logika"), [
      "Kodowanie",
      "Który nie pasuje",
      "Labirynt",
      "Nonogram",
      "Sekwencje",
      "Sudoku",
    ]);
    assert.deepEqual(titlesWith("rysowanie"), [
      "Dyktando graficzne",
      "Labirynt",
      "Skopiuj obrazek",
      "Symetria",
      "Szlaczki",
    ]);
    assert.deepEqual(titlesWith("spostrzegawczosc"), [
      "Cienie",
      "Który nie pasuje",
      "Od najmniejszego",
      "Skopiuj obrazek",
      "Symetria",
    ]);
    assert.deepEqual(titlesWith("czas-pieniadze"), ["Kto ma więcej", "Zegar"]);
  });

  void test("every card has one or two distinct skills in the order of CARD_SKILLS", () => {
    const order: string[] = CARD_SKILLS.map((skill) => skill.id);
    for (const kind of CARD_KINDS) {
      assert.ok(kind.skills.length >= 1 && kind.skills.length <= 2, `${kind.id} has ${kind.skills.length} skills`);
      assert.equal(new Set(kind.skills).size, kind.skills.length, `${kind.id} repeats a skill`);
      const indexes = kind.skills.map((skill) => order.indexOf(skill));
      assert.ok(indexes.every((index) => index >= 0));
      assert.deepEqual(
        indexes,
        [...indexes].sort((a, b) => a - b),
        `${kind.id} skills are out of order`,
      );
    }
  });

  void test("every skill has at least two cards", () => {
    for (const skill of CARD_SKILLS) {
      assert.ok(titlesWith(skill.id).length >= 2, `${skill.id} has fewer than two cards`);
    }
  });

  void test("CARD_SKILLS has unique ids and Polish alphabetical labels", () => {
    const labels = CARD_SKILLS.map((skill) => skill.label);
    assert.equal(new Set(CARD_SKILLS.map((skill) => skill.id)).size, CARD_SKILLS.length);
    assert.deepEqual(
      labels,
      [...labels].sort((a, b) => a.localeCompare(b, "pl")),
    );
  });

  void test("cardSkillLabels returns labels in the order of the list", () => {
    assert.deepEqual(cardSkillLabels({ skills: ["spostrzegawczosc", "logika"] }), ["Logika", "Spostrzegawczość"]);
    assert.deepEqual(cardSkillLabels({ skills: ["czas-pieniadze", "liczby"] }), ["Czas i pieniądze", "Liczby"]);
  });
});

void describe("cardPageTitle", () => {
  void test("prefixes the card title with the product name", () => {
    assert.equal(cardPageTitle("labirynt"), "PrintoKids - Labirynt");
    assert.equal(cardPageTitle("dyktando"), "PrintoKids - Dyktando graficzne");
  });
});
