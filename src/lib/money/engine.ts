// "Kto ma więcej?" as a card kind (gh283, phase 5): `moneySpec` wraps today's `moneyCardProblems`, `moneyEngine` wraps
// today's sampling generator. Running out of attempts is `CardExhausted`; the engine never returns null.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { MoneySettings } from "../card-settings.ts";
import { generateMoneyCard, MAX_ATTEMPTS } from "./generate.ts";
import { moneyLevelById } from "./levels.ts";
import type { MoneyCard } from "./rules.ts";
import { moneyCardProblems } from "./rules.ts";

type Bad = CardSpec<MoneySettings, MoneyCard>["knownBad"][number];

function moneyProblems(card: MoneyCard, settings: MoneySettings): readonly CardProblem[] {
  return moneyCardProblems(card, moneyLevelById(settings.level, settings.currency)).map((code) => ({
    code,
    detail: `money card rule "${code}" is broken`,
  }));
}

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

function knownBad(): readonly Bad[] {
  const settings: MoneySettings = { level: "sredni", currency: "pln", colors: false };
  const base = generateMoneyCard(seeded(3), null, moneyLevelById(settings.level, settings.currency));
  if (base === null) {
    throw new Error("moneySpec.knownBad: no fixture card for seed 3");
  }
  const twoTies: MoneyCard = {
    ...base,
    rows: [
      { left: [5], right: [2, 2, 1], answer: "equal" },
      { left: [2, 1], right: [1, 1, 1], answer: "equal" },
      ...base.rows.slice(2),
    ],
  };
  const wrongAnswer: MoneyCard = {
    ...base,
    rows: [{ ...base.rows[0], answer: base.rows[0].answer === "left" ? "right" : "left" }, ...base.rows.slice(1)],
  };
  const repeated: MoneyCard = { ...base, rows: [base.rows[0], base.rows[0], ...base.rows.slice(2)] };
  const hardSettings: MoneySettings = { level: "trudny", currency: "pln", colors: false };
  const fiveNotes: MoneyCard = {
    ...base,
    levelId: "trudny",
    rows: [{ left: [10, 10, 10, 10, 10], right: [1], answer: "left" }, ...base.rows.slice(1)],
  };
  return [
    { name: "five notes in one pile", card: fiveNotes, settings: hardSettings, expectedCode: "note-count" },
    { name: "two tie rows on one card", card: twoTies, settings, expectedCode: "tie-rows" },
    { name: "a wrong answer in a row", card: wrongAnswer, settings, expectedCode: "answer" },
    { name: "the same row twice", card: repeated, settings, expectedCode: "duplicate-row" },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const moneySpec: CardSpec<MoneySettings, MoneyCard> = {
  kind: "pieniadze",
  problems: moneyProblems,
  keyOf: (card) => card.key,
  contentKey: (settings) => `${settings.currency}:${settings.level}`,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const moneyEngine: CardEngine<MoneySettings, MoneyCard> = {
  spec: moneySpec,
  generate(settings, random, previousKey) {
    const card = generateMoneyCard(random, previousKey, moneyLevelById(settings.level, settings.currency));
    if (card === null) {
      throw new CardExhausted(moneySpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(moneySpec, card, settings);
  },
};
