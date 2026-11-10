// "Szlaczki" as a card kind (S-36, phase 2): `patternLinesSpec` wraps `patternLinesProblems`, `patternLinesEngine` wraps the
// generator. The level is the card's content; "Linie" only draws help lines, so it does not reach the spec. Running out of
// attempts is `CardExhausted`; the engine never returns null.
import {
  CardExhausted,
  VerifiedCard,
  type CardEngine,
  type CardKindId,
  type CardProblem,
  type CardSpec,
} from "../card-contract.ts";
import type { PatternLinesSettings } from "../card-settings.ts";
import { patternLinesProblems, type PatternLinesCard, type PatternRow } from "./card.ts";
import { generatePatternLinesCard, MAX_ATTEMPTS } from "./generate.ts";
import { patternLinesLevelById } from "./levels.ts";

type Bad = CardSpec<PatternLinesSettings, PatternLinesCard>["knownBad"][number];

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

function fixture(settings: PatternLinesSettings): PatternLinesCard {
  const card = generatePatternLinesCard(seeded(3), null, patternLinesLevelById(settings.level));
  if (card === null) {
    throw new Error(`patternLinesSpec.knownBad: no fixture card for ${settings.level}`);
  }
  return card;
}

function withRow(card: PatternLinesCard, index: number, row: PatternRow): PatternLinesCard {
  return { ...card, rows: card.rows.map((existing, i) => (i === index ? row : existing)) };
}

function knownBad(): readonly Bad[] {
  const second: PatternLinesSettings = { level: "poziom2", lines: true };
  const third: PatternLinesSettings = { level: "poziom3", lines: true };
  const fourth: PatternLinesSettings = { level: "poziom4", lines: true };
  const base2 = fixture(second);
  const base3 = fixture(third);
  const base4 = fixture(fourth);
  const first2 = base2.rows[0];
  // Loops cross themselves; dotted all the way (level 2) the child cannot tell which way to go.
  const crossing = withRow(base2, 0, { ...first2, patternId: "loops" });
  const repeated = withRow(base2, 1, { ...first2 });
  // 80 steps in one row: the corners are about a millimetre apart and the dots run together.
  const dense = withRow(base2, 0, { patternId: "zigzag", period: 2.3, height: 10, count: 80 });
  const threeDotted = withRow(base3, 0, { ...base3.rows[0], traced: 3 });
  const twoDrawn = withRow(base4, 0, { ...base4.rows[0], traced: 2 });
  const tooTall = withRow(base3, 0, { ...base3.rows[0], height: 40 });
  return [
    { name: "a looping pattern dotted all the way", card: crossing, settings: second, expectedCode: "crossing" },
    { name: "the same pattern in two rows", card: repeated, settings: second, expectedCode: "duplicate-pattern" },
    { name: "dots run together", card: dense, settings: second, expectedCode: "dots-too-close" },
    { name: "three dotted repeats on level 3", card: threeDotted, settings: third, expectedCode: "trace-repeats" },
    { name: "two drawn repeats on level 4", card: twoDrawn, settings: fourth, expectedCode: "trace-repeats" },
    { name: "a pattern taller than its row", card: tooTall, settings: third, expectedCode: "out-of-row" },
    { name: "a card shown for another level", card: base3, settings: second, expectedCode: "level-mismatch" },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const patternLinesSpec: CardSpec<PatternLinesSettings, PatternLinesCard> = {
  // The id joins the card registry in phase 3; until then it is cast, like the toy kind in the contract test.
  kind: "szlaczki" as CardKindId,
  problems: (card, settings): readonly CardProblem[] =>
    patternLinesProblems(card, patternLinesLevelById(settings.level)).map((code) => ({
      code,
      detail: `pattern-lines card rule "${code}" is broken`,
    })),
  keyOf: (card) => card.key,
  // Only the level lays out the card. "Linie" draws help lines and does not reach the key.
  contentKey: (settings) => settings.level,
  // Built on first use: the fixtures draw cards, which import time should not pay for.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const patternLinesEngine: CardEngine<PatternLinesSettings, PatternLinesCard> = {
  spec: patternLinesSpec,
  generate(settings, random, previousKey) {
    const card = generatePatternLinesCard(random, previousKey, patternLinesLevelById(settings.level));
    if (card === null) {
      throw new CardExhausted(patternLinesSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(patternLinesSpec, card, settings);
  },
};
