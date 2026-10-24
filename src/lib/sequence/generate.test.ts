import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  generateSequenceCard,
  sequenceAnswers,
  sequenceCardProblems,
  sequenceRowProblems,
  type SequenceRow,
} from "./generate.ts";
import { SEQUENCE_LEVEL_LAT5 } from "./levels.ts";
import { SEQUENCE_SHAPES, type SequenceShape } from "./shapes.ts";

const LEVEL = SEQUENCE_LEVEL_LAT5;
const N = LEVEL.fieldsPerRow;
const SEEDS = 500;

const [KOLO, KWADRAT, TROJKAT] = SEQUENCE_SHAPES;

/**
 * Independent oracle: tries every way of filling the gaps with the four shapes and keeps those that leave the whole
 * row repeating with some period up to half its length. It does not use sequenceAnswers.
 */
function fillingsThatContinueThePattern(row: SequenceRow): SequenceShape[][] {
  const found: SequenceShape[][] = [];
  const shapeCount = SEQUENCE_SHAPES.length;
  for (let code = 0; code < shapeCount ** row.gaps.length; code += 1) {
    const filling = row.gaps.map((_, slot) => SEQUENCE_SHAPES[Math.floor(code / shapeCount ** slot) % shapeCount]);
    const full = row.values.map((shape, index) =>
      row.gaps.includes(index) ? filling[row.gaps.indexOf(index)] : shape,
    );
    const periodic = Array.from({ length: Math.floor(N / 2) }, (_, offset) => offset + 1).some((period) =>
      full.every((shape, index) => index < period || shape === full[index - period]),
    );
    if (periodic) {
      found.push(filling);
    }
  }
  return found;
}

void describe("generateSequenceCard", () => {
  void test("every card passes the validator and has the shape the level describes", () => {
    for (let seed = 0; seed < SEEDS; seed += 1) {
      const card = generateSequenceCard(mulberry32(seed), null, LEVEL);
      assert.ok(card, `seed ${seed}`);
      assert.deepEqual(sequenceCardProblems(card, LEVEL), [], `seed ${seed}`);
      assert.equal(card.rows.length, 6, `seed ${seed}`);
      assert.equal(card.rows.filter((row) => row.gaps.length === 2).length, 3, `seed ${seed}`);
      for (const pattern of LEVEL.patterns) {
        assert.ok(
          card.rows.some((row) => row.pattern === pattern),
          `seed ${seed} pattern ${pattern}`,
        );
      }
      assert.equal(new Set(card.rows.map((row) => JSON.stringify(row))).size, 6, `seed ${seed}`);
      for (const row of card.rows) {
        assert.equal(row.values.length, N, `seed ${seed}`);
        assert.equal(row.gaps[row.gaps.length - 1], 6, `seed ${seed}`);
        if (row.gaps.length === 2) {
          assert.ok(row.gaps[0] === 4 || row.gaps[0] === 5, `seed ${seed} gap ${row.gaps[0]}`);
        }
      }
    }
  });

  void test("every row has exactly one answer, found by trying all fillings of the gaps", () => {
    for (let seed = 0; seed < SEEDS; seed += 1) {
      const card = generateSequenceCard(mulberry32(seed), null, LEVEL);
      assert.ok(card, `seed ${seed}`);
      for (const row of card.rows) {
        const fillings = fillingsThatContinueThePattern(row);
        const label = `seed ${seed} ${row.pattern} ${row.values.join(",")} gaps ${row.gaps.join(",")}`;
        assert.equal(fillings.length, 1, label);
        assert.deepEqual(
          fillings[0],
          row.gaps.map((gap) => row.values[gap]),
          label,
        );
      }
    }
  });

  void test("the sample covers every pattern, every shape and both positions of the second gap", () => {
    const patterns = new Set<string>();
    const shapes = new Set<string>();
    const secondGaps = new Set<number>();
    for (let seed = 0; seed < SEEDS; seed += 1) {
      const card = generateSequenceCard(mulberry32(seed), null, LEVEL);
      assert.ok(card);
      for (const row of card.rows) {
        patterns.add(row.pattern);
        row.values.forEach((shape) => shapes.add(shape));
        if (row.gaps.length === 2) {
          secondGaps.add(row.gaps[0]);
        }
      }
    }
    assert.deepEqual([...patterns].sort(), ["AAB", "AB", "ABC"]);
    assert.deepEqual([...shapes].sort(), [...SEQUENCE_SHAPES].sort());
    assert.deepEqual([...secondGaps].sort(), [4, 5]);
  });

  void test("the next card never has the key of the previous one", () => {
    const random = mulberry32(7);
    let previous: string | null = null;
    for (let step = 0; step < 100; step += 1) {
      const card = generateSequenceCard(random, previous, LEVEL);
      assert.ok(card, `step ${step}`);
      assert.notEqual(card.key, previous, `step ${step}`);
      previous = card.key;
    }
  });

  void test("the same random source gives the same card", () => {
    assert.equal(
      generateSequenceCard(mulberry32(3), null, LEVEL)?.key,
      generateSequenceCard(mulberry32(3), null, LEVEL)?.key,
    );
  });
});

