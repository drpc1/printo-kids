<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Nonogram — pierwsza drukowalna karta (S-22)

- **Plan**: context/changes/nonogram-first-printable/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3, 4
- **Date**: 2026-10-25
- **Verdict**: APPROVED
- **Findings**: 0 critical, 2 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | PASS    |

Automated criteria re-run on HEAD fb3dcb7: `npm test` 390/390, `npm run lint`, `npx astro check` (0 errors), `npm run build`, `npm run thumbnails` (no other thumbnail changed), `npx prettier --check` — all pass. Manual 3.6–3.9 confirmed by the user; 3.6, 3.7 and 3.9 also checked in the built-in browser (catalog tile, same card after toggling the solution, 375 px without overlap) and smoke 10/10 against the dev server. `src/lib/symmetry/` untouched.

## Findings

### F1 — „Pokaż rozwiązanie” stays on after Generuj

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/components/NonogramGenerator.tsx:28
- **Detail**: `showSolution` survives a new card, so after Generuj the next card shows up already solved on screen. Print is unaffected (`print:hidden`). Symmetry keeps its colors switch the same way, but the solution is a different case: the parent most likely generates a card for the child.
- **Fix A ⭐ Recommended**: Generuj turns the switch off
  - Strength: A new card always starts as the child sees it; one line in `handleGenerate`.
  - Tradeoff: A parent checking many cards in a row turns it on again each time.
  - Confidence: HIGH — the switch only exists to check the card.
  - Blind spot: None significant.
- **Fix B**: Keep it as is
  - Strength: Same as symmetry's colors switch.
  - Tradeoff: The new card on screen is already solved.
  - Confidence: MED.
  - Blind spot: None significant.
- **Decision**: FIXED (Fix A) — Generuj wyłącza przełącznik; sprawdzone w przeglądarce

### F2 — Clue font weight defined twice

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/NonogramGenerator.tsx:15, scripts/build-thumbnails.mjs:293
- **Detail**: `CLUE_FONT_WEIGHT = 600` lives in the component and again in the thumbnail script, while `NONOGRAM_SHEET` is meant to stop the thumbnail drifting from the card (sibling: `SEQUENCE_SHEET.numberFontWeight`).
- **Fix**: Add `clueFontWeight: 600` to `NONOGRAM_SHEET` and read it in both places.
- **Decision**: FIXED — NONOGRAM_SHEET.clueFontWeight

### F3 — Thumbnail pins "sredni" by literal

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: scripts/build-thumbnails.mjs:291
- **Detail**: The page uses `DEFAULT_NONOGRAM_SIZE_ID`; the thumbnail uses `"sredni"`.
- **Fix**: Use `DEFAULT_NONOGRAM_SIZE_ID` in the script.
- **Decision**: FIXED — DEFAULT_NONOGRAM_SIZE_ID w skrypcie miniatur

### F4 — console.log in the layout test

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/nonogram/layout.test.ts:58-59
- **Detail**: Block size printed with `console.log` behind an eslint-disable; `generate.test.ts` uses `t.diagnostic`.
- **Fix**: Replace with `t.diagnostic` and drop the eslint-disable.
- **Decision**: FIXED — t.diagnostic

### F5 — Print contract checks the class list, not the element

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/sheet/print-contract.test.ts
- **Detail**: The test asserts three `print:hidden` class strings, not that the third sits on the solution `<g>`. The break-check (removing it went red) shows it still protects the rule; moving the class to another element would pass unnoticed.
- **Fix**: Assert a `<g className={cn("print:hidden")}` directly precedes the solution cells (regex on the source).
- **Decision**: FIXED — test sprawdza data-solution na grupie print:hidden; break-check czerwony
