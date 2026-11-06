// The maze as a card kind (gh283, phase 4): `mazeSpec` says what a legal maze is, `mazeEngine` makes one. The maze is
// constructive (best of 20 candidates), so a defect is a `CardInvariantError`, never `CardExhausted`.
import { VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { LabiryntSettings } from "../card-settings.ts";
import { countPaths, generateMaze, type Maze } from "./generate.ts";
import { levelById } from "./levels.ts";
import { mazeKnownBad } from "./known-bad.ts";

function reachableCount(maze: Maze): number {
  const seen = new Set<string>([`${maze.entrance.row},${maze.entrance.col}`]);
  const queue = [maze.entrance];
  for (const { row, col } of queue) {
    const cell = maze.cells[row][col];
    const next = [
      !cell.north && row > 0 ? { row: row - 1, col } : null,
      !cell.south && row < maze.height - 1 ? { row: row + 1, col } : null,
      !cell.west && col > 0 ? { row, col: col - 1 } : null,
      !cell.east && col < maze.width - 1 ? { row, col: col + 1 } : null,
    ];
    for (const point of next) {
      if (point !== null && !seen.has(`${point.row},${point.col}`)) {
        seen.add(`${point.row},${point.col}`);
        queue.push(point);
      }
    }
  }
  return seen.size;
}

/** Problems in the order of D02 4.8; the order is a contract (test N12). `grid-size` stops the rest. */
function mazeProblems(maze: Maze, settings: LabiryntSettings): CardProblem[] {
  const level = levelById(settings.level);
  const { rows, columns } = level;
  if (
    maze.width !== columns ||
    maze.height !== rows ||
    maze.cells.length !== rows ||
    maze.cells.some((row) => row.length !== columns)
  ) {
    return [{ code: "grid-size", detail: `expected ${columns}x${rows}, got ${maze.width}x${maze.height}` }];
  }
  const { entrance, exit } = maze;
  const found = new Map<string, string>();
  const add = (code: string, detail: string): void => {
    if (!found.has(code)) found.set(code, detail);
  };
  if (entrance.row !== level.entrance.row || entrance.col !== level.entrance.col) {
    add("entrance-position", `entrance at ${entrance.row},${entrance.col}`);
  }
  if (maze.cells[entrance.row]?.[entrance.col]?.north) {
    add("entrance-sealed", "the north wall of the entrance is closed");
  }
  if (exit.row !== rows - 1 || !level.exitColumns.includes(exit.col)) {
    add("exit-position", `exit at ${exit.row},${exit.col}`);
  }
  if (maze.cells[exit.row]?.[exit.col]?.south) {
    add("exit-sealed", "the south wall of the exit is closed");
  }
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const cell = maze.cells[row][col];
      const isEntrance = row === entrance.row && col === entrance.col;
      const isExit = row === exit.row && col === exit.col;
      if ((col === 0 && !cell.west) || (col === columns - 1 && !cell.east)) {
        add("outer-wall-open", `side wall open at ${row},${col}`);
      }
      if ((row === 0 && !cell.north && !isEntrance) || (row === rows - 1 && !cell.south && !isExit)) {
        add("outer-wall-open", `top or bottom wall open at ${row},${col}`);
      }
      if (col < columns - 1 && cell.east !== maze.cells[row][col + 1].west) {
        add("wall-mismatch", `east of ${row},${col}`);
      }
      if (row < rows - 1 && cell.south !== maze.cells[row + 1][col].north) {
        add("wall-mismatch", `south of ${row},${col}`);
      }
    }
  }
  const inGrid = (point: { row: number; col: number }): boolean =>
    point.row >= 0 && point.row < rows && point.col >= 0 && point.col < columns;
  if (!inGrid(entrance) || !inGrid(exit)) {
    // The route checks would walk off the grid; the position codes above already name the defect.
    return orderedProblems(found);
  }
  const paths = countPaths(maze, entrance, exit);
  if (paths === 0) add("no-route", "no route from the entrance to the exit");
  if (paths > 1) add("several-routes", "more than one route from the entrance to the exit");
  if (reachableCount(maze) !== rows * columns)
    add("unreachable-cells", "some cells cannot be reached from the entrance");
  return orderedProblems(found);
}

const ORDER = [
  "entrance-position",
  "entrance-sealed",
  "exit-position",
  "exit-sealed",
  "outer-wall-open",
  "wall-mismatch",
  "no-route",
  "several-routes",
  "unreachable-cells",
];

function orderedProblems(found: Map<string, string>): CardProblem[] {
  return ORDER.filter((code) => found.has(code)).map((code) => ({ code, detail: found.get(code) ?? "" }));
}

function wallsKey(maze: Maze): string {
  return maze.cells.map((row) => row.map((c) => `${+c.north}${+c.east}${+c.south}${+c.west}`).join(",")).join(";");
}

let knownBadCache: CardSpec<LabiryntSettings, Maze>["knownBad"] | undefined;

export const mazeSpec: CardSpec<LabiryntSettings, Maze> = {
  kind: "labirynt",
  problems: mazeProblems,
  keyOf: wallsKey,
  contentKey: (settings) => settings.level,
  // Built on first use: the fixtures draw mazes, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= mazeKnownBad();
    return knownBadCache;
  },
};

export const mazeEngine: CardEngine<LabiryntSettings, Maze> = {
  spec: mazeSpec,
  /** `previousKey` is ignored: the maze has no "different from the last one" guarantee (plan, What We're NOT Doing). */
  generate(settings, random) {
    return VerifiedCard.require(mazeSpec, generateMaze(settings.level, random), settings);
  },
};
