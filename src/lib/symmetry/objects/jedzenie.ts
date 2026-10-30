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

// Drawn from the approved mockup (context/changes/template-object-catalog/mockup-drawings.json): the first variant
// of every part gives the mockup picture.

const CUPCAKE_4: SymmetryTemplate = {
  id: "babeczka",
  width: 4,
  height: 10,
  holeColor: null,
  categories: ["jedzenie"],
  base: drawing([
    "....", // 0 cherry (part)
    "..yy", // 1
    ".yyy", // 2
    "yyyy", // 3
    "yyyy", // 4
    ".bbb", // 5
    "....", // 6 wrapper (part)
    "....", // 7
    "....", // 8
    ".bbb", // 9
  ]),
  parts: [
    {
      id: "cherry",
      variants: [drawing(["r"], 0, 3), drawing(["."], 0, 3)],
    },
    {
      id: "wrapper",
      variants: [drawing(["b.b", "b.b", "b.b"], 6, 1), drawing(["bbb", "b.b", "bbb"], 6, 1)],
    },
  ],
};

const CUPCAKE_6: SymmetryTemplate = {
  id: "babeczka",
  width: 6,
  height: 13,
  holeColor: null,
  categories: ["jedzenie"],
  base: drawing([
    "......", // 0 cherry (part)
    "......", // 1
    "...yyy", // 2
    "..yyyy", // 3
    ".yyyyy", // 4
    "......", // 5 frosting (part)
    "......", // 6
    ".bbbbb", // 7
    "......", // 8 wrapper (part)
    "......", // 9
    "......", // 10
    "......", // 11
    ".bbbbb", // 12
  ]),
  parts: [
    {
      id: "cherry",
      variants: [drawing([".r", "rr"], 0, 4), drawing(["..", ".r"], 0, 4)],
    },
    {
      id: "frosting",
      variants: [drawing(["yyyyyy", "yyyyyy"], 5, 0), drawing([".yyyyy", "yyyyyy"], 5, 0)],
    },
    {
      id: "wrapper",
      variants: [
        drawing(["b.b.b", "b.b.b", "b.b.b", "b.b.b"], 8, 1),
        drawing(["bb.bb", "bb.bb", "bb.bb", "bb.bb"], 8, 1),
      ],
    },
  ],
};

const CUPCAKE_9: SymmetryTemplate = {
  id: "babeczka",
  width: 9,
  height: 20,
  holeColor: null,
  categories: ["jedzenie"],
  base: drawing([
    ".........", // 0 cherry (part)
    ".........", // 1
    ".........", // 2
    "......yyy", // 3
    ".....yyyy", // 4
    "....yyyyy", // 5
    "...yyyyyy", // 6
    "..yyyyyyy", // 7
    ".yyyyyyyy", // 8
    ".........", // 9 frosting (part)
    ".........", // 10
    ".........", // 11
    ".bbbbbbbb", // 12
    ".........", // 13 wrapper (part)
    ".........", // 14
    ".........", // 15
    ".........", // 16
    ".........", // 17
    ".bbbbbbbb", // 18
    "..bbbbbbb", // 19
  ]),
  parts: [
    {
      id: "cherry",
      variants: [drawing([".k", "rr", "rr"], 0, 7), drawing(["..", ".r", ".r"], 0, 7)],
    },
    {
      id: "frosting",
      variants: [
        drawing(["yyyyyyyyy", "yyyyyyyyy", ".yyyyyyyy"], 9, 0),
        drawing(["yyyyyyyyy", "yyyyyyyyy", "yyyyyyyyy"], 9, 0),
      ],
    },
    {
      id: "wrapper",
      variants: [
        drawing(["b.bb.bb.", "b.bb.bb.", "b.bb.bb.", "b.bb.bb.", "b.bb.bb."], 13, 1),
        drawing(["bb.bb.bb", "bb.bb.bb", "bb.bb.bb", "bb.bb.bb", "bb.bb.bb"], 13, 1),
      ],
    },
  ],
};

const PEAR_4: SymmetryTemplate = {
  id: "gruszka",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["jedzenie"],
  base: drawing([
    "...n", // 0 leaf (part)
    "...n", // 1
    "..yy", // 2
    "..yy", // 3
    ".yyy", // 4
    ".yyy", // 5
    "yyyy", // 6
    "yyyy", // 7
    "yyyy", // 8
    "yyyy", // 9
    "....", // 10 bottom (part)
    "....", // 11
  ]),
  parts: [
    {
      id: "leaf",
      variants: [drawing(["..", "gg"], 0, 1), drawing([".g", "gg"], 0, 1)],
    },
    {
      id: "bottom",
      variants: [drawing([".yyy", "..yy"], 10, 0), drawing(["yyyy", ".yyy"], 10, 0)],
    },
  ],
};

