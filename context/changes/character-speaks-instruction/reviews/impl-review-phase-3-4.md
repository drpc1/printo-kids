<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Postać mówi polecenie na każdej karcie

- **Plan**: context/changes/character-speaks-instruction/plan.md
- **Scope**: Phases 3 and 4 of 5
- **Reviewed phases**: 3, 4
- **Date**: 2026-10-27
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

Automated gates re-run on the branch: `npm test` 583/583, `npm run lint`, `npx astro check`, `npm run build`, e2e (phone-layout, card-settings, sudoku, catalog) on chromium, phone-360, pixel-7 green. Manual 3.3 and 4.3 confirmed by the user after screenshots.

## Findings

### F1 — Hero branch groups the controls differently on nonogram and sequences than on the other cards

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/NonogramGenerator.tsx (hero branch), src/components/SequenceGenerator.tsx (hero branch)
- **Detail**: Before the first card, Postać and Poziom sit in one row and Kategoria stays stacked below on nonogram, while symmetry and dictation put all controls in one row.
- **Fix**: Keep as is, or put all nonogram controls in one wrapped row like symmetry. Decide when the page is seen in the phase 5 manual check.
- **Decision**: PENDING

### F2 — `instructionBoxHeight(true, 0)` in the sudoku sheet reads oddly

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/SudokuGenerator.tsx (SudokuSheet layout input)
- **Detail**: The second argument is unused when the first is true, so `0` is a placeholder.
- **Fix**: Use `SPEECH_BAND.characterSize` directly in that spot.
- **Decision**: PENDING

### F3 — The bubble text has only a width estimate, no guard in the renderer

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/sheet/speech.ts (estimatedTextWidth), src/components/SpeechBand.tsx
- **Detail**: The symmetry sentence at 7.5 mm leaves about 6 mm of slack in the narrowest bubble by the 0.52 width estimate. A wider system font on iOS print could use it up.
- **Fix**: Check on the phase 5 phone and print test; if a line gets tight, lower `singleLineSize` or add `textLength` to the text.
- **Decision**: PENDING
