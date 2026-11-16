import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  clockKey,
  clockProblems,
  clockTimeKey,
  formatClockTime,
  hourAngle,
  minuteAngle,
  partOfDay,
  type ClockCard,
  type ClockCardTarget,
  type ClockTime,
} from "./card.ts";

const at = (h: number, m: number): ClockTime => ({ h, m });

const HALF_PAST: ClockCardTarget = { level: "poziom2", mode: "odczytaj", h24: false };
const DAY: ClockCardTarget = { level: "poziom2", mode: "dorysuj", h24: true };
const MATCH: ClockCardTarget = { level: "poziom3", mode: "polacz", h24: false };

function make(target: ClockCardTarget, times: ClockTime[], order: number[] = times.map((_, i) => i)): ClockCard {
  return { ...target, times, order };
}

// Sound cards: three of six on half past (level 2), the day without border hours, Połącz with a shifted order.
const halfPast = (): ClockCard => make(HALF_PAST, [at(1, 30), at(2, 30), at(3, 30), at(4, 0), at(5, 0), at(12, 0)]);
const day = (): ClockCard => make(DAY, [at(19, 30), at(7, 30), at(23, 30), at(1, 0), at(14, 0), at(9, 0)]);
const match = (): ClockCard => make(MATCH, [at(1, 15), at(2, 45), at(3, 15), at(4, 0), at(5, 30)], [1, 2, 3, 4, 0]);

void describe("formatClockTime", () => {
  void test("minutes always two digits, the hour without a leading zero", () => {
    assert.equal(formatClockTime(at(7, 30)), "7:30");
    assert.equal(formatClockTime(at(7, 5)), "7:05");
    assert.equal(formatClockTime(at(12, 0)), "12:00");
    assert.equal(formatClockTime(at(19, 0)), "19:00");
    assert.equal(formatClockTime(at(1, 59)), "1:59");
  });
});

void describe("partOfDay", () => {
  void test("rano 5-11, po południu 12-17, wieczorem 18-21, w nocy 22-4, on both sides of every border", () => {
    const expected: [number, string][] = [
      [4, "w nocy"],
      [5, "rano"],
      [11, "rano"],
      [12, "po południu"],
      [17, "po południu"],
      [18, "wieczorem"],
      [21, "wieczorem"],
      [22, "w nocy"],
      [23, "w nocy"],
      [0, "w nocy"],
      [1, "w nocy"],
    ];
    for (const [hour, part] of expected) assert.equal(partOfDay(hour), part, String(hour));
  });

  void test("every hour of the day has a part", () => {
    for (let hour = 0; hour < 24; hour += 1) assert.ok(partOfDay(hour).length > 0);
  });
});

void describe("hand angles", () => {
  void test("the hour hand moves with the minutes: 7:30 halfway between 7 and 8, 2:50 just before 3, 12:00 up", () => {
    assert.equal(hourAngle(at(7, 30)), 225);
    assert.equal(hourAngle(at(19, 30)), 225);
    assert.equal(hourAngle(at(2, 50)), 85);
    assert.equal(hourAngle(at(12, 0)), 0);
    assert.equal(hourAngle(at(3, 0)), 90);
  });

  void test("the minute hand turns 6 degrees a minute", () => {
    for (let minute = 0; minute < 60; minute += 1) assert.equal(minuteAngle(at(5, minute)), 6 * minute);
    assert.equal(minuteAngle(at(7, 30)), 180);
  });
});

void describe("clockTimeKey and clockKey", () => {
  void test("without 24 h 7:30 and 19:30 are one time; with it two", () => {
    assert.equal(clockTimeKey(at(7, 30), false), clockTimeKey(at(19, 30), false));
    assert.notEqual(clockTimeKey(at(7, 30), true), clockTimeKey(at(19, 30), true));
    assert.notEqual(clockTimeKey(at(7, 30), false), clockTimeKey(at(7, 0), false));
  });

  void test("the key changes with the settings, the times, their order and the digital clocks' order", () => {
    const base = match();
    const keys = [
      clockKey(base),
      clockKey({ ...base, level: "poziom4" }),
      clockKey({ ...base, mode: "odczytaj" }),
      clockKey({ ...base, h24: true }),
      clockKey({ ...base, times: [...base.times].reverse() }),
      clockKey({ ...base, times: [at(6, 15), ...base.times.slice(1)] }),
      clockKey({ ...base, order: [4, 0, 1, 2, 3] }),
    ];
    assert.equal(new Set(keys).size, keys.length);
    assert.equal(clockKey(match()), clockKey(base));
  });
});

