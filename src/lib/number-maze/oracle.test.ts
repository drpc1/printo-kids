// An independent check of the one-path rule: it reads only the grid of numbers and the level table, not card.ts.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { generateNumberMazeCard } from "./generate.ts";
import { NUMBER_MAZE_LEVELS, type NumberMazeLevel } from "./levels.ts";

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The cells next to `here` across an edge, written here again so the oracle does not lean on card.ts. */
function around(here: number, level: NumberMazeLevel): number[] {
  const { cols, rows } = level;
  const row = Math.floor(here / cols);
  const col = here % cols;
  return [
    row > 0 ? here - cols : -1,
    row < rows - 1 ? here + cols : -1,
    col > 0 ? here - 1 : -1,
    col < cols - 1 ? here + 1 : -1,
  ].filter((cell) => cell >= 0);
}

/** Every walk from the start over cells holding first, first + step, …; returns the walks that use all numbers. */
function allWalks(values: readonly number[], level: NumberMazeLevel): number[][] {
  const { first, step, count } = level;
  const done: number[][] = [];
  const walk = (cells: number[]): void => {
    if (cells.length === count) {
      done.push(cells);
      return;
    }
    const here = cells[cells.length - 1];
    const want = first + step * cells.length;
    for (const next of around(here, level)) {
      if (values[next] === want && !cells.includes(next)) walk([...cells, next]);
    }
  };
  if (values[0] === first) walk([0]);
  return done;
}

void describe("number-maze oracle", () => {
  for (const level of NUMBER_MAZE_LEVELS) {
    void test(`${level.id}: exactly one walk, ending on the goal, equal to the card path`, () => {
      for (let seed = 1; seed <= 50; seed += 1) {
        const card = generateNumberMazeCard(seeded(seed * 31), level);
        assert.ok(card !== null);
        const walks = allWalks(card.values, level);
        assert.equal(walks.length, 1, `seed ${seed}`);
        assert.equal(walks[0].at(-1), level.cols * level.rows - 1, `seed ${seed}`);
        assert.deepEqual(walks[0], card.path, `seed ${seed}`);
        // the rule itself: on every step exactly one neighbour holds the next number (no dead-end side branch)
        walks[0].slice(0, -1).forEach((here, index) => {
          const want = level.first + level.step * (index + 1);
          assert.equal(
            around(here, level).filter((next) => card.values[next] === want).length,
            1,
            `seed ${seed}, step ${index}`,
          );
        });
      }
    });
  }
});
