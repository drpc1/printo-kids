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

function leftHalf(line: string, w: number, where: string): string {
  if (line.length !== 2 * w) throw new Error(`${where}: line "${line}" is not ${2 * w} wide`);
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
  JSON.stringify({ approved: false, note: "S-54 winter mockup, hand-drawn in build-drawings.mts", objects, shapes }, null, 1),
);
console.log("written", objects.length, "objects");
