import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { LEVELS, levelById, type Level } from "../maze/levels.ts";
import { layoutSheet, type SheetLayout } from "./layout.ts";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const COLUMNS = 13;
const ROWS = 16;
const ENTRANCE_COLUMN = 6;
const MARK_SIZE = 30;
const LABEL_HEIGHT = 7;
const CHARACTER_LEVELS = LEVELS.filter((level) => level.showCharacter);

void describe("layoutSheet", () => {
  void test("a 13 by 16 sheet is a 210 by 297 page with the maze inset 10", () => {
    const sheet = layoutFor(true);

    assert.equal(sheet.page.width, PAGE_WIDTH);
    assert.equal(sheet.page.height, PAGE_HEIGHT);
    assert.equal(sheet.maze.x, INSET);
    assert.equal(sheet.page.width - (sheet.maze.x + sheet.maze.width), INSET);
    assert.equal(sheet.maze.height, ROWS * (sheet.maze.width / COLUMNS));
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

  void test("cell width is 190 divided by columns on every level grid", () => {
    for (const level of LEVELS) {
      const sheet = layoutForLevel(level, level.showCharacter);

      assert.equal(sheet.maze.width / level.columns, (PAGE_WIDTH - INSET * 2) / level.columns);
    }
  });

  void test("a character mark stays centered unless that would start left of the maze", () => {
    for (const level of LEVELS) {
      if (!level.showCharacter) {
        continue;
      }

      const sheet = layoutForLevel(level, true);
      const mark = sheet.mark;
      const center = columnCenter(sheet, level.columns, level.entrance.col);

      assert.ok(mark, level.id);
      assert.equal(sheet.start, null);
      assert.equal(mark.width, MARK_SIZE);
      assert.equal(mark.height, MARK_SIZE);
      if (center - MARK_SIZE / 2 >= sheet.maze.x) {
        assert.equal(mark.x + mark.width / 2, center, level.id);
      } else {
        assert.equal(mark.x, sheet.maze.x, level.id);
      }
      assert.ok(mark.y >= 0, level.id);
    }
  });

  void test("nastolatek pins a selected character to the maze left edge", () => {
    const level = levelById("nastolatek");
    const sheet = layoutForLevel(level, true);
    const mark = sheet.mark;
    const bandBelowMeta = PAGE_HEIGHT - (sheet.meta.y + LABEL_HEIGHT / 2);

    assert.equal(level.showCharacter, true);
    assert.ok(mark);
    assert.equal(sheet.start, null);
    assert.equal(mark.width, MARK_SIZE);
    assert.equal(mark.height, MARK_SIZE);
    assert.equal(mark.x, sheet.maze.x);
    assert.equal(mark.y + mark.height, sheet.maze.y);
    assert.equal(sheet.meta.text, "Meta");
    assert.equal(sheet.meta.x, columnCenter(sheet, level.columns, 26));
    assert.ok(Math.abs(mark.y - bandBelowMeta) <= 0.01, `${mark.y} vs ${bandBelowMeta}`);
  });

  void test("nastolatek without a character shows Start on column 0 at the same height", () => {
    const level = levelById("nastolatek");
    const withMark = layoutForLevel(level, true);
    const sheet = layoutForLevel(level, false);
    const start = sheet.start;

    assert.equal(sheet.mark, null);
    assert.ok(start);
    assert.equal(start.text, "Start");
    assert.equal(start.x, columnCenter(sheet, level.columns, 0));
    assert.equal(sheet.meta.text, "Meta");
    assert.equal(sheet.meta.x, columnCenter(sheet, level.columns, 26));
    assert.equal(sheet.maze.y, withMark.maze.y);
    assert.equal(sheet.meta.y, withMark.meta.y);
  });

  void test("on a character level the white band above the mark equals the band below Meta", () => {
    assert.ok(CHARACTER_LEVELS.length > 0);

    for (const level of CHARACTER_LEVELS) {
      const sheet = layoutForLevel(level, true);
      const mark = sheet.mark;

      assert.ok(mark, level.id);
      const bandBelowMeta = PAGE_HEIGHT - (sheet.meta.y + LABEL_HEIGHT / 2);
      assert.ok(Math.abs(mark.y - bandBelowMeta) <= 0.01, `${level.id}: ${mark.y} vs ${bandBelowMeta}`);
    }
  });

  void test("on a character level the block shift does not depend on a picked character", () => {
    for (const level of CHARACTER_LEVELS) {
      const withMark = layoutForLevel(level, true);
      const withStart = layoutForLevel(level, false);
      const centered = layoutForLevel(level, false, false);
      const shift = withStart.maze.y - centered.maze.y;
      const centeredStart = centered.start;
      const start = withStart.start;

      assert.ok(shift > 0, level.id);
      assert.equal(withMark.maze.y, withStart.maze.y, level.id);
      assert.equal(withMark.meta.y, withStart.meta.y, level.id);
      assert.ok(start, level.id);
      assert.ok(centeredStart, level.id);
      assert.equal(start.text, "Start");
      assert.ok(Math.abs(start.y - (centeredStart.y + shift)) <= 1e-9, level.id);
      assert.ok(Math.abs(withStart.meta.y - (centered.meta.y + shift)) <= 1e-9, level.id);
      assert.equal(withStart.maze.x, centered.maze.x, level.id);
      assert.equal(start.x, centeredStart.x, level.id);
      assert.equal(withStart.meta.x, centered.meta.x, level.id);
    }
  });

  void test("on a character level the shifted block stays inside the page margins", () => {
    for (const level of CHARACTER_LEVELS) {
      for (const characterSelected of [true, false]) {
        const sheet = layoutForLevel(level, characterSelected);

        assert.ok(sheet.maze.y >= INSET, level.id);
        assert.ok(PAGE_HEIGHT - wallsBottom(sheet) >= INSET, level.id);
        assert.ok(PAGE_HEIGHT - sheet.meta.y >= INSET, level.id);
        assert.ok(sheet.meta.y > wallsBottom(sheet), level.id);
        if (characterSelected) {
          assert.ok(sheet.mark, level.id);
          assert.ok(sheet.mark.y >= 0, level.id);
          assertNear(sheet.mark.y + sheet.mark.height, sheet.maze.y, level.id);
        }
      }
    }
  });

  void test("younger levels keep Meta on the shared entrance and exit column", () => {
    for (const level of LEVELS) {
      if (level.id === "nastolatek") {
        continue;
      }

      const sheet = layoutForLevel(level, level.showCharacter);

      assert.equal(level.exit.col, level.entrance.col);
      assert.equal(sheet.meta.x, columnCenter(sheet, level.columns, level.exit.col));
    }
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
    exitColumn: ENTRANCE_COLUMN,
    markSize: MARK_SIZE,
    characterSelected,
    levelShowsCharacter: true,
    labelHeight: LABEL_HEIGHT,
  });
}

function entranceCenter(sheet: SheetLayout): number {
  const cellSize = sheet.maze.width / COLUMNS;
  return sheet.maze.x + (ENTRANCE_COLUMN + 0.5) * cellSize;
}

function layoutForLevel(
  level: Level,
  characterSelected: boolean,
  levelShowsCharacter: boolean = level.showCharacter,
): SheetLayout {
  return layoutSheet({
    pageWidth: PAGE_WIDTH,
    pageHeight: PAGE_HEIGHT,
    inset: INSET,
    columns: level.columns,
    rows: level.rows,
    entranceColumn: level.entrance.col,
    exitColumn: level.exit.col,
    markSize: MARK_SIZE,
    characterSelected,
    levelShowsCharacter,
    labelHeight: LABEL_HEIGHT,
  });
}

function wallsBottom(sheet: SheetLayout): number {
  return sheet.maze.y + sheet.maze.height;
}

function columnCenter(sheet: SheetLayout, columns: number, column: number): number {
  const cellSize = sheet.maze.width / columns;
  return sheet.maze.x + (column + 0.5) * cellSize;
}

function assertNear(actual: number | undefined, expected: number, message?: string): void {
  assert.ok(actual !== undefined && Math.abs(actual - expected) <= 1e-9, message ?? `${actual} vs ${expected}`);
}
