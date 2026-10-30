import { drawing, type SymmetryObjectSizes, type SymmetryTemplate } from "../template-format.ts";

// Przyroda. Drawn from the approved mockup (context/changes/template-object-catalog/mockup-drawings.json): the first
// variant of every part gives the mockup picture. Half sizes: 4 by 12 (4 lat, column 3 touches the axis and keeps at
// least three cells for the hints), 6 by 15 (5 and 6 lat, column 5), 9 by 24 (7 lat, column 8).

const TREE_4: SymmetryTemplate = {
  id: "choinka",
  width: 4,
  height: 11,
  holeColor: "red",
  categories: ["przyroda"],
  base: drawing([
    "....", // 0 star (part)
    "...g", // 1
    "..gg", // 2
    "....", // 3 upper-bauble (part)
    ".ggg", // 4
    "..gg", // 5
    ".ggg", // 6
    "....", // 7 lower-bauble (part)
    "gggg", // 8
    "...n", // 9
    "...n", // 10
  ]),
  parts: [
    {
      id: "star",
      variants: [drawing(["y"], 0, 3), drawing(["."], 0, 3)],
    },
    {
      id: "upper-bauble",
      variants: [drawing(["gg."], 3, 1), drawing(["ggg"], 3, 1)],
    },
    {
      id: "lower-bauble",
      variants: [drawing(["gg.g"], 7, 0), drawing(["ggg."], 7, 0), drawing([".ggg"], 7)],
    },
  ],
};

const TREE_6: SymmetryTemplate = {
  id: "choinka",
  width: 6,
  height: 15,
  holeColor: "red",
  categories: ["przyroda"],
  base: drawing([
    "......", // 0 star (part)
    ".....g", // 1
    "....gg", // 2
    "...ggg", // 3
    "..gg.g", // 4
    "..gggg", // 5
    "...ggg", // 6
    "..gggg", // 7
    "......", // 8 middle-baubles (part)
    "gggggg", // 9
    "..gggg", // 10
    "......", // 11 lower-baubles (part)
    "gggggg", // 12
    "....nn", // 13
    "....nn", // 14
  ]),
  parts: [
    {
      id: "star",
      variants: [drawing(["y"], 0, 5), drawing(["."], 0, 5)],
    },
    {
      id: "middle-baubles",
      variants: [drawing(["ggg.g"], 8, 1), drawing(["gg.gg"], 8, 1), drawing(["..gggg"], 8)],
    },
    {
      id: "lower-baubles",
      variants: [drawing(["gggg."], 11, 1), drawing(["gg.gg"], 11, 1)],
    },
  ],
};

const TREE_9: SymmetryTemplate = {
  id: "choinka",
  width: 9,
  height: 24,
  holeColor: "red",
  categories: ["przyroda"],
  base: drawing([
    ".........", // 0 star (part)
    ".........", // 1
    ".........", // 2
    "........g", // 3
    ".......gg", // 4
    "......ggg", // 5
    ".....gg.g", // 6
    "....ggggg", // 7
    "...gggggg", // 8
    ".....gggg", // 9
    "....ggggg", // 10
    ".........", // 11 middle-baubles (part)
    "..ggggggg", // 12
    ".ggggggg.", // 13
    "ggggggggg", // 14
    "....ggggg", // 15
    "...gggggg", // 16
    ".........", // 17 lower-baubles (part)
    ".........", // 18
    "g........", // 19
    "ggggggggg", // 20
    ".......nn", // 21
    ".......nn", // 22
    "......nnn", // 23
  ]),
  parts: [
    {
      id: "star",
      variants: [drawing([".y", "yy", ".y"], 0, 7), drawing(["..", ".y", ".y"], 0, 7)],
    },
    {
      id: "middle-baubles",
      variants: [drawing(["gg.ggg"], 11, 3), drawing(["ggggg."], 11, 3)],
    },
    {
      id: "lower-baubles",
      variants: [
        drawing([".ggg.ggg", "gggggggg", "ggg.gggg"], 17, 1),
        drawing([".gggggg.", "gggggggg", "gg.ggggg"], 17, 1),
        drawing(["...ggg.gg", "ggggggggg", ".ggg.gggg"], 17),
      ],
    },
  ],
};

const TULIP_4: SymmetryTemplate = {
  id: "tulipan",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["przyroda"],
  base: drawing([
    "....", // 0 petals (part)
    ".rrr", // 1
    ".rrr", // 2
    "..rr", // 3
    "...g", // 4
    "...g", // 5 leaves (part)
    "...g", // 6
    "...g", // 7
    "oooo", // 8
    ".ooo", // 9
    ".ooo", // 10
    "..oo", // 11
  ]),
  parts: [
    {
      id: "petals",
      variants: [drawing([".r.r"], 0, 0), drawing(["...r"], 0, 0), drawing(["..rr"])],
    },
    {
      id: "leaves",
      variants: [drawing(["..g", ".gg"], 5, 0), drawing(["...", ".gg"], 5, 0)],
    },
  ],
};

