# First printable maze Implementation Plan

## Overview

S-01 makes the existing Generuj control produce a solvable maze and show it as one A4 sheet on `/`. The parent sees a new maze on every click. Print, a character, and difficulty levels stay out of this change.

## Current State Analysis

`/` already shows the product first paint. [src/pages/index.astro](src/pages/index.astro) mounts [src/components/WorksheetHome.astro](src/components/WorksheetHome.astro) inside the Polish, banner-free layout. The page is a centered column: the heading PrintoKids, the sentence `Wygeneruj labirynt i wydrukuj go na kartce A4.`, and a disabled button named Generuj. There is no sheet and no maze.

The button is inert static HTML. There is no maze module, no SVG worksheet, and no unit-test script. [package.json](package.json) scripts are dev, build, lint, format, and smoke. The `ci` job in [.github/workflows/ci.yml](.github/workflows/ci.yml) runs lint, `npx astro check`, and build. `scripts/smoke.mjs` only checks the auth flow and that `/` returns 200.

[tsconfig.json](tsconfig.json) includes `**/*` and maps `@/*` to `./src/*`. Node’s type stripping does not read those paths. `@types/node` is not installed, so a `node:test` file under `src/` would fail `astro check` until those types exist.

The roadmap and PRD already fix the product bounds this plan does not reopen: one path from entrance to exit, the maze drawn in the browser, the same check in tests and before the sheet is shown, Meta at the bottom, no maze API, and no print in this slice.

## Desired End State

Opening `/` still explains the tool. Generuj is enabled. Before the first click there is no sheet. After a click, one A4-proportion sheet appears on that page: a 13 by 16 maze, a gap in the top-center outer wall with the word Start above it, and a gap in the bottom-center outer wall with Meta below it. Another click replaces that sheet with a different maze. The sheet is painted only when the path count is exactly 1. `/auth/signin` stays the cosmic starter screen.

### Key Discoveries:

- The disabled Generuj button lives in [src/components/WorksheetHome.astro](src/components/WorksheetHome.astro) (lines 12–18). S-01 enables this control on the same page rather than adding a second one.
- `main` uses `min-h-screen` and `justify-center`. A sheet taller than the viewport will clip the heading unless that alignment changes once a maze exists.
- F-01 left the Montessori colors on this component only, and its review asked S-01 to reuse one source of truth. Auth pages must keep the global tokens.
- A perfect maze from a spanning tree is the check the PRD already requires: exactly one path. Kruskal is the chosen look (more junctions, shorter dead ends). The injected random function keeps that check deterministic in tests.

## What We're NOT Doing

- Print CSS, a print button, or a print dialog. That is S-02.
- A character, or removing the word Start. S-03 puts the character in this entrance and deals with the word then.
- Difficulty levels, last-used parameters, and child profiles.
- A maze API, a server generator, or storing the generated sheet.
- An empty A4 frame before the first successful click.
- A new test framework such as Vitest or Jest.
- Restyling auth pages or changing global shadcn color tokens.
- Translating the chosen label. The visible entrance word is `Start`.

## Implementation Approach

Keep generation in a pure TypeScript module with no DOM and no React. Randomized Kruskal builds a spanning tree on a 13 by 16 grid. The module takes `random` as an argument and never calls `Math.random` itself. `countPaths` counts simple paths from the entrance cell to the exit cell and stops when it finds a second path. Tests call that function with a seeded `random`. The page calls the same function and paints only when the result is 1.

The page stays Astro for the heading and the purpose sentence. A React island owns the enabled button and the SVG sheet, because the click has to change what is on the page. The sheet uses the A4 aspect ratio and a proportional 10 mm inset so a later print slice can use the same node. This slice does not add print styles.

13 columns is the grid that honors both planning answers. A 12-column grid has no single center cell; column 7 of 13 (index 6) is the center. At a true A4 size, after a 10 mm margin, a square cell is about 14.6 mm.

## Critical Implementation Details

- **User experience spec.** `justify-center` on a `min-h-screen` column clips the top when the content is taller than the viewport. Before a maze exists, keep the current centered composition and render no sheet. After a maze exists, align the column to the start, keep the current page padding, and let the heading, the button, and the sheet scroll into view.

