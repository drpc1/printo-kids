// "Który nie pasuje" as a card kind: `oddOneOutSpec` wraps `oddOneOutCardProblems`, `oddOneOutEngine` wraps the sampling
// generator. Running out of attempts is `CardExhausted`; the engine never returns null.
import {
  CardExhausted,
  VerifiedCard,
  type CardEngine,
  type CardKindId,
  type CardProblem,
  type CardSpec,
} from "../card-contract.ts";
import type { OddOneOutSettings } from "../card-settings.ts";
import { generateOddOneOutCard, MAX_ATTEMPTS } from "./generate.ts";
import { oddOneOutLevelById } from "./levels.ts";
import type { OddOneOutCard, OddRow } from "./rules.ts";
import { oddOneOutCardProblems } from "./rules.ts";

type Bad = CardSpec<OddOneOutSettings, OddOneOutCard>["knownBad"][number];

function oddOneOutProblems(card: OddOneOutCard, settings: OddOneOutSettings): readonly CardProblem[] {
  return oddOneOutCardProblems(card, oddOneOutLevelById(settings.level), settings.colors).map((code) => ({
    code,
    detail: `odd-one-out card rule "${code}" is broken`,
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
  const colored: OddOneOutSettings = { level: "sredni", colors: true };
  const plain: OddOneOutSettings = { level: "sredni", colors: false };
  const withColors = generateOddOneOutCard(seeded(3), null, oddOneOutLevelById(colored.level), true);
  const withoutColors = generateOddOneOutCard(seeded(3), null, oddOneOutLevelById(plain.level), false);
  if (withColors === null || withoutColors === null) {
    throw new Error("oddOneOutSpec.knownBad: no fixture card for seed 3");
  }

  // A shape row whose size also points at one picture: the answer is the odd shape, but a lone small picture is a second answer.
  const ambiguousRow: OddRow = {
    rule: "shape",
    items: [
      { shape: "circle", icon: null, size: "big", count: 1, crayon: "red" },
      { shape: "circle", icon: null, size: "small", count: 1, crayon: "red" },
      { shape: "circle", icon: null, size: "big", count: 1, crayon: "red" },
      { shape: "heart", icon: null, size: "big", count: 1, crayon: "red" },
      { shape: "circle", icon: null, size: "big", count: 1, crayon: "red" },
    ],
    answer: 3,
  };
  const ambiguous: OddOneOutCard = { ...withColors, rows: [ambiguousRow, ...withColors.rows.slice(1)] };
  const crayonWithoutColors: OddOneOutCard = {
    ...withoutColors,
    rows: [
      {
        ...withoutColors.rows[0],
        items: withoutColors.rows[0].items.map((item, index) => (index === 0 ? { ...item, crayon: "red" } : item)),
      },
      ...withoutColors.rows.slice(1),
    ],
  };
  const repeated: OddOneOutCard = {
    ...withColors,
    rows: [withColors.rows[0], withColors.rows[0], ...withColors.rows.slice(2)],
  };
  return [
    {
      name: "a size that also points at one picture",
      card: ambiguous,
      settings: colored,
      expectedCode: "ambiguous-row",
    },
    {
      name: "a crayon with colors off",
      card: crayonWithoutColors,
      settings: plain,
      expectedCode: "crayon-without-colors",
    },
    { name: "the same row twice", card: repeated, settings: colored, expectedCode: "duplicate-row" },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const oddOneOutSpec: CardSpec<OddOneOutSettings, OddOneOutCard> = {
  // Phase 3 adds "niepasuje" to CARD_KINDS and drops this cast.
  kind: "niepasuje" as CardKindId,
  problems: oddOneOutProblems,
  keyOf: (card) => card.key,
  // Colors are part of the task here (the color rule), so they enter the key with the level.
  contentKey: (settings) => `${settings.level}|${String(settings.colors)}`,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const oddOneOutEngine: CardEngine<OddOneOutSettings, OddOneOutCard> = {
  spec: oddOneOutSpec,
  generate(settings, random, previousKey) {
    const card = generateOddOneOutCard(random, previousKey, oddOneOutLevelById(settings.level), settings.colors);
    if (card === null) {
      throw new CardExhausted(oddOneOutSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(oddOneOutSpec, card, settings);
  },
};
