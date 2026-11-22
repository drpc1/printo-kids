import { symmetryColorOfLetter } from "../symmetry/template-format.ts";
import {
  DEFAULT_OBJECT_CATEGORY_ID,
  type ObjectCategoryChoiceId,
  type ObjectCategoryId,
} from "../symmetry/templates.ts";
import type { DictationLevelId } from "./levels.ts";
import { silhouetteOfCells, type DictationCell, type DictationSilhouette } from "./outline.ts";

/**
 * A whole object drawn for the dictation only, not mirrored: it does not need an axis of symmetry. The bitmaps are
 * hand-drawn per level, one string per row, a crayon letter (r g y b o s k n, as in the symmetry templates) for a
 * silhouette cell and "." for an empty one. The dictation reads every letter as a silhouette cell; enclosed empty cells
 * are filled when the outline is traced. A level without a bitmap is a level the shape was not approved for.
 */
export interface DictationShape {
  id: string;
  categories: readonly ObjectCategoryId[];
  /**
   * Whether the "Skopiuj obrazek" card draws the shape too (decision 2026-11-21, S-55): every shape but the horizontal
   * key, which stays in the dictation only.
   */
  onCopyDrawing: boolean;
  byLevel: Readonly<Partial<Record<DictationLevelId, readonly string[]>>>;
}

/** Drawn for the approved mockup (context/changes/gh115-non-symetric-shapes/mockup-drawings.json). */
const SHIP: DictationShape = {
  id: "statek",
  categories: ["kosmos"],
  onCopyDrawing: true,
  byLevel: {
    lat5: ["..k.....", ".yby....", ".yyy...r", "rrrrrrrr", ".rrrrrr."],
    lat6: [
      "...kk.......",
      "...kk.......",
      "..ybyby.....",
      "..yyyyy....r",
      "rrrrrrrrrrrr",
      ".rrrrrrrrrr.",
      "..rrrrrrrr..",
    ],
    lat7: [
      "....kk............",
      "....kk............",
      "....kk............",
      "..yyyyyyyy........",
      "..ybybybyy........",
      "..yyyyyyyy......rr",
      "rrrrrrrrrrrrrrrrrr",
      ".rrrrrrrrrrrrrrrr.",
      "..rrrrrrrrrrrrrr..",
      "....rrrrrrrrrr....",
    ],
  },
};

/** A round head and teeth on both sides, lying down: head on the left, bit on the right. */
const KEY_HORIZONTAL: DictationShape = {
  id: "klucz-poziomy",
  categories: ["budowle"],
  onCopyDrawing: false,
  byLevel: {
    lat5: [".yy..y..", "yyyyyyyy", "yyyyyyyy", ".yy.y..y"],
    lat6: [".yyyy..yy..y", "yyyyyy.yy..y", "yyyyyyyyyyyy", "yyyyyyyyyyyy", "yyyyyy..yy..", ".yyyy...yy.."],
    lat7: [
      "..yyyyyy...yy.....",
      ".yyyyyyyy..yy..yyy",
      "yyyyyyyyyy.yy..yyy",
      "yyyyyyyyyyyyyyyyyy",
      "yyyyyyyyyyyyyyyyyy",
      "yyyyyyyyyyyyyyyyyy",
      "yyyyyyyyyyyyyyyyyy",
      "yyyyyyyyyy.y.yyy..",
      ".yyyyyyyy..y.yyy..",
      "..yyyyyy....yyy...",
    ],
  },
};

/** A fish swimming right, tail on the left. Medium and hard only. */
const FISH: DictationShape = {
  id: "ryba",
  categories: ["zwierzeta"],
  onCopyDrawing: true,
  byLevel: {
    lat6: ["...yyy..", "y.ooooko", "yyoooooo", "yyoooooo", "y.oooooo", "...yyy.."],
    lat7: [
      ".......y....",
      "......yyy...",
      "y....ooooo..",
      "yy..ooooooo.",
      "yy.ooooookoo",
      "yyyooooooooo",
      "yyyooooooooo",
      "yy.ooooooooo",
      "yy..ooooooo.",
      "y....ooooo..",
    ],
  },
};

