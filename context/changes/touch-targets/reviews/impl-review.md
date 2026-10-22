<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Większe pola dotyku Profilu i krzyżyka

- **Plan**: context/changes/touch-targets/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-23
- **Verdict**: APPROVED
- **Findings**: 0 critical 0 warnings 0 observations

Manual rows 1.3, 2.4, and 2.5 stay open. They were not marked done. This review covers the implemented code of both phases.

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

None.

## Evidence

Phases 1 and 2 match the plan. `pointer-coarse:min-h-11` is the only new class on the Profil trigger (`src/components/ProfileCorner.tsx`). The heading clearance is only `padding-top: 3.75rem` inside the existing screen, max-width 639px, `.has-maze` rule (`src/components/WorksheetHome.astro`). The close control is a 44px `size-11` hit area (`top-2 right-3`, `pointer-coarse:right-[3px]`) with a 36px `size-9` hover tile, `group-focus-visible` ring classes from `button.tsx`, accessible name „Zamknij”, and the corner comment tying `pr-4` to `+ 3` in `useScrollIndicator.ts`. That hook is unchanged. Postać, Poziom, the pencil, the trash button, and `DIALOG_ROW_CLASS` are unchanged.

Automated checks on 2026-10-23:

- `npx playwright test tests/e2e/phone-layout.spec.ts`: 19 passed, 1 skipped (`iphone-13` WebKit is skipped on Windows unless `E2E_WEBKIT=1`)
- `npx playwright test tests/e2e/dialog-close.spec.ts`: 2 passed on `chromium`, 6 skipped (the file runs only on `chromium`)
- `npm test`: 120 passed
- `npm run lint`: passed

## Manual checks

- 1.3 pending. Phone-width touch emulation: the „Profil” label and a short name still look as they do today, the hit area is taller, and it does not cover the heading.
- 2.4 pending. On an iPhone, character list: the close control can be hit, the drawn track sits under the icon, and the first row is not covered.
- 2.5 pending. On a computer, Tab shows the same `focus-visible` ring as the other buttons, and a mouse click does not leave it.
