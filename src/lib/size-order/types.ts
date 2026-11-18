import type { OddCrayon } from "../odd-one-out/rules.ts";
import type { SudokuShapeId } from "../sudoku/shapes.ts";
import type { SizeOrderLevel } from "./levels.ts";

export type SizeOrderPicture = { kind: "icon"; id: string } | { kind: "shape"; id: SudokuShapeId };

/** One row: a single picture in several sizes. */
export interface SizeRow {
  picture: SizeOrderPicture;
  /** Heights as a share of the tallest, in the order they stand on the sheet (not sorted). */
  heights: number[];
  /** The crayon of the whole row; drawn only with colors on, so it never says which picture is bigger. */
  crayon: OddCrayon;
}

export interface SizeOrderCard {
  levelId: SizeOrderLevel["id"];
  rows: SizeRow[];
}
