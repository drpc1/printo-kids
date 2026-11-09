import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { groupLayout, groupOffsets, iconSize, layoutOddOneOutSheet, type OddSheetInput } from "./layout.ts";
import { ODD_ONE_OUT_LEVELS, type OddOneOutLevel } from "./levels.ts";
import { ODD_ONE_OUT_SHEET } from "./sheet.ts";

const EPSILON = 1e-9;

function inputFor(level: OddOneOutLevel): OddSheetInput {
  return {
    pageWidth: ODD_ONE_OUT_SHEET.pageWidth,
    pageHeight: ODD_ONE_OUT_SHEET.pageHeight,
    inset: ODD_ONE_OUT_SHEET.inset,
    rowCount: level.rowCount,
    itemCount: level.itemCount,
    bandHeight: ODD_ONE_OUT_SHEET.bandHeight,
    bandGap: ODD_ONE_OUT_SHEET.bandGap,
    rowGap: ODD_ONE_OUT_SHEET.rowGap,
    slotPadding: ODD_ONE_OUT_SHEET.slotPadding,
  };
}

void describe("layoutOddOneOutSheet", () => {
  for (const level of ODD_ONE_OUT_LEVELS) {
    void describe(level.id, () => {
      const sheet = layoutOddOneOutSheet(inputFor(level));

      void test("the rows start under the band and stay inside the 10 mm margin", () => {
        assert.equal(sheet.rows.length, level.rowCount);
        assert.equal(sheet.band.y, 10);
        assert.ok(sheet.rows[0].y >= 10 + 26 + 6 - EPSILON);
        for (const row of sheet.rows) {
          assert.ok(row.x >= 10 - EPSILON, `left ${row.x}`);
          assert.ok(row.x + row.width <= 200 + EPSILON, `right ${row.x + row.width}`);
          assert.ok(row.y + row.height <= 287 + EPSILON, `bottom ${row.y + row.height}`);
        }
        const last = sheet.rows[level.rowCount - 1];
        assert.ok(Math.abs(last.y + last.height - 287) < EPSILON);
      });

      void test("rows do not touch and every slot sits inside its row", () => {
        for (let index = 1; index < sheet.rows.length; index += 1) {
          const gap = sheet.rows[index].y - (sheet.rows[index - 1].y + sheet.rows[index - 1].height);
          assert.ok(gap >= ODD_ONE_OUT_SHEET.rowGap - EPSILON, `row ${index}`);
        }
        for (const row of sheet.rows) {
          assert.equal(row.slots.length, level.itemCount);
          for (const slot of row.slots) {
            assert.ok(slot.cx - sheet.slot / 2 >= row.x - EPSILON);
            assert.ok(slot.cx + sheet.slot / 2 <= row.x + row.width + EPSILON);
            assert.ok(slot.cy - sheet.slot / 2 >= row.y - EPSILON);
            assert.ok(slot.cy + sheet.slot / 2 <= row.y + row.height + EPSILON);
          }
        }
      });

      void test("the slots of a row are evenly spread and do not overlap", () => {
        for (const row of sheet.rows) {
          for (let index = 1; index < row.slots.length; index += 1) {
            assert.ok(row.slots[index].cx - row.slots[index - 1].cx >= sheet.slot - EPSILON);
          }
        }
      });

      void test("a picture is big enough to see", () => {
        assert.ok(sheet.slot >= (level.id === "trudny" ? 25 : 30), `${sheet.slot} mm`);
      });
    });
  }

  void test("throws when the rows cannot fit", () => {
    assert.throws(() => layoutOddOneOutSheet({ ...inputFor(ODD_ONE_OUT_LEVELS[2]), rowCount: 80 }));
    assert.throws(() => layoutOddOneOutSheet({ ...inputFor(ODD_ONE_OUT_LEVELS[2]), itemCount: 80 }));
  });
});

void describe("groupOffsets", () => {
  void test("a group of 1 to 6 has that many places, and 0 or 7 have none", () => {
    assert.deepEqual(
      [1, 2, 3, 4, 5, 6].map((count) => groupOffsets(count).length),
      [1, 2, 3, 4, 5, 6],
    );
    assert.throws(() => groupOffsets(0));
    assert.throws(() => groupOffsets(7));
  });

  void test("a group of 6 is two columns of three", () => {
    const xs = [...new Set(groupOffsets(6).map(([dx]) => dx))].sort();
    const ys = [...new Set(groupOffsets(6).map(([, dy]) => dy))].sort();
    assert.deepEqual(xs, [-1, 1]);
    assert.equal(ys.length, 3);
  });
});

void describe("groupLayout", () => {
  for (const level of ODD_ONE_OUT_LEVELS) {
    const slot = layoutOddOneOutSheet(inputFor(level)).slot;
    for (const [name, scale] of [
      ["big", 1],
      ["small", level.smallRatio],
    ] as const) {
      void test(`${level.id}, ${name}: no two shapes of a group overlap and the group fits the slot`, () => {
        for (const count of [1, 2, 3, 4, 5, 6]) {
          const { unit, points } = groupLayout(count, slot, scale);
          assert.equal(points.length, count);
          // The box of a shape is a unit square around its center; two boxes must be apart on at least one axis.
          for (let first = 0; first < points.length; first += 1) {
            assert.ok(Math.abs(points[first].x) + unit / 2 <= slot / 2 + EPSILON, `${count} wide`);
            assert.ok(Math.abs(points[first].y) + unit / 2 <= slot / 2 + EPSILON, `${count} tall`);
            for (let second = first + 1; second < points.length; second += 1) {
              const apartX = Math.abs(points[first].x - points[second].x) > unit;
              const apartY = Math.abs(points[first].y - points[second].y) > unit;
              assert.ok(apartX || apartY, `${count}: shapes ${first} and ${second} overlap`);
            }
          }
        }
      });
    }
  }

  void test("a lone shape is larger than one of a group, and a small group is smaller than a big one", () => {
    assert.ok(groupLayout(1, 30, 1).unit > groupLayout(2, 30, 1).unit);
    assert.ok(groupLayout(4, 30, 0.72).unit < groupLayout(4, 30, 1).unit);
    assert.ok(Math.abs(groupLayout(1, 30, 1).unit - 30 * 0.78) < EPSILON);
  });
});

void describe("iconSize", () => {
  void test("an icon fits its slot, small or big", () => {
    for (const scale of [1, 0.72, 0.5]) {
      assert.ok(iconSize(30, scale) <= 30);
    }
    assert.ok(iconSize(30, 0.5) < iconSize(30, 1));
  });
});
