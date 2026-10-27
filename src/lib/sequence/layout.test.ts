import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { SPEECH_BAND } from "../sheet/speech.ts";
import { layoutSequenceSheet, type SequenceSheetInput } from "./layout.ts";
import { SEQUENCE_LEVEL_LAT5, SEQUENCE_LEVELS } from "./levels.ts";
import { SEQUENCE_SHEET } from "./sheet.ts";

const FIVE_YEARS: SequenceSheetInput = {
  pageWidth: SEQUENCE_SHEET.pageWidth,
  pageHeight: SEQUENCE_SHEET.pageHeight,
  inset: SEQUENCE_SHEET.inset,
  fieldsPerRow: SEQUENCE_LEVEL_LAT5.fieldsPerRow,
  rowCount: SEQUENCE_LEVEL_LAT5.rowCount,
  fieldGapRatio: SEQUENCE_SHEET.fieldGapRatio,
  instructionHeight: SEQUENCE_SHEET.instructionSize,
  instructionGap: SEQUENCE_SHEET.instructionGap,
};

const EPSILON = 1e-9;

void describe("layoutSequenceSheet", () => {
  void test("a 5 lat field is about 23.2 mm", () => {
    const sheet = layoutSequenceSheet(FIVE_YEARS);

    assert.ok(Math.abs(sheet.fieldSize - 23.2) < 0.05, String(sheet.fieldSize));
  });

  void test("every field and the instruction stay inside the 10 mm margin", () => {
    const sheet = layoutSequenceSheet(FIVE_YEARS);

    assert.ok(sheet.instruction.y - SEQUENCE_SHEET.instructionSize / 2 >= 10 - EPSILON);
    assert.equal(sheet.instruction.x, 105);
    assert.equal(sheet.rows.length, 6);
    for (const row of sheet.rows) {
      assert.equal(row.fields.length, 7);
      for (const field of row.fields) {
        assert.ok(field.x >= 10 - EPSILON && field.x + sheet.fieldSize <= 200 + EPSILON, `x ${field.x}`);
        assert.ok(field.y >= 10 - EPSILON && field.y + sheet.fieldSize <= 287 + EPSILON, `y ${field.y}`);
      }
    }
  });

  void test("the seven fields fill the width inside the margin", () => {
    const sheet = layoutSequenceSheet(FIVE_YEARS);
    const first = sheet.rows[0].fields[0];
    const last = sheet.rows[0].fields[6];

    assert.ok(Math.abs(first.x - 10) < EPSILON);
    assert.ok(Math.abs(last.x + sheet.fieldSize - 200) < EPSILON);
  });

  void test("rows sit below the instruction and do not overlap", () => {
    const sheet = layoutSequenceSheet(FIVE_YEARS);

    assert.ok(sheet.rows[0].y >= 10 + SEQUENCE_SHEET.instructionSize + SEQUENCE_SHEET.instructionGap - EPSILON);
    for (let index = 1; index < sheet.rows.length; index += 1) {
      assert.ok(sheet.rows[index].y >= sheet.rows[index - 1].y + sheet.fieldSize, `row ${index}`);
    }
  });

  void test("a setting that does not fit throws", () => {
    assert.throws(() => layoutSequenceSheet({ ...FIVE_YEARS, rowCount: 20 }), /do not fit/);
  });

  void test("every level fits the page inside the 10 mm margin, with room for a two-digit number in a field", () => {
    for (const level of SEQUENCE_LEVELS) {
      const sheet = layoutSequenceSheet({
        ...FIVE_YEARS,
        fieldsPerRow: level.fieldsPerRow,
        rowCount: level.rowCount,
      });

      assert.equal(sheet.rows.length, level.rowCount, level.id);
      for (const row of sheet.rows) {
        assert.equal(row.fields.length, level.fieldsPerRow, level.id);
        for (const field of row.fields) {
          assert.ok(field.x >= 10 - EPSILON && field.x + sheet.fieldSize <= 200 + EPSILON, `${level.id} x ${field.x}`);
          assert.ok(field.y >= 10 - EPSILON && field.y + sheet.fieldSize <= 287 + EPSILON, `${level.id} y ${field.y}`);
        }
      }
      // A digit of a bold sans-serif face is at most about 0.65 em wide; two of them stay inside the field.
      const twoDigits = 2 * 0.65 * SEQUENCE_SHEET.numberFontScale * sheet.fieldSize;
      assert.ok(twoDigits < sheet.fieldSize * 0.8, `${level.id} ${twoDigits}`);
    }
  });
});

void describe("layoutSequenceSheet with the speech band", () => {
  void test("every level fits inside the 10 mm margin with a 26 mm band instead of the 7 mm line", () => {
    for (const level of SEQUENCE_LEVELS) {
      const sheet = layoutSequenceSheet({
        pageWidth: SEQUENCE_SHEET.pageWidth,
        pageHeight: SEQUENCE_SHEET.pageHeight,
        inset: SEQUENCE_SHEET.inset,
        fieldsPerRow: level.fieldsPerRow,
        rowCount: level.rowCount,
        fieldGapRatio: SEQUENCE_SHEET.fieldGapRatio,
        instructionHeight: SPEECH_BAND.characterSize,
        instructionGap: SEQUENCE_SHEET.instructionGap,
      });

      assert.equal(sheet.instruction.y - SPEECH_BAND.characterSize / 2, SEQUENCE_SHEET.inset, `${level.id} band top`);
      assert.ok(sheet.rows[0].y >= SEQUENCE_SHEET.inset + SPEECH_BAND.characterSize, `${level.id} rows under band`);
      const last = sheet.rows[sheet.rows.length - 1];
      assert.ok(last.y + sheet.fieldSize <= 287 + EPSILON, `${level.id} last row inside the margin`);
    }
  });
});
