import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { codingKey, codingProblems, groupSteps, turnCount, walk, type CodingProblem } from "./card.ts";
import { codingSpec, knownBadBases } from "./engine.ts";
import type { Dir } from "./search.ts";

const toDirs = (text: string): Dir[] => Array.from(text) as Dir[];

void describe("groupSteps, turnCount and walk", () => {
  void test("RRRU is 3 right and 1 up", () => {
    assert.deepEqual(groupSteps(toDirs("RRRU")), [
      [3, "R"],
      [1, "U"],
    ]);
    assert.deepEqual(groupSteps([]), []);
  });

  void test("only a change of direction counts as a turn", () => {
    assert.equal(turnCount(toDirs("RRRR")), 0);
    assert.equal(turnCount(toDirs("RRUUR")), 2);
    assert.equal(turnCount(toDirs("RLRL")), 3);
  });

  void test("walk starts on the start cell and follows the arrows", () => {
    assert.deepEqual(walk({ start: [1, 1], path: toDirs("RDL") }), [
      [1, 1],
      [2, 1],
      [2, 2],
      [1, 2],
    ]);
  });
});

void describe("codingProblems", () => {
  void test("every known bad card is rejected with its expected code", () => {
    for (const bad of codingSpec.knownBad) {
      const codes: string[] = codingProblems(bad.card, bad.settings);
      assert.ok(codes.includes(bad.expectedCode), `${bad.name}: ${codes.join(", ")}`);
    }
  });

  void test("every base the known bad cards are made from is sound", () => {
    for (const base of knownBadBases()) {
      assert.deepEqual(codingProblems(base.card, base.settings), [], base.name);
    }
  });

  void test("wrong grid size, blocked start, bad length, missed goal and leaving the grid are named", () => {
    const [zapisz] = knownBadBases();
    const { card, settings } = zapisz;
    const codes = (changed: typeof card): CodingProblem[] => codingProblems(changed, settings);
    assert.deepEqual(codes({ ...card, blocked: card.blocked.slice(1) }), ["wrong-grid-size"]);
    assert.deepEqual(codes({ ...card, start: [0, 0] }), ["start-or-goal-blocked"]);
    assert.ok(codes({ ...card, path: card.path.slice(0, 5), goal: [3, 2] }).includes("path-length-not-in-level"));
    assert.ok(codes({ ...card, goal: [3, 2] }).includes("path-not-ending-at-goal"));
    assert.ok(codes({ ...card, path: toDirs("RRRRRR") }).includes("path-leaves-grid-or-hits-obstacle"));
  });

  void test("a path that steps on a cell twice is named", () => {
    const [, wykonaj] = knownBadBases();
    const looping = { ...wykonaj.card, path: toDirs("RLRLRL"), goal: [0, 1] as const };
    assert.ok(codingProblems(looping, wykonaj.settings).includes("path-revisits-cell"));
  });

  void test("the key differs when the task differs", () => {
    const [zapisz, wykonaj] = knownBadBases();
    assert.notEqual(codingKey(zapisz.card), codingKey(wykonaj.card));
    assert.equal(codingKey(zapisz.card), codingKey({ ...zapisz.card }));
    assert.notEqual(codingKey(zapisz.card), codingKey({ ...zapisz.card, path: toDirs("RRRUUR") }));
  });
});
