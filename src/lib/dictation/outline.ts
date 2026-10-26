import type { SymmetryCell, SymmetryTemplate } from "../symmetry/templates.ts";

export type DictationDirection = "right" | "left" | "up" | "down";

/** One run of equal unit steps along grid lines, for example "3 right". */
export interface DictationCommand {
  direction: DictationDirection;
  length: number;
}

export interface DictationCell {
  col: number;
  row: number;
}

/** The whole object, holes filled, with its top-left corner moved to column 0, row 0. */
export interface DictationSilhouette {
  width: number;
  height: number;
  cells: readonly DictationCell[];
}

export interface DictationVertex {
  x: number;
  y: number;
}

export type OutlineProblem = "disconnected" | "corner-touch";

const STEP: Readonly<Record<DictationDirection, DictationVertex>> = {
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
};

/** Clockwise on screen (y grows down): turning right is the next entry, turning left the previous one. */
const CLOCKWISE: readonly DictationDirection[] = ["right", "down", "left", "up"];

/**
 * The whole silhouette of a template with one variant per part: the drawn half and its mirror (column `col` and
 * `2 * width - 1 - col`) with every enclosed empty cell (a window, an eye, a seed) filled, since the child only
 * draws the outer line. Normalized to the bounding box. Throws on a missing variant, like a broken template.
 */
export function dictationSilhouette(template: SymmetryTemplate, variants: readonly number[]): DictationSilhouette {
  const half: SymmetryCell[] = [...template.base];
  template.parts.forEach((part, index) => {
    const variant = part.variants[variants[index]] as readonly SymmetryCell[] | undefined;
    if (variant === undefined) {
      throw new Error(`Template ${template.id} has no variant ${variants[index]} of part ${part.id}`);
    }
    half.push(...variant);
  });
  const width = template.width * 2;
  const height = template.height;
  const filled = new Set<number>();
  // The frame is padded by one empty ring, so the flood starts at its corner and reaches every open edge.
  const padded = width + 2;
  for (const cell of half) {
    filled.add((cell.row + 1) * padded + cell.col + 1);
    filled.add((cell.row + 1) * padded + (width - 1 - cell.col) + 1);
  }
  const reached = new Set<number>([0]);
  const queue = [0];
  for (let index = queue.pop(); index !== undefined; index = queue.pop()) {
    const col = index % padded;
    const row = Math.floor(index / padded);
    for (const [nextCol, nextRow] of [
      [col - 1, row],
      [col + 1, row],
      [col, row - 1],
      [col, row + 1],
    ]) {
      const next = nextRow * padded + nextCol;
      const inPaddedFrame = nextCol >= 0 && nextCol < padded && nextRow >= 0 && nextRow < height + 2;
      if (inPaddedFrame && !filled.has(next) && !reached.has(next)) {
        reached.add(next);
        queue.push(next);
      }
    }
  }
  const cells: DictationCell[] = [];
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      if (!reached.has((row + 1) * padded + col + 1)) {
        cells.push({ col, row });
      }
    }
  }
  return normalize(cells);
}

function normalize(cells: readonly DictationCell[]): DictationSilhouette {
  if (cells.length === 0) {
    return { width: 0, height: 0, cells: [] };
  }
  const minCol = Math.min(...cells.map((cell) => cell.col));
  const maxCol = Math.max(...cells.map((cell) => cell.col));
  const minRow = Math.min(...cells.map((cell) => cell.row));
  const maxRow = Math.max(...cells.map((cell) => cell.row));
  return {
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1,
    cells: cells.map((cell) => ({ col: cell.col - minCol, row: cell.row - minRow })),
  };
}

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

function cellSet(silhouette: DictationSilhouette): Set<string> {
  return new Set(silhouette.cells.map((cell) => cellKey(cell.col, cell.row)));
}

/**
 * Why the outline of the silhouette cannot be drawn as one line along the grid. Empty means it can: the cells are
 * 4-connected and no grid vertex is shared by only two diagonal cells (the outline would touch itself there).
 */
export function outlineProblems(silhouette: DictationSilhouette): readonly OutlineProblem[] {
  const problems: OutlineProblem[] = [];
  const filled = cellSet(silhouette);
  if (silhouette.cells.length === 0 || !isConnected(silhouette, filled)) {
    problems.push("disconnected");
  }
  let touching = false;
  for (let y = 0; y <= silhouette.height && !touching; y += 1) {
    for (let x = 0; x <= silhouette.width && !touching; x += 1) {
      const topLeft = filled.has(cellKey(x - 1, y - 1));
      const topRight = filled.has(cellKey(x, y - 1));
      const bottomLeft = filled.has(cellKey(x - 1, y));
      const bottomRight = filled.has(cellKey(x, y));
      touching =
        (topLeft && bottomRight && !topRight && !bottomLeft) || (topRight && bottomLeft && !topLeft && !bottomRight);
    }
  }
  if (touching) {
    problems.push("corner-touch");
  }
  return problems;
}

