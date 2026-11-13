import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { moneyImage, moneyImagePaths } from "./colors.ts";
import { MONEY_CURRENCY_IDS, pieceKind } from "./currencies.ts";
import { moneyLevels } from "./levels.ts";

/** The nominals any level of the currency can draw. */
function nominalsOf(currency: (typeof MONEY_CURRENCY_IDS)[number]): number[] {
  return [...new Set(moneyLevels(currency).flatMap((level) => level.nominals))].sort((a, b) => a - b);
}

void describe("moneyImage", () => {
  void test("the złoty levels use 1, 2, 5, 10, 20, 50 and 100 zł", () => {
    assert.deepEqual(nominalsOf("pln"), [1, 2, 5, 10, 20, 50, 100]);
  });

  void test("every nominal of every level of every currency has a picture in public/money", () => {
    for (const currency of MONEY_CURRENCY_IDS) {
      for (const value of nominalsOf(currency)) {
        const path = moneyImage(value, currency, true);
        assert.ok(path !== null, `${currency} ${value}`);
        assert.ok(existsSync(new URL(`../../../public${path}`, import.meta.url)), path);
      }
    }
  });

  void test("each picture is a PNG shaped like its piece: a coin is square, a note about twice as wide as high", () => {
    for (const currency of MONEY_CURRENCY_IDS) {
      for (const value of nominalsOf(currency)) {
        const path = moneyImage(value, currency, true) ?? "";
        const header = readFileSync(new URL(`../../../public${path}`, import.meta.url));
        assert.equal(header.toString("latin1", 1, 4), "PNG", path);
        const ratio = header.readUInt32BE(16) / header.readUInt32BE(20);
        if (pieceKind(value, currency) === "coin") {
          assert.ok(ratio > 0.9 && ratio < 1.1, `${path} ${ratio}`);
        } else {
          assert.ok(ratio > 1.8 && ratio < 2.2, `${path} ${ratio}`);
        }
      }
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
