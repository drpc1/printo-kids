export const SYMMETRY_COLORS = ["red", "green", "yellow", "blue", "gray", "black"] as const;

export type SymmetryColor = (typeof SYMMETRY_COLORS)[number];

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
  /** Rows of the drawing frame. The card moves the whole frame down by an offset that keeps it on the grid. */
  height: number;
  base: readonly SymmetryCell[];
  parts: readonly SymmetryPart[];
}

const COLOR_LETTERS: Readonly<Record<string, SymmetryColor>> = {
  r: "red",
  g: "green",
  y: "yellow",
  b: "blue",
  s: "gray",
  k: "black",
};

/**
 * Reads a drawing of the left half: one string per row, "." is an empty cell and a letter is a filled cell of
 * that color (r red, g green, y yellow, b blue, s gray, k black). `top` and `left` place the drawing in the frame.
 */
function drawing(lines: readonly string[], top = 0, left = 0): SymmetryCell[] {
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

// Holes ("." inside the outline) are part of the shape: the card prints a black silhouette, so a window or an
// eye only shows as an empty cell.

const ROCKET: SymmetryTemplate = {
  id: "rakieta",
  height: 15,
  base: drawing([
    "......", // 0 nose (part)
    "......", // 1
    "......", // 2
    "...sss", // 3
    "...s..", // 4 window (part)
    "...s..", // 5
    "...sss", // 6
    "...sss", // 7
    "...sss", // 8 fins (part)
    "...sss", // 9
    "...sss", // 10
    "...sss", // 11
    "....yy", // 12 flame
    "....ry", // 13
    ".....y", // 14
  ]),
  parts: [
    {
      id: "nose",
      variants: [drawing([".....r", "....rr", "...rrr"], 0, 0), drawing(["....rr", "...rrr", "...rrr"], 0, 0)],
    },
    {
      id: "window",
      variants: [drawing(["..", ".."], 4, 4), drawing(["s.", "s."], 4, 4)],
    },
    {
      id: "fins",
      variants: [drawing(["..r", ".rr", "rrr", "rr."], 8, 0), drawing(["...", "..r", ".rr", ".rr"], 8, 0)],
    },
  ],
};

const ROBOT: SymmetryTemplate = {
  id: "robot",
  height: 15,
  base: drawing([
    "......", // 0 antenna (part)
    "......", // 1
    "..ssss", // 2 head
    "..s...", // 3 eyes (part)
    "..ssss", // 4
    "..ss..", // 5 mouth
    "..ssss", // 6
    "....kk", // 7 neck
    "..ssss", // 8 body, arms (part) on columns 0-1
    "..ssss", // 9
    "..ssss", // 10
    "..ssss", // 11
    "..ss..", // 12 legs
    "..ss..", // 13
    ".kkk..", // 14 feet
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing([".k", ".y"], 0, 4), drawing(["k.", "k."], 0, 4)],
    },
    {
      id: "eyes",
      variants: [drawing([".ss"], 3, 3), drawing(["..s"], 3, 3)],
    },
    {
      id: "arms",
      variants: [
        drawing(["..", "..", "..", "kk", "k.", "k.", "k."], 5, 0),
        drawing(["k.", "k.", "k.", "kk", "..", "..", ".."], 5, 0),
      ],
    },
  ],
};

const STRAWBERRY: SymmetryTemplate = {
  id: "truskawka",
  height: 15,
  base: drawing([
    "......", // 0 leaves (part)
    "......", // 1
    "......", // 2
    ".rrrrr", // 3
    "......", // 4 seeds (part)
    "......", // 5
    "......", // 6
    "......", // 7
    "......", // 8
    "......", // 9
    "......", // 10
    "......", // 11
    "...rrr", // 12
    "....rr", // 13
    ".....r", // 14
  ]),
  parts: [
    {
      id: "leaves",
      variants: [drawing([".....g", "..g.gg", ".g.g.g"], 0, 0), drawing([".....g", "gg..gg", "..g.gg"], 0, 0)],
    },
    {
      id: "seeds",
      variants: [
        drawing(["rr.rrr", "rrrrr.", "r.rrrr", "rrrr.r", ".rrrrr", ".r.rrr", "..rrrr", "..rr.r"], 4, 0),
        drawing(["rrr.rr", "r.rrrr", "rrrrr.", "rr.rrr", ".rrrrr", ".rrr.r", "..r.rr", "..rrrr"], 4, 0),
      ],
    },
  ],
};

/** Every template is drawn as the left half of a 12-column grid: 6 columns, and column 5 touches the axis. */
export const SYMMETRY_TEMPLATES: readonly SymmetryTemplate[] = [ROCKET, ROBOT, STRAWBERRY];
