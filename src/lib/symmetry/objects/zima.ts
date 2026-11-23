import { drawing, type SymmetryObjectSizes, type SymmetryTemplate } from "../template-format.ts";

// Zima. Drawn from the approved mockup (context/changes/seasons-objects-characters/mockup-drawings.json, approved
// 2026-11-23): the first variant of every part gives the mockup picture. Half sizes as in the other catalog files:
// 4 by 12 (4 lat), 6 by 15 (5 and 6 lat), 9 by 24 (7 lat). The snowman moved here from Boże Narodzenie; the penguin
// stays in zwierzeta.ts with both categories. The category has a date window (see OBJECT_CATEGORIES).

const PLATEK_4: SymmetryTemplate = {
  id: "platek",
  width: 4,
  height: 12,
  holeColor: null,
  categories: ["zima"],
  base: drawing([".bbb", "....", "....", ".bbb"], 4),
  parts: [
    {
      id: "tips",
      variants: [
        drawing(["...b", "....", "....", "....", "....", "....", "....", "....", "....", "...b"], 1),
        drawing(["...b", "..bb", "....", "....", "....", "....", "....", "....", "....", "....", "..bb", "...b"]),
      ],
    },
    {
      id: "center",
      variants: [drawing(["bbbb", "bbbb"], 5), drawing(["bbb.", "bbb."], 5)],
    },
    {
      id: "diag",
      variants: [
        drawing(["b..b", "bb.b", "....", "....", "....", "....", "bb.b", "b..b"], 2),
        drawing(["...b", "...b", "....", "....", "....", "....", "...b", "...b"], 2),
      ],
    },
  ],
};

const PLATEK_6: SymmetryTemplate = {
  id: "platek",
  width: 6,
  height: 15,
  holeColor: null,
  categories: ["zima"],
  base: drawing(
    [
      ".....b",
      ".....b",
      ".bb..b",
      "..bb.b",
      "...bbb",
      "bbbbb.",
      "bbbbb.",
      "...bbb",
      "..bb.b",
      ".bb..b",
      ".....b",
      ".....b",
    ],
    1,
  ),
  parts: [
    {
      id: "tips",
      variants: [
        drawing([]),
        drawing(
          [
            "....b.",
            "......",
            "......",
            "......",
            "......",
            "......",
            "......",
            "......",
            "......",
            "......",
            "......",
            "....b.",
          ],
          1,
        ),
        drawing([
          "....b.",
          "....b.",
          "......",
          "......",
          "......",
          "......",
          "......",
          "......",
          "......",
          "......",
          "......",
          "......",
          "....b.",
          "....b.",
        ]),
      ],
    },
    {
      id: "center",
      variants: [drawing([]), drawing([".....b", ".....b"], 6)],
    },
    {
      id: "diag",
      variants: [
        drawing(
          [".b....", "......", "......", "......", "......", "......", "......", "......", "......", ".b...."],
          2,
        ),
        drawing([]),
        drawing(
          ["bb....", "......", "......", "......", "......", "......", "......", "......", "......", "bb...."],
          2,
        ),
      ],
    },
  ],
};

const PLATEK_9: SymmetryTemplate = {
  id: "platek",
  width: 9,
  height: 24,
  holeColor: null,
  categories: ["zima"],
  base: drawing(
    [
      "........b",
      ".bbb....b",
      ".bbb....b",
      "...bbb..b",
      "...bbb..b",
      ".....bbbb",
      ".....bbbb",
      ".......bb",
      "......bbb",
      ".bbbbbbb.",
      ".bbbbbbb.",
      "......bbb",
      ".......bb",
      ".....bbbb",
      ".....bbbb",
      "...bbb..b",
      "...bbb..b",
      ".bbb....b",
      ".bbb....b",
      "........b",
    ],
    2,
  ),
  parts: [
    {
      id: "tips",
      variants: [
        drawing(
          [
            "........b",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            "........b",
          ],
          1,
        ),
        drawing([
          "........b",
          "........b",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          "........b",
          "........b",
        ]),
        drawing(
          [
            ".......bb",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".......bb",
          ],
          1,
        ),
      ],
    },
    {
      id: "twigs",
      variants: [
        drawing([]),
        drawing(
          [
            "......bb.",
            "......bb.",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            ".........",
            "......bb.",
            "......bb.",
          ],
          2,
        ),
      ],
    },
    {
      id: "center",
      variants: [drawing(["........b", "........b"], 11), drawing([])],
    },
    {
      id: "ends",
      variants: [drawing(["b........", "b........"], 11), drawing([])],
    },
  ],
};

