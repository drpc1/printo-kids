/* eslint-disable no-console -- console.error is the developer-facing trace the plan asks for (7.5) */
// Page state of one card generator as a single value (gh283, D02 4.6). Pure: the component keeps one `SheetState`,
// asks the engine through these functions in an event handler (never inside a setState updater: the engine uses
// randomness) and renders `sheetView`. Two rules live here: a failed Generuj switches the card off with a reason (7.2),
// and the sheet on screen always matches the content settings on the bar (I-9).
import { CardExhausted, CardInvariantError, type CardEngine, type VerifiedCard } from "./card-contract.ts";

export type CardFailure = CardExhausted | CardInvariantError;

export type SheetState<C> =
  | { kind: "idle"; failure: CardFailure | null }
  | { kind: "showing"; verified: VerifiedCard<C>; contentKey: string; printed: boolean }
  | { kind: "unavailable"; failure: CardFailure; contentKey: string };

export interface SheetView<C> {
  kind: "idle" | "showing" | "unavailable";
  printed: boolean;
  verified: VerifiedCard<C> | null;
  /** Null in `idle` without a failure, and in the `unavailable` that `sheetView` itself makes as a safety net. */
  failure: CardFailure | null;
}

/** Runs the engine; catches only the two named card errors, anything else is a bug and flies on. */
function attempt<S, C>(
  state: SheetState<C>,
  engine: CardEngine<S, C>,
  settings: S,
  random: () => number,
): { verified: VerifiedCard<C> } | { failure: CardFailure } {
  const previousKey = state.kind === "showing" ? state.verified.key : null;
  try {
    return { verified: engine.generate(settings, random, previousKey) };
  } catch (error) {
    if (error instanceof CardExhausted || error instanceof CardInvariantError) {
      if (error instanceof CardInvariantError) {
        console.error(`${error.kind}: ${error.problems.map((problem) => problem.code).join(", ")}`, error);
      }
      return { failure: error };
    }
    throw error;
  }
}

export function generateSheet<S, C>(
  state: SheetState<C>,
  engine: CardEngine<S, C>,
  settings: S,
  random: () => number,
): SheetState<C> {
  const contentKey = engine.spec.contentKey(settings);
  const result = attempt(state, engine, settings, random);
  if ("verified" in result) {
    return { kind: "showing", verified: result.verified, contentKey, printed: false };
  }
  return state.kind === "idle"
    ? { kind: "idle", failure: result.failure }
    : { kind: "unavailable", failure: result.failure, contentKey };
}

/** The one way to change settings with a card on screen: content settings make a new card, decorations keep it (I-9). */
export function applySettings<S, C>(
  state: SheetState<C>,
  engine: CardEngine<S, C>,
  settings: S,
  random: () => number,
): SheetState<C> {
  if (state.kind === "idle") {
    return state.failure === null ? state : { kind: "idle", failure: null };
  }
  if (state.contentKey === engine.spec.contentKey(settings)) {
    return state;
  }
  return generateSheet(state, engine, settings, random);
}

export function markPrinted<C>(state: SheetState<C>): SheetState<C> {
  return state.kind === "showing" && !state.printed ? { ...state, printed: true } : state;
}

export function sheetView<C>(state: SheetState<C>, contentKey: string): SheetView<C> {
  if (state.kind === "idle") {
    return { kind: "idle", printed: false, verified: null, failure: state.failure };
  }
  if (state.kind === "showing" && state.contentKey !== contentKey) {
    // A handler changed content settings without `applySettings`: never show a card that does not match the bar.
    console.error(`sheet shows content "${state.contentKey}" while the bar says "${contentKey}"`);
    return { kind: "unavailable", printed: false, verified: null, failure: null };
  }
  if (state.kind === "showing") {
    return { kind: "showing", printed: state.printed, verified: state.verified, failure: null };
  }
  return { kind: "unavailable", printed: false, verified: null, failure: state.failure };
}

export interface FailureContext {
  levelLabel: string;
  categoryLabel?: string;
}

/** What the parent reads in place of the card. An invariant error is an app error and says so, with the first code. */
export function failureReason(failure: CardFailure, context: FailureContext): string {
  if (failure instanceof CardInvariantError) {
    const code = failure.problems[0]?.code ?? "unknown";
    return `Karta nie przeszła sprawdzenia (kod: ${code}). To błąd aplikacji.`;
  }
  const where =
    context.categoryLabel === undefined
      ? `na poziomie „${context.levelLabel}”`
      : `w kategorii „${context.categoryLabel}” na poziomie „${context.levelLabel}”`;
  return `Nie ma więcej różnych kart ${where}. Zmień ustawienia i spróbuj jeszcze raz.`;
}