const TULIP_6: SymmetryTemplate = {
  id: "tulipan",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["przyroda"],
  base: drawing([
    "......", // 0 petals (part)
    "..rrrr", // 1
    ".rrrrr", // 2
    ".rrrrr", // 3
    ".rrrrr", // 4
    "..rrrr", // 5
    "...rrr", // 6
    ".....g", // 7
    ".....g", // 8 leaves (part)
    ".....g", // 9
    ".....g", // 10
    ".....g", // 11
    ".ooooo", // 12
    "..oooo", // 13
    "..oooo", // 14
  ]),
  parts: [
    {
      id: "petals",
      variants: [drawing(["r..r"], 0, 2), drawing(["...r"], 0, 2), drawing(["...r.r"])],
    },
    {
      id: "leaves",
      variants: [drawing(["g..", "gg.", ".gg"], 8, 2), drawing(["...", "...", ".gg"], 8, 2)],
    },
  ],
};

const TULIP_9: SymmetryTemplate = {
  id: "tulipan",
  width: 9,
  height: 24,
  holeColor: "yellow",
  categories: ["przyroda"],
  base: drawing([
    ".........", // 0 petals (part)
    ".........", // 1
    "...rrrrrr", // 2
    "..rrrrrrr", // 3
    "..rrrrrrr", // 4
    "..rrrrrrr", // 5
    "..rrrrrrr", // 6
    "...rrrrrr", // 7
    "....rrrrr", // 8
    "......rrr", // 9
    "........g", // 10
    "........g", // 11
    "........g", // 12 leaves (part)
    "........g", // 13
    "........g", // 14
    "........g", // 15
    "........g", // 16
    "........g", // 17
    ".........", // 18 pot (part)
    ".........", // 19
    "..ooooooo", // 20
    "..ooooooo", // 21
    "...oooooo", // 22
    "...oooooo", // 23
  ]),
  parts: [
    {
      id: "petals",
      variants: [
        drawing(["r....r", "rr..rr"], 0, 3),
        drawing(["......", "r....r"], 0, 3),
        drawing([".....r..r", "....rr..r"]),
      ],
    },
    {
      id: "leaves",
      variants: [
        drawing(["gg....", "ggg...", ".ggg..", "..gggg", "...ggg"], 12, 2),
        drawing(["......", "......", "......", "..gggg", "...ggg"], 12, 2),
      ],
    },
    {
      id: "pot",
      variants: [drawing(["oooooooo", "oooooooo"], 18, 1), drawing(["rrrrrrrr", "oooooooo"], 18, 1)],
    },
  ],
};

const TOADSTOOL_4: SymmetryTemplate = {
  id: "muchomor",
  width: 4,
  height: 12,
  holeColor: null,
  categories: ["przyroda"],
  base: drawing([
    "..rr", // 0
    ".rrr", // 1
    "....", // 2 dots (part)
    "....", // 3
    "....", // 4
    "rrrr", // 5
    "..ss", // 6
    "....", // 7 ring (part)
    "..ss", // 8
    "..ss", // 9
    ".sss", // 10
    "gggg", // 11
  ]),
  parts: [
    {
      id: "dots",
      variants: [drawing(["rr.r", "rrrr", "r.rr"], 2, 0), drawing(["r.rr", "rrrr", "rr.r"], 2, 0)],
    },
    {
      id: "ring",
      variants: [drawing([".ss"], 7, 1), drawing(["sss"], 7, 1)],
    },
  ],
};

const TOADSTOOL_6: SymmetryTemplate = {
  id: "muchomor",
  width: 6,
  height: 15,
  holeColor: null,
  categories: ["przyroda"],
  base: drawing([
    "...rrr", // 0
    "..rrrr", // 1
    "......", // 2 dots (part)
    "......", // 3
    "......", // 4
    "rrrrrr", // 5
    "...sss", // 6
    "...sss", // 7
    "...sss", // 8
    "......", // 9 ring (part)
    "...sss", // 10
    "...sss", // 11
    "...sss", // 12
    "..ssss", // 13
    "gggggg", // 14
  ]),
  parts: [
    {
      id: "dots",
      variants: [drawing([".rr.rr", "rrrrrr", "r.rrr."], 2, 0), drawing([".r.rrr", "rrrrrr", "rrr.rr"], 2, 0)],
    },
    {
      id: "ring",
      variants: [drawing(["ssss"], 9, 2), drawing([".sss"], 9, 2)],
    },
  ],
};

