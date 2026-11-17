import { groupSteps, type CodingCard, type Dir, type TargetKind } from "./card.ts";
import { codingLevelById } from "./levels.ts";
import { CODING_SHEET } from "./sheet.ts";

/** Slack for floating point error at the edge of the margin. */
const EPSILON = 1e-6;

export interface CodingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CodingPoint {
  x: number;
  y: number;
}

/** One answer box: a single arrow, or a "3 →" command on a grouped level. */
export interface CodingAnswerBox {
  rect: CodingRect;
  /** How many cells the command covers; 1 for a single arrow. */
  count: number;
  dir: Dir;
  /** Whether the command is drawn: always in Wykonaj, only for the example boxes in Zapisz. */
  filled: boolean;
  /** Zapisz: the box is one of the first `exampleCells` and is drawn in the grey example colour. */
  example: boolean;
}

export interface CodingTargetPlace {
  kind: TargetKind;
  isGoal: boolean;
  cx: number;
  cy: number;
  /** Radius the picture is drawn in, mm. */
  radius: number;
}

export interface CodingSheetLayout {
  page: { width: number; height: number };
  /** The instruction: the speech band with a character, the plain line without one. */
  band: { y: number; height: number };
  /** The grid; `cell` is the side of one cell. */
  grid: CodingRect & { cell: number; cols: number; rows: number };
  /** Centre of the start cell, and the side of the square the character is drawn in. */
  start: CodingPoint & { characterSize: number; circleRadius: number; textSize: number };
  /** Centre of the goal cell; Zapisz draws the flag here, whose height is `flagSize`. */
  goal: CodingPoint & { flagSize: number };
  /** Wykonaj only; empty in Zapisz. */
  targets: CodingTargetPlace[];
  answers: CodingAnswerBox[];
}

interface Box {
  what: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Places the instruction, the grid and the answer boxes. `instructionBoxHeight` is the band with a character, the plain
 * line height without one. The block of grid and boxes is centred in the area under the instruction. Throws when
 * something would cross the 10 mm margin or stand above that area.
 */
export function layoutCodingSheet(card: CodingCard, instructionBoxHeight: number): CodingSheetLayout {
  const sheet = CODING_SHEET;
  const level = codingLevelById(card.level);
  const areaTop = sheet.inset + instructionBoxHeight + sheet.bandGap;
  const areaWidth = sheet.pageWidth - 2 * sheet.inset;
  const areaHeight = sheet.pageHeight - sheet.inset - areaTop;

  const commands: [number, Dir][] = level.grouped ? groupSteps(card.path) : card.path.map((dir) => [1, dir]);
  const boxWidth = level.grouped ? sheet.groupBox.width : sheet.box[level.id];
  const boxHeight = level.grouped ? sheet.groupBox.height : sheet.box[level.id];
  const perRow = Math.max(1, Math.floor((areaWidth + sheet.boxGap) / (boxWidth + sheet.boxGap)));
  const boxRows = Math.ceil(commands.length / perRow);

  const gridWidth = level.cols * level.cell;
  const gridHeight = level.rows * level.cell;
  const blockHeight = gridHeight + sheet.gapUnderGrid + boxRows * boxHeight + (boxRows - 1) * sheet.boxGap;
  const top = areaTop + Math.max(0, (areaHeight - blockHeight) / 2);
  const gridX = (sheet.pageWidth - gridWidth) / 2;
  const centreOf = ([col, row]: readonly [number, number]): CodingPoint => ({
    x: gridX + (col + 0.5) * level.cell,
    y: top + (row + 0.5) * level.cell,
  });

  const boxesTop = top + gridHeight + sheet.gapUnderGrid;
  const answers: CodingAnswerBox[] = commands.map(([count, dir], index) => {
    const row = Math.floor(index / perRow);
    const inRow = Math.min(perRow, commands.length - row * perRow);
    const rowWidth = inRow * boxWidth + (inRow - 1) * sheet.boxGap;
    const x = (sheet.pageWidth - rowWidth) / 2 + (index % perRow) * (boxWidth + sheet.boxGap);
    const y = boxesTop + row * (boxHeight + sheet.boxGap);
    const example = card.mode === "zapisz" && index < level.exampleCells;
    return {
      rect: { x, y, width: boxWidth, height: boxHeight },
      count,
      dir,
      filled: card.mode === "wykonaj" || example,
      example,
    };
  });

  const targets: CodingTargetPlace[] =
    card.mode === "wykonaj"
      ? card.targets.map((target) => ({
          kind: target.kind,
          isGoal: target.isGoal,
          ...(({ x, y }) => ({ cx: x, cy: y }))(centreOf(target.cell)),
          radius: level.cell * sheet.targetShare,
        }))
      : [];

  const boxes: Box[] = [
    {
      what: "grid",
      x0: gridX - sheet.frameStroke / 2,
      y0: top - sheet.frameStroke / 2,
      x1: gridX + gridWidth + sheet.frameStroke / 2,
      y1: top + gridHeight + sheet.frameStroke / 2,
    },
    ...answers.map((answer, index) => ({
      what: `answer box ${index + 1}`,
      x0: answer.rect.x - sheet.boxStroke / 2,
      y0: answer.rect.y - sheet.boxStroke / 2,
      x1: answer.rect.x + answer.rect.width + sheet.boxStroke / 2,
      y1: answer.rect.y + answer.rect.height + sheet.boxStroke / 2,
    })),
  ];
  for (const box of boxes) {
    if (
      box.x0 < sheet.inset - EPSILON ||
      box.x1 > sheet.pageWidth - sheet.inset + EPSILON ||
      box.y0 < areaTop - EPSILON ||
      box.y1 > sheet.pageHeight - sheet.inset + EPSILON
    ) {
      throw new Error(
        `A ${box.what} crosses the ${sheet.inset} mm page margin or the instruction: (${box.x0.toFixed(2)}, ${box.y0.toFixed(2)}) - (${box.x1.toFixed(2)}, ${box.y1.toFixed(2)})`,
      );
    }
  }

  return {
    page: { width: sheet.pageWidth, height: sheet.pageHeight },
    band: { y: sheet.inset, height: instructionBoxHeight },
    grid: {
      x: gridX,
      y: top,
      width: gridWidth,
      height: gridHeight,
      cell: level.cell,
      cols: level.cols,
      rows: level.rows,
    },
    start: {
      ...centreOf(card.start),
      characterSize: level.cell * sheet.characterShare,
      circleRadius: level.cell * sheet.startCircleShare,
      textSize: level.cell * sheet.startTextShare,
    },
    goal: { ...centreOf(card.goal), flagSize: level.cell * sheet.flagShare },
    targets,
    answers,
  };
}
