import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  generateSequenceCard,
  type SequenceCard,
  sequenceAnswers,
  sequenceCardProblems,
  sequenceRowProblems,
  type SequenceRow,
} from "./generate.ts";
import { sequenceLevelById, SEQUENCE_LEVELS, type SequenceLevel } from "./levels.ts";
import type { SequenceItem } from "./rules.ts";
import { SEQUENCE_SHAPES } from "./shapes.ts";

const LAT4 = sequenceLevelById("lat4");
const LAT5 = sequenceLevelById("lat5");
const LAT6 = sequenceLevelById("lat6");
const LAT7 = sequenceLevelById("lat7");
const SEEDS = 300;
const ORACLE_SEEDS = 120;

const [KOLO, KWADRAT, TROJKAT, GWIAZDKA] = SEQUENCE_SHAPES;

/** What a field may hold on a card: a shape from the catalog or a number from 1 to 20. */
const SYMBOLS: SequenceItem[] = [...SEQUENCE_SHAPES, ...Array.from({ length: 20 }, (_, index) => index + 1)];

/**
 * Independent oracle, written from the PRD and not from rules.ts: does this whole row follow one of the rules of the
 * list? Shapes repeating with a period up to half the row, the unit patterns AB, AAB and ABC, numbers rising by 1 or
 * 2 or falling by 1, the growing groups A, AB, ABB, and a shape on every other field with counting numbers between.
 */
function followsAnyRule(full: readonly SequenceItem[]): boolean {
  const n = full.length;
  const shapes = full.filter((item) => typeof item === "string");
  const numbers = full.filter((item) => typeof item === "number");

  if (shapes.length === n) {
    const periodic = Array.from({ length: Math.floor(n / 2) }, (_, offset) => offset + 1).some((period) =>
      full.every((item, index) => index < period || item === full[index - period]),
    );
    if (periodic || ["AB", "AAB", "ABC"].some((unit) => repeatsUnit(full, unit)) || isGrowingGroups(full)) {
      return true;
    }
  }
  if (numbers.length === n) {
    const step = numbers[1] - numbers[0];
    return (
      [1, 2, -1].includes(step) &&
      numbers.every(
        (value, index) => Number.isInteger(value) && value >= 1 && value <= 20 && value === numbers[0] + step * index,
      )
    );
  }
  return [0, 1].some((shapeParity) => isMixed(full, shapeParity));
}

function repeatsUnit(full: readonly SequenceItem[], unit: string): boolean {
  const shapeOfLetter = new Map<string, SequenceItem>();
  for (const [index, item] of full.entries()) {
    const letter = unit[index % unit.length];
    const known = shapeOfLetter.get(letter);
    if (known !== undefined && known !== item) {
      return false;
    }
    shapeOfLetter.set(letter, item);
  }
  return new Set(shapeOfLetter.values()).size === shapeOfLetter.size;
}

function isGrowingGroups(full: readonly SequenceItem[]): boolean {
  const [a, , b] = full;
  if (a === b) {
    return false;
  }
  const expected: SequenceItem[] = [];
  for (let repeats = 0; expected.length < full.length; repeats += 1) {
    expected.push(a);
    for (let count = 0; count < repeats; count += 1) {
      expected.push(b);
    }
  }
  return full.every((item, index) => item === expected[index]);
}

function isMixed(full: readonly SequenceItem[], shapeParity: number): boolean {
  const shapes = full.filter((_, index) => index % 2 === shapeParity);
  const numbers = full.filter((_, index) => index % 2 !== shapeParity);
  return (
    shapes.every((item) => item === shapes[0] && typeof item === "string") &&
    numbers.every(
      (item, index) => typeof item === "number" && item >= 1 && item <= 20 && item === (numbers[0] as number) + index,
    )
  );
}

/** Every way of filling the gaps with the symbols of a card that leaves a row following some rule. */
function fillingsThatFollowARule(row: SequenceRow): SequenceItem[][] {
  const found: SequenceItem[][] = [];
  const total = SYMBOLS.length ** row.gaps.length;
  for (let code = 0; code < total; code += 1) {
    const filling = row.gaps.map((_, slot) => SYMBOLS[Math.floor(code / SYMBOLS.length ** slot) % SYMBOLS.length]);
    const full = row.values.map((item, index) => (row.gaps.includes(index) ? filling[row.gaps.indexOf(index)] : item));
    if (followsAnyRule(full)) {
      found.push(filling);
    }
  }
  return found;
}

/** The first field a gap may take, by rule, as the PRD describes it (hand-written, not read from rules.ts). */
const FIRST_GAP_BY_RULE = { AB: 2, AAB: 3, ABC: 3, up1: 2, up2: 2, down1: 2, groups: 3, mixed: 2 } as const;

