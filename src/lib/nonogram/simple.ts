import type { SymmetryTemplate } from "../symmetry/templates.ts";
import { nonogramImage } from "./clues.ts";
import type { NonogramSize, NonogramSizeId } from "./sizes.ts";

export type Tone = "white" | "gray" | "black";

/** One chip of a row: `count` cells of one tone in a row. */
export interface ToneRun {
  tone: Tone;
  count: number;
}

export interface SimpleNonogramCard {
  kind: "znaczki";
  sizeId: NonogramSizeId;
  columns: number;
  rows: number;
  /** Side of one grid cell in mm on the A4 sheet. */
  cellSize: number;
  /** The one answer: a tone for every cell, rows by columns. Holes in the silhouette stay white. */
  tones: Tone[][];
  /** The chips of every row, left to right; their counts add up to the number of columns. */
  runs: ToneRun[][];
  /** Names the size, the template, and the variant of every part. Not shown to the child. */
  key: string;
}

export type SimpleNonogramProblem = "no-filled-cell" | "too-many-runs" | "runs-mismatch";

/** The widest chip band that fits beside the grid inside the margin: more chips in one row and the card is not shown. */
export const MAX_RUNS_PER_ROW = 7;

/**
 * A filled cell with an empty neighbour (or the grid edge) is the outline and goes black; a filled cell whose four
 * neighbours are all filled is the inside and goes gray; the rest is white.
 */
export function outlineTones(image: readonly (readonly boolean[])[]): Tone[][] {
  const filled = (row: number, column: number): boolean =>
    row >= 0 && row < image.length && column >= 0 && column < image[row].length && image[row][column];
  return image.map((cells, row) =>
    cells.map((cell, column) => {
      if (!cell) {
        return "white";
      }
      const inside =
        filled(row - 1, column) && filled(row + 1, column) && filled(row, column - 1) && filled(row, column + 1);
      return inside ? "gray" : "black";
    }),
  );
}

/** The chips of one row: runs of equal tones, in order. */
export function toneRuns(tones: readonly Tone[]): ToneRun[] {
  const runs: ToneRun[] = [];
  for (const tone of tones) {
    const last = runs[runs.length - 1] as ToneRun | undefined;
    if (last?.tone === tone) {
      last.count += 1;
    } else {
      runs.push({ tone, count: 1 });
    }
  }
  return runs;
}

/** Builds the chip card for one template and one variant index per part. Does not validate. */
export function composeSimpleNonogramCard(
  template: SymmetryTemplate,
  variants: readonly number[],
  size: NonogramSize,
): SimpleNonogramCard {
  const tones = outlineTones(nonogramImage(template, variants, size));
  return {
    kind: "znaczki",
    sizeId: size.id,
    columns: size.columns,
    rows: size.rows,
    cellSize: size.cellSize,
    tones,
    runs: tones.map(toneRuns),
    key: `${size.id}:${template.id}:${variants.join("-")}`,
  };
}

/** The rules for a chip card. An empty list means the card may be shown. */
export function simpleNonogramProblems(card: SimpleNonogramCard): readonly SimpleNonogramProblem[] {
  const problems = new Set<SimpleNonogramProblem>();
  if (!card.tones.some((row) => row.some((tone) => tone !== "white"))) {
    problems.add("no-filled-cell");
  }
  if (card.runs.some((row) => row.length > MAX_RUNS_PER_ROW)) {
    problems.add("too-many-runs");
  }
  const rebuilt = card.runs.map((row) => row.flatMap((run) => new Array<Tone>(run.count).fill(run.tone)));
  if (JSON.stringify(rebuilt) !== JSON.stringify(card.tones)) {
    problems.add("runs-mismatch");
  }
  return [...problems];
}
