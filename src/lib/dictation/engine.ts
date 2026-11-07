// Graphic dictation as a card kind (gh283, phase 10): `dictationSpec` wraps `dictationCardProblems`, `dictationEngine`
// draws from the level's catalog of distinct outlines. Level and category are the card's content.
// The start vertex is deliberately not checked (R-9, option B): any vertex of the outline may be the start, the guard
// only needs the walk to be closed and equal to the outline. `maxCommands` stays a filter of the catalog.
// No other outline in the catalog is `CardExhausted` with the catalog size as `attempts`; the engine never returns null.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { DictationSettings } from "../card-settings.ts";
import { dictationCardProblems, dictationVariantCount, generateDictationCard, type DictationCard } from "./generate.ts";
import { dictationLevelById } from "./levels.ts";

type Bad = CardSpec<DictationSettings, DictationCard>["knownBad"][number];

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
  const settings: DictationSettings = { level: "lat6", category: "wszystkie" };
  const base = generateDictationCard(seeded(3), null, dictationLevelById(settings.level), settings.category);
  if (base === null) {
    throw new Error("dictationSpec.knownBad: no fixture card for seed 3");
  }
  const open = structuredClone(base);
  open.commands = open.commands.slice(0, -1);
  const shifted = structuredClone(base);
  shifted.start = { col: shifted.start.col + 1, row: shifted.start.row };
  return [
    { name: "commands that do not return to the start", card: open, settings, expectedCode: "not-closed" },
    {
      name: "a start that moves the whole walk off the outline",
      card: shifted,
      settings,
      expectedCode: "not-the-outline",
    },
    {
      name: "a lat6 card shown for a lat7 bar",
      card: structuredClone(base),
      settings: { ...settings, level: "lat7" },
      expectedCode: "settings-mismatch",
    },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const dictationSpec: CardSpec<DictationSettings, DictationCard> = {
  kind: "dyktando",
  problems: (card, settings): readonly CardProblem[] => {
    const problems: CardProblem[] = dictationCardProblems(card).map((code) => ({
      code,
      detail: `dictation card rule "${code}" is broken`,
    }));
    if (card.levelId !== settings.level) {
      problems.push({ code: "settings-mismatch", detail: "the card does not match the level on the bar" });
    }
    return problems;
  },
  keyOf: (card) => card.key,
  // The category is not on the card, so the spec cannot check it; it only lays out the card.
  contentKey: (settings) => `${settings.level}|${settings.category}`,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const dictationEngine: CardEngine<DictationSettings, DictationCard> = {
  spec: dictationSpec,
  generate(settings, random, previousKey) {
    const level = dictationLevelById(settings.level);
    const card = generateDictationCard(random, previousKey, level, settings.category);
    if (card === null) {
      throw new CardExhausted(dictationSpec.kind, dictationVariantCount(level, settings.category).distinctOutlines);
    }
    return VerifiedCard.require(dictationSpec, card, settings);
  },
};
