// "Zegar" as a card kind (S-41, phase 2): `clockSpec` wraps `clockProblems`, `clockEngine` wraps the generator. The
// level, the mode and "24 h" are all content: each changes the times or how many dials there are. Running out of attempts
// is `CardExhausted`; the engine never returns null.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { ClockSettings } from "../card-settings.ts";
import { clockKey, clockProblems, type ClockCard, type ClockTime } from "./card.ts";
import { generateClockCard, MAX_ATTEMPTS } from "./generate.ts";
import { clockLevelById, clockModeById } from "./levels.ts";

type Bad = CardSpec<ClockSettings, ClockCard>["knownBad"][number];

const at = (h: number, m: number): ClockTime => ({ h, m });

function card(settings: ClockSettings, times: ClockTime[], order: number[] = times.map((_, i) => i)): ClockCard {
  return { level: settings.level, mode: settings.mode, h24: settings.h24, times, order };
}

const halfPast: ClockSettings = { level: "poziom2", mode: "odczytaj", h24: false };
const sound = [at(1, 30), at(2, 30), at(3, 30), at(4, 0), at(5, 0), at(6, 0)];
const full: ClockSettings = { level: "poziom1", mode: "odczytaj", h24: false };
const fullHours = [at(1, 0), at(2, 0), at(3, 0), at(4, 0), at(5, 0), at(6, 0)];
const day: ClockSettings = { level: "poziom1", mode: "odczytaj", h24: true };
const dayHours = [at(6, 0), at(7, 0), at(8, 0), at(9, 0), at(10, 0), at(13, 0)];
const match: ClockSettings = { level: "poziom1", mode: "polacz", h24: false };
const matchHours = [at(1, 0), at(2, 0), at(3, 0), at(4, 0), at(5, 0)];
const matchOrder = [1, 2, 3, 4, 0];

/**
 * The sound cards the known bad ones are built from. The spec test checks that each has no problem, so a known bad
 * card fails for the rule it breaks and not because its base was already broken.
 */
export function knownBadBases(): readonly { name: string; card: ClockCard; settings: ClockSettings }[] {
  return [
    { name: "half past on level 2", card: card(halfPast, sound), settings: halfPast },
    { name: "full hours on level 1", card: card(full, fullHours), settings: full },
    { name: "day hours with 24 h", card: card(day, dayHours), settings: day },
    { name: "Połącz on level 1", card: card(match, matchHours, matchOrder), settings: match },
  ];
}

/** Hand-made cards, each breaking one rule of a sound base from `knownBadBases`. */
function knownBad(): readonly Bad[] {
  return [
    {
      name: "five dials in Odczytaj",
      card: card(halfPast, sound.slice(0, 5)),
      settings: halfPast,
      expectedCode: "wrong-dial-count",
    },
    {
      name: "half past on level 1",
      card: card(full, [at(1, 30), ...fullHours.slice(1)]),
      settings: full,
      expectedCode: "minute-not-in-level",
    },
    {
      name: "only full hours on level 2",
      card: card(halfPast, fullHours),
      settings: halfPast,
      expectedCode: "too-few-fresh-minutes",
    },
    {
      name: "7:30 twice",
      card: card(halfPast, [at(7, 30), at(2, 30), at(3, 30), at(4, 0), at(5, 0), at(7, 30)]),
      settings: halfPast,
      expectedCode: "repeated-time",
    },
    {
      name: "13:00 without 24 h",
      card: card(full, [at(13, 0), ...fullHours.slice(1)]),
      settings: full,
      expectedCode: "hour-out-of-range",
    },
    {
      name: "noon with 24 h",
      card: card(day, [at(12, 0), ...dayHours.slice(1)]),
      settings: day,
      expectedCode: "border-hour",
    },
    {
      name: "past midnight with 24 h",
      card: card(day, [at(0, 0), ...dayHours.slice(1)]),
      settings: day,
      expectedCode: "border-hour",
    },
    {
      name: "one digital clock twice in Połącz",
      card: card(match, matchHours, [1, 2, 3, 4, 1]),
      settings: match,
      expectedCode: "order-not-permutation",
    },
    {
      name: "a digital clock level with its own dial in Połącz",
      card: card(match, matchHours, [0, 2, 3, 4, 1]),
      settings: match,
      expectedCode: "digital-beside-own-dial",
    },
    {
      name: "a Połącz card shown for Odczytaj",
      card: card(match, matchHours, matchOrder),
      settings: full,
      expectedCode: "settings-mismatch",
    },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const clockSpec: CardSpec<ClockSettings, ClockCard> = {
  kind: "zegar",
  problems: (candidate, settings): readonly CardProblem[] =>
    clockProblems(candidate, settings).map((code) => ({
      code,
      detail: `clock card rule "${code}" is broken`,
    })),
  keyOf: clockKey,
  // The level, the mode and "24 h" all lay out the card.
  contentKey: (settings) => `${settings.level}|${settings.mode}|${String(settings.h24)}`,
  // Built on first use, like the other kinds.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const clockEngine: CardEngine<ClockSettings, ClockCard> = {
  spec: clockSpec,
  generate(settings, random, previousKey) {
    const generated = generateClockCard(
      random,
      previousKey,
      clockLevelById(settings.level),
      clockModeById(settings.mode),
      settings.h24,
    );
    if (generated === null) {
      throw new CardExhausted(clockSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(clockSpec, generated, settings);
  },
};
