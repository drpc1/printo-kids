import {
  DEFAULT_OBJECT_CATEGORY_ID,
  type ObjectCategoryChoiceId,
  type ObjectCategoryId,
} from "../symmetry/templates.ts";
import type { DictationLevelId } from "./levels.ts";
import { silhouetteOfCells, type DictationCell, type DictationSilhouette } from "./outline.ts";

/**
 * A whole object drawn for the dictation only, not mirrored: it does not need an axis of symmetry. The bitmaps are
 * hand-drawn per level, one string per row, "#" a silhouette cell and "." an empty one; enclosed empty cells are
 * filled when the outline is traced. A level without a bitmap is a level the shape was not approved for.
 */
export interface DictationShape {
  id: string;
  categories: readonly ObjectCategoryId[];
  byLevel: Readonly<Partial<Record<DictationLevelId, readonly string[]>>>;
}

/** Drawn for the approved mockup (context/changes/gh115-non-symetric-shapes/mockup-drawings.json). */
const SHIP: DictationShape = {
  id: "statek",
  categories: ["kosmos"],
  byLevel: {
    lat5: ["..#.....", ".###....", ".###...#", "########", ".######."],
    lat6: [
      "...##.......",
      "...##.......",
      "..#####.....",
      "..#####....#",
      "############",
      ".##########.",
      "..########..",
    ],
    lat7: [
      "....##............",
      "....##............",
      "....##............",
      "..########........",
      "..########........",
      "..########......##",
      "##################",
      ".################.",
      "..##############..",
      "....##########....",
    ],
  },
};

/** A round head and teeth on both sides, lying down: head on the left, bit on the right. */
const KEY_HORIZONTAL: DictationShape = {
  id: "klucz-poziomy",
  categories: ["budowle"],
  byLevel: {
    lat5: [".##..#..", "########", "########", ".##.#..#"],
    lat6: [".####..##..#", "######.##..#", "############", "############", "######..##..", ".####...##.."],
    lat7: [
      "..######...##.....",
      ".########..##..###",
      "##########.##..###",
      "##################",
      "##################",
      "##################",
      "##################",
      "##########.#.###..",
      ".########..#.###..",
      "..######....###...",
    ],
  },
};

/** A fish swimming right, tail on the left. Medium and hard only. */
const FISH: DictationShape = {
  id: "ryba",
  categories: ["zwierzeta"],
  byLevel: {
    lat6: ["...###..", "#.######", "########", "########", "#.######", "...###.."],
    lat7: [
      ".......#....",
      "......###...",
      "#....#####..",
      "##..#######.",
      "##.#########",
      "############",
      "############",
      "##.#########",
      "##..#######.",
      "#....#####..",
    ],
  },
};

/** A duck on the water, beak on the right. Medium and hard only. */
const DUCK: DictationShape = {
  id: "kaczka",
  categories: ["zwierzeta"],
  byLevel: {
    lat6: [
      "........#...",
      ".......###..",
      "......######",
      "##.....###..",
      "#########...",
      ".########...",
      "#########...",
      "#########...",
      ".########...",
      "...####.....",
    ],
    lat7: [
      "...........####...",
      "..........######..",
      "..........########",
      "..........########",
      "###.......######..",
      "###############...",
      ".############.....",
      ".#############....",
      ".#############....",
      ".#############....",
      ".#############....",
      ".############.....",
      "...#########......",
      ".....####.........",
    ],
  },
};

/** A dinosaur with a long tail on the left and the head on the right. */
const DINOSAUR: DictationShape = {
  id: "dinozaur",
  categories: ["zwierzeta"],
  byLevel: {
    lat5: ["....###.", "....####", "...####.", "#######.", "#######.", ".#####..", "..#.#..."],
    lat6: [
      "........##.",
      ".......####",
      "........##.",
      ".......##..",
      "...######..",
      "..#######..",
      ".########..",
      "##.#####...",
      "....#..#...",
      "....#..#...",
    ],
    lat7: [
      "............###.",
      "...........#####",
      "...........#####",
      "...........####.",
      "...........###..",
      ".......##..###..",
      ".....#########..",
      "....##########..",
      "..###########...",
      ".############...",
      "############....",
      "##....######....",
      "......##..##....",
      "......##..##....",
      "......##..##....",
    ],
  },
};

/** A steam locomotive: chimney, boiler and a taller cab on the right. */
const LOCOMOTIVE: DictationShape = {
  id: "lokomotywa",
  categories: ["kosmos"],
  byLevel: {
    lat5: [".#...###", ".#...###", "########", "########", "##.##.##"],
    lat6: [
      ".##...######",
      ".##.#..#####",
      ".###########",
      ".###########",
      ".###########",
      ".###########",
      "############",
      "#.#.##..##..",
    ],
    lat7: [
      "..##......########",
      "..##..##..#######.",
      "..##..##..#######.",
      ".################.",
      ".################.",
      ".################.",
      ".################.",
      ".################.",
      ".################.",
      ".################.",
      "##########..####..",
      "...##..##....##...",
    ],
  },
};

