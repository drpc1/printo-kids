import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  BORDER_HOURS,
  CLOCK_HOURS_12,
  CLOCK_HOURS_24,
  CLOCK_LEVELS,
  CLOCK_MODE_IDS,
  CLOCK_MODES,
  clockLevelById,
  clockModeById,
  DEFAULT_CLOCK_LEVEL_ID,
  DEFAULT_CLOCK_MODE_ID,
  freshMinutesNeeded,
} from "./levels.ts";

void describe("CLOCK_LEVELS", () => {
  void test("five numbered levels in the order of the PRD table, default Poziom 1", () => {
    assert.deepEqual(
      CLOCK_LEVELS.map((level) => [level.id, level.label, level.barLabel]),
      [1, 2, 3, 4, 5].map((n) => [`poziom${n}`, `Poziom ${n}`, String(n)]),
    );
    assert.equal(DEFAULT_CLOCK_LEVEL_ID, "poziom1");
  });

  void test("descriptions from the PRD, with no age", () => {
    assert.deepEqual(
      CLOCK_LEVELS.map((level) => level.description),
      ["pełne godziny", "pełne godziny i wpół do", "kwadranse", "co 5 minut", "co minutę"],
    );
    for (const level of CLOCK_LEVELS) assert.ok(!/lat|rok/.test(level.description), level.description);
  });

  void test("minutes, fresh minutes and minute ticks of every level", () => {
    const [one, two, three, four, five] = CLOCK_LEVELS;
    assert.deepEqual([one.minutes, one.freshMinutes, one.minuteTicks], [[0], [], false]);
    assert.deepEqual([two.minutes, two.freshMinutes, two.minuteTicks], [[0, 30], [30], false]);
    assert.deepEqual([three.minutes, three.freshMinutes, three.minuteTicks], [[0, 15, 30, 45], [15, 45], false]);
    assert.deepEqual(four.minutes, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    assert.deepEqual(four.freshMinutes, [5, 10, 20, 25, 35, 40, 50, 55]);
    assert.equal(four.minuteTicks, true);
    assert.equal(five.minutes.length, 60);
    assert.equal(five.freshMinutes.length, 48);
    assert.ok(five.freshMinutes.every((minute) => minute % 5 !== 0));
    assert.equal(five.minuteTicks, true);
  });

  void test("every fresh minute is a minute of its level and new against the level before", () => {
    for (const [i, level] of CLOCK_LEVELS.entries()) {
      for (const minute of level.freshMinutes) {
        assert.ok(level.minutes.includes(minute), `${level.id} ${minute}`);
        if (i > 0) assert.ok(!CLOCK_LEVELS[i - 1].minutes.includes(minute), `${level.id} ${minute}`);
      }
    }
  });

  void test("half the dials, rounded up, need a fresh minute from level 2", () => {
    assert.equal(freshMinutesNeeded(clockLevelById("poziom1"), 6), 0);
    assert.equal(freshMinutesNeeded(clockLevelById("poziom2"), 6), 3);
    assert.equal(freshMinutesNeeded(clockLevelById("poziom5"), 5), 3);
  });

  void test("clockLevelById finds every level and throws for an unknown one", () => {
    for (const level of CLOCK_LEVELS) assert.equal(clockLevelById(level.id), level);
    assert.throws(() => clockLevelById("poziom9" as never), /Unknown clock level/);
  });
});

void describe("CLOCK_MODES", () => {
  void test("three modes, default Odczytaj, with the PRD's dials, instructions and descriptions", () => {
    assert.deepEqual(
      CLOCK_MODES.map((mode) => [mode.id, mode.label, mode.dials, mode.instruction, mode.description]),
      [
        ["odczytaj", "Odczytaj", 6, "Która godzina? Wpisz pod zegarem.", "dziecko wpisuje godzinę"],
        ["dorysuj", "Dorysuj", 6, "Dorysuj wskazówki: krótką i długą.", "dziecko rysuje wskazówki"],
        ["polacz", "Połącz", 5, "Połącz zegar z tą samą godziną.", "dziecko łączy zegar z godziną"],
      ],
    );
    assert.deepEqual(CLOCK_MODE_IDS, ["odczytaj", "dorysuj", "polacz"]);
    assert.equal(DEFAULT_CLOCK_MODE_ID, "odczytaj");
  });

  void test("clockModeById finds every mode and throws for an unknown one", () => {
    for (const mode of CLOCK_MODES) assert.equal(clockModeById(mode.id), mode);
    assert.throws(() => clockModeById("rysuj" as never), /Unknown clock mode/);
  });
});

void describe("hours", () => {
  void test("without 24 h 1-12; with it the day without border hours and 0:xx", () => {
    assert.deepEqual(CLOCK_HOURS_12, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    assert.deepEqual(
      [...BORDER_HOURS].sort((a, b) => a - b),
      [4, 5, 11, 12, 17, 18, 21, 22],
    );
    assert.deepEqual(CLOCK_HOURS_24, [1, 2, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 19, 20, 23]);
  });
});
