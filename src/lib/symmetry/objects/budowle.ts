import { drawing, type SymmetryObjectSizes, type SymmetryTemplate } from "../template-format.ts";

// Domy i budowle. Drawn from the approved mockup (context/changes/template-object-catalog/mockup-drawings.json): the first
// variant of every part gives the mockup picture. Half sizes: 4 by 12 (4 lat, column 3 touches the axis and keeps at
// least three cells for the hints), 6 by 15 (5 and 6 lat, column 5), 9 by 24 (7 lat, column 8).

const HOUSE_4: SymmetryTemplate = {
  id: "domek",
  width: 4,
  height: 10,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    "...r", // 0
    "..rr", // 1
    ".rrr", // 2
    "rrrr", // 3
    ".ooo", // 4
    "....", // 5 window (part)
    ".ooo", // 6
    ".oo.", // 7 door (part)
    ".oo.", // 8
    ".oo.", // 9
  ]),
  parts: [
    {
      id: "window",
      variants: [drawing(["o.o"], 5, 1), drawing(["oo."], 5, 1)],
    },
    {
      id: "door",
      variants: [drawing([".", ".", "."], 7, 3), drawing(["o", ".", "."], 7, 3)],
    },
  ],
};

const HOUSE_6: SymmetryTemplate = {
  id: "domek",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    ".....r", // 0
    "....rr", // 1
    "...rrr", // 2
    "..rrrr", // 3
    ".rrrrr", // 4
    "rrrrrr", // 5
    ".ooooo", // 6
    ".....o", // 7 window (part)
    ".....o", // 8
    ".ooooo", // 9
    ".ooooo", // 10
    ".oooo.", // 11 door (part)
    ".oooo.", // 12
    ".oooo.", // 13
    ".oooo.", // 14
  ]),
  parts: [
    {
      id: "window",
      variants: [drawing(["o..o", "o..o"], 7, 1), drawing(["o.o.", "o.o."], 7, 1)],
    },
    {
      id: "door",
      variants: [drawing([".", ".", ".", "."], 11, 5), drawing(["o", ".", ".", "."], 11, 5)],
    },
  ],
};

const HOUSE_9: SymmetryTemplate = {
  id: "domek",
  width: 9,
  height: 23,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    "........r", // 0
    ".......rr", // 1
    "......rrr", // 2
    ".....rrrr", // 3
    "....rrrrr", // 4
    "...rrrrrr", // 5
    "..rrrrrrr", // 6
    ".rrrrrrrr", // 7
    "rrrrrrrrr", // 8
    ".oooooooo", // 9
    ".oooooooo", // 10
    ".o...oooo", // 11 upper-window (part)
    ".o...oooo", // 12
    ".o...oooo", // 13
    ".oooooooo", // 14
    ".oooooooo", // 15
    ".oooooo..", // 16 door (part)
    ".o...oo..", // 17 lower-window (part)
    ".o...oo..", // 18
    ".o...oo..", // 19
    ".oooooo..", // 20
    ".oooooo..", // 21
    "kkkkkkk..", // 22
  ]),
  parts: [
    {
      id: "upper-window",
      variants: [drawing(["...", "...", "..."], 11, 2), drawing([".o.", "ooo", ".o."], 11, 2)],
    },
    {
      id: "lower-window",
      variants: [drawing(["...", "...", "..."], 17, 2), drawing([".o.", "ooo", ".o."], 17, 2)],
    },
    {
      id: "door",
      variants: [
        drawing(["..", "..", "..", "..", "..", ".."], 16, 7),
        drawing(["oo", "..", "..", "..", "..", ".."], 16, 7),
      ],
    },
  ],
};

const CASTLE_TOWER_4: SymmetryTemplate = {
  id: "wieza-zamku",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    "....", // 0 flag (part)
    "....", // 1
    "....", // 2 merlons (part)
    "ssss", // 3
    ".sss", // 4
    ".s..", // 5 window (part)
    ".s..", // 6
    ".sss", // 7
    ".sss", // 8
    ".s..", // 9
    ".s..", // 10
    ".s..", // 11
  ]),
  parts: [
    {
      id: "flag",
      variants: [drawing(["r", "k"], 0, 3), drawing([".", "."], 0, 3)],
    },
    {
      id: "merlons",
      variants: [drawing(["s.ss"], 2, 0), drawing(["ss.s"], 2, 0)],
    },
    {
      id: "window",
      variants: [drawing([".s", ".s"], 5, 2), drawing(["s.", "s."], 5, 2)],
    },
  ],
};

