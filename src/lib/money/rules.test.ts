import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { moneyLevelById } from "./levels.ts";
import {
  compareRow,
  isMisleading,
  moneyCardProblems,
  moneyRowProblems,
  pairKey,
  pieceCount,
  pileValue,
  rowKey,
  type MoneyCard,
  type MoneyRow,
} from "./rules.ts";

const EASY = moneyLevelById("latwy");
const MEDIUM = moneyLevelById("sredni");
const HARD = moneyLevelById("trudny");

function row(left: number[], right: number[]): MoneyRow {
  return { left, right, answer: compareRow(left, right) };
}

function card(levelId: MoneyCard["levelId"], rows: MoneyRow[]): MoneyCard {
  return { levelId, rows, key: rows.map(rowKey).join(";") };
}

void describe("pileValue and pieceCount", () => {
  void test("the value is the sum of the nominals and the count is the number of pieces", () => {
    assert.equal(pileValue([20, 5, 2, 1]), 28);
    assert.equal(pieceCount([20, 5, 2, 1]), 4);
    assert.equal(pileValue([]), 0);
  });
});

void describe("compareRow", () => {
  void test("left, right and equal", () => {
    assert.equal(compareRow([5, 5], [2, 2, 2]), "left");
    assert.equal(compareRow([1, 1], [2]), "equal");
    assert.equal(compareRow([1], [2, 2]), "right");
  });

  void test("the value counts, not the number of pieces", () => {
    assert.equal(compareRow([10], [1, 1, 1, 1, 1]), "left");
  });
});

void describe("isMisleading", () => {
  void test("true only when the pile with fewer pieces is worth more", () => {
    assert.equal(isMisleading([10], [1, 1, 1]), true);
    assert.equal(isMisleading([1, 1, 1], [10]), true);
    assert.equal(isMisleading([1, 1, 1], [2]), false);
  });

  void test("equal piece counts never mislead, whatever the values", () => {
    assert.equal(isMisleading([5, 5], [1, 1]), false);
  });

  void test("a tie never misleads, even with different piece counts", () => {
    assert.equal(isMisleading([5, 5], [10]), false);
    assert.equal(isMisleading([2, 2], [1, 1, 1, 1]), false);
  });
});

void describe("rowKey and pairKey", () => {
  void test("the order of pieces in a pile does not matter", () => {
    assert.equal(rowKey({ left: [1, 5], right: [2] }), rowKey({ left: [5, 1], right: [2] }));
  });

  void test("swapped sides are another row but the same pair", () => {
    const first = { left: [5], right: [1, 1] };
    const swapped = { left: [1, 1], right: [5] };

    assert.notEqual(rowKey(first), rowKey(swapped));
    assert.equal(pairKey(first), pairKey(swapped));
  });
});

void describe("moneyRowProblems", () => {
  void test("a plain row has none", () => {
    assert.deepEqual(moneyRowProblems(row([2, 2, 2], [2, 2]), EASY), []);
    assert.deepEqual(moneyRowProblems(row([10, 5], [5, 2, 2, 1]), HARD), []);
  });

  void test("the sum on the limit passes, one over fails", () => {
    assert.deepEqual(moneyRowProblems(row([5, 5], [5]), EASY), []);
    assert.ok(moneyRowProblems(row([5, 5, 5], [5]), EASY).includes("pile-sum"));
    assert.deepEqual(moneyRowProblems(row([20, 20, 10], [1]), HARD), []);
    assert.ok(moneyRowProblems(row([20, 20, 10, 1], [1]), HARD).includes("pile-sum"));
  });

  void test("pile size runs from 1 to the level's maximum", () => {
    assert.ok(moneyRowProblems(row([], [1]), EASY).includes("pile-size"));
    assert.ok(moneyRowProblems(row([1, 1, 1, 1, 1, 1], [1]), EASY).includes("pile-size"));
    assert.deepEqual(moneyRowProblems(row([1, 1, 1, 1, 1], [1]), EASY), []);
    assert.ok(moneyRowProblems(row([1, 1, 1, 1, 1, 1, 1, 1, 1], [5]), MEDIUM).includes("pile-size"));
  });

  void test("a nominal outside the level is a problem; notes only on the hard level", () => {
    assert.ok(moneyRowProblems(row([10], [5]), MEDIUM).includes("nominal"));
    assert.deepEqual(moneyRowProblems(row([10], [5]), HARD), []);
    assert.ok(moneyRowProblems(row([3], [1]), HARD).includes("nominal"));
  });

  void test("the first level mixes the coins 1, 2 and 5 zł in a pile, up to 10 zł and 5 pieces", () => {
    assert.deepEqual(moneyRowProblems(row([1, 2], [5]), EASY), []);
    assert.deepEqual(moneyRowProblems(row([5, 2, 1, 1, 1], [5, 5]), EASY), []);
    assert.ok(moneyRowProblems(row([5, 5, 1], [2]), EASY).includes("pile-sum"));
    assert.ok(moneyRowProblems(row([1, 1, 1, 1, 1, 1], [5]), EASY).includes("pile-size"));
  });

  void test("the answer must match the values", () => {
    assert.ok(moneyRowProblems({ left: [5], right: [1], answer: "right" }, MEDIUM).includes("answer"));
    assert.ok(moneyRowProblems({ left: [5], right: [2, 2, 1], answer: "left" }, MEDIUM).includes("answer"));
  });

  void test("a tie with different piles is fine, identical piles are not", () => {
    assert.deepEqual(moneyRowProblems(row([5, 5], [5, 2, 2, 1]), MEDIUM), []);
    assert.ok(moneyRowProblems(row([5, 2], [2, 5]), MEDIUM).includes("identical-piles"));
    assert.ok(moneyRowProblems(row([2, 2], [2, 2]), EASY).includes("identical-piles"));
  });
});

