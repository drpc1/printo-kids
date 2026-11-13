// Sequences as a card kind (gh283, phase 7): `sequenceSpec` wraps `sequenceCardProblems`, `sequenceEngine` wraps the
// sampling generator. Level is the card's content; colors only repaint the same card. Running out of attempts is
// `CardExhausted`; the engine never returns null.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { SequenceSettings } from "../card-settings.ts";
import { generateSequenceCard, MAX_ATTEMPTS, sequenceCardProblems, type SequenceCard } from "./generate.ts";
import { sequenceLevelById } from "./levels.ts";

type Bad = CardSpec<SequenceSettings, SequenceCard>["knownBad"][number];

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
  const settings: SequenceSettings = { level: "lat5", colors: false };
  const base = generateSequenceCard(seeded(3), null, sequenceLevelById(settings.level));
  if (base === null) {
    throw new Error("sequenceSpec.knownBad: no fixture card for seed 3");
  }
  const duplicated = structuredClone(base);
  duplicated.rows = [duplicated.rows[0], duplicated.rows[0], ...duplicated.rows.slice(2)];
  const unknown = structuredClone(base);
  unknown.rows = [
    { ...unknown.rows[0], values: ["?" as never, ...unknown.rows[0].values.slice(1)] },
    ...unknown.rows.slice(1),
  ];
  const noGaps = structuredClone(base);
  noGaps.rows = [{ ...noGaps.rows[0], gaps: [] }, ...noGaps.rows.slice(1)];
  return [
    { name: "the same row twice", card: duplicated, settings, expectedCode: "duplicate-row" },
    { name: "an item that is no shape or number", card: unknown, settings, expectedCode: "unknown-item" },
    { name: "a row without gaps", card: noGaps, settings, expectedCode: "gap-count" },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const sequenceSpec: CardSpec<SequenceSettings, SequenceCard> = {
  kind: "sekwencje",
  // Checked on the card that reaches the UI, shapeColors included.
  problems: (card, settings): readonly CardProblem[] =>
    sequenceCardProblems(card, sequenceLevelById(settings.level)).map((code) => ({
      code,
      detail: `sequence card rule "${code}" is broken`,
    })),
  keyOf: (card) => card.key,
  // Colors are a decoration: the same card is drawn in color or in black.
  contentKey: (settings) => settings.level,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const sequenceEngine: CardEngine<SequenceSettings, SequenceCard> = {
  spec: sequenceSpec,
  generate(settings, random, previousKey) {
    const card = generateSequenceCard(random, previousKey, sequenceLevelById(settings.level));
    if (card === null) {
      throw new CardExhausted(sequenceSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(sequenceSpec, card, settings);
  },
};
