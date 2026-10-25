<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Graphic dictation first printable (S-23)

- **Plan**: context/changes/graphic-dictation-first-printable/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-25
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 3 observations

## Verdicts

| Dimension           | Verdict                                  |
| ------------------- | ---------------------------------------- |
| Plan Adherence      | PASS                                     |
| Scope Discipline    | PASS                                     |
| Safety & Quality    | WARNING                                  |
| Architecture        | PASS                                     |
| Pattern Consistency | PASS                                     |
| Success Criteria    | PASS (3.5 print preview pending, manual) |

Automated: lint, npm test (380), astro check, build, thumbnails byte-identical — all pass. Catalog lat6: 20 combinations, 18 passing, 9 distinct outlines.

## Findings

### F1 — Generator returns cards without the rule gate; a bad template throws on click

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/dictation/generate.ts:52-57, 84-117
- **Detail**: Symmetry and sequence generators return only cards with no problems; here `dictationCardProblems` runs only in tests, and the plan's edge-count check is not in the trace. `traceOutline` can throw inside `catalogFor` (click handler) for a template S-21 may add; the catalog is never memoized then, so every click throws without the "Nie udało się ułożyć karty." note, and `npm run thumbnails` breaks too.
- **Fix**: In `catalogFor`, wrap the trace per combination in try/catch and keep an outline only if `dictationCardProblems(placeOutline(...))` is empty; memoize by `level.id` (also covers F4).
  - Strength: Same gate as the other generators; a bad template is skipped, not fatal.
  - Tradeoff: One extra validation per combination at catalog build (ms).
  - Confidence: HIGH — the existing null path already shows the failure note.
  - Blind spot: None significant.
- **Decision**: FIXED

### F2 — Thumbnail draws command numbers black, page draws them grey

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: scripts/build-thumbnails.mjs:327
- **Detail**: Page uses `var(--muted-foreground)` for the small number; the thumbnail uses `#000`.
- **Fix**: Use a grey literal in the thumbnail for the number and regenerate.
- **Decision**: FIXED

### F3 — "Every passing variant" test re-implements centering

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/dictation/generate.test.ts:48-77
- **Detail**: The test places outlines itself instead of using the generator's placement, so a placement bug would slip past it (the 100-card test partly covers it).
- **Fix**: Export the placement helper and use it in the test.
- **Decision**: FIXED

### F4 — Catalog cache keyed by level object identity

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/lib/dictation/generate.ts:36
- **Detail**: WeakMap by object; a copied level (S-25 `dictationLevelById`) would miss the cache. `sequence/rules.ts` keys Maps by id.
- **Fix**: Key the cache by `level.id` (folded into F1's fix).
- **Decision**: FIXED
