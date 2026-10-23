import type { SymmetryLevelId } from "./levels.ts";

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
  /** Columns of the drawing; the last one touches the axis. The card shifts the drawing right on a wider half. */
  width: number;
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
  width: 6,
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
  width: 6,
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
  width: 6,
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

// 4 lat: plain shapes drawn on the 4 by 12 half of an 8 by 12 grid. Column 3 touches the axis, and every
// template keeps at least three filled cells on it, because the level's hint cells are mirrors of those.

const ROCKET_4: SymmetryTemplate = {
  id: "rakieta",
  width: 4,
  height: 12,
  base: drawing([
    "....", // 0 nose (part)
    "....", // 1
    "....", // 2
    "..ss", // 3
    "..s.", // 4 window (part)
    "..ss", // 5
    "..ss", // 6
    "..ss", // 7 fins (part) on columns 0-1
    "..ss", // 8
    "..ss", // 9
    "..yy", // 10 flame
    "...y", // 11
  ]),
  parts: [
    {
      id: "nose",
      variants: [drawing(["...r", "..rr", "..rr"]), drawing(["...r", "...r", "..rr"])],
    },
    {
      id: "window",
      variants: [drawing([]), drawing(["s"], 4, 3)],
    },
    {
      id: "fins",
      variants: [drawing([".r", "rr", "r."], 7, 0), drawing([".r", "rr", "rr"], 8, 0)],
    },
  ],
};

const ROBOT_4: SymmetryTemplate = {
  id: "robot",
  width: 4,
  height: 12,
  base: drawing([
    "....", // 0 antenna (part)
    "....", // 1
    ".sss", // 2 head
    ".s..", // 3 eyes (part)
    ".sss", // 4
    ".sss", // 5
    "...k", // 6 neck
    ".sss", // 7 body, arms (part) on column 0
    ".sss", // 8
    ".sss", // 9
    ".sss", // 10
    "..kk", // 11 feet
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing(["y", "k"], 0, 3), drawing([".", "k"], 0, 3)],
    },
    {
      id: "eyes",
      variants: [drawing(["s"], 3, 3), drawing(["s"], 3, 2)],
    },
    {
      id: "arms",
      variants: [drawing(["k", "k", "k"], 7, 0), drawing(["k", "k", "k"], 8, 0)],
    },
  ],
};

const STRAWBERRY_4: SymmetryTemplate = {
  id: "truskawka",
  width: 4,
  height: 12,
  base: drawing([
    "....", // 0 leaves (part)
    "....", // 1
    ".rrr", // 2
    "....", // 3 seeds (part)
    "....", // 4
    "....", // 5
    "....", // 6
    "....", // 7
    "....", // 8
    "..rr", // 9
    "..rr", // 10
    "...r", // 11
  ]),
  parts: [
    {
      id: "leaves",
      variants: [drawing(["...g", ".ggg"], 0, 0), drawing(["..gg", "g.gg"], 0, 0)],
    },
    {
      id: "seeds",
      variants: [
        drawing(["rrrr", "rr.r", "r.rr", "rrr.", ".rrr", ".r.r"], 3, 0),
        drawing(["rrrr", "r.rr", "rrrr", "rr.r", ".rr.", ".rrr"], 3, 0),
      ],
    },
  ],
};

// 7 lat: richer shapes drawn on the 9 by 24 half of an 18 by 24 grid. Column 8 touches the axis. Same three
// objects with more parts and more detail than the 6 by 15 drawings.

const ROCKET_7: SymmetryTemplate = {
  id: "rakieta",
  width: 9,
  height: 24,
  base: drawing([
    ".........", // 0 nose (part)
    ".........", // 1
    ".........", // 2
    ".........", // 3
    ".........", // 4
    ".........", // 5
    "....sssss", // 6 body
    "....sssss", // 7
    "....sssss", // 8
    "....ss...", // 9 window (part) on columns 6-8
    "....ss...", // 10
    "....ss...", // 11
    "....ss...", // 12
    "....sssss", // 13 fins (part) on columns 0-3
    "....sssss", // 14
    "....sssss", // 15
    "....sssss", // 16
    "....sssss", // 17
    "....sssss", // 18
    "......sss", // 19 nozzle
    "......sss", // 20
    ".........", // 21 flame (part)
    ".........", // 22
    ".........", // 23
  ]),
  parts: [
    {
      id: "nose",
      variants: [
        drawing(["........r", "........r", ".......rr", ".......rr", "......rrr", "......rrr"], 0, 0),
        drawing([".........", ".......rr", "......rrr", "......rrr", ".....rrrr", ".....rrrr"], 0, 0),
      ],
    },
    {
      id: "window",
      variants: [drawing(["sss", "...", "...", "sss"], 9, 6), drawing(["sss", "s..", "s..", "sss"], 9, 6)],
    },
    {
      id: "fins",
      variants: [
        drawing(["...r", "..rr", ".rrr", "rrrr", "rrr.", "rr.."], 13, 0),
        drawing(["..rr", ".rrr", "rrrr", "rrrr"], 15, 0),
      ],
    },
    {
      id: "flame",
      variants: [
        drawing(["......yyy", ".......yy", "........r"], 21, 0),
        drawing(["......yyy", "......yry", ".......yy"], 21, 0),
      ],
    },
  ],
};

