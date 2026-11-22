// S-55 mockup: the dictation shapes colored for the "Skopiuj obrazek" card (all 16 but the horizontal key, which the
// user left out on 2026-11-21; it stays in the dictation). The colors are rules (a base crayon per
// shape and rectangles or single cells painted over it), applied to the silhouette cells only, so the colored bitmap
// has exactly the cells of the black one. Writes mockup-colors.json (the colored bitmaps, letters as in the symmetry
// templates: r g y b o s k n) and preview.html (every shape at every drawn level, black and colored, on the card's grid
// and cell size). Usage (from the repo root):
//   node --experimental-strip-types context/changes/copy-drawing-asymmetric-shapes/mockup.mts
import fs from "node:fs";
import nodePath from "node:path";
import { dictationCardFromSilhouette, dictationCardProblems } from "../../../src/lib/dictation/generate.ts";
import { DICTATION_LEVELS } from "../../../src/lib/dictation/levels.ts";
import { outlineProblems } from "../../../src/lib/dictation/outline.ts";
import { DICTATION_SHAPES, shapeSilhouette } from "../../../src/lib/dictation/shapes.ts";

type Level = "lat5" | "lat6" | "lat7";
type Letter = "r" | "g" | "y" | "b" | "o" | "s" | "k" | "n";
/** [color, rowFrom, rowTo, colFrom, colTo], inclusive; later rules win. */
type Rect = [Letter, number, number, number, number];
interface LevelRule {
  base: Letter;
  rects?: Rect[];
  /** Optional per-cell function, applied after the rectangles. */
  fn?: (row: number, col: number) => Letter | null;
}

const ALL = 99;
const stripes =
  (a: Letter, b: Letter, width: number) =>
  (row: number, col: number): Letter =>
    Math.floor((row + col) / width) % 2 === 0 ? a : b;
const columnStripes =
  (a: Letter, b: Letter, width: number, rowTo: number) =>
  (row: number, col: number): Letter | null =>
    row <= rowTo ? (Math.floor(col / width) % 2 === 0 ? a : b) : null;
/** Horizontal stripes below the first `skipRows` rows (those keep the base crayon). */
const rowStripes =
  (a: Letter, b: Letter, width: number, skipRows: number) =>
  (row: number): Letter | null =>
    row < skipRows ? null : Math.floor((row - skipRows) / width) % 2 === 0 ? a : b;

/** Left out of the card by the user (2026-11-21); the shape stays in the dictation. */
const EXCLUDED = new Set(["klucz-poziomy"]);

/**
 * Redrawn bitmaps, proposed for the dictation too (the card and the dictation share the shape). Renifer: the user found
 * the 16×16 body too long for its height (2026-11-21); shorter body, longer neck and legs, 13×19.
 */