void describe("sequenceAnswers", () => {
  void test("a visible start that fits a period of 2 and of 3 gives two different answers", () => {
    const result = sequenceAnswers([KOLO, KWADRAT, KOLO, null, null, null, null], 3);

    assert.equal(result.undetermined, false);
    assert.deepEqual(result.answers.map((answer) => answer.join(",")).sort(), [
      [KOLO, KWADRAT, KOLO, KOLO].join(","),
      [KWADRAT, KOLO, KWADRAT, KOLO].join(","),
    ]);
  });

  void test("a gap without a visible field in its remainder class is undetermined", () => {
    assert.equal(sequenceAnswers([KOLO, KWADRAT, null], 3).undetermined, true);
  });

  void test("visible fields that fit no period give no answer", () => {
    assert.deepEqual(sequenceAnswers([KOLO, KWADRAT, TROJKAT, KOLO, KWADRAT, KOLO, null], 3), {
      answers: [],
      undetermined: false,
    });
  });
});

void describe("sequenceRowProblems", () => {
  const good: SequenceRow = {
    pattern: "AAB",
    values: [KOLO, KOLO, KWADRAT, KOLO, KOLO, KWADRAT, KOLO],
    gaps: [4, 6],
  };

  void test("a good row has no problems", () => {
    assert.deepEqual(sequenceRowProblems(good, N), []);
  });

  void test("a start that fits two periods is ambiguous", () => {
    const row: SequenceRow = {
      pattern: "AB",
      values: [KOLO, KWADRAT, KOLO, KWADRAT, KOLO, KWADRAT, KOLO],
      gaps: [3, 4, 5, 6],
    };

    const problems = sequenceRowProblems(row, N);

    assert.ok(problems.includes("ambiguous"), problems.join(","));
    assert.ok(problems.includes("gap-count"), problems.join(","));
  });

  void test("the validator reads the answer from the visible fields, not from the stored values", () => {
    const row: SequenceRow = { ...good, values: [KOLO, KOLO, KWADRAT, KOLO, KOLO, KWADRAT, TROJKAT] };

    assert.ok(sequenceRowProblems(row, N).includes("answer-mismatch"));
  });

  void test("a first gap before the pattern is shown in full is reported", () => {
    const row: SequenceRow = {
      pattern: "ABC",
      values: [KOLO, KWADRAT, TROJKAT, KOLO, KWADRAT, TROJKAT, KOLO],
      gaps: [2, 6],
    };

    assert.ok(sequenceRowProblems(row, N).includes("gap-before-pattern-shown"));
  });

  void test("a second gap in the first half is reported", () => {
    assert.ok(sequenceRowProblems({ ...good, gaps: [3, 6] }, N).includes("second-gap-outside-second-half"));
  });

  void test("a row whose last field is not a gap is reported", () => {
    assert.ok(sequenceRowProblems({ ...good, gaps: [4, 5] }, N).includes("last-not-gap"));
  });

  void test("an AB unit with two equal shapes is reported", () => {
    const row: SequenceRow = { pattern: "AB", values: Array<SequenceShape>(N).fill(KOLO), gaps: [6] };

    assert.ok(sequenceRowProblems(row, N).includes("pattern-mismatch"));
  });

  void test("a row of the wrong length is reported", () => {
    assert.ok(sequenceRowProblems({ ...good, values: good.values.slice(0, 6) }, N).includes("wrong-length"));
  });

  void test("an unknown shape is reported", () => {
    const values = good.values.map((shape) => (shape === KOLO ? "serce" : shape)) as SequenceShape[];

    assert.ok(sequenceRowProblems({ ...good, values }, N).includes("unknown-shape"));
  });
});

void describe("sequenceCardProblems", () => {
  const card = generateSequenceCard(mulberry32(1), null, LEVEL);

  void test("a card of five rows is reported", () => {
    assert.ok(card);
    assert.ok(sequenceCardProblems({ ...card, rows: card.rows.slice(1) }, LEVEL).includes("row-count"));
  });

  void test("a duplicated row is reported", () => {
    assert.ok(card);
    const rows = [...card.rows.slice(0, 5), card.rows[0]];

    assert.ok(sequenceCardProblems({ ...card, rows }, LEVEL).includes("duplicate-row"));
  });

  void test("a card without one of the patterns is reported", () => {
    assert.ok(card);
    const rows = card.rows.map((row) => (row.pattern === "ABC" ? { ...row, pattern: "AB" as const } : row));

    assert.ok(sequenceCardProblems({ ...card, rows }, LEVEL).includes("missing-pattern"));
  });

  void test("a card with the wrong number of two-gap rows is reported", () => {
    assert.ok(card);
    const rows = card.rows.map((row) => ({ ...row, gaps: [6] }));

    assert.ok(sequenceCardProblems({ ...card, rows }, LEVEL).includes("two-gap-row-count"));
  });
});

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
