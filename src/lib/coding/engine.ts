// "Kodowanie" as a card kind (S-42, phase 2): `codingSpec` wraps `codingProblems`, `codingEngine` wraps the generator.
// Both the level and the mode are content: each changes the grid or the task. Running out of attempts is
// `CardExhausted`; the engine never returns null.
import { CardExhausted, VerifiedCard, type CardEngine, type CardProblem, type CardSpec } from "../card-contract.ts";
import type { CodingSettings } from "../card-settings.ts";
import { codingKey, codingProblems, type CodingCard, type CodingTarget } from "./card.ts";
import { generateCodingCard, MAX_ATTEMPTS } from "./generate.ts";
import { codingLevelById, codingModeById } from "./levels.ts";
import type { Cell, Dir } from "./search.ts";

type Bad = CardSpec<CodingSettings, CodingCard>["knownBad"][number];

const toGrid = (rows: readonly string[]): boolean[][] => rows.map((row) => Array.from(row, (c) => c === "1"));

/** 5×5 with one obstacle at column 1 of the first row. */
const blocked5 = (): boolean[][] => toGrid(["01000", "00000", "00000", "00000", "00000"]);
/** A corridor: right along the bottom row, then up column 3. Its only way from (0, 4) to (3, 1) is the shortest. */
const corridor = (): boolean[][] => toGrid(["11111", "11101", "11101", "11101", "00001"]);
const open5 = (): boolean[][] => toGrid(["00000", "00000", "00000", "00000", "00000"]);

const zapisz1: CodingSettings = { level: "poziom1", mode: "zapisz" };
const wykonaj1: CodingSettings = { level: "poziom1", mode: "wykonaj" };

// 6 steps, 1 turn: right x3 along the bottom row, up x3 along column 3.
const CORRIDOR_PATH: Dir[] = ["R", "R", "R", "U", "U", "U"];
// From (0, 1): (1,1) (2,1) (2,2) (2,3) (3,3) (3,4); 6 steps, 3 turns, no obstacle.
const WYKONAJ_PATH: Dir[] = ["R", "R", "D", "D", "R", "D"];
const STAR: CodingTarget = { kind: "star", cell: [3, 4], isGoal: true };
const HEART: CodingTarget = { kind: "heart", cell: [4, 4], isGoal: false };
const CIRCLE: CodingTarget = { kind: "circle", cell: [4, 3], isGoal: false };

function zapiszCard(start: Cell, goal: Cell, path: Dir[], blocked: boolean[][]): CodingCard {
  return { level: "poziom1", mode: "zapisz", blocked, start, goal, path, targets: [] };
}

function wykonajCard(targets: CodingTarget[]): CodingCard {
  return {
    level: "poziom1",
    mode: "wykonaj",
    blocked: blocked5(),
    start: [0, 1],
    goal: [3, 4],
    path: WYKONAJ_PATH,
    targets,
  };
}

/**
 * The sound cards the known bad ones are built from. The spec test checks that each has no problem, so a known bad
 * card fails for the rule it breaks and not because its base was already broken.
 */
export function knownBadBases(): readonly { name: string; card: CodingCard; settings: CodingSettings }[] {
  return [
    { name: "Zapisz corridor", card: zapiszCard([0, 4], [3, 1], CORRIDOR_PATH, corridor()), settings: zapisz1 },
    { name: "Wykonaj with three pictures", card: wykonajCard([STAR, HEART, CIRCLE]), settings: wykonaj1 },
  ];
}

/** Hand-made cards, each breaking one rule of a sound base from `knownBadBases`. */
function knownBad(): readonly Bad[] {
  return [
    {
      // The same 6 steps on an open grid: other shortest paths of the same length exist.
      name: "Zapisz with two shortest paths",
      card: zapiszCard([0, 4], [3, 1], CORRIDOR_PATH, open5()),
      settings: zapisz1,
      expectedCode: "shortest-path-not-unique",
    },
    {
      name: "Zapisz path through an obstacle",
      card: zapiszCard([0, 0], [4, 0], ["R", "R", "R", "R"], blocked5()),
      settings: zapisz1,
      expectedCode: "path-leaves-grid-or-hits-obstacle",
    },
    {
      name: "Wykonaj with a distractor on the path",
      card: wykonajCard([STAR, { kind: "heart", cell: [1, 1], isGoal: false }, CIRCLE]),
      settings: wykonaj1,
      expectedCode: "distractor-on-path",
    },
    {
      name: "Wykonaj with a distractor too far",
      card: wykonajCard([STAR, HEART, { kind: "circle", cell: [4, 0], isGoal: false }]),
      settings: wykonaj1,
      expectedCode: "distractor-too-far",
    },
    {
      name: "Wykonaj with two pictures",
      card: wykonajCard([STAR, HEART]),
      settings: wykonaj1,
      expectedCode: "wrong-target-count",
    },
    {
      name: "a Wykonaj card shown for Zapisz",
      card: wykonajCard([STAR, HEART, CIRCLE]),
      settings: zapisz1,
      expectedCode: "settings-mismatch",
    },
  ];
}

let knownBadCache: readonly Bad[] | undefined;

export const codingSpec: CardSpec<CodingSettings, CodingCard> = {
  kind: "kodowanie",
  problems: (candidate, settings): readonly CardProblem[] =>
    codingProblems(candidate, settings).map((code) => ({
      code,
      detail: `coding card rule "${code}" is broken`,
    })),
  keyOf: codingKey,
  // The level and the mode both lay out the card.
  contentKey: (settings) => `${settings.level}|${settings.mode}`,
  // Built on first use, like the other kinds.
  get knownBad() {
    knownBadCache ??= knownBad();
    return knownBadCache;
  },
};

export const codingEngine: CardEngine<CodingSettings, CodingCard> = {
  spec: codingSpec,
  generate(settings, random, previousKey) {
    const generated = generateCodingCard(
      random,
      previousKey,
      codingLevelById(settings.level),
      codingModeById(settings.mode),
    );
    if (generated === null) {
      throw new CardExhausted(codingSpec.kind, MAX_ATTEMPTS);
    }
    return VerifiedCard.require(codingSpec, generated, settings);
  },
};
