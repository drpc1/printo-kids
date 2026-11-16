import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { estimatedTextWidth, instructionBoxHeight } from "../sheet/speech.ts";
import { hourAngle, minuteAngle, partOfDay, type ClockCard } from "./card.ts";
import { generateClockCard } from "./generate.ts";
import { drawDial, layoutClockSheet, polar, type ClockRect } from "./layout.ts";
import { CLOCK_LEVELS, CLOCK_MODES, clockModeById, type ClockModeId } from "./levels.ts";
import { CLOCK_SHEET } from "./sheet.ts";

const EPSILON = 1e-6;
const SHEET = CLOCK_SHEET;
const WITH_CHARACTER = instructionBoxHeight(true, SHEET.plainInstructionSize);
const WITHOUT_CHARACTER = instructionBoxHeight(false, SHEET.plainInstructionSize);

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cardFor(levelIndex: number, mode: ClockModeId, h24: boolean, seed = 3): ClockCard {
  const card = generateClockCard(mulberry32(seed), null, CLOCK_LEVELS[levelIndex], clockModeById(mode), h24);
  assert.ok(card);
  return card;
}

interface Extent {
  what: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const rectExtent = (what: string, rect: ClockRect, stroke: number): Extent => ({
  what,
  x0: rect.x - stroke / 2,
  y0: rect.y - stroke / 2,
  x1: rect.x + rect.width + stroke / 2,
  y1: rect.y + rect.height + stroke / 2,
});

const overlap = (a: Extent, b: Extent): boolean => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

void describe("layoutClockSheet", () => {
  void test("the instruction box is 26 mm with a character and 7 mm without", () => {
    assert.equal(WITH_CHARACTER, 26);
    assert.equal(WITHOUT_CHARACTER, 7);
  });

  for (const mode of CLOCK_MODES) {
    for (const h24 of [false, true]) {
      for (const [name, boxHeight] of [
        ["with a character", WITH_CHARACTER],
        ["without a character", WITHOUT_CHARACTER],
      ] as const) {
        void test(`${mode.id}${h24 ? " 24 h" : ""} ${name}: inside the 10 mm margin, under the instruction, nothing overlaps`, () => {
          const areaTop = SHEET.inset + boxHeight + SHEET.bandGap;
          let radius: number | null = null;
          for (const [levelIndex, level] of CLOCK_LEVELS.entries()) {
            const card = cardFor(levelIndex, mode.id, h24);
            const sheet = layoutClockSheet(card, boxHeight);
            // Minute ticks do not change the size: every level gets the same dial.
            radius ??= sheet.radius;
            assert.equal(sheet.radius, radius, level.id);
            assert.equal(sheet.dials.length, mode.dials);
            const extents: Extent[] = [];
            for (const dial of sheet.dials) {
              const reach = sheet.radius + SHEET.rimStroke / 2;
              const extent = {
                what: "dial",
                x0: dial.cx - reach,
                y0: dial.cy - reach,
                x1: dial.cx + reach,
                y1: dial.cy + reach,
              };
              extents.push(extent);
              assert.equal(dial.partOfDay !== null, h24);
              if (dial.partOfDay) {
                assert.equal(dial.partOfDay.text, partOfDay(card.times[dial.time].h));
                const width = estimatedTextWidth(dial.partOfDay.text, SHEET.partOfDaySize);
                const size = SHEET.partOfDaySize;
                extents.push({
                  what: "part of the day",
                  x0: dial.partOfDay.x - width / 2,
                  y0: dial.partOfDay.y - size * 0.4,
                  x1: dial.partOfDay.x + width / 2,
                  y1: dial.partOfDay.y + size * 0.4,
                });
                assert.ok(
                  dial.partOfDay.y - size / 2 >= dial.cy + sheet.radius - EPSILON,
                  "the word stands under the dial",
                );
              }
              assert.equal(dial.answer !== null, mode.id === "odczytaj");
              assert.equal(dial.digital !== null, mode.id === "dorysuj");
              assert.equal(dial.dot !== null, mode.id === "polacz");
              if (dial.answer) {
                extents.push(rectExtent("hours", dial.answer.hours, SHEET.answerBox.stroke));
                extents.push(rectExtent("minutes", dial.answer.minutes, SHEET.answerBox.stroke));
                assert.equal(dial.answer.hours.width, 18);
                assert.equal(dial.answer.hours.height, 13);
                assert.ok(dial.answer.hours.y >= dial.cy + sheet.radius, "the boxes stand under the dial");
              }
              if (dial.digital) {
                extents.push(rectExtent("digital", dial.digital, SHEET.digital.stroke));
                assert.deepEqual([dial.digital.width, dial.digital.height], [42, 15]);
                assert.ok(dial.digital.y >= dial.cy + sheet.radius, "the digital clock stands under the dial");
              }
              if (dial.dot) {
                const r = SHEET.dotRadius;
                extents.push({
                  what: "dot",
                  x0: dial.dot.x - r,
                  y0: dial.dot.y - r,
                  x1: dial.dot.x + r,
                  y1: dial.dot.y + r,
                });
              }
            }
            assert.equal(sheet.digitals.length, mode.id === "polacz" ? mode.dials : 0);
            for (const [row, digital] of sheet.digitals.entries()) {
              assert.equal(digital.time, card.order[row]);
              extents.push(rectExtent("digital", digital.frame, SHEET.digital.stroke));
              const r = SHEET.dotRadius;
              extents.push({
                what: "dot",
                x0: digital.dot.x - r,
                y0: digital.dot.y - r,
                x1: digital.dot.x + r,
                y1: digital.dot.y + r,
              });
              const leftDot = sheet.dials[row].dot;
              assert.ok(leftDot && digital.dot.x > leftDot.x + 60, "the dots stand far apart");
            }
            for (const extent of extents) {
              assert.ok(
                extent.x0 >= 10 - EPSILON && extent.x1 <= 200 + EPSILON,
                `${extent.what} x ${extent.x0}-${extent.x1}`,
              );
              assert.ok(
                extent.y0 >= areaTop - EPSILON && extent.y1 <= 287 + EPSILON,
                `${extent.what} y ${extent.y0}-${extent.y1}`,
              );
            }
            for (const [i, a] of extents.entries()) {
              for (const b of extents.slice(i + 1)) {
                assert.ok(!overlap(a, b), `${a.what} overlaps ${b.what}`);
              }
            }
          }
        });
      }
    }
  }

  void test("the dial is the largest that fits, never above the mockup's size", () => {
    const grid = layoutClockSheet(cardFor(0, "odczytaj", false), WITHOUT_CHARACTER);
    assert.equal(grid.radius * 2, SHEET.gridMaxDial);
    const match = layoutClockSheet(cardFor(0, "polacz", false), WITHOUT_CHARACTER);
    assert.equal(match.radius * 2, SHEET.matchMaxDial);
    // With the character the grid cell decides: the mockup's dials of about 62, 60, 54 and 52 mm.
    const diameter = (mode: ClockModeId, h24: boolean): number =>
      layoutClockSheet(cardFor(1, mode, h24), WITH_CHARACTER).radius * 2;
    assert.ok(Math.abs(diameter("odczytaj", false) - 61.67) < 0.01);
    assert.ok(Math.abs(diameter("dorysuj", false) - 59.67) < 0.01);
    assert.ok(Math.abs(diameter("odczytaj", true) - 53.67) < 0.01);
    assert.ok(Math.abs(diameter("dorysuj", true) - 51.67) < 0.01);
    assert.equal(diameter("polacz", false), 45);
    assert.equal(diameter("polacz", true), 38);
  });

  void test("the band starts at the margin with the height it was given, and the page is A4", () => {
    const sheet = layoutClockSheet(cardFor(1, "odczytaj", false), WITH_CHARACTER);
    assert.deepEqual(sheet.band, { y: 10, height: 26 });
    assert.deepEqual(sheet.page, { width: 210, height: 297 });
  });

  void test("throws when there is no room under the instruction", () => {
    const card = cardFor(1, "odczytaj", false);
    assert.throws(() => layoutClockSheet(card, 300), /No room/);
    assert.throws(() => layoutClockSheet(card, 260), /No room for a dial/);
  });
});

void describe("drawDial", () => {
  void test("12 numbers from 12 clockwise, hour ticks, and minute ticks only when asked", () => {
    const plain = drawDial(100, 100, 30, false, { h: 7, m: 30 });
    assert.deepEqual(
      plain.numbers.map((number) => number.text),
      ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    );
    assert.equal(plain.ticks.length, 12);
    assert.equal(drawDial(100, 100, 30, true, null).ticks.length, 60);
    const twelve = plain.numbers[0];
    assert.ok(Math.abs(twelve.x - 100) < EPSILON && Math.abs(twelve.y - (100 - 30 * SHEET.numberRadius)) < EPSILON);
    assert.ok(Math.abs(twelve.size - 30 * SHEET.numberSize) < EPSILON);
    assert.ok(Math.abs(twelve.halo - twelve.size * SHEET.numberHalo) < EPSILON);
  });

  void test("the hands point by the angles: long and thin minute, short and thick hour", () => {
    const time = { h: 7, m: 30 };
    const { hands } = drawDial(100, 100, 30, false, time);
    assert.ok(hands);
    const hourEnd = polar(100, 100, 30 * SHEET.hourHand, hourAngle(time));
    const minuteEnd = polar(100, 100, 30 * SHEET.minuteHand, minuteAngle(time));
    assert.ok(Math.abs(hands.hour.x2 - hourEnd.x) < EPSILON && Math.abs(hands.hour.y2 - hourEnd.y) < EPSILON);
    assert.ok(Math.abs(hands.minute.x2 - minuteEnd.x) < EPSILON && Math.abs(hands.minute.y2 - minuteEnd.y) < EPSILON);
    // 7:30: the minute hand straight down, the hour hand down and left, between 7 and 8.
    assert.ok(Math.abs(hands.minute.x2 - 100) < EPSILON && hands.minute.y2 > 100);
    assert.ok(hands.hour.x2 < 100 && hands.hour.y2 > 100);
    assert.ok(hands.hour.stroke > hands.minute.stroke);
    assert.equal(drawDial(100, 100, 30, false, null).hands, null);
  });
});
