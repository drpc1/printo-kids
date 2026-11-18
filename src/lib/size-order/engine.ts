// "Od najmniejszego" as a card kind: `sizeOrderSpec` wraps `sizeOrderCardProblems`, `sizeOrderEngine` wraps the
// generator. Running out of attempts is `CardExhausted`; the engine never returns null.
import {
  CardExhausted,
  VerifiedCard,
  type CardEngine,
  type CardKindId,
  type CardProblem,
  type CardSpec,
} from "../card-contract.ts";
import type { SizeOrderSettings } from "../card-settings.ts";
import { sizeOrderCardKey, sizeOrderCardProblems, type SizeOrderCard } from "./card.ts";
import { generateSizeOrderCard, MAX_ATTEMPTS } from "./generate.ts";
import { sizeOrderLevelById } from "./levels.ts";

type Bad = CardSpec<SizeOrderSettings, SizeOrderCard>["knownBad"][number];

// Phase 2 adds this id to CARD_KINDS (src/lib/cards.ts); until then the union does not hold it.
const KIND = "odnajmniejszego" as unknown as CardKindId;

function sizeOrderProblems(card: SizeOrderCard, settings: SizeOrderSettings): readonly CardProblem[] {
  return sizeOrderCardProblems(card, sizeOrderLevelById(settings.level)).map((code) => ({
    code,
    detail: `size-order card rule "${code}" is broken`,
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
  const settings: SizeOrderSettings = { level: "sredni", colors: false };
  const level = sizeOrderLevelById(settings.level);
  const base = generateSizeOrderCard(seeded(3), level);
  if (base === null) {
    throw new Error("sizeOrderSpec.knownBad: no fixture card for seed 3");
  }
  const [first, ...rest] = base.rows;
  const withFirst = (row: typeof first): SizeOrderCard => ({ ...base, rows: [row, ...rest] });
  return [
    {
      name: "a row already in order",
      card: withFirst({ ...first, heights: [...level.heights] }),
      settings,
      expectedCode: "row-already-ordered",
    },
    {
      name: "the same picture twice",
      card: { ...base, rows: [first, { ...rest[0], picture: first.picture }, ...rest.slice(1)] },
      settings,
      expectedCode: "duplicate-picture",
    },
    {
      name: "two sizes too close",
      card: withFirst({ ...first, heights: [0.5, 0.55, 0.79, 1] }),
      settings,
      expectedCode: "step-too-small",
    },
    {
      name: "a row with one picture too few",
      card: withFirst({ ...first, heights: first.heights.slice(1) }),
      settings,
      expectedCode: "wrong-item-count",
    },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const sizeOrderSpec: CardSpec<SizeOrderSettings, SizeOrderCard> = {
  kind: KIND,
  problems: sizeOrderProblems,
  keyOf: sizeOrderCardKey,
  // Only the level lays out a new card: colors are decoration (one crayon per row), so they stay out of the key.
  contentKey: (settings) => settings.level,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const sizeOrderEngine: CardEngine<SizeOrderSettings, SizeOrderCard> = {
  spec: sizeOrderSpec,
  generate(settings, random, previousKey) {
    const card = generateSizeOrderCard(random, sizeOrderLevelById(settings.level), previousKey);
    if (card === null) {
      throw new CardExhausted(sizeOrderSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(sizeOrderSpec, card, settings);
  },
};
