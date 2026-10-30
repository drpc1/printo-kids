import { drawing, type SymmetryObjectSizes, type SymmetryTemplate } from "../template-format.ts";

// Zwierzęta. Drawn from the approved mockup (context/changes/template-object-catalog/mockup-drawings.json): the first
// variant of every part gives the mockup picture. Half sizes: 4 by 12 (4 lat, column 3 touches the axis and keeps at
// least three cells for the hints), 6 by 15 (5 and 6 lat, column 5), 9 by 24 (7 lat, column 8).

const OWL_4: SymmetryTemplate = {
  id: "sowa",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["zwierzeta"],
  base: drawing([
    "....", // 0 ears (part)
    "....", // 1
    "nnnn", // 2
    "n..n", // 3 eyes (part)
    "n..n", // 4
    "nnno", // 5
    "nnnn", // 6
    "nyyy", // 7
    "nyyy", // 8
    "nnyy", // 9
    ".nnn", // 10
    "..o.", // 11
  ]),
  parts: [
    {
      id: "ears",
      variants: [drawing(["n.", "nn"], 0, 0), drawing(["..", "n."], 0, 0)],
    },
    {
      id: "eyes",
      variants: [drawing(["..", ".."], 3, 1), drawing(["..", "n."], 3, 1)],
    },
  ],
};

const OWL_6: SymmetryTemplate = {
  id: "sowa",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["zwierzeta"],
  base: drawing([
    "......", // 0 ears (part)
    "......", // 1
    "nnnnnn", // 2
    "nnnnnn", // 3
    "n...nn", // 4 eyes (part)
    "n...nn", // 5
    "n...nn", // 6
    "nnnnno", // 7
    "nnnnnn", // 8
    "nnyyyy", // 9
    "nnyyyy", // 10
    "nnyyyy", // 11
    ".nnyyy", // 12
    "..nnnn", // 13
    "......", // 14 feet (part)
  ]),
  parts: [
    {
      id: "ears",
      variants: [drawing(["n.", "nn"], 0, 0), drawing(["..", "n."], 0, 0)],
    },
    {
      id: "eyes",
      variants: [drawing(["...", "...", "..."], 4, 1), drawing(["...", "..n", "..."], 4, 1)],
    },
    {
      id: "feet",
      variants: [drawing(["o.o"], 14, 3), drawing(["oo."], 14, 3)],
    },
  ],
};

const OWL_9: SymmetryTemplate = {
  id: "sowa",
  width: 9,
  height: 23,
  holeColor: "yellow",
  categories: ["zwierzeta"],
  base: drawing([
    ".........", // 0 ears (part)
    ".........", // 1
    ".........", // 2
    "nnnnnnnnn", // 3
    "nnnnnnnnn", // 4
    "n.....nnn", // 5 eyes (part)
    "n.....nnn", // 6
    "n.....nnn", // 7
    "n.....nnn", // 8
    "nnnnnnnoo", // 9
    "nnnnnnnno", // 10
    "nnnnnnnnn", // 11
    "nnnyyyyyy", // 12
    "nn.......", // 13 belly (part)
    "nn.......", // 14
    "nn.......", // 15
    "nn.......", // 16
    "nn.......", // 17
    "nnnyyyyyy", // 18
    ".nnnyyyyy", // 19
    "..nnnnnnn", // 20
    "...nnnnnn", // 21
    ".........", // 22 feet (part)
  ]),
  parts: [
    {
      id: "ears",
      variants: [drawing(["n..", "nn.", "nnn"], 0, 0), drawing(["...", "n..", "nn."], 0, 0)],
    },
    {
      id: "eyes",
      variants: [
        drawing(["n....", ".....", ".....", "n...."], 5, 1),
        drawing(["n....", "...nn", "...nn", "n...."], 5, 1),
      ],
    },
    {
      id: "belly",
      variants: [
        drawing(["yyyyyyy", "yyyyyyy", "yyyynyy", "yyyyyyy", "yynyyyy"], 13, 2),
        drawing(["yyyyyyy", "yyyyyyy", "yyyyyyy", "yyyyyyy", "yyyyyyy"], 13, 2),
      ],
    },
    {
      id: "feet",
      variants: [drawing(["oo.oo."], 22, 3), drawing(["ooo.o."], 22, 3)],
    },
  ],
};

