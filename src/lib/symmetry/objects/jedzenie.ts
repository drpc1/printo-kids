import { drawing, type SymmetryObjectSizes, type SymmetryTemplate } from "../template-format.ts";

// Jedzenie. Holes ("." inside the outline) are part of the shape. Without colors a window or an eye shows as an
// empty cell; with colors the card paints every hole in the template's `holeColor`, or leaves it white when null.

// 6 by 15 halves (5 and 6 lat); column 5 touches the axis.

const STRAWBERRY: SymmetryTemplate = {
  id: "truskawka",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["jedzenie"],
  base: drawing([
    "......", // 0 leaves (part)
    "......", // 1
    "......", // 2
    ".ggggg", // 3
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

// 4 lat: 4 by 12 halves; column 3 touches the axis and keeps at least three filled cells for the hints.

const STRAWBERRY_4: SymmetryTemplate = {
  id: "truskawka",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["jedzenie"],
  base: drawing([
    "....", // 0 leaves (part)
    "....", // 1
    ".ggg", // 2
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

// 7 lat: 9 by 24 halves; column 8 touches the axis.

const STRAWBERRY_7: SymmetryTemplate = {
  id: "truskawka",
  width: 9,
  height: 24,
  holeColor: "yellow",
  categories: ["jedzenie"],
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
      variants: [drawing(["..ggggggg", ".gggggggg"], 4, 0), drawing(["...gggggg", "..ggggggg"], 4, 0)],
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

export const JEDZENIE: SymmetryObjectSizes = {
  half4: [STRAWBERRY_4],
  half6: [STRAWBERRY],
  half9: [STRAWBERRY_7],
};