void describe("clockProblems", () => {
  void test("sound cards have no problem", () => {
    assert.deepEqual(clockProblems(halfPast(), HALF_PAST), []);
    assert.deepEqual(clockProblems(day(), DAY), []);
    assert.deepEqual(clockProblems(match(), MATCH), []);
  });

  void test("settings-mismatch: a card of another level, mode or 24 h", () => {
    assert.ok(clockProblems(halfPast(), { ...HALF_PAST, level: "poziom3" }).includes("settings-mismatch"));
    assert.ok(clockProblems(halfPast(), { ...HALF_PAST, mode: "dorysuj" }).includes("settings-mismatch"));
    assert.ok(clockProblems(halfPast(), { ...HALF_PAST, h24: true }).includes("settings-mismatch"));
  });

  void test("wrong-dial-count: six dials in Odczytaj and Dorysuj, five in Połącz", () => {
    const card = halfPast();
    assert.deepEqual(clockProblems({ ...card, times: card.times.slice(0, 5), order: [0, 1, 2, 3, 4] }, HALF_PAST), [
      "wrong-dial-count",
    ]);
    const six = { ...match(), times: [...match().times, at(6, 15)], order: [1, 2, 3, 4, 5, 0] };
    assert.deepEqual(clockProblems(six, MATCH), ["wrong-dial-count"]);
  });

  void test("minute-not-in-level and too-few-fresh-minutes", () => {
    const quarter = make(HALF_PAST, [at(1, 15), at(2, 30), at(3, 30), at(4, 30), at(5, 0), at(6, 0)]);
    assert.deepEqual(clockProblems(quarter, HALF_PAST), ["minute-not-in-level"]);
    const twoFresh = make(HALF_PAST, [at(1, 30), at(2, 30), at(3, 0), at(4, 0), at(5, 0), at(6, 0)]);
    assert.deepEqual(clockProblems(twoFresh, HALF_PAST), ["too-few-fresh-minutes"]);
    const fullHours = make(
      { ...HALF_PAST, level: "poziom1" },
      twoFresh.times.map((time) => at(time.h, 0)),
    );
    assert.deepEqual(clockProblems(fullHours, { ...HALF_PAST, level: "poziom1" }), []);
  });

  void test("repeated-time: without 24 h 7:30 and 19:30 are the same, with it they are not", () => {
    const twice = make(HALF_PAST, [at(7, 30), at(2, 30), at(3, 30), at(4, 0), at(5, 0), at(7, 30)]);
    assert.deepEqual(clockProblems(twice, HALF_PAST), ["repeated-time"]);
    const dayTwice = make(DAY, [at(7, 30), at(19, 30), at(23, 30), at(1, 0), at(14, 0), at(9, 0)]);
    assert.deepEqual(clockProblems(dayTwice, DAY), []);
    const sameOnDial = make(HALF_PAST, [at(7, 30), at(2, 30), at(3, 30), at(4, 0), at(5, 0), at(19, 30)]);
    assert.ok(clockProblems(sameOnDial, HALF_PAST).includes("repeated-time"));
  });

  void test("hour-out-of-range: 1-12 without 24 h, 0-23 with it", () => {
    for (const hour of [0, 13, 19]) {
      const card = make(HALF_PAST, [at(hour, 0), ...halfPast().times.slice(1)]);
      assert.ok(clockProblems(card, HALF_PAST).includes("hour-out-of-range"), String(hour));
    }
    for (const hour of [24, -1, 7.5]) {
      const card = make(DAY, [at(hour, 0), ...day().times.slice(1)]);
      assert.ok(clockProblems(card, DAY).includes("hour-out-of-range"), String(hour));
    }
  });

  void test("border-hour: with 24 h every border hour and 0:xx; without 24 h noon is a plain hour", () => {
    for (const hour of [0, 4, 5, 11, 12, 17, 18, 21, 22]) {
      const card = make(DAY, [at(hour, 30), ...day().times.slice(1)]);
      assert.deepEqual(clockProblems(card, DAY), ["border-hour"], String(hour));
    }
    assert.deepEqual(clockProblems(halfPast(), HALF_PAST), []);
  });

  void test("order-not-permutation: a repeat, a missing clock, or another order outside Połącz", () => {
    assert.ok(clockProblems({ ...match(), order: [1, 2, 3, 4, 1] }, MATCH).includes("order-not-permutation"));
    assert.ok(clockProblems({ ...match(), order: [1, 2, 3, 0] }, MATCH).includes("order-not-permutation"));
    assert.ok(clockProblems({ ...match(), order: [1, 2, 3, 4, 5] }, MATCH).includes("order-not-permutation"));
    assert.deepEqual(clockProblems({ ...halfPast(), order: [1, 0, 2, 3, 4, 5] }, HALF_PAST), ["order-not-permutation"]);
  });

  void test("digital-beside-own-dial: in Połącz no digital clock stands level with its own dial", () => {
    assert.deepEqual(clockProblems({ ...match(), order: [0, 2, 3, 4, 1] }, MATCH), ["digital-beside-own-dial"]);
    assert.deepEqual(clockProblems({ ...match(), order: [4, 3, 1, 0, 2] }, MATCH), []);
  });
});