const REDRAWN: Record<string, Partial<Record<Level, string[]>>> = {
  // The user (2026-11-21): only the easy truck has good proportions; medium 12×6 and hard 18×9 were too long and flat.
  // Redrawn in the easy one's proportions: an almost square box, a cab with a sloped front, wheels under both.
  ciezarowka: {
    lat6: [
      "#######.....",
      "#######.....",
      "##########..",
      "###########.",
      "############",
      "############",
      ".###...###..",
      ".###...###..",
    ],
    lat7: [
      "###########.......",
      "###########.......",
      "###########.......",
      "###############...",
      "################..",
      "#################.",
      "##################",
      "##################",
      "##################",
      ".####.......####..",
      ".####.......####..",
    ],
  },
  // The user (2026-11-21): the medium helicopter (10×8, cabin hanging under the boom) looked wrong. Redrawn after the
  // hard one: rotor, mast, cabin, tail boom with a fin, skid.
  helikopter: {
    lat6: [
      "########....",
      "...#........",
      ".#####....##",
      "############",
      "############",
      ".######.....",
      "..####......",
      ".######.....",
    ],
  },
  // The user (2026-11-21): the dinosaurs need longer tails, and (second round) the tails should come down close to the
  // ground. The tail slopes from the body down to the row of the feet on every level (easy stays 8 wide).
  dinozaur: {
    lat5: [".....##.", ".....###", ".....##.", "...####.", "..#####.", "#######.", "#..#.#.."],
    lat6: [
      ".........##.",
      ".........###",
      ".........##.",
      "........##..",
      ".....#####..",
      "....######..",
      "...#######..",
      ".#########..",
      "##..#..#....",
      "#...#..#....",
    ],
    lat7: [
      "..............###.",
      ".............#####",
      ".............#####",
      ".............####.",
      ".............###..",
      ".........##..###..",
      ".......#########..",
      "......##########..",
      ".....##########...",
      "....###########...",
      "...###########....",
      "..##....######....",
      ".##.....##..##....",
      "##......##..##....",
      "#.......##..##....",
    ],
  },
  // The user (2026-11-21): the sock did not look like a sock, and (second round) the heel must not stick out. The back
  // runs straight from the cuff down to the heel, which is only a rounded corner; the cuff is a little wider in front,
  // and the foot ends in a rounded toe. Third round: a longer foot (easy keeps 8 columns, so its leg is narrower).
  skarpeta: {
    lat5: [
      "####....",
      "####....",
      "###.....",
      "###.....",
      "###.....",
      "####....",
      "######..",
      "########",
      "########",
      ".######.",
    ],
    lat6: [
      "######......",
      "######......",
      "######......",
      "#####.......",
      "#####.......",
      "#####.......",
      "#####.......",
      "#####.......",
      "######......",
      "#########...",
      "###########.",
      "############",
      ".##########.",
      "..########..",
    ],
    lat7: [
      "#########.........",
      "#########.........",
      "#########.........",
      "########..........",
      "########..........",
      "########..........",
      "########..........",
      "########..........",
      "########..........",
      "########..........",
      "########..........",
      "########..........",
      "#########.........",
      "###########.......",
      "##############....",
      "################..",
      "#################.",
      "##################",
      ".################.",
      "...############...",
    ],
  },
  renifer: {
    lat7: [
      ".....#...#...",
      ".....#...#.#.",
      ".....##..###.",
      "......##.##..",
      ".......####..",
      "........###..",
      ".......######",
      ".......######",
      ".......####..",
      ".......###...",
      "#......###...",
      "##########...",
      ".#########...",
      ".#########...",
      ".#########...",
      ".#.#...#.#...",
      ".#.#...#.#...",
      ".#.#...#.#...",
      ".#.#...#.#...",
    ],
  },
};

/**
 * Alternatives shown next to the main proposal, for the user to choose. Empty since the user chose the sock's variant A
 * (2026-11-21); variant B was a green cuff with red and gray stripes.
 */
const VARIANTS: { id: string; label: string; rules: Partial<Record<Level, LevelRule>> }[] = [];

