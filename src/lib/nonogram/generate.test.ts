import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { nonogramClues } from "./clues.ts";
import { symmetryTemplatesFor } from "../symmetry/templates.ts";
import {
  composeNonogramCard,
  generateNonogramCard,
  nonogramCardProblems,
  nonogramVariants,
  type NonogramCard,
} from "./generate.ts";
import { composeSimpleNonogramCard, simpleNonogramProblems } from "./simple.ts";
import { CLASSIC_NONOGRAM_SIZES, NONOGRAM_SIZES, nonogramSizeById } from "./sizes.ts";
import { solveNonogram } from "./solve.ts";

const SMALL = nonogramSizeById("latwy");
const MEDIUM = nonogramSizeById("sredni");
const LARGE = nonogramSizeById("trudny");

void describe("nonogramCardProblems", () => {
  void test("accepts a plus sign that the clues fix", () => {
    assert.deepEqual(
      nonogramCardProblems(
        cardOf([
          [false, true, false],
          [true, true, true],
          [false, true, false],
        ]),
      ),
      [],
    );
  });

  void test("rejects an empty picture", () => {
    assert.deepEqual(
      nonogramCardProblems(
        cardOf([
          [false, false],
          [false, false],
        ]),
      ),
      ["no-filled-cell"],
    );
  });

  void test("rejects a picture that two pictures share the clues of (a 2 by 2 diagonal)", () => {
    assert.deepEqual(
      nonogramCardProblems(
        cardOf([
          [true, false],
          [false, true],
        ]),
      ),
      ["not-line-solvable"],
    );
  });

  void test("rejects clues that do not belong to the solution", () => {
    const card = cardOf([
      [false, true, false],
      [true, true, true],
      [false, true, false],
    ]);
    const wrong: NonogramCard = { ...card, clues: { ...card.clues, rows: [[1], [2], [1]] } };

    assert.ok(nonogramCardProblems(wrong).includes("clue-mismatch"));
  });

  void test("rejects a solution other than the one the clues give", () => {
    const card = cardOf([
      [false, true, false],
      [true, true, true],
      [false, true, false],
    ]);
    const other: NonogramCard = {
      ...card,
      solution: [
        [true, true, true],
        [true, true, true],
        [true, true, true],
      ],
    };

    assert.ok(nonogramCardProblems(other).includes("solution-mismatch"));
  });
});

void describe("every variant of every classic level", () => {
  for (const size of CLASSIC_NONOGRAM_SIZES) {
    void test(`${size.id} ${size.columns}x${size.rows}: a variant passes, or fails only because propagation gets stuck`, (t) => {
      const started = performance.now();
      let passing = 0;
      const variants = nonogramVariants(size);

      for (const { template, variants: chosen } of variants) {
        const card = composeNonogramCard(template, chosen, size);
        const problems = nonogramCardProblems(card);
        const solved = solveNonogram(card.clues, card.columns, card.rows);

        assert.deepEqual(
          problems,
          solved.status === "solved" ? [] : ["not-line-solvable"],
          `${card.key} ${solved.status}`,
        );
        if (problems.length === 0) {
          passing += 1;
          assert.deepEqual(solved.status === "solved" && solved.image, card.solution, card.key);
        }
      }

      const elapsed = performance.now() - started;
      t.diagnostic(`${size.id}: ${passing} of ${variants.length} variants have one solution, ${elapsed.toFixed(0)} ms`);
      assert.ok(passing >= 1, `no ${size.id} variant passes`);
      assert.ok(elapsed < 5000, `${size.id} took ${elapsed} ms`);
    });
  }

  void test("the hard level has a variant that passes for every template except the known dead objects", () => {
    const dead = symmetryTemplatesFor(LARGE.templateLevel)
      .filter(
        (template) =>
          !nonogramVariants(LARGE).some(
            (entry) =>
              entry.template.id === template.id &&
              nonogramCardProblems(composeNonogramCard(entry.template, entry.variants, LARGE)).length === 0,
          ),
      )
      .map((template) => template.id);

    // These objects have no variant the line solver can rebuild at 18 by 24; the generator never draws them there.
    assert.deepEqual(
      dead.filter((id) => !["kot", "tulipan"].includes(id)),
      [],
    );
  });

  void test("every template of the medium size has a variant that passes, so no object is dead on the nonogram", () => {
    for (const template of symmetryTemplatesFor(MEDIUM.templateLevel)) {
      const passing = nonogramVariants(MEDIUM)
        .filter((entry) => entry.template.id === template.id)
        .filter(
          (entry) => nonogramCardProblems(composeNonogramCard(entry.template, entry.variants, MEDIUM)).length === 0,
        );

      assert.ok(passing.length >= 1, template.id);
    }
  });
});

