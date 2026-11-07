// Contract tests C1-C9 (D02 6.1) plus the cost gate for `VerifiedCard.require` (gh283, phase 2).
// The engines below are test doubles in the two modes D02 4.3 names: sampling (check, draw again, CardExhausted)
// and constructive (require on the winner, CardInvariantError).
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  CardExhausted,
  CardInvariantError,
  VerifiedCard,
  type CardEngine,
  type CardKindId,
  type CardProblem,
  type CardSpec,
} from "./card-contract.ts";
import { dictationLevelById } from "./dictation/levels.ts";
import { generateDictationCard } from "./dictation/generate.ts";
import { generateMaze } from "./maze/generate.ts";
import { generateNonogramCard } from "./nonogram/generate.ts";
import { nonogramSizeById } from "./nonogram/sizes.ts";
import { generateSudokuCard } from "./sudoku/generate.ts";

/** A kind that is not in the catalog: the contract works for any id the registry will ever have. */
const TOY = "toy" as CardKindId;

// Mutation runs (stryker/*.config.json) set MUTATION_RUN=1: instrumented code is several times slower, so a wall-clock
// budget would kill mutants for the wrong reason. npm test keeps every time budget.
const MUTATION_RUN = process.env.MUTATION_RUN === "1";

interface ToyCard {
  id: number;
  cells: { value: number }[];
}

interface ToySettings {
  limit: number;
}

const toySpec: CardSpec<ToySettings, ToyCard> = {
  kind: TOY,
  problems: (card, settings) => {
    const problems: CardProblem[] = [];
    if (card.id > settings.limit) problems.push({ code: "id-too-big", detail: `id ${card.id} > ${settings.limit}` });
    if (card.cells.length === 0) problems.push({ code: "no-cells", detail: "empty" });
    return problems;
  },
  keyOf: (card) => `toy-${card.id}`,
  contentKey: (settings) => `limit-${settings.limit}`,
  knownBad: [],
};

const legal = (): ToyCard => ({ id: 1, cells: [{ value: 1 }, { value: 2 }] });
const settings: ToySettings = { limit: 5 };

void describe("VerifiedCard", () => {
  void test("C1 require of a legal card returns it with the kind and the key", () => {
    const verified = VerifiedCard.require(toySpec, legal(), settings);
    assert.equal(verified.kind, TOY);
    assert.equal(verified.key, "toy-1");
    assert.deepEqual(verified.card, legal());
  });

  void test("C2 require of an illegal card throws CardInvariantError with the kind and the problems", () => {
    const bad: ToyCard = { id: 9, cells: [] };
    assert.throws(
      () => VerifiedCard.require(toySpec, bad, settings),
      (error: unknown) => {
        assert.ok(error instanceof CardInvariantError);
        assert.equal(error.name, "CardInvariantError");
        assert.equal(error.kind, TOY);
        assert.deepEqual(
          error.problems.map((problem) => problem.code),
          ["id-too-big", "no-cells"],
        );
        assert.match(error.message, /id-too-big/);
        return true;
      },
    );
  });

  void test("C3 check of an illegal card returns the problems and does not throw", () => {
    const result = VerifiedCard.check(toySpec, { id: 9, cells: [{ value: 1 }] }, settings);
    assert.ok(!result.ok);
    assert.deepEqual(
      result.problems.map((problem) => problem.code),
      ["id-too-big"],
    );
  });

  void test("C4 check of a legal card returns the verified card", () => {
    const result = VerifiedCard.check(toySpec, legal(), settings);
    assert.ok(result.ok);
    assert.ok(result.card instanceof VerifiedCard);
    assert.equal(result.card.key, "toy-1");
  });

  void test("C5 the verified card is frozen all the way down", () => {
    const verified = VerifiedCard.require(toySpec, legal(), settings);
    assert.throws(() => {
      (verified.card as ToyCard).id = 2;
    }, TypeError);
    assert.throws(() => {
      (verified.card.cells as { value: number }[]).push({ value: 3 });
    }, TypeError);
    assert.throws(() => {
      verified.card.cells[0].value = 7;
    }, TypeError);
  });

  void test("C6 changing the input card after require does not change the verified card", () => {
    const input = legal();
    const verified = VerifiedCard.require(toySpec, input, settings);
    input.id = 99;
    input.cells[0].value = 99;
    input.cells.push({ value: 3 });
    assert.deepEqual(verified.card, legal());
  });

  void test("C9 a verified card cannot be built outside the module", () => {
    // The constructor is private: removing the directive below must fail `npx astro check`. Never called.
    const forge = (): void => {
      // @ts-expect-error private constructor
      new VerifiedCard(TOY, legal(), "toy-1");
    };
    assert.equal(typeof forge, "function");
  });
});

