import { clockKey, clockProblems, clockTimeKey, type ClockCard, type ClockTime } from "./card.ts";
import { CLOCK_HOURS_12, CLOCK_HOURS_24, freshMinutesNeeded, type ClockLevel, type ClockMode } from "./levels.ts";

/** Draws again at most this many times before giving up, so a card that cannot be made cannot loop forever. */
export const MAX_ATTEMPTS = 20;

/** Draws of a time per dial in one attempt; past it (a draw that keeps repeating) the attempt is given up. */
const DRAWS_PER_DIAL = 40;
/** Shuffles tried for the order of the Połącz digital clocks before the attempt is given up. */
const ORDER_TRIES = 50;

/** A shuffled copy (Fisher-Yates); `random` is the only source of chance. */
export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

/**
 * The times of a card, or null when the draws keep repeating: first as many on a fresh minute as the half rule asks,
 * then any minute of the level, never a time twice (without "24 h" 7:30 and 19:30 count as one), shuffled so the fresh
 * ones do not always stand first.
 */
function drawTimes(level: ClockLevel, count: number, h24: boolean, random: () => number): ClockTime[] | null {
  const hours = h24 ? CLOCK_HOURS_24 : CLOCK_HOURS_12;
  const needed = freshMinutesNeeded(level, count);
  const times: ClockTime[] = [];
  const keys = new Set<string>();
  for (let draw = 0; draw < count * DRAWS_PER_DIAL && times.length < count; draw += 1) {
    const minutes = times.length < needed ? level.freshMinutes : level.minutes;
    const time: ClockTime = { h: pick(hours, random), m: pick(minutes, random) };
    const key = clockTimeKey(time, h24);
    if (keys.has(key)) continue;
    keys.add(key);
    times.push(time);
  }
  return times.length === count ? shuffled(times, random) : null;
}

/** An order of the Połącz digital clocks with no clock level with its own dial, or null when the shuffles run out. */
function derangement(count: number, random: () => number): number[] | null {
  const identity = Array.from({ length: count }, (_, i) => i);
  for (let tries = 0; tries < ORDER_TRIES; tries += 1) {
    const order = shuffled(identity, random);
    if (order.every((index, i) => index !== i)) return order;
  }
  return null;
}

/** A valid card of the level, mode and "24 h" whose key differs from `previousKey`, or null after MAX_ATTEMPTS draws. */
export function generateClockCard(
  random: () => number,
  previousKey: string | null,
  level: ClockLevel,
  mode: ClockMode,
  h24: boolean,
): ClockCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const times = drawTimes(level, mode.dials, h24, random);
    if (times === null) continue;
    const order = mode.id === "polacz" ? derangement(times.length, random) : times.map((_, i) => i);
    if (order === null) continue;
    const card: ClockCard = { level: level.id, mode: mode.id, h24, times, order };
    if (clockKey(card) !== previousKey && clockProblems(card, card).length === 0) {
      return card;
    }
  }
  return null;
}
