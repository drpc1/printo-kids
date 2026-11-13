// Builds the catalog thumbnails of the maze, symmetry, sudoku, sequence, nonogram, dictation, money, odd-one-out, copy-drawing and pattern-lines cards from the real generators and the real
// sheet layouts. Each card has its own fixed seed, so re-running yields byte-identical files. Run: npm run thumbnails
// Literal colors are allowed here: the output is a static public asset, not a page or component.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mazeEngine } from "../src/lib/maze/engine.ts";
import { levelById } from "../src/lib/maze/levels.ts";
import { layoutSheet } from "../src/lib/sheet/layout.ts";
import { collectWalls } from "../src/lib/sheet/walls.ts";
import { generateSymmetryCard } from "../src/lib/symmetry/generate.ts";
import { symmetryLevelById } from "../src/lib/symmetry/levels.ts";
import { layoutSymmetrySheet } from "../src/lib/symmetry/layout.ts";
import { SYMMETRY_SHEET } from "../src/lib/symmetry/sheet.ts";
import { sudokuBlock } from "../src/lib/sudoku/block.ts";
import { generateSudokuCard } from "../src/lib/sudoku/generate.ts";
import { layoutSudokuSheet } from "../src/lib/sudoku/layout.ts";
import { SUDOKU_SHEET } from "../src/lib/sudoku/sheet.ts";
import { sudokuShapePath } from "../src/lib/sudoku/shapes.ts";
import { generateSequenceCard } from "../src/lib/sequence/generate.ts";
import { layoutSequenceSheet } from "../src/lib/sequence/layout.ts";
import { SEQUENCE_LEVEL_LAT5 } from "../src/lib/sequence/levels.ts";
import { SEQUENCE_SHEET } from "../src/lib/sequence/sheet.ts";
import { sequenceShapeOutline } from "../src/lib/sequence/shapes.ts";
import { generateNonogramCard } from "../src/lib/nonogram/generate.ts";
import { blockLines, layoutNonogramSheet, longestClues } from "../src/lib/nonogram/layout.ts";
import { NONOGRAM_SHEET } from "../src/lib/nonogram/sheet.ts";
import { DEFAULT_NONOGRAM_SIZE_ID, nonogramSizeById } from "../src/lib/nonogram/sizes.ts";
import { generateDictationCard } from "../src/lib/dictation/generate.ts";
import { layoutDictationSheet } from "../src/lib/dictation/layout.ts";
import { DICTATION_LEVEL_LAT6 } from "../src/lib/dictation/levels.ts";
import { DICTATION_SHEET, formatDictationCommand } from "../src/lib/dictation/sheet.ts";
import { generateMoneyCard } from "../src/lib/money/generate.ts";
import { layoutMoneySheet, layoutPile } from "../src/lib/money/layout.ts";
import { DEFAULT_MONEY_LEVEL_ID, moneyLevelById } from "../src/lib/money/levels.ts";
import { MONEY_SHEET } from "../src/lib/money/sheet.ts";
import { generateOddOneOutCard } from "../src/lib/odd-one-out/generate.ts";
import { ICON_BOX, iconById } from "../src/lib/odd-one-out/icons.ts";
import { groupLayout, iconSize, layoutOddOneOutSheet } from "../src/lib/odd-one-out/layout.ts";
import { DEFAULT_ODD_ONE_OUT_LEVEL_ID, oddOneOutLevelById } from "../src/lib/odd-one-out/levels.ts";
import { ODD_ONE_OUT_SHEET } from "../src/lib/odd-one-out/sheet.ts";
import { generateCopyDrawingCard } from "../src/lib/copy-drawing/generate.ts";
import { layoutCopyDrawingSheet } from "../src/lib/copy-drawing/layout.ts";
import { copyDrawingLevelById, DEFAULT_COPY_DRAWING_LEVEL_ID } from "../src/lib/copy-drawing/levels.ts";
import { COPY_DRAWING_SHEET } from "../src/lib/copy-drawing/sheet.ts";
import { generatePatternLinesCard } from "../src/lib/pattern-lines/generate.ts";
import { layoutPatternLinesSheet } from "../src/lib/pattern-lines/layout.ts";
import { DEFAULT_PATTERN_LINES_LEVEL_ID, patternLinesLevelById } from "../src/lib/pattern-lines/levels.ts";
import { rowGeometry } from "../src/lib/pattern-lines/paths.ts";
import { PATTERN_LINES_SHEET } from "../src/lib/pattern-lines/sheet.ts";

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
const maze = mazeEngine.generate({ level: LEVEL_ID }, mulberry32(SEED), null).card;

