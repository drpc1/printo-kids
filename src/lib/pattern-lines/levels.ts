import type { PatternId } from "./patterns.ts";
import { PATTERN_LINES_SHEET } from "./sheet.ts";

export type PatternLinesLevelId = "poziom1" | "poziom2" | "poziom3" | "poziom4";

/** How a level draws its rows: dots all the way, dots for the first repeats then free, or a drawn line to continue. */
export type PatternLinesMode = "dots" | "dotsThenFree" | "line";

export interface PatternLinesLevel {
  id: PatternLinesLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes; it says the mode and names no age. */
  description: string;
  mode: PatternLinesMode;
  /** The patterns a row may draw. */
  pool: readonly PatternId[];
  rows: number;
  /** Step length in mm, before the pattern's own span. */
  period: readonly [number, number];
  /** Height / step: the lower, the gentler. Null on the ruled level, where the ruling gives the height. */
  ratio: readonly [number, number] | null;
  /** Greatest height of a pattern in mm. */
  maxHeight: number;
  /** Extra empty strip at the bottom of the sheet in mm. */
  bottomPad: number;
  /** Level 3: exactly this many repeats are dotted. Level 4: at least this many are drawn. Zero where it does not apply. */
  repeats: number;
  /** The rows stand in a calligraphy ruling. */
  ruled: boolean;
  /** The one sentence of the instruction. */
  instruction: string;
}

export const DEFAULT_PATTERN_LINES_LEVEL_ID: PatternLinesLevelId = "poziom2";

const INSTRUCTIONS = PATTERN_LINES_SHEET.instructions;
const PAD = PATTERN_LINES_SHEET.bottomPad;

export const PATTERN_LINES_LEVELS: readonly PatternLinesLevel[] = [
  {
    id: "poziom1",
    label: "Poziom 1",
    barLabel: "1",
    description: "po kropkach, proste wzory, 4 rzędy",
    mode: "dots",
    pool: ["line", "wave", "zigzag", "arcs", "cups"],
    rows: 4,
    period: [40, 52],
    ratio: [0.2, 0.42],
    maxHeight: 20,
    bottomPad: PAD.poziom1,
    repeats: 0,
    ruled: false,
    instruction: INSTRUCTIONS.dots,
  },
  {
    id: "poziom2",
    label: "Poziom 2",
    barLabel: "2",
    description: "po kropkach, więcej wzorów, 5 rzędów",
    mode: "dots",
    pool: [
      "wave",
      "zigzag",
      "arcs",
      "cups",
      "stairs",
      "trapez",
      "saw",
      "arcFlat",
      "house",
      "tunnel",
      "pointed",
      "waveFlat",
    ],
    rows: 5,
    period: [30, 42],
    ratio: [0.35, 0.6],
    maxHeight: 18,
    bottomPad: PAD.poziom2,
    repeats: 0,
    ruled: false,
    instruction: INSTRUCTIONS.dots,
  },
  {
    id: "poziom3",
    label: "Poziom 3",
    barLabel: "3",
    description: "dwa powtórzenia po kropkach, dalej sam, 6 rzędów",
    mode: "dotsThenFree",
    pool: [
      "zigzag",
      "wave",
      "arcs",
      "cups",
      "stairs",
      "trapez",
      "saw",
      "loops",
      "arcFlat",
      "zigFlat",
      "bricks",
      "pipes",
      "house",
      "tunnel",
      "pointed",
      "doubleZig",
      "loopsDown",
      "sticks",
    ],
    rows: 6,
    period: [22, 30],
    ratio: [0.5, 0.85],
    maxHeight: 15,
    bottomPad: PAD.poziom3,
    repeats: 2,
    ruled: false,
    instruction: INSTRUCTIONS.dotsThenFree,
  },
  {
    id: "poziom4",
    label: "Poziom 4",
    barLabel: "4",
    description: "dokończ wzór linią w liniaturze, 7 rzędów",
    mode: "line",
    pool: [
      "loops",
      "snails",
      "tallShort",
      "doubleArc",
      "loopArc",
      "waveLoop",
      "arcZig",
      "stairsArc",
      "saw",
      "trapez",
      "bricks",
      "pipes",
      "spell",
      "loopsDown",
      "upDown",
      "doubleZig",
      "sticks",
    ],
    rows: 7,
    period: [12, 20],
    ratio: null,
    maxHeight: 13,
    bottomPad: PAD.poziom4,
    repeats: 3,
    ruled: true,
    instruction: INSTRUCTIONS.line,
  },
];

export function patternLinesLevelById(id: PatternLinesLevelId): PatternLinesLevel {
  const level = PATTERN_LINES_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown pattern-lines level ${id}`);
  }
  return level;
}

/** Levels 3 and 4 have the "Linie" switch; on levels 1 and 2 there is nothing to switch. */
export function patternLinesHasGuides(id: PatternLinesLevelId): boolean {
  return id === "poziom3" || id === "poziom4";
}
