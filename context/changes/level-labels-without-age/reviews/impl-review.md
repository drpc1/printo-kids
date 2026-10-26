<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Poziomy bez wieku (S-27)

- **Plan**: context/changes/level-labels-without-age/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-26
- **Verdict**: APPROVED
- **Findings**: 0 critical · 1 warning · 4 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | WARNING |

Automated (re-run 2026-10-26): `npm test` 523/523, `npm run lint` clean, `npx astro check` 0 errors, `npm run build` OK, `npx playwright test` 118 passed / 58 skipped by design (chromium-only flow tests, WebKit off on Windows). Manual 1.5, 2.6–2.9 confirmed by the user in this session.

## Findings

### F1 — Phone "no scrolling" assertion measures the wrong element

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/phone-layout.spec.ts:482-483
- **Detail**: `dialog.evaluate(el => el.scrollHeight - el.clientHeight)` measures `DialogContent`, which is `overflow-hidden` (src/components/ui/dialog.tsx:53); scrolling happens in the inner `[data-slot="dialog-body"]`. The check cannot fail. The row-box loop below only partly covers it: a clipped last row can still end inside the viewport because the dialog keeps a 1rem margin.
- **Fix**: Measure `dialog.locator('[data-slot="dialog-body"]')` instead of the dialog.
- **Decision**: FIXED — measures `[data-slot="dialog-body"]`; verified red on a forced overflow (1090 px), green on 4 projects

### F2 — Level row button duplicated in three lists

- **Severity**: OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Pattern Consistency
- **Location**: src/components/LevelChoice.tsx:9,50-78; src/components/SudokuChoice.tsx:24,40-68; src/components/ProfileCorner.tsx:695-705
- **Detail**: The row button (`DIALOG_ROW_CLASS` + `levelRowClass` + `LevelRow`) and `barLabel ?? label` are repeated; `SudokuChoice` redefines the `LevelOption` shape inline because its ids can be numbers. The two choice components were near-identical before S-27.
- **Fix A ⭐ Recommended**: Leave as is
  - Strength: Small, readable change; S-28 and S-30 edit the same files, so a refactor now raises merge conflicts.
  - Tradeoff: Three copies to keep in step.
  - Confidence: HIGH — copies are short and covered by e2e on every list.
  - Blind spot: None significant.
- **Fix B**: Widen `LevelOption` to `Id extends string | number`, reuse it in `SudokuChoice`, and extract a shared `LevelOptionButton` into `LevelRow.tsx`
  - Strength: One place for row markup.
  - Tradeoff: Touches three components shared with S-28/S-30; more merge risk.
  - Confidence: MED — straightforward, but conflicts with parallel slices unverified.
  - Blind spot: S-28 branch contents.
- **Decision**: ACCEPTED (Fix A) — left as is to avoid conflicts with S-28/S-30

### F3 — LevelRow drops typicalAge when there is no description

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/LevelRow.tsx:18-20
- **Detail**: With `description` undefined the component returns the bare label, silently ignoring `typicalAge`. No current data hits this.
- **Fix**: Add a one-line comment that age is shown only under a description.
- **Decision**: FIXED — comment in LevelRow.tsx

### F4 — Small test nits

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: tests/e2e/level-bar.spec.ts:63; tests/e2e/sudoku-levels.spec.ts:11; src/lib/sudoku/levels.test.ts:50; src/components/ProfileCorner.tsx:19
- **Detail**: "longest names" case name no longer describes the longest level label; `choose()` builds a RegExp from unescaped option text (safe for today's values); the sudoku "no lat" loop lacks the `level.id` message its siblings pass; `/lat|nastolat/` is redundant; the `@/components/LevelRow` import sits between `@/lib` imports.
- **Fix**: Rename the case to "longest character name", pass `level.id` as the message, group the import; leave the regex as is.
- **Decision**: FIXED — case renamed, level.id message added, import grouped; unescaped RegExp and /lat|nastolat/ left as is

### F5 — Six three-line rows are close to the limit on short phones

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/phone-layout.spec.ts:476-491
- **Detail**: The list is ~616 px; iPhone 13 in Playwright has 664 px and narrower text, so "najwęższe alejki, start i meta w rogach" may wrap and the fit test may fail in the WebKit project (runs only in `e2e-phone.yml`, not on Windows). Users are fine either way: the body scrolls.
- **Fix**: Run `e2e-phone.yml` once on the S-27 branch after it is pushed; if iPhone fails, relax the test to "every row reachable" rather than "no scrolling".
- **Decision**: ACCEPTED — check after push: run e2e-phone.yml once; queued in follow-ups/review-fixes.md