const RULES: Record<string, Partial<Record<Level, LevelRule>>> = {
  ryba: {
    lat6: {
      base: "o",
      rects: [
        ["y", 0, 0, 0, ALL],
        ["y", 5, 5, 0, ALL],
        ["y", 0, ALL, 0, 1],
        ["k", 1, 1, 6, 6],
      ],
    },
    lat7: {
      base: "o",
      rects: [
        ["y", 0, 1, 0, ALL],
        ["y", 0, ALL, 0, 1],
        ["y", 5, 6, 2, 2],
        ["k", 4, 4, 9, 9],
      ],
    },
  },
  kaczka: {
    lat6: {
      base: "y",
      rects: [
        ["o", 2, 2, 10, 11],
        ["k", 1, 1, 8, 8],
      ],
    },
    lat7: {
      base: "y",
      rects: [
        ["o", 2, 3, 16, 17],
        ["k", 1, 1, 13, 13],
      ],
    },
  },
  dinozaur: {
    lat5: { base: "g", rects: [["k", 1, 1, 6, 6]] },
    lat6: { base: "g", rects: [["k", 1, 1, 10, 10]] },
    lat7: { base: "g", rects: [["k", 1, 1, 15, 15]] },
  },
  // Vehicles (second round, 2026-11-21): blue windows in every colored vehicle, so nothing next to a window is blue.
  lokomotywa: {
    lat5: {
      base: "r",
      rects: [
        ["k", 0, 1, 0, 2],
        ["g", 0, 1, 5, 7],
        ["b", 1, 1, 6, 6],
        ["k", 4, 4, 0, ALL],
      ],
    },
    lat6: {
      base: "r",
      rects: [
        ["k", 0, 1, 0, 2],
        ["y", 1, 1, 4, 4],
        ["g", 0, 5, 7, 11],
        ["g", 0, 0, 6, 6],
        ["b", 1, 2, 8, 10],
        ["k", 6, 6, 0, 0],
        ["k", 7, 7, 0, ALL],
      ],
    },
    lat7: {
      base: "r",
      rects: [
        ["k", 0, 2, 0, 3],
        ["y", 1, 2, 6, 7],
        ["g", 0, 6, 10, 17],
        ["b", 1, 3, 12, 15],
        ["k", 10, 11, 0, ALL],
      ],
    },
  },
  helikopter: {
    lat6: {
      base: "y",
      rects: [
        ["s", 0, 1, 0, ALL],
        ["r", 2, 4, 7, 11],
        ["b", 2, 3, 2, 4],
        ["k", 7, 7, 0, ALL],
      ],
    },
    lat7: {
      base: "y",
      rects: [
        ["s", 0, 0, 0, ALL],
        ["s", 1, 2, 0, 8],
        ["r", 2, 5, 9, 15],
        ["b", 4, 5, 2, 4],
        ["k", 9, 9, 0, ALL],
      ],
    },
  },
  ciezarowka: {
    lat5: {
      base: "o",
      rects: [
        ["r", 0, 3, 5, 7],
        ["b", 1, 1, 5, 6],
        ["k", 4, 4, 0, ALL],
      ],
    },
    lat6: {
      base: "o",
      rects: [
        ["r", 0, 5, 7, 11],
        ["b", 2, 3, 8, 9],
        ["k", 6, 7, 0, ALL],
      ],
    },
    lat7: {
      base: "o",
      rects: [
        ["r", 0, 8, 11, 17],
        ["b", 3, 5, 12, 14],
        ["k", 9, 10, 0, ALL],
      ],
    },
  },
  statek: {
    lat5: {
      base: "r",
      rects: [
        ["y", 0, 2, 0, 6],
        ["k", 0, 0, 0, ALL],
        ["b", 1, 1, 2, 2],
      ],
    },
    lat6: {
      base: "r",
      rects: [
        ["y", 2, 3, 0, 10],
        ["k", 0, 1, 0, ALL],
        ["b", 2, 2, 3, 3],
        ["b", 2, 2, 5, 5],
      ],
    },
    lat7: {
      base: "r",
      rects: [
        ["y", 3, 5, 0, 15],
        ["k", 0, 2, 0, ALL],
        ["b", 4, 4, 3, 3],
        ["b", 4, 4, 5, 5],
        ["b", 4, 4, 7, 7],
      ],
    },
  },
  "lodka-z-masztem": {
    lat5: { base: "r", rects: [["n", 0, 3, 0, 6]] },
    lat6: { base: "r", rects: [["n", 0, 5, 0, 10]] },
    lat7: { base: "r", rects: [["n", 0, 7, 0, 15]] },
  },
  parasol: {
    lat5: { base: "k", fn: columnStripes("r", "y", 2, 2) },
    lat6: { base: "k", fn: columnStripes("r", "y", 2, 4) },
    lat7: { base: "k", fn: columnStripes("r", "y", 3, 7) },
  },
  "klucz-pionowy": { lat5: { base: "y" }, lat6: { base: "y" }, lat7: { base: "y" } },
  "klucz-poziomy": { lat5: { base: "y" }, lat6: { base: "y" }, lat7: { base: "y" } },
  // Variant A, chosen by the user (2026-11-21, after she rejected the gray cuff, red body and green toe): gray cuff,
  // red and green horizontal stripes.
  skarpeta: {
    lat5: { base: "s", fn: rowStripes("r", "g", 1, 2) },
    lat6: { base: "s", fn: rowStripes("r", "g", 2, 3) },
    lat7: { base: "s", fn: rowStripes("r", "g", 2, 3) },
  },
  "laska-cukrowa": {
    lat6: { base: "r", fn: stripes("r", "s", 2) },
    lat7: { base: "r", fn: stripes("r", "s", 3) },
  },
  "czapka-mikolaja": {
    lat6: {
      base: "r",
      rects: [
        ["s", 4, 5, 8, 11],
        ["s", 7, 8, 0, ALL],
      ],
    },
    lat7: {
      base: "r",
      rects: [
        ["s", 5, 8, 12, 16],
        ["s", 10, 12, 0, ALL],
      ],
    },
  },
  sanki: {
    lat6: { base: "k", rects: [["r", 1, 2, 0, 8]] },
    lat7: { base: "k", rects: [["r", 1, 3, 0, 12]] },
  },
  renifer: {
    lat7: {
      base: "n",
      rects: [
        ["s", 0, 3, 0, ALL],
        ["k", 6, 7, 12, 12],
        ["k", 5, 5, 9, 9],
        ["k", 18, 18, 0, ALL],
      ],
    },
  },
};

