# Print Sheet Contract Implementation Plan

## Overview

Prove the existing A4 worksheet in Chrome: one page, at least 10 mm of white around the maze, the word Meta at the exit, and the selected character at the entrance. Lock the checkable parts in the current Node test runner. Check Edge, Firefox, and Safari by hand only after that Chrome preview is green.

## Current State Analysis

The sheet already exists. `WorksheetGenerator` draws one SVG in a 210 by 297 user space, with a 10-unit inset, the word Meta under the exit, and a 30-unit character sitting on the entrance. `WorksheetHome.astro` prints that SVG at 210 mm by 297 mm and sets `@page` to A4 with margin 0. Nothing in the repo asserts page size, the inset, Meta, the character, or the print rules. `npm test` runs only `src/lib/maze/generate.test.ts`.

The 30 mm figure's top sits about 1.6 mm from the top of the sheet. That is accepted. The 10 mm bar applies to the maze walls and to Meta, not to the character ink.

### Key Discoveries:

- Page box and inset live in `src/components/WorksheetGenerator.tsx` (`PAGE_WIDTH` 210, `PAGE_HEIGHT` 297, `INSET_X` / `INSET_Y` 10, `CHARACTER_MARK_SIZE` 30). The maze rectangle, Meta anchor, and mark position are computed in `MazeSheet` (about lines 172–184 and 196–227).
- Print rules live only on the home worksheet: `@page { size: A4; margin: 0; }` and the print resets in `src/components/WorksheetHome.astro` (lines 21–24 and 46–74). `src/styles/global.css` has no `@page`.
- The grid is 13 by 16 with the entrance in column 6 (`src/lib/maze/generate.ts`). Left and right insets are exactly 10. The maze top and bottom sit further in, because the label bands share the leftover height.
- `package.json` script `test` is `node --experimental-strip-types --test` pointed at one file. A new `*.test.ts` does not run until that script names it. CI already runs `npm test` (`.github/workflows/ci.yml`).
- Prior print and character slices already chose this geometry. This change proves it. The pass bar for 10 mm was judged in the browser print dialog with margins left at Default and headers and footers off (`context/archive/2026-09-29-print-a4-maze/plan-brief.md`).

## Desired End State

A parent generates a maze, chooses a character, and opens Chrome's print preview with margins at Default and headers and footers off. The preview is one A4 page. The maze is not clipped. White inside the sheet edge is at least 10 mm around the maze, and Meta sits at the exit at least 10 mm from the page edges. The character is centered on the entrance, 30 mm tall, with its bottom on the maze top. Its top, about 1.6 mm from the sheet edge, still passes.

`npm test` fails if that geometry changes, if `@page` gains a margin, if the printed sheet is no longer 210 mm by 297 mm, or if print starts showing the heading and buttons. The on-screen page still shows the heading and the controls. Edge, Firefox, and Safari meet the same preview bar only after the Chrome check is green.

### Key Discoveries:

- The Node runner can prove coordinates and the print CSS rules. It cannot prove the browser's page count. Page count stays a manual Chrome preview.
- Screen and print share one SVG. The difference is the print CSS, so the print test has to read those rules, not a screenshot of the screen.
- `src/lib/maze/generate.test.ts` is the pattern: `node:test`, `node:assert/strict`, and a relative import that ends in `.ts`.

## What We're NOT Doing

- Playwright, Puppeteer, pixel snapshots, or a browser matrix as the print test
- Shrinking the 30 mm character, or moving it down so its top clears 10 mm
- A second 10 mm margin on `@page`, or moving `@page` into `src/styles/global.css`
- PDF download, turning off browser headers from CSS, difficulty, saved parameters, profiles, or generator changes
- Measuring a physical printer's unprintable edge
- New auth, dashboard, or smoke assertions
- An automated check that the parent understands the screen

## Implementation Approach

Move the sheet arithmetic into one pure function under `src/lib/sheet/`. The React sheet renders from that result, and a Node test calls the same function with a 13 by 16 grid. A second Node test reads the worksheet sources and locks the print rules that keep the job on one A4 page. Chrome print preview remains the proof of page count. Other browsers repeat that preview later, with no new runner.

The test script must name every new test file. `node --experimental-strip-types` stays. The node test imports `./layout.ts`. The component may import `@/lib/sheet/layout`.

## Critical Implementation Details

- **Timing.** Phase 3 waits until the Chrome manual checks in Phase 2 are marked done. A shared print-rule edit in Phase 3 sends the Chrome preview back through those same checks before the edited browser can pass.
- **Margin arithmetic.** For a 13 by 16 grid the character top is `mazeTop - 30`, about 1.6 mm, which is inside the page and inside the 10 mm band. A test that requires the mark's top to be at least 10 fails a correct sheet. A test that requires the maze rectangle or the Meta anchor to clear 10 mm is the bar.
- **Where Safari runs.** Desktop Safari is not on this Windows workspace. The Safari check is done on a machine that has it. Chrome or Edge does not stand in for it.

## Phase 1: Sheet geometry contract

### Overview

One layout function feeds the sheet and the tests. The tests prove the A4 box, the 10 mm maze inset, Meta, and the character at the entrance.

