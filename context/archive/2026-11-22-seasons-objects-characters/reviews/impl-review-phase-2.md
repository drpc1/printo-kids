<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Zima: obiekty i postacie w oknie dat (S-54)

- **Plan**: context/changes/seasons-objects-characters/plan.md
- **Scope**: Phase 2 of 6
- **Reviewed phases**: 2
- **Date**: 2026-11-23
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Evidence:

- `zima` is defined in `src/lib/symmetry/template-format.ts` with the window 1.12–29.02. The order and the reading outside the window come from the existing `objectCategoryChoicesOn` and `visibleCategoryOn`, and the engines are unchanged.
- The snowman moves to `zima` and the penguin gets `zwierzeta` + `zima`.
- Unit tests cover the window edges 30.11, 1.12, 6.01, 7.01, 28.02, 29.02 (2028) and 1.03, plus the bar in December, February and summer. The e2e file `tests/e2e/winter-category.spec.ts` checks December, February and 1 March.
- Lint, depcruise, `npm test` (2049 passing), astro check (0 errors) and build are green. The e2e tests for the winter and Christmas categories pass on chromium.

## Findings

### F1 — Zima is below the four-object threshold until phase 3

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/symmetry/templates.test.ts:47
- **Detail**: The threshold test lets `zima` pass with 2 objects (the snowman and the penguin), as the plan foresees ("Próg spełnia dopiero Faza 3"). A production release after 1.12 that has phase 2 but not phase 3 would show Zima with two objects, so Generuj in that category would repeat quickly.
- **Fix**: Phase 3 removes the exception. Do not release to `prod` between the two phases if the date is already in the window.
- **Decision**: PENDING

### F2 — Snowman object is still in boze-narodzenie.ts

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/symmetry/objects/boze-narodzenie.ts:1169
- **Detail**: Object files are named after their category, but the snowman (now `zima`) is still in the Christmas file.
- **Fix**: Move it to `src/lib/symmetry/objects/zima.ts` in phase 3, when that file is created.
- **Decision**: PENDING

### F3 — Manual check 2.3 is pending

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: N/A
- **Detail**: Nobody has checked yet that, in December on a phone, the category list with both seasonal entries does not cover Generuj or Drukuj.
- **Fix**: Check on staging after the merge, with the device date in December or with the e2e clock.
- **Decision**: PENDING
