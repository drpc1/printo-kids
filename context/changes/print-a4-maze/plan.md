# Print A4 maze Implementation Plan

## Overview

S-02 lets the parent print the maze they already see as one A4 page. A Drukuj control appears with the sheet and opens the browser print dialog. The dialog prints the white card only.

## Current State Analysis

`/` already explains the tool and generates a solvable maze. [src/pages/index.astro](src/pages/index.astro) mounts [src/components/WorksheetHome.astro](src/components/WorksheetHome.astro). The page is a paper-colored column: the heading PrintoKids, the sentence `Wygeneruj labirynt i wydrukuj go na kartce A4.`, and [src/components/WorksheetGenerator.tsx](src/components/WorksheetGenerator.tsx).

Generuj is an enabled sage button. Before the first successful click there is no sheet. After a click whose path count is 1, one SVG sheet appears (`viewBox` 0 0 210 297, aspect 210/297, white fill, the word Start, the word Meta). The grid inset is 10 by 10 user units, so the maze already sits 10mm inside an A4-shaped page. Screen width is `w-full` inside `max-w-xl`. There is a 1px ink ring around the sheet for the screen.

Nothing in `src/` prints. There is no `@page`, no `@media print`, no `window.print`, and no Drukuj control. [src/styles/global.css](src/styles/global.css) is the token file and has no print rules. `/auth/signin` is still the cosmic starter screen.

## Desired End State

On screen, `/` looks as it does now until a maze exists. After Generuj, Drukuj sits with Generuj. Drukuj opens the browser print dialog.

With margins left at Default and headers and footers turned off in that dialog, the preview is one A4 page: the same white sheet, the same maze size, Start, and Meta. The heading, the purpose sentence, and both buttons are absent. At least 10mm of white remains inside the sheet edge, from the inset the sheet already draws. `/auth/signin` is unchanged.

### Key Discoveries:

- The 10mm margin is already `INSET_X` / `INSET_Y` on a 210 by 297 sheet in [src/components/WorksheetGenerator.tsx](src/components/WorksheetGenerator.tsx) (lines 5–8 and 58–63). A second 10mm on `@page` would shrink the maze.
- The sheet node is inside a React island (`client:load`). An Astro scoped style does not reach it. Print size belongs on the SVG’s own classes. `@page` belongs in an unscoped style rendered only with the home worksheet.
- Generuj is a plain button using `--pk-sage` and `--pk-paper` (lines 45–51). Drukuj follows that control, not the shadcn button used on auth forms.
- F3 in the S-01 review kept the sheet fill `#fff` and left print CSS to this change. The screen ring and the `#worksheet-home` justify toggle stay screen-only concerns.

## What We're NOT Doing

- A PDF download, a print server, or storing the sheet after the dialog closes.
- Turning browser headers and footers off from CSS. The parent turns those off in the dialog and leaves margins at Default. Minimum or Custom margins are not the pass bar.
- Shrinking the maze so it still fits when those headers are left on.
- A character, difficulty levels, last-used parameters, or child profiles.
- Changing the generator, the 13 by 16 grid, or the on-screen sheet.
- Restyling auth pages, moving product colors into global tokens, or replacing Generuj with a shadcn button.
- Judging whether a crayon fits the passage. This slice checks one page, no crop, and the 10mm inset.

## Implementation Approach

Teach the home page to print as A4 with a zero page margin, and size the existing sheet to 210mm by 297mm so its inset is the 10mm. Hide screen chrome only while printing. Then add Drukuj, shown only after a maze exists, calling `window.print()`.

Phase 1 lands the print layout so a browser print command already yields one card. Phase 2 adds the control that opens that dialog. Screen layout stays.

## Critical Implementation Details

`@page { size: A4; margin: 0 }` is required. The 10mm is the SVG inset, not a second page margin. Put that rule in an unscoped style on the home worksheet only. `global.css` must not gain `@page`, or `/auth/signin` would print as A4 too.

The column is `max-w-xl` and the sheet is `w-full`. In print, the sheet has to be 210mm by 297mm even though that column is narrower on screen. Hide the screen ring in print so it is not an extra frame on the paper.

In print, `#worksheet-home` drops `min-h-screen` (`min-height: 0`) and `html, body` drop the `height: 100%` from [src/layouts/Layout.astro](src/layouts/Layout.astro). A screen-tall minimum under a 297mm sheet prints a blank second page. Do that in the home page’s unscoped print style. Leave the on-screen classes and `Layout.astro` unchanged. Hide the buttons from that same style: Generuj is inside the React island, and a scoped Astro style does not reach it.

## Phase 1: Print layout

### Overview

Printing `/` after a maze exists yields one A4 page of the white sheet. The screen does not change.

### Changes Required:

#### 1. Home page print rule

**File**: [src/components/WorksheetHome.astro](src/components/WorksheetHome.astro)

**Intent**: This route prints as one A4 page with no extra page margin, and screen chrome drops out of the print. Auth routes never receive the rule.