const LADYBUG_4: SymmetryTemplate = {
  id: "biedronka",
  width: 4,
  height: 11,
  holeColor: "black",
  categories: ["zwierzeta"],
  base: drawing([
    "....", // 0 antennae (part)
    "..kk", // 1
    ".kkk", // 2
    "rrrk", // 3
    "...k", // 4 spots (part)
    "...k", // 5
    "...k", // 6
    "...k", // 7
    "...k", // 8
    ".rrk", // 9
    "..rk", // 10
  ]),
  parts: [
    {
      id: "antennae",
      variants: [drawing([".k"], 0, 1), drawing([".."], 0, 1)],
    },
    {
      id: "spots",
      variants: [
        drawing(["r.r", "rrr", "rr.", "rrr", "rr."], 4, 0),
        drawing(["rrr", "r.r", "rrr", "r.r", "rrr"], 4, 0),
      ],
    },
  ],
};

const LADYBUG_6: SymmetryTemplate = {
  id: "biedronka",
  width: 6,
  height: 15,
  holeColor: "black",
  categories: ["zwierzeta"],
  base: drawing([
    "......", // 0 antennae (part)
    "......", // 1
    "...kkk", // 2
    "..kkkk", // 3
    ".rrrrk", // 4
    "rrrrrk", // 5
    "r....k", // 6 spots (part)
    "r....k", // 7
    "r....k", // 8
    "r....k", // 9
    "r....k", // 10
    "rrrrrk", // 11
    ".rrrrk", // 12
    "..rrrk", // 13
    "....rk", // 14
  ]),
  parts: [
    {
      id: "antennae",
      variants: [drawing([".k.", ".k."], 0, 2), drawing(["..k", "..k"], 0, 2)],
    },
    {
      id: "spots",
      variants: [
        drawing(["..rr", "..rr", "rrrr", "rr..", "rr.."], 6, 1),
        drawing(["rr..", "rr..", "rrrr", "..rr", "..rr"], 6, 1),
      ],
    },
  ],
};

const LADYBUG_9: SymmetryTemplate = {
  id: "biedronka",
  width: 9,
  height: 23,
  holeColor: "black",
  categories: ["zwierzeta"],
  base: drawing([
    ".........", // 0 antennae (part)
    ".........", // 1
    ".........", // 2
    ".....kkkk", // 3
    "....kkkkk", // 4
    "...kkkkkk", // 5
    "..rrrrrrk", // 6
    ".rrrrrrrk", // 7
    "rrrrrrrrk", // 8
    "r.......k", // 9 upper-spots (part)
    "r.......k", // 10
    "r.......k", // 11
    "r.......k", // 12
    "r.......k", // 13
    "rrrrrrrrk", // 14
    "r.......k", // 15 lower-spots (part)
    "r.......k", // 16
    "r.......k", // 17
    "........k", // 18
    "........k", // 19
    "..rrrrrrk", // 20
    "...rrrrrk", // 21
    ".....rrrk", // 22
  ]),
  parts: [
    {
      id: "antennae",
      variants: [drawing([".k.", ".k.", ".kk"], 0, 3), drawing(["k..", "k..", "kkk"], 0, 3)],
    },
    {
      id: "upper-spots",
      variants: [
        drawing(["r..rrrr", "r..rrrr", "rrrrrrr", "rrrr..r", "rrrr..r"], 9, 1),
        drawing(["rrrr..r", "rrrr..r", "rrrrrrr", "r..rrrr", "r..rrrr"], 9, 1),
      ],
    },
    {
      id: "lower-spots",
      variants: [
        drawing(["..rrrrr", "..rrrrr", "rrrrrrr", "rrrr..r", "rrrr..r"], 15, 1),
        drawing(["rrr..rr", "rrr..rr", "rrrrrrr", "rrrrrrr", "rrrrrrr"], 15, 1),
      ],
    },
  ],
};

