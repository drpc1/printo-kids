import { ICONS } from "../odd-one-out/icons.ts";
import { ODD_CRAYONS } from "../odd-one-out/rules.ts";
import { SPEECH_BAND } from "../sheet/speech.ts";
import { SUDOKU_SHAPES } from "../sudoku/shapes.ts";
import { rowTallestMm, sizeOrderGeometry, smallestGapShare } from "./layout.ts";
import type { SizeOrderLevel } from "./levels.ts";
import type { SizeOrderCard, SizeOrderPicture, SizeRow } from "./types.ts";
import { SIZE_ORDER_SHEET } from "./sheet.ts";

export type { SizeOrderCard, SizeOrderPicture, SizeRow } from "./types.ts";

const EPSILON = 1e-9;

/** The answer of a row: for every picture on the sheet, its place counted from the smallest (1, 2, 3…). */
export function answerOf(row: SizeRow): number[] {
  return row.heights.map((height) => row.heights.filter((other) => other < height).length + 1);
}

export function pictureKey(picture: SizeOrderPicture): string {
  return `${picture.kind}:${picture.id}`;
}

/** What makes two cards the same card: the pictures and the order of sizes (the crayons are decoration). */
export function sizeOrderCardKey(card: SizeOrderCard): string {
  return `${card.levelId}|${card.rows.map((row) => `${pictureKey(row.picture)}=${row.heights.join(",")}`).join("|")}`;
}

function sorted(heights: readonly number[]): number[] {
  return [...heights].sort((a, b) => a - b);
}

function sameHeights(heights: readonly number[], expected: readonly number[]): boolean {
  const own = sorted(heights);
  return own.length === expected.length && own.every((value, index) => Math.abs(value - expected[index]) < EPSILON);
}

/** Whether the row already stands in order, rising or falling: then nothing is left to order. */
export function isOrdered(heights: readonly number[]): boolean {
  const rising = heights.every((value, index) => index === 0 || value > heights[index - 1]);
  const falling = heights.every((value, index) => index === 0 || value < heights[index - 1]);
  return rising || falling;
}

function stepTooSmall(heights: readonly number[], minStep: number): boolean {
  const own = sorted(heights);
  return own.some((value, index) => index > 0 && value / own[index - 1] < minStep - EPSILON);
}

/** Codes of the rules the card breaks; empty for a legal card. */
export function sizeOrderCardProblems(card: SizeOrderCard, level: SizeOrderLevel): string[] {
  const problems: string[] = [];
  if (card.levelId !== level.id) problems.push("settings-mismatch");
  if (card.rows.length !== level.rowCount) problems.push("wrong-row-count");
  const rightCount = card.rows.every((row) => row.heights.length === level.itemCount);
  if (!rightCount) problems.push("wrong-item-count");
  if (rightCount && card.rows.some((row) => !sameHeights(row.heights, level.heights)))
    problems.push("heights-not-level");
  if (card.rows.some((row) => stepTooSmall(row.heights, level.minStep))) problems.push("step-too-small");
  if (card.rows.some((row) => isOrdered(row.heights))) problems.push("row-already-ordered");

  const keys = card.rows.map((row) => pictureKey(row.picture));
  if (new Set(keys).size !== keys.length) problems.push("duplicate-picture");
  if (!card.rows.some((row) => row.picture.kind === "icon")) problems.push("missing-icon");
  if (!card.rows.some((row) => row.picture.kind === "shape")) problems.push("missing-shape");
  const known = card.rows.every((row) =>
    row.picture.kind === "icon"
      ? ICONS.some((icon) => icon.id === row.picture.id)
      : (SUDOKU_SHAPES as readonly string[]).includes(row.picture.id),
  );
  if (!known) problems.push("unknown-picture");
  if (card.rows.some((row, index) => index > 0 && row.crayon === card.rows[index - 1].crayon)) {
    problems.push("crayon-repeated");
  }
  if (card.rows.some((row) => !ODD_CRAYONS.includes(row.crayon))) problems.push("unknown-crayon");

  // After layout the step must still be visible: a wide icon shrinks its row, and the gap shrinks with it. Measured
  // with the character band, the smaller of the two layouts, so it holds without a character too.
  if (known) {
    const geometry = sizeOrderGeometry(level, SPEECH_BAND.characterSize);
    const gap = smallestGapShare(level);
    const tooSmall = card.rows.some(
      (row) => (rowTallestMm(row.picture, geometry) ?? 0) * gap < SIZE_ORDER_SHEET.minStepMm - EPSILON,
    );
    if (tooSmall) problems.push("step-too-small-mm");
  }
  return problems;
}
