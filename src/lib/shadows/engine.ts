// "Cienie" as a card kind: `shadowsSpec` wraps `shadowsCardProblems`, `shadowsEngine` wraps the generator. Running
// out of attempts is `CardExhausted`; the engine never returns null.
import {
  CardExhausted,
  VerifiedCard,
  type CardEngine,
  type CardKindId,
  type CardProblem,
  type CardSpec,
} from "../card-contract.ts";
import type { ShadowsSettings } from "../card-settings.ts";
import { shadowsCardKey, shadowsCardProblems, type ShadowsCard } from "./card.ts";
import { generateShadowsCard, MAX_ATTEMPTS } from "./generate.ts";
import { shadowsLevelById } from "./levels.ts";

// Phase 3 adds this id to CARD_KINDS (src/lib/cards.ts); until then the union does not hold it.
const KIND = "cienie" as unknown as CardKindId;

type Bad = CardSpec<ShadowsSettings, ShadowsCard>["knownBad"][number];

function shadowsProblems(card: ShadowsCard, settings: ShadowsSettings): readonly CardProblem[] {
  return shadowsCardProblems(card, shadowsLevelById(settings.level)).map((code) => ({
    code,
    detail: `shadows card rule "${code}" is broken`,
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
  const settings: ShadowsSettings = { level: "sredni" };
  const base = generateShadowsCard(seeded(3), shadowsLevelById(settings.level));
  if (base === null) {
    throw new Error("shadowsSpec.knownBad: no fixture card for seed 3");
  }
  const identity = base.pictures.map((_, index) => index);
  return [
    {
      name: "every shadow in its own row",
      card: { ...base, shadowOrder: identity },
      settings,
      expectedCode: "shadow-in-own-row",
    },
    {
      name: "a picture from another family",
      card: {
        ...base,
        pictures: [...base.pictures.slice(0, -1), base.pictures.includes("kubek") ? "jablko" : "kubek"],
      },
      settings,
      expectedCode: "families-not-level",
    },
    {
      name: "the same picture twice",
      card: { ...base, pictures: [base.pictures[0], ...base.pictures.slice(0, -1)] },
      settings,
      expectedCode: "duplicate-picture",
    },
    {
      name: "one pair too few",
      card: { ...base, pictures: base.pictures.slice(1), shadowOrder: [1, 2, 3, 0] },
      settings,
      expectedCode: "wrong-pair-count",
    },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const shadowsSpec: CardSpec<ShadowsSettings, ShadowsCard> = {
  kind: KIND,
  problems: shadowsProblems,
  keyOf: shadowsCardKey,
  // The level is the only setting; the character is decoration.
  contentKey: (settings) => settings.level,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const shadowsEngine: CardEngine<ShadowsSettings, ShadowsCard> = {
  spec: shadowsSpec,
  generate(settings, random, previousKey) {
    const card = generateShadowsCard(random, shadowsLevelById(settings.level), previousKey);
    if (card === null) {
      throw new CardExhausted(shadowsSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(shadowsSpec, card, settings);
  },
};
