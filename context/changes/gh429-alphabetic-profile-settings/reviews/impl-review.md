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
- **Location**: context/changes/gh429-alphabetic-profile-settings/plan.md
- **Detail**: The phase 1 contract used to say `CARD_KINDS` is not reordered, Progress 1.1 required Labirynt first, and the phase 2 contract asked for catalog order. The code, `cards.test.ts`, and US-08 already describe an alphabetical registry.
- **Fix A ⭐ Recommended**: Make the phase 1 contract, the phase 2 contract, and Progress 1.1 describe the alphabetical registry that is already in the code and in US-08.
- **Fix B**: Put `CARD_KINDS` back in insertion order and shorten the US-08 sentence to catalog order.
- **Decision**: FIXED via Fix A. The phase 1 contract, the phase 2 contract and its success criterion, and Progress 1.1 and 2.1 describe the alphabetical registry.