/** A duck on the water, beak on the right. Medium and hard only. */
const DUCK: DictationShape = {
  id: "kaczka",
  categories: ["zwierzeta"],
  onCopyDrawing: true,
  byLevel: {
    lat6: [
      "........y...",
      ".......yky..",
      "......yyyyoo",
      "yy.....yyy..",
      "yyyyyyyyy...",
      ".yyyyyyyy...",
      "yyyyyyyyy...",
      "yyyyyyyyy...",
      ".yyyyyyyy...",
      "...yyyy.....",
    ],
    lat7: [
      "...........yyyy...",
      "..........yyykyy..",
      "..........yyyyyyoo",
      "..........yyyyyyoo",
      "yyy.......yyyyyy..",
      "yyyyyyyyyyyyyyy...",
      ".yyyyyyyyyyyy.....",
      ".yyyyyyyyyyyyy....",
      ".yyyyyyyyyyyyy....",
      ".yyyyyyyyyyyyy....",
      ".yyyyyyyyyyyyy....",
      ".yyyyyyyyyyyy.....",
      "...yyyyyyyyy......",
      ".....yyyy.........",
    ],
  },
};

/** A dinosaur with a long tail on the left and the head on the right. Redrawn in S-55: a longer tail to the ground. */
const DINOSAUR: DictationShape = {
  id: "dinozaur",
  categories: ["zwierzeta"],
  onCopyDrawing: true,
  byLevel: {
    lat5: [".....gg.", ".....gkg", ".....gg.", "...gggg.", "..ggggg.", "ggggggg.", "g..g.g.."],
    lat6: [
      ".........gg.",
      ".........gkg",
      ".........gg.",
      "........gg..",
      ".....ggggg..",
      "....gggggg..",
      "...ggggggg..",
      ".ggggggggg..",
      "gg..g..g....",
      "g...g..g....",
    ],
    lat7: [
      "..............ggg.",
      ".............ggkgg",
      ".............ggggg",
      ".............gggg.",
      ".............ggg..",
      ".........gg..ggg..",
      ".......ggggggggg..",
      "......gggggggggg..",
      ".....gggggggggg...",
      "....ggggggggggg...",
      "...ggggggggggg....",
      "..gg....gggggg....",
      ".gg.....gg..gg....",
      "gg......gg..gg....",
      "g.......gg..gg....",
    ],
  },
};

/** A steam locomotive: chimney, boiler and a taller cab on the right. */
const LOCOMOTIVE: DictationShape = {
  id: "lokomotywa",
  categories: ["kosmos"],
  onCopyDrawing: true,
  byLevel: {
    lat5: [".k...ggg", ".k...gbg", "rrrrrrrr", "rrrrrrrr", "kk.kk.kk"],
    lat6: [
      ".kk...gggggg",
      ".kk.y..gbbbg",
      ".rrrrrrgbbbg",
      ".rrrrrrggggg",
      ".rrrrrrggggg",
      ".rrrrrrggggg",
      "krrrrrrrrrrr",
      "k.k.kk..kk..",
    ],
    lat7: [
      "..kk......gggggggg",
      "..kk..yy..ggbbbbg.",
      "..kk..yy..ggbbbbg.",
      ".rrrrrrrrrggbbbbg.",
      ".rrrrrrrrrggggggg.",
      ".rrrrrrrrrggggggg.",
      ".rrrrrrrrrggggggg.",
      ".rrrrrrrrrrrrrrrr.",
      ".rrrrrrrrrrrrrrrr.",
      ".rrrrrrrrrrrrrrrr.",
      "kkkkkkkkkk..kkkk..",
      "...kk..kk....kk...",
    ],
  },
};

/**
 * A helicopter: rotor, cabin, tail boom with a fin. Medium and hard only. Redrawn in S-55: the medium one drawn like
 * the hard one (rotor, cabin, tail, skid).
 */
const HELICOPTER: DictationShape = {
  id: "helikopter",
  categories: ["kosmos"],
  onCopyDrawing: true,
  byLevel: {
    lat6: [
      "ssssssss....",
      "...s........",
      ".ybbby....rr",
      "yybbbyyrrrrr",
      "yyyyyyyrrrrr",
      ".yyyyyy.....",
      "..yyyy......",
      ".kkkkkk.....",
    ],
    lat7: [
      "ssssssssss......",
      "....s...........",
      "....s.........rr",
      "..yyyyy.......rr",
      ".ybbbyyyyrrrrrrr",
      ".ybbbyyyyrrrrrrr",
      ".yyyyyyyy.......",
      "..yyyyyy........",
      "...yyyy.........",
      "..kkkkkkk.......",
    ],
  },
};