## Phase 1: Generator and the single path

### Overview

Add the maze module, the path check, and a Node test script. No page change in this phase. The button stays disabled until Phase 2.

### Changes Required:

#### 1. Maze module

**File**: `src/lib/maze/generate.ts` (new)

**Intent**: Build a solvable 13 by 16 maze whose shape is a classic branched maze, and expose the check the page must use before it paints.

**Contract**: Export `generateMaze(random: () => number): Maze` and `countPaths(maze: Maze): number`. `Maze` is 13 columns by 16 rows. Each cell has four walls. Shared walls agree between neighbors. Every random choice uses the injected `random` only. Kruskal connects all 208 cells with no cycles. The entrance is row 0, column 6, with the north wall open. The exit is row 15, column 6, with the south wall open. `countPaths` counts simple paths between those two cells and returns as soon as a second path exists.

```ts
export function generateMaze(random: () => number): Maze
export function countPaths(maze: Maze): number
```

#### 2. Generator tests

**File**: `src/lib/maze/generate.test.ts` (new)

**Intent**: Lock the grid, the two openings, and the single path so a later UI change cannot paint an unchecked maze.

**Contract**: Import the module by the relative path `./generate.ts`, not `@/`. Use `node:test` and `node:assert/strict`. Drive `generateMaze` with more than one seeded function. For each seed, assert 13 by 16, the north opening on row 0 column 6, the south opening on row 15 column 6, and `countPaths === 1`. Include one maze with an extra knocked-down wall and assert `countPaths` is greater than 1.

#### 3. Test script and CI

**Files**: [package.json](package.json), [.github/workflows/ci.yml](.github/workflows/ci.yml)

**Intent**: Make the path check a command this repo runs locally and in CI, without adding a test framework.

**Contract**: Add a `test` script that runs `node --experimental-strip-types --test` on the explicit file `src/lib/maze/generate.test.ts`. Add `@types/node` as a devDependency so `astro check` can typecheck `node:test` under the existing `**/*` include. In the `ci` job, run `npm test` alongside `npm run lint`. Leave the smoke job as an auth check.

### Success Criteria:

#### Automated Verification:

- `npm test` passes, including more than one seeded maze that is 13 by 16, opens the north wall of row 0 column 6, opens the south wall of row 15 column 6, and has `countPaths` equal to 1
- `npm run lint` passes
- `npx astro check` passes
- The CI `ci` job runs `npm test`

**Implementation Note**: This phase has no manual check. Start Phase 2 when the automated checks pass.

---

## Phase 2: A4 sheet on the page

### Overview

Enable Generuj and, on a successful check, show one A4 sheet on `/`. A failed check does not change the sheet the parent already sees.

### Changes Required:

#### 1. Generator island

**File**: `src/components/WorksheetGenerator.tsx` (new)

**Intent**: Turn a click into one new maze and one sheet, using the Phase 1 check as the gate.

**Contract**: A React component with no Next.js directives. It renders a `<button type="button">` whose visible text is `Generuj` and which is not disabled. On each click, call `generateMaze(Math.random)` once and then `countPaths`. Paint or replace the sheet only when the count is 1. When the count is not 1, leave the previous sheet in place, or leave no sheet if this was the first click. Do not retry with another seed and do not add an error message. The sheet is an SVG whose user space is 210 by 297, with the same CSS aspect ratio, an inset of 10/210 of its width and 10/297 of its height, and square cells sized from the inner width inside that user space. A viewBox of the 13 by 16 grid is not used, because that would stretch the cells to the page. The word `Start` sits inside the inset, above the top opening, centered on column 6. The word `Meta` sits inside the inset, below the bottom opening, centered on column 6. Walls are drawn from the cell booleans. Combine classes with `cn()` from `@/lib/utils`.

#### 2. Home shell

**File**: [src/components/WorksheetHome.astro](src/components/WorksheetHome.astro)

**Intent**: Keep the purpose copy in Astro and let the island own the control and the sheet. Share the page colors without touching global tokens.