function isConnected(silhouette: DictationSilhouette, filled: ReadonlySet<string>): boolean {
  const first = silhouette.cells[0];
  const seen = new Set<string>([cellKey(first.col, first.row)]);
  const queue = [first];
  for (let cell = queue.pop(); cell !== undefined; cell = queue.pop()) {
    for (const [col, row] of [
      [cell.col - 1, cell.row],
      [cell.col + 1, cell.row],
      [cell.col, cell.row - 1],
      [cell.col, cell.row + 1],
    ]) {
      const key = cellKey(col, row);
      if (filled.has(key) && !seen.has(key)) {
        seen.add(key);
        queue.push({ col, row });
      }
    }
  }
  return seen.size === filled.size;
}

/** The cells on the right-hand and on the left-hand side of the unit edge that leaves vertex (x, y) in `direction`. */
function edgeSides(x: number, y: number, direction: DictationDirection): [DictationCell, DictationCell] {
  switch (direction) {
    case "right":
      return [
        { col: x, row: y },
        { col: x, row: y - 1 },
      ];
    case "down":
      return [
        { col: x - 1, row: y },
        { col: x, row: y },
      ];
    case "left":
      return [
        { col: x - 1, row: y - 1 },
        { col: x - 1, row: y },
      ];
    case "up":
      return [
        { col: x, row: y - 1 },
        { col: x - 1, row: y - 1 },
      ];
  }
}

/**
 * The outer outline walked clockwise on screen, so the object is always on the right-hand side. It starts at the
 * top-left corner of the leftmost cell of the top row, a convex corner, and goes right first. At every vertex it
 * prefers a right turn, then straight on, then a left turn. Equal consecutive steps merge into one command.
 * Holes are never visited: the walk follows the one boundary it starts on. Expects a silhouette without
 * outline problems; throws if the walk does not come back to the start.
 */
export function traceOutline(silhouette: DictationSilhouette): {
  start: DictationVertex;
  commands: readonly DictationCommand[];
} {
  const filled = cellSet(silhouette);
  const topRow = Math.min(...silhouette.cells.map((cell) => cell.row));
  const startCol = Math.min(...silhouette.cells.filter((cell) => cell.row === topRow).map((cell) => cell.col));
  const start: DictationVertex = { x: startCol, y: topRow };
  const isEdge = (x: number, y: number, direction: DictationDirection): boolean => {
    const [right, left] = edgeSides(x, y, direction);
    return filled.has(cellKey(right.col, right.row)) && !filled.has(cellKey(left.col, left.row));
  };

  const commands: DictationCommand[] = [];
  const limit = 4 * silhouette.cells.length + 4;
  let x = start.x;
  let y = start.y;
  let heading: DictationDirection = "right";
  for (let step = 0; step < limit; step += 1) {
    let next: DictationDirection | undefined;
    if (step === 0) {
      next = "right";
    } else {
      const index = CLOCKWISE.indexOf(heading);
      const candidates: DictationDirection[] = [CLOCKWISE[(index + 1) % 4], heading, CLOCKWISE[(index + 3) % 4]];
      next = candidates.find((candidate: DictationDirection) => isEdge(x, y, candidate));
    }
    if (next === undefined) {
      throw new Error("The outline walk found no edge to follow");
    }
    const last = commands.at(-1);
    if (last?.direction === next) {
      last.length += 1;
    } else {
      commands.push({ direction: next, length: 1 });
    }
    x += STEP[next].x;
    y += STEP[next].y;
    heading = next;
    if (x === start.x && y === start.y) {
      return { start, commands };
    }
  }
  throw new Error("The outline walk did not return to its start");
}

/** Every grid vertex the commands pass through, one per unit step, from `start` to the end (start again when closed). */
export function walkCommands(
  start: DictationVertex,
  commands: readonly DictationCommand[],
): readonly DictationVertex[] {
  const vertices: DictationVertex[] = [{ x: start.x, y: start.y }];
  let { x, y } = start;
  for (const command of commands) {
    let remaining = command.length;
    while (remaining > 0) {
      x += STEP[command.direction].x;
      y += STEP[command.direction].y;
      vertices.push({ x, y });
      remaining -= 1;
    }
  }
  return vertices;
}
