// The one place that builds a `VerifiedCard` (gh283, D02 4.3). An engine hands a candidate card to `require` or
// `check`; only a card with no problems becomes a `VerifiedCard`, frozen all the way down and copied from the candidate.
// No parameter properties, enums or namespaces here: `node --experimental-strip-types` runs this file as is.

/** Until phase 11 narrows it to the ids in `CARD_KINDS`. */
export type CardKindId = string;

export interface CardProblem {
  /** Stable identifier, e.g. "entrance-sealed". */
  code: string;
  /** For people; not to be parsed. */
  detail: string;
}

/** What the author of a card kind writes. */
export interface CardSpec<S, C> {
  readonly kind: CardKindId;
  /** Empty list = legal card. Every kind defines it; what it checks is the kind's decision. */
  problems(card: C, settings: S): readonly CardProblem[];
  /** For "a new card on every Generuj" (I-2). */
  keyOf(card: C): string;
  /** Key of the settings that change the task (I-9). Decorations (character, colors) do not enter it. */
  contentKey(settings: S): string;
  /** Known bad cards: the liveness test requires `problems` to reject each one with `expectedCode`. */
  readonly knownBad: readonly { name: string; card: C; settings: S; expectedCode: string }[];
}

/** A card is illegal. Thrown when a defect, not bad luck, produced it. */
export class CardInvariantError extends Error {
  override readonly name: string = "CardInvariantError";
  readonly kind: CardKindId;
  readonly problems: readonly CardProblem[];

  constructor(kind: CardKindId, problems: readonly CardProblem[]) {
    super(`${kind}: ${problems.map((problem) => `${problem.code} (${problem.detail})`).join("; ")}`);
    this.kind = kind;
    this.problems = problems;
  }
}

/** Sampling ran out of attempts. A legal outcome (a thin category), not a defect. */
export class CardExhausted extends Error {
  override readonly name: string = "CardExhausted";
  readonly kind: CardKindId;
  readonly attempts: number;

  constructor(kind: CardKindId, attempts: number) {
    super(`${kind}: no legal card after ${attempts} attempts`);
    this.kind = kind;
    this.attempts = attempts;
  }
}

// Freezes plain data (objects and arrays), which is all a card is today; a Map or Set inside a card would stay mutable.
function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

export class VerifiedCard<C> {
  readonly kind: CardKindId;
  readonly card: Readonly<C>;
  readonly key: string;

  private constructor(kind: CardKindId, card: Readonly<C>, key: string) {
    this.kind = kind;
    this.card = card;
    this.key = key;
  }

  /** The only way to a legal `VerifiedCard`. Throws `CardInvariantError`. The input is copied, so it stays the caller's. */
  static require<S, C>(spec: CardSpec<S, C>, card: C, settings: S): VerifiedCard<C> {
    const problems = spec.problems(card, settings);
    if (problems.length > 0) {
      throw new CardInvariantError(spec.kind, problems);
    }
    return new VerifiedCard(spec.kind, deepFreeze(structuredClone(card)), spec.keyOf(card));
  }

  /** For sampling loops: does not throw, returns the problems (card rejected, draw again). */
  static check<S, C>(
    spec: CardSpec<S, C>,
    card: C,
    settings: S,
  ): { ok: true; card: VerifiedCard<C> } | { ok: false; problems: readonly CardProblem[] } {
    const problems = spec.problems(card, settings);
    if (problems.length > 0) {
      return { ok: false, problems };
    }
    return { ok: true, card: new VerifiedCard(spec.kind, deepFreeze(structuredClone(card)), spec.keyOf(card)) };
  }
}

export interface CardEngine<S, C> {
  readonly spec: CardSpec<S, C>;
  /**
   * Returns a `VerifiedCard` or throws. Never null.
   *  - `CardExhausted`: attempts ran out (legal; the UI switches the previous card off and shows the reason).
   *  - `CardInvariantError`: a constructed candidate is illegal (a generator defect; the UI does not guess).
   */
  generate(settings: S, random: () => number, previousKey: string | null): VerifiedCard<C>;
}
