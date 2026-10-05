import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { layoutSheet, type SheetLayout } from "./layout.ts";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const COLUMNS = 13;
const ROWS = 16;
const ENTRANCE_COLUMN = 6;
const MARK_SIZE = 30;

void describe("layoutSheet", () => {
  void test("a 13 by 16 sheet is a 210 by 297 page with the maze inset 10", () => {
    const sheet = layoutFor(true);

    assert.equal(sheet.page.width, PAGE_WIDTH);
    assert.equal(sheet.page.height, PAGE_HEIGHT);
    assert.equal(sheet.maze.x, INSET);
    assert.equal(sheet.page.width - (sheet.maze.x + sheet.maze.width), INSET);
    assert.ok(sheet.maze.y >= INSET);
    assert.ok(sheet.page.height - (sheet.maze.y + sheet.maze.height) >= INSET);
  });

  void test("Meta is on the entrance column in the band below the grid", () => {
    const sheet = layoutFor(true);
    const gridBottom = sheet.maze.y + sheet.maze.height;

    assert.equal(sheet.meta.text, "Meta");
    assert.equal(sheet.meta.x, entranceCenter(sheet));
    assert.ok(sheet.meta.y > gridBottom);
    assert.ok(sheet.meta.x >= INSET);
    assert.ok(sheet.page.width - sheet.meta.x >= INSET);
    assert.ok(sheet.meta.y >= INSET);
    assert.ok(sheet.page.height - sheet.meta.y >= INSET);
  });

  void test("a selected character is a 30 by 30 mark centered on the entrance", () => {
    const sheet = layoutFor(true);
    const mark = sheet.mark;

    assert.ok(mark);
    assert.equal(sheet.start, null);
    assert.equal(mark.width, MARK_SIZE);
    assert.equal(mark.height, MARK_SIZE);
    assert.equal(mark.x + mark.width / 2, entranceCenter(sheet));
    assert.equal(mark.y + mark.height, sheet.maze.y);
    assert.ok(mark.y >= 0);
  });

  void test("without a character, Start is in the upper band and there is no mark", () => {
    const sheet = layoutFor(false);
    const start = sheet.start;

    assert.equal(sheet.mark, null);
    assert.ok(start);
    assert.equal(start.text, "Start");
    assert.equal(start.x, entranceCenter(sheet));
    assert.ok(start.y >= INSET);
    assert.ok(start.y < sheet.maze.y);
    assert.equal(sheet.meta.text, "Meta");
  });
});

function layoutFor(characterSelected: boolean): SheetLayout {
  return layoutSheet({
    pageWidth: PAGE_WIDTH,
    pageHeight: PAGE_HEIGHT,
    inset: INSET,
    columns: COLUMNS,
    rows: ROWS,
    entranceColumn: ENTRANCE_COLUMN,
    markSize: MARK_SIZE,
    characterSelected,
  });
}

function entranceCenter(sheet: SheetLayout): number {
  const cellSize = sheet.maze.width / COLUMNS;
  return sheet.maze.x + (ENTRANCE_COLUMN + 0.5) * cellSize;
}
