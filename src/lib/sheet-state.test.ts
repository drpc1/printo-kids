/* eslint-disable no-console -- the test replaces console.error to count the safety-net log */
// SheetState tests (gh283, phase 3): N16 transitions, N15 failure reasons, N17 content-key rule (I-9) and `printed`.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardExhausted, CardInvariantError, VerifiedCard, type CardEngine, type CardSpec } from "./card-contract.ts";
import { applySettings, failureReason, generateSheet, markPrinted, sheetView, type SheetState } from "./sheet-state.ts";

interface ToyCard {
  serial: number;
}

interface ToySettings {
  level: number;
  decoration: string;
}

const toySpec: CardSpec<ToySettings, ToyCard> = {
  kind: "toy",
  problems: () => [],
  keyOf: (card) => `card-${card.serial}`,
  contentKey: (settings) => `level-${settings.level}`,
  knownBad: [],
};

type Outcome = "ok" | "exhausted" | "invariant" | "type-error";

/** An engine whose next outcome is set by the test; it counts calls and remembers the last previousKey. */
function toyEngine(): {
  engine: CardEngine<ToySettings, ToyCard>;
  outcome: Outcome;
  calls: number;
  previous: string | null;
} {
  const probe = { outcome: "ok" as Outcome, calls: 0, previous: null as string | null };
  const engine: CardEngine<ToySettings, ToyCard> = {
    spec: toySpec,
    generate(_settings, _random, previousKey) {
      probe.calls += 1;
      probe.previous = previousKey;
      if (probe.outcome === "exhausted") throw new CardExhausted("toy", 3);
      if (probe.outcome === "invariant") throw new CardInvariantError("toy", [{ code: "broken", detail: "x" }]);
      if (probe.outcome === "type-error") throw new TypeError("bug");
      return VerifiedCard.require(toySpec, { serial: probe.calls }, _settings);
    },
  };
  return Object.assign(probe, { engine });
}

const random = (): number => 0.5;
const settings: ToySettings = { level: 1, decoration: "a" };
const idle: SheetState<ToyCard> = { kind: "idle", failure: null };

function showing(probe: ReturnType<typeof toyEngine>, at: ToySettings = settings): SheetState<ToyCard> {
  return generateSheet(idle, probe.engine, at, random);
}

void describe("generateSheet (N16)", () => {
  void test("idle plus success shows the card", () => {
    const probe = toyEngine();
    const state = showing(probe);
    assert.equal(state.kind, "showing");
    assert.equal(sheetView(state, "level-1").kind, "showing");
  });

  void test("showing plus failure becomes unavailable with the failure", () => {
    const probe = toyEngine();
    const state = showing(probe);
    probe.outcome = "exhausted";
    const next = generateSheet(state, probe.engine, settings, random);
    assert.ok(next.kind === "unavailable" && next.failure instanceof CardExhausted);
  });

  void test("idle plus failure stays idle and keeps the failure", () => {
    const probe = toyEngine();
    probe.outcome = "invariant";
    const next = generateSheet(idle, probe.engine, settings, random);
    assert.ok(next.kind === "idle" && next.failure instanceof CardInvariantError);
  });

  void test("unavailable plus success shows a card again", () => {
    const probe = toyEngine();
    probe.outcome = "exhausted";
    const failed = generateSheet(showing(toyEngine()), probe.engine, settings, random);
    probe.outcome = "ok";
    assert.equal(generateSheet(failed, probe.engine, settings, random).kind, "showing");
  });

  void test("an unexpected error flies on and the state is not replaced", () => {
    const probe = toyEngine();
    const state = showing(probe);
    probe.outcome = "type-error";
    assert.throws(() => generateSheet(state, probe.engine, settings, random), TypeError);
  });

  void test("previousKey comes from the shown card, and from nothing otherwise", () => {
    const probe = toyEngine();
    const first = showing(probe);
    assert.equal(probe.previous, null);
    generateSheet(first, probe.engine, settings, random);
    assert.equal(probe.previous, "card-1");
  });
});

