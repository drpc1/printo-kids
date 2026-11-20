/** The levels of the "Labirynt liczbowy" card. Numbers, no age (decision 2026-11-20). */
export type NumberMazeLevelId = "poziom1" | "poziom2" | "poziom3" | "poziom4" | "poziom5" | "poziom6";

export interface NumberMazeLevel {
  id: NumberMazeLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes. */
  description: string;
  /** Grid size: columns across, rows down. */
  cols: number;
  rows: number;
  /** The number on the start; every next cell of the path adds `step`. */
  first: number;
  step: number;
  /** How many numbers the path has, start and goal included. */
  count: number;
  /** A trap stands at most this many steps from the numbers of the path cells next to it (tempting traps). */
  near: number;
  /** The instruction in the speech bubble. */
  instruction: string;
}

export const DEFAULT_NUMBER_MAZE_LEVEL_ID: NumberMazeLevelId = "poziom1";

const BY_ONE = "Idź po liczbach 1, 2, 3… od startu do mety.";

// Values from the accepted mockup (context/changes/number-maze-card/, PRD Business Logic); the trial print decides.
// Every path length keeps the parity of the shortest path to the goal, so the goal can be reached.
export const NUMBER_MAZE_LEVELS: readonly NumberMazeLevel[] = [
  {
    id: "poziom1",
    label: "Poziom 1",
    barLabel: "1",
    description: "liczby do 15, duża kratka",
    cols: 5,
    rows: 5,
    first: 1,
    step: 1,
    count: 15,
    near: 3,
    instruction: BY_ONE,
  },
  {
    id: "poziom2",
    label: "Poziom 2",
    barLabel: "2",
    description: "liczby do 20",
    cols: 5,
    rows: 6,
    first: 1,
    step: 1,
    count: 20,
    near: 3,
    instruction: BY_ONE,
  },
  {
    id: "poziom3",
    label: "Poziom 3",
    barLabel: "3",
    description: "liczby do 30",
    cols: 6,
    rows: 7,
    first: 1,
    step: 1,
    count: 30,
    near: 2,
    instruction: BY_ONE,
  },
  {
    id: "poziom4",
    label: "Poziom 4",
    barLabel: "4",
    description: "liczby do 50, mniejsza kratka",
    cols: 8,
    rows: 9,
    first: 1,
    step: 1,
    count: 50,
    near: 2,
    instruction: BY_ONE,
  },
  {
    id: "poziom5",
    label: "Poziom 5",
    barLabel: "5",
    description: "liczenie co 2 do 60",
    cols: 6,
    rows: 7,
    first: 2,
    step: 2,
    count: 30,
    near: 2,
    instruction: "Licz co 2: 2, 4, 6… od startu do mety.",
  },
  {
    id: "poziom6",
    label: "Poziom 6",
    barLabel: "6",
    description: "liczenie co 5 do 200",
    cols: 7,
    rows: 8,
    first: 5,
    step: 5,
    count: 40,
    near: 2,
    instruction: "Licz co 5: 5, 10, 15… od startu do mety.",
  },
];

export const NUMBER_MAZE_LEVEL_IDS: readonly NumberMazeLevelId[] = NUMBER_MAZE_LEVELS.map((level) => level.id);

export function numberMazeLevelById(id: NumberMazeLevelId): NumberMazeLevel {
  const level = NUMBER_MAZE_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown number-maze level ${id}`);
  }
  return level;
}

/** The number on the goal. */
export function lastNumber(level: NumberMazeLevel): number {
  return level.first + level.step * (level.count - 1);
}