const PENGUIN_4: SymmetryTemplate = {
  id: "pingwin",
  width: 4,
  height: 12,
  holeColor: null,
  categories: ["zwierzeta"],
  base: drawing([
    "..kk", // 0
    ".kkk", // 1
    ".k.k", // 2 eye (part)
    ".kko", // 3
    "kkkk", // 4
    "kk..", // 5
    "k...", // 6
    "k...", // 7
    "kk..", // 8
    ".k..", // 9
    ".kkk", // 10
    "....", // 11 feet (part)
  ]),
  parts: [
    {
      id: "eye",
      variants: [drawing(["."], 2, 2), drawing(["k"], 2, 2)],
    },
    {
      id: "feet",
      variants: [drawing(["oo"], 11, 1), drawing(["o."], 11, 1), drawing(["..oo"], 11)],
    },
  ],
};

const PENGUIN_6: SymmetryTemplate = {
  id: "pingwin",
  width: 6,
  height: 15,
  holeColor: null,
  categories: ["zwierzeta"],
  base: drawing([
    "...kkk", // 0
    "..kkkk", // 1
    "..k.kk", // 2 eye (part)
    "..kkoo", // 3
    "..kkko", // 4
    ".kkkkk", // 5
    "kkk...", // 6
    "......", // 7 flippers (part)
    "......", // 8
    "......", // 9
    ".k....", // 10
    ".kk...", // 11
    "..kkkk", // 12
    "..kkkk", // 13
    "......", // 14 feet (part)
  ]),
  parts: [
    {
      id: "eye",
      variants: [drawing(["."], 2, 3), drawing(["k"], 2, 3)],
    },
    {
      id: "flippers",
      variants: [
        drawing(["kk", "kk", "kk"], 7, 0),
        drawing(["kk", "k.", "kk"], 7, 0),
        drawing(["k.....", "kk....", "kk...."], 7),
      ],
    },
    {
      id: "feet",
      variants: [drawing(["ooo"], 14, 1), drawing([".oo"], 14, 1), drawing([".oooo."], 14)],
    },
  ],
};

const PENGUIN_9: SymmetryTemplate = {
  id: "pingwin",
  width: 9,
  height: 23,
  holeColor: null,
  categories: ["zwierzeta"],
  base: drawing([
    ".....kkkk", // 0
    "....kkkkk", // 1
    "...kkkkkk", // 2
    "...k...kk", // 3 eye (part)
    "...kkkk..", // 4 beak (part)
    "...kkkk..", // 5
    "..kkkkkkk", // 6
    ".kkkk....", // 7
    "kkkk.....", // 8
    "kkk......", // 9
    "kkk......", // 10
    "kk.......", // 11
    "kk.......", // 12
    "kk.......", // 13
    "kk.......", // 14
    "kkk......", // 15
    ".kk......", // 16
    ".kk......", // 17
    "..kk.....", // 18
    "..kkk....", // 19
    "...kkkkkk", // 20
    "...kkkkkk", // 21
    ".........", // 22 feet (part)
  ]),
  parts: [
    {
      id: "eye",
      variants: [drawing(["k.k"], 3, 4), drawing([".kk"], 3, 4)],
    },
    {
      id: "beak",
      variants: [drawing(["oo", "ko"], 4, 7), drawing(["oo", "oo"], 4, 7)],
    },
    {
      id: "feet",
      variants: [drawing(["oooo"], 22, 2), drawing([".ooo"], 22, 2), drawing(["...oooooo"], 22)],
    },
  ],
};

