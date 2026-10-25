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

// Drawn from the approved mockup (context/changes/template-object-catalog/mockup-drawings.json): the first variant
// of every part gives the mockup picture.

const BALLOON_4: SymmetryTemplate = {
  id: "balon",
  width: 4,
  height: 11,
  holeColor: "blue",
  categories: ["kosmos"],
  base: drawing([
    "..rr", // 0
    "....", // 1 stripes (part)
    "....", // 2
    "....", // 3
    "....", // 4
    "....", // 5
    "..ry", // 6
    "..k.", // 7
    "..k.", // 8
    "....", // 9 basket (part)
    "....", // 10
  ]),
  parts: [
    {
      id: "stripes",
      variants: [
        drawing([".ryy", "rryy", "rryy", "rryy", ".ryy"], 1, 0),
        drawing([".byy", "bbyy", "bbyy", "bbyy", ".byy"], 1, 0),
      ],
    },
    {
      id: "basket",
      variants: [drawing(["nn", "nn"], 9, 2), drawing(["nn", ".n"], 9, 2)],
    },
  ],
};

const BALLOON_6: SymmetryTemplate = {
  id: "balon",
  width: 6,
  height: 14,
  holeColor: "blue",
  categories: ["kosmos"],
  base: drawing([
    "......", // 0 top (part)
    "..rryy", // 1
    ".rrryy", // 2
    "rrrryy", // 3
    "rrrryy", // 4
    "rrrryy", // 5
    ".rrryy", // 6
    "..rryy", // 7
    "...ryy", // 8
    "....ry", // 9
    "....k.", // 10
    "....k.", // 11
    "......", // 12 basket (part)
    "......", // 13
  ]),
  parts: [
    {
      id: "top",
      variants: [drawing(["ryy"], 0, 3), drawing(["..."], 0, 3)],
    },
    {
      id: "basket",
      variants: [drawing(["nnn", "nnn"], 12, 3), drawing(["nnn", ".nn"], 12, 3)],
    },
  ],
};

const BALLOON_9: SymmetryTemplate = {
  id: "balon",
  width: 9,
  height: 23,
  holeColor: "blue",
  categories: ["kosmos"],
  base: drawing([
    ".........", // 0 top (part)
    "...rrryyy", // 1
    "..rrrryyy", // 2
    ".........", // 3 stripes (part)
    ".........", // 4
    ".........", // 5
    ".........", // 6
    ".........", // 7
    ".........", // 8
    ".........", // 9
    ".........", // 10
    "..rrrryyy", // 11
    "...rrryyy", // 12
    "....rryyy", // 13
    ".....ryyy", // 14
    "......ryy", // 15
    "......k..", // 16
    "......k..", // 17
    "......k..", // 18
    ".........", // 19 basket (part)
    ".........", // 20
    ".........", // 21
    ".........", // 22
  ]),
  parts: [
    {
      id: "top",
      variants: [drawing(["ryyy"], 0, 5), drawing(["...."], 0, 5)],
    },
    {
      id: "stripes",
      variants: [
        drawing(
          [".brrrryyy", ".brrrryyy", "bbrrrryyy", "bbrrrryyy", "bbrrrryyy", "bbrrrryyy", ".brrrryyy", ".brrrryyy"],
          3,
          0,
        ),
        drawing(
          [".gyyyyrrr", ".gyyyyrrr", "ggyyyyrrr", "ggyyyyrrr", "ggyyyyrrr", "ggyyyyrrr", ".gyyyyrrr", ".gyyyyrrr"],
          3,
          0,
        ),
      ],
    },
    {
      id: "basket",
      variants: [drawing(["nnnn", "nnnn", "nnnn", ".nnn"], 19, 5), drawing([".nnn", "nnnn", "nnnn", ".nnn"], 19, 5)],
    },
  ],
};

const UFO_4: SymmetryTemplate = {
  id: "ufo",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["kosmos"],
  base: drawing([
    "....", // 0 antenna (part)
    "....", // 1
    "..bb", // 2
    ".bb.", // 3
    "ssss", // 4
    "....", // 5 lights (part)
    ".sss", // 6
    "....", // 7 beam (part)
    "....", // 8
    "....", // 9
    "....", // 10
    "....", // 11
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing(["r", "s"], 0, 3), drawing([".", "r"], 0, 3)],
    },
    {
      id: "lights",
      variants: [drawing(["sysy"], 5, 0), drawing(["ysys"], 5, 0)],
    },
    {
      id: "beam",
      variants: [
        drawing(["..yy", ".yyy", ".yyy", "yyyy", "yyyy"], 7, 0),
        drawing(["..yy", "..yy", ".yyy", ".yyy", "yyyy"], 7, 0),
      ],
    },
  ],
};

const UFO_6: SymmetryTemplate = {
  id: "ufo",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["kosmos"],
  base: drawing([
    "......", // 0 antenna (part)
    "......", // 1
    "...bbb", // 2
    "..bb.b", // 3
    "..bbbb", // 4
    ".sssss", // 5
    "sysysy", // 6
    ".sssss", // 7
    "......", // 8 beam (part)
    "......", // 9
    "......", // 10
    "......", // 11
    "......", // 12
    "......", // 13
    "......", // 14
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing(["r", "s"], 0, 5), drawing([".", "r"], 0, 5)],
    },
    {
      id: "beam",
      variants: [
        drawing(["...yyy", "...yyy", "..yyyy", "..yyyy", ".yyyyy", ".yyyyy", "yyyyyy"], 8, 0),
        drawing(["....yy", "....yy", "...yyy", "...yyy", "..yyyy", "..yyyy", ".yyyyy"], 8, 0),
      ],
    },
  ],
};

const UFO_9: SymmetryTemplate = {
  id: "ufo",
  width: 9,
  height: 23,
  holeColor: "yellow",
  categories: ["kosmos"],
  base: drawing([
    ".........", // 0 antenna (part)
    ".........", // 1
    ".........", // 2
    "......bbb", // 3
    ".........", // 4 window (part)
    ".....bbbb", // 5
    "...ssssss", // 6
    ".ssssssss", // 7
    ".........", // 8 lights (part)
    ".ssssssss", // 9
    "...ssssss", // 10
    ".....yyyy", // 11
    ".....yyyy", // 12
    "....yyyyy", // 13
    "....yyyyy", // 14
    "...yyyyyy", // 15
    "...yyyyyy", // 16
    "..yyyyyyy", // 17
    "..yyyyyyy", // 18
    ".yyyyyyyy", // 19
    ".yyyyyyyy", // 20
    "yyyyyyyyy", // 21
    "yyyyyyyyy", // 22
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing(["r", "s", "s"], 0, 8), drawing([".", "r", "s"], 0, 8)],
    },
    {
      id: "window",
      variants: [drawing(["bb.b"], 4, 5), drawing(["bbb."], 4, 5)],
    },
    {
      id: "lights",
      variants: [drawing(["sysysysys"], 8, 0), drawing(["ysysysysy"], 8, 0)],
    },
  ],
};

export const KOSMOS: SymmetryObjectSizes = {
  half4: [ROCKET_4, ROBOT_4, BALLOON_4, UFO_4],
  half6: [ROCKET, ROBOT, BALLOON_6, UFO_6],
  half9: [ROCKET_7, ROBOT_7, BALLOON_9, UFO_9],
};
