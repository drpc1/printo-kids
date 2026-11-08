import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, test } from "node:test";
import { moneyImage } from "./colors.ts";
import { MONEY_LEVELS } from "./levels.ts";

const NOMINALS = [...new Set(MONEY_LEVELS.flatMap((level) => level.nominals))].sort((a, b) => a - b);

void describe("moneyImage", () => {
  void test("the levels use 1, 2, 5, 10 and 20 zł", () => {
    assert.deepEqual(NOMINALS, [1, 2, 5, 10, 20]);
  });

  void test("every nominal of every level has a picture in public/money", () => {
    for (const value of NOMINALS) {
      const path = moneyImage(value, true);
      assert.ok(path !== null, `${value} zł`);
      assert.ok(existsSync(new URL(`../../../public${path}`, import.meta.url)), path);
    }
  });

  void test("without colors there is no picture", () => {
    for (const value of NOMINALS) {
      assert.equal(moneyImage(value, false), null);
    }
  });

  void test("different nominals have different pictures", () => {
    const paths = NOMINALS.map((value) => moneyImage(value, true));
    assert.equal(new Set(paths).size, NOMINALS.length);
  });
});
