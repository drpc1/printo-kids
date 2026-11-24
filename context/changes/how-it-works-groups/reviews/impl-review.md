<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Jak to działa: trzy zwinięte grupy i opis własnego obrazka

- **Plan**: context/changes/how-it-works-groups/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-11-24
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 1 observation

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Checked: diff of 7 files against the plan (no unplanned files, no out-of-scope files such as `CARD_KINDS`, `card-levels.ts`, character list). Own-image text verified in `src/lib/sheet/own-image.ts` (JPEG/PNG/WebP/HEIC, 8 MB, kept in the browser) and `ProfileCorner.tsx` / `WorksheetGenerator.tsx` (row "Własny obrazek" in profile dialog and bar). Gates re-run: `npm test` (2088 pass), lint, depcruise, `astro check` (0 errors; 1 pre-existing hint), build, e2e on Chromium (8 passed), break-check with `open` in `<details>` (red, restored).

## Findings

### F1 — Manual checks verified by the agent, not on a real device

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: context/changes/how-it-works-groups/plan.md (Progress 1.3–1.5, 3.3)
- **Detail**: The manual rows were checked in the built-in browser (closed rows, group order, Enter opens a row, `scrollWidth <= clientWidth` at 375 px). A screenshot at 375 px was cropped by the pane, so the layout was judged from the overflow measurement, not by eye. No test on a phone or in screen readers (known, accepted: `h3` in `<summary>`).
- **Fix**: User glances at `/how-it-works` on a phone before release.
- **Decision**: ACCEPTED — known trade-off, reported in the PR.