const CAT_4: SymmetryTemplate = {
  id: "kot",
  width: 4,
  height: 12,
  holeColor: "green",
  categories: ["zwierzeta"],
  base: drawing([
    "....", // 0 ears (part)
    "....", // 1
    "oooo", // 2
    "o..o", // 3 eyes (part)
    "oooo", // 4
    "ooor", // 5
    ".ooo", // 6
    "..oo", // 7
    ".ooo", // 8
    "oooo", // 9
    "oooo", // 10
    "....", // 11 paws (part)
  ]),
  parts: [
    {
      id: "ears",
      variants: [drawing(["o.", "oo"], 0, 0), drawing(["..", ".o"], 0, 0), drawing([".o..", ".oo."])],
    },
    {
      id: "eyes",
      variants: [drawing([".o"], 3, 1), drawing(["o."], 3, 1)],
    },
    {
      id: "paws",
      variants: [drawing(["ooo."], 11, 0), drawing([".oo."], 11, 0), drawing(["oo.o"], 11)],
    },
  ],
};

const CAT_6: SymmetryTemplate = {
  id: "kot",
  width: 6,
  height: 15,
  holeColor: "green",
  categories: ["zwierzeta"],
  base: drawing([
    "......", // 0 ears (part)
    "......", // 1
    "......", // 2
    "oooooo", // 3
    "oooooo", // 4
    "o..ooo", // 5 eyes (part)
    "o..ooo", // 6
    "oooooo", // 7
    "ooooor", // 8
    ".ooooo", // 9
    "...ooo", // 10
    "..oooo", // 11
    ".ooooo", // 12
    ".ooooo", // 13
    "......", // 14 paws (part)
  ]),
  parts: [
    {
      id: "ears",
      variants: [
        drawing(["o..", "oo.", "ooo"], 0, 0),
        drawing(["...", "o..", "oo."], 0, 0),
        drawing([".o....", ".oo..."], 1),
      ],
    },
    {
      id: "eyes",
      variants: [drawing(["..", ".."], 5, 1), drawing(["..", "o."], 5, 1)],
    },
    {
      id: "paws",
      variants: [drawing([".ooo."], 14, 1), drawing(["oo.oo"], 14, 1), drawing(["oo..oo"], 14)],
    },
  ],
};

const CAT_9: SymmetryTemplate = {
  id: "kot",
  width: 9,
  height: 24,
  holeColor: "green",
  categories: ["zwierzeta"],
  base: drawing([
    ".........", // 0 ears (part)
    ".........", // 1
    ".........", // 2
    ".........", // 3
    "ooooooooo", // 4
    "ooooooooo", // 5
    "oo...oooo", // 6 eyes (part)
    "oo...oooo", // 7
    "oo...oooo", // 8
    "ooooooooo", // 9
    "ooooooo..", // 10 nose (part)
    "ooooooooo", // 11
    ".oooooooo", // 12
    "..ooooooo", // 13
    "....ooooo", // 14
    "...oooooo", // 15
    "..ooooooo", // 16
    ".oooooooo", // 17
    ".oooooooo", // 18
    ".oooooooo", // 19
    ".oooooooo", // 20
    ".oooooooo", // 21
    ".........", // 22 paws (part)
    ".........", // 23
  ]),
  parts: [
    {
      id: "ears",
      variants: [
        drawing(["o...", "oo..", "ooo.", "oooo"], 0, 0),
        drawing(["....", "o...", "oo..", "ooo."], 0, 0),
        drawing([".o.......", ".oo......", ".ooo....."], 1),
      ],
    },
    {
      id: "eyes",
      variants: [drawing(["...", "...", "..."], 6, 2), drawing(["...", "..o", "..o"], 6, 2)],
    },
    {
      id: "nose",
      variants: [drawing(["rr"], 10, 7), drawing(["or"], 10, 7)],
    },
    {
      id: "paws",
      variants: [
        drawing(["oooo", "oooo"], 22, 2),
        drawing(["oo.o", "oo.o"], 22, 2),
        drawing(["..ooo.oo.", "..ooo.oo."], 22),
      ],
    },
  ],
};