### Changes Required:

#### 1. Sheet layout function

**File**: `src/lib/sheet/layout.ts`

**Intent**: Give the sheet and the tests one place that computes the page box, the maze rectangle, Meta, and the start mark, so a test failure means the drawn sheet moved.

**Contract**: The function takes page width 210, page height 297, inset 10, grid columns and rows, entrance column, mark size 30, and whether a character is selected. It returns the page box, the maze rectangle, the Meta anchor with the text `Meta`, and either a Start label or a character mark rectangle. It does not load images or know React. The entrance column stays 6, matching the maze generator.

#### 2. Sheet renders from that function

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Remove the duplicated inset math from `MazeSheet` so the on-screen sheet and the test cannot drift apart.

**Contract**: `MazeSheet` gets coordinates and the strings `Meta` and `Start` from the layout function. A selected character still draws the chosen PNG in the mark rectangle (30 by 30, centered on column 6, bottom edge on the maze top). `Bez postaci` still draws `Start` and does not draw an image. Wall drawing, the character catalog, and `window.print()` stay as they are.

#### 3. Layout tests

**File**: `src/lib/sheet/layout.test.ts`

**Intent**: Lock the geometry the parent sees, including the accepted character exception.

**Contract**: Follow `src/lib/maze/generate.test.ts`: `node:test`, `node:assert/strict`, relative `./layout.ts` import. For a 13 by 16 grid, assert the page is 210 by 297; the maze rectangle is at least 10 from each page edge (left and right exactly 10); the Meta anchor is on the entrance column, in the band below the grid, and at least 10 from each page edge; a selected character yields a 30 by 30 mark centered on that column whose bottom equals the maze top and whose top is at least 0. Do not assert that the mark's top is at least 10. With no character, assert the Start label on that column in the upper band and no mark.

#### 4. Run the new test with the product gate

**File**: `package.json`

**Intent**: `npm test` is the product gate. A file it does not name does not protect the sheet.

**Contract**: Keep `node --experimental-strip-types --test`. Add `src/lib/sheet/layout.test.ts` beside the existing maze file. Do not point the script at auth or smoke tests.

#### 5. Point the test strategy at this change

**File**: `context/foundation/test-plan.md`

**Intent**: The phase 2 row of the strategy table should name this folder so the next phase does not open a second change.

**Contract**: In the §3 table, the row whose goal is one A4 page in Chrome sets Change folder to `print-sheet-contract`. Leave the other rows alone.

### Success Criteria:

#### Automated Verification:

- `npm test` passes and covers the 13 by 16 sheet: maze inset at least 10 mm on every side, Meta at least 10 mm from the page edges, a 30 mm character centered on column 6 with its bottom on the maze top, Start when no character is selected, and no requirement that the character top clear 10 mm
- `npm run lint` passes

#### Manual Verification:

- On screen, after Generuj with a character selected, the figure sits at the entrance and Meta sits at the exit
- Bez postaci shows Start in the upper band and still shows Meta
- The phase 2 row in `context/foundation/test-plan.md` names `print-sheet-contract`

**Implementation Note**: After the automated checks pass, pause for the manual screen check before Phase 2.

---

## Phase 2: Chrome print contract

### Overview

Lock the print CSS that distinguishes the printed page from the screen, then prove in Chrome's preview that the result is one A4 page.

### Changes Required:

#### 1. Print-rule test

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Catch a sheet that looks right on screen and spills or shrinks in print, without launching a browser.

**Contract**: The test reads `src/components/WorksheetHome.astro`, `src/components/WorksheetGenerator.tsx`, and `src/styles/global.css` from disk. It requires `@page` with `size: A4` and `margin: 0` on the worksheet, and no `@page` in `global.css`. It requires the printed SVG to be 210 mm wide and 297 mm tall, with overflow hidden. It requires print to hide the heading, the purpose line, and the controls, and requires the screen-only padding tweak to stay inside `@media screen`. Resolve paths from the test file, not from the process working directory.

#### 2. Include the print test in `npm test`

**File**: `package.json`

**Intent**: The print rules join the same gate as the geometry.

**Contract**: Add `src/lib/sheet/print-contract.test.ts` to the existing `test` script. Keep the maze file and the layout file.

### Success Criteria:

#### Automated Verification:

- `npm test` passes the print-rule contract: worksheet `@page` is A4 with margin 0, `global.css` has no `@page`, the sheet prints at 210 mm by 297 mm, and print hides the heading, purpose line, and controls
- `npm run lint` passes

#### Manual Verification:

- Chrome print preview, with margins left at Default and headers and footers off, is exactly one A4 page
- The maze is not clipped, white inside the sheet edge around the maze is at least 10 mm, and Meta is visible at the exit
- The selected character is at the entrance, and a top about 1.6 mm from the sheet edge still passes
- On screen, the heading and the buttons stay visible

**Implementation Note**: After the automated checks pass, pause for the Chrome preview. Do not start Phase 3 until those manual checks are done.

---

## Phase 3: Other desktop browsers

### Overview

