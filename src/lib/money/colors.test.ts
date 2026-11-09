import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, test } from "node:test";
import { moneyImage, moneyImagePaths } from "./colors.ts";
import { MONEY_CURRENCY_IDS } from "./currencies.ts";
import { moneyLevels } from "./levels.ts";

/** The nominals any level of the currency can draw. */
function nominalsOf(currency: (typeof MONEY_CURRENCY_IDS)[number]): number[] {
  return [...new Set(moneyLevels(currency).flatMap((level) => level.nominals))].sort((a, b) => a - b);
}

void describe("moneyImage", () => {
  void test("the złoty levels use 1, 2, 5, 10, 20, 50 and 100 zł", () => {
    assert.deepEqual(nominalsOf("pln"), [1, 2, 5, 10, 20, 50, 100]);
  });

  void test("every nominal of every złoty level has a picture in public/money", () => {
    for (const value of nominalsOf("pln")) {
      const path = moneyImage(value, "pln", true);
      assert.ok(path !== null, `${value} zł`);
      assert.ok(existsSync(new URL(`../../../public${path}`, import.meta.url)), path);
    }
  });

  void test("the preload list of a currency holds the picture of every nominal its levels use", () => {
    for (const currency of MONEY_CURRENCY_IDS) {
      const paths = moneyImagePaths(currency);
      for (const value of nominalsOf(currency)) {
        assert.ok(paths.includes(moneyImage(value, currency, true) ?? ""), `${currency} ${value}`);
      }
    }
  });

  void test("without colors there is no picture", () => {
    for (const value of nominalsOf("pln")) {
      assert.equal(moneyImage(value, "pln", false), null);
    }
  });

  void test("different nominals and different currencies have different pictures", () => {
    const paths = MONEY_CURRENCY_IDS.flatMap((currency) =>
      nominalsOf(currency).map((value) => moneyImage(value, currency, true)),
    );
    assert.equal(new Set(paths).size, paths.length);
  });
});
