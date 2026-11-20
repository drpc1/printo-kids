import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { VerifiedCard } from "../card-contract.ts";
import { numberMazeEngine, numberMazeSpec } from "./engine.ts";
import { NUMBER_MAZE_LEVELS } from "./levels.ts";

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

void describe("numberMazeEngine", () => {
  void test("every known bad card is rejected with its code", () => {
    assert.ok(numberMazeSpec.knownBad.length >= 2);
    for (const bad of numberMazeSpec.knownBad) {
      const codes = numberMazeSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(codes.includes(bad.expectedCode), `${bad.name}: ${codes.join(", ")}`);
    }
  });

  void test("the level changes the content key", () => {
    assert.notEqual(numberMazeSpec.contentKey({ level: "poziom1" }), numberMazeSpec.contentKey({ level: "poziom2" }));
  });

  void test("generates a verified card on every level, different from the previous one", () => {
    for (const level of NUMBER_MAZE_LEVELS) {
      const first = numberMazeEngine.generate({ level: level.id }, seeded(1), null);
      assert.ok(first instanceof VerifiedCard);
      const second = numberMazeEngine.generate({ level: level.id }, seeded(1), first.key);
      assert.notEqual(second.key, first.key);
    }
  });
});
