// Symmetry as a card kind (gh283, phase 6): `symmetrySpec` wraps today's `symmetryCardProblems`, `symmetryEngine` wraps
// today's sampling generator. Level and category are the card's content; colors only repaint the same card.
// Running out of attempts, or a category without objects, is `CardExhausted`; the engine never returns null.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { SymmetrySettings } from "../card-settings.ts";
import {
  generateSymmetryCard,
  MAX_ATTEMPTS,
  mirrorAnswer,
  symmetryCardProblems,
  type SymmetryCard,
} from "./generate.ts";
import { symmetryLevelById } from "./levels.ts";
import { symmetryTemplatesFor } from "./templates.ts";

type Bad = CardSpec<SymmetrySettings, SymmetryCard>["knownBad"][number];

function symmetryProblems(card: SymmetryCard): readonly CardProblem[] {
  return symmetryCardProblems(card).map((code) => ({
    code,
    detail: `symmetry card rule "${code}" is broken`,
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
  const settings: SymmetrySettings = { level: "lat4", colors: false, category: "wszystkie" };
  const base = generateSymmetryCard(seeded(3), null, symmetryLevelById(settings.level), settings.category);
  if (base === null) {
    throw new Error("symmetrySpec.knownBad: no fixture card for seed 3");
  }
  const answer = mirrorAnswer(base);
  const wrongHint = {
    ...base.hints[0],
    color: base.hints[0].color === "red" ? "blue" : "red",
  } as SymmetryCard["hints"][number];
  return [
    { name: "no filled cell", card: { ...structuredClone(base), cells: [] }, settings, expectedCode: "no-filled-cell" },
    {
      name: "hints reveal the whole answer",
      card: { ...structuredClone(base), hints: [...answer] },
      settings,
      expectedCode: "hints-reveal-all",
    },
    {
      name: "a hint outside the answer",
      card: { ...structuredClone(base), hints: [wrongHint, ...base.hints.slice(1)] },
      settings,
      expectedCode: "hint-not-in-answer",
    },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const symmetrySpec: CardSpec<SymmetrySettings, SymmetryCard> = {
  kind: "symetria",
  problems: (card) => symmetryProblems(card),
  keyOf: (card) => card.key,
  // Colors are a decoration: the same card is drawn in color or in black (PRD US-09).
  contentKey: (settings) => `${settings.level}:${settings.category}`,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const symmetryEngine: CardEngine<SymmetrySettings, SymmetryCard> = {
  spec: symmetrySpec,
  generate(settings, random, previousKey) {
    const level = symmetryLevelById(settings.level);
    if (symmetryTemplatesFor(level.id, settings.category).length === 0) {
      throw new CardExhausted(symmetrySpec.kind, 0);
    }
    const card = generateSymmetryCard(random, previousKey, level, settings.category);
    if (card === null) {
      throw new CardExhausted(symmetrySpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(symmetrySpec, card, settings);
  },
};