/** The card grid and cell size of each level ("Skopiuj obrazek" łatwy, średni, trudny). */
const CARD: Record<Level, { label: string; columns: number; rows: number; cell: number }> = {
  lat5: { label: "łatwy", columns: 8, rows: 12, cell: 11 },
  lat6: { label: "średni", columns: 12, rows: 15, cell: 7.5 },
  lat7: { label: "trudny", columns: 18, rows: 24, cell: 5 },
};
const FILL: Record<Letter, string> = {
  r: "oklch(0.58 0.21 27)",
  g: "oklch(0.62 0.17 145)",
  y: "oklch(0.8 0.16 85)",
  b: "oklch(0.55 0.18 255)",
  o: "oklch(0.7 0.18 50)",
  s: "oklch(0.62 0 0)",
  k: "oklch(0.2 0 0)",
  n: "oklch(0.42 0.07 55)",
};
const NAME: Record<string, string> = {
  ryba: "ryba",
  kaczka: "kaczka",
  dinozaur: "dinozaur",
  lokomotywa: "lokomotywa",
  helikopter: "helikopter",
  ciezarowka: "ciężarówka",
  statek: "statek",
  "lodka-z-masztem": "łódka z masztem",
  parasol: "parasol",
  "klucz-pionowy": "klucz pionowy",
  "klucz-poziomy": "klucz poziomy",
  skarpeta: "skarpeta",
  "laska-cukrowa": "laska cukrowa",
  "czapka-mikolaja": "czapka Mikołaja",
  sanki: "sanki",
  renifer: "renifer",
};

function colorize(rows: readonly string[], rule: LevelRule): string[] {
  return rows.map((line, row) =>
    [...line]
      .map((char, col) => {
        if (char === ".") return ".";
        let letter: Letter = rule.base;
        for (const [color, r0, r1, c0, c1] of rule.rects ?? []) {
          if (row >= r0 && row <= r1 && col >= c0 && col <= c1) letter = color;
        }
        return rule.fn?.(row, col) ?? letter;
      })
      .join(""),
  );
}

