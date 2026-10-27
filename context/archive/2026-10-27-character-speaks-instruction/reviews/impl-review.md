<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Postać mówi polecenie na każdej karcie

- **Plan**: context/changes/character-speaks-instruction/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3, 4, 5
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

All 5 phases are `[x]` in Progress, including manual 5.3–5.5 confirmed by the user. Automated gates at the last code commit: `npm test` 586/586, `npm run lint`, `npx astro check`, `npm run build`, e2e on chromium, phone-360, pixel-7, tablet-768 (181 passed, 115 skipped for WebKit on Windows); CI green on PRs #143, #145, #146.

Drift from the plan, all benign and in code comments or commit messages: `layoutSpeechBand` takes a `top` (the card layouts center their block, so the band is not always at the inset); `instructionBoxHeight(characterShown, plainHeight)` replaced the planned `bandHeight`; `dictationCellSize` takes an input object; `CharacterInstruction` was added so the five sheets share one call; the 5-row dictation size is 7.5 mm, not 7.8 (corrected in the plan). The maze page changed only by importing the shared button.

## Findings

### F1 — The easy nonogram (chips) and the other levels are not covered by the new e2e

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/character-speaks.spec.ts
- **Detail**: The spec runs each card at its default level. The chip card (`NonogramSimpleSheet`) and the hard dictation grid are guarded only by layout unit tests, the print-contract test and a screenshot taken by hand.
- **Fix**: Add one case that picks the easy nonogram level and one for the hard dictation level.
- **Decision**: SKIPPED

### F2 — `CharacterChoiceControl` has a `disabled` prop that no page passes

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/CharacterChoiceControl.tsx
- **Detail**: Level and category controls get `disabled={waitingForChild}`; the character button does not, like on the maze page.
- **Fix**: Remove the unused prop, or pass `waitingForChild` on all pages (a product decision for the favorite-character slice S-31).
- **Decision**: SKIPPED

### F3 — Start screen groups the controls differently on nonogram and sequences

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/NonogramGenerator.tsx, src/components/SequenceGenerator.tsx (hero branch)
- **Detail**: Carried from the phase 3–4 review: Postać and Poziom sit in one row and Kategoria below on nonogram; the other pages put all controls in one row.
- **Fix**: Put the nonogram controls in one wrapped row, or leave it.
- **Decision**: SKIPPED