void describe("generateSequenceCard", () => {
  void test("every card of every level passes the validator and has the shape the PRD table gives", () => {
    const table = {
      lat4: { n: 5, rows: 5, gaps: [1, 1, 1, 1, 1] },
      lat5: { n: 7, rows: 6, gaps: [1, 1, 1, 2, 2, 2] },
      lat6: { n: 8, rows: 7, gaps: [2, 2, 2, 2, 2, 2, 2] },
      lat7: { n: 8, rows: 7, gaps: [2, 2, 2, 2, 3, 3, 3] },
    };
    for (const level of SEQUENCE_LEVELS) {
      const expected = table[level.id];
      for (let seed = 0; seed < SEEDS; seed += 1) {
        const label = `${level.id} seed ${seed}`;
        const card = generateSequenceCard(mulberry32(seed), null, level);
        assert.ok(card, label);
        assert.deepEqual(sequenceCardProblems(card, level), [], label);
        assert.equal(card.levelId, level.id, label);
        assert.equal(card.fieldsPerRow, expected.n, label);
        assert.equal(card.rows.length, expected.rows, label);
        assert.deepEqual(card.rows.map((row) => row.gaps.length).sort(), expected.gaps, label);
        assert.equal(new Set(card.rows.map((row) => row.values.join(","))).size, expected.rows, label);
        for (const row of card.rows) {
          assert.equal(row.values.length, expected.n, label);
          assert.ok(row.gaps[0] >= FIRST_GAP_BY_RULE[row.rule], `${label} ${row.rule} gap ${row.gaps[0]}`);
        }
      }
    }
  });

  void test("every level draws the rules the PRD table names and no others", () => {
    const rulesOf = (level: SequenceLevel): string[] => {
      const seen = new Set<string>();
      for (let seed = 0; seed < SEEDS; seed += 1) {
        generateSequenceCard(mulberry32(seed), null, level)?.rows.forEach((row) => {
          seen.add(row.rule);
        });
      }
      return [...seen].sort();
    };

    assert.deepEqual(rulesOf(LAT4), ["AB"]);
    assert.deepEqual(rulesOf(LAT5), ["AAB", "AB", "ABC"]);
    assert.deepEqual(rulesOf(LAT6), ["AAB", "AB", "ABC"]);
    assert.deepEqual(rulesOf(LAT7), ["down1", "groups", "mixed"]);
  });

  void test("every row of every level has exactly one answer, found by trying all fillings of the gaps", () => {
    for (const level of SEQUENCE_LEVELS) {
      for (let seed = 0; seed < ORACLE_SEEDS; seed += 1) {
        const card = generateSequenceCard(mulberry32(seed), null, level);
        assert.ok(card, `${level.id} seed ${seed}`);
        for (const row of card.rows) {
          const fillings = fillingsThatFollowARule(row);
          const label = `${level.id} seed ${seed} ${row.rule} ${row.values.join(",")} gaps ${row.gaps.join(",")}`;
          assert.equal(fillings.length, 1, label);
          assert.deepEqual(
            fillings[0],
            row.gaps.map((gap) => row.values[gap]),
            label,
          );
        }
      }
    }
  });

  void test("levels 4 and 5 keep the last field and the second half for their gaps, every shape and number appears", () => {
    const secondGaps = new Set<number>();
    const shapes = new Set<SequenceItem>();
    for (let seed = 0; seed < SEEDS; seed += 1) {
      for (const level of [LAT4, LAT5]) {
        const card = generateSequenceCard(mulberry32(seed), null, level);
        assert.ok(card);
        for (const row of card.rows) {
          assert.equal(row.gaps[row.gaps.length - 1], level.fieldsPerRow - 1, `${level.id} seed ${seed}`);
          row.values.forEach((item) => shapes.add(item));
          if (row.gaps.length === 2) {
            secondGaps.add(row.gaps[0]);
          }
        }
      }
    }
    assert.deepEqual([...secondGaps].sort(), [4, 5]);
    assert.deepEqual([...shapes].sort(), [...SEQUENCE_SHAPES].sort());

    const numbers = new Set<number>();
    for (let seed = 0; seed < SEEDS; seed += 1) {
      for (const level of [LAT7]) {
        for (const row of generateSequenceCard(mulberry32(seed), null, level)?.rows ?? []) {
          for (const item of row.values) {
            if (typeof item === "number") {
              numbers.add(item);
            }
          }
        }
      }
    }
    assert.ok(Math.min(...numbers) === 1 && Math.max(...numbers) === 20, [...numbers].join(","));
  });

  void test("the next card never has the key of the previous one or the same sequences with other gaps", () => {
    for (const level of SEQUENCE_LEVELS) {
      const random = mulberry32(7);
      let previous: string | null = null;
      let previousSequences = "";
      const sequencesOf = (card: SequenceCard): string =>
        card.rows.map((row) => `${row.rule}.${row.values.join("-")}`).join("|");
      for (let step = 0; step < 100; step += 1) {
        const card = generateSequenceCard(random, previous, level);
        assert.ok(card, `${level.id} step ${step}`);
        assert.notEqual(card.key, previous, `${level.id} step ${step}`);
        assert.notEqual(sequencesOf(card), previousSequences, `${level.id} step ${step} differs only in its gaps`);
        previousSequences = sequencesOf(card);
        previous = card.key;
      }
    }
  });

  void test("the same random source gives the same card", () => {
    for (const level of SEQUENCE_LEVELS) {
      assert.equal(
        generateSequenceCard(mulberry32(3), null, level)?.key,
        generateSequenceCard(mulberry32(3), null, level)?.key,
      );
    }
  });

  void test("a hundred cards of the hardest level take far less than the 5 seconds a Generuj may take", () => {
    const random = mulberry32(11);
    const started = performance.now();
    for (let step = 0; step < 100; step += 1) {
      assert.ok(generateSequenceCard(random, null, LAT7));
    }
    assert.ok(performance.now() - started < 5000);
  });

  void test("serce, krzyzyk and strzalka appear on lat4, lat5 and lat6 and in groups or mixed on lat7", () => {
    const patternLevels = [LAT4, LAT5, LAT6] as const;
    const seen = {
      lat4: new Set<string>(),
      lat5: new Set<string>(),
      lat6: new Set<string>(),
      lat7: new Set<string>(),
    };
    for (let seed = 0; seed < SEEDS; seed += 1) {
      for (const level of patternLevels) {
        const card = generateSequenceCard(mulberry32(seed), null, level);
        assert.ok(card, `${level.id} seed ${seed}`);
        for (const item of card.rows.flatMap((row) => row.values)) {
          if (typeof item === "string") {
            seen[level.id].add(item);
          }
        }
      }
      const card = generateSequenceCard(mulberry32(seed), null, LAT7);
      assert.ok(card, `lat7 seed ${seed}`);
      for (const row of card.rows) {
        if (row.rule !== "groups" && row.rule !== "mixed") {
          continue;
        }
        for (const item of row.values) {
          if (typeof item === "string") {
            seen.lat7.add(item);
          }
        }
      }
    }
    for (const shape of ["serce", "krzyzyk", "strzalka"]) {
      assert.ok(seen.lat4.has(shape), `lat4 ${shape}`);
      assert.ok(seen.lat5.has(shape), `lat5 ${shape}`);
      assert.ok(seen.lat6.has(shape), `lat6 ${shape}`);
      assert.ok(seen.lat7.has(shape), `lat7 ${shape}`);
    }
  });
});

