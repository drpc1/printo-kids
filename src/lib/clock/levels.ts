// Levels, modes and parts of the day of the "Zegar" card (S-41): one place shared by the generator, the sheet, the
// thumbnail and the tests. The tables follow the PRD (US-33, US-34, Business Logic "Karta „Zegar”").

export type ClockLevelId = "poziom1" | "poziom2" | "poziom3" | "poziom4" | "poziom5";

export interface ClockLevel {
  id: ClockLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes; it names no age. */
  description: string;
  /** The minutes a dial of this level may show. */
  minutes: readonly number[];
  /**
   * The minutes this level adds to the one before; from level 2 at least half the dials show one of them, so a card of a
   * higher level is not made of easier times only. Empty on level 1, where the rule does not apply.
   */
  freshMinutes: readonly number[];
  /** Whether the dial has a tick for every minute, not only for every hour. */
  minuteTicks: boolean;
}

export const DEFAULT_CLOCK_LEVEL_ID: ClockLevelId = "poziom1";

const EVERY_MINUTE: readonly number[] = Array.from({ length: 60 }, (_, minute) => minute);
const EVERY_FIVE: readonly number[] = EVERY_MINUTE.filter((minute) => minute % 5 === 0);

export const CLOCK_LEVELS: readonly ClockLevel[] = [
  {
    id: "poziom1",
    label: "Poziom 1",
    barLabel: "1",
    description: "pełne godziny",
    minutes: [0],
    freshMinutes: [],
    minuteTicks: false,
  },
  {
    id: "poziom2",
    label: "Poziom 2",
    barLabel: "2",
    description: "pełne godziny i wpół do",
    minutes: [0, 30],
    freshMinutes: [30],
    minuteTicks: false,
  },
  {
    id: "poziom3",
    label: "Poziom 3",
    barLabel: "3",
    description: "kwadranse",
    minutes: [0, 15, 30, 45],
    freshMinutes: [15, 45],
    minuteTicks: false,
  },
  {
    id: "poziom4",
    label: "Poziom 4",
    barLabel: "4",
    description: "co 5 minut",
    minutes: EVERY_FIVE,
    freshMinutes: EVERY_FIVE.filter((minute) => minute % 15 !== 0),
    minuteTicks: true,
  },
  {
    id: "poziom5",
    label: "Poziom 5",
    barLabel: "5",
    description: "co minutę",
    minutes: EVERY_MINUTE,
    freshMinutes: EVERY_MINUTE.filter((minute) => minute % 5 !== 0),
    minuteTicks: true,
  },
];

export function clockLevelById(id: ClockLevelId): ClockLevel {
  const level = CLOCK_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown clock level ${id}`);
  }
  return level;
}

/** How many dials of a card must show a fresh minute of the level: half of them, rounded up, from level 2. */
export function freshMinutesNeeded(level: ClockLevel, dials: number): number {
  return level.freshMinutes.length === 0 ? 0 : Math.ceil(dials / 2);
}

/** What the child does: read the time, draw the hands, or match a dial with a digital clock. */
export type ClockModeId = "odczytaj" | "dorysuj" | "polacz";

export interface ClockMode {
  id: ClockModeId;
  /** Name in the mode list and after "Tryb:" on the bar. */
  label: string;
  /** Half a sentence about what the child does. */
  description: string;
  /** How many dials the card has. */
  dials: number;
  /** The one instruction of the card in this mode. */
  instruction: string;
}

export const DEFAULT_CLOCK_MODE_ID: ClockModeId = "odczytaj";

export const CLOCK_MODES: readonly ClockMode[] = [
  {
    id: "odczytaj",
    label: "Odczytaj",
    description: "dziecko wpisuje godzinę",
    dials: 6,
    instruction: "Która godzina? Wpisz pod zegarem.",
  },
  {
    id: "dorysuj",
    label: "Dorysuj",
    description: "dziecko rysuje wskazówki",
    dials: 6,
    instruction: "Dorysuj wskazówki: krótką i długą.",
  },
  {
    id: "polacz",
    label: "Połącz",
    description: "dziecko łączy zegar z godziną",
    dials: 5,
    instruction: "Połącz zegar z tą samą godziną.",
  },
];

export const CLOCK_MODE_IDS: readonly ClockModeId[] = CLOCK_MODES.map((mode) => mode.id);

export function clockModeById(id: ClockModeId): ClockMode {
  const mode = CLOCK_MODES.find((candidate) => candidate.id === id);
  if (mode === undefined) {
    throw new Error(`Unknown clock mode ${id}`);
  }
  return mode;
}

/** The word under a dial when "24 h" is on. */
export type PartOfDay = "rano" | "po południu" | "wieczorem" | "w nocy";

/**
 * The parts of the day with their first and last hour (PRD Business Logic "Karta „Zegar”"): "rano" 5:00-11:59,
 * "po południu" 12:00-17:59, "wieczorem" 18:00-21:59, "w nocy" 22:00-4:59 (it runs past midnight).
 */
export const PARTS_OF_DAY: readonly { name: PartOfDay; first: number; last: number }[] = [
  { name: "rano", first: 5, last: 11 },
  { name: "po południu", first: 12, last: 17 },
  { name: "wieczorem", first: 18, last: 21 },
  { name: "w nocy", first: 22, last: 4 },
];

/**
 * The first and the last hour of every part of the day. With "24 h" the generator never draws them, so the border of a
 * part ("w południe" or "po południu"?) leaves no doubt (PRD Business Logic "Karta „Zegar”", decision 2026-11-15).
 */
export const BORDER_HOURS: readonly number[] = PARTS_OF_DAY.flatMap((part) => [part.first, part.last]);

/** The hours of a card without "24 h": 1:00-12:59, so 12:30 and never 0:30. */
export const CLOCK_HOURS_12: readonly number[] = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * The hours of a card with "24 h": the whole day but the border hours and 0:xx. Past midnight is left out (decision
 * 2026-11-16): at 0:30 a child easily writes 12:30 or 24:30.
 */
export const CLOCK_HOURS_24: readonly number[] = Array.from({ length: 24 }, (_, hour) => hour).filter(
  (hour) => hour !== 0 && !BORDER_HOURS.includes(hour),
);
