<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Bramka „tylko context/” liczy zmiany PR od merge-base

- **Plan**: context/changes/gh249-fix-ci-gates/plan.md
- **Mode**: Quick (jedna linia workflow + test; bez sub-agenta)
- **Date**: 2026-10-31
- **Verdict**: SOUND
- **Findings**: 0 critical, 0 warnings, 1 observation

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | PASS    |
| Plan Completeness     | PASS    |

## Grounding

paths ✓ (ci.yml, context-only-diff.mjs, context-only-diff.test.mjs, package.json test script), symbols ✓ (requiresAppGate, line 33 diff, line 32 git show), brief↔plan ✓, Progress↔Phase ✓ (5 automated + 2 manual).

## Findings

### F1 — Asercja tekstowa na ci.yml jest krucha

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1, zmiana 2
- **Detail**: Test czyta ci.yml i szuka `range="$base...$head"`; zmiana formatowania zepsuje test bez zmiany zachowania. Bezpieczne tryby awarii (brak merge-base, force push) kończą się błędem kroku, a joby `ci`/`smoke`/`e2e` wtedy i tak ruszają (`needs.changes.result != 'success'`), więc nie ma luki.
- **Fix**: Dopasować regexem tolerującym białe znaki, jedną asercją na linię `range=`.
- **Decision**: ACCEPTED