/** A truck: the load on the left, the cab on the right. Redrawn in S-55: medium and hard in the proportions of easy. */
const TRUCK: DictationShape = {
  id: "ciezarowka",
  categories: ["kosmos"],
  onCopyDrawing: true,
  byLevel: {
    lat5: ["ooooo...", "ooooobb.", "ooooorrr", "ooooorrr", ".kk..kk."],
    lat6: [
      "ooooooo.....",
      "ooooooo.....",
      "ooooooorbb..",
      "ooooooorbbr.",
      "ooooooorrrrr",
      "ooooooorrrrr",
      ".kkk...kkk..",
      ".kkk...kkk..",
    ],
    lat7: [
      "ooooooooooo.......",
      "ooooooooooo.......",
      "ooooooooooo.......",
      "ooooooooooorbbb...",
      "ooooooooooorbbbr..",
      "ooooooooooorbbbrr.",
      "ooooooooooorrrrrrr",
      "ooooooooooorrrrrrr",
      "ooooooooooorrrrrrr",
      ".kkkk.......kkkk..",
      ".kkkk.......kkkk..",
    ],
  },
};

/** A small boat with a mast and no sail. */
const BOAT: DictationShape = {
  id: "lodka-z-masztem",
  categories: ["kosmos"],
  onCopyDrawing: true,
  byLevel: {
    lat5: ["...n....", "...n....", "...n....", "...n...r", "rrrrrrrr", ".rrrrrr.", "..rrrr.."],
    lat6: [
      ".....nn.....",
      ".....nn.....",
      ".....nn.....",
      ".....nn.....",
      ".....nn.....",
      ".....nn....r",
      "rrrrrrrrrrrr",
      ".rrrrrrrrrr.",
      "..rrrrrrrr..",
    ],
    lat7: [
      "........nn........",
      "........nn........",
      "........nn........",
      "........nn........",
      "........nn........",
      "........nn........",
      "........nn........",
      "........nn......rr",
      "rrrrrrrrrrrrrrrrrr",
      ".rrrrrrrrrrrrrrrr.",
      "..rrrrrrrrrrrrrr..",
      "....rrrrrrrrrr....",
    ],
  },
};

/** An umbrella with a hooked handle. */
const UMBRELLA: DictationShape = {
  id: "parasol",
  categories: ["przyroda"],
  onCopyDrawing: true,
  byLevel: {
    lat5: ["..yyrr..", ".ryyrry.", "rryyrryy", "...k....", "...k....", "...k....", "k..k....", "kkkk...."],
    lat6: [
      "....rryy....",
      "..yyrryyrr..",
      ".ryyrryyrry.",
      ".ryyrryyrry.",
      "rryyrryyrryy",
      "......k.....",
      "......k.....",
      "......k.....",
      "...k..k.....",
      "...k..k.....",
      "...kkkk.....",
    ],
    lat7: [
      ".......rryy.......",
      ".....yrrryyyr.....",
      "...yyyrrryyyrrr...",
      "..ryyyrrryyyrrry..",
      ".rryyyrrryyyrrryy.",
      ".rryyyrrryyyrrryy.",
      ".rryyyrrryyyrrryy.",
      "rrryyyrrryyyrrryyy",
      "........kk........",
      "........kk........",
      "........kk........",
      "........kk........",
      "........kk........",
      "....kk..kk........",
      "....kk..kk........",
      "....kkkkkk........",
      "....kkkkkk........",
    ],
  },
};

/** A round head and teeth on both sides, standing: head on top, bit at the bottom. */
const KEY_VERTICAL: DictationShape = {
  id: "klucz-pionowy",
  categories: ["budowle"],
  onCopyDrawing: true,
  byLevel: {
    lat5: [
      "..yyyy..",
      ".yyyyyy.",
      ".yyyyyy.",
      "..yyyy..",
      "...yy...",
      "...yy...",
      "..yyy...",
      "...yy...",
      "...yyy..",
      "...yy...",
      "..yyy...",
    ],
    lat6: [
      "....yyyy....",
      "...yyyyyy...",
      "..yyyyyyyy..",
      "..yyyyyyyy..",
      "...yyyyyy...",
      "....yyyy....",
      ".....yy.....",
      ".....yy.....",
      "...yyyy.....",
      ".....yy.....",
      ".....yyyy...",
      ".....yy.....",
      "...yyyy.....",
      ".....yyyy...",
    ],
    lat7: [
      "......yyyyyy......",
      "....yyyyyyyyyy....",
      "...yyyyyyyyyyyy...",
      "..yyyyyyyyyyyyyy..",
      "..yyyyyyyyyyyyyy..",
      "..yyyyyyyyyyyyyy..",
      "..yyyyyyyyyyyyyy..",
      "...yyyyyyyyyyyy...",
      "....yyyyyyyyyy....",
      "......yyyyyy......",
      ".......yyyy.......",
      ".......yyyy.......",
      ".......yyyy.......",
      "...yyyyyyyy.......",
      "...yyyyyyyy.......",
      ".......yyyy.......",
      ".......yyyyyyyy...",
      ".......yyyyyyyy...",
      ".......yyyy.......",
      ".....yyyyyy.......",
      ".....yyyyyy.......",
      ".......yyyy.......",
      ".......yyyyyyyyy..",
      ".......yyyyyyyyy..",
    ],
  },
};