void describe("sequenceAnswers", () => {
  void test("a rising-by-two row with two gaps has one answer", () => {
    assert.deepEqual(sequenceAnswers([2, null, 6, 8, null, 12, 14, 16]).answers, [[4, 10]]);
  });

  void test("a start that fits a period of 2 and of 3 gives two different answers", () => {
    const result = sequenceAnswers([KOLO, KWADRAT, KOLO, null, null, null, null]);

    assert.deepEqual(result.answers.map((answer) => answer.join(",")).sort(), [
      [KOLO, KWADRAT, KOLO, KOLO].join(","),
      [KWADRAT, KOLO, KWADRAT, KOLO].join(","),
    ]);
  });

  void test("a gap with no visible field in its remainder class has several answers", () => {
    assert.ok(sequenceAnswers([KOLO, KWADRAT, null, null, null, null, null]).answers.length > 1);
  });

  void test("visible fields that fit no rule give no answer", () => {
    assert.deepEqual(sequenceAnswers([KOLO, KWADRAT, TROJKAT, KOLO, KWADRAT, KOLO, null]), { answers: [] });
  });

  void test("a number and a shape in one run give no answer", () => {
    assert.deepEqual(sequenceAnswers([1, KOLO, 3, 4, 5, 6, null, 8]), { answers: [] });
  });
});

