export const SYMMETRY_COLORS = ["red", "green", "yellow", "blue", "orange", "gray", "black", "brown"] as const;

export type SymmetryColor = (typeof SYMMETRY_COLORS)[number];

/** The object categories of the template catalog, in the order of the PRD. A template has at least one. */
export const OBJECT_CATEGORIES = [
  { id: "zwierzeta", label: "Zwierzęta" },
  { id: "jedzenie", label: "Jedzenie" },
  { id: "przyroda", label: "Przyroda" },
  { id: "kosmos", label: "Kosmos i maszyny" },
  { id: "budowle", label: "Domy i budowle" },
  { id: "ksztalty", label: "Kształty" },
] as const;

export type ObjectCategoryId = (typeof OBJECT_CATEGORIES)[number]["id"];

export interface SymmetryCell {
  col: number;
  row: number;
  color: SymmetryColor;
}

export interface SymmetryPart {
  id: string;
  /** Each variant is one interchangeable look of the part; a card uses exactly one variant of every part. */
  variants: readonly (readonly SymmetryCell[])[];
}

export interface SymmetryTemplate {
  id: string;
  /** Columns of the drawing; the last one touches the axis. The card shifts the drawing right on a wider half. */
  width: number;
  /** Rows of the drawing frame. The card moves the whole frame down by an offset that keeps it on the grid. */
  height: number;
  base: readonly SymmetryCell[];
  parts: readonly SymmetryPart[];
  /**
   * Color of the holes (empty cells enclosed by the silhouette: a window, an eye, a seed). Null keeps the holes white
   * also with colors on (a penguin's belly, the dots of a toadstool).
   */
  holeColor: SymmetryColor | null;
  categories: readonly ObjectCategoryId[];
}

/** Every template of one object, one per half size: 4 by 12 (4 lat), 6 by 15 (5 and 6 lat), 9 by 24 (7 lat). */
export interface SymmetryObjectSizes {
  half4: readonly SymmetryTemplate[];
  half6: readonly SymmetryTemplate[];
  half9: readonly SymmetryTemplate[];
}

const COLOR_LETTERS: Readonly<Record<string, SymmetryColor>> = {
  r: "red",
  g: "green",
  y: "yellow",
  b: "blue",
  o: "orange",
  s: "gray",
  k: "black",
  n: "brown",
};

/**
 * Reads a drawing of the left half: one string per row, "." is an empty cell and a letter is a filled cell of
 * that color (r red, g green, y yellow, b blue, o orange, s gray, k black, n brown). `top` and `left` place the
 * drawing in the frame.
 */
export function drawing(lines: readonly string[], top = 0, left = 0): SymmetryCell[] {
  const cells: SymmetryCell[] = [];
  lines.forEach((line, rowIndex) => {
    for (let colIndex = 0; colIndex < line.length; colIndex += 1) {
      const letter = line.charAt(colIndex);
      if (letter === ".") {
        continue;
      }
      const color = COLOR_LETTERS[letter] as SymmetryColor | undefined;
      if (color === undefined) {
        throw new Error(`Unknown color letter "${letter}" in a symmetry drawing`);
      }
      cells.push({ col: left + colIndex, row: top + rowIndex, color });
    }
  });
  return cells;
}
