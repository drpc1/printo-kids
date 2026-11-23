import type { CardKindId } from "./cards.ts";
import { CLOCK_LEVELS } from "./clock/levels.ts";
import { CODING_LEVELS } from "./coding/levels.ts";
import { COPY_DRAWING_LEVELS } from "./copy-drawing/levels.ts";
import { DICTATION_LEVELS } from "./dictation/levels.ts";
import { LEVELS as MAZE_LEVELS } from "./maze/levels.ts";
import { MATH_CROSSWORD_LEVELS } from "./math-crossword/levels.ts";
import { moneyLevels } from "./money/levels.ts";
import { NONOGRAM_SIZES } from "./nonogram/sizes.ts";
import { NUMBER_MAZE_LEVELS } from "./number-maze/levels.ts";
import { ODD_ONE_OUT_LEVELS } from "./odd-one-out/levels.ts";
import { PATTERN_LINES_LEVELS } from "./pattern-lines/levels.ts";
import { SEQUENCE_LEVELS } from "./sequence/levels.ts";
import { SHADOWS_LEVELS } from "./shadows/levels.ts";
import { SIZE_ORDER_LEVELS } from "./size-order/levels.ts";
import { SUDOKU_LEVELS, SUDOKU_SIZES, sudokuLevelDescription } from "./sudoku/levels.ts";
import { SYMMETRY_LEVELS } from "./symmetry/levels.ts";

/** One line of a level list: the name, half a sentence on what changes and, for four cards, the typical age. */
export interface CardLevelRow {
  label: string;
  description?: string;
  typicalAge?: string;
}

/** Rows under one heading; `heading` is absent when the card has a single list of levels. */
export interface CardLevelGroup {
  heading?: string;
  rows: readonly CardLevelRow[];
}

interface LevelSource {
  label: string;
  description: string;
  typicalAge?: string;
}

function rowsOf(levels: readonly LevelSource[]): CardLevelRow[] {
  return levels.map((level) => ({
    label: level.label,
    description: level.description,
    ...(level.typicalAge === undefined ? {} : { typicalAge: level.typicalAge }),
  }));
}

function single(levels: readonly LevelSource[]): readonly CardLevelGroup[] {
  return [{ rows: rowsOf(levels) }];
}

/** Sudoku: one group per board size; 4×4 has one level (one blank in every row), 6×6 and 9×9 three. */
function sudokuGroups(): readonly CardLevelGroup[] {
  return SUDOKU_SIZES.map((size) => {
    if (size.id === 4) {
      return {
        heading: size.label,
        rows: [{ label: "jeden poziom", description: "w każdym wierszu brakuje jednego pola" }],
      };
    }
    const boardSize = size.id;
    return {
      heading: size.label,
      rows: SUDOKU_LEVELS.map((level) => ({
        label: level.label,
        description: sudokuLevelDescription(boardSize, level.id),
      })),
    };
  });
}

/** Level lists of every card kind. A `Record` over `CardKindId`, so a new card must add its entry here. */
const LEVEL_GROUPS: Record<CardKindId, () => readonly CardLevelGroup[]> = {
  cienie: () => single(SHADOWS_LEVELS),
  dyktando: () => single(DICTATION_LEVELS),
  kodowanie: () => single(CODING_LEVELS),
  krzyzowka: () => single(MATH_CROSSWORD_LEVELS),
  pieniadze: () => single(moneyLevels("pln")),
  niepasuje: () => single(ODD_ONE_OUT_LEVELS),
  labirynt: () => single(MAZE_LEVELS),
  liczby: () => single(NUMBER_MAZE_LEVELS),
  nonogram: () => single(NONOGRAM_SIZES),
  odnajmniejszego: () => single(SIZE_ORDER_LEVELS),
  sekwencje: () => single(SEQUENCE_LEVELS),
  kopiuj: () => single(COPY_DRAWING_LEVELS),
  sudoku: sudokuGroups,
  symetria: () => single(SYMMETRY_LEVELS),
  szlaczki: () => single(PATTERN_LINES_LEVELS),
  zegar: () => single(CLOCK_LEVELS),
};

/** The level rows of a card for the "Jak to działa" page, from the same data the level list on the bar uses. */
export function cardLevelGroups(id: CardKindId): readonly CardLevelGroup[] {
  return LEVEL_GROUPS[id]();
}