Repeat the same preview in Edge, Firefox, and Safari. Start only after Phase 2's Chrome checks are green. Add no browser runner.

### Changes Required:

#### 1. Shared print rules, only if a browser fails

**File**: `src/components/WorksheetHome.astro` and the print classes on the sheet in `src/components/WorksheetGenerator.tsx`

**Intent**: If Edge, Firefox, or Safari shows a second page or clips the maze, fix the shared rule that Chrome already uses.

**Contract**: Keep `@page` margin at 0 and keep the 10 mm inset in the layout function. Do not add a per-browser stylesheet as the first fix. Do not shrink the character. After any edit, the Phase 2 print-rule test still passes, and the Chrome preview is checked again before the failing browser can pass. No code change is required when all three previews already pass.

### Success Criteria:

#### Automated Verification:

- `npm test` still passes

#### Manual Verification:

- Edge print preview, with margins at Default and headers and footers off, is one A4 page, the maze is unclipped, Meta is at the exit, and the character is at the start
- Firefox print preview meets that same bar
- Safari print preview meets that same bar, on a machine that has desktop Safari

**Implementation Note**: Pause after Phase 2. Check the three browsers only then. Safari on a Mac is a separate sitting from this Windows workspace.

---

## Testing Strategy

### Unit Tests:

- Layout: 13 by 16 page box, four-side maze inset, Meta anchor, character mark, Start without a character, character top allowed inside the 10 mm band
- Print rules: `@page` placement and margin, 210 mm by 297 mm print size, chrome hidden only in print

### Integration Tests:

- No browser runner. `npm test` is the automated gate and already runs in CI.

### Manual Testing Steps:

1. Run the app, choose Samochodzik (or Rakieta or Dinozaur), generate a maze, and confirm the figure and Meta on screen.
2. Switch to Bez postaci and confirm Start replaces the figure and Meta stays.
3. In Chrome, open Drukuj. Set margins to Default and turn headers and footers off. Confirm one A4 page, an unclipped maze, at least 10 mm of white around the maze, Meta at the exit, and the character at the entrance.
4. Close the dialog and confirm the heading and buttons are back on screen.
5. After that Chrome check is green, repeat step 3 in Edge, Firefox, and Safari.

## Performance Considerations

The layout function is the arithmetic `MazeSheet` already runs once per render. No new assets and no print-time measurement.

## Migration Notes

Nothing is stored. Existing on-screen sheets pick up the shared function on the next render. There is no saved worksheet to migrate.

## References

- Strategy row for this change: `context/foundation/test-plan.md` (§2 risks 2, 3, and 5; §3 phase 2)
- Product bar: `context/foundation/prd.md` (one A4 page, 10 mm margin, Meta, character at the start)
- How 10 mm was judged: `context/archive/2026-09-29-print-a4-maze/plan-brief.md`
- Why the 30 mm figure may sit about 1.6 mm from the top: `context/archive/2026-10-04-maze-character-choice/reviews/impl-review.md` (Fix A)
- Sheet and print CSS: `src/components/WorksheetGenerator.tsx`, `src/components/WorksheetHome.astro`
- Runner pattern: `src/lib/maze/generate.test.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Sheet geometry contract

#### Automated

- [x] 1.1 `npm test` passes and covers the 13 by 16 sheet: maze inset at least 10 mm on every side, Meta at least 10 mm from the page edges, a 30 mm character centered on column 6 with its bottom on the maze top, Start when no character is selected, and no requirement that the character top clear 10 mm — 9860679
- [x] 1.2 `npm run lint` passes — 9860679

#### Manual

- [x] 1.3 On screen, after Generuj with a character selected, the figure sits at the entrance and Meta sits at the exit — 9860679
- [x] 1.4 Bez postaci shows Start in the upper band and still shows Meta — 9860679
- [x] 1.5 The phase 2 row in `context/foundation/test-plan.md` names `print-sheet-contract` — 9860679

### Phase 2: Chrome print contract

#### Automated

- [x] 2.1 `npm test` passes the print-rule contract: worksheet `@page` is A4 with margin 0, `global.css` has no `@page`, the sheet prints at 210 mm by 297 mm, and print hides the heading, purpose line, and controls — 2096c85
- [x] 2.2 `npm run lint` passes — 2096c85

#### Manual

- [x] 2.3 Chrome print preview, with margins left at Default and headers and footers off, is exactly one A4 page — 2096c85
- [x] 2.4 The maze is not clipped, white inside the sheet edge around the maze is at least 10 mm, and Meta is visible at the exit — 2096c85
- [x] 2.5 The selected character is at the entrance, and a top about 1.6 mm from the sheet edge still passes — 2096c85
- [x] 2.6 On screen, the heading and the buttons stay visible — 2096c85

### Phase 3: Other desktop browsers

#### Automated

- [x] 3.1 `npm test` still passes

#### Manual

- [x] 3.2 Edge print preview, with margins at Default and headers and footers off, is one A4 page, the maze is unclipped, Meta is at the exit, and the character is at the start
- [ ] 3.3 Firefox print preview meets that same bar
- [ ] 3.4 Safari print preview meets that same bar, on a machine that has desktop Safari