const RABBIT_4: SymmetryTemplate = {
  id: "krolik",
  width: 4,
  height: 12,
  holeColor: "black",
  categories: ["zwierzeta"],
  base: drawing([
    "....", // 0 ears (part)
    "....", // 1
    "....", // 2
    "ssss", // 3
    "s..s", // 4 eye (part)
    "sssr", // 5
    ".sss", // 6
    "..ss", // 7
    ".sss", // 8
    "ssss", // 9
    "ssss", // 10
    "....", // 11 paws (part)
  ]),
  parts: [
    {
      id: "ears",
      variants: [drawing(["s.", "s.", "ss"], 0, 1), drawing([".s", ".s", "ss"], 0, 1)],
    },
    {
      id: "eye",
      variants: [drawing([".s"], 4, 1), drawing(["s."], 4, 1)],
    },
    {
      id: "paws",
      variants: [drawing([".ss."], 11, 0), drawing(["ss.."], 11, 0)],
    },
  ],
};

const RABBIT_6: SymmetryTemplate = {
  id: "krolik",
  width: 6,
  height: 15,
  holeColor: "black",
  categories: ["zwierzeta"],
  base: drawing([
    "......", // 0 ears (part)
    "......", // 1
    "......", // 2
    "......", // 3
    "......", // 4
    ".sssss", // 5
    "ssssss", // 6
    "ss..ss", // 7 eye (part)
    "ssssss", // 8
    "sssssr", // 9
    ".sssss", // 10
    "..ssss", // 11
    ".sssss", // 12
    "ssssss", // 13
    "......", // 14 paws (part)
  ]),
  parts: [
    {
      id: "ears",
      variants: [
        drawing(["ss.", "sr.", "sr.", "sr.", "sss"], 0, 1),
        drawing(["...", "...", "ss.", "sr.", "sss"], 0, 1),
      ],
    },
    {
      id: "eye",
      variants: [drawing([".s"], 7, 2), drawing(["s."], 7, 2)],
    },
    {
      id: "paws",
      variants: [drawing([".ss.ss"], 14, 0), drawing(["ss..ss"], 14, 0)],
    },
  ],
};

const RABBIT_9: SymmetryTemplate = {
  id: "krolik",
  width: 9,
  height: 23,
  holeColor: "black",
  categories: ["zwierzeta"],
  base: drawing([
    ".........", // 0 ears (part)
    ".........", // 1
    ".........", // 2
    ".........", // 3
    ".........", // 4
    ".........", // 5
    ".........", // 6
    "..sss....", // 7
    ".ssssssss", // 8
    "sssssssss", // 9
    "ss..sssss", // 10 eye (part)
    "ss..sssss", // 11
    "sssssssss", // 12
    "sssssss..", // 13 nose (part)
    ".ssssssss", // 14
    "..sssssss", // 15
    "...ssssss", // 16
    "..sssssss", // 17
    ".ssssssss", // 18
    "sssssssss", // 19
    "sssssssss", // 20
    "sssssssss", // 21
    ".........", // 22 paws (part)
  ]),
  parts: [
    {
      id: "ears",
      variants: [
        drawing([".ss", "srs", "srs", "srs", "srs", "srs", "sss"], 0, 1),
        drawing(["...", "...", ".ss", "srs", "srs", "srs", "sss"], 0, 1),
      ],
    },
    {
      id: "eye",
      variants: [drawing(["..", ".."], 10, 2), drawing([".s", ".s"], 10, 2)],
    },
    {
      id: "nose",
      variants: [drawing(["rr"], 13, 7), drawing(["sr"], 13, 7)],
    },
    {
      id: "paws",
      variants: [drawing([".sss"], 22, 0), drawing(["ss.s"], 22, 0)],
    },
  ],
};

export const ZWIERZETA: SymmetryObjectSizes = {
  half4: [OWL_4, LADYBUG_4, PENGUIN_4, CAT_4, RABBIT_4],
  half6: [OWL_6, LADYBUG_6, PENGUIN_6, CAT_6, RABBIT_6],
  half9: [OWL_9, LADYBUG_9, PENGUIN_9, CAT_9, RABBIT_9],
};
