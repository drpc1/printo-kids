// An oracle independent of `search.ts`: it enumerates every simple path (depth-first) instead of searching breadth-first,
// so a defect in the generator's search cannot hide behind the same defect in the check. It imports nothing but types.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CodingCard } from "./card.ts";
import { generateCodingCard } from "./generate.ts";
import { CODING_LEVELS, CODING_MODES } from "./levels.ts";

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MOVES: readonly (readonly [string, number, number])[] = [
  ["R", 1, 0],
  ["L", -1, 0],
  ["U", 0, -1],
  ["D", 0, 1],
];

/**
 * Every simple path from the start to the goal that is at most `limit` steps long, as direction strings. A branch is cut
 * as soon as the steps taken plus the straight-line distance left exceed the limit, which keeps level 4 quick.
 */
function simplePaths(card: CodingCard, limit: number): string[] {
  const rows = card.blocked.length;
  const cols = card.blocked[0].length;
  const [goalCol, goalRow] = card.goal;
  const visited = card.blocked.map((row) => row.map(() => false));
  const found: string[] = [];
  const walk = (col: number, row: number, taken: string): void => {
    if (col === goalCol && row === goalRow) {
      found.push(taken);
      return;
    }
    if (taken.length + Math.abs(goalCol - col) + Math.abs(goalRow - row) > limit) return;
    visited[row][col] = true;
    for (const [name, dc, dr] of MOVES) {
      const c = col + dc;
      const r = row + dr;
      if (c < 0 || r < 0 || c >= cols || r >= rows || card.blocked[r][c] || visited[r][c]) continue;
      walk(c, r, taken + name);
    }
    visited[row][col] = false;
  };
  walk(card.start[0], card.start[1], "");
  return found;
}

const SEEDS: Record<string, number[]> = {
  poziom1: [1, 2, 3, 4, 5],
  poziom2: [1, 2, 3, 4, 5],
  poziom3: [1, 2, 3],
  poziom4: [1, 2],
};

void describe("oracle: every simple path", () => {
  for (const level of CODING_LEVELS) {
    void test(`${level.label} Zapisz: the card's path is the only shortest one`, () => {
      for (const seed of SEEDS[level.id]) {
        const card = generateCodingCard(mulberry32(seed), null, level, CODING_MODES[0]);
        assert.ok(card);
        const answer = card.path.join("");
        const paths = simplePaths(card, answer.length);
        const shortest = Math.min(...paths.map((path) => path.length));
        assert.equal(shortest, answer.length, "no path is shorter than the answer");
        const shortestPaths = paths.filter((path) => path.length === shortest);
        assert.deepEqual(shortestPaths, [answer]);
      }
    });

    void test(`${level.label} Wykonaj: the arrows end on the goal picture, never on an obstacle or twice on a cell`, () => {
      for (const seed of SEEDS[level.id]) {
        const card = generateCodingCard(mulberry32(seed), null, level, CODING_MODES[1]);
        assert.ok(card);
        let [col, row] = card.start;
        const onPath = new Set([`${col},${row}`]);
        for (const dir of card.path) {
          const [, dc, dr] = MOVES.find(([name]) => name === dir) ?? ["", 0, 0];
          col += dc;
          row += dr;
          assert.ok(row >= 0 && row < level.rows && col >= 0 && col < level.cols, "stays on the grid");
          assert.equal(card.blocked[row][col], false, "never on an obstacle");
          assert.ok(!onPath.has(`${col},${row}`), "never twice on a cell");
          onPath.add(`${col},${row}`);
        }
        const goal = card.targets.filter((target) => target.cell[0] === col && target.cell[1] === row);
        assert.equal(goal.length, 1);
        assert.equal(goal[0].isGoal, true);
        for (const target of card.targets.filter((t) => !t.isGoal)) {
          assert.ok(!onPath.has(`${target.cell[0]},${target.cell[1]}`), "a distractor is off the path");
        }
      }
    });
  }

  void test("the oracle sees two shortest paths where the corridor is opened", () => {
    const open = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => false));
    const card: CodingCard = {
      level: "poziom1",
      mode: "zapisz",
      blocked: open,
      start: [0, 4],
      goal: [3, 1],
      path: ["R", "R", "R", "U", "U", "U"],
      targets: [],
    };
    assert.ok(simplePaths(card, 6).filter((path) => path.length === 6).length > 1);
  });
});
