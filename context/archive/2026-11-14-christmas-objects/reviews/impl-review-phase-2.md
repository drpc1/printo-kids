<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Świąteczne obiekty (S-38)

- **Plan**: context/changes/christmas-objects/plan.md
- **Scope**: Phase 2 of 5
- **Reviewed phases**: 2
- **Date**: 2026-11-14
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Automated: `npm test` (1552 pass, 1 skip), `npm run lint`, `npx astro check`, `npm run build`, `npm run depcruise`, Playwright `christmas-category.spec.ts` (+ card-settings, profile-summary, level-bar on chromium and phone-360) all green. Break-check: inverting the New Year branch of `inWindow` turned `object-categories.test.ts` red (2 failures); restored.

## Findings

### F1 — Minimum of four objects relaxed for Boże Narodzenie

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/symmetry/templates.test.ts:52
- **Detail**: The plan said choinka and gwiazda suffice for the cardinality tests, but `templates.test.ts` requires at least four objects per category and size. The test now accepts two for `boze-narodzenie` until phase 3 adds six objects.
- **Fix**: Phase 3 must remove the exception (back to a flat minimum of four).
- **Decision**: ACCEPTED (phase 3 removes it)

### F2 — Remembered Christmas category is overwritten by any bar change outside the window

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/hooks/useCardSettings.ts:remember
- **Detail**: `remember` starts from the already mapped state, so changing e.g. the level outside the window also stores "wszystkie" for the category. This is the plan's decision ("pierwsza zmiana na pasku tej karty zapisuje Wszystkie"), recorded here only as intended behavior.
- **Fix**: None.
- **Decision**: ACCEPTED
