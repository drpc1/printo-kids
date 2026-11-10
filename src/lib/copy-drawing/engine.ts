// "Skopiuj rysunek na kratce" as a card kind (S-35, phase 2): `copyDrawingSpec` wraps `copyDrawingProblems`,
// `copyDrawingEngine` wraps the generator. Level and category are the card's content. The card has no "Pokaż rozwiązanie"
// and no colors, so neither reaches the spec. Running out of attempts is `CardExhausted`; the engine never returns null.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { CopyDrawingSettings } from "../card-settings.ts";
import { copyDrawingProblems, type CopyDrawingCard } from "./card.ts";
import { generateCopyDrawingCard, MAX_ATTEMPTS } from "./generate.ts";
import { copyDrawingLevelById } from "./levels.ts";

type Bad = CardSpec<CopyDrawingSettings, CopyDrawingCard>["knownBad"][number];

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

function fixture(settings: CopyDrawingSettings): CopyDrawingCard {
  const card = generateCopyDrawingCard(seeded(3), null, copyDrawingLevelById(settings.level), settings.category);
  if (card === null) {
    throw new Error(`copyDrawingSpec.knownBad: no fixture card for ${settings.level}`);
  }
  return card;
}

/** The pattern turned half a circle; when it is its own half-turn, one filled cell is cleared so it still differs. */
function turned(pattern: CopyDrawingCard["pattern"]): boolean[][] {
  const half = [...pattern].reverse().map((row) => [...row].reverse());
  if (JSON.stringify(half) !== JSON.stringify(pattern)) {
    return half;
  }
  const copy = pattern.map((row) => [...row]);
  const row = copy.findIndex((cells) => cells.some(Boolean));
  copy[row][copy[row].findIndex(Boolean)] = false;
  return copy;
}

function knownBad(): readonly Bad[] {
  const middle: CopyDrawingSettings = { level: "sredni", category: "wszystkie", colors: false };
  const hard: CopyDrawingSettings = { level: "trudny", category: "wszystkie", colors: false };
  const base = fixture(middle);
  const blank: CopyDrawingCard = { ...base, pattern: base.pattern.map((row) => row.map(() => false)) };
  const wrongGrid: CopyDrawingCard = { ...base, pattern: base.pattern.slice(1) };
  return [
    {
      name: "a grid turned half a circle: not the silhouette of the object",
      card: { ...base, pattern: turned(base.pattern) },
      settings: middle,
      expectedCode: "not-silhouette",
    },
    { name: "a pattern without filled cells", card: blank, settings: middle, expectedCode: "no-filled-cell" },
    { name: "a grid with a row missing", card: wrongGrid, settings: middle, expectedCode: "grid-size" },
    { name: "a card shown for another level", card: base, settings: hard, expectedCode: "level-mismatch" },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const copyDrawingSpec: CardSpec<CopyDrawingSettings, CopyDrawingCard> = {
  kind: "kopiuj",
  problems: (card, settings): readonly CardProblem[] =>
    copyDrawingProblems(card, copyDrawingLevelById(settings.level)).map((code) => ({
      code,
      detail: `copy-drawing card rule "${code}" is broken`,
    })),
  keyOf: (card) => card.key,
  // The level and the category lay out the card. The category is not on the card, so the spec cannot check it.
  contentKey: (settings) => `${settings.level}|${settings.category}`,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const copyDrawingEngine: CardEngine<CopyDrawingSettings, CopyDrawingCard> = {
  spec: copyDrawingSpec,
  generate(settings, random, previousKey) {
    const card = generateCopyDrawingCard(random, previousKey, copyDrawingLevelById(settings.level), settings.category);
    if (card === null) {
      throw new CardExhausted(copyDrawingSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(copyDrawingSpec, card, settings);
  },
};
