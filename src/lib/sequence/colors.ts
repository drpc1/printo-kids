import { shuffle } from "./random.ts";
import { SEQUENCE_SHAPES, type SequenceShape } from "./shapes.ts";

/**
 * Crayon names for the shapes on one sequence card. The names are the `--symmetry-*` tokens in
 * `src/styles/global.css`. A shape does not keep one crayon across cards.
 */
export const SEQUENCE_CRAYONS = [
  "red",
  "blue",
  "green",
  "orange",
  "purple",
  "yellow",
  "brown",
  "gray",
  "black",
] as const;

export type SequenceCrayon = (typeof SEQUENCE_CRAYONS)[number];

/** One crayon per shape that appears on the card. A shape that does not appear has no entry. */
export type SequenceShapeColors = Readonly<Partial<Record<SequenceShape, SequenceCrayon>>>;

const INK = "var(--foreground)";

/**
 * Crayons for the shapes on this card. Shapes stay in `SEQUENCE_SHAPES` order; the crayon pool is shuffled, and shape
 * `i` receives crayon `i`. Numbers never arrive here, because the argument is only `SequenceShape`.
 */
export function assignSequenceColors(random: () => number, shapes: readonly SequenceShape[]): SequenceShapeColors {
  const present = SEQUENCE_SHAPES.filter((shape) => shapes.includes(shape));
  const crayons = shuffle(random, [...SEQUENCE_CRAYONS]);
  const assigned: Partial<Record<SequenceShape, SequenceCrayon>> = {};
  for (const [index, shape] of present.entries()) {
    assigned[shape] = crayons[index];
  }
  return assigned;
}

/** A theme token, never a hex: the shape's crayon when colors are on and it has one, ink otherwise. */
export function sequenceShapeInk(shape: SequenceShape, colors: boolean, shapeColors: SequenceShapeColors): string {
  if (!colors) {
    return INK;
  }
  const crayon = shapeColors[shape];
  if (crayon === undefined) {
    return INK;
  }
  return `var(--symmetry-${crayon})`;
}
