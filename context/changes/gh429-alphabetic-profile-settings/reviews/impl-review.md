<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Nazwy kart przy zapamiętanych ustawieniach profilu alfabetycznie

- **Plan**: context/changes/gh429-alphabetic-profile-settings/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2
- **Date**: 2026-11-21
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Plan still forbids the registry reorder it now contains

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: context/changes/gh429-alphabetic-profile-settings/plan.md:59
- **Detail**: The phase 1 contract still says `CARD_KINDS` is not reordered. The overview and „What We're NOT Doing” in the same file, edited in `7b0a75bd`, say the registry is alphabetical and must not stay in insertion order. Progress 1.1 still says `src/lib/cards.test.ts` requires `CARD_KINDS` to start with Labirynt. The code does not: `src/lib/cards.ts:10-14` starts with Dyktando graficzne, and `src/lib/cards.test.ts:6-16` requires the whole title list to be Polish-alphabetical. The US-08 sentence at `context/foundation/prd.md:211` describes that registry. The phase 2 contract still asks for „w kolejności katalogu”, which is not the sentence that landed. All 14 card ids are present. `npm test` passed (1959 pass, 1 skipped) and `tests/e2e/profile-summary.spec.ts` on Chromium passed (11). The profile window order from phase 1 matches `cardsInCatalogOrder()`.
- **Fix A ⭐ Recommended**: Make the phase 1 contract, the phase 2 contract, and Progress 1.1 describe the alphabetical registry that is already in the code and in US-08.
  - Strength: Code, `cards.test.ts`, and the PRD sentence already agree. Only the leftover sentences in the plan are false.
  - Tradeoff: The earlier decision that `CARD_KINDS` stays in insertion order is retired on paper as well as in code.
  - Confidence: HIGH — the three commits and the tests were read; the user chose „Adapt and continue” for this reorder.
  - Blind spot: None significant for the profile window.
- **Fix B**: Put `CARD_KINDS` back in insertion order, restore the Labirynt-first test, and shorten the US-08 sentence to catalog order.
  - Strength: Restores the phase 1 contract that is still written at plan.md:59.
  - Tradeoff: Undoes the adaptation already chosen, and a new card would again sit at the end of the registry.
  - Confidence: HIGH — the insertion-order array is still in commit `42178bc7`.
  - Blind spot: None significant.
- **Decision**: FIXED via Fix A. Plan sentences now match the alphabetical registry in the code and in US-08 (phase 1 contract, phase 2 contract and its success criterion, Progress 1.1 and 2.1).