/** A helicopter: rotor, cabin, tail boom with a fin. Medium and hard only. */
const HELICOPTER: DictationShape = {
  id: "helikopter",
  categories: ["kosmos"],
  byLevel: {
    lat6: [
      "######....",
      "..#.......",
      "..##.....#",
      ".#########",
      "##########",
      ".####.....",
      ".####.....",
      ".####.....",
    ],
    lat7: [
      "##########......",
      "....#...........",
      "....#.........##",
      "..#####.......##",
      ".###############",
      ".###############",
      ".########.......",
      "..######........",
      "...####.........",
      "..#######.......",
    ],
  },
};

/** A truck: the load on the left, the cab on the right. */
const TRUCK: DictationShape = {
  id: "ciezarowka",
  categories: ["kosmos"],
  byLevel: {
    lat5: ["#####...", "#######.", "########", "########", ".##..##."],
    lat6: ["#######.....", "#########...", "############", "############", "############", ".##..##..##."],
    lat7: [
      "###########.......",
      "###########.......",
      "###############...",
      "##################",
      "##################",
      "##################",
      "##################",
      ".####..####..####.",
      ".####..####..####.",
    ],
  },
};

/** A small boat with a mast and no sail. */
const BOAT: DictationShape = {
  id: "lodka-z-masztem",
  categories: ["kosmos"],
  byLevel: {
    lat5: ["...#....", "...#....", "...#....", "...#...#", "########", ".######.", "..####.."],
    lat6: [
      ".....##.....",
      ".....##.....",
      ".....##.....",
      ".....##.....",
      ".....##.....",
      ".....##....#",
      "############",
      ".##########.",
      "..########..",
    ],
    lat7: [
      "........##........",
      "........##........",
      "........##........",
      "........##........",
      "........##........",
      "........##........",
      "........##........",
      "........##......##",
      "##################",
      ".################.",
      "..##############..",
      "....##########....",
    ],
  },
};

/** An umbrella with a hooked handle. */
const UMBRELLA: DictationShape = {
  id: "parasol",
  categories: ["przyroda"],
  byLevel: {
    lat5: ["..####..", ".######.", "########", "...#....", "...#....", "...#....", "#..#....", "####...."],
    lat6: [
      "....####....",
      "..########..",
      ".##########.",
      ".##########.",
      "############",
      "......#.....",
      "......#.....",
      "......#.....",
      "...#..#.....",
      "...#..#.....",
      "...####.....",
    ],
    lat7: [
      ".......####.......",
      ".....########.....",
      "...############...",
      "..##############..",
      ".################.",
      ".################.",
      ".################.",
      "##################",
      "........##........",
      "........##........",
      "........##........",
      "........##........",
      "........##........",
      "....##..##........",
      "....##..##........",
      "....######........",
      "....######........",
    ],
  },
};

/** A round head and teeth on both sides, standing: head on top, bit at the bottom. */
const KEY_VERTICAL: DictationShape = {
  id: "klucz-pionowy",
  categories: ["budowle"],
  byLevel: {
    lat5: [
      "..####..",
      ".######.",
      ".######.",
      "..####..",
      "...##...",
      "...##...",
      "..###...",
      "...##...",
      "...###..",
      "...##...",
      "..###...",
    ],
    lat6: [
      "....####....",
      "...######...",
      "..########..",
      "..########..",
      "...######...",
      "....####....",
      ".....##.....",
      ".....##.....",
      "...####.....",
      ".....##.....",
      ".....####...",
      ".....##.....",
      "...####.....",
      ".....####...",
    ],
    lat7: [
      "......######......",
      "....##########....",
      "...############...",
      "..##############..",
      "..##############..",
      "..##############..",
      "..##############..",
      "...############...",
      "....##########....",
      "......######......",
      ".......####.......",
      ".......####.......",
      ".......####.......",
      "...########.......",
      "...########.......",
      ".......####.......",
      ".......########...",
      ".......########...",
      ".......####.......",
      ".....######.......",
      ".....######.......",
      ".......####.......",
      ".......#########..",
      ".......#########..",
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
 * for the child to draw). Throws when the shape has no drawing for the level or its rows differ in length, like a
 * broken template.
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
      if (line.charAt(col) === "#") {
        cells.push({ col: mirrored ? width - 1 - col : col, row });
      }
    }
  });
  return silhouetteOfCells(cells, width, rows.length);
}