const PEAR_6: SymmetryTemplate = {
  id: "gruszka",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["jedzenie"],
  base: drawing([
    "......", // 0 stem (part)
    "......", // 1
    "......", // 2
    "....yy", // 3
    "...yyy", // 4
    "...yyy", // 5
    "..yyyy", // 6
    ".yyyyy", // 7
    "yyyyyy", // 8
    "yyyyyy", // 9
    "yyyyyy", // 10
    "yyyyyy", // 11
    "......", // 12 bottom (part)
    "......", // 13
    "......", // 14
  ]),
  parts: [
    {
      id: "stem",
      variants: [drawing(["..n", "..n", "ggn"], 0, 3), drawing(["...", "..n", ".gn"], 0, 3)],
    },
    {
      id: "bottom",
      variants: [drawing([".yyyyy", "..yyyy", "...yyy"], 12, 0), drawing(["yyyyyy", ".yyyyy", "..yyyy"], 12, 0)],
    },
  ],
};

const PEAR_9: SymmetryTemplate = {
  id: "gruszka",
  width: 9,
  height: 22,
  holeColor: "yellow",
  categories: ["jedzenie"],
  base: drawing([
    ".........", // 0 stem (part)
    ".........", // 1
    "........n", // 2 leaf (part)
    "........n", // 3
    "......yyy", // 4
    "......yyy", // 5
    ".....yyyy", // 6
    ".....yyyy", // 7
    "....yyyyy", // 8
    "...yyyyyy", // 9
    "..yyyyyyy", // 10
    ".yyyyyyyy", // 11
    "yyyyyyyyy", // 12
    "yyyyyyyyy", // 13
    "yyyyyyyyy", // 14
    "yyyyyyyyy", // 15
    "yyyyyyyyy", // 16
    "yyyyyyyyy", // 17
    ".........", // 18 bottom (part)
    ".........", // 19
    ".........", // 20
    ".........", // 21
  ]),
  parts: [
    {
      id: "stem",
      variants: [drawing(["n", "n"], 0, 8), drawing([".", "n"], 0, 8)],
    },
    {
      id: "leaf",
      variants: [drawing([".gg.", "gggg"], 2, 4), drawing(["....", "..gg"], 2, 4)],
    },
    {
      id: "bottom",
      variants: [
        drawing([".yyyyyyyy", "..yyyyyyy", "...yyyyyy", ".....yyyy"], 18, 0),
        drawing(["yyyyyyyyy", ".yyyyyyyy", "..yyyyyyy", "....yyyyy"], 18, 0),
      ],
    },
  ],
};

const CARROT_4: SymmetryTemplate = {
  id: "marchewka",
  width: 4,
  height: 12,
  holeColor: "yellow",
  categories: ["jedzenie"],
  base: drawing([
    "....", // 0 leaves (part)
    "....", // 1
    "..gg", // 2
    ".ooo", // 3
    ".ooo", // 4
    ".ooo", // 5
    "..oo", // 6
    "..oo", // 7
    "..oo", // 8
    "....", // 9 tip (part)
    "....", // 10
    "....", // 11
  ]),
  parts: [
    {
      id: "leaves",
      variants: [drawing([".g.g", ".ggg"], 0, 0), drawing(["...g", "..gg"], 0, 0)],
    },
    {
      id: "tip",
      variants: [drawing(["o", "o", "o"], 9, 3), drawing(["o", "o", "."], 9, 3)],
    },
  ],
};

const CARROT_6: SymmetryTemplate = {
  id: "marchewka",
  width: 6,
  height: 15,
  holeColor: "yellow",
  categories: ["jedzenie"],
  base: drawing([
    "......", // 0 leaves (part)
    "......", // 1
    "..gggg", // 2
    ".ooooo", // 3
    ".ooooo", // 4
    "......", // 5 ridges (part)
    "......", // 6
    "......", // 7
    "...ooo", // 8
    "...ooo", // 9
    "...ooo", // 10
    "....oo", // 11
    "....oo", // 12
    "......", // 13 tip (part)
    "......", // 14
  ]),
  parts: [
    {
      id: "leaves",
      variants: [drawing(["g.g", "g.g"], 0, 3), drawing(["..g", ".gg"], 0, 3)],
    },
    {
      id: "ridges",
      variants: [drawing(["oooo", "oooo", "oooo"], 5, 2), drawing(["oooo", "oo.o", "oooo"], 5, 2)],
    },
    {
      id: "tip",
      variants: [drawing(["o", "o"], 13, 5), drawing(["o", "."], 13, 5)],
    },
  ],
};