**Contract**: An unscoped style on this component sets `@page` size to A4 and margin to 0. In print, the heading, the purpose sentence, the buttons, the main padding, and the `max-w-xl` cap do not take space. The same style sets `min-height: 0` on `#worksheet-home` and `height: auto` on `html, body`, so the screen-tall minimum does not spill a blank second page. `src/styles/global.css` and [src/layouts/Layout.astro](src/layouts/Layout.astro) stay unchanged. On screen, `min-h-screen` stays.

#### 2. Sheet print size

**File**: [src/components/WorksheetGenerator.tsx](src/components/WorksheetGenerator.tsx)

**Intent**: The SVG that already represents the A4 card becomes that physical page while printing, and the screen ring does not print.

**Contract**: In print, the sheet is 210mm wide and 297mm tall. On screen it stays `aspect-[210/297]` and `w-full`. The ink ring is screen-only. Maze geometry (`PAGE_WIDTH`, insets, cell size) stays.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes
- `npx astro check` passes
- `npm test` passes
- The A4 `@page` rule with margin 0 lives on the home worksheet, and `src/styles/global.css` has no `@page` rule
- Print CSS hides the heading, the purpose sentence, and the buttons, and sizes the sheet to 210mm by 297mm

#### Manual Verification:

- With margins left at Default and headers and footers off, print preview of a generated maze is one A4 page of the white sheet only: maze, Start, and Meta
- The printed maze is the same size as the on-screen sheet, with at least 10mm of white inside the sheet edge
- On screen, the heading, purpose sentence, Generuj, and paper background stay; before the first click there is no sheet; `/auth/signin` is unchanged

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Drukuj button

### Overview

The parent opens the Phase 1 dialog from the page. Drukuj exists only once a sheet exists.

### Changes Required:

#### 1. Print control

**File**: [src/components/WorksheetGenerator.tsx](src/components/WorksheetGenerator.tsx)

**Intent**: After a successful generate, the parent can open the browser print dialog without using the browser menu. Before that, the page does not offer a print of an empty screen.

**Contract**: When `maze` is set, an enabled button named Drukuj is rendered with Generuj and calls `window.print()`. It uses the same sage pill as Generuj. When `maze` is null, that button is not rendered. Phase 1 print CSS still hides both buttons on paper.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes
- `npx astro check` passes
- `npm test` passes
- After a maze exists, the page has an enabled button named Drukuj and still has Generuj; before the first maze, Drukuj is absent

#### Manual Verification:

- Clicking Drukuj opens the browser print dialog on the one-page sheet from Phase 1
- Before Generuj, no Drukuj control is visible

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- No new generator cases. `npm test` stays green because maze geometry does not change.

### Integration Tests:

- None. This repo has no browser runner. The button and print-preview checks are manual, same as the S-01 sheet checks.

### Manual Testing Steps:

1. Open `/`. Confirm the heading, the purpose sentence, Generuj, and no sheet and no Drukuj.
2. Click Generuj. Confirm one sheet and an enabled Drukuj beside Generuj.
3. Open print preview with margins left at Default and headers and footers off. Confirm one A4 page, white sheet only, Start, Meta, and about 10mm of white inside the edge.
4. Confirm the maze in that preview matches the on-screen maze in size.
5. Open `/auth/signin` and print preview. Confirm it is still the starter screen, not an A4 worksheet.

## Performance Considerations

Print adds no generation work. The 5-second bound on showing a card is unchanged.

## Migration Notes

None. No stored sheets and no schema.

## References

- Roadmap slice: `context/foundation/roadmap.md` (S-02)
- Product bounds: `context/foundation/prd.md` (FR-004, FR-005, the 10mm and desktop-browser notes)
- Prior sheet: `context/archive/2026-09-28-first-printable-maze/plan.md`
- Sheet implementation: [src/components/WorksheetGenerator.tsx](src/components/WorksheetGenerator.tsx)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Print layout

#### Automated

- [x] 1.1 `npm run lint` passes
- [x] 1.2 `npx astro check` passes
- [x] 1.3 `npm test` passes
- [x] 1.4 The A4 `@page` rule with margin 0 lives on the home worksheet, and `src/styles/global.css` has no `@page` rule
- [x] 1.5 Print CSS hides the heading, the purpose sentence, and the buttons, and sizes the sheet to 210mm by 297mm

#### Manual

- [x] 1.6 With margins left at Default and headers and footers off, print preview of a generated maze is one A4 page of the white sheet only: maze, Start, and Meta
- [x] 1.7 The printed maze is the same size as the on-screen sheet, with at least 10mm of white inside the sheet edge
- [x] 1.8 On screen, the heading, purpose sentence, Generuj, and paper background stay; before the first click there is no sheet; `/auth/signin` is unchanged

### Phase 2: Drukuj button

#### Automated

- [ ] 2.1 `npm run lint` passes
- [ ] 2.2 `npx astro check` passes
- [ ] 2.3 `npm test` passes
- [ ] 2.4 After a maze exists, the page has an enabled button named Drukuj and still has Generuj; before the first maze, Drukuj is absent

#### Manual

- [ ] 2.5 Clicking Drukuj opens the browser print dialog on the one-page sheet from Phase 1
- [ ] 2.6 Before Generuj, no Drukuj control is visible