void describe("sequenceRowProblems", () => {
  const good: SequenceRow = {
    rule: "AAB",
    values: [KOLO, KOLO, KWADRAT, KOLO, KOLO, KWADRAT, KOLO],
    gaps: [5, 6],
  };

  void test("a good row has no problems", () => {
    assert.deepEqual(sequenceRowProblems(good, LAT5), []);
  });

  void test("a start that fits two periods is ambiguous", () => {
    const row: SequenceRow = {
      rule: "AB",
      values: [KOLO, KWADRAT, KOLO, KWADRAT, KOLO, KWADRAT, KOLO],
      gaps: [3, 4, 5, 6],
    };

    const problems = sequenceRowProblems(row, LAT5);

    assert.ok(problems.includes("ambiguous"), problems.join(","));
    assert.ok(problems.includes("gap-count"), problems.join(","));
  });

  void test("a row whose gaps hide a whole class of a period of four is ambiguous", () => {
    const row: SequenceRow = {
      rule: "AB",
      values: [KOLO, KWADRAT, KOLO, KWADRAT, KOLO, KWADRAT, KOLO, KWADRAT],
      gaps: [2, 6],
    };

    assert.deepEqual(sequenceRowProblems(row, LAT6), ["ambiguous"]);
  });

  void test("the validator reads the answer from the visible fields, not from the stored values", () => {
    const row: SequenceRow = { ...good, values: [KOLO, KOLO, KWADRAT, KOLO, KOLO, KWADRAT, TROJKAT] };

    assert.ok(sequenceRowProblems(row, LAT5).includes("answer-mismatch"));
  });

  void test("a first gap before the rule is shown is reported", () => {
    const row: SequenceRow = {
      rule: "ABC",
      values: [KOLO, KWADRAT, TROJKAT, KOLO, KWADRAT, TROJKAT, KOLO],
      gaps: [2, 6],
    };

    assert.ok(sequenceRowProblems(row, LAT5).includes("gap-before-rule-shown"));
  });

  void test("a second gap in the first half is reported at 5 lat", () => {
    assert.ok(sequenceRowProblems({ ...good, gaps: [3, 6] }, LAT5).includes("second-gap-outside-second-half"));
  });

  void test("a row whose last field is not a gap is reported at 5 lat but allowed at 6 lat", () => {
    assert.ok(sequenceRowProblems({ ...good, gaps: [4, 5] }, LAT5).includes("last-not-gap"));

    const numbers: SequenceRow = { rule: "up1", values: [3, 4, 5, 6, 7, 8, 9, 10], gaps: [3, 5] };
    assert.deepEqual(sequenceRowProblems(numbers, LAT6), []);
  });

  void test("a row that does not follow its rule is reported", () => {
    const equalUnit: SequenceRow = { rule: "AB", values: Array<SequenceItem>(7).fill(KOLO), gaps: [6] };
    const wrongStep: SequenceRow = { rule: "up1", values: [2, 4, 6, 8, 10, 12, 14, 16], gaps: [3, 5] };

    assert.ok(sequenceRowProblems(equalUnit, LAT5).includes("rule-mismatch"));
    assert.ok(sequenceRowProblems(wrongStep, LAT6).includes("rule-mismatch"));
  });

  void test("a row of the wrong length is reported", () => {
    assert.ok(sequenceRowProblems({ ...good, values: good.values.slice(0, 6) }, LAT5).includes("wrong-length"));
  });

  void test("an unknown shape and a number outside 1 to 20 are reported", () => {
    const values = good.values.map((item) => (item === KOLO ? ("romb" as SequenceItem) : item));
    assert.ok(!(SEQUENCE_SHAPES as readonly string[]).includes("romb"));
    const tooBig: SequenceRow = { rule: "up1", values: [15, 16, 17, 18, 19, 20, 21, 22], gaps: [3, 5] };

    assert.ok(sequenceRowProblems({ ...good, values }, LAT5).includes("unknown-item"));
    assert.ok(sequenceRowProblems(tooBig, LAT6).includes("unknown-item"));
  });

  void test("falling numbers, growing groups and mixed rows with their gaps have no problems", () => {
    const down: SequenceRow = { rule: "down1", values: [14, 13, 12, 11, 10, 9, 8, 7], gaps: [3, 6] };
    const groups: SequenceRow = {
      rule: "groups",
      values: [KOLO, KOLO, KWADRAT, KOLO, KWADRAT, KWADRAT, KOLO, KWADRAT],
      gaps: [4, 6],
    };
    const mixed: SequenceRow = {
      rule: "mixed",
      values: [GWIAZDKA, 1, GWIAZDKA, 2, GWIAZDKA, 3, GWIAZDKA, 4],
      gaps: [3, 5],
    };

    assert.deepEqual(sequenceRowProblems(down, LAT6), []);
    assert.deepEqual(sequenceRowProblems(groups, LAT7), []);
    assert.deepEqual(sequenceRowProblems(mixed, LAT7), []);
  });

  void test("a gap row of the wrong size for the level is reported", () => {
    const one: SequenceRow = { rule: "up1", values: [3, 4, 5, 6, 7, 8, 9, 10], gaps: [5] };
    const four: SequenceRow = { rule: "up1", values: [3, 4, 5, 6, 7, 8, 9, 10], gaps: [2, 3, 4, 5] };

    assert.ok(sequenceRowProblems(one, LAT6).includes("gap-count"));
    assert.ok(sequenceRowProblems(four, LAT7).includes("gap-count"));
  });
});