void describe("applySettings and printed (N17, I-9)", () => {
  void test("same content key keeps the very same state, printed included", () => {
    const probe = toyEngine();
    const printed = markPrinted(showing(probe));
    const next = applySettings(printed, probe.engine, { ...settings, decoration: "b" }, random);
    assert.equal(next, printed);
    assert.equal(probe.calls, 1);
  });

  void test("another content key makes a new card with printed reset", () => {
    const probe = toyEngine();
    const printed = markPrinted(showing(probe));
    const next = applySettings(printed, probe.engine, { ...settings, level: 2 }, random);
    assert.ok(next.kind === "showing" && !next.printed);
    assert.notEqual(next.verified.key, "card-1");
  });

  void test("another content key with a failing engine becomes unavailable", () => {
    const probe = toyEngine();
    const state = showing(probe);
    probe.outcome = "exhausted";
    assert.equal(applySettings(state, probe.engine, { ...settings, level: 2 }, random).kind, "unavailable");
  });

  void test("unavailable plus another content key tries again", () => {
    const probe = toyEngine();
    probe.outcome = "exhausted";
    const failed = generateSheet(showing(toyEngine()), probe.engine, settings, random);
    probe.outcome = "ok";
    const next = applySettings(failed, probe.engine, { ...settings, level: 2 }, random);
    assert.equal(next.kind, "showing");
  });

  void test("unavailable plus the same content key stays as it is", () => {
    const probe = toyEngine();
    probe.outcome = "exhausted";
    const failed = generateSheet(showing(toyEngine()), probe.engine, settings, random);
    probe.outcome = "ok";
    assert.equal(applySettings(failed, probe.engine, { ...settings, decoration: "b" }, random), failed);
  });

  void test("idle generates nothing and clears the failure", () => {
    const probe = toyEngine();
    probe.outcome = "exhausted";
    const failedIdle = generateSheet(idle, probe.engine, settings, random);
    const next = applySettings(failedIdle, probe.engine, { ...settings, level: 2 }, random);
    assert.deepEqual(next, { kind: "idle", failure: null });
    assert.equal(probe.calls, 1);
  });

  void test("markPrinted works only on a shown card, and a new card is not printed", () => {
    const probe = toyEngine();
    assert.equal(markPrinted(idle), idle);
    const state = showing(probe);
    const printed = markPrinted(state);
    assert.ok(printed.kind === "showing" && printed.printed);
    const again = generateSheet(printed, probe.engine, settings, random);
    assert.ok(again.kind === "showing" && !again.printed);
    probe.outcome = "exhausted";
    const failed = generateSheet(printed, probe.engine, settings, random);
    assert.equal(markPrinted(failed), failed);
  });

  void test("sheetView with a key that does not match the shown card is unavailable and logs", () => {
    const probe = toyEngine();
    const state = showing(probe);
    const original = console.error;
    const logged: unknown[] = [];
    console.error = (...args: unknown[]) => {
      logged.push(args);
    };
    try {
      const view = sheetView(state, "level-2");
      assert.equal(view.kind, "unavailable");
      assert.equal(view.failure, null);
    } finally {
      console.error = original;
    }
    assert.equal(logged.length, 1);
  });
});

void describe("failureReason (N15)", () => {
  void test("an invariant error names the code and says it is an app error", () => {
    const text = failureReason(new CardInvariantError("toy", [{ code: "entrance-sealed", detail: "x" }]), {
      levelLabel: "Poziom 3",
    });
    assert.match(text, /entrance-sealed/);
    assert.match(text, /błąd aplikacji/);
  });

  void test("an exhausted card names the level, and the category when the kind has one", () => {
    const plain = failureReason(new CardExhausted("toy", 3), { levelLabel: "Poziom 3" });
    assert.match(plain, /Poziom 3/);
    const withCategory = failureReason(new CardExhausted("toy", 3), {
      levelLabel: "łatwy",
      categoryLabel: "Zwierzęta",
    });
    assert.match(withCategory, /Zwierzęta/);
    assert.match(withCategory, /łatwy/);
  });
});
