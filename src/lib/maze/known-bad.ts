// Known bad mazes for `mazeSpec.knownBad` (gh283, phase 4; D02 6.2 N1-N13). Each is a legal maze with one defect, so the
// liveness test can require `mazeSpec.problems` to name exactly that defect.
import type { LabiryntSettings } from "../card-settings.ts";
import { generateMaze, type Maze } from "./generate.ts";
import { levelById, type MazePoint } from "./levels.ts";

export interface MazeKnownBad {
  name: string;
  card: Maze;
  settings: LabiryntSettings;
  expectedCode: string;
}

const BAD_SETTINGS: LabiryntSettings = { level: "lat3" };
const FIXTURE_SEED = 5;

function seeded(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function key(point: MazePoint): string {
  return `${point.row},${point.col}`;
}

function neighborsOf(maze: Maze, point: MazePoint): MazePoint[] {
  const cell = maze.cells[point.row][point.col];
  const { row, col } = point;
  const list: MazePoint[] = [];
  if (!cell.north && row > 0) list.push({ row: row - 1, col });
  if (!cell.south && row < maze.height - 1) list.push({ row: row + 1, col });
  if (!cell.west && col > 0) list.push({ row, col: col - 1 });
  if (!cell.east && col < maze.width - 1) list.push({ row, col: col + 1 });
  return list;
}

function routeKeys(maze: Maze): Set<string> {
  const parent = new Map<string, string | null>([[key(maze.entrance), null]]);
  const queue = [maze.entrance];
  for (const current of queue) {
    for (const next of neighborsOf(maze, current)) {
      if (!parent.has(key(next))) {
        parent.set(key(next), key(current));
        queue.push(next);
      }
    }
  }
  const route = new Set<string>();
  for (let cursor: string | null | undefined = key(maze.exit); cursor; cursor = parent.get(cursor)) {
    route.add(cursor);
  }
  return route;
}

function findCell(maze: Maze, test: (row: number, col: number) => boolean): MazePoint | undefined {
  for (let row = 0; row < maze.height; row += 1) {
    for (let col = 0; col < maze.width; col += 1) {
      if (test(row, col)) return { row, col };
    }
  }
  return undefined;
}

/** Closes the wall between two neighbouring cells, on both sides. */
function cut(maze: Maze, from: MazePoint, to: MazePoint): void {
  if (to.row === from.row - 1) {
    maze.cells[from.row][from.col].north = true;
    maze.cells[to.row][to.col].south = true;
  } else if (to.row === from.row + 1) {
    maze.cells[from.row][from.col].south = true;
    maze.cells[to.row][to.col].north = true;
  } else if (to.col === from.col - 1) {
    maze.cells[from.row][from.col].west = true;
    maze.cells[to.row][to.col].east = true;
  } else {
    maze.cells[from.row][from.col].east = true;
    maze.cells[to.row][to.col].west = true;
  }
}

function fullyOpen(source: Maze): Maze {
  const maze = structuredClone(source);
  for (let row = 0; row < maze.height; row += 1) {
    for (let col = 0; col < maze.width; col += 1) {
      if (col < maze.width - 1) {
        maze.cells[row][col].east = false;
        maze.cells[row][col + 1].west = false;
      }
      if (row < maze.height - 1) {
        maze.cells[row][col].south = false;
        maze.cells[row + 1][col].north = false;
      }
    }
  }
  return maze;
}

export function mazeKnownBad(): MazeKnownBad[] {
  const settings = BAD_SETTINGS;
  const level = levelById(settings.level);
  const base = generateMaze(settings.level, seeded(FIXTURE_SEED));
  const route = routeKeys(base);
  const cases: MazeKnownBad[] = [];
  const add = (name: string, card: Maze, expectedCode: string): void => {
    cases.push({ name, card, settings, expectedCode });
  };
  const copy = (): Maze => structuredClone(base);

  const wide = copy();
  wide.width += 1;
  add("N1 width + 1", wide, "grid-size");
  const tall = copy();
  tall.height += 1;
  add("N1 height + 1", tall, "grid-size");
  const noRow = copy();
  noRow.cells.pop();
  add("N1 a row of cells missing", noRow, "grid-size");
  const shortRow = copy();
  shortRow.cells[0].pop();
  add("N1 a shortened row", shortRow, "grid-size");

  const wrongColumn = copy();
  wrongColumn.entrance = { row: 0, col: wrongColumn.entrance.col + 1 };
  add("N2 entrance in the wrong column", wrongColumn, "entrance-position");
  const wrongRow = copy();
  wrongRow.entrance = { row: 1, col: wrongRow.entrance.col };
  add("N2 entrance in the wrong row", wrongRow, "entrance-position");

  const n3 = copy();
  n3.cells[n3.entrance.row][n3.entrance.col].north = true;
  add("N3 north wall of the entrance closed", n3, "entrance-sealed");

  const exitRow = copy();
  exitRow.exit = { row: exitRow.height - 2, col: exitRow.exit.col };
  add("N4 exit in the second row from the bottom", exitRow, "exit-position");
  const nearCenter = copy();
  nearCenter.cells[nearCenter.exit.row][nearCenter.exit.col].south = true;
  nearCenter.exit = { row: nearCenter.height - 1, col: level.entrance.col + 1 };
  nearCenter.cells[nearCenter.exit.row][nearCenter.exit.col].south = false;
  add("N4 exit in a column next to the middle", nearCenter, "exit-position");

  const n5 = copy();
  n5.cells[n5.exit.row][n5.exit.col].south = true;
  add("N5 south wall of the exit closed", n5, "exit-sealed");

  const n6a = copy();
  n6a.cells[1][0].west = false;
  add("N6 west wall of column 0 open", n6a, "outer-wall-open");
  const n6b = copy();
  n6b.cells[1][n6b.width - 1].east = false;
  add("N6 east wall of the last column open", n6b, "outer-wall-open");
  const n6c = copy();
  n6c.cells[0][n6c.entrance.col === 0 ? 1 : 0].north = false;
  add("N6 north wall of row 0 open outside the entrance", n6c, "outer-wall-open");
  const n6d = copy();
  n6d.cells[n6d.height - 1][n6d.exit.col === 0 ? 1 : 0].south = false;
  add("N6 south wall of the last row open outside the exit", n6d, "outer-wall-open");

  // N7: one-sided walls between two cells that are both off the route, so the route count stays 1.
  const offRoute = (row: number, col: number, dRow: number, dCol: number): boolean =>
    !route.has(`${row},${col}`) && !route.has(`${row + dRow},${col + dCol}`);
  const openEast = findCell(
    base,
    (row, col) => col < base.width - 1 && offRoute(row, col, 0, 1) && !base.cells[row][col].east,
  );
  const closedEast = findCell(
    base,
    (row, col) => col < base.width - 1 && offRoute(row, col, 0, 1) && base.cells[row][col].east,
  );
  const closedSouth = findCell(
    base,
    (row, col) => row < base.height - 1 && offRoute(row, col, 1, 0) && base.cells[row][col].south,
  );
  if (openEast !== undefined && closedEast !== undefined && closedSouth !== undefined) {
    const n7a = copy();
    n7a.cells[openEast.row][openEast.col + 1].west = true;
    add("N7 A.east open, B.west closed", n7a, "wall-mismatch");
    const n7b = copy();
    n7b.cells[closedEast.row][closedEast.col + 1].west = false;
    add("N7 B.west open, A.east closed", n7b, "wall-mismatch");
    const n7c = copy();
    n7c.cells[closedSouth.row][closedSouth.col].south = false;
    add("N7 A.south open, B.north closed", n7c, "wall-mismatch");
  }

  const closed = copy();
  for (const row of closed.cells) {
    for (const cell of row) {
      cell.north = cell.east = cell.south = cell.west = true;
    }
  }
  closed.cells[closed.entrance.row][closed.entrance.col].north = false;
  closed.cells[closed.exit.row][closed.exit.col].south = false;
  add("N8 every wall closed", closed, "no-route");

  add("N9 every wall open", fullyOpen(base), "several-routes");

  // N13: a dead-end cell, and a group of two cells, cut off by closed walls on every side.
  const tip = findCell(
    base,
    (row, col) =>
      row > 0 &&
      col > 0 &&
      row < base.height - 1 &&
      col < base.width - 1 &&
      !route.has(`${row},${col}`) &&
      neighborsOf(base, { row, col }).length === 1,
  );
  if (tip !== undefined) {
    const n13a = copy();
    cut(n13a, tip, neighborsOf(n13a, tip)[0]);
    add("N13 one cell cut off", n13a, "unreachable-cells");
    const parentCell = neighborsOf(base, tip)[0];
    if (neighborsOf(base, parentCell).length === 2 && !route.has(key(parentCell))) {
      const n13b = copy();
      const grandParent = neighborsOf(n13b, parentCell).find((point) => key(point) !== key(tip));
      if (grandParent !== undefined) {
        cut(n13b, parentCell, grandParent);
        add("N13 group of two cells cut off", n13b, "unreachable-cells");
      }
    }
  }
  return cases;
}