void describe("sequenceRowProblems against the oracle", () => {
  const fixedRows: SequenceRow[] = [
    { rule: "AB", values: [KOLO, KWADRAT, KOLO, KWADRAT, KOLO, KWADRAT, KOLO, KWADRAT], gaps: [] },
    { rule: "AAB", values: [KOLO, KOLO, KWADRAT, KOLO, KOLO, KWADRAT, KOLO, KOLO], gaps: [] },
    { rule: "ABC", values: [KOLO, KWADRAT, TROJKAT, KOLO, KWADRAT, TROJKAT, KOLO, KWADRAT], gaps: [] },
    { rule: "up1", values: [3, 4, 5, 6, 7, 8, 9, 10], gaps: [] },
    { rule: "up2", values: [2, 4, 6, 8, 10, 12, 14, 16], gaps: [] },
    { rule: "down1", values: [14, 13, 12, 11, 10, 9, 8, 7], gaps: [] },
    { rule: "groups", values: [KOLO, KOLO, KWADRAT, KOLO, KWADRAT, KWADRAT, KOLO, KWADRAT], gaps: [] },
    { rule: "mixed", values: [GWIAZDKA, 1, GWIAZDKA, 2, GWIAZDKA, 3, GWIAZDKA, 4], gaps: [] },
  ];

  /** Every set of `size` field indexes out of 0..7, in ascending order. */
  function gapSets(size: number, from = 0): number[][] {
    if (size === 0) {
      return [[]];
    }
    return Array.from({ length: 8 - from }, (_, offset) => from + offset).flatMap((index) =>
      gapSets(size - 1, index + 1).map((rest) => [index, ...rest]),
    );
  }

  void test("the validator calls a row ambiguous exactly when the oracle finds more than one filling", () => {
    let ambiguous = 0;
    let unambiguous = 0;
    for (const base of fixedRows) {
      for (const size of [2, 3]) {
        const level: SequenceLevel = { ...LAT7, gaps: size, extraGapRows: 0, gapPlacement: "free" };
        for (const gaps of gapSets(size)) {
          const row: SequenceRow = { ...base, gaps };
          const label = `${base.rule} gaps ${gaps.join(",")}`;
          const fillings = fillingsThatFollowARule(row).length;
          const isAmbiguous = sequenceRowProblems(row, level).includes("ambiguous");

          assert.ok(fillings >= 1, label);
          assert.equal(isAmbiguous, fillings > 1, label);
          if (isAmbiguous) {
            ambiguous += 1;
          } else {
            unambiguous += 1;
          }
        }
      }
    }
    // Both sides of the comparison are exercised, not only rows that happen to be unambiguous.
    assert.ok(ambiguous > 20 && unambiguous > 20, `${ambiguous} ambiguous, ${unambiguous} unambiguous`);
  });
});

void describe("sequenceCardProblems", () => {
  const card = generateSequenceCard(mulberry32(1), null, LAT5);

  void test("a card with a row missing is reported", () => {
    assert.ok(card);
    assert.ok(sequenceCardProblems({ ...card, rows: card.rows.slice(1) }, LAT5).includes("row-count"));
  });

  void test("a duplicated row is reported", () => {
    assert.ok(card);
    const rows = [...card.rows.slice(0, 5), card.rows[0]];

    assert.ok(sequenceCardProblems({ ...card, rows }, LAT5).includes("duplicate-row"));
  });

  void test("a card without one of the rules is reported", () => {
    assert.ok(card);
    const rows = card.rows.map((row) => (row.rule === "ABC" ? { ...row, rule: "AB" as const } : row));

    assert.ok(sequenceCardProblems({ ...card, rows }, LAT5).includes("missing-rule"));
  });

  void test("a card with the wrong number of rows that have an extra gap is reported", () => {
    assert.ok(card);
    const rows = card.rows.map((row) => ({ ...row, gaps: [6] }));

    assert.ok(sequenceCardProblems({ ...card, rows }, LAT5).includes("gap-row-count"));
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
