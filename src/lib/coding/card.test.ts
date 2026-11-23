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

void describe("codingProblems: settings and target rules", () => {
  const [zapisz, wykonaj] = knownBadBases();
  const wy = (changed: Partial<typeof wykonaj.card>): CodingProblem[] =>
    codingProblems({ ...wykonaj.card, ...changed }, wykonaj.settings);
  const [star, heart, circle] = wykonaj.card.targets;

  void test("a card for another level or mode than asked is named", () => {
    assert.ok(codingProblems(zapisz.card, { ...zapisz.settings, level: "poziom2" }).includes("settings-mismatch"));
    assert.ok(codingProblems(zapisz.card, { ...zapisz.settings, mode: "wykonaj" }).includes("settings-mismatch"));
    assert.ok(!codingProblems(zapisz.card, zapisz.settings).includes("settings-mismatch"));
  });

  void test("rows of the wrong width are a wrong grid size", () => {
    const blocked = zapisz.card.blocked.map((row, i) => (i === 2 ? row.slice(1) : row));
    assert.deepEqual(codingProblems({ ...zapisz.card, blocked }, zapisz.settings), ["wrong-grid-size"]);
  });

  void test("a path with fewer turns than the level asks for is named", () => {
    const blocked = Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => false));
    const card = { ...wykonaj.card, level: "poziom2" as const, blocked, start: [0, 0] as const, goal: [5, 4] as const };
    const path = toDirs("RRRRRDDDD");
    const targets = [
      { ...star, cell: [5, 4] as const },
      { ...heart, cell: [5, 5] as const },
      { ...circle, cell: [4, 5] as const },
    ];
    const codes = codingProblems({ ...card, path, targets }, { level: "poziom2", mode: "wykonaj" });
    assert.deepEqual(codes, ["too-few-turns"]);
  });

  void test("Zapisz: a second shortest path and pictures on the card are named", () => {
    const blocked = zapisz.card.blocked.map((row, i) => (i === 3 ? row.map((b, j) => (j === 2 ? false : b)) : row));
    assert.ok(codingProblems({ ...zapisz.card, blocked }, zapisz.settings).includes("shortest-path-not-unique"));
    assert.ok(codingProblems({ ...zapisz.card, targets: [star] }, zapisz.settings).includes("wrong-target-count"));
  });

  void test("Wykonaj: exactly three different pictures, one goal on the goal cell, all on free cells", () => {
    assert.deepEqual(wy({}), []);
    assert.ok(wy({ targets: [star, heart] }).includes("wrong-target-count"));
    assert.ok(wy({ targets: [star, heart, { ...circle, kind: "heart" }] }).includes("wrong-target-count"));
    assert.ok(wy({ targets: [star, heart, { ...circle, cell: heart.cell }] }).includes("wrong-target-count"));
    assert.ok(wy({ targets: [star, { ...heart, isGoal: true }, circle] }).includes("wrong-target-count"));
    assert.ok(
      wy({ targets: [{ ...star, isGoal: false }, { ...heart, isGoal: true }, circle] }).includes("wrong-target-count"),
    );
    assert.ok(wy({ targets: [star, heart, { ...circle, cell: [1, 0] }] }).includes("wrong-target-count"));
  });

  void test("Wykonaj: a distractor on the path or far from the goal is named", () => {
    assert.ok(wy({ targets: [star, { ...heart, cell: [2, 2] }, circle] }).includes("distractor-on-path"));
    const far = wy({ targets: [star, heart, { ...circle, cell: [0, 0] }] });
    assert.ok(far.includes("distractor-too-far"));
    assert.ok(!wy({}).includes("distractor-too-far"));
  });

  void test("the key tells apart cards that differ only in obstacles or pictures", () => {
    const blocked = wykonaj.card.blocked.map((row, i) => (i === 4 ? row.map((b, j) => (j === 0 ? true : b)) : row));
    assert.notEqual(codingKey(wykonaj.card), codingKey({ ...wykonaj.card, blocked }));
    assert.notEqual(codingKey(wykonaj.card), codingKey({ ...wykonaj.card, targets: [heart, star, circle] }));
    assert.notEqual(
      codingKey(wykonaj.card),
      codingKey({ ...wykonaj.card, targets: [{ ...star, isGoal: false }, star, circle].slice(0, 3) }),
    );
  });
});