const CZAPKA_4: SymmetryTemplate = {
  id: "czapka",
  width: 4,
  height: 12,
  holeColor: null,
  categories: ["zima"],
  base: drawing(["..rr", ".rrr", "....", "....", "....", ".rrr"], 3),
  parts: [
    {
      id: "pompon",
      variants: [drawing(["...s", "..ss", "...s"]), drawing(["..ss", ".sss", "..ss"])],
    },
    {
      id: "pattern",
      variants: [
        drawing([".rrr", ".rrr", ".rrr"], 5),
        drawing([".rrr", ".yyy", ".rrr"], 5),
        drawing([".rrr", ".r.r", ".rrr"], 5),
      ],
    },
    {
      id: "cuff",
      variants: [drawing(["ssss", "ssss"], 9), drawing(["bbbb", "bbbb"], 9), drawing(["gggg", "gggg"], 9)],
    },
  ],
};

const CZAPKA_6: SymmetryTemplate = {
  id: "czapka",
  width: 6,
  height: 15,
  holeColor: null,
  categories: ["zima"],
  base: drawing(["...rrr", "..rrrr", ".rrrrr", "......", "......", "......", "......", ".rrrrr"], 3),
  parts: [
    {
      id: "pompon",
      variants: [drawing([".....s", "....ss", ".....s"]), drawing(["....ss", "...sss", "....ss"])],
    },
    {
      id: "pattern",
      variants: [
        drawing([".rrrrr", ".rrrrr", ".r.r.r", ".rrrrr"], 6),
        drawing([".rrrrr", ".yyyyy", ".yyyyy", ".rrrrr"], 6),
        drawing([".yyyyy", ".rrrrr", ".rrrrr", ".yyyyy"], 6),
      ],
    },
    {
      id: "cuff",
      variants: [
        drawing(["ssssss", "ssssss", "ssssss"], 11),
        drawing(["ssssss", "s.s.ss", "ssssss"], 11),
        drawing(["bbbbbb", "bbbbbb", "bbbbbb"], 11),
      ],
    },
  ],
};

const CZAPKA_9: SymmetryTemplate = {
  id: "czapka",
  width: 9,
  height: 24,
  holeColor: null,
  categories: ["zima"],
  base: drawing(
    [
      "......rrr",
      "....rrrrr",
      "...rrrrrr",
      "..rrrrrrr",
      "..rrrrrrr",
      ".rrrrrrrr",
      ".........",
      ".........",
      ".........",
      ".........",
      ".........",
      ".rrrrrrrr",
    ],
    6,
  ),
  parts: [
    {
      id: "pompon",
      variants: [
        drawing([".......ss", "......sss", "......sss", ".......ss"], 2),
        drawing([".......ss", "......sss", ".....ssss", ".....ssss", "......sss"], 1),
      ],
    },
    {
      id: "pattern",
      variants: [
        drawing([".rrrrrrrr", ".rrrrrrrr", ".rr.rr.rr", ".rrrrrrrr", ".rrrrrrrr"], 12),
        drawing([".rrrrrrrr", ".yyyyyyyy", ".yyyyyyyy", ".yyyyyyyy", ".rrrrrrrr"], 12),
        drawing([".yyyyyyyy", ".rrrrrrrr", ".gggggggg", ".rrrrrrrr", ".yyyyyyyy"], 12),
      ],
    },
    {
      id: "cuff",
      variants: [
        drawing(["sssssssss", "sssssssss", "sssssssss", "sssssssss"], 18),
        drawing(["sssssssss", "s.s.s.s.s", "s.s.s.s.s", "sssssssss"], 18),
        drawing(["bbbbbbbbb", "bbbbbbbbb", "bbbbbbbbb", "bbbbbbbbb"], 18),
      ],
    },
  ],
};