const CARROT_9: SymmetryTemplate = {
  id: "marchewka",
  width: 9,
  height: 24,
  holeColor: "yellow",
  categories: ["jedzenie"],
  base: drawing([
    ".........", // 0 leaves (part)
    ".........", // 1
    ".........", // 2
    "....ggggg", // 3
    "......ggg", // 4
    "..ooooooo", // 5
    ".oooooooo", // 6
    ".oooooooo", // 7
    "..ooooooo", // 8
    ".........", // 9 ridges (part)
    ".........", // 10
    ".........", // 11
    ".........", // 12
    "...oooooo", // 13
    "....ooooo", // 14
    "....ooooo", // 15
    "....oo.oo", // 16
    ".....oooo", // 17
    ".....oooo", // 18
    "......ooo", // 19
    "......ooo", // 20
    ".........", // 21 tip (part)
    ".........", // 22
    ".........", // 23
  ]),
  parts: [
    {
      id: "leaves",
      variants: [drawing(["g...g", "g.g.g", "g.g.g"], 0, 4), drawing(["....g", "..g.g", "g.g.g"], 0, 4)],
    },
    {
      id: "ridges",
      variants: [
        drawing(["oo.oooo", "ooooooo", ".oooooo", ".ooo.oo"], 9, 2),
        drawing(["ooooo.o", "ooooooo", ".oo.ooo", ".oooooo"], 9, 2),
      ],
    },
    {
      id: "tip",
      variants: [drawing(["oo", "oo", ".o"], 21, 7), drawing(["oo", ".o", ".."], 21, 7)],
    },
  ],
};

const PINEAPPLE_4: SymmetryTemplate = {
  id: "ananas",
  width: 4,
  height: 12,
  holeColor: "brown",
  categories: ["jedzenie"],
  base: drawing([
    "....", // 0 crown (part)
    "....", // 1
    "..gg", // 2
    ".yyy", // 3
    "yyyy", // 4
    "....", // 5 scales (part)
    "....", // 6
    "....", // 7
    "....", // 8
    "....", // 9
    "yyyy", // 10
    ".yyy", // 11
  ]),
  parts: [
    {
      id: "crown",
      variants: [drawing([".g.g", ".ggg"], 0, 0), drawing(["g..g", "gggg"], 0, 0)],
    },
    {
      id: "scales",
      variants: [
        drawing(["y.yy", "yyyy", "yy.y", "yyyy", "y.yy"], 5, 0),
        drawing(["yy.y", "yyyy", "y.yy", "yyyy", "yy.y"], 5, 0),
      ],
    },
  ],
};

const PINEAPPLE_6: SymmetryTemplate = {
  id: "ananas",
  width: 6,
  height: 15,
  holeColor: "brown",
  categories: ["jedzenie"],
  base: drawing([
    "......", // 0 crown (part)
    "......", // 1
    "..gggg", // 2
    "..yyyy", // 3
    ".yyyyy", // 4
    "......", // 5 scales (part)
    "......", // 6
    "......", // 7
    "......", // 8
    "......", // 9
    "......", // 10
    "......", // 11
    "yyyyyy", // 12
    ".yyyyy", // 13
    "..yyyy", // 14
  ]),
  parts: [
    {
      id: "crown",
      variants: [drawing(["g..g", "g.gg"], 0, 2), drawing(["...g", ".g.g"], 0, 2)],
    },
    {
      id: "scales",
      variants: [
        drawing(["yy.yy.", "yyyyyy", "y.yy.y", "yyyyyy", "yy.yy.", "yyyyyy", "y.yy.y"], 5, 0),
        drawing(["y.yy.y", "yyyyyy", "yy.yy.", "yyyyyy", "y.yy.y", "yyyyyy", "yy.yy."], 5, 0),
      ],
    },
  ],
};