/**
 * Drawn for the approved Boże Narodzenie mockup (context/changes/christmas-objects/mockup-drawings.json). Redrawn in
 * S-55: a straight back, a heel that does not stick out and a longer foot.
 */
const STOCKING: DictationShape = {
  id: "skarpeta",
  categories: ["boze-narodzenie"],
  onCopyDrawing: true,
  byLevel: {
    lat5: [
      "ssss....",
      "ssss....",
      "rrr.....",
      "ggg.....",
      "rrr.....",
      "gggg....",
      "rrrrrr..",
      "gggggggg",
      "rrrrrrrr",
      ".gggggg.",
    ],
    lat6: [
      "ssssss......",
      "ssssss......",
      "ssssss......",
      "rrrrr.......",
      "rrrrr.......",
      "ggggg.......",
      "ggggg.......",
      "rrrrr.......",
      "rrrrrr......",
      "ggggggggg...",
      "ggggggggggg.",
      "rrrrrrrrrrrr",
      ".rrrrrrrrrr.",
      "..gggggggg..",
    ],
    lat7: [
      "sssssssss.........",
      "sssssssss.........",
      "sssssssss.........",
      "rrrrrrrr..........",
      "rrrrrrrr..........",
      "gggggggg..........",
      "gggggggg..........",
      "rrrrrrrr..........",
      "rrrrrrrr..........",
      "gggggggg..........",
      "gggggggg..........",
      "rrrrrrrr..........",
      "rrrrrrrrr.........",
      "ggggggggggg.......",
      "gggggggggggggg....",
      "rrrrrrrrrrrrrrrr..",
      "rrrrrrrrrrrrrrrrr.",
      "gggggggggggggggggg",
      ".gggggggggggggggg.",
      "...rrrrrrrrrrrr...",
    ],
  },
};

/** Drawn for the approved Boże Narodzenie mockup (context/changes/christmas-objects/mockup-drawings.json). */
const CANDY_CANE: DictationShape = {
  id: "laska-cukrowa",
  categories: ["boze-narodzenie"],
  onCopyDrawing: true,
  byLevel: {
    lat6: [
      "..ssr..",
      ".ssrrs.",
      "ss...sr",
      "sr...rr",
      "rr...rs",
      "rs.....",
      "ss.....",
      "sr.....",
      "rr.....",
      "rs.....",
      "ss.....",
      "sr.....",
      "rr.....",
      "rs.....",
    ],
    lat7: [
      "...sssr...",
      "..sssrrr..",
      ".sssrrrss.",
      "sss....ssr",
      "ssr....srr",
      "srr....rrr",
      "rrr....rrs",
      "rrs.......",
      "rss.......",
      "sss.......",
      "ssr.......",
      "srr.......",
      "rrr.......",
      "rrs.......",
      "rss.......",
      "sss.......",
      "ssr.......",
      "srr.......",
      "rrr.......",
      "rrs.......",
      "rss.......",
      "sss.......",
    ],
  },
};

/** Drawn for the approved Boże Narodzenie mockup (context/changes/christmas-objects/mockup-drawings.json). */
const SANTA_HAT: DictationShape = {
  id: "czapka-mikolaja",
  categories: ["boze-narodzenie"],
  onCopyDrawing: true,
  byLevel: {
    lat6: [
      "....rrr.....",
      "...rrrrrr...",
      "...rrrrrrrr.",
      "..rrrr...rr.",
      "..rrrr..ssss",
      "..rrrrr.ssss",
      ".rrrrrr.....",
      "ssssssssss..",
      "ssssssssss..",
    ],
    lat7: [
      "......rrrr.......",
      ".....rrrrrrrr....",
      "....rrrrrrrrrrr..",
      "....rrrrrrrrrrrr.",
      "...rrrrrr....rrr.",
      "...rrrrrr...sssss",
      "...rrrrrrr..sssss",
      "..rrrrrrrr..sssss",
      "..rrrrrrrrr..sss.",
      ".rrrrrrrrrrr.....",
      "ssssssssssssss...",
      "ssssssssssssss...",
      "ssssssssssssss...",
    ],
  },
};

