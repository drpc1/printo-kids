import type { MoneyLevel, MoneyLevelId } from "./levels.ts";

/** Which pile is worth more, or that they are worth the same. `left` is written as ">" and `right` as "<". */
export type MoneyAnswer = "left" | "right" | "equal";

export interface MoneyRow {
  left: readonly number[];
  right: readonly number[];
  answer: MoneyAnswer;
}

export interface MoneyCard {
  levelId: MoneyLevelId;
  rows: readonly MoneyRow[];
  /** Names all rows; two cards with one key show the same thing. */
  key: string;
}

/** The most rows of one card that may show two piles worth the same. */
export const MAX_TIE_ROWS = 1;

export function pileValue(pile: readonly number[]): number {
  return pile.reduce((sum, value) => sum + value, 0);
}

export function pieceCount(pile: readonly number[]): number {
  return pile.length;
}

export function compareRow(left: readonly number[], right: readonly number[]): MoneyAnswer {
  const difference = pileValue(left) - pileValue(right);
  if (difference === 0) {
    return "equal";
  }
  return difference > 0 ? "left" : "right";
}

/** True when the pile with strictly fewer pieces is worth strictly more. Equal piece counts and ties never mislead. */
export function isMisleading(left: readonly number[], right: readonly number[]): boolean {
  const fewer = pieceCount(left) - pieceCount(right);
  const more = pileValue(left) - pileValue(right);
  return (fewer < 0 && more > 0) || (fewer > 0 && more < 0);
}

const pileKey = (pile: readonly number[]): string => [...pile].sort((a, b) => b - a).join("+");

/** A row as the sides show it: the same pair with the sides swapped is a different row. */
export function rowKey(row: Pick<MoneyRow, "left" | "right">): string {
  return `${pileKey(row.left)}|${pileKey(row.right)}`;
}

/** A row without regard to the sides: the same pair swapped counts as the same row. */
export function pairKey(row: Pick<MoneyRow, "left" | "right">): string {
  return [pileKey(row.left), pileKey(row.right)].sort().join("|");
}

export type MoneyRowProblem = "pile-size" | "nominal" | "pile-sum" | "answer" | "identical-piles";

export type MoneyCardProblem = MoneyRowProblem | "row-count" | "tie-rows" | "misleading-count" | "duplicate-row";

export function moneyRowProblems(row: MoneyRow, level: MoneyLevel): readonly MoneyRowProblem[] {
  const problems = new Set<MoneyRowProblem>();
  const piles = [row.left, row.right];

  for (const pile of piles) {
    if (pile.length < 1 || pile.length > level.maxPieces) {
      problems.add("pile-size");
    }
    if (pile.some((value) => !level.nominals.includes(value))) {
      problems.add("nominal");
    }
    if (pileValue(pile) > level.maxSum) {
      problems.add("pile-sum");
    }
  }
  if (row.answer !== compareRow(row.left, row.right)) {
    problems.add("answer");
  }
  // Two identical piles are a tie nobody has to count.
  if (row.answer === "equal" && pileKey(row.left) === pileKey(row.right)) {
    problems.add("identical-piles");
  }

  return [...problems];
}

export function moneyCardProblems(card: MoneyCard, level: MoneyLevel): readonly MoneyCardProblem[] {
  const problems = new Set<MoneyCardProblem>();

  if (card.rows.length !== level.rowCount) {
    problems.add("row-count");
  }
  for (const row of card.rows) {
    for (const problem of moneyRowProblems(row, level)) {
      problems.add(problem);
    }
  }
  if (card.rows.filter((row) => row.answer === "equal").length > MAX_TIE_ROWS) {
    problems.add("tie-rows");
  }
  const misleading = card.rows.filter((row) => isMisleading(row.left, row.right)).length;
  if (misleading < level.misleadingMin || misleading > level.misleadingMax) {
    problems.add("misleading-count");
  }
  if (new Set(card.rows.map(pairKey)).size !== card.rows.length) {
    problems.add("duplicate-row");
  }

  return [...problems];
}
