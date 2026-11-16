import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { clockKey, clockProblems, clockTimeKey } from "./card.ts";
import { generateClockCard, shuffled } from "./generate.ts";
import { BORDER_HOURS, CLOCK_LEVELS, CLOCK_MODES, freshMinutesNeeded } from "./levels.ts";

const SEEDS = 25;

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

void describe("shuffled", () => {
  void test("is a permutation, leaves the input alone and reaches every place", () => {
    const input = [1, 2, 3, 4, 5, 6];
    for (let seed = 0; seed < 30; seed += 1) {
      assert.deepEqual([...shuffled(input, mulberry32(seed))].sort(), input);
    }
    assert.deepEqual(input, [1, 2, 3, 4, 5, 6]);
    const counts = Array.from({ length: 4 }, () => new Array<number>(4).fill(0));
    const random = mulberry32(7);
    for (let n = 0; n < 4000; n += 1) {
      shuffled([0, 1, 2, 3], random).forEach((item, place) => (counts[item][place] += 1));
    }
    for (const row of counts) {
      for (const count of row) assert.ok(count > 800 && count < 1200, `count ${count}`);
    }
  });
});

void describe("generateClockCard", () => {
  for (const level of CLOCK_LEVELS) {
    for (const mode of CLOCK_MODES) {
      for (const h24 of [false, true]) {
        const name = `${level.id} ${mode.id}${h24 ? " 24 h" : ""}`;
        void test(`${name}: every card follows the rules`, () => {
          for (let seed = 1; seed <= SEEDS; seed += 1) {
            const card = generateClockCard(mulberry32(seed), null, level, mode, h24);
            assert.ok(card, `${name} seed ${seed}`);
            assert.deepEqual(clockProblems(card, { level: level.id, mode: mode.id, h24 }), []);
            assert.deepEqual([card.level, card.mode, card.h24], [level.id, mode.id, h24]);
            assert.equal(card.times.length, mode.dials);
            for (const time of card.times) {
              assert.ok(level.minutes.includes(time.m), `${time.h}:${time.m}`);
              if (h24) {
                assert.ok(time.h >= 1 && time.h <= 23, `${time.h}`);
                assert.ok(!BORDER_HOURS.includes(time.h), `border ${time.h}`);
              } else {
                assert.ok(time.h >= 1 && time.h <= 12, `${time.h}`);
              }
            }
            const fresh = card.times.filter((time) => level.freshMinutes.includes(time.m)).length;
            assert.ok(fresh >= freshMinutesNeeded(level, mode.dials), `fresh ${fresh}`);
            if (level.id !== "poziom1") assert.ok(fresh >= Math.ceil(mode.dials / 2));
            // Without 24 h 7:30 and 19:30 count as one time; the hours are 1-12 anyway, so h % 12 is the dial.
            const onDial = new Set(card.times.map((time) => `${time.h % 12}:${time.m}`));
            const keys = new Set(card.times.map((time) => clockTimeKey(time, h24)));
            assert.equal(keys.size, mode.dials);
            if (!h24) assert.equal(onDial.size, mode.dials);
            assert.deepEqual(
              [...card.order].sort((a, b) => a - b),
              card.times.map((_, i) => i),
            );
            if (mode.id === "polacz") {
              assert.ok(
                card.order.every((index, row) => index !== row),
                "a digital clock level with its own dial",
              );
            } else {
              assert.deepEqual(
                card.order,
                card.times.map((_, i) => i),
              );
            }
          }
        });

        void test(`${name}: the next card has another key`, () => {
          const random = mulberry32(11);
          let previous: string | null = null;
          for (let n = 0; n < 10; n += 1) {
            const card = generateClockCard(random, previous, level, mode, h24);
            assert.ok(card);
            const key = clockKey(card);
            assert.notEqual(key, previous);
            previous = key;
          }
        });
      }
    }
  }

  void test("the fresh minutes do not always stand first", () => {
    const level = CLOCK_LEVELS[1];
    const places = new Set<number>();
    for (let seed = 1; seed <= 40; seed += 1) {
      const card = generateClockCard(mulberry32(seed), null, level, CLOCK_MODES[0], false);
      assert.ok(card);
      card.times.forEach((time, i) => {
        if (time.m === 30) places.add(i);
      });
    }
    assert.deepEqual(
      [...places].sort((a, b) => a - b),
      [0, 1, 2, 3, 4, 5],
    );
  });

  void test("a card that cannot be made comes back null instead of looping", () => {
    assert.equal(
      generateClockCard(() => 0.5, null, CLOCK_LEVELS[0], CLOCK_MODES[0], false),
      null,
    );
  });
});