/** Drawn for the approved Boże Narodzenie mockup (context/changes/christmas-objects/mockup-drawings.json). */
const SLEDGE: DictationShape = {
  id: "sanki",
  categories: ["boze-narodzenie"],
  onCopyDrawing: true,
  byLevel: {
    lat6: ["..........k.", ".rrrrrrrr.kk", ".rrrrrrrr..k", "..k.....k..k", "kkkkkkkkkkkk"],
    lat7: [
      "...............kk.",
      ".rrrrrrrrrrrr..kkk",
      ".rrrrrrrrrrrr...kk",
      ".rrrrrrrrrrrr...kk",
      "..kk......kk....kk",
      "..kk......kk....kk",
      "kkkkkkkkkkkkkkkkkk",
      ".kkkkkkkkkkkkkkkkk",
    ],
  },
};

/**
 * Drawn for the approved Boże Narodzenie mockup (context/changes/christmas-objects/mockup-drawings.json). Redrawn in
 * S-55: 13×19, a shorter body and a longer neck and legs.
 */
const REINDEER: DictationShape = {
  id: "renifer",
  categories: ["boze-narodzenie", "zwierzeta"],
  onCopyDrawing: true,
  byLevel: {
    lat7: [
      ".....s...s...",
      ".....s...s.s.",
      ".....ss..sss.",
      "......ss.ss..",
      ".......nnnn..",
      "........nkn..",
      ".......nnnnnk",
      ".......nnnnnk",
      ".......nnnn..",
      ".......nnn...",
      "n......nnn...",
      "nnnnnnnnnn...",
      ".nnnnnnnnn...",
      ".nnnnnnnnn...",
      ".nnnnnnnnn...",
      ".n.n...n.n...",
      ".n.n...n.n...",
      ".n.n...n.n...",
      ".k.k...k.k...",
    ],
  },
};

export const DICTATION_SHAPES: readonly DictationShape[] = [
  FISH,
  DUCK,
  DINOSAUR,
  LOCOMOTIVE,
  HELICOPTER,
  TRUCK,
  SHIP,
  BOAT,
  UMBRELLA,
  KEY_VERTICAL,
  KEY_HORIZONTAL,
  STOCKING,
  CANDY_CANE,
  SANTA_HAT,
  SLEDGE,
  REINDEER,
];

/** The shapes drawn for the level, only those in `category` (all of them for "wszystkie"). */
export function dictationShapesFor(
  levelId: DictationLevelId,
  category: ObjectCategoryChoiceId = DEFAULT_OBJECT_CATEGORY_ID,
  shapes: readonly DictationShape[] = DICTATION_SHAPES,
): readonly DictationShape[] {
  return shapes.filter(
    (shape) =>
      shape.byLevel[levelId] !== undefined && (category === "wszystkie" || shape.categories.includes(category)),
  );
}

/**
 * The silhouette of the shape at the level, optionally flipped left to right (the mirror image is another outline
 * for the child to draw). Every crayon letter is a silhouette cell. Throws when the shape has no drawing for the level,
 * its rows differ in length or a cell is neither "." nor a crayon letter, like a broken template.
 */
export function shapeSilhouette(
  shape: DictationShape,
  levelId: DictationLevelId,
  mirrored: boolean,
): DictationSilhouette {
  const rows = shape.byLevel[levelId];
  if (rows === undefined) {
    throw new Error(`Shape ${shape.id} has no drawing for ${levelId}`);
  }
  const width = rows[0].length;
  const cells: DictationCell[] = [];
  rows.forEach((line, row) => {
    if (line.length !== width) {
      throw new Error(`Shape ${shape.id} at ${levelId} has a row of ${line.length} cells in a ${width} wide drawing`);
    }
    for (let col = 0; col < line.length; col += 1) {
      const letter = line.charAt(col);
      if (letter === ".") {
        continue;
      }
      if (symmetryColorOfLetter(letter) === undefined) {
        throw new Error(`Unknown color letter "${letter}" in shape ${shape.id} at ${levelId}`);
      }
      cells.push({ col: mirrored ? width - 1 - col : col, row });
    }
  });
  return silhouetteOfCells(cells, width, rows.length);
}