/** The grid of the card with the bitmap centered: horizontally, and vertically as `centerSilhouette` does. */
function svg(rows: readonly string[], level: Level, colored: boolean): string {
  const { columns, rows: gridRows, cell } = CARD[level];
  const px = 3.78 * cell;
  const left = Math.floor((columns - rows[0].length) / 2);
  const top = Math.floor((gridRows - rows.length) / 2);
  const rects: string[] = [];
  rows.forEach((line, row) =>
    [...line].forEach((char, col) => {
      if (char === ".") return;
      const fill = colored ? FILL[char as Letter] : FILL.k;
      rects.push(
        `<rect x="${(left + col) * px}" y="${(top + row) * px}" width="${px}" height="${px}" fill="${fill}"/>`,
      );
    }),
  );
  const lines: string[] = [];
  for (let c = 0; c <= columns; c += 1)
    lines.push(`<line x1="${c * px}" y1="0" x2="${c * px}" y2="${gridRows * px}"/>`);
  for (let r = 0; r <= gridRows; r += 1)
    lines.push(`<line x1="0" y1="${r * px}" x2="${columns * px}" y2="${r * px}"/>`);
  const w = columns * px;
  const h = gridRows * px;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rects.join("")}<g stroke="#888" stroke-width="0.6">${lines.join("")}</g></svg>`;
}

const dir = nodePath.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const out: Record<string, Partial<Record<Level, string[]>>> = {};
const sections: string[] = [];
/** A redrawn shape must still make a dictation card, plain and mirrored, as `shapes.test.ts` checks. */
for (const [id, byLevel] of Object.entries(REDRAWN)) {
  const shape = DICTATION_SHAPES.find((candidate) => candidate.id === id);
  if (shape === undefined) throw new Error(`No dictation shape ${id}`);
  for (const level of DICTATION_LEVELS) {
    if (byLevel[level.id] === undefined) continue;
    for (const mirrored of [false, true]) {
      // The catalog reads crayon letters since S-55 phase 1, so the "#" of the redrawn rows becomes "k" here.
      const lettered = { [level.id]: byLevel[level.id]?.map((line) => line.replaceAll("#", "k")) };
      const silhouette = shapeSilhouette({ ...shape, byLevel: { ...shape.byLevel, ...lettered } }, level.id, mirrored);
      const card = dictationCardFromSilhouette(silhouette, level);
      const problems = [...outlineProblems(silhouette), ...(card ? dictationCardProblems(card) : ["no card"])];
      if (problems.length > 0) throw new Error(`${id} ${level.id} ${mirrored}: ${JSON.stringify(problems)}`);
      console.log(
        `${id} ${level.id} ${mirrored ? "mirrored" : "plain"}: ${card?.commands.length} commands (max ${level.maxCommands})`,
      );
    }
  }
}

function bitmapsOf(id: string): Partial<Record<Level, readonly string[]>> {
  const shape = DICTATION_SHAPES.find((candidate) => candidate.id === id);
  if (shape === undefined) throw new Error(`No dictation shape ${id}`);
  return { ...shape.byLevel, ...REDRAWN[id] };
}

function section(id: string, title: string, rules: Partial<Record<Level, LevelRule>>, record: boolean): string {
  const cells: string[] = [];
  for (const [level, rows] of Object.entries(bitmapsOf(id)) as [Level, readonly string[]][]) {
    const rule = rules[level];
    if (rule === undefined) throw new Error(`No color rule for ${id} ${level}`);
    const colored = colorize(rows, rule);
    if (record) (out[id] ??= {})[level] = colored;
    cells.push(
      `<figure><figcaption>${CARD[level].label} · ${CARD[level].columns}×${CARD[level].rows}, ${CARD[level].cell} mm · rysunek ${rows[0].length}×${rows.length}</figcaption><div class="pair">${svg(rows, level, false)}${svg(colored, level, true)}</div></figure>`,
    );
  }
  return `<section><h2>${title}</h2><div class="row">${cells.join("")}</div></section>`;
}

for (const shape of DICTATION_SHAPES) {
  if (EXCLUDED.has(shape.id)) continue;
  const rules = RULES[shape.id];
  if (rules === undefined) throw new Error(`No color rules for ${shape.id}`);
  const redrawn = REDRAWN[shape.id] === undefined ? "" : " — nowy rysunek (także w dyktandzie)";
  const name = `${NAME[shape.id] ?? shape.id}${redrawn}`;
  const label = VARIANTS.some((v) => v.id === shape.id) ? `${name} — wariant A` : name;
  sections.push(section(shape.id, `${label} <small>${shape.categories.join(", ")}</small>`, rules, true));
  for (const variant of VARIANTS.filter((v) => v.id === shape.id)) {
    sections.push(section(shape.id, variant.label, variant.rules, false));
  }
}

fs.writeFileSync(nodePath.join(dir, "mockup-colors.json"), `${JSON.stringify(out, null, 2)}\n`);
fs.writeFileSync(
  nodePath.join(dir, "preview.html"),
  `<!doctype html><meta charset="utf-8"><title>S-55 makieta kolorów</title><style>
body{font-family:system-ui,sans-serif;margin:24px;color:#222}h1{font-size:20px}h2{font-size:17px;margin:28px 0 8px}small{color:#777;font-weight:normal}
.row{display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start}figure{margin:0}figcaption{font-size:13px;color:#555;margin-bottom:6px}
.pair{display:flex;gap:10px}svg{background:#fff;outline:1px solid #555}
</style><h1>S-55: kształty dyktanda na „Skopiuj obrazek” — czarne i w kolorach (kratki w rozmiarze karty)</h1>${sections.join("")}`,
);
console.log(`Wrote ${Object.keys(out).length} shapes to mockup-colors.json and preview.html`);
