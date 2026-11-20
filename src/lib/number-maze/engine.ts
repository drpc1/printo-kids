// "Labirynt liczbowy" as a card kind: `numberMazeSpec` wraps `numberMazeCardProblems`, `numberMazeEngine` wraps the
// generator. Running out of attempts is `CardExhausted`; the engine never returns null.
import {
  CardExhausted,
  VerifiedCard,
  type CardEngine,
  type CardKindId,
  type CardProblem,
  type CardSpec,
} from "../card-contract.ts";
import type { NumberMazeSettings } from "../card-settings.ts";
import { neighbours, numberMazeCardKey, numberMazeCardProblems, type NumberMazeCard } from "./card.ts";
import { generateNumberMazeCard, MAX_ATTEMPTS } from "./generate.ts";
import { numberMazeLevelById } from "./levels.ts";

type Bad = CardSpec<NumberMazeSettings, NumberMazeCard>["knownBad"][number];

// The kind joins `CARD_KINDS` in phase 2 (page and catalog); until then the id is cast, as size-order did in its phase 1.
const KIND = "liczby" as unknown as CardKindId;

function numberMazeProblems(card: NumberMazeCard, settings: NumberMazeSettings): readonly CardProblem[] {
  return numberMazeCardProblems(card, numberMazeLevelById(settings.level)).map((code) => ({
    code,
    detail: `number-maze card rule "${code}" is broken`,
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
  const settings: NumberMazeSettings = { level: "poziom1" };
  const level = numberMazeLevelById(settings.level);
  const base = generateNumberMazeCard(seeded(3), level);
  if (base === null) {
    throw new Error("numberMazeSpec.knownBad: no fixture card for seed 3");
  }
  // A trap next to a path cell takes that cell's next number: two ways on from there.
  const onPath = new Set(base.path);
  const fork = base.path
    .slice(0, -1)
    .map((cell, index) => ({ index, trap: neighbours(cell, level.cols, level.rows).find((next) => !onPath.has(next)) }))
    .find((candidate) => candidate.trap !== undefined);
  if (fork?.trap === undefined) {
    throw new Error("numberMazeSpec.knownBad: the fixture path has no trap beside it");
  }
  const { trap } = fork;
  const nextNumber = level.first + (fork.index + 1) * level.step;
  const forked = [...base.values];
  forked[trap] = nextNumber;
  const revisit = [...base.path];
  revisit[2] = revisit[0];
  const endpointTrap = [...base.values];
  endpointTrap[trap] = level.first;
  return [
    {
      name: "a trap with the next number beside the path",
      card: { ...base, values: forked },
      settings,
      expectedCode: "ambiguous-next",
    },
    {
      name: "a path that comes back to a cell",
      card: { ...base, path: revisit },
      settings,
      expectedCode: "path-revisits",
    },
    {
      name: "a trap that repeats the start number",
      card: { ...base, values: endpointTrap },
      settings,
      expectedCode: "trap-repeats-endpoint",
    },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const numberMazeSpec: CardSpec<NumberMazeSettings, NumberMazeCard> = {
  kind: KIND,
  problems: numberMazeProblems,
  keyOf: numberMazeCardKey,
  // The level is the only setting: it lays out a new card.
  contentKey: (settings) => settings.level,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const numberMazeEngine: CardEngine<NumberMazeSettings, NumberMazeCard> = {
  spec: numberMazeSpec,
  generate(settings, random, previousKey) {
    const card = generateNumberMazeCard(random, numberMazeLevelById(settings.level), previousKey);
    if (card === null) {
      throw new CardExhausted(numberMazeSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(numberMazeSpec, card, settings);
  },
};
