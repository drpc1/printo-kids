// Nonogram as a card kind (gh283, phase 9): `nonogramSpec` wraps the two guards of the two card shapes (chips for the
// easy level, clues for the others); `nonogramEngine` wraps the generator. Level and category are the card's content.
// "Pokaż rozwiązanie" is not a setting at all, so it never reaches the spec. Running out of attempts is `CardExhausted`;
// the engine never returns null.
// `require` runs the line solver a second time on the classic card; the hard-level timing test in `engine.test.ts`
// keeps that cost inside the budget.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { NonogramSettings } from "../card-settings.ts";
import { generateNonogramCard, MAX_ATTEMPTS, nonogramCardProblems, type NonogramCard } from "./generate.ts";
import { nonogramSizeById } from "./sizes.ts";
import { simpleNonogramProblems, type SimpleNonogramCard } from "./simple.ts";

export type AnyNonogramCard = NonogramCard | SimpleNonogramCard;

type Bad = CardSpec<NonogramSettings, AnyNonogramCard>["knownBad"][number];

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

function fixture(settings: NonogramSettings): AnyNonogramCard {
  const card = generateNonogramCard(seeded(3), null, nonogramSizeById(settings.level), settings.category);
  if (card === null) {
    throw new Error(`nonogramSpec.knownBad: no fixture card for ${settings.level}`);
  }
  return card;
}

function knownBad(): readonly Bad[] {
  const classic: NonogramSettings = { level: "sredni", category: "wszystkie" };
  const easy: NonogramSettings = { level: "latwy", category: "wszystkie" };
  const base = fixture(classic);
  const baseEasy = fixture(easy);
  if (base.kind !== "liczby" || baseEasy.kind !== "znaczki") {
    throw new Error("nonogramSpec.knownBad: wrong card shapes");
  }
  const flipped = structuredClone(base);
  flipped.solution[0][0] = !flipped.solution[0][0];
  const blank = structuredClone(base);
  blank.solution = blank.solution.map((row) => row.map(() => false));
  // A row one cell short whose chips agree with its tones: only the grid width tells it is not described in full.
  const shortRow = structuredClone(baseEasy);
  shortRow.tones[0] = shortRow.tones[0].slice(0, -1);
  const last = shortRow.runs[0][shortRow.runs[0].length - 1];
  last.count -= 1;
  if (last.count === 0) {
    shortRow.runs[0].pop();
  }
  // One chip split in two of the same tone: the rows rebuild, but the chips are not the maximal runs.
  const splitChips = structuredClone(baseEasy);
  const target = splitChips.runs.find((row) => row.some((run) => run.count >= 2));
  if (target === undefined) {
    throw new Error("nonogramSpec.knownBad: no chip to split");
  }
  const at = target.findIndex((run) => run.count >= 2);
  target.splice(at, 1, { tone: target[at].tone, count: 1 }, { tone: target[at].tone, count: target[at].count - 1 });
  return [
    {
      name: "a flipped cell: clues no longer match the picture",
      card: flipped,
      settings: classic,
      expectedCode: "clue-mismatch",
    },
    { name: "a picture without filled cells", card: blank, settings: classic, expectedCode: "no-filled-cell" },
    { name: "easy: a row shorter than the grid", card: shortRow, settings: easy, expectedCode: "runs-mismatch" },
    { name: "easy: two chips of one tone in a row", card: splitChips, settings: easy, expectedCode: "runs-mismatch" },
    {
      name: "a classic card shown for the hard bar",
      card: structuredClone(base),
      settings: { ...classic, level: "trudny" },
      expectedCode: "settings-mismatch",
    },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const nonogramSpec: CardSpec<NonogramSettings, AnyNonogramCard> = {
  kind: "nonogram",
  problems: (card, settings): readonly CardProblem[] => {
    const codes: readonly string[] =
      card.kind === "znaczki" ? simpleNonogramProblems(card) : nonogramCardProblems(card);
    const problems: CardProblem[] = codes.map((code) => ({
      code,
      detail: `nonogram card rule "${code}" is broken`,
    }));
    if (card.sizeId !== settings.level) {
      problems.push({ code: "settings-mismatch", detail: "the card does not match the level on the bar" });
    }
    return problems;
  },
  keyOf: (card) => card.key,
  // The level and the category lay out the card. The category is not on the card, so the spec cannot check it.
  contentKey: (settings) => `${settings.level}|${settings.category}`,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const nonogramEngine: CardEngine<NonogramSettings, AnyNonogramCard> = {
  spec: nonogramSpec,
  generate(settings, random, previousKey) {
    const card = generateNonogramCard(random, previousKey, nonogramSizeById(settings.level), settings.category);
    if (card === null) {
      throw new CardExhausted(nonogramSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(nonogramSpec, card, settings);
  },
};
