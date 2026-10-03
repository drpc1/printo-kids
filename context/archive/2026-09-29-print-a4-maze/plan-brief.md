# Print A4 maze — Plan Brief

> Full plan: `context/changes/print-a4-maze/plan.md`

## What & Why

The parent can already generate a solvable maze and see it as an A4-shaped card. They still cannot send that card to the printer. This slice opens the browser print dialog on that card and makes the paper one A4 page.

## Starting Point

`/` shows the purpose, an enabled Generuj button, and — after a click — one white SVG sheet (`viewBox` 210×297) with a 10-unit inset, Start, and Meta. There is no print CSS, no print button, and no `window.print`. The sheet fill is white. Auth pages stay the cosmic starter.

## Desired End State

After Generuj, Drukuj sits with Generuj and opens the browser print dialog. With margins left at Default and headers and footers off, the preview is one A4 page of that same white sheet. The heading, the purpose sentence, and the buttons do not print. The maze is the same size as on screen, with at least 10mm of white inside the sheet edge.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| What prints | The white sheet only | FR-005 is the card; heading and buttons would steal the page | Plan |
| How print starts | Drukuj, only after a maze exists | The parent opens the browser dialog from the page | Plan |
| How 10mm is judged | Dialog margins at Default; headers and footers off; maze size unchanged | Minimum or Custom margins shrink the maze; CSS cannot turn headers off | Plan |
| `@page` margin | 0; the 10mm is the SVG inset | A second 10mm would shrink the maze | Plan |
| Where `@page` lives | Home worksheet only, not `global.css` | Sign-in must not become an A4 page | Plan |

## Scope

**In scope:**

- Print layout for one A4 sheet on `/`
- Drukuj control that calls `window.print()` after a maze exists
- Manual check in print preview with margins left at Default and headers and footers off

**Out of scope:**

- PDF download, storing the sheet, or disabling browser headers from CSS
- Shrinking the maze to survive default headers
- Character, difficulty, saved parameters, profiles, generator changes, auth restyle

## Architecture / Approach

The home page, and only that page, sets `@page` to A4 with margin 0. The existing SVG prints at 210mm by 297mm, so its inset is the margin. Screen chrome is hidden in print. That same print style sets the page height to the sheet, so `min-h-screen` does not add a blank second page. On screen the height stays. Drukuj is a second sage button beside Generuj, rendered only when a maze is on screen.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Print layout | Print preview is one A4 sheet; screen unchanged | A second page margin, or a global `@page`, shrinks the maze or restyles auth |
| 2. Drukuj button | Button after Generuj opens that dialog | Offering Drukuj before a sheet prints an empty page |

**Prerequisites:** S-01 done (sheet already on `/`).
**Estimated effort:** One session, two small phases.

## Open Risks & Assumptions

- Browsers still differ once headers stay on. This plan treats that as outside the pass bar.
- A printer’s unprintable edge can eat into a 0 page margin. The 10mm inset is the buffer the manual check looks for.
- Phase 1 can be checked from the browser’s own print command before Drukuj exists.

## Success Criteria (Summary)

- Print preview with margins left at Default and headers and footers off is one A4 page of the white sheet only.
- The maze matches the on-screen size, with at least 10mm of white inside the edge.
- Drukuj appears only after Generuj and opens that dialog. The screen and `/auth/signin` stay as they are.