const ROBOT_7: SymmetryTemplate = {
  id: "robot",
  width: 9,
  height: 23,
  base: drawing([
    ".........", // 0 antenna (part)
    ".........", // 1
    ".........", // 2
    "...ssssss", // 3 head
    "...ssssss", // 4
    "...s.....", // 5 eyes (part) on columns 4-8
    "...s.....", // 6
    "...ssssss", // 7
    "...s.s.s.", // 8 mouth
    "...ssssss", // 9
    "......kkk", // 10 neck
    "...ssssss", // 11 body, arms (part) on columns 0-2
    "...ssssss", // 12
    "...ss....", // 13 chest panel (part) on columns 5-8
    "...ss....", // 14
    "...ss....", // 15
    "...ssssss", // 16
    "...ssssss", // 17
    "...ssssss", // 18
    "...ssssss", // 19
    "....ssss.", // 20 legs
    "....ssss.", // 21
    "...kkkk..", // 22 feet
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing([".y", ".k"], 0, 7), drawing(["y.", "k.", "k."], 0, 7)],
    },
    {
      id: "eyes",
      variants: [drawing(["s..ss", "s..ss"], 5, 4), drawing(["ssss.", "ssss."], 5, 4)],
    },
    {
      id: "panel",
      variants: [drawing(["ssss", "s.ss", "ssss"], 13, 5), drawing(["s.ss", "ssss", "s.ss"], 13, 5)],
    },
    {
      id: "arms",
      variants: [
        drawing(["k..", "k..", "kk.", ".kk", "..k"], 11, 0),
        drawing(["..k", ".kk", ".k.", ".k.", ".k.", "kk.", "k.."], 12, 0),
      ],
    },
  ],
};

const STRAWBERRY_7: SymmetryTemplate = {
  id: "truskawka",
  width: 9,
  height: 24,
  base: drawing([
    ".........", // 0 leaves (part)
    ".........", // 1
    ".........", // 2
    ".........", // 3
    ".........", // 4 cap (part)
    ".........", // 5
    ".........", // 6 seeds (part) on rows 6-17
    ".........", // 7
    ".........", // 8
    ".........", // 9
    ".........", // 10
    ".........", // 11
    ".........", // 12
    ".........", // 13
    ".........", // 14
    ".........", // 15
    ".........", // 16
    ".........", // 17
    "...rrrrrr", // 18
    "....rrrrr", // 19
    ".....rrrr", // 20
    "......rrr", // 21
    ".......rr", // 22
    "........r", // 23
  ]),
  parts: [
    {
      id: "leaves",
      variants: [
        drawing(["........g", "....g..gg", "..g.g.ggg", ".gggggggg"], 0, 0),
        drawing(["........g", "...gg..gg", ".gggg.ggg", "..ggggggg"], 0, 0),
      ],
    },
    {
      id: "cap",
      variants: [drawing(["..rrrrrrr", ".rrrrrrrr"], 4, 0), drawing(["...rrrrrr", "..rrrrrrr"], 4, 0)],
    },
    {
      id: "seeds",
      variants: [
        drawing(
          [
            "rrr.rrrrr",
            "rrrrrr.rr",
            "rr.rrrrrr",
            "rrrrr.rrr",
            "r.rrrrrrr",
            "rrrr.rrrr",
            "rrrrrrr.r",
            "rr.rrr.rr",
            ".rrrr.rrr",
            ".rr.rrrrr",
            "..rrrr.rr",
            "..r.rrrrr",
          ],
          6,
          0,
        ),
        drawing(
          [
            "rrrrr.rrr",
            "rr.rrrrrr",
            "rrrrrrr.r",
            "r.rrr.rrr",
            "rrr.rrrrr",
            "rrrrr.rrr",
            "r.rrrrrrr",
            "rrrr.rrrr",
            ".rr.rrrrr",
            ".rrrrr.rr",
            "..rr.rrrr",
            "..rrrrr.r",
          ],
          6,
          0,
        ),
      ],
    },
  ],
};

/** Drawn as the left half of a 12-column grid: 6 columns, and column 5 touches the axis. Used by 5 and 6 lat. */
const TEMPLATES_6_BY_15: readonly SymmetryTemplate[] = [ROCKET, ROBOT, STRAWBERRY];

const TEMPLATES_BY_LEVEL: Readonly<Record<SymmetryLevelId, readonly SymmetryTemplate[]>> = {
  lat4: [ROCKET_4, ROBOT_4, STRAWBERRY_4],
  lat5: TEMPLATES_6_BY_15,
  lat6: TEMPLATES_6_BY_15,
  lat7: [ROCKET_7, ROBOT_7, STRAWBERRY_7],
};

export function symmetryTemplatesFor(levelId: SymmetryLevelId): readonly SymmetryTemplate[] {
  return TEMPLATES_BY_LEVEL[levelId];
}