void describe("moneyCardProblems", () => {
  void test("a card needs exactly five rows", () => {
    const four = card("sredni", [row([1], [2]), row([2], [5]), row([1, 1], [2]), row([5], [1, 1])]);

    assert.ok(moneyCardProblems(four, MEDIUM).includes("row-count"));
  });

  void test("średni needs exactly 2 misleading rows: 1 and 3 fail, 2 passes", () => {
    const misleading = [row([5], [1, 1, 1]), row([5, 2], [2, 2, 1, 1]), row([2, 2, 2], [1, 1, 1, 1, 1])];
    const quiet = [row([1], [2]), row([2], [5]), row([5, 2], [2]), row([1, 1, 1], [2])];

    assert.deepEqual(moneyCardProblems(card("sredni", [...misleading.slice(0, 2), ...quiet.slice(0, 3)]), MEDIUM), []);
    assert.ok(
      moneyCardProblems(card("sredni", [...misleading.slice(0, 1), ...quiet.slice(0, 4)]), MEDIUM).includes(
        "misleading-count",
      ),
    );
    assert.ok(
      moneyCardProblems(card("sredni", [...misleading, ...quiet.slice(0, 2)]), MEDIUM).includes("misleading-count"),
    );
  });

  void test("trudny needs at least 3: 2 fail, 3 and 5 pass", () => {
    const misleading = [
      row([10], [1, 1, 1]),
      row([20], [5, 2, 2]),
      row([10, 5], [2, 2, 2, 2, 1]),
      row([20, 5], [5, 2, 2, 2, 1, 1]),
      row([10, 10], [5, 5, 2, 2, 1]),
    ];
    const quiet = [row([1], [2]), row([2], [5])];

    assert.ok(
      moneyCardProblems(card("trudny", [...misleading.slice(0, 2), ...quiet, row([5, 2], [2])]), HARD).includes(
        "misleading-count",
      ),
    );
    assert.deepEqual(moneyCardProblems(card("trudny", [...misleading.slice(0, 3), ...quiet]), HARD), []);
    assert.deepEqual(moneyCardProblems(card("trudny", misleading), HARD), []);
  });

  void test("łatwy: a card of rows where more pieces mean more money passes, a misleading row fails", () => {
    const rows = [row([1], [1, 1]), row([2, 2], [2]), row([5], [5, 5]), row([1, 1, 1], [1, 1]), row([2], [2, 2, 2])];

    assert.deepEqual(moneyCardProblems(card("latwy", rows), EASY), []);
  });

  void test("at most one tie row: zero and one pass, two fail", () => {
    const base = [row([1], [2]), row([2], [5]), row([5, 2], [2])];
    const ties = [row([5, 5], [5, 2, 2, 1]), row([2, 2, 1], [5])];

    assert.deepEqual(
      moneyCardProblems(card("sredni", [row([5], [1, 1, 1]), row([5, 2], [2, 2, 1, 1]), ...base]), MEDIUM),
      [],
    );
    assert.deepEqual(
      moneyCardProblems(
        card("sredni", [row([5], [1, 1, 1]), row([5, 2], [2, 2, 1, 1]), ties[0], ...base.slice(0, 2)]),
        MEDIUM,
      ),
      [],
    );
    assert.ok(
      moneyCardProblems(
        card("sredni", [row([5], [1, 1, 1]), row([5, 2], [2, 2, 1, 1]), ties[0], ties[1], base[0]]),
        MEDIUM,
      ).includes("tie-rows"),
    );
  });

  void test("the same pair twice, even with swapped sides, is a duplicate row", () => {
    const rows = [row([5], [1, 1, 1]), row([1, 1, 1], [5]), row([5, 2], [2, 2, 1, 1]), row([1], [2]), row([2], [5])];

    assert.ok(moneyCardProblems(card("sredni", rows), MEDIUM).includes("duplicate-row"));
  });
});
