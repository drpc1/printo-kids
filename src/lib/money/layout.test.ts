import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { layoutMoneySheet, layoutPile, pieceKind, type MoneySheetInput } from "./layout.ts";
import { MAX_PIECES, MONEY_SHEET } from "./sheet.ts";

const INPUT: MoneySheetInput = {
  pageWidth: MONEY_SHEET.pageWidth,
  pageHeight: MONEY_SHEET.pageHeight,
  inset: MONEY_SHEET.inset,
  rowCount: MONEY_SHEET.rowCount,
  bandHeight: MONEY_SHEET.bandHeight,
  bandGap: MONEY_SHEET.bandGap,
  rowGap: MONEY_SHEET.rowGap,
  signSize: MONEY_SHEET.signSize,
  signGap: MONEY_SHEET.signGap,
  pilePadding: MONEY_SHEET.pilePadding,
};

const EPSILON = 1e-9;

// The fullest pile each level can hold, written by hand. On the hard level sums stay within 50 zł, so a pile of four
// 10 zł notes and six 1 zł coins (46 zł) is the tallest mix: two rows of notes and two rows of coins.
const WORST_PILES: Record<keyof typeof MAX_PIECES, number[]> = {
  latwy: [1, 1, 1, 1, 1],
  sredni: [1, 1, 1, 1, 1, 1, 1, 2],
  trudny: [10, 10, 10, 10, 1, 1, 1, 1, 1, 1],
};

void describe("pieceKind", () => {
  void test("1, 2 and 5 zł are coins, 10 and 20 zł are notes", () => {
    assert.deepEqual([1, 2, 5, 10, 20].map(pieceKind), ["coin", "coin", "coin", "note", "note"]);
  });
});

void describe("layoutPile", () => {
  void test("an empty pile has no height", () => {
    assert.deepEqual(layoutPile([], 75), { pieces: [], height: 0 });
  });

  void test("coins are the same size whatever their value, notes too", () => {
    const pile = layoutPile([5, 1, 2, 20, 10], 75);
    const coins = pile.pieces.filter((piece) => piece.kind === "coin");
    const notes = pile.pieces.filter((piece) => piece.kind === "note");

    assert.equal(coins.length, 3);
    assert.equal(notes.length, 2);
    assert.ok(coins.every((piece) => piece.width === 11 && piece.height === 11));
    assert.ok(notes.every((piece) => piece.width === 18 && piece.height === 10));
  });

  void test("notes come first, largest value first, then the coins", () => {
    const pile = layoutPile([1, 20, 5, 10], 75);

    assert.deepEqual(
      pile.pieces.map((piece) => piece.value),
      [20, 10, 5, 1],
    );
  });

  void test("a row of pieces is centered and its pieces do not overlap", () => {
    const pile = layoutPile([5, 5, 5], 75);
    const [first, second, third] = pile.pieces;
    const rowWidth = 3 * 11 + 2 * 1.5;

    assert.ok(Math.abs(first.x - (75 - rowWidth) / 2) < EPSILON);
    assert.ok(Math.abs(second.x - (first.x + 11 + 1.5)) < EPSILON);
    assert.ok(Math.abs(third.x + 11 - (75 + rowWidth) / 2) < EPSILON);
  });

  void test("pieces wrap into a second row when the first is full", () => {
    // 75 mm holds 6 coins of 11 mm with 1.5 mm gaps (6 × 11 + 5 × 1.5 = 73.5), so the seventh starts a new row.
    const pile = layoutPile([1, 1, 1, 1, 1, 1, 1], 75);
    const rows = new Set(pile.pieces.map((piece) => piece.y));

    assert.equal(rows.size, 2);
    assert.equal(pile.pieces[6].y, 11 + 1.5);
    assert.equal(pile.height, 11 + 1.5 + 11);
  });

  void test("throws when a note is wider than the pile", () => {
    assert.throws(() => layoutPile([10], 17));
  });
});

void describe("layoutMoneySheet", () => {
  void test("five rows start under the band and stay inside the 10 mm margin", () => {
    const sheet = layoutMoneySheet(INPUT);

    assert.equal(sheet.rows.length, 5);
    assert.equal(sheet.band.y, 10);
    assert.ok(sheet.rows[0].y >= 10 + 26 + 6 - EPSILON);
    for (const row of sheet.rows) {
      assert.ok(row.left.x >= 10 - EPSILON, `left ${row.left.x}`);
      assert.ok(row.right.x + row.right.width <= 200 + EPSILON, `right ${row.right.x + row.right.width}`);
      assert.ok(row.y + row.height <= 287 + EPSILON, `bottom ${row.y + row.height}`);
    }
    const last = sheet.rows[4];
    assert.ok(Math.abs(last.y + last.height - 287) < EPSILON);
  });

  void test("the sign square is centered between the piles and big enough to write in", () => {
    const sheet = layoutMoneySheet(INPUT);

    for (const row of sheet.rows) {
      assert.ok(row.sign.size >= 12);
      assert.ok(Math.abs(row.sign.x - row.left.x - row.left.width - 4) < EPSILON);
      assert.ok(Math.abs(row.right.x - row.sign.x - row.sign.size - 4) < EPSILON);
      assert.ok(Math.abs(row.sign.x + row.sign.size / 2 - 105) < EPSILON);
      assert.ok(Math.abs(row.sign.y + row.sign.size / 2 - (row.y + row.height / 2)) < EPSILON);
    }
  });

  void test("rows do not overlap", () => {
    const sheet = layoutMoneySheet(INPUT);

    for (let index = 1; index < sheet.rows.length; index += 1) {
      const gap = sheet.rows[index].y - (sheet.rows[index - 1].y + sheet.rows[index - 1].height);
      assert.ok(gap >= 5 - EPSILON, `row ${index}`);
    }
  });

  void test("throws when the rows cannot fit", () => {
    assert.throws(() => layoutMoneySheet({ ...INPUT, rowCount: 40 }));
  });
});

void describe("the fullest pile of every level", () => {
  const area = layoutMoneySheet(INPUT).rows[0].left;

  for (const [level, values] of Object.entries(WORST_PILES)) {
    void test(`${level}: ${values.length} pieces fit the pile area`, () => {
      assert.equal(values.length, MAX_PIECES[level as keyof typeof MAX_PIECES]);
      const pile = layoutPile(values, area.innerWidth);

      assert.ok(pile.height <= area.innerHeight, `${pile.height} > ${area.innerHeight}`);
      for (const piece of pile.pieces) {
        assert.ok(piece.x >= -EPSILON && piece.x + piece.width <= area.innerWidth + EPSILON);
      }
    });
  }

  void test("ten mixed coins also fit", () => {
    const pile = layoutPile([5, 5, 5, 2, 2, 2, 1, 1, 1, 1], area.innerWidth);

    assert.ok(pile.height <= area.innerHeight);
  });
});
