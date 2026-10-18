<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: S-09, faza 6, widoczny pasek przewijania

- **Plan**: context/changes/phone-worksheet/plan.md (nota z 2026-10-18 w fazie 6)
- **Scope**: Phase 6 of 6 (zamiana cienia na pasek przewijania)
- **Reviewed phases**: 6
- **Date**: 2026-10-18
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

Range `origin/main..7831563`. Gates: `npm test` 113/113, `npm run lint` 0, `npm run build`, `E2E_PORT=4397 npx playwright test` 26 passed / 10 skipped. Break check: without `pointer-coarse:data-scrollable:block` the new test fails on 3 touch projects. iPhone check by the user: ok (2026-10-18).

Checked: the track fits in the dialog's right padding (`pr-4` 16 px minus the body's `-m-1` 4 px leaves 12 px; track starts 3 px after the body and is 6 px wide); no leftovers of `useScrollEdges` / `scroll-shadow` / `data-more-*`; thumb moves via style (no React re-render), observers disconnect on close; track is `aria-hidden` and `pointer-events: none`.

## Findings

### F1 — Na iOS starszym niż 18.2 natywny pasek pojawia się obok własnego

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/ui/dialog.tsx (body: `pointer-coarse:[scrollbar-width:none]`)
- **Detail**: `scrollbar-width` działa w Safari od 18.2. Na starszym iOS w trakcie przewijania przez chwilę widać cienki natywny pasek obok rysowanego. Kosmetyka, nic nie zasłania.
- **Fix**: Brak działania; ewentualnie `::-webkit-scrollbar { display: none }` na dotyku, jeśli kiedyś przeszkadzało.
- **Decision**: ACCEPTED