const CASTLE_TOWER_6: SymmetryTemplate = {
  id: "wieza-zamku",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    "......", // 0 flag (part)
    "......", // 1
    "s.s.ss", // 2
    "ssssss", // 3
    ".sssss", // 4
    ".sssss", // 5
    "......", // 6 windows (part)
    "......", // 7
    ".sssss", // 8
    ".sssss", // 9
    ".sssss", // 10
    ".sss..", // 11
    ".sss..", // 12
    ".sss..", // 13
    ".sss..", // 14
  ]),
  parts: [
    {
      id: "flag",
      variants: [drawing(["r", "k"], 0, 5), drawing([".", "."], 0, 5)],
    },
    {
      id: "windows",
      variants: [drawing(["ss.ss", "ss.ss"], 6, 1), drawing(["s.sss", "s.sss"], 6, 1)],
    },
  ],
};

const CASTLE_TOWER_9: SymmetryTemplate = {
  id: "wieza-zamku",
  width: 9,
  height: 24,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    ".........", // 0 flag (part)
    ".........", // 1
    ".........", // 2
    ".........", // 3 merlons (part)
    "sssssssss", // 4
    "sssssssss", // 5
    ".ssssssss", // 6
    ".ssssssss", // 7
    ".s...ssss", // 8 slits (part)
    ".s...ssss", // 9
    ".s...ssss", // 10
    ".ssssssss", // 11
    ".ssssssss", // 12
    ".ssssss..", // 13
    ".ssssss..", // 14
    ".ssssssss", // 15
    ".ssssssss", // 16
    ".ssssss..", // 17
    ".sssss...", // 18
    ".sssss...", // 19
    ".sssss...", // 20
    ".sssss...", // 21
    ".sssss...", // 22
    ".sssss...", // 23
  ]),
  parts: [
    {
      id: "flag",
      variants: [drawing(["rr", ".k", ".k"], 0, 7), drawing(["..", ".r", ".k"], 0, 7)],
    },
    {
      id: "merlons",
      variants: [drawing(["ss..ss..s"], 3, 0), drawing(["s.s.s.s.s"], 3, 0)],
    },
    {
      id: "slits",
      variants: [drawing(["ss.", "ss.", "ss."], 8, 2), drawing([".ss", ".ss", ".ss"], 8, 2)],
    },
  ],
};

const LIGHTHOUSE_4: SymmetryTemplate = {
  id: "latarnia",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    "...r", // 0
    "..rr", // 1
    "....", // 2 lamp (part)
    ".kkk", // 3
    "....", // 4 stripes (part)
    "....", // 5
    "....", // 6
    "....", // 7
    "....", // 8
    "....", // 9
    "....", // 10
    "kkkk", // 11
  ]),
  parts: [
    {
      id: "lamp",
      variants: [drawing(["y."], 2, 2), drawing(["yy"], 2, 2), drawing([".yyy"], 2)],
    },
    {
      id: "stripes",
      variants: [
        drawing([".rr", ".ss", ".rr", "sss", "rrr", "sss", "rrr"], 4, 1),
        drawing([".ss", ".rr", ".ss", "rrr", "sss", "rrr", "sss"], 4, 1),
      ],
    },
  ],
};

const LIGHTHOUSE_6: SymmetryTemplate = {
  id: "latarnia",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    "......", // 0 roof (part)
    "......", // 1
    "......", // 2
    "......", // 3 lamp (part)
    "..kkkk", // 4
    "...rrr", // 5
    "...sss", // 6
    "...rrr", // 7
    "..ssss", // 8
    "..rrrr", // 9
    "..ssss", // 10
    "..rrrr", // 11
    ".sssss", // 12
    ".rrrrr", // 13
    "kkkkkk", // 14
  ]),
  parts: [
    {
      id: "roof",
      variants: [
        drawing(["..r", ".rr", "rrr"], 0, 3),
        drawing(["...", "..r", "rrr"], 0, 3),
        drawing(["....rr", "...rrr"], 1),
      ],
    },
    {
      id: "lamp",
      variants: [drawing(["y.."], 3, 3), drawing(["y.y"], 3, 3)],
    },
  ],
};

const LIGHTHOUSE_9: SymmetryTemplate = {
  id: "latarnia",
  width: 9,
  height: 22,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    ".........", // 0 roof (part)
    ".........", // 1
    ".........", // 2
    ".........", // 3
    ".........", // 4 lamp (part)
    ".........", // 5
    ".........", // 6
    "...kkkkkk", // 7
    ".....rrrr", // 8
    ".....rrrr", // 9
    ".....ssss", // 10
    ".....ssss", // 11
    "....rrrrr", // 12
    "....rrrrr", // 13
    "....sssss", // 14
    "....sssss", // 15
    "...rrrrrr", // 16
    "...rrrrrr", // 17
    "...ssssss", // 18
    "..rrrrr..", // 19 door (part)
    "..rrrrr..", // 20
    "kkkkkkk..", // 21
  ]),
  parts: [
    {
      id: "roof",
      variants: [
        drawing(["...r", "..rr", ".rrr", "rrrr"], 0, 5),
        drawing(["....", "...r", "..rr", "rrrr"], 0, 5),
        drawing(["........r", "........r", ".....rrrr"], 1),
      ],
    },
    {
      id: "lamp",
      variants: [drawing(["k..", "k..", "k.."], 4, 6), drawing(["k.k", "k.k", "k.k"], 4, 6)],
    },
    {
      id: "door",
      variants: [drawing(["..", "..", ".."], 19, 7), drawing(["rr", "..", ".."], 19, 7)],
    },
  ],
};