const PINEAPPLE_9: SymmetryTemplate = {
  id: "ananas",
  width: 9,
  height: 23,
  holeColor: "brown",
  categories: ["jedzenie"],
  base: drawing([
    ".........", // 0 crown (part)
    ".........", // 1
    ".........", // 2
    ".........", // 3
    ".........", // 4
    ".........", // 5
    "....yyyyy", // 6
    "..yyyyyyy", // 7
    ".yyyyyyyy", // 8
    ".........", // 9 upper-scales (part)
    ".........", // 10
    ".........", // 11
    ".........", // 12
    ".........", // 13
    "yyyyyyyyy", // 14
    "y........", // 15 lower-scales (part)
    "y........", // 16
    "y........", // 17
    "y........", // 18
    ".........", // 19
    "..yyyyyyy", // 20
    "...yyyyyy", // 21
    ".....yyyy", // 22
  ]),
  parts: [
    {
      id: "crown",
      variants: [
        drawing(["g....g", "gg..gg", ".ggggg", "..gggg", "gggggg", "..gggg"], 0, 3),
        drawing(["....g.", "...gg.", "..gggg", "...ggg", "..gggg", "..gggg"], 0, 3),
      ],
    },
    {
      id: "upper-scales",
      variants: [
        drawing(["yy.yyy.yy", "yyyyyyyyy", "yyyy.yyy.", "yyyyyyyyy", "yy.yyy.yy"], 9, 0),
        drawing(["yyyy.yyy.", "yyyyyyyyy", "yy.yyy.yy", "yyyyyyyyy", "yyyy.yyy."], 9, 0),
      ],
    },
    {
      id: "lower-scales",
      variants: [
        drawing(["yyy.yyy.", "yyyyyyyy", "y.yyy.yy", "yyyyyyyy", "yyy.yyy."], 15, 1),
        drawing(["yyyyyyyy", "y.yyy.yy", "yyyyyyyy", "yyy.yyy.", "yyyyyyyy"], 15, 1),
      ],
    },
  ],
};

// Lollipop: a round head whose pattern is part of the shape (holes show the swirl), a stick, an optional bow and tip.
const LOLLIPOP_4: SymmetryTemplate = {
  id: "lizak",
  width: 4,
  height: 12,
  holeColor: "orange",
  categories: ["jedzenie"],
  base: drawing(["..rr", ".rrr", ".r..", ".rrr", "..rr", "...s", "...s", "...s", "...s", "...s", "...s"]),
  parts: [
    { id: "pattern", variants: [drawing(["..r."], 2), drawing(["...r"], 2)] },
    { id: "bow", variants: [drawing([]), drawing([".bb."], 6)] },
  ],
};

const LOLLIPOP_6: SymmetryTemplate = {
  id: "lizak",
  width: 6,
  height: 15,
  holeColor: "orange",
  categories: ["jedzenie"],
  base: drawing([
    "..rrrr",
    ".rrrrr",
    "rrr...",
    "rrr...",
    "rrr...",
    ".rrrrr",
    "..rrrr",
    "....ss",
    "....ss",
    "....ss",
    "....ss",
    "....ss",
    "....ss",
    "....ss",
  ]),
  parts: [
    {
      id: "pattern",
      variants: [drawing(["...rrr", "......", "...rrr"], 2), drawing(["...rrr", "...r..", "...rrr"], 2)],
    },
    { id: "bow", variants: [drawing([]), drawing(["..bb..", "..bb.."], 8)] },
  ],
};

const LOLLIPOP_9: SymmetryTemplate = {
  id: "lizak",
  width: 9,
  height: 24,
  holeColor: "orange",
  categories: ["jedzenie"],
  base: drawing([
    "...rrrrrr",
    ".rrrrrrrr",
    ".rrrrrrrr",
    "rrr......",
    "rrr......",
    "rrr......",
    "rrr......",
    "rrr......",
    "rrr......",
    ".rrrrrrrr",
    ".rrrrrrrr",
    "...rrrrrr",
    ".......ss",
    ".......ss",
    ".......ss",
    ".......ss",
    ".......ss",
    ".......ss",
    ".......ss",
    ".......ss",
    ".......ss",
    ".......ss",
  ]),
  parts: [
    {
      id: "pattern",
      variants: [
        drawing(["...rrrrrr", ".........", "...rrrrrr", ".........", "...rrrrrr", "........."], 3),
        drawing(["...rrrrrr", "...rrrr..", "...rrr...", "...rrr...", "...rrrr..", "...rrrrrr"], 3),
      ],
    },
    { id: "bow", variants: [drawing([]), drawing([".....bb..", ".....bb.."], 13)] },
    { id: "tip", variants: [drawing([]), drawing(["......sss", "......sss"], 22)] },
  ],
};

export const JEDZENIE: SymmetryObjectSizes = {
  half4: [STRAWBERRY_4, CUPCAKE_4, PEAR_4, CARROT_4, PINEAPPLE_4, LOLLIPOP_4],
  half6: [STRAWBERRY, CUPCAKE_6, PEAR_6, CARROT_6, PINEAPPLE_6, LOLLIPOP_6],
  half9: [STRAWBERRY_7, CUPCAKE_9, PEAR_9, CARROT_9, PINEAPPLE_9, LOLLIPOP_9],
};