void describe("every variant of the easy level", () => {
  void test("a variant passes the chip rules, or fails only because a row needs more chips than fit", (t) => {
    const started = performance.now();
    let passing = 0;
    const variants = nonogramVariants(SMALL);

    for (const { template, variants: chosen } of variants) {
      const card = composeSimpleNonogramCard(template, chosen, SMALL);
      const problems = simpleNonogramProblems(card);

      assert.ok(
        problems.length === 0 || (problems.length === 1 && problems[0] === "too-many-runs"),
        `${card.key} ${problems.join()}`,
      );
      for (const row of card.runs) {
        assert.equal(
          row.reduce((sum, run) => sum + run.count, 0),
          SMALL.columns,
          card.key,
        );
      }
      if (problems.length === 0) {
        passing += 1;
      }
    }

    const elapsed = performance.now() - started;
    t.diagnostic(`latwy: ${passing} of ${variants.length} variants pass, ${elapsed.toFixed(0)} ms`);
    assert.ok(passing >= 1);
    assert.ok(elapsed < 5000);
  });
});

void describe("the solution", () => {
  void test("holes stay empty: the open window of the medium rocket is not filled", () => {
    const rocket = symmetryTemplatesFor("lat5")[0];
    const card = composeNonogramCard(rocket, [0, 0, 0], MEDIUM);

    assert.deepEqual(nonogramCardProblems(card), []);
    for (const row of [4, 5]) {
      for (const col of [4, 5, 6, 7]) {
        assert.equal(card.solution[row][col], false, `${col},${row}`);
      }
    }
  });

  void test("the empty last row of the 7 lat robot has the clue [0] on the 18 by 24 card", () => {
    const robot = symmetryTemplatesFor("lat7").find((template) => template.id === "robot");

    assert.ok(robot);
    const card = composeNonogramCard(robot, [0, 0, 0, 0], LARGE);

    assert.equal(card.rows, 24);
    assert.deepEqual(card.clues.rows[23], [0]);
    assert.equal(card.clues.columns.length, 18);
  });

  void test("the key names the size, so one object on two sizes is two cards", () => {
    const rocket = symmetryTemplatesFor("lat5")[0];

    assert.equal(composeNonogramCard(rocket, [1, 0, 1], MEDIUM).key, "sredni:rakieta:1-0-1");
    assert.notEqual(
      composeNonogramCard(rocket, [0, 0, 0], MEDIUM).key,
      composeNonogramCard(symmetryTemplatesFor("lat4")[0], [0, 0, 0], SMALL).key,
    );
  });
});

void describe("generateNonogramCard", () => {
  for (const size of NONOGRAM_SIZES) {
    void test(`${size.id}: returns a valid card with a key other than the previous one`, () => {
      const random = mulberry32(12);
      let previous: string | null = null;

      for (let round = 0; round < 30; round += 1) {
        const card = generateNonogramCard(random, previous, size);

        assert.ok(card);
        assert.notEqual(card.key, previous);
        assert.deepEqual(
          card.kind === "znaczki" ? simpleNonogramProblems(card) : nonogramCardProblems(card),
          [],
          card.key,
        );
        previous = card.key;
      }
    });
  }

  void test("returns null instead of looping when every draw repeats the previous card", () => {
    const always = (): number => 0;
    const first = generateNonogramCard(always, null, MEDIUM);

    assert.ok(first);
    assert.equal(generateNonogramCard(always, first.key, MEDIUM), null);
  });
});

function cardOf(solution: boolean[][]): NonogramCard {
  return {
    kind: "liczby",
    sizeId: "sredni",
    columns: solution[0].length,
    rows: solution.length,
    cellSize: MEDIUM.cellSize,
    solution,
    clues: nonogramClues(solution),
    key: "test",
  };
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
