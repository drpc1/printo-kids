# Print sheet contract — Plan Brief

> Full plan: `context/changes/print-sheet-contract/plan.md`

## What & Why

The worksheet already draws an A4 maze with Meta and a character, and it already has print CSS. Nothing proves that Chrome keeps it on one page, that the maze keeps a 10 mm margin, or that the character stays at the entrance. This change adds that proof. Edge, Firefox, and Safari wait until the Chrome proof is green.

## Starting Point

`/` generates a 13 by 16 maze into an SVG of 210 by 297 with a 10-unit inset. Meta is under the exit. A chosen character is a 30 mm image on column 6, bottom on the maze top, top about 1.6 mm from the sheet edge. Bez postaci draws the word Start instead. `@page` is A4 with margin 0 on the home worksheet only. `npm test` runs the maze generator tests and does not mention the sheet.

## Desired End State

Chrome print preview, margins at Default and headers and footers off, shows one A4 page. The maze is unclipped, with at least 10 mm of white around it, and Meta is at the exit. The character is at the entrance; its high placement still passes. The same Node command fails if those coordinates or the print rules drift. The screen still shows the heading and the buttons. Edge, Firefox, and Safari then get the same preview check.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| What 10 mm covers | Maze walls and Meta, not the character ink | The 30 mm figure's top is about 1.6 mm from the sheet edge, and that placement stays |
| How page count is proved | Chrome print preview, not a browser runner | Node can see coordinates and CSS; it cannot see the preview's page count |
| How the rest is proved | One pure layout function plus a source check of the print rules, both on `npm test` | The sheet and the test must share the arithmetic, and a new file runs only if the test script names it |
| `@page` margin | Stays 0; 10 mm remains the SVG inset | A second 10 mm would shrink the maze |
| Other browsers | Manual Edge, Firefox, and Safari after Chrome is green | A good Chrome preview does not prove the other three, and an automated matrix is the wrong first print test |
| Dialog settings | Margins left at Default, headers and footers off | Minimum or Custom margins shrink the maze, and CSS cannot turn headers off |

## Scope

**In scope:**

- A shared sheet-layout function and Node tests for the 10 mm maze inset, Meta, the 30 mm character, and Start
- A Node test that the worksheet print CSS is one A4 page with margin 0 and hidden chrome
- Naming those tests in `npm test`
- A manual Chrome preview, then the same preview in Edge, Firefox, and Safari
- The test-plan row that points at this change

**Out of scope:**

- Playwright, pixel snapshots, and per-browser automation
- Shrinking the character or adding 10 mm to `@page`
- PDF, difficulty, profiles, generator changes, and auth or smoke tests

## Architecture / Approach

`src/lib/sheet/layout.ts` computes the page, the maze rectangle, Meta, and either Start or the character mark. `MazeSheet` renders that result. `layout.test.ts` calls the function with a 13 by 16 grid. `print-contract.test.ts` reads the worksheet sources and locks `@page` and the 210 mm by 297 mm print size. Chrome, then the other browsers, confirm the preview by hand.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Sheet geometry contract | Shared layout math and Node tests for inset, Meta, and the character | A test that demands 10 mm above the character fails the correct 30 mm mark |
| 2. Chrome print contract | Print-rule test plus one-page Chrome preview | Screen-only CSS looks fine while print spills a second page |
| 3. Other desktop browsers | The same preview in Edge, Firefox, and Safari | Starting them before Chrome is green, or treating Edge as Safari |

**Prerequisites:** The current sheet, character choice, and `node --test` runner. No new dependencies.
**Estimated effort:** One to two sessions for the tests and the Chrome check. Safari needs a machine that has it.

## Open Risks & Assumptions

- A home printer can still clip the top of the 30 mm figure. That stays outside this pass bar.
- Browsers differ when headers stay on. The pass bar keeps headers and footers off.
- If another browser spills a page, the fix is the shared print CSS, and Chrome is re-checked before that browser passes.

## Success Criteria (Summary)

- `npm test` locks a 13 by 16 sheet whose maze and Meta stay at least 10 mm from the page edges, with a 30 mm character on the entrance whose top may sit about 1.6 mm from the sheet edge.
- Chrome preview, Default margins, headers and footers off, is one A4 page, and the screen still shows the heading and buttons.
- Edge, Firefox, and Safari meet that preview bar only after the Chrome check is green.