const TOADSTOOL_9: SymmetryTemplate = {
  id: "muchomor",
  width: 9,
  height: 22,
  holeColor: null,
  categories: ["przyroda"],
  base: drawing([
    ".....rrrr", // 0
    "...rrrrrr", // 1
    ".........", // 2 upper-dots (part)
    ".........", // 3
    ".........", // 4
    ".........", // 5 lower-dots (part)
    ".........", // 6
    ".........", // 7
    "rrrrrrrrr", // 8
    "...ssssss", // 9
    ".....ssss", // 10
    ".....ssss", // 11
    ".....ssss", // 12
    ".........", // 13 ring (part)
    ".....ssss", // 14
    ".....ssss", // 15
    ".....ssss", // 16
    ".....ssss", // 17
    "....sssss", // 18
    "...ssssss", // 19
    "...ssssss", // 20
    "ggggggggg", // 21
  ]),
  parts: [
    {
      id: "upper-dots",
      variants: [
        drawing([".rrr.rrr", "rrrrrrrr", "r..rrrrr"], 2, 1),
        drawing(["rrrrr..r", "rrrrrrrr", "rrr..rrr"], 2, 1),
      ],
    },
    {
      id: "lower-dots",
      variants: [
        drawing(["rrrrrr.rr", "rrrrrrrrr", "rr.rrrr.."], 5, 0),
        drawing(["rrrr.rrrr", "rrrrrrrrr", "r.rrrrr.."], 5, 0),
      ],
    },
    {
      id: "ring",
      variants: [drawing(["sssss"], 13, 4), drawing([".ssss"], 13, 4)],
    },
  ],
};

const CACTUS_4: SymmetryTemplate = {
  id: "kaktus",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["przyroda"],
  base: drawing([
    "....", // 0 flower (part)
    "..gg", // 1
    "..gg", // 2 arms (part)
    "..gg", // 3
    "..gg", // 4
    "..gg", // 5
    "..gg", // 6
    "..gg", // 7
    "oooo", // 8
    ".ooo", // 9
    ".ooo", // 10
    "..oo", // 11
  ]),
  parts: [
    {
      id: "flower",
      variants: [drawing(["r"], 0, 3), drawing(["."], 0, 3)],
    },
    {
      id: "arms",
      variants: [drawing(["g.", "g.", "gg"], 2, 0), drawing(["..", "g.", "gg"], 2, 0)],
    },
  ],
};

const CACTUS_6: SymmetryTemplate = {
  id: "kaktus",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["przyroda"],
  base: drawing([
    "......", // 0 flower (part)
    "......", // 1
    "...ggg", // 2
    "...ggg", // 3 arms (part)
    "...ggg", // 4
    "...ggg", // 5
    "...ggg", // 6
    "...ggg", // 7
    "...ggg", // 8
    "...ggg", // 9
    "...ggg", // 10
    ".ooooo", // 11
    ".ooooo", // 12
    "..oooo", // 13
    "..oooo", // 14
  ]),
  parts: [
    {
      id: "flower",
      variants: [drawing([".r", "gg"], 0, 4), drawing(["..", ".g"], 0, 4)],
    },
    {
      id: "arms",
      variants: [drawing([".g.", "gg.", "gg.", "ggg"], 3, 0), drawing(["...", ".g.", "gg.", "ggg"], 3, 0)],
    },
  ],
};

const CACTUS_9: SymmetryTemplate = {
  id: "kaktus",
  width: 9,
  height: 24,
  holeColor: "yellow",
  categories: ["przyroda"],
  base: drawing([
    ".........", // 0 flower (part)
    ".........", // 1
    "......ggg", // 2
    ".....gggg", // 3
    ".....gggg", // 4
    ".....gggg", // 5 arms (part)
    ".....gggg", // 6
    ".....gggg", // 7
    ".....gggg", // 8
    ".....gggg", // 9
    ".....gggg", // 10
    ".....gggg", // 11
    ".....gggg", // 12
    ".....gggg", // 13
    ".........", // 14 spines (part)
    ".........", // 15
    ".........", // 16
    ".....gggg", // 17
    ".oooooooo", // 18
    ".oooooooo", // 19
    "..ooooooo", // 20
    "..ooooooo", // 21
    "...oooooo", // 22
    "...oooooo", // 23
  ]),
  parts: [
    {
      id: "flower",
      variants: [drawing([".r", "rr"], 0, 7), drawing(["..", ".r"], 0, 7)],
    },
    {
      id: "arms",
      variants: [
        drawing([".g...", "gg...", "gg...", "gg...", "gg...", "gg...", "ggggg", ".gggg"], 5, 0),
        drawing([".....", ".....", ".....", ".g...", "gg...", "gg...", "ggggg", ".gggg"], 5, 0),
      ],
    },
    {
      id: "spines",
      variants: [drawing(["gggg", "gggg", "gggg"], 14, 5), drawing(["g.gg", "gggg", "gg.g"], 14, 5)],
    },
  ],
};

export const PRZYRODA: SymmetryObjectSizes = {
  half4: [TREE_4, TULIP_4, TOADSTOOL_4, CACTUS_4],
  half6: [TREE_6, TULIP_6, TOADSTOOL_6, CACTUS_6],
  half9: [TREE_9, TULIP_9, TOADSTOOL_9, CACTUS_9],
};
