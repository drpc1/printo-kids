import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { MathCrosswordCard } from "./card.ts";
import { generateMathCrosswordCard } from "./generate.ts";
import { MATH_CROSSWORD_LEVELS, type MathCrosswordLevel } from "./levels.ts";
// An oracle that shares nothing with card.ts or generate.ts: it fills the empty numbers of a card by depth-first search
// over every value 1..max and counts the fillings that make every equation true. It stops at two, so "exactly one" is
// the only answer that passes. The search is bounded by a budget of search steps, not by a clock, so a slow machine
// cannot skip a card: a card that does not finish inside the budget fails the test.

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

function holds(op: string, a: number, b: number, c: number): boolean {
  if (op === "+") return a + b === c;
  if (op === "−") return a - b === c;
  if (op === "·") return a * b === c;
  return b !== 0 && a === b * c;
}

/** Search steps one card may take; the sampled cards need a few dozen (see the diagnostics), so it only stops a runaway. */
const NODE_BUDGET = 20_000;

/** Number of fillings of the empty numbers (capped at `cap`), and whether the search ended inside the step budget. */
function countSolutions(
  card: MathCrosswordCard,
  max: number,
  cap: number,
  budget: number,
): { count: number; finished: boolean; nodes: number } {
  const cells: (number | null)[] = card.values.map((value, id) => (card.blanks.includes(id) ? null : value));
  const triples = card.equations.map((e) => [e.a, e.b, e.c, e.op] as const);
  let count = 0;
  let finished = true;
  let nodes = 0;
  const consistent = (): boolean =>
    triples.every(([a, b, c, op]) => {
      const [x, y, z] = [cells[a], cells[b], cells[c]];
      return x === null || y === null || z === null || holds(op, x, y, z);
    });
  const search = (): void => {
    if (count >= cap) return;
    nodes += 1;
    if (nodes > budget) {
      finished = false;
      return;
    }
    // Prefer an empty number in an equation where it is the only one missing; otherwise the first empty number.
    let pick = -1;
    for (const [a, b, c] of triples) {
      const missing = [a, b, c].filter((id) => cells[id] === null);
      if (missing.length === 1) {
        pick = missing[0];
        break;
      }
    }
    if (pick < 0) pick = cells.findIndex((value) => value === null);
    if (pick < 0) {
      count += 1;
      return;
    }
    for (let value = 1; value <= max; value += 1) {
      cells[pick] = value;
      if (consistent()) search();
      if (count >= cap || !finished) break;
    }
    cells[pick] = null;
  };
  search();
  return { count, finished, nodes };
}

void describe("the card has exactly one solution (independent search)", () => {
  const first: readonly MathCrosswordLevel[] = MATH_CROSSWORD_LEVELS.slice(0, 3);
  const higher: readonly MathCrosswordLevel[] = MATH_CROSSWORD_LEVELS.slice(3);

  for (const level of first) {
    void test(`${level.id}: 20 cards, each searched whole, have exactly one solution`, (t) => {
      let mostNodes = 0;
      for (let seed = 1; seed <= 20; seed += 1) {
        const card = generateMathCrosswordCard(mulberry32(seed), null, level);
        assert.ok(card);
        const { count, finished, nodes } = countSolutions(card, level.max, 2, NODE_BUDGET);
        mostNodes = Math.max(mostNodes, nodes);
        assert.ok(finished, `${level.id} seed ${seed} not finished`);
        assert.equal(count, 1, `${level.id} seed ${seed}`);
      }
      t.diagnostic(`${level.id}: searched 20, most steps ${mostNodes}`);
    });
  }

  for (const level of higher) {
    void test(`${level.id}: a sample of cards, each searched inside the step budget, has exactly one solution`, (t) => {
      let searched = 0;
      let mostNodes = 0;
      for (let seed = 1; seed <= 6; seed += 1) {
        const card = generateMathCrosswordCard(mulberry32(seed), null, level);
        assert.ok(card);
        const { count, finished, nodes } = countSolutions(card, level.max, 2, NODE_BUDGET);
        if (!finished) continue;
        searched += 1;
        mostNodes = Math.max(mostNodes, nodes);
        assert.equal(count, 1, `${level.id} seed ${seed}`);
      }
      t.diagnostic(`${level.id}: searched ${searched} of 6, most steps ${mostNodes}`);
      // The seeds are fixed and the search is counted in steps, so every sampled card is searched on every machine.
      assert.equal(searched, 6, `${level.id}: only ${searched} of 6 cards were searched`);
    });
  }

  void test("the oracle sees a second solution when two empty numbers can swap", () => {
    // 1 + 2 = 3 with the 1 and the 2 empty: 2 + 1 = 3 fits as well.
    const card: MathCrosswordCard = {
      level: "poziom1",
      cells: [],
      equations: [{ a: 0, op: "+", b: 1, c: 2, row: 0, col: 0, dir: "right" }],
      values: [1, 2, 3],
      blanks: [0, 1],
    };
    assert.equal(countSolutions(card, 10, 2, NODE_BUDGET).count, 2);
  });
});
