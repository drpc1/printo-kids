import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { neighbours, numberMazeCardKey, numberMazeCardProblems, type NumberMazeCard } from "./card.ts";
import { generateNumberMazeCard } from "./generate.ts";
import { numberMazeLevelById } from "./levels.ts";

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

const level = numberMazeLevelById("poziom1");

function base(): NumberMazeCard {
  const card = generateNumberMazeCard(seeded(7), level);
  assert.ok(card !== null);
  return card;
}

function trapNextTo(card: NumberMazeCard, pathIndex: number): number {
  const onPath = new Set(card.path);
  const trap = neighbours(card.path[pathIndex], level.cols, level.rows).find((cell) => !onPath.has(cell));
  assert.ok(trap !== undefined, "fixture needs a trap next to the path cell");
  return trap;
}

void describe("numberMazeCardProblems", () => {
  void test("a generated card is legal", () => {
    assert.deepEqual(numberMazeCardProblems(base(), level), []);
  });

  void test("neighbours never step diagonally or off the grid", () => {
    assert.deepEqual(
      neighbours(0, 5, 5).sort((a, b) => a - b),
      [1, 5],
    );
    assert.deepEqual(
      neighbours(12, 5, 5).sort((a, b) => a - b),
      [7, 11, 13, 17],
    );
    assert.deepEqual(
      neighbours(24, 5, 5).sort((a, b) => a - b),
      [19, 23],
    );
  });

  void test("each broken rule has its code", () => {
    const card = base();
    const goal = card.values.length - 1;
    const cases: [string, NumberMazeCard, string][] = [
      ["settings", { ...card, levelId: "poziom2" }, "settings-mismatch"],
      ["size", { ...card, values: card.values.slice(1) }, "wrong-grid-size"],
      ["start", { ...card, values: card.values.map((v, i) => (i === 0 ? 2 : v)) }, "start-not-first"],
      ["goal", { ...card, values: card.values.map((v, i) => (i === goal ? 14 : v)) }, "goal-not-last"],
      ["ends", { ...card, path: [...card.path].reverse() }, "path-wrong-ends"],
      ["length", { ...card, path: card.path.slice(0, -1) }, "path-wrong-length"],
      ["jump", { ...card, path: card.path.map((c, i) => (i === 1 ? goal - 1 : c)) }, "path-not-adjacent"],
      ["revisit", { ...card, path: card.path.map((c, i) => (i === 2 ? 0 : c)) }, "path-revisits"],
    ];
    const forked = [...card.values];
    forked[trapNextTo(card, 3)] = card.values[card.path[4]];
    cases.push(["fork", { ...card, values: forked }, "ambiguous-next"]);
    const outOfRange = [...card.values];
    outOfRange[trapNextTo(card, 3)] = 99;
    cases.push(["range", { ...card, values: outOfRange }, "trap-out-of-range"]);
    const endpoint = [...card.values];
    endpoint[trapNextTo(card, 3)] = 15;
    cases.push(["endpoint", { ...card, values: endpoint }, "trap-repeats-endpoint"]);
    const swapped = [...card.values];
    [swapped[card.path[5]], swapped[card.path[6]]] = [swapped[card.path[6]], swapped[card.path[5]]];
    cases.push(["values", { ...card, values: swapped }, "path-values-wrong"]);
    for (const [name, broken, code] of cases) {
      assert.ok(numberMazeCardProblems(broken, level).includes(code as never), `${name} → ${code}`);
    }
  });

  void test("the key changes with the numbers and the level", () => {
    const card = base();
    const other = { ...card, values: card.values.map((v, i) => (i === 1 ? v + 1 : v)) };
    assert.notEqual(numberMazeCardKey(card), numberMazeCardKey(other));
    assert.notEqual(numberMazeCardKey(card), numberMazeCardKey({ ...card, levelId: "poziom2" }));
  });
});
