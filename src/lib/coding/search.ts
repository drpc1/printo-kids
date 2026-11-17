// Breadth-first search over the cells of a coding grid (S-42). Its own code, not `src/lib/maze`: a maze counts paths
// between cell walls, this card counts paths between free cells. The test oracle (`oracle.test.ts`) does not use it.

export type Dir = "R" | "L" | "U" | "D";
/** `[column, row]`. */
export type Cell = readonly [number, number];

export const DIRS: readonly Dir[] = ["R", "L", "U", "D"];
const DELTA: Record<Dir, readonly [number, number]> = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
const OPPOSITE: Record<Dir, Dir> = { R: "L", L: "R", U: "D", D: "U" };

export function step(cell: Cell, dir: Dir): Cell {
  return [cell[0] + DELTA[dir][0], cell[1] + DELTA[dir][1]];
}

export function cellKey(cell: Cell): string {
  return `${cell[0]},${cell[1]}`;
}

/** Whether the cell is on the grid and not an obstacle. `blocked[row][column]`. */
export function isFree(blocked: readonly (readonly boolean[])[], cell: Cell): boolean {
  const [col, row] = cell;
  return row >= 0 && row < blocked.length && col >= 0 && col < blocked[row].length && !blocked[row][col];
}

export interface Shortest {
  /** Distance in steps from the start; -1 for a cell that cannot be reached. */
  dist: number[][];
  /** Number of shortest paths from the start, capped at 2 (more is not needed to tell "one" from "not one"). */
  count: number[][];
}

/** Distance and the number of shortest paths from `start` to every cell. */
export function shortestPaths(blocked: readonly (readonly boolean[])[], start: Cell): Shortest {
  const dist = blocked.map((row) => row.map(() => -1));
  const count = blocked.map((row) => row.map(() => 0));
  dist[start[1]][start[0]] = 0;
  count[start[1]][start[0]] = 1;
  const queue: Cell[] = [start];
  for (const from of queue) {
    const next = dist[from[1]][from[0]] + 1;
    for (const dir of DIRS) {
      const to = step(from, dir);
      if (!isFree(blocked, to)) continue;
      if (dist[to[1]][to[0]] === -1) {
        dist[to[1]][to[0]] = next;
        queue.push(to);
      }
      if (dist[to[1]][to[0]] === next) {
        count[to[1]][to[0]] = Math.min(2, count[to[1]][to[0]] + count[from[1]][from[0]]);
      }
    }
  }
  return { dist, count };
}

/** The directions of the only shortest path from the start to `goal`, or null when there is none or more than one. */
export function uniqueShortestPath(
  blocked: readonly (readonly boolean[])[],
  start: Cell,
  goal: Cell,
  shortest: Shortest = shortestPaths(blocked, start),
): Dir[] | null {
  const { dist, count } = shortest;
  if (dist[goal[1]][goal[0]] <= 0 || count[goal[1]][goal[0]] !== 1) return null;
  const path: Dir[] = [];
  let at = goal;
  while (dist[at[1]][at[0]] > 0) {
    const back = DIRS.map((dir) => ({ dir, from: step(at, dir) })).filter(
      ({ from }) => isFree(blocked, from) && dist[from[1]][from[0]] === dist[at[1]][at[0]] - 1,
    );
    // One shortest path means exactly one predecessor at every step.
    if (back.length !== 1) return null;
    path.unshift(OPPOSITE[back[0].dir]);
    at = back[0].from;
  }
  return path;
}