const sheet = layoutSheet({
  pageWidth: PAGE_WIDTH,
  pageHeight: PAGE_HEIGHT,
  inset: INSET,
  columns: maze.width,
  rows: maze.height,
  entranceColumn: maze.entrance.col,
  exitColumn: maze.exit.col,
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

// Symmetry card: the same elements SymmetrySheet draws (src/components/SymmetryGenerator.tsx), in literal black,
// with the shared drawing constants from src/lib/symmetry/sheet.ts.
const SYMMETRY_SEED = 20261024;
const {
  pageWidth: SYMMETRY_PAGE_WIDTH,
  pageHeight: SYMMETRY_PAGE_HEIGHT,
  inset: SYMMETRY_INSET,
  instructionSize: INSTRUCTION_SIZE,
  instructionGap: INSTRUCTION_GAP,
  instructionText: INSTRUCTION_TEXT,
  gridStroke: GRID_STROKE,
  frameStroke: FRAME_STROKE,
  axisStroke: AXIS_STROKE,
  axisDash: AXIS_DASH,
} = SYMMETRY_SHEET;

const card = generateSymmetryCard(mulberry32(SYMMETRY_SEED), null, symmetryLevelById("lat5"));
if (card === null) {
  throw new Error(`Seed ${SYMMETRY_SEED} did not produce a valid symmetry card`);
}

const symmetrySheet = layoutSymmetrySheet({
  pageWidth: SYMMETRY_PAGE_WIDTH,
  pageHeight: SYMMETRY_PAGE_HEIGHT,
  inset: SYMMETRY_INSET,
  columns: card.columns,
  rows: card.rows,
  cellSize: card.cellSize,
  instructionHeight: INSTRUCTION_SIZE,
  instructionGap: INSTRUCTION_GAP,
});
const grid = symmetrySheet.grid;
const symmetryCellSize = grid.width / card.columns;

const symmetryLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SYMMETRY_PAGE_WIDTH} ${SYMMETRY_PAGE_HEIGHT}" width="${SYMMETRY_PAGE_WIDTH}" height="${SYMMETRY_PAGE_HEIGHT}">`,
  `<rect width="${SYMMETRY_PAGE_WIDTH}" height="${SYMMETRY_PAGE_HEIGHT}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${SYMMETRY_PAGE_WIDTH - 0.5}" height="${SYMMETRY_PAGE_HEIGHT - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
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

// Sudoku card: the same elements SudokuSheet draws (src/components/SudokuGenerator.tsx), in literal black, with the
// shared drawing constants from src/lib/sudoku/sheet.ts.
const SUDOKU_SEED = 20261025;
const sudokuCard = generateSudokuCard(mulberry32(SUDOKU_SEED), null);
if (sudokuCard === null) {
  throw new Error(`Seed ${SUDOKU_SEED} did not produce a valid sudoku card`);
}

const sudokuSheet = layoutSudokuSheet({
  pageWidth: SUDOKU_SHEET.pageWidth,
  pageHeight: SUDOKU_SHEET.pageHeight,
  inset: SUDOKU_SHEET.inset,
  size: sudokuCard.size,
  blockRows: sudokuBlock(sudokuCard.size).rows,
  blockColumns: sudokuBlock(sudokuCard.size).columns,
  cellSize: SUDOKU_SHEET.cellSize[sudokuCard.size],
  instructionLineCount: SUDOKU_SHEET.instructionLines.length,
  instructionSize: SUDOKU_SHEET.instructionSize,
  instructionLineGap: SUDOKU_SHEET.instructionLineGap,
  instructionGap: SUDOKU_SHEET.instructionGap,
});
const sudokuGrid = sudokuSheet.grid;
const sudokuShapeSize = SUDOKU_SHEET.cellSize[sudokuCard.size] * SUDOKU_SHEET.shapeScale;
const sudokuLine = (line, width) =>
  `<line x1="${num(line.x1)}" y1="${num(line.y1)}" x2="${num(line.x2)}" y2="${num(line.y2)}" stroke="#000" stroke-width="${width}"/>`;

const sudokuLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SUDOKU_SHEET.pageWidth} ${SUDOKU_SHEET.pageHeight}" width="${SUDOKU_SHEET.pageWidth}" height="${SUDOKU_SHEET.pageHeight}">`,
  `<rect width="${SUDOKU_SHEET.pageWidth}" height="${SUDOKU_SHEET.pageHeight}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${SUDOKU_SHEET.pageWidth - 0.5}" height="${SUDOKU_SHEET.pageHeight - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
];
SUDOKU_SHEET.instructionLines.forEach((text, index) => {
  sudokuLines.push(
    `<text x="${num(sudokuSheet.instruction.x)}" y="${num(sudokuSheet.instruction.ys[index])}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${SUDOKU_SHEET.instructionSize}" text-anchor="middle" dominant-baseline="middle">${text}</text>`,
  );
});
sudokuLines.push(`<g fill="none" stroke="#000" stroke-width="${SUDOKU_SHEET.shapeStroke}" stroke-linejoin="round">`);
sudokuCard.givens.forEach((row, r) => {
  row.forEach((symbol, c) => {
    if (symbol === null) {
      return;
    }
    const center = sudokuSheet.cellCenter(r, c);
    sudokuLines.push(`<path d="${sudokuShapePath(sudokuCard.shapes[symbol], center.x, center.y, sudokuShapeSize)}"/>`);
  });
});
sudokuLines.push("</g>");
for (const line of sudokuSheet.cellLines) sudokuLines.push(sudokuLine(line, SUDOKU_SHEET.cellStroke));
for (const line of sudokuSheet.blockLines) sudokuLines.push(sudokuLine(line, SUDOKU_SHEET.blockStroke));
sudokuLines.push(
  `<rect x="${num(sudokuGrid.x)}" y="${num(sudokuGrid.y)}" width="${num(sudokuGrid.width)}" height="${num(sudokuGrid.height)}" fill="none" stroke="#000" stroke-width="${SUDOKU_SHEET.frameStroke}" stroke-linejoin="miter"/>`,
  "</svg>",
  "",
);

const sudokuOutFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/sudoku.svg");
writeFileSync(sudokuOutFile, sudokuLines.join("\n"));
console.log(`Wrote ${sudokuOutFile} (${sudokuCard.key})`);
// Sequence card: the same elements SequenceSheet draws (src/components/SequenceGenerator.tsx), in literal black,
// with the shared drawing constants from src/lib/sequence/sheet.ts and the shape geometry from shapes.ts.
const SEQUENCE_SEED = 20261025;
const SEQUENCE = SEQUENCE_SHEET;

const sequenceCard = generateSequenceCard(mulberry32(SEQUENCE_SEED), null, SEQUENCE_LEVEL_LAT5);
if (sequenceCard === null) {
  throw new Error(`Seed ${SEQUENCE_SEED} did not produce a valid sequence card`);
}

const sequenceSheet = layoutSequenceSheet({
  pageWidth: SEQUENCE.pageWidth,
  pageHeight: SEQUENCE.pageHeight,
  inset: SEQUENCE.inset,
  fieldsPerRow: sequenceCard.fieldsPerRow,
  rowCount: sequenceCard.rows.length,
  fieldGapRatio: SEQUENCE.fieldGapRatio,
  instructionHeight: SEQUENCE.instructionSize,
  instructionGap: SEQUENCE.instructionGap,
});
const fieldSize = sequenceSheet.fieldSize;
const shapeSize = fieldSize * SEQUENCE.shapeScale;

const sequenceLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SEQUENCE.pageWidth} ${SEQUENCE.pageHeight}" width="${SEQUENCE.pageWidth}" height="${SEQUENCE.pageHeight}">`,
  `<rect width="${SEQUENCE.pageWidth}" height="${SEQUENCE.pageHeight}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${SEQUENCE.pageWidth - 0.5}" height="${SEQUENCE.pageHeight - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
  `<text x="${num(sequenceSheet.instruction.x)}" y="${num(sequenceSheet.instruction.y)}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${SEQUENCE.instructionSize}" text-anchor="middle" dominant-baseline="middle">${SEQUENCE.instructionText}</text>`,
];
sequenceCard.rows.forEach((row, rowIndex) => {
  sequenceSheet.rows[rowIndex].fields.forEach((field, fieldIndex) => {
    const empty = row.gaps.includes(fieldIndex);
    const dash = empty ? ` stroke-dasharray="${SEQUENCE.emptyFieldDash}"` : "";
    const stroke = empty ? SEQUENCE.emptyFieldStroke : SEQUENCE.fieldStroke;
    sequenceLines.push(
      `<rect x="${num(field.x)}" y="${num(field.y)}" width="${num(fieldSize)}" height="${num(fieldSize)}" fill="none" stroke="#000" stroke-width="${stroke}"${dash}/>`,
    );
    if (empty) {
      sequenceLines.push(
        `<text x="${num(field.x + fieldSize - SEQUENCE.questionInset)}" y="${num(field.y + SEQUENCE.questionInset)}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${SEQUENCE.questionSize}" text-anchor="end" dominant-baseline="hanging">?</text>`,
      );
      return;
    }
    const item = row.values[fieldIndex];
    if (typeof item === "number") {
      throw new Error("The 5 lat thumbnail has shapes only; draw numbers here before using a level that has them");
    }
    const outline = sequenceShapeOutline(item, field.x + fieldSize / 2, field.y + fieldSize / 2, shapeSize);
    const common = `fill="none" stroke="#000" stroke-width="${SEQUENCE.shapeStroke}"`;
    if (outline.kind === "circle") {
      sequenceLines.push(`<circle cx="${num(outline.cx)}" cy="${num(outline.cy)}" r="${num(outline.r)}" ${common}/>`);
    } else if (outline.kind === "path") {
      sequenceLines.push(`<path d="${outline.d}" ${common} stroke-linejoin="round"/>`);
    } else {
      sequenceLines.push(`<polygon points="${outline.points}" ${common} stroke-linejoin="round"/>`);
    }
  });
});
sequenceLines.push("</svg>", "");

const sequenceOutFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/sekwencje.svg");
writeFileSync(sequenceOutFile, sequenceLines.join("\n"));
console.log(`Wrote ${sequenceOutFile} (${sequenceCard.key.length} key chars)`);

// Nonogram card: the same elements NonogramSheet draws (src/components/NonogramGenerator.tsx), in literal black, empty
// (no solution), with the shared drawing constants from src/lib/nonogram/sheet.ts.
const NONOGRAM_SEED = 20261026;
const NONOGRAM_SIZE = nonogramSizeById(DEFAULT_NONOGRAM_SIZE_ID);
const NONOGRAM = NONOGRAM_SHEET;

const nonogramCard = generateNonogramCard(mulberry32(NONOGRAM_SEED), null, NONOGRAM_SIZE);
if (nonogramCard === null) {
  throw new Error(`Seed ${NONOGRAM_SEED} did not produce a valid nonogram card`);
}

const nonogramSheet = layoutNonogramSheet({
  pageWidth: NONOGRAM.pageWidth,
  pageHeight: NONOGRAM.pageHeight,
  inset: NONOGRAM.inset,
  columns: nonogramCard.columns,
  rows: nonogramCard.rows,
  cellSize: nonogramCard.cellSize,
  digitSize: NONOGRAM_SIZE.digitSize,
  ...longestClues(nonogramCard.clues),
  instructionSize: NONOGRAM.instructionSize,
  instructionGap: NONOGRAM.instructionGap,
  clueGap: NONOGRAM.clueGap,
  clueSlot: NONOGRAM.clueSlot,
});
const nonogramGrid = nonogramSheet.grid;
const nonogramCell = nonogramCard.cellSize;
const thickColumns = new Set(blockLines(nonogramCard.columns, NONOGRAM.blockEvery));
const thickRows = new Set(blockLines(nonogramCard.rows, NONOGRAM.blockEvery));

const nonogramLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${NONOGRAM.pageWidth} ${NONOGRAM.pageHeight}" width="${NONOGRAM.pageWidth}" height="${NONOGRAM.pageHeight}">`,
  `<rect width="${NONOGRAM.pageWidth}" height="${NONOGRAM.pageHeight}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${NONOGRAM.pageWidth - 0.5}" height="${NONOGRAM.pageHeight - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
  `<text x="${num(nonogramSheet.instruction.x)}" y="${num(nonogramSheet.instruction.y)}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${NONOGRAM.instructionSize}" text-anchor="middle" dominant-baseline="middle">${NONOGRAM.instructionText}</text>`,
  `<g fill="none" stroke="#000">`,
];
for (let index = 0; index <= nonogramCard.columns; index += 1) {
  const x = num(nonogramGrid.x + index * nonogramCell);
  const width = thickColumns.has(index) ? NONOGRAM.blockStroke : NONOGRAM.gridStroke;
  nonogramLines.push(
    `<line x1="${x}" y1="${num(nonogramGrid.y)}" x2="${x}" y2="${num(nonogramGrid.y + nonogramGrid.height)}" stroke-width="${width}"/>`,
  );
}
for (let index = 0; index <= nonogramCard.rows; index += 1) {
  const y = num(nonogramGrid.y + index * nonogramCell);
  const width = thickRows.has(index) ? NONOGRAM.blockStroke : NONOGRAM.gridStroke;
  nonogramLines.push(
    `<line x1="${num(nonogramGrid.x)}" y1="${y}" x2="${num(nonogramGrid.x + nonogramGrid.width)}" y2="${y}" stroke-width="${width}"/>`,
  );
}
nonogramLines.push(
  "</g>",
  `<rect x="${num(nonogramGrid.x)}" y="${num(nonogramGrid.y)}" width="${num(nonogramGrid.width)}" height="${num(nonogramGrid.height)}" fill="none" stroke="#000" stroke-width="${NONOGRAM.frameStroke}" stroke-linejoin="miter"/>`,
  `<g fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${NONOGRAM_SIZE.digitSize}" font-weight="${NONOGRAM.clueFontWeight}" text-anchor="middle" dominant-baseline="central">`,
);
nonogramCard.clues.rows.forEach((clue, rowIndex) => {
  clue.forEach((value, position) => {
    nonogramLines.push(
      `<text x="${num(nonogramSheet.rowClueX(clue.length - 1 - position))}" y="${num(nonogramGrid.y + (rowIndex + 0.5) * nonogramCell)}">${value}</text>`,
    );
  });
});
nonogramCard.clues.columns.forEach((clue, columnIndex) => {
  clue.forEach((value, position) => {
    nonogramLines.push(
      `<text x="${num(nonogramGrid.x + (columnIndex + 0.5) * nonogramCell)}" y="${num(nonogramSheet.columnClueY(clue.length - 1 - position))}">${value}</text>`,
    );
  });
});
nonogramLines.push("</g>", "</svg>", "");

const nonogramOutFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/nonogram.svg");
writeFileSync(nonogramOutFile, nonogramLines.join("\n"));
console.log(`Wrote ${nonogramOutFile} (${nonogramCard.key})`);
// Graphic dictation card: the same elements DictationSheet draws (src/components/DictationGenerator.tsx), in literal
// black, with the shared drawing constants from src/lib/dictation/sheet.ts. The outline is the answer and is not drawn.
const DICTATION_SEED = 20261026;
const DICTATION = DICTATION_SHEET;

const dictationCard = generateDictationCard(mulberry32(DICTATION_SEED), null, DICTATION_LEVEL_LAT6);
if (dictationCard === null) {
  throw new Error(`Seed ${DICTATION_SEED} did not produce a valid dictation card`);
}

const dictationSheet = layoutDictationSheet({
  pageWidth: DICTATION.pageWidth,
  pageHeight: DICTATION.pageHeight,
  inset: DICTATION.inset,
  columns: dictationCard.columns,
  rows: dictationCard.rows,
  cellSize: dictationCard.cellSize,
  commandCount: dictationCard.commands.length,
  commandsPerRow: DICTATION_LEVEL_LAT6.commandsPerRow,
  commandRowHeight: DICTATION_LEVEL_LAT6.commandRowHeight,
  instructionSize: DICTATION.instructionSize,
  instructionGap: DICTATION.instructionGap,
  listGap: DICTATION.listGap,
});
const dictationGrid = dictationSheet.grid;
const dictationCell = dictationCard.cellSize;
const dictationFont = 'font-family="ui-sans-serif, system-ui, sans-serif"';

const dictationLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${DICTATION.pageWidth} ${DICTATION.pageHeight}" width="${DICTATION.pageWidth}" height="${DICTATION.pageHeight}">`,
  `<rect width="${DICTATION.pageWidth}" height="${DICTATION.pageHeight}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${DICTATION.pageWidth - 0.5}" height="${DICTATION.pageHeight - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
  `<text x="${num(dictationSheet.instruction.x)}" y="${num(dictationSheet.instruction.y)}" fill="#000" ${dictationFont} font-size="${DICTATION.instructionSize}" text-anchor="middle" dominant-baseline="middle">${DICTATION.instructionText}</text>`,
];
dictationCard.commands.forEach((command, index) => {
  const box = dictationSheet.commands[index];
  const inset = DICTATION.commandBoxInset;
  dictationLines.push(
    `<rect x="${num(box.x + inset)}" y="${num(box.y + inset)}" width="${num(box.width - inset * 2)}" height="${num(box.height - inset * 2)}" rx="${DICTATION.commandBoxRadius}" fill="none" stroke="#000" stroke-width="${DICTATION.commandBoxStroke}"/>`,
    `<text x="${num(box.x + DICTATION.commandNumberOffsetX)}" y="${num(box.y + DICTATION.commandNumberOffsetY)}" fill="#71717a" ${dictationFont} font-size="${DICTATION.commandNumberSize}">${index + 1}</text>`,
    `<text x="${num(box.x + box.width / 2)}" y="${num(box.y + box.height / 2 + DICTATION.commandNumberSize / 2)}" fill="#000" ${dictationFont} font-size="${DICTATION_LEVEL_LAT6.commandFontSize}" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${formatDictationCommand(command)}</text>`,
  );
});
dictationLines.push(`<g fill="none" stroke="#000" stroke-width="${DICTATION.gridStroke}">`);
for (let index = 1; index < dictationCard.columns; index += 1) {
  const x = num(dictationGrid.x + index * dictationCell);
  dictationLines.push(
    `<line x1="${x}" y1="${num(dictationGrid.y)}" x2="${x}" y2="${num(dictationGrid.y + dictationGrid.height)}"/>`,
  );
}
for (let index = 1; index < dictationCard.rows; index += 1) {
  const y = num(dictationGrid.y + index * dictationCell);
  dictationLines.push(
    `<line x1="${num(dictationGrid.x)}" y1="${y}" x2="${num(dictationGrid.x + dictationGrid.width)}" y2="${y}"/>`,
  );
}
dictationLines.push(
  "</g>",
  `<rect x="${num(dictationGrid.x)}" y="${num(dictationGrid.y)}" width="${num(dictationGrid.width)}" height="${num(dictationGrid.height)}" fill="none" stroke="#000" stroke-width="${DICTATION.frameStroke}" stroke-linejoin="miter"/>`,
  `<circle cx="${num(dictationGrid.x + dictationCard.start.col * dictationCell)}" cy="${num(dictationGrid.y + dictationCard.start.row * dictationCell)}" r="${DICTATION.startDotRadius}" fill="#000"/>`,
  "</svg>",
  "",
);

const dictationOutFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/dyktando.svg");
writeFileSync(dictationOutFile, dictationLines.join("\n"));
console.log(`Wrote ${dictationOutFile} (${dictationCard.key}, ${dictationCard.commands.length} commands)`);

// Money card: the same elements MoneySheet draws (src/components/MoneyGenerator.tsx), in literal black, with the shared
// drawing constants from src/lib/money/sheet.ts. The band holds the plain instruction (no character).
const MONEY_SEED = 20261101;
const MONEY = MONEY_SHEET;

const moneyCard = generateMoneyCard(mulberry32(MONEY_SEED), null, moneyLevelById(DEFAULT_MONEY_LEVEL_ID, "pln"));
if (moneyCard === null) {
  throw new Error(`Seed ${MONEY_SEED} did not produce a valid money card`);
}

const moneySheet = layoutMoneySheet({
  pageWidth: MONEY.pageWidth,
  pageHeight: MONEY.pageHeight,
  inset: MONEY.inset,
  rowCount: moneyCard.rows.length,
  bandHeight: MONEY.bandHeight,
  bandGap: MONEY.bandGap,
  rowGap: MONEY.rowGap,
  signSize: MONEY.signSize,
  signGap: MONEY.signGap,
  pilePadding: MONEY.pilePadding,
});

const moneyLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MONEY.pageWidth} ${MONEY.pageHeight}" width="${MONEY.pageWidth}" height="${MONEY.pageHeight}">`,
  `<rect width="${MONEY.pageWidth}" height="${MONEY.pageHeight}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${MONEY.pageWidth - 0.5}" height="${MONEY.pageHeight - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
  `<text x="${num(MONEY.pageWidth / 2)}" y="${num(moneySheet.band.y + moneySheet.band.height / 2)}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${MONEY.plainInstructionSize}" text-anchor="middle" dominant-baseline="middle">${MONEY.instructionLines.join(" ").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</text>`,
];
const moneyFont = `font-family="ui-sans-serif, system-ui, sans-serif" font-weight="${MONEY.fontWeight}" text-anchor="middle" dominant-baseline="central" fill="#000"`;
moneyCard.rows.forEach((row, rowIndex) => {
  const rowLayout = moneySheet.rows[rowIndex];
  for (const [values, area] of [
    [row.left, rowLayout.left],
    [row.right, rowLayout.right],
  ]) {
    moneyLines.push(
      `<rect x="${num(area.x)}" y="${num(area.y)}" width="${num(area.width)}" height="${num(area.height)}" rx="${MONEY.pileFrameRadius}" fill="none" stroke="#000" stroke-width="${MONEY.pileFrameStroke}"/>`,
    );
    const laid = layoutPile(values, area.innerWidth, moneyCard.currency);
    const left = area.x + MONEY.pilePadding;
    const top = area.y + MONEY.pilePadding + (area.innerHeight - laid.height) / 2;
    for (const piece of laid.pieces) {
      const x = left + piece.x;
      const y = top + piece.y;
      if (piece.kind === "coin") {
        moneyLines.push(
          `<circle cx="${num(x + piece.width / 2)}" cy="${num(y + piece.height / 2)}" r="${num(piece.width / 2 - MONEY.coinStroke / 2)}" fill="#fff" stroke="#000" stroke-width="${MONEY.coinStroke}"/>`,
          `<text x="${num(x + piece.width / 2)}" y="${num(y + piece.height / 2)}" font-size="${MONEY.coinFontSize}" ${moneyFont}>${piece.value}</text>`,
        );
      } else {
        const inner = MONEY.noteInnerInset;
        moneyLines.push(
          `<rect x="${num(x)}" y="${num(y)}" width="${piece.width}" height="${piece.height}" rx="1" fill="#fff" stroke="#000" stroke-width="${MONEY.noteStroke}"/>`,
          `<rect x="${num(x + inner)}" y="${num(y + inner)}" width="${piece.width - 2 * inner}" height="${piece.height - 2 * inner}" rx="0.6" fill="none" stroke="#000" stroke-width="${MONEY.noteInnerStroke}"/>`,
          `<text x="${num(x + piece.width / 2)}" y="${num(y + piece.height / 2)}" font-size="${MONEY.noteFontSize}" ${moneyFont}>${piece.value}</text>`,
        );
      }
    }
  }
  moneyLines.push(
    `<rect x="${num(rowLayout.sign.x)}" y="${num(rowLayout.sign.y)}" width="${rowLayout.sign.size}" height="${rowLayout.sign.size}" rx="2" fill="none" stroke="#000" stroke-width="${MONEY.signStroke}"/>`,
  );
});
moneyLines.push("</svg>", "");

const moneyOutFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/pieniadze.svg");
writeFileSync(moneyOutFile, moneyLines.join("\n"));
console.log(`Wrote ${moneyOutFile} (${moneyCard.key.length} key chars)`);

// Odd-one-out card: the same elements OddOneOutSheet draws (src/components/OddOneOutGenerator.tsx), in literal black
// and white at the default level without colors, with the shared drawing constants from src/lib/odd-one-out/sheet.ts.
// The band holds the plain instruction (no character).
const ODD_SEED = 20261108;
const ODD = ODD_ONE_OUT_SHEET;
const oddLevel = oddOneOutLevelById(DEFAULT_ODD_ONE_OUT_LEVEL_ID);

const oddCard = generateOddOneOutCard(mulberry32(ODD_SEED), null, oddLevel, false);
if (oddCard === null) {
  throw new Error(`Seed ${ODD_SEED} did not produce a valid odd-one-out card`);
}

const oddSheet = layoutOddOneOutSheet({
  pageWidth: ODD.pageWidth,
  pageHeight: ODD.pageHeight,
  inset: ODD.inset,
  rowCount: oddCard.rows.length,
  itemCount: oddLevel.itemCount,
  bandHeight: ODD.bandHeight,
  bandGap: ODD.bandGap,
  rowGap: ODD.rowGap,
  slotPadding: ODD.slotPadding,
});

const ODD_TONE = { ink: "#000", paper: "#fff" };

function oddFigure(figure) {
  const color = ODD_TONE[figure.tone];
  switch (figure.kind) {
    case "circle":
      return `<circle cx="${figure.cx}" cy="${figure.cy}" r="${figure.r}" fill="${color}"/>`;
    case "ellipse": {
      const turn = figure.rotate === undefined ? "" : ` transform="rotate(${figure.rotate} ${figure.cx} ${figure.cy})"`;
      return `<ellipse cx="${figure.cx}" cy="${figure.cy}" rx="${figure.rx}" ry="${figure.ry}" fill="${color}"${turn}/>`;
    }
    case "rect": {
      const turn =
        figure.rotate === undefined
          ? ""
          : ` transform="rotate(${figure.rotate} ${figure.x + figure.width / 2} ${figure.y + figure.height / 2})"`;
      const round = figure.rx === undefined ? "" : ` rx="${figure.rx}"`;
      return `<rect x="${figure.x}" y="${figure.y}" width="${figure.width}" height="${figure.height}"${round} fill="${color}"${turn}/>`;
    }
    case "polygon":
      return `<polygon points="${figure.points.map((point) => point.join(",")).join(" ")}" fill="${color}"/>`;
    case "path":
      return figure.strokeWidth === undefined
        ? `<path d="${figure.d}" fill="${color}"/>`
        : `<path d="${figure.d}" fill="none" stroke="${color}" stroke-width="${figure.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "line":
      return `<line x1="${figure.x1}" y1="${figure.y1}" x2="${figure.x2}" y2="${figure.y2}" stroke="${color}" stroke-width="${figure.strokeWidth}" stroke-linecap="round"/>`;
    default:
      throw new Error(`Unknown icon figure ${figure.kind}`);
  }
}

const oddLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ODD.pageWidth} ${ODD.pageHeight}" width="${ODD.pageWidth}" height="${ODD.pageHeight}">`,
  `<rect width="${ODD.pageWidth}" height="${ODD.pageHeight}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${ODD.pageWidth - 0.5}" height="${ODD.pageHeight - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
  `<text x="${num(ODD.pageWidth / 2)}" y="${num(oddSheet.band.y + oddSheet.band.height / 2)}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${ODD.plainInstructionSize}" text-anchor="middle" dominant-baseline="middle">${ODD.instructionLines.join(" ")}</text>`,
];
oddCard.rows.forEach((row, rowIndex) => {
  const rowLayout = oddSheet.rows[rowIndex];
  oddLines.push(
    `<rect x="${num(rowLayout.x)}" y="${num(rowLayout.y)}" width="${num(rowLayout.width)}" height="${num(rowLayout.height)}" rx="${ODD.rowFrameRadius}" fill="none" stroke="#000" stroke-width="${ODD.rowFrameStroke}"/>`,
  );
  row.items.forEach((item, itemIndex) => {
    const { cx, cy } = rowLayout.slots[itemIndex];
    const scale = item.size === "small" ? oddLevel.smallRatio : 1;
    if (item.icon !== null) {
      const icon = iconById(item.icon);
      const size = iconSize(oddSheet.slot, scale);
      oddLines.push(
        `<g transform="translate(${num(cx - size / 2)} ${num(cy - size / 2)}) scale(${num(size / ICON_BOX)})">`,
        ...icon.figures.map(oddFigure),
        "</g>",
      );
      return;
    }
    const group = groupLayout(item.count, oddSheet.slot, scale);
    const strokeWidth = Math.max(ODD.shapeStrokeMin, group.unit * ODD.shapeStrokeRatio);
    for (const point of group.points) {
      oddLines.push(
        `<path d="${sudokuShapePath(item.shape, cx + point.x, cy + point.y, group.unit)}" fill="#fff" stroke="#000" stroke-width="${num(strokeWidth)}" stroke-linejoin="round"/>`,
      );
    }
  });
});
oddLines.push("</svg>", "");

const oddOutFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/niepasuje.svg");
writeFileSync(oddOutFile, oddLines.join("\n"));
console.log(`Wrote ${oddOutFile} (${oddCard.key.length} key chars)`);

// Copy-drawing card: the same elements CopyDrawingSheet draws (src/components/CopyDrawingSheet.tsx), in literal black and
// white at the default level and the category "wszystkie", with the shared drawing constants from
// src/lib/copy-drawing/sheet.ts. The band holds the plain instruction (no character).
const COPY_SEED = 20261109;
const COPY = COPY_DRAWING_SHEET;
const copyLevel = copyDrawingLevelById(DEFAULT_COPY_DRAWING_LEVEL_ID);

const copyCard = generateCopyDrawingCard(mulberry32(COPY_SEED), null, copyLevel, "wszystkie");
if (copyCard === null) {
  throw new Error(`Seed ${COPY_SEED} did not produce a valid copy-drawing card`);
}

const copySheet = layoutCopyDrawingSheet(copyLevel, COPY.plainInstructionSize);
const copyLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COPY.pageWidth} ${COPY.pageHeight}" width="${COPY.pageWidth}" height="${COPY.pageHeight}">`,
  `<rect width="${COPY.pageWidth}" height="${COPY.pageHeight}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${COPY.pageWidth - 0.5}" height="${COPY.pageHeight - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
  `<text x="${num(COPY.pageWidth / 2)}" y="${num(copySheet.band.y + copySheet.band.height / 2)}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${COPY.plainInstructionSize}" text-anchor="middle" dominant-baseline="middle">${COPY.instructionText}</text>`,
];
for (const [rect, pattern] of [
  [copySheet.source, copyCard.pattern],
  [copySheet.copy, null],
]) {
  if (pattern !== null) {
    copyLines.push('<g fill="#000">');
    pattern.forEach((row, rowIndex) => {
      row.forEach((filled, columnIndex) => {
        if (filled) {
          copyLines.push(
            `<rect x="${num(rect.x + columnIndex * copySheet.cell)}" y="${num(rect.y + rowIndex * copySheet.cell)}" width="${copySheet.cell}" height="${copySheet.cell}"/>`,
          );
        }
      });
    });
    copyLines.push("</g>");
  }
  const thickColumns = new Set(blockLines(copySheet.columns, COPY.blockEvery));
  const thickRows = new Set(blockLines(copySheet.rows, COPY.blockEvery));
  copyLines.push('<g fill="none" stroke="#000">');
  for (let index = 0; index <= copySheet.columns; index += 1) {
    const x = num(rect.x + index * copySheet.cell);
    const width = thickColumns.has(index) ? COPY.blockStroke : COPY.gridStroke;
    copyLines.push(
      `<line x1="${x}" y1="${num(rect.y)}" x2="${x}" y2="${num(rect.y + rect.height)}" stroke-width="${width}"/>`,
    );
  }
  for (let index = 0; index <= copySheet.rows; index += 1) {
    const y = num(rect.y + index * copySheet.cell);
    const width = thickRows.has(index) ? COPY.blockStroke : COPY.gridStroke;
    copyLines.push(
      `<line x1="${num(rect.x)}" y1="${y}" x2="${num(rect.x + rect.width)}" y2="${y}" stroke-width="${width}"/>`,
    );
  }
  copyLines.push(
    "</g>",
    `<rect x="${num(rect.x)}" y="${num(rect.y)}" width="${num(rect.width)}" height="${num(rect.height)}" fill="none" stroke="#000" stroke-width="${COPY.frameStroke}" stroke-linejoin="miter"/>`,
  );
}
copyLines.push("</svg>", "");

const copyOutFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/kopiuj.svg");
writeFileSync(copyOutFile, copyLines.join("\n"));
console.log(`Wrote ${copyOutFile} (${copyCard.key})`);

// Pattern-lines card: the elements PatternLinesSheet draws (src/components/PatternLinesSheet.tsx), in literal black and
// grey, at the default level with the help lines on, with the geometry of src/lib/pattern-lines/paths.ts and the
// constants of src/lib/pattern-lines/sheet.ts. The band holds the plain instruction (no character).
const PATTERN_SEED = 20261110;
const PATTERN = PATTERN_LINES_SHEET;
const patternLevel = patternLinesLevelById(DEFAULT_PATTERN_LINES_LEVEL_ID);

const patternCard = generatePatternLinesCard(mulberry32(PATTERN_SEED), null, patternLevel);
if (patternCard === null) {
  throw new Error(`Seed ${PATTERN_SEED} did not produce a valid pattern-lines card`);
}

const patternLayout = layoutPatternLinesSheet(patternLevel, PATTERN.plainInstructionSize);
const patternPathD = (points) =>
  points.map((point, index) => `${index === 0 ? "M" : "L"}${num(point.x)} ${num(point.y)}`).join(" ");
const patternLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PATTERN.pageWidth} ${PATTERN.pageHeight}" width="${PATTERN.pageWidth}" height="${PATTERN.pageHeight}">`,
  `<rect width="${PATTERN.pageWidth}" height="${PATTERN.pageHeight}" fill="#fff"/>`,
  `<rect x="0.25" y="0.25" width="${PATTERN.pageWidth - 0.5}" height="${PATTERN.pageHeight - 0.5}" fill="none" stroke="#d4d4d8" stroke-width="0.5"/>`,
  `<text x="${num(PATTERN.pageWidth / 2)}" y="${num(patternLayout.band.y + patternLayout.band.height / 2)}" fill="#000" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${PATTERN.plainInstructionSize}" text-anchor="middle" dominant-baseline="middle">${patternLevel.instruction}</text>`,
];
patternCard.rows.forEach((row, index) => {
  const geometry = rowGeometry(row, patternLevel, true);
  patternLines.push(`<g transform="translate(${num(patternLayout.left)} ${num(patternLayout.centers[index])})">`);
  for (const guide of geometry.guides) {
    const dash = guide.dash === null ? "" : ` stroke-dasharray="${guide.dash}"`;
    patternLines.push(
      `<line x1="${num(guide.x1)}" y1="${num(guide.y)}" x2="${num(guide.x2)}" y2="${num(guide.y)}" stroke="${guide.tone === "muted" ? "#71717a" : "#d4d4d8"}" stroke-width="${guide.stroke}"${dash}/>`,
    );
  }
  if (geometry.track) {
    patternLines.push(
      `<path d="${patternPathD(geometry.path)}" fill="none" stroke="#d4d4d8" stroke-width="${PATTERN.trackStroke}" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }
  if (geometry.lineStroke !== null) {
    patternLines.push(
      `<path d="${patternPathD(geometry.path)}" fill="none" stroke="#000" stroke-width="${geometry.lineStroke}" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }
  if (geometry.startRing !== null) {
    patternLines.push(
      `<circle cx="${num(geometry.startRing.x)}" cy="${num(geometry.startRing.y)}" r="${num(geometry.startRing.radius)}" fill="none" stroke="#000" stroke-width="${PATTERN.startRingStroke}"/>`,
    );
  }
  for (const dot of geometry.dots) {
    patternLines.push(`<circle cx="${num(dot.x)}" cy="${num(dot.y)}" r="${geometry.dotRadius}" fill="#000"/>`);
  }
  patternLines.push("</g>");
});
patternLines.push("</svg>", "");

const patternOutFile = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/szlaczki.svg");
writeFileSync(patternOutFile, patternLines.join("\n"));
console.log(`Wrote ${patternOutFile} (${patternCard.key})`);
