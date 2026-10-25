import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { layoutDictationSheet, type DictationSheetInput, type DictationSheetLayout } from "./layout.ts";
import { DICTATION_LEVEL_LAT6 } from "./levels.ts";
import { DICTATION_ARROWS, DICTATION_MAX_COMMANDS, DICTATION_SHEET, formatDictationCommand } from "./sheet.ts";

const { pageWidth, pageHeight, inset, commandsPerRow } = DICTATION_SHEET;
const LEVEL = DICTATION_LEVEL_LAT6;
const BOX_WIDTH = (pageWidth - inset * 2) / commandsPerRow;

const INPUT: DictationSheetInput = {
  pageWidth,
  pageHeight,
  inset,
  columns: LEVEL.columns,
  rows: LEVEL.rows,
  cellSize: LEVEL.cellSize,
  commandCount: DICTATION_MAX_COMMANDS,
  commandsPerRow,
  commandRowHeight: DICTATION_SHEET.commandRowHeight,
  instructionSize: DICTATION_SHEET.instructionSize,
  instructionGap: DICTATION_SHEET.instructionGap,
  listGap: DICTATION_SHEET.listGap,
};

void describe("layoutDictationSheet", () => {
  void test("the 6 lat grid is 154 by 187 on a 210 by 297 page", () => {
    const sheet = layoutDictationSheet(INPUT);

    assert.deepEqual(sheet.page, { width: pageWidth, height: pageHeight });
    assert.equal(sheet.grid.width, 154);
    assert.equal(sheet.grid.height, 187);
  });

  void test("the grid and the instruction are centered across the page", () => {
    const sheet = layoutDictationSheet(INPUT);

    assert.equal(sheet.grid.x, 28);
    assert.equal(pageWidth - (sheet.grid.x + sheet.grid.width), 28);
    assert.equal(sheet.instruction.x, 105);
  });

  void test("the largest sheet stays inside the 10 mm margin", () => {
    assertInsideMargin(layoutDictationSheet(INPUT));
  });

  void test("the block is centered down the page", () => {
    const sheet = layoutDictationSheet(INPUT);
    const above = sheet.instruction.y - DICTATION_SHEET.instructionSize / 2 - inset;
    const below = pageHeight - inset - (sheet.grid.y + sheet.grid.height);

    assert.ok(Math.abs(above - below) <= 1e-9, `${above} vs ${below}`);
  });

  void test("command boxes are in reading order without overlap", () => {
    const sheet = layoutDictationSheet(INPUT);

    assert.equal(sheet.commands.length, DICTATION_MAX_COMMANDS);
    sheet.commands.forEach((box, index) => {
      assert.ok(Math.abs(box.x - (inset + (index % commandsPerRow) * BOX_WIDTH)) <= 1e-9);
      assert.equal(box.y, sheet.commands[0].y + Math.floor(index / commandsPerRow) * DICTATION_SHEET.commandRowHeight);
      if (index === 0) return;
      const previous = sheet.commands[index - 1];
      const sameRow = box.y === previous.y;
      assert.ok(sameRow ? box.x >= previous.x + previous.width - 1e-9 : box.y >= previous.y + previous.height);
    });
  });

  void test("a final partial row is left-aligned", () => {
    const sheet = layoutDictationSheet({ ...INPUT, commandCount: 14 });

    assert.equal(sheet.commands.length, 14);
    assert.equal(sheet.commands[11].x, inset);
    assert.ok(Math.abs(sheet.commands[13].x - (inset + 2 * BOX_WIDTH)) <= 1e-9);
    assertInsideMargin(sheet);
  });

  void test("the command rows sit between the instruction and the grid", () => {
    const sheet = layoutDictationSheet(INPUT);
    const last = sheet.commands[sheet.commands.length - 1];

    assert.ok(sheet.instruction.y + DICTATION_SHEET.instructionSize / 2 <= sheet.commands[0].y);
    assert.ok(last.y + last.height <= sheet.grid.y);
  });

  void test("too many commands throws", () => {
    assert.throws(() => layoutDictationSheet({ ...INPUT, commandCount: DICTATION_MAX_COMMANDS + 1 }));
  });

  void test("a grid too wide for the margin throws", () => {
    assert.throws(() => layoutDictationSheet({ ...INPUT, columns: 18 }));
  });

  void test("DICTATION_MAX_COMMANDS is whole rows and the true maximum for 6 lat", () => {
    assert.equal(DICTATION_MAX_COMMANDS % commandsPerRow, 0);
    assert.doesNotThrow(() => layoutDictationSheet(INPUT));
    assert.throws(() => layoutDictationSheet({ ...INPUT, commandCount: DICTATION_MAX_COMMANDS + commandsPerRow }));
  });
});

void describe("formatDictationCommand", () => {
  void test("writes the length and the arrow", () => {
    assert.equal(formatDictationCommand({ direction: "right", length: 3 }), "3 →");
    assert.equal(formatDictationCommand({ direction: "left", length: 1 }), "1 ←");
    assert.equal(formatDictationCommand({ direction: "up", length: 2 }), "2 ↑");
    assert.equal(formatDictationCommand({ direction: "down", length: 4 }), "4 ↓");
    assert.equal(Object.keys(DICTATION_ARROWS).length, 4);
  });
});

function assertInsideMargin(sheet: DictationSheetLayout): void {
  const maxX = pageWidth - inset;
  const maxY = pageHeight - inset;

  assert.ok(sheet.instruction.y - DICTATION_SHEET.instructionSize / 2 >= inset - 1e-9);
  for (const box of sheet.commands) {
    assert.ok(box.x >= inset - 1e-9 && box.x + box.width <= maxX + 1e-9);
    assert.ok(box.y >= inset && box.y + box.height <= maxY);
  }
  assert.ok(sheet.grid.x >= inset && sheet.grid.x + sheet.grid.width <= maxX);
  assert.ok(sheet.grid.y >= inset && sheet.grid.y + sheet.grid.height <= maxY + 1e-9);
}