const SKYSCRAPER_4: SymmetryTemplate = {
  id: "wiezowiec",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    "....", // 0 antenna (part)
    "....", // 1
    "..ss", // 2
    ".sss", // 3
    "....", // 4 windows (part)
    "....", // 5
    "....", // 6
    "....", // 7
    "....", // 8
    ".sss", // 9
    ".sss", // 10
    ".s..", // 11
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing(["r", "k"], 0, 3), drawing([".", "k"], 0, 3)],
    },
    {
      id: "windows",
      variants: [
        drawing(["s.s", "sss", "s.s", "sss", "s.s"], 4, 1),
        drawing(["sss", "s.s", "sss", "s.s", "sss"], 4, 1),
      ],
    },
  ],
};

const SKYSCRAPER_6: SymmetryTemplate = {
  id: "wiezowiec",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    "......", // 0 antenna (part)
    "......", // 1
    "......", // 2
    "...sss", // 3
    "..ssss", // 4
    ".sssss", // 5
    "......", // 6 windows (part)
    "......", // 7
    "......", // 8
    "......", // 9
    "......", // 10
    "......", // 11
    "......", // 12
    ".sssss", // 13
    ".sss..", // 14
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing(["r", "k", "k"], 0, 5), drawing([".", ".", "r"], 0, 5)],
    },
    {
      id: "windows",
      variants: [
        drawing(["s.s.s", "sssss", "s.s.s", "sssss", "s.s.s", "sssss", "s.s.s"], 6, 1),
        drawing(["sss.s", "sssss", "s.sss", "sssss", "sss.s", "sssss", "s.sss"], 6, 1),
      ],
    },
  ],
};

const SKYSCRAPER_9: SymmetryTemplate = {
  id: "wiezowiec",
  width: 9,
  height: 24,
  holeColor: "yellow",
  categories: ["budowle"],
  base: drawing([
    ".........", // 0 antenna (part)
    ".........", // 1
    ".........", // 2
    ".........", // 3
    "......sss", // 4
    "......sss", // 5
    "....sssss", // 6
    ".........", // 7 top-windows (part)
    "....sssss", // 8
    "..sssssss", // 9
    ".........", // 10 windows (part)
    ".........", // 11
    ".........", // 12
    ".........", // 13
    ".........", // 14
    ".........", // 15
    ".........", // 16
    ".........", // 17
    ".........", // 18
    ".........", // 19
    ".........", // 20
    ".........", // 21
    "..sssss..", // 22
    "..sssss..", // 23
  ]),
  parts: [
    {
      id: "antenna",
      variants: [drawing(["r", "k", "k", "k"], 0, 8), drawing([".", ".", "r", "k"], 0, 8)],
    },
    {
      id: "top-windows",
      variants: [drawing(["s.s.s"], 7, 4), drawing(["sssss"], 7, 4)],
    },
    {
      id: "windows",
      variants: [
        drawing(
          [
            "s.s.s.s",
            "sssssss",
            "s.s.s.s",
            "sssssss",
            "s.s.s.s",
            "sssssss",
            "s.s.s.s",
            "sssssss",
            "s.s.s.s",
            "sssssss",
            "s.s.s.s",
            "sssssss",
          ],
          10,
          2,
        ),
        drawing(
          [
            "ss.s.ss",
            "sssssss",
            "ss.s.ss",
            "sssssss",
            "ss.s.ss",
            "sssssss",
            "ss.s.ss",
            "sssssss",
            "ss.s.ss",
            "sssssss",
            "ss.s.ss",
            "sssssss",
          ],
          10,
          2,
        ),
      ],
    },
  ],
};

export const BUDOWLE: SymmetryObjectSizes = {
  half4: [HOUSE_4, CASTLE_TOWER_4, LIGHTHOUSE_4, SKYSCRAPER_4],
  half6: [HOUSE_6, CASTLE_TOWER_6, LIGHTHOUSE_6, SKYSCRAPER_6],
  half9: [HOUSE_9, CASTLE_TOWER_9, LIGHTHOUSE_9, SKYSCRAPER_9],
};
