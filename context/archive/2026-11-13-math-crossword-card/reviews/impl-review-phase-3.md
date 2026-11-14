<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Krzyżówka matematyczna – nowa karta (S-40, M-6)

- **Plan**: context/changes/math-crossword-card/plan.md
- **Scope**: Phase 3 of 4
- **Reviewed phases**: 3
- **Date**: 2026-11-14
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 4 observations

## Verdicts

| Dimension           | Verdict                                         |
| ------------------- | ----------------------------------------------- |
| Plan Adherence      | PASS                                            |
| Scope Discipline    | WARNING (1 benign EXTRA, requested by the user) |
| Safety & Quality    | PASS                                            |
| Architecture        | PASS                                            |
| Pattern Consistency | PASS                                            |
| Success Criteria    | PASS (automated); manual 3.6 and 3.7 still open |

Automated: `npm test` 1618 pass / 0 fail / 1 skipped, lint, depcruise, astro check and build green, e2e on `chromium` and `phone-360` for the crossword specs green (full four-project run was done before the hatching change). Reviewers read the code; they did not run tests.

## Findings

### F1 — Hatched gap cells are not in the plan or the PRD

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: src/lib/math-crossword/layout.ts:60-73, src/components/MathCrosswordSheet.tsx, scripts/build-thumbnails.mjs
- **Detail**: Places enclosed by drawn cells on all four sides are hatched so the child does not write there. Added at the user's request during the manual check; neither plan.md nor the PRD (Business Logic "Karta krzyżówki matematycznej") mentions it.
- **Fix**: Add one sentence to the PRD section and a note in plan.md phase 3 (addendum).
- **Decision**: FIXED (PRD: criterion in US-31 and a paragraph in Business Logic; plan.md addendum below)

### F2 — Hatch may be too faint on a black-and-white printer

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/components/MathCrosswordSheet.tsx (pattern `math-crossword-gap`, 0.35 mm grey line)
- **Detail**: A thin grey line can dither to almost nothing on a mono printer, so the cell could again look like a field to fill in.
- **Fix**: Check on the phase 4 test print; if weak, use a darker or thicker stroke.
- **Decision**: DEFERRED to the phase 4 test print

### F3 — "Pokaż rozwiązanie" is hidden without a card, the plan said inactive

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/components/MathCrosswordGenerator.tsx:78-85
- **Detail**: Plan: "nieaktywne przy braku karty". Code hides the switch, exactly like NonogramGenerator. Consistent with the sibling card; the PRD does not say which.
- **Fix**: Leave as is and fix the wording in plan.md, or make it disabled; no code change recommended.
- **Decision**: FIXED (plan.md addendum corrects the wording; code unchanged)

### F4 — The solution resets only through a changed card key

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/MathCrosswordGenerator.tsx:36,40
- **Detail**: If Generuj produced a card with an identical key, the solution would stay on. Same property as the nonogram; a collision is very unlikely (somewhat likelier at Poziom 1).
- **Fix**: Also clear `solutionFor` in the Generuj and level handlers; optional.
- **Decision**: FIXED (`setSolutionFor(null)` in Generuj, level and profile-switch handlers)

## Not findings

- Manual 3.6 (thumbnail, "poz. N" badge, profile summary) and 3.7 (phone) are unchecked in Progress, covered only by e2e so far.
- `phone-settings-rows.spec.ts` checks only Postać and Poziom; the "Pokaż rozwiązanie" toggle is covered in `phone-toggle-align.spec.ts`.
- Optional: `<defs>` could sit at the top of the SVG; `role="img"` hides the equations from screen readers (same as the nonogram).
