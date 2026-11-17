// "Krzyżówka matematyczna" as a card kind (S-40, phase 2): `mathCrosswordSpec` wraps `mathCrosswordProblems`,
// `mathCrosswordEngine` wraps the generator. The level is the card's content; "Pokaż rozwiązanie" is screen state and does
// not reach the spec. Running out of attempts is `CardExhausted`; the engine never returns null.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { MathCrosswordSettings } from "../card-settings.ts";
import { chainDepth, mathCrosswordKey, mathCrosswordProblems, type MathCrosswordCard } from "./card.ts";
import { generateMathCrosswordCard, MAX_ATTEMPTS } from "./generate.ts";
import { mathCrosswordLevelById } from "./levels.ts";

type Bad = CardSpec<MathCrosswordSettings, MathCrosswordCard>["knownBad"][number];

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

function fixture(settings: MathCrosswordSettings): MathCrosswordCard {
  const card = generateMathCrosswordCard(seeded(3), null, mathCrosswordLevelById(settings.level));
  if (card === null) {
    throw new Error(`mathCrosswordSpec.knownBad: no fixture card for ${settings.level}`);
  }
  return card;
}

function withValue(card: MathCrosswordCard, id: number, value: number): MathCrosswordCard {
  return { ...card, values: card.values.map((existing, i) => (i === id ? value : existing)) };
}

/**
 * The first two empty numbers where one is reached only through the other: a chain of 2, where level 1 allows 1. Such a
 * chain puts both in one equation, so the card breaks the one-empty-per-equation rule too; the test asks for the chain code.
 */
function twoRoundBlanks(card: MathCrosswordCard): number[] {
  const ids = card.values.map((_, id) => id);
  for (const first of ids) {
    for (const second of ids) {
      const blanks = [first, second];
      if (first < second && chainDepth({ ...card, blanks }, 10) === 2) return blanks;
    }
  }
  throw new Error("mathCrosswordSpec.knownBad: no two empty numbers that need two rounds");
}

function knownBad(): readonly Bad[] {
  const first: MathCrosswordSettings = { level: "poziom1" };
  const second: MathCrosswordSettings = { level: "poziom2" };
  const fifth: MathCrosswordSettings = { level: "poziom5" };
  const base1 = fixture(first);
  const base2 = fixture(second);
  const base5 = fixture(fifth);
  const result = base2.equations[0].c;
  // An equation whose result is one too many (blanked on neither side, so the chain does not matter).
  const falseEquation = withValue(base2, result, base2.values[result] + 1);
  // A number above the level's greatest.
  const outOfRange = withValue(base2, 0, 11);
  // A minus on a level that only adds.
  const wrongOp: MathCrosswordCard = {
    ...base1,
    equations: base1.equations.map((equation, i) => (i === 0 ? { ...equation, op: "−" } : equation)),
  };
  // A cell stuck to the side of an equation: its neighbour is not part of it.
  const stray: MathCrosswordCard = {
    ...base2,
    cells: [...base2.cells, { row: base2.cells[0].row - 1, col: base2.cells[0].col - 1, kind: "eq" }],
  };
  // Every number empty: the child would have to guess.
  const allEmpty: MathCrosswordCard = { ...base2, blanks: base2.values.map((_, i) => i) };
  const noBlanks: MathCrosswordCard = { ...base2, blanks: [] };
  const twoInOne: MathCrosswordCard = { ...base2, blanks: [base2.equations[0].a, base2.equations[0].b] };
  // Two empty numbers, one reached only through the other: a chain of 2 on the level that allows 1.
  const tooLong: MathCrosswordCard = { ...base1, blanks: twoRoundBlanks(base1) };
  const short: MathCrosswordCard = { ...base5, equations: base5.equations.slice(0, 3) };
  return [
    { name: "a false equation", card: falseEquation, settings: second, expectedCode: "false-equation" },
    {
      name: "a number above the level's greatest",
      card: outOfRange,
      settings: second,
      expectedCode: "number-out-of-range",
    },
    { name: "a minus on a level that only adds", card: wrongOp, settings: first, expectedCode: "op-not-allowed" },
    { name: "a stray cell beside an equation", card: stray, settings: second, expectedCode: "cells-touch" },
    { name: "every number empty", card: allEmpty, settings: second, expectedCode: "needs-guessing" },
    {
      name: "two empty numbers in one equation on level 2",
      card: twoInOne,
      settings: second,
      expectedCode: "too-many-blanks-in-equation",
    },
    { name: "a chain of two rounds on level 1", card: tooLong, settings: first, expectedCode: "chain-too-long" },
    { name: "a card with nothing to fill", card: noBlanks, settings: second, expectedCode: "no-blanks" },
    { name: "three equations on level 5", card: short, settings: fifth, expectedCode: "too-few-equations" },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const mathCrosswordSpec: CardSpec<MathCrosswordSettings, MathCrosswordCard> = {
  kind: "krzyzowka",
  problems: (card, settings): readonly CardProblem[] =>
    mathCrosswordProblems(card, mathCrosswordLevelById(settings.level)).map((code) => ({
      code,
      detail: `math-crossword card rule "${code}" is broken`,
    })),
  keyOf: mathCrosswordKey,
  // Only the level lays out the card.
  contentKey: (settings) => settings.level,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const mathCrosswordEngine: CardEngine<MathCrosswordSettings, MathCrosswordCard> = {
  spec: mathCrosswordSpec,
  generate(settings, random, previousKey) {
    const card = generateMathCrosswordCard(random, previousKey, mathCrosswordLevelById(settings.level));
    if (card === null) {
      throw new CardExhausted(mathCrosswordSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(mathCrosswordSpec, card, settings);
  },
};