void describe("CardEngine modes", () => {
  const samplingEngine: CardEngine<ToySettings, ToyCard> = {
    spec: toySpec,
    generate(engineSettings, random) {
      const attempts = 7;
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const candidate: ToyCard = { id: 100 + Math.floor(random() * 10), cells: [{ value: 1 }] };
        const result = VerifiedCard.check(toySpec, candidate, engineSettings);
        if (result.ok) return result.card;
      }
      throw new CardExhausted(toySpec.kind, attempts);
    },
  };

  const constructiveEngine: CardEngine<ToySettings, ToyCard> = {
    spec: toySpec,
    generate: (engineSettings) => VerifiedCard.require(toySpec, { id: 500, cells: [] }, engineSettings),
  };

  void test("C7 a sampling engine whose candidates are all rejected throws CardExhausted with the attempts, never null", () => {
    assert.throws(
      () => samplingEngine.generate(settings, () => 0.5, null),
      (error: unknown) => {
        assert.ok(error instanceof CardExhausted);
        assert.equal(error.name, "CardExhausted");
        assert.equal(error.kind, TOY);
        assert.equal(error.attempts, 7);
        assert.ok(!(error instanceof CardInvariantError));
        return true;
      },
    );
  });

  void test("C8 a constructive engine with an illegal winner throws CardInvariantError, not CardExhausted", () => {
    assert.throws(
      () => constructiveEngine.generate(settings, () => 0.5, null),
      (error: unknown) => {
        assert.ok(error instanceof CardInvariantError);
        assert.ok(!(error instanceof CardExhausted));
        return true;
      },
    );
  });
});

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

// Cost gate (D02 section 9, point 4): `require` copies and freezes the card, so measure that on the biggest cards today.
void describe("VerifiedCard.require cost on the biggest cards", () => {
  const BUDGET_MS = 20;
  const RUNS = 9;

  function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  function gate(name: string, card: unknown): void {
    void test(`${name}: median under ${BUDGET_MS} ms`, () => {
      const spec: CardSpec<null, unknown> = {
        kind: name as CardKindId,
        problems: () => [],
        keyOf: () => name,
        contentKey: () => name,
        knownBad: [],
      };
      const times: number[] = [];
      for (let run = 0; run < RUNS; run += 1) {
        const started = performance.now();
        VerifiedCard.require(spec, card, null);
        times.push(performance.now() - started);
      }
      const typical = median(times);
      assert.ok(MUTATION_RUN || typical < BUDGET_MS, `${name}: median ${typical.toFixed(2)} ms`);
    });
  }

  gate("maze level 6 (29x35)", generateMaze("nastolatek", mulberry32(1)));
  gate("nonogram hard (18x24)", generateNonogramCard(mulberry32(2), null, nonogramSizeById("trudny"), "wszystkie"));
  gate("sudoku 9x9 hard", generateSudokuCard(mulberry32(3), null, { size: 9, level: "trudny", symbols: "shapes" }));
  gate("dictation hard", generateDictationCard(mulberry32(4), null, dictationLevelById("lat7"), "wszystkie"));
});
