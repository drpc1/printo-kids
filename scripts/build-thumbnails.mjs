// Builds the catalog thumbnails of the maze card and the symmetry card from the real generators and the real
// sheet layouts. Each card has its own fixed seed, so re-running yields byte-identical files. Run: npm run thumbnails
// Literal colors are allowed here: the output is a static public asset, not a page or component.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateMaze, mazeForSheet } from "../src/lib/maze/generate.ts";
import { levelById } from "../src/lib/maze/levels.ts";
import { layoutSheet } from "../src/lib/sheet/layout.ts";
import { collectWalls } from "../src/lib/sheet/walls.ts";
import { generateSymmetryCard, SYMMETRY_SETTING } from "../src/lib/symmetry/generate.ts";
import { layoutSymmetrySheet } from "../src/lib/symmetry/layout.ts";

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

// Symmetry card: the same elements SymmetrySheet draws (src/components/SymmetryGenerator.tsx), in literal black.
const SYMMETRY_SEED = 20261024;
const INSTRUCTION_SIZE = 7;
const INSTRUCTION_GAP = 6;
const INSTRUCTION_TEXT = "Dorysuj drugą połowę tak, jak w lustrze.";
const GRID_STROKE = 0.3;
const FRAME_STROKE = 0.65;
const AXIS_STROKE = 1.4;
const AXIS_DASH = "4 2.5";

const card = generateSymmetryCard(mulberry32(SYMMETRY_SEED), null);
if (card === null) {
  throw new Error(`Seed ${SYMMETRY_SEED} did not produce a valid symmetry card`);
}

const symmetrySheet = layoutSymmetrySheet({
  pageWidth: PAGE_WIDTH,
  pageHeight: PAGE_HEIGHT,
  inset: INSET,
  columns: card.columns,
  rows: card.rows,
  cellSize: SYMMETRY_SETTING.cellSize,
  instructionHeight: INSTRUCTION_SIZE,
  instructionGap: INSTRUCTION_GAP,
});
const grid = symmetrySheet.grid;
const symmetryCellSize = grid.width / card.columns;

const symmetryLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}">`,
  `<rect width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${PAGE_WIDTH - 0.5}" height="${PAGE_HEIGHT - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
  `<text x="${num(symmetrySheet.instruction.x)}" y="${num(symmetrySheet.instruction.y)}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${INSTRUCTION_SIZE}" text-anchor="middle" dominant-baseline="middle">${INSTRUCTION_TEXT}</text>`,
  `<g fill="#000">`,
];
for (const cell of card.cells) {
  symmetryLines.push(
    `<rect x="${num(grid.x + cell.col * symmetryCellSize)}" y="${num(grid.y + cell.row * symmetryCellSize)}" width="${num(symmetryCellSize)}" height="${num(symmetryCellSize)}"/>`,
  );
}
symmetryLines.push("</g>", `<g fill="none" stroke="#000" stroke-width="${GRID_STROKE}">`);
for (let index = 1; index < card.columns; index += 1) {
  const x = num(grid.x + index * symmetryCellSize);
  symmetryLines.push(`<line x1="${x}" y1="${num(grid.y)}" x2="${x}" y2="${num(grid.y + grid.height)}"/>`);
}
for (let index = 1; index < card.rows; index += 1) {
  const y = num(grid.y + index * symmetryCellSize);
  symmetryLines.push(`<line x1="${num(grid.x)}" y1="${y}" x2="${num(grid.x + grid.width)}" y2="${y}"/>`);
}
symmetryLines.push(
  "</g>",
  `<rect x="${num(grid.x)}" y="${num(grid.y)}" width="${num(grid.width)}" height="${num(grid.height)}" fill="none" stroke="#000" stroke-width="${FRAME_STROKE}" stroke-linejoin="miter"/>`,
  `<line x1="${num(symmetrySheet.axis.x1)}" y1="${num(symmetrySheet.axis.y1)}" x2="${num(symmetrySheet.axis.x2)}" y2="${num(symmetrySheet.axis.y2)}" stroke="#000" stroke-width="${AXIS_STROKE}" stroke-dasharray="${AXIS_DASH}"/>`,
  "</svg>",
  "",
);

const symmetryOutFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/symetria.svg");
writeFileSync(symmetryOutFile, symmetryLines.join("\n"));
console.log(`Wrote ${symmetryOutFile} (${card.key}, ${card.cells.length} cells)`);