const IGLO_4: SymmetryTemplate = {
  id: "iglo",
  width: 4,
  height: 12,
  holeColor: "black",
  categories: ["zima"],
  base: drawing(["..ss", ".sss", "....", "ssss"], 3),
  parts: [
    {
      id: "bricks",
      variants: [
        drawing([".sss", "....", "ssss"], 5),
        drawing([".sss", "....", "s.ss"], 5),
        drawing([".s.s", "....", "ssss"], 5),
      ],
    },
    {
      id: "door",
      variants: [
        drawing(["ssss", "sss.", "sss.", "sss."], 8),
        drawing(["sss.", "sss.", "sss.", "sss."], 8),
        drawing(["ssbb", "ssb.", "ssb.", "ssb."], 8),
      ],
    },
  ],
};

const IGLO_6: SymmetryTemplate = {
  id: "iglo",
  width: 6,
  height: 15,
  holeColor: "black",
  categories: ["zima"],
  base: drawing(
    ["....ss", "..ssss", ".s....", ".ss.ss", "ssssss", "s..s..", "sss...", "s.....", "sss...", "sss..."],
    5,
  ),
  parts: [
    {
      id: "bricks",
      variants: [
        drawing(["..ssss", "...s..", "......", ".ss...", "......", ".ss..."], 7),
        drawing(["...s.."], 8),
        drawing([".ss...", "......", ".ss..."], 10),
      ],
    },
    {
      id: "door",
      variants: [
        drawing(["....ss", "...ss.", "...s..", "...s..", "...s.."], 10),
        drawing(["....ss", "...s..", "...s..", "...s..", "...s.."], 10),
        drawing(["....bb", "...bb.", "...b..", "...b..", "...b.."], 10),
      ],
    },
  ],
};

const IGLO_9: SymmetryTemplate = {
  id: "iglo",
  width: 9,
  height: 24,
  holeColor: "black",
  categories: ["zima"],
  base: drawing(
    [
      "......sss",
      "....sssss",
      "...ssssss",
      "..sssssss",
      ".........",
      ".ssssssss",
      "sssssssss",
      ".........",
      "sssssssss",
    ],
    8,
  ),
  parts: [
    {
      id: "bricks",
      variants: [
        drawing([".ssssssss", ".........", ".........", "sssssssss"], 12),
        drawing([".ss.ss.ss", ".........", ".........", "sssssssss"], 12),
        drawing([".ssss.sss", ".........", ".........", "ss.sss.ss"], 12),
      ],
    },
    {
      id: "door",
      variants: [
        drawing(["sssssssss", "sssssss..", "ssssss...", "ssssss...", "ssssss...", "ssssss...", "ssssss..."], 17),
        drawing(["sssssssss", "ssssss...", "ssssss...", "ssssss...", "ssssss...", "ssssss...", "ssssss..."], 17),
        drawing(["ssssssbbb", "sssssbb..", "sssssb...", "sssssb...", "sssssb...", "sssssb...", "sssssb..."], 17),
      ],
    },
  ],
};

const SZALIK_4: SymmetryTemplate = {
  id: "szalik",
  width: 4,
  height: 12,
  holeColor: null,
  categories: ["zima"],
  base: drawing([".rrr", "rr..", "rr..", ".rrr", "...r", "..rr", ".rr.", "....", "....", "rr.."], 1),
  parts: [
    {
      id: "stripes",
      variants: [drawing([".yy.", ".rr."], 8), drawing([".gg.", ".gg."], 8), drawing([".rr.", ".rr."], 8)],
    },
    {
      id: "fringe",
      variants: [drawing(["rr.."], 11), drawing([".r.."], 11), drawing([])],
    },
  ],
};

const SZALIK_6: SymmetryTemplate = {
  id: "szalik",
  width: 6,
  height: 15,
  holeColor: null,
  categories: ["zima"],
  base: drawing(
    [
      "..rrrr",
      ".rr...",
      ".rr...",
      "..rrrr",
      "....rr",
      "...rrr",
      "..rrr.",
      "..rrr.",
      "......",
      "......",
      "......",
      "......",
      ".rrr..",
    ],
    1,
  ),
  parts: [
    {
      id: "stripes",
      variants: [
        drawing(["..yyy.", ".rrr..", ".yyy..", ".rrr.."], 9),
        drawing(["..rrr.", ".ggg..", ".rrr..", ".ggg.."], 9),
        drawing(["..rrr.", ".rrr..", ".rrr..", ".rrr.."], 9),
      ],
    },
    {
      id: "fringe",
      variants: [drawing([".r.r.."], 14), drawing([".rrr.."], 14), drawing([])],
    },
  ],
};

