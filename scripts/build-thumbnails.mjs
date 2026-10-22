// Builds the catalog thumbnail of the maze card from the real generator and the real sheet layout.
// Fixed seed, so re-running yields a byte-identical file. Run: npm run thumbnails
// Literal colors are allowed here: the output is a static public asset, not a page or component.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateMaze, mazeForSheet } from "../src/lib/maze/generate.ts";
import { levelById } from "../src/lib/maze/levels.ts";
import { layoutSheet } from "../src/lib/sheet/layout.ts";
import { collectWalls } from "../src/lib/sheet/walls.ts";

const SEED = 20261023;
const LEVEL_ID = "lat5";
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const CHARACTER_MARK_SIZE = 30;
const SHEET_LABEL_SIZE = 7;
const WALL_WIDTH = 0.65;

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function num(value) {
  return String(Math.round(value * 1000) / 1000);
}

const level = levelById(LEVEL_ID);
const maze = mazeForSheet(generateMaze(LEVEL_ID, mulberry32(SEED)), LEVEL_ID);
if (maze === null) {
  throw new Error(`Seed ${SEED} did not produce a solvable ${LEVEL_ID} maze`);
}

const sheet = layoutSheet({
  pageWidth: PAGE_WIDTH,
  pageHeight: PAGE_HEIGHT,
  inset: INSET,
  columns: maze.width,
  rows: maze.height,
  entranceColumn: level.entrance.col,
  exitColumn: level.exit.col,
  markSize: CHARACTER_MARK_SIZE,
  characterSelected: false,
  levelShowsCharacter: level.showCharacter,
  labelHeight: SHEET_LABEL_SIZE,
});
const cellSize = sheet.maze.width / maze.width;
const walls = collectWalls(maze, sheet.maze.x, sheet.maze.y, cellSize);

function label(anchor) {
  return `<text x="${num(anchor.x)}" y="${num(anchor.y)}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${SHEET_LABEL_SIZE}" text-anchor="middle" dominant-baseline="middle">${anchor.text}</text>`;
}

const lines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}">`,
  `<rect width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${PAGE_WIDTH - 0.5}" height="${PAGE_HEIGHT - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
];
if (sheet.start !== null) {
  lines.push(label(sheet.start));
}
lines.push(label(sheet.meta));
lines.push(
  `<g fill="none" stroke="#000" stroke-linecap="square" stroke-linejoin="miter" stroke-width="${WALL_WIDTH}">`,
);
for (const wall of walls) {
  lines.push(`<line x1="${num(wall.x1)}" y1="${num(wall.y1)}" x2="${num(wall.x2)}" y2="${num(wall.y2)}"/>`);
}
lines.push("</g>", "</svg>", "");

const outFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/labirynt.svg");
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, lines.join("\n"));
console.log(`Wrote ${outFile} (${walls.length} wall segments)`);
