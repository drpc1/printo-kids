import { pick, shuffle } from "../sequence/random.ts";
import type { MoneyLevel } from "./levels.ts";
import {
  compareRow,
  isMisleading,
  MAX_TIE_ROWS,
  moneyCardProblems,
  pairKey,
  pileValue,
  rowKey,
  type MoneyCard,
  type MoneyRow,
} from "./rules.ts";

export type { MoneyCard, MoneyRow } from "./rules.ts";

const MAX_ATTEMPTS = 200;
const MAX_ROW_ATTEMPTS = 300;

type RowKind = "misleading" | "tie" | "plain";

/** One pile: 1 to `maxPieces` pieces of the allowed nominals, never worth more than `maxSum`. */
function drawPile(random: () => number, level: MoneyLevel): number[] {
  const count = 1 + pick(random, level.maxPieces);
  const pile: number[] = [];
  let sum = 0;
  while (pile.length < count) {
    const fitting = level.nominals.filter((value) => sum + value <= level.maxSum);
    if (fitting.length === 0) {
      break;
    }
    const value = fitting[pick(random, fitting.length)];
    pile.push(value);
    sum += value;
  }
  return pile;
}

function drawRow(random: () => number, level: MoneyLevel, kind: RowKind): Pick<MoneyRow, "left" | "right"> | null {
  for (let attempt = 0; attempt < MAX_ROW_ATTEMPTS; attempt += 1) {
    const left = drawPile(random, level);
    const right = drawPile(random, level);
    const tie = pileValue(left) === pileValue(right);
    const misleading = isMisleading(left, right);

    const fits = kind === "tie" ? tie : kind === "misleading" ? misleading : !tie && !misleading;
    if (!fits) {
      continue;
    }
    return random() < 0.5 ? { left, right } : { left: right, right: left };
  }
  return null;
}

function drawMoneyCard(random: () => number, level: MoneyLevel): MoneyCard | null {
  const ties = pick(random, MAX_TIE_ROWS + 1);
  const misleadingMax = Math.min(level.misleadingMax, level.rowCount - ties);
  const misleading = level.misleadingMin + pick(random, misleadingMax - level.misleadingMin + 1);
  const kinds: RowKind[] = shuffle(random, [
    ...Array.from({ length: misleading }, (): RowKind => "misleading"),
    ...Array.from({ length: ties }, (): RowKind => "tie"),
    ...Array.from({ length: level.rowCount - misleading - ties }, (): RowKind => "plain"),
  ]);

  const rows: MoneyRow[] = [];
  const seen = new Set<string>();
  for (const kind of kinds) {
    let row: Pick<MoneyRow, "left" | "right"> | null = null;
    for (let attempt = 0; attempt < 20 && row === null; attempt += 1) {
      const drawn = drawRow(random, level, kind);
      if (drawn !== null && !seen.has(pairKey(drawn))) {
        row = drawn;
      }
    }
    if (row === null) {
      return null;
    }
    seen.add(pairKey(row));
    rows.push({ ...row, answer: compareRow(row.left, row.right) });
  }

  return { levelId: level.id, rows, key: rows.map(rowKey).join(";") };
}

/**
 * Draws a card for the level, or null when no card that keeps every rule (see `moneyCardProblems`) turned up within
 * the attempts. A card never repeats `previousKey`.
 */
export function generateMoneyCard(
  random: () => number,
  previousKey: string | null,
  level: MoneyLevel,
): MoneyCard | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const card = drawMoneyCard(random, level);
    if (card !== null && card.key !== previousKey && moneyCardProblems(card, level).length === 0) {
      return card;
    }
  }
  return null;
}