const SZALIK_9: SymmetryTemplate = {
  id: "szalik",
  width: 9,
  height: 24,
  holeColor: null,
  categories: ["zima"],
  base: drawing(
    [
      "...rrrrrr",
      "..rrrrrrr",
      ".rrr.....",
      ".rrr.....",
      ".rrr.....",
      "..rrr....",
      "...rrrrrr",
      ".....rrrr",
      "......rrr",
      "......rrr",
      ".....rrrr",
      "....rrrr.",
      "....rrrr.",
      "...rrrr..",
      "...rrrr..",
    ],
    2,
  ),
  parts: [
    {
      id: "stripes",
      variants: [
        drawing(["...yyyy..", "..rrrr...", "..yyyy...", "..rrrr..."], 17),
        drawing(["...gggg..", "..rrrr...", "..gggg...", "..rrrr..."], 17),
        drawing(["...rrrr..", "..rrrr...", "..rrrr...", "..rrrr..."], 17),
      ],
    },
    {
      id: "fringe",
      variants: [
        drawing(["..rrrr...", "..r..r..."], 21),
        drawing(["..rrrr...", "..rrrr..."], 21),
        drawing(["..rrrr..."], 21),
      ],
    },
  ],
};

const NIEDZWIEDZ_4: SymmetryTemplate = {
  id: "niedzwiedz",
  width: 4,
  height: 12,
  holeColor: "black",
  categories: ["zima", "zwierzeta"],
  base: drawing([".sss", ".s.s", ".ssk", "..ss", ".sss", "....", "....", "ssss", ".sss", "....", "sss."], 1),
  parts: [
    {
      id: "ears",
      variants: [drawing([".s.."]), drawing(["ss.."])],
    },
    {
      id: "arms",
      variants: [drawing(["s.ss", "s.ss"], 6), drawing(["ssss", "ssss"], 6)],
    },
    {
      id: "legs",
      variants: [drawing([".ss."], 10), drawing([".sss"], 10)],
    },
  ],
};

const NIEDZWIEDZ_6: SymmetryTemplate = {
  id: "niedzwiedz",
  width: 6,
  height: 15,
  holeColor: "black",
  categories: ["zima", "zwierzeta"],
  base: drawing(
    [
      ".sssss",
      ".sssss",
      ".ss.ss",
      ".ssssk",
      "..ss..",
      "...sss",
      ".sssss",
      "ssssss",
      "sss.ss",
      "sss.ss",
      "ssssss",
      ".sssss",
      "......",
      "sssss.",
    ],
    1,
  ),
  parts: [
    {
      id: "head",
      variants: [
        drawing(["..ss..", "......", "......", "......", "......", "....ss"]),
        drawing(["..ss..", "......", "......", "......", "......", "....s."]),
        drawing([".sss..", "......", "......", "......", "......", "....ss"]),
        drawing([".sss..", "......", "......", "......", "......", "....s."]),
      ],
    },
    {
      id: "arms",
      variants: [drawing(["...s..", "...s.."], 9), drawing([])],
    },
    {
      id: "legs",
      variants: [drawing([".ssss."], 13), drawing([".sssss"], 13)],
    },
  ],
};

const NIEDZWIEDZ_9: SymmetryTemplate = {
  id: "niedzwiedz",
  width: 9,
  height: 24,
  holeColor: "black",
  categories: ["zima", "zwierzeta"],
  base: drawing(
    [
      "..sssssss",
      ".ssssssss",
      ".ssssssss",
      ".sss.ssss",
      ".sss.ssss",
      ".ssssssss",
      ".sssssskk",
      "..ssssskk",
      ".........",
      "....sssss",
      "..sssssss",
      ".ssssssss",
      "sssssssss",
      "sssssssss",
      ".........",
      ".........",
      ".........",
      "sssssssss",
      ".ssssssss",
      ".........",
      ".........",
      "sssssss..",
    ],
    2,
  ),
  parts: [
    {
      id: "ears",
      variants: [drawing(["..ss....."], 1), drawing([".sss....."], 1), drawing(["..ss.....", "..ss....."])],
    },
    {
      id: "mouth",
      variants: [drawing(["..sssssss"], 10), drawing(["..sssss.s"], 10)],
    },
    {
      id: "arms",
      variants: [
        drawing(["sss.sssss", "sss.sssss", "sss.sssss"], 16),
        drawing(["sssssssss", "sssssssss", "sssssssss"], 16),
      ],
    },
    {
      id: "legs",
      variants: [drawing([".ssssss..", "sssssss.."], 21), drawing([".ssssssss", ".sssssss."], 21)],
    },
  ],
};

