export type MathCrosswordLevelId = "poziom1" | "poziom2" | "poziom3" | "poziom4" | "poziom5" | "poziom6" | "poziom7";

/** The signs of an equation: plus, minus (U+2212), times (middle dot) and divided by (colon). */
export type MathOp = "+" | "−" | "·" | ":";

export interface MathCrosswordLevel {
  id: MathCrosswordLevelId;
  /** Name in the level list. */
  label: string;
  /** Text after "Poziom:" on the bar. */
  barLabel: string;
  /** Half a sentence about what changes; it names no age. */
  description: string;
  /** The signs a card of this level may use. */
  ops: readonly MathOp[];
  /** The greatest number on the card. */
  max: number;
  /** The number of equations the generator aims at. */
  equations: number;
  /** The greatest side of a cell in mm; the layout takes a smaller one when the crossword does not fit. */
  maxCell: number;
  /** The share of the numbers the generator aims to leave empty. */
  blankShare: number;
  /** The most empty numbers in one equation. */
  maxBlanksPerEquation: number;
  /** The longest chain: how many equations the child works through before the last empty number. */
  maxChain: number;
  /** The widest and the highest crossword in cells. */
  cols: number;
  rows: number;
}

export const DEFAULT_MATH_CROSSWORD_LEVEL_ID: MathCrosswordLevelId = "poziom2";

/**
 * A card may have this many equations fewer than the level aims at. The crossword grows equation by equation inside
 * `cols` x `rows`; a thin layout can stop one short, and the best of many layouts is taken, so one missing equation is
 * the most a legal card shows. Two or more fewer is a card the level did not mean (`too-few-equations`).
 */
export const EQUATION_TOLERANCE = 1;

export const MATH_CROSSWORD_LEVELS: readonly MathCrosswordLevel[] = [
  {
    id: "poziom1",
    label: "Poziom 1",
    barLabel: "1",
    description: "dodawanie do 10",
    ops: ["+"],
    max: 10,
    equations: 5,
    maxCell: 26,
    blankShare: 0.4,
    maxBlanksPerEquation: 1,
    maxChain: 1,
    cols: 7,
    rows: 9,
  },
  {
    id: "poziom2",
    label: "Poziom 2",
    barLabel: "2",
    description: "dodawanie i odejmowanie do 10",
    ops: ["+", "−"],
    max: 10,
    equations: 9,
    maxCell: 24,
    blankShare: 0.45,
    maxBlanksPerEquation: 1,
    maxChain: 1,
    cols: 8,
    rows: 10,
  },
  {
    id: "poziom3",
    label: "Poziom 3",
    barLabel: "3",
    description: "dodawanie i odejmowanie do 20",
    ops: ["+", "−"],
    max: 20,
    equations: 13,
    maxCell: 17,
    blankShare: 0.5,
    maxBlanksPerEquation: 2,
    maxChain: 2,
    cols: 11,
    rows: 14,
  },
  {
    id: "poziom4",
    label: "Poziom 4",
    barLabel: "4",
    description: "dodawanie i odejmowanie do 100",
    ops: ["+", "−"],
    max: 100,
    equations: 12,
    maxCell: 16,
    blankShare: 0.5,
    maxBlanksPerEquation: 2,
    maxChain: 3,
    cols: 11,
    rows: 14,
  },
  {
    id: "poziom5",
    label: "Poziom 5",
    barLabel: "5",
    description: "mnożenie do 30",
    ops: ["·"],
    max: 30,
    equations: 12,
    maxCell: 16,
    blankShare: 0.5,
    maxBlanksPerEquation: 2,
    maxChain: 3,
    cols: 11,
    rows: 14,
  },
  {
    id: "poziom6",
    label: "Poziom 6",
    barLabel: "6",
    description: "mnożenie i dzielenie do 50",
    ops: ["·", ":"],
    max: 50,
    equations: 15,
    maxCell: 14.5,
    blankShare: 0.55,
    maxBlanksPerEquation: 2,
    maxChain: 4,
    cols: 13,
    rows: 17,
  },
  {
    id: "poziom7",
    label: "Poziom 7",
    barLabel: "7",
    description: "wszystkie cztery działania do 100",
    ops: ["+", "−", "·", ":"],
    max: 100,
    equations: 20,
    maxCell: 13.5,
    blankShare: 0.6,
    maxBlanksPerEquation: 2,
    maxChain: 4,
    cols: 14,
    rows: 18,
  },
];

export function mathCrosswordLevelById(id: MathCrosswordLevelId): MathCrosswordLevel {
  const level = MATH_CROSSWORD_LEVELS.find((candidate) => candidate.id === id);
  if (level === undefined) {
    throw new Error(`Unknown math-crossword level ${id}`);
  }
  return level;
}
