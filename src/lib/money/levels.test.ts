import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { MONEY_CURRENCY_IDS, PIECES, pieceKind } from "./currencies.ts";
import { DEFAULT_MONEY_LEVEL_ID, MONEY_LEVEL_IDS, moneyLevelById, moneyLevels } from "./levels.ts";
import { MAX_NOTES, MAX_NOTES_WITHOUT_COINS } from "./sheet.ts";

void describe("moneyLevels", () => {
  void test("three levels in order, named without an age, in every currency", () => {
    for (const currency of MONEY_CURRENCY_IDS) {
      const levels = moneyLevels(currency);
      assert.deepEqual(
        levels.map((level) => [level.id, level.label, level.barLabel, level.currency]),
        [
          ["latwy", "łatwy", "łatwy", currency],
          ["sredni", "średni", "średni", currency],
          ["trudny", "trudny", "trudny", currency],
        ],
      );
      for (const level of levels) {
        assert.ok(level.description.length > 0);
        assert.ok(!level.description.includes(" lat"), level.description);
      }
    }
  });

  void test("the table of the plan: nominals and largest pile per level and currency", () => {
    const rows = (currency: (typeof MONEY_CURRENCY_IDS)[number]) =>
      moneyLevels(currency).map((level) => [level.id, level.nominals, level.maxSum, level.maxPieces]);
    const hard = [1, 2, 5, 10, 20, 50, 100];

    assert.deepEqual(rows("pln"), [
      ["latwy", [1, 2, 5], 10, 5],
      ["sredni", [1, 2, 5], 20, 8],
      ["trudny", hard, 200, 10],
    ]);
    assert.deepEqual(rows("eur"), [
      ["latwy", [1, 2], 10, 5],
      ["sredni", [1, 2, 5], 20, 8],
      ["trudny", hard, 200, 10],
    ]);
    assert.deepEqual(rows("usd"), [
      ["latwy", [1, 5], 10, 5],
      ["sredni", [1, 5, 10], 20, 8],
      ["trudny", [1, 5, 10, 20, 50, 100], 200, 10],
    ]);
  });

  void test("every nominal of every level is a value of its currency", () => {
    for (const currency of MONEY_CURRENCY_IDS) {
      const values = PIECES[currency].map((piece) => piece.value);
      for (const level of moneyLevels(currency)) {
        assert.ok(
          level.nominals.every((value) => values.includes(value)),
          `${currency} ${level.id}`,
        );
      }
    }
  });

  void test("every level has five rows and its note limit; łatwy never misleads, średni has 2, trudny at least 3", () => {
    for (const currency of MONEY_CURRENCY_IDS) {
      const limit = currency === "usd" ? MAX_NOTES_WITHOUT_COINS : MAX_NOTES;
      assert.deepEqual(
        moneyLevels(currency).map((level) => [
          level.id,
          level.rowCount,
          level.misleadingMin,
          level.misleadingMax,
          level.maxNotes,
        ]),
        [
          ["latwy", 5, 0, 0, limit],
          ["sredni", 5, 2, 2, limit],
          ["trudny", 5, 3, 5, limit],
        ],
      );
    }
  });

  void test("the first level has coins only, except in dollars, which have notes only", () => {
    for (const currency of ["pln", "eur"] as const) {
      assert.ok(moneyLevelById("latwy", currency).nominals.every((value) => pieceKind(value, currency) === "coin"));
    }
    assert.deepEqual(moneyLevelById("latwy", "usd").nominals, [1, 5]);
    assert.ok(moneyLevelById("latwy", "usd").nominals.every((value) => pieceKind(value, "usd") === "note"));
  });

  void test("the descriptions name the currency sign", () => {
    assert.equal(moneyLevelById("latwy", "pln").description, "monety 1, 2 i 5 zł, małe kupki, liczba sztuk nie myli");
    assert.equal(moneyLevelById("sredni", "eur").description, "monety 1 i 2 €, banknot 5 €, liczba sztuk czasem myli");
    assert.equal(moneyLevelById("latwy", "usd").description, "banknoty 1 i 5 $, małe kupki, liczba sztuk nie myli");
    assert.equal(moneyLevelById("trudny", "usd").description, "monety i banknoty do 100 $, liczba sztuk często myli");
  });

  void test("the default is średni and lookups work", () => {
    assert.equal(DEFAULT_MONEY_LEVEL_ID, "sredni");
    assert.deepEqual(MONEY_LEVEL_IDS, ["latwy", "sredni", "trudny"]);
    assert.equal(moneyLevelById("trudny", "pln").label, "trudny");
    assert.throws(() => moneyLevelById("lat5" as never, "pln"));
  });
});
