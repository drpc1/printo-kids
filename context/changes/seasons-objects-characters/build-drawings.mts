// Builds mockup-drawings.json (S-54 winter objects) from hand-drawn full-width pictures.
// Usage (from the repo root): node --experimental-strip-types context/changes/seasons-objects-characters/build-drawings.mts
// Each size is drawn at full width so the symmetry is visible; the script checks the mirror and keeps the left half.
// A part is a list of variants; a variant lists only the rows it touches ({row: full-width line}). The cells of every
// variant of a part leave the base, so base and parts never share a cell. Not part of the product build.
import fs from "node:fs";
import nodePath from "node:path";

type Rows = Record<number, string>;
interface SizeArt {
  base: string[];
  parts: Record<string, Rows[]>;
}
interface ObjectArt {
  id: string;
  name: string;
  categories: string[];
  holeColor: string | null;
  sizes: Partial<Record<"half4" | "half6" | "half9", SizeArt>>;
}

const DIMS = { half4: { w: 4, h: 12 }, half6: { w: 6, h: 15 }, half9: { w: 9, h: 24 } } as const;

const ART: ObjectArt[] = [
  {
    id: "platek",
    name: "płatek śniegu",
    categories: ["zima"],
    holeColor: null,
    sizes: {
      half4: {
        base: [
          "........",
          "...bb...",
          "...bb...",
          "...bb...",
          ".bbbbbb.",
          "bbbbbbbb",
          "bbbbbbbb",
          ".bbbbbb.",
          "...bb...",
          "...bb...",
          "...bb...",
          "........",
        ],
        parts: {
          tips: [
            { 1: "...bb...", 10: "...bb..." },
            { 0: "...bb...", 1: "..bbbb..", 10: "..bbbb..", 11: "...bb..." },
          ],
          center: [{ 5: "bbbbbbbb", 6: "bbbbbbbb" }, { 5: "bbb..bbb", 6: "bbb..bbb" }],
          diag: [
            { 2: "b..bb..b", 3: "bb.bb.bb", 8: "bb.bb.bb", 9: "b..bb..b" },
            { 2: "...bb...", 3: "...bb...", 8: "...bb...", 9: "...bb..." },
          ],
        },
      },
      half9: {
        base: [
          ".........",
          ".........",
          "........b",
          ".bbb....b",
          ".bbb....b",
          "...bbb..b",
          "...bbb..b",
          ".....bbbb",
          ".....bbbb",
          ".......bb",
          "......bbb",
          "bbbbbbbbb",
          "bbbbbbbbb",
          "......bbb",
          ".......bb",
          ".....bbbb",
          ".....bbbb",
          "...bbb..b",
          "...bbb..b",
          ".bbb....b",
          ".bbb....b",
          "........b",
          ".........",
          ".........",
        ],
        parts: {
          tips: [
            { 1: "........b", 22: "........b" },
            { 0: "........b", 1: "........b", 22: "........b", 23: "........b" },
            { 1: ".......bb", 22: ".......bb" },
          ],
          twigs: [{}, { 2: "......bb.", 3: "......bb.", 20: "......bb.", 21: "......bb." }],
          center: [{ 11: "........b", 12: "........b" }, {}],
          ends: [{ 11: "b........", 12: "b........" }, {}],
        },
      },
      half6: {
        base: [
          "............",
          ".....bb.....",
          ".....bb.....",
          ".bb..bb..bb.",
          "..bb.bb.bb..",
          "...bbbbbb...",
          "bbbbb..bbbbb",
          "bbbbb..bbbbb",
          "...bbbbbb...",
          "..bb.bb.bb..",
          ".bb..bb..bb.",
          ".....bb.....",
          ".....bb.....",
          "............",
          "............",
        ],
        parts: {
          tips: [
            {},
            { 1: "....b..b....", 12: "....b..b...." },
            { 0: "....b..b....", 1: "....b..b....", 12: "....b..b....", 13: "....b..b...." },
          ],
          center: [{}, { 6: ".....bb.....", 7: ".....bb....." }],
          diag: [{ 2: ".b........b.", 11: ".b........b." }, {}, { 2: "bb........bb", 11: "bb........bb" }],
        },
      },
    },
  },
  {
    id: "czapka",
    name: "czapka zimowa",
    categories: ["zima"],
    holeColor: null,
    sizes: {
      half4: {
        base: [
          "........",
          "........",
          "........",
          "..rrrr..",
          ".rrrrrr.",
          "........",
          "........",
          "........",
          ".rrrrrr.",
          "........",
          "........",
          "........",
        ],
        parts: {
          pompon: [
            { 0: "...ss...", 1: "..ssss..", 2: "...ss..." },
            { 0: "..ssss..", 1: ".ssssss.", 2: "..ssss.." },
          ],
          pattern: [
            { 5: ".rrrrrr.", 6: ".rrrrrr.", 7: ".rrrrrr." },
            { 5: ".rrrrrr.", 6: ".yyyyyy.", 7: ".rrrrrr." },
            { 5: ".rrrrrr.", 6: ".r.rr.r.", 7: ".rrrrrr." },
          ],
          cuff: [
            { 9: "ssssssss", 10: "ssssssss" },
            { 9: "bbbbbbbb", 10: "bbbbbbbb" },
            { 9: "gggggggg", 10: "gggggggg" },
          ],
        },
      },
      half9: {
        base: [
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
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
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
        ],
        parts: {
          pompon: [
            { 2: ".......ss", 3: "......sss", 4: "......sss", 5: ".......ss" },
            { 1: ".......ss", 2: "......sss", 3: ".....ssss", 4: ".....ssss", 5: "......sss" },
          ],
          pattern: [
            { 12: ".rrrrrrrr", 13: ".rrrrrrrr", 14: ".rr.rr.rr", 15: ".rrrrrrrr", 16: ".rrrrrrrr" },
            { 12: ".rrrrrrrr", 13: ".yyyyyyyy", 14: ".yyyyyyyy", 15: ".yyyyyyyy", 16: ".rrrrrrrr" },
            { 12: ".yyyyyyyy", 13: ".rrrrrrrr", 14: ".gggggggg", 15: ".rrrrrrrr", 16: ".yyyyyyyy" },
          ],
          cuff: [
            { 18: "sssssssss", 19: "sssssssss", 20: "sssssssss", 21: "sssssssss" },
            { 18: "sssssssss", 19: "s.s.s.s.s", 20: "s.s.s.s.s", 21: "sssssssss" },
            { 18: "bbbbbbbbb", 19: "bbbbbbbbb", 20: "bbbbbbbbb", 21: "bbbbbbbbb" },
          ],
        },
      },
      half6: {
        base: [
          "............",
          "............",
          "............",
          "...rrrrrr...",
          "..rrrrrrrr..",
          ".rrrrrrrrrr.",
          "............",
          "............",
          "............",
          "............",
          ".rrrrrrrrrr.",
          "............",
          "............",
          "............",
          "............",
        ],
        parts: {
          pompon: [
            { 0: ".....ss.....", 1: "....ssss....", 2: ".....ss....." },
            { 0: "....ssss....", 1: "...ssssss...", 2: "....ssss...." },
          ],
          pattern: [
            { 6: ".rrrrrrrrrr.", 7: ".rrrrrrrrrr.", 8: ".r.r.rr.r.r.", 9: ".rrrrrrrrrr." },
            { 6: ".rrrrrrrrrr.", 7: ".yyyyyyyyyy.", 8: ".yyyyyyyyyy.", 9: ".rrrrrrrrrr." },
            { 6: ".yyyyyyyyyy.", 7: ".rrrrrrrrrr.", 8: ".rrrrrrrrrr.", 9: ".yyyyyyyyyy." },
          ],
          cuff: [
            { 11: "ssssssssssss", 12: "ssssssssssss", 13: "ssssssssssss" },
            { 11: "ssssssssssss", 12: "s.s.ssss.s.s", 13: "ssssssssssss" },
            { 11: "bbbbbbbbbbbb", 12: "bbbbbbbbbbbb", 13: "bbbbbbbbbbbb" },
          ],
        },
      },
    },
  },
  {
    id: "iglo",
    name: "iglo",
    categories: ["zima"],
    holeColor: "black",
    sizes: {
      half4: {
        base: [
          "........",
          "........",
          "........",
          "..ssss..",
          ".ssssss.",
          "........",
          "ssssssss",
          "........",
          "........",
          "........",
          "........",
          "........",
        ],
        parts: {
          bricks: [
            { 5: ".ssssss.", 7: "ssssssss" },
            { 5: ".ssssss.", 7: "s.ssss.s" },
            { 5: ".s.ss.s.", 7: "ssssssss" },
          ],
          door: [
            { 8: "ssssssss", 9: "sss..sss", 10: "sss..sss", 11: "sss..sss" },
            { 8: "sss..sss", 9: "sss..sss", 10: "sss..sss", 11: "sss..sss" },
            { 8: "ssbbbbss", 9: "ssb..bss", 10: "ssb..bss", 11: "ssb..bss" },
          ],
        },
      },
      half9: {
        base: [
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          "......sss",
          "....sssss",
          "...ssssss",
          "..sssssss",
          ".........",
          ".ssssssss",
          "sssssssss",
          ".........",
          "sssssssss",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
        ],
        parts: {
          bricks: [
            { 12: ".ssssssss", 15: "sssssssss" },
            { 12: ".ss.ss.ss", 15: "sssssssss" },
            { 12: ".ssss.sss", 15: "ss.sss.ss" },
          ],
          door: [
            {
              17: "sssssssss",
              18: "sssssss..",
              19: "ssssss...",
              20: "ssssss...",
              21: "ssssss...",
              22: "ssssss...",
              23: "ssssss...",
            },
            {
              17: "sssssssss",
              18: "ssssss...",
              19: "ssssss...",
              20: "ssssss...",
              21: "ssssss...",
              22: "ssssss...",
              23: "ssssss...",
            },
            {
              17: "ssssssbbb",
              18: "sssssbb..",
              19: "sssssb...",
              20: "sssssb...",
              21: "sssssb...",
              22: "sssssb...",
              23: "sssssb...",
            },
          ],
        },
      },
      half6: {
        base: [
          "............",
          "............",
          "............",
          "............",
          "............",
          "....ssss....",
          "..ssssssss..",
          ".ssssssssss.",
          ".ssssssssss.",
          "ssssssssssss",
          "ssssssssssss",
          "ssss....ssss",
          "ssss....ssss",
          "ssss....ssss",
          "ssss....ssss",
        ],
        parts: {
          bricks: [
            { 7: "..ssssssss..", 8: "...s....s...", 10: ".ss......ss.", 12: ".ss......ss." },
            { 8: "...s....s..." },
            { 10: ".ss......ss.", 12: ".ss......ss." },
          ],
          door: [
            { 10: "....ssss....", 11: "...ss..ss...", 12: "...s....s...", 13: "...s....s...", 14: "...s....s..." },
            { 10: "....ssss....", 11: "...s....s...", 12: "...s....s...", 13: "...s....s...", 14: "...s....s..." },
            { 10: "....bbbb....", 11: "...bb..bb...", 12: "...b....b...", 13: "...b....b...", 14: "...b....b..." },
          ],
        },
      },
    },
  },
  {
    id: "szalik",
    name: "szalik",
    categories: ["zima"],
    holeColor: null,
    sizes: {
      half4: {
        base: [
          "........",
          ".rrrrrr.",
          "rr....rr",
          "rr....rr",
          ".rrrrrr.",
          "...rr...",
          "..rrrr..",
          ".rr..rr.",
          "........",
          "........",
          "rr....rr",
          "........",
        ],
        parts: {
          stripes: [
            { 8: ".yy..yy.", 9: ".rr..rr." },
            { 8: ".gg..gg.", 9: ".gg..gg." },
            { 8: ".rr..rr.", 9: ".rr..rr." },
          ],
          fringe: [{ 11: "rr....rr" }, { 11: ".r....r." }, {}],
        },
      },
      half9: {
        base: [
          ".........",
          ".........",
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
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
          ".........",
        ],
        parts: {
          stripes: [
            { 17: "...yyyy..", 18: "..rrrr...", 19: "..yyyy...", 20: "..rrrr..." },
            { 17: "...gggg..", 18: "..rrrr...", 19: "..gggg...", 20: "..rrrr..." },
            { 17: "...rrrr..", 18: "..rrrr...", 19: "..rrrr...", 20: "..rrrr..." },
          ],
          fringe: [
            { 21: "..rrrr...", 22: "..r..r..." },
            { 21: "..rrrr...", 22: "..rrrr..." },
            { 21: "..rrrr..." },
          ],
        },
      },
      half6: {
        base: [
          "............",
          "..rrrrrrrr..",
          ".rr......rr.",
          ".rr......rr.",
          "..rrrrrrrr..",
          "....rrrr....",
          "...rrrrrr...",
          "..rrr..rrr..",
          "..rrr..rrr..",
          "..rrr..rrr..",
          ".rrr....rrr.",
          ".rrr....rrr.",
          ".rrr....rrr.",
          ".rrr....rrr.",
          "............",
        ],
        parts: {
          stripes: [
            { 9: "..yyy..yyy..", 10: ".rrr....rrr.", 11: ".yyy....yyy.", 12: ".rrr....rrr." },
            { 9: "..rrr..rrr..", 10: ".ggg....ggg.", 11: ".rrr....rrr.", 12: ".ggg....ggg." },
            { 9: "..rrr..rrr..", 10: ".rrr....rrr.", 11: ".rrr....rrr.", 12: ".rrr....rrr." },
          ],
          fringe: [{ 14: ".r.r....r.r." }, { 14: ".rrr....rrr." }, {}],
        },
      },
    },
  },
  {
    id: "niedzwiedz",
    name: "niedźwiedź polarny",
    categories: ["zima", "zwierzeta"],
    holeColor: "black",
    sizes: {
      half4: {
        base: [
          "........",
          ".ssssss.",
          ".s.ss.s.",
          ".sskkss.",
          "..ssss..",
          ".ssssss.",
          "........",
          "........",
          "ssssssss",
          ".ssssss.",
          "........",
          "sss..sss",
        ],
        parts: {
          ears: [{ 0: ".s....s." }, { 0: "ss....ss" }],
          arms: [
            { 6: "s.ssss.s", 7: "s.ssss.s" },
            { 6: "ssssssss", 7: "ssssssss" },
          ],
          legs: [{ 10: ".ss..ss." }, { 10: ".ssssss." }],
        },
      },
      half9: {
        base: [
          ".........",
          ".........",
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
        parts: {
          ears: [{ 1: "..ss....." }, { 1: ".sss....." }, { 0: "..ss.....", 1: "..ss....." }],
          mouth: [{ 10: "..sssssss" }, { 10: "..sssss.s" }],
          arms: [
            { 16: "sss.sssss", 17: "sss.sssss", 18: "sss.sssss" },
            { 16: "sssssssss", 17: "sssssssss", 18: "sssssssss" },
          ],
          legs: [
            { 21: ".ssssss..", 22: "sssssss.." },
            { 21: ".ssssssss", 22: ".sssssss." },
          ],
        },
      },
      half6: {
        base: [
          "............",
          ".ssssssssss.",
          ".ssssssssss.",
          ".ss.ssss.ss.",
          ".sssskkssss.",
          "..ss....ss..",
          "...ssssss...",
          ".ssssssssss.",
          "ssssssssssss",
          "sss.ssss.sss",
          "sss.ssss.sss",
          "ssssssssssss",
          ".ssssssssss.",
          "............",
          "sssss..sssss",
        ],
        parts: {
          ears: [{ 0: "..ss....ss.." }, { 0: ".sss....sss." }],
          mouth: [{ 5: "....ssss...." }, { 5: "....s..s...." }],
          arms: [{ 9: "...s....s...", 10: "...s....s..." }, {}],
          legs: [{ 13: ".ssss..ssss." }, { 13: ".ssssssssss." }],
        },
      },
    },
  },
];

// A line of exactly w cells is already the left half (used for the big 9×24 size, where full lines are long).
function leftHalf(line: string, w: number, where: string): string {
  if (line.length === w) return line;
  if (line.length !== 2 * w) throw new Error(`${where}: line "${line}" is not ${w} or ${2 * w} wide`);
  const left = line.slice(0, w);
  const right = line.slice(w);
  if ([...left].reverse().join("") !== right) throw new Error(`${where}: line "${line}" is not symmetric`);
  return left;
}

const objects = ART.map((art) => ({
  id: art.id,
  name: art.name,
  categories: art.categories,
  holeColor: art.holeColor,
  sizes: Object.fromEntries(
    Object.entries(art.sizes).map(([key, size]) => {
      const { w, h } = DIMS[key as keyof typeof DIMS];
      if (size.base.length !== h) throw new Error(`${art.id} ${key}: ${size.base.length} rows, expected ${h}`);
      const base = size.base.map((line, row) => [...leftHalf(line, w, `${art.id} ${key} base row ${row}`)]);
      const parts = Object.entries(size.parts).map(([id, variants]) => {
        const lines = variants.map((rows, index) => {
          const grid = Array.from({ length: h }, () => ".".repeat(w));
          for (const [row, line] of Object.entries(rows)) {
            grid[Number(row)] = leftHalf(line, w, `${art.id} ${key} ${id}[${index}] row ${row}`);
          }
          return grid;
        });
        for (const grid of lines)
          grid.forEach((line, row) => {
            [...line].forEach((ch, col) => {
              if (ch !== ".") base[row][col] = ".";
            });
          });
        return { id, variants: lines.map((grid) => ({ lines: grid })) };
      });
      return [key, { width: w, height: h, base: base.map((row) => row.join("")), parts }];
    }),
  ),
}));

const here = import.meta.dirname;
const shapesPath = nodePath.join(here, "shapes.json");
const shapes = fs.existsSync(shapesPath) ? (JSON.parse(fs.readFileSync(shapesPath, "utf8")) as object) : {};
fs.writeFileSync(
  nodePath.join(here, "mockup-drawings.json"),
  JSON.stringify({ approved: true, note: "S-54 winter mockup, hand-drawn in build-drawings.mts, accepted 2026-11-23 (szalik kept)", objects, shapes }, null, 1),
);
console.log("written", objects.length, "objects");