const BALWANEK_4: SymmetryTemplate = {
  id: "balwanek",
  width: 4,
  height: 12,
  holeColor: "black",
  categories: ["zima"],
  base: drawing(["....", "....", "....", ".sss", ".s.o", ".sss", "..ss", ".sss", "....", "....", "ssss", ".sss"]),
  parts: [
    {
      id: "hat",
      variants: [
        drawing(["..kk", "..kk", ".kkk"]),
        drawing(["....", "..kk", ".kkk"]),
        drawing(["...k", "..kk", ".kkk"]),
      ],
    },
    {
      id: "buttons",
      variants: [drawing(["ssss", "sss."], 8), drawing(["sss.", "ssss"], 8)],
    },
  ],
};

const BALWANEK_6: SymmetryTemplate = {
  id: "balwanek",
  width: 6,
  height: 15,
  holeColor: "black",
  categories: ["zima"],
  base: drawing([
    "......",
    "......",
    "......",
    "......",
    "...sss",
    "..ss.o",
    "..ssss",
    "......",
    ".sssss",
    "ssssss",
    "......",
    "......",
    "......",
    "ssssss",
    ".sssss",
  ]),
  parts: [
    {
      id: "hat",
      variants: [drawing(["....kk", "....kk", "....kk", "..kkkk"]), drawing(["...kkk", "...kkk", "...kkk", ".kkkkk"])],
    },
    {
      id: "scarf",
      variants: [drawing(["...sss"], 7), drawing(["..rrrr"], 7)],
    },
    {
      id: "buttons",
      variants: [drawing(["sssss.", "ssssss", "sssss."], 10), drawing(["ssssss", "sssss.", "ssssss"], 10)],
    },
  ],
};

const BALWANEK_9: SymmetryTemplate = {
  id: "balwanek",
  width: 9,
  height: 24,
  holeColor: "black",
  categories: ["zima"],
  base: drawing([
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".....ssss",
    "....sssss",
    "....s.sss",
    "....sssso",
    "....sssss",
    ".....ssss",
    ".........",
    "...ssssss",
    "..sssssss",
    ".ssssssss",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    "..sssssss",
    "....sssss",
  ]),
  parts: [
    {
      id: "hat",
      variants: [
        drawing(["......kkk", "......kkk", "......kkk", "......kkk", "....kkkkk"]),
        drawing(["......kkk", "......kkk", "......rrr", "......kkk", "...kkkkkk"]),
        drawing([".........", ".........", "......kkk", "......kkk", "....kkkkk"]),
      ],
    },
    {
      id: "scarf",
      variants: [drawing(["....rrrrr"], 11), drawing(["....sssss"], 11)],
    },
    {
      id: "buttons",
      variants: [
        drawing([".sssssss.", "sssssssss", "sssssssss", "ssssssss.", "sssssssss", ".ssssssss", ".sssssss."], 15),
        drawing([".ssssssss", "ssssssss.", "sssssssss", "sssssssss", "ssssssss.", ".ssssssss", ".ssssssss"], 15),
      ],
    },
  ],
};

export const ZIMA: SymmetryObjectSizes = {
  half4: [PLATEK_4, CZAPKA_4, IGLO_4, SZALIK_4, NIEDZWIEDZ_4, BALWANEK_4],
  half6: [PLATEK_6, CZAPKA_6, IGLO_6, SZALIK_6, NIEDZWIEDZ_6, BALWANEK_6],
  half9: [PLATEK_9, CZAPKA_9, IGLO_9, SZALIK_9, NIEDZWIEDZ_9, BALWANEK_9],
};
