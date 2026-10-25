import { drawing, type SymmetryObjectSizes, type SymmetryTemplate } from "../template-format.ts";

// Kosmos i maszyny. Holes ("." inside the outline) are part of the shape. Without colors a window or an eye shows as an
// empty cell; with colors the card paints every hole in the template's `holeColor`, or leaves it white when null.

// 6 by 15 halves (5 and 6 lat); column 5 touches the axis.

const ROCKET: SymmetryTemplate = {
  id: "rakieta",
  width: 6,
  height: 15,
  holeColor: "blue",
  categories: ["kosmos"],
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
    "....oy", // 12 flame
    "....oy", // 13
    ".....o", // 14
  ]),
  parts: [
    {
      id: "nose",
      variants: [drawing([".....r", "....rr", "...rrr"], 0, 0), drawing(["....rr", "...rrr", "...rrr"], 0, 0)],
    },
    {
      id: "window",
      variants: [drawing(["..", ".."], 4, 4), drawing(["b.", "b."], 4, 4)],
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
  holeColor: "yellow",
  categories: ["kosmos"],
  base: drawing([
    "......", // 0 antenna (part)
    "......", // 1
    "..bbbb", // 2 head
    "..b...", // 3 eyes (part)
    "..bbbb", // 4
    "..bb..", // 5 mouth
    "..bbbb", // 6
    "....ss", // 7 neck
    "..bbbb", // 8 body, arms (part) on columns 0-1
    "..bbbb", // 9
    "..bbbb", // 10
    "..bbbb", // 11
    "..ss..", // 12 legs
    "..ss..", // 13
    ".kkk..", // 14 feet
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing([".r", ".s"], 0, 4), drawing(["r.", "s."], 0, 4)],
    },
    {
      id: "eyes",
      variants: [drawing([".bb"], 3, 3), drawing(["..b"], 3, 3)],
    },
    {
      id: "arms",
      variants: [
        drawing(["..", "..", "..", "ss", "s.", "s.", "s."], 5, 0),
        drawing(["s.", "s.", "s.", "ss", "..", "..", ".."], 5, 0),
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
  holeColor: "blue",
  categories: ["kosmos"],
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
    "..oy", // 10 flame
    "...o", // 11
  ]),
  parts: [
    {
      id: "nose",
      variants: [drawing(["...r", "..rr", "..rr"]), drawing(["...r", "...r", "..rr"])],
    },
    {
      id: "window",
      variants: [drawing([]), drawing(["b"], 4, 3)],
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
  holeColor: "yellow",
  categories: ["kosmos"],
  base: drawing([
    "....", // 0 antenna (part)
    "....", // 1
    ".bbb", // 2 head
    ".b..", // 3 eyes (part)
    ".bbb", // 4
    ".bbb", // 5
    "...s", // 6 neck
    ".bbb", // 7 body, arms (part) on column 0
    ".bbb", // 8
    ".bbb", // 9
    ".bbb", // 10
    "..kk", // 11 feet
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing(["r", "s"], 0, 3), drawing([".", "s"], 0, 3)],
    },
    {
      id: "eyes",
      variants: [drawing(["b"], 3, 3), drawing(["b"], 3, 2)],
    },
    {
      id: "arms",
      variants: [drawing(["s", "s", "s"], 7, 0), drawing(["s", "s", "s"], 8, 0)],
    },
  ],
};

// 7 lat: richer shapes drawn on the 9 by 24 half of an 18 by 24 grid. Column 8 touches the axis.

const ROCKET_7: SymmetryTemplate = {
  id: "rakieta",
  width: 9,
  height: 24,
  holeColor: "blue",
  categories: ["kosmos"],
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
        drawing(["......ooy", ".......oy", "........o"], 21, 0),
        drawing(["......ooy", "......oyy", ".......oy"], 21, 0),
      ],
    },
  ],
};

const ROBOT_7: SymmetryTemplate = {
  id: "robot",
  width: 9,
  height: 23,
  holeColor: "yellow",
  categories: ["kosmos"],
  base: drawing([
    ".........", // 0 antenna (part)
    ".........", // 1
    ".........", // 2
    "...bbbbbb", // 3 head
    "...bbbbbb", // 4
    "...b.....", // 5 eyes (part) on columns 4-8
    "...b.....", // 6
    "...bbbbbb", // 7
    "...b.b.b.", // 8 mouth
    "...bbbbbb", // 9
    "......sss", // 10 neck
    "...bbbbbb", // 11 body, arms (part) on columns 0-2
    "...bbbbbb", // 12
    "...bb....", // 13 chest panel (part) on columns 5-8
    "...bb....", // 14
    "...bb....", // 15
    "...bbbbbb", // 16
    "...bbbbbb", // 17
    "...bbbbbb", // 18
    "...bbbbbb", // 19
    "....ssss.", // 20 legs
    "....ssss.", // 21
    "...kkkk..", // 22 feet
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing([".r", ".s"], 0, 7), drawing(["r.", "s.", "s."], 0, 7)],
    },
    {
      id: "eyes",
      variants: [drawing(["b..bb", "b..bb"], 5, 4), drawing(["bbbb.", "bbbb."], 5, 4)],
    },
    {
      id: "panel",
      variants: [drawing(["bbbb", "b.bb", "bbbb"], 13, 5), drawing(["b.bb", "bbbb", "b.bb"], 13, 5)],
    },
    {
      id: "arms",
      variants: [
        drawing(["s..", "s..", "ss.", ".ss", "..s"], 11, 0),
        drawing(["..s", ".ss", ".s.", ".s.", ".s.", "ss.", "s.."], 12, 0),
      ],
    },
  ],
};

export const KOSMOS: SymmetryObjectSizes = {
  half4: [ROCKET_4, ROBOT_4],
  half6: [ROCKET, ROBOT],
  half9: [ROCKET_7, ROBOT_7],
};