**Contract**: Remove the disabled Generuj button. Keep the `h1` text `PrintoKids` and the purpose sentence. Mount `WorksheetGenerator` with `client:load`. Define `--pk-paper: #F6F1E8`, `--pk-ink: #3F3A34`, and `--pk-sage: #7D8B74` on `main`, not in `:root`. The enabled button uses sage fill and paper text. Before a maze exists, keep `justify-center` and render no sheet frame. After a maze exists, follow the layout rule in Critical Implementation Details. [src/pages/index.astro](src/pages/index.astro) stays as it is.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes
- `npx astro check` passes
- `npm test` passes
- The home page renders an enabled button named Generuj and does not render a disabled Generuj button

#### Manual Verification:

- Clicking Generuj shows one A4-proportion sheet on the same page, with a maze, the word Start above the top opening, and Meta below the bottom opening
- Clicking Generuj again replaces that sheet with a different maze
- Before the first click there is no sheet, and `/auth/signin` still shows the cosmic starter screen
- A passage on the sheet is square, not stretched taller or wider to fill the page

**Implementation Note**: After the automated checks pass, pause for manual confirmation before treating the change as done.

---

## Testing Strategy

### Unit Tests:

- More than one seeded Kruskal maze is 13 by 16 and has exactly one simple path from the entrance cell to the exit cell.
- The north wall of row 0 column 6 is open, and the south wall of row 15 column 6 is open.
- An extra missing wall makes `countPaths` return a value greater than 1, and the count stops at the second path.
- The generator does not call `Math.random`; two calls with the same `random` sequence return the same walls.

### Integration Tests:

- `npx astro check` covers the new React island and the test file.
- `scripts/smoke.mjs` stays the auth check. It is not extended to maze copy.

### Manual Testing Steps:

1. Open `/`. Confirm the purpose sentence, an enabled Generuj button, no sheet, and no missing-Supabase banner.
2. Click Generuj. Confirm one sheet with A4 proportions, a branched maze, Start above the upper gap, Meta below the lower gap, and a passage that is square rather than stretched to the page.
3. Click Generuj again. Confirm the first maze is gone and a different one is shown.
4. Narrow the window and confirm the heading is still reachable by scrolling once the sheet is tall.
5. Open `/auth/signin` and confirm the cosmic starter screen is unchanged.

## Performance Considerations

A 208-cell spanning tree is synchronous work well under the PRD limit of 5 seconds from click to sheet. No worker, cache, or maze request.

## Migration Notes

No data migration. Auth routes, middleware, and stored sessions stay as they are. The disabled button is replaced on `/` only.

## References

- Roadmap S-01: [context/foundation/roadmap.md](context/foundation/roadmap.md)
- PRD US-01, FR-003, FR-004: [context/foundation/prd.md](context/foundation/prd.md)
- F-01 plan and the palette note: [context/changes/worksheet-page-shell/plan.md](context/changes/worksheet-page-shell/plan.md)
- Home route: [src/pages/index.astro](src/pages/index.astro)
- Home shell: [src/components/WorksheetHome.astro](src/components/WorksheetHome.astro)
- CI job: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- No frame brief and no research doc for this change

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Generator and the single path

#### Automated

- [x] 1.1 `npm test` passes, including more than one seeded maze that is 13 by 16, opens the north wall of row 0 column 6, opens the south wall of row 15 column 6, and has `countPaths` equal to 1 — 19cc6ca
- [x] 1.2 `npm run lint` passes — 19cc6ca
- [x] 1.3 `npx astro check` passes — 19cc6ca
- [x] 1.4 The CI `ci` job runs `npm test` — 19cc6ca

### Phase 2: A4 sheet on the page

#### Automated

- [x] 2.1 `npm run lint` passes
- [x] 2.2 `npx astro check` passes
- [x] 2.3 `npm test` passes
- [x] 2.4 The home page renders an enabled button named Generuj and does not render a disabled Generuj button

#### Manual

- [x] 2.5 Clicking Generuj shows one A4-proportion sheet on the same page, with a maze, the word Start above the top opening, and Meta below the bottom opening
- [x] 2.6 Clicking Generuj again replaces that sheet with a different maze
- [x] 2.7 Before the first click there is no sheet, and `/auth/signin` still shows the cosmic starter screen
- [x] 2.8 A passage on the sheet is square, not stretched taller or wider to fill the page
