import {
  BORDER_HOURS,
  clockLevelById,
  clockModeById,
  freshMinutesNeeded,
  PARTS_OF_DAY,
  type ClockLevelId,
  type ClockModeId,
  type PartOfDay,
} from "./levels.ts";

/** A time on a dial: `h` 1-12 without "24 h", 0-23 with it; `m` 0-59. */
export interface ClockTime {
  h: number;
  m: number;
}

export interface ClockCard {
  level: ClockLevelId;
  mode: ClockModeId;
  h24: boolean;
  /** The time of every dial, in the order the dials stand on the sheet. */
  times: readonly ClockTime[];
  /**
   * Połącz: `order[i]` is the index of the time shown by the i-th digital clock on the right; no clock stands level with
   * its own dial. In the other modes the identity (the digital clock or the boxes stand under their own dial).
   */
  order: readonly number[];
}

/** The settings a card was made for: the content part of `ClockSettings`. */
export interface ClockCardTarget {
  level: ClockLevelId;
  mode: ClockModeId;
  h24: boolean;
}

export type ClockProblem =
  | "settings-mismatch"
  | "wrong-dial-count"
  | "minute-not-in-level"
  | "too-few-fresh-minutes"
  | "repeated-time"
  | "hour-out-of-range"
  | "border-hour"
  | "order-not-permutation"
  | "digital-beside-own-dial";

/** The time in digits, minutes always two: "7:30", "19:05", never "07:30". */
export function formatClockTime(time: ClockTime): string {
  return `${time.h}:${String(time.m).padStart(2, "0")}`;
}

/** The part of the day of an hour 0-23; "w nocy" runs past midnight. */
export function partOfDay(hour: number): PartOfDay {
  for (const part of PARTS_OF_DAY) {
    const inside =
      part.first <= part.last ? hour >= part.first && hour <= part.last : hour >= part.first || hour <= part.last;
    if (inside) return part.name;
  }
  throw new Error(`No part of the day for hour ${hour}`);
}

/** The hour hand in degrees clockwise from 12: 30 per hour and 0.5 per minute, as on a real clock (7:30 is 225). */
export function hourAngle(time: ClockTime): number {
  return 30 * (time.h % 12) + 0.5 * time.m;
}

/** The minute hand in degrees clockwise from 12: 6 per minute. */
export function minuteAngle(time: ClockTime): number {
  return 6 * time.m;
}

/** What makes two times the same on one card: without "24 h" 7:30 and 19:30 look the same on the dial. */
export function clockTimeKey(time: ClockTime, h24: boolean): string {
  return `${h24 ? time.h : time.h % 12}:${time.m}`;
}

/**
 * The key of a card: settings, the times in their order and the order of the digital clocks. The generator and the engine
 * use this one function, so "the same card again" means the same on both sides.
 */
export function clockKey(card: ClockCard): string {
  return `${card.level}|${card.mode}|${card.h24 ? "24" : "12"}|${card.times.map(formatClockTime).join(",")}|${card.order.join(",")}`;
}

function isPermutation(order: readonly number[], length: number): boolean {
  if (order.length !== length) return false;
  const seen = new Set(order);
  return seen.size === length && order.every((index) => Number.isInteger(index) && index >= 0 && index < length);
}

/**
 * The rules for a card made for `target`. An empty list means the card may be shown: the card is of the target's level,
 * mode and "24 h"; as many dials as the mode has; every minute of the level and, from level 2, at least half the dials
 * on a fresh minute; no time twice; hours 1-12 without "24 h" and 0-23 with it, but never a border hour or 0:xx with
 * it; `order` a permutation, the identity outside Połącz and with no digital clock level with its own dial in Połącz.
 */
export function clockProblems(card: ClockCard, target: ClockCardTarget): readonly ClockProblem[] {
  const problems = new Set<ClockProblem>();
  if (card.level !== target.level || card.mode !== target.mode || card.h24 !== target.h24) {
    problems.add("settings-mismatch");
  }
  const level = clockLevelById(target.level);
  const mode = clockModeById(target.mode);
  const { times, order } = card;
  if (times.length !== mode.dials) problems.add("wrong-dial-count");
  if (times.some((time) => !level.minutes.includes(time.m))) problems.add("minute-not-in-level");
  const fresh = times.filter((time) => level.freshMinutes.includes(time.m)).length;
  if (fresh < freshMinutesNeeded(level, mode.dials)) problems.add("too-few-fresh-minutes");
  const keys = new Set(times.map((time) => clockTimeKey(time, target.h24)));
  if (keys.size !== times.length) problems.add("repeated-time");
  const [lowest, highest] = target.h24 ? [0, 23] : [1, 12];
  if (times.some((time) => !Number.isInteger(time.h) || time.h < lowest || time.h > highest)) {
    problems.add("hour-out-of-range");
  }
  if (target.h24 && times.some((time) => time.h === 0 || BORDER_HOURS.includes(time.h))) problems.add("border-hour");
  // Outside Połącz the order is the identity too: another order would give one card two keys.
  const identity = order.every((index, i) => index === i);
  if (!isPermutation(order, times.length) || (target.mode !== "polacz" && !identity)) {
    problems.add("order-not-permutation");
  }
  if (target.mode === "polacz" && order.some((index, i) => index === i)) problems.add("digital-beside-own-dial");
  return [...problems];
}
