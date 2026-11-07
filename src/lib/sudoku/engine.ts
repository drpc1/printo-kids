// Sudoku as a card kind (gh283, phase 8): `sudokuSpec` wraps `sudokuCardProblems`, `sudokuEngine` wraps the generator.
// Size, level and symbols are the card's content; colors only repaint the same card. Running out of attempts is
// `CardExhausted`; the engine never returns null.
// `require` counts the solutions a second time; the 9x9 hard test in `engine.test.ts` keeps that cost inside the budget.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { SudokuCardSettings } from "../card-settings.ts";
import { generateSudokuCard, MAX_ATTEMPTS, sudokuCardProblems, type SudokuCard } from "./generate.ts";
import { sudokuHasLevels, sudokuHasSymbolChoice, type SudokuSize } from "./levels.ts";

type Bad = CardSpec<SudokuCardSettings, SudokuCard>["knownBad"][number];

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fixture(settings: SudokuCardSettings): SudokuCard {
  const card = generateSudokuCard(seeded(3), null, settings);
  if (card === null) {
    throw new Error(`sudokuSpec.knownBad: no fixture card for ${settings.size}x${settings.size}`);
  }
  return card;
}

function knownBad(): readonly Bad[] {
  const six: SudokuCardSettings = { size: 6, level: "latwy", symbols: "shapes", colors: false };
  const four: SudokuCardSettings = { size: 4, level: "latwy", symbols: "shapes", colors: false };
  const base6 = fixture(six);
  const base4 = fixture(four);
  const brokenSolution = structuredClone(base6);
  const [first, ...otherRows] = brokenSolution.solution;
  brokenSolution.solution = [[first[1], first[0], ...first.slice(2)], ...otherRows];
  const emptyBoard = structuredClone(base6);
  emptyBoard.givens = emptyBoard.givens.map((row) => row.map(() => null));
  const twoBlanksInRow = structuredClone(base4);
  twoBlanksInRow.givens = twoBlanksInRow.givens.map((row, index) =>
    index === 0 ? row.map((value, col) => (col < 2 ? null : value)) : row,
  );
  return [
    {
      name: "a solution that breaks the sudoku rule",
      card: brokenSolution,
      settings: six,
      expectedCode: "invalid-solution",
    },
    { name: "an empty board has no unique solution", card: emptyBoard, settings: six, expectedCode: "not-unique" },
    { name: "4x4 with two blanks in a row", card: twoBlanksInRow, settings: four, expectedCode: "blank-count-per-row" },
    {
      name: "a 6x6 card shown for a 9x9 bar",
      card: structuredClone(base6),
      settings: { ...six, size: 9 },
      expectedCode: "settings-mismatch",
    },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

/** What the bar asks for, as far as it applies to the size: 4×4 has one level and only shapes. */
function effective(size: SudokuSize, level: string, symbols: string): string {
  const hasLevels = sudokuHasLevels(size);
  const hasSymbols = sudokuHasSymbolChoice(size);
  return `${size}|${hasLevels ? level : "-"}|${hasSymbols ? symbols : "shapes"}`;
}

export const sudokuSpec: CardSpec<SudokuCardSettings, SudokuCard> = {
  kind: "sudoku",
  problems: (card, settings): readonly CardProblem[] => {
    const problems: CardProblem[] = sudokuCardProblems(card).map((code) => ({
      code,
      detail: `sudoku card rule "${code}" is broken`,
    }));
    if (effective(card.size, card.level, card.symbols) !== effective(settings.size, settings.level, settings.symbols)) {
      problems.push({
        code: "settings-mismatch",
        detail: "the card does not match the size, level or symbols on the bar",
      });
    }
    return problems;
  },
  keyOf: (card) => card.key,
  // Colors are a decoration: the same board is drawn in color or in black.
  contentKey: (settings) => effective(settings.size, settings.level, settings.symbols),
  // Built on first use: the fixtures draw boards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const sudokuEngine: CardEngine<SudokuCardSettings, SudokuCard> = {
  spec: sudokuSpec,
  generate(settings, random, previousKey) {
    const card = generateSudokuCard(random, previousKey, settings);
    if (card === null) {
      throw new CardExhausted(sudokuSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(sudokuSpec, card, settings);
  },
};
