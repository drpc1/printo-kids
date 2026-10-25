# Graphic dictation first printable (S-23) Implementation Plan

## Overview

A new card kind, "Dyktando graficzne", on `/dyktando`. The parent clicks Generuj and gets an A4 sheet: one instruction sentence, a numbered list of commands ("3 →") in thin boxes, and an empty 14×17 grid with a start dot. Following the commands along the grid lines, the child draws the outer outline of an object from the symmetry template catalog (6 lat: half 6×15, whole 12×15). Covers US-17 and FR-026.

## Current State Analysis

- Card pages follow the symmetry pattern: `src/pages/symetria.astro` → `GeneratorShell` → `SymmetryGenerator` (`client:only="react"`); generator logic, sheet constants and layout live in `src/lib/symmetry/{generate,sheet,layout}.ts`.
- Objects come from `symmetryTemplatesFor("lat6")` (`src/lib/symmetry/templates.ts:492-504`); `composeSymmetryCard` returns the pattern half and its holes (`details`) (`src/lib/symmetry/generate.ts:84-110`).
- Of 20 variant combinations of the 6×15 templates, 18 pass the outline rule and they give 9 distinct outlines; commands per card 24–44 (research.md).
- The catalog is `CARD_KINDS` in `src/lib/cards.ts`; thumbnails are built from the real generators by `scripts/build-thumbnails.mjs`.
- `npm test` lists test files explicitly in `package.json`; the print contract (`src/lib/sheet/print-contract.test.ts`) and smoke (`scripts/smoke.mjs`) list each page.

## Desired End State

`/dyktando` is reachable from a catalog thumbnail. Generuj shows a card whose commands trace a closed, non-self-touching outline that returns to the dot; each Generuj gives a different outline than the previous card. Drukuj prints one A4 page with ≥10 mm margin, black, without the answer drawing. On a phone Generuj and Drukuj do not overlap. No "Postać" bar, no level button. lint, test, astro check and build pass.

### Key Discoveries:

- Variants that differ only in holes (rocket window, robot eyes, strawberry seeds) produce the same outline, so the "new card" check compares outlines (`templates.ts:94-97,132-135,173-178`).
- Strawberry leaves variant 1 touches by a corner and leaves a separate piece (`templates.ts:170`); the rule must reject it, not crash.
- `findHoles` in symmetry flood-fills from a padded ring (`generate.ts:126-166`); the dictation needs the same "holes filled" silhouette but over the whole object, so it has its own small flood fill or derives from `cells ∪ details` mirrored.

## What We're NOT Doing

- Levels 5 and 7 lat and a level button (S-25).
- Category choice (S-26) and new objects (S-21).
- Remembering anything in the profile or last-used parameters.
- Colors; the answer drawing on the page or in print.
- Changing symmetry templates to make more variants pass.

## Implementation Approach

Pure logic first (silhouette → rule → trace → commands → card), then a pure layout function that places commands and grid inside the margin, then the React page copying `SymmetryGenerator` without the level and colors controls. The thumbnail reuses the generator and layout so it cannot drift.

## Critical Implementation Details

- **Outline direction and start**: start vertex = top-left corner of the leftmost cell in the topmost row of the whole silhouette; walk clockwise on screen (y down), so the filled cell is always on the right-hand side and the first command is →. Merge consecutive unit steps of the same direction; because the start is a convex corner, the last command never has the same direction as the first.
- **Rule**: silhouette = filled cells ∪ holes, mirrored. Valid iff it is 4-connected and no grid vertex has exactly two diagonal filled cells (that is a corner touch of the outline). Under those two conditions the outer boundary is one simple closed curve; the trace must also check that it returns to start and that its edge count equals the total boundary-edge count.
- **S-21 overlap**: S-21 edits `templates.ts` in parallel. Read templates only via `symmetryTemplatesFor("lat6")` so its new objects arrive without code changes here.

## Phase 1: Dictation generator

### Overview

Pure functions for the dictation card under `src/lib/dictation/`, with tests.

### Changes Required:

#### 1. Level

**File**: `src/lib/dictation/levels.ts`

**Intent**: One level constant for 6 lat; S-25 adds the others.

**Contract**: `DictationLevel { id: "lat6"; label; columns: 14; rows: 17; cellSize: 11; templateLevel: SymmetryLevelId }` exported as `DICTATION_LEVEL_LAT6`.

#### 2. Outline

**File**: `src/lib/dictation/outline.ts`

**Intent**: Build the whole silhouette of a template variant with holes filled, check the outline rule, trace the clockwise outline from the start corner and merge it into commands.

**Contract**: `dictationSilhouette(template, variants): { width, height, cells: Set<string> | readonly Cell[] }` normalized to its bounding box; `outlineProblems(silhouette): ("disconnected" | "corner-touch")[]`; `traceOutline(silhouette): { start: {x, y}; commands: readonly DictationCommand[] }` where `DictationCommand = { direction: "right" | "left" | "up" | "down"; length: number }`; `walkCommands(start, commands)` returns the visited vertices (used by tests and the problem check).

#### 3. Card

**File**: `src/lib/dictation/generate.ts`

**Intent**: Enumerate every (template, variant) combination of the level once (memoized per level), keep those that pass the rule and have at most `DICTATION_MAX_COMMANDS` commands, dedupe by outline key, then pick uniformly among outlines whose key differs from the previous one; place the outline centered in the level grid (≥1 cell margin on each side). Null only when no other outline exists (plan review F1, F2). Also `dictationCardProblems(card)` re-checks the PRD rules on the finished card: returns to start, no repeated vertex, inside the grid with ≥1 cell margin, every command length ≥1, consecutive commands change direction, walking the commands draws exactly the silhouette boundary.

**Contract**: `DictationCard { levelId; columns; rows; cellSize; start: {col, row} (grid vertex); commands; outline: readonly {col,row}[] (cells of the silhouette, for checks only, never drawn); key: string (derived from commands) }`; `generateDictationCard(random, previousKey, level): DictationCard | null`; `dictationVariantCount(level): { total, passing, distinctOutlines }` for the PR note and tests.

#### 4. Tests

**Files**: `src/lib/dictation/outline.test.ts`, `src/lib/dictation/generate.test.ts`, `package.json` (`test` script)

**Intent**: Cover the rule (a corner-touch shape and a two-piece shape are rejected, a plain rectangle passes with 4 commands "w →, h ↓, w ←, h ↑"), holes are not traced (a ring traces like a filled square), merging, start corner and clockwise first command, every passing variant of today's templates yields a valid card, at least two distinct outlines pass (no exact counts: S-21 changes them, plan review F3), strawberry leaves variant 1 is rejected, two consecutive cards differ, no card exceeds `DICTATION_MAX_COMMANDS`, the generated card fits the 14×17 grid with ≥1 cell margin.

### Success Criteria:

#### Automated Verification:

- Dictation unit tests pass: `npm test`
- Lint passes: `npm run lint`

#### Manual Verification:

- The counts printed by `dictationVariantCount` match research.md (20 / 16 / 9) for today's templates

**Implementation Note**: Pause after automated verification for manual confirmation before Phase 2.

---

## Phase 2: Sheet layout

### Overview

Drawing constants and a pure layout of the instruction, the numbered command boxes and the grid on A4.

### Changes Required:

#### 1. Sheet constants

**File**: `src/lib/dictation/sheet.ts`

**Intent**: Shared drawing constants for page and thumbnail, like `SYMMETRY_SHEET`.

**Contract**: `DICTATION_SHEET { pageWidth 210, pageHeight 297, inset 10, instructionSize, instructionGap, instructionText: "Rysuj po liniach kratki według strzałek. Zacznij od kropki.", commandsPerRow: 11, commandRowHeight: 12, commandFontSize, commandNumberSize, commandBoxStroke, listGap, gridStroke, frameStroke, startDotRadius }`.

#### 2. Layout

**File**: `src/lib/dictation/layout.ts`

**Intent**: Place the instruction, command boxes (reading order, 11 per row, numbered from 1), and the grid centered across the page; center the whole block down the page inside the inset; throw when it does not fit.

**Contract**: `layoutDictationSheet(input: { pageWidth, pageHeight, inset, columns, rows, cellSize, commandCount, … }) → { page, instruction: {x,y}, commands: readonly { x, y, width, height }[], grid: { x, y, width, height } }`. `DICTATION_MAX_COMMANDS` (in `sheet.ts`, a constant whole number of rows × 11) is the largest count the 6 lat sheet fits; the generator imports it (plan review F2).

#### 3. Tests

**File**: `src/lib/dictation/layout.test.ts`, `package.json`

**Intent**: `DICTATION_MAX_COMMANDS` commands (≥44) + 14×17 at 11 mm fit inside the 10 mm margin; boxes are in reading order without overlap; the grid is centered and 154×187; too many commands throws.

### Success Criteria:

#### Automated Verification:

- Layout tests pass: `npm test`
- Lint passes: `npm run lint`

---

## Phase 3: Page and catalog

### Overview

The `/dyktando` page, the catalog entry and thumbnail, print contract, smoke.

### Changes Required:

#### 1. Page component

**File**: `src/components/DictationGenerator.tsx`

**Intent**: Copy the `SymmetryGenerator` structure (profile corner, hero Generuj before the first card, Generuj + Drukuj bar after, has-sheet toggle, failure note) without level and colors controls; `DictationSheet` draws the SVG from the layout: instruction, boxes with small numbers and bold "n →", grid lines, frame, start dot. Never draws the outline.

**Contract**: default export React component; SVG classes identical to the symmetry print classes (`print:h-[297mm] print:w-[210mm] …`), `aria-label="Dyktando graficzne"`; colors only via `var(--foreground)` / `var(--card)` / `var(--muted-foreground)`.

#### 2. Route and catalog

**Files**: `src/pages/dyktando.astro`, `src/lib/cards.ts`

**Intent**: The page mounts the component in `GeneratorShell`; the catalog gets `{ id: "dyktando", title: "Dyktando graficzne", href: "/dyktando", thumbnail: "/thumbnails/dyktando.svg" }`.

#### 3. Thumbnail

**Files**: `scripts/build-thumbnails.mjs`, `public/thumbnails/dyktando.svg`

**Intent**: A fixed-seed dictation card drawn with the same layout and constants, in literal black, like the other thumbnails.

#### 4. Contracts

**Files**: `src/lib/sheet/print-contract.test.ts`, `scripts/smoke.mjs`

**Intent**: The dictation page uses the shared shell and the print SVG classes; smoke requests `/dyktando` and finds the page sentence.

### Success Criteria:

#### Automated Verification:

- All checks pass: `npm run lint`, `npm test`, `npx astro check`, `npm run build`
- Thumbnail regenerates byte-identical: `npm run thumbnails` leaves `git status` clean after the committed run

#### Manual Verification:

- The catalog shows the "Dyktando graficzne" thumbnail and opens `/dyktando`
- Generuj shows a card; following the commands from the dot on the screen draws the object's outline and returns to the dot
- Print preview shows one A4 page, margin ≥10 mm, no outline drawn
- At phone width (375 px) Generuj and Drukuj do not overlap and the card fits the width

---

## Testing Strategy

### Unit Tests:

- Outline rule, trace, merge, start, direction (Phase 1); layout fit and order (Phase 2); print contract (Phase 3).

### Manual Testing Steps:

1. Open `/`, click "Dyktando graficzne".
2. Click Generuj several times: the outline changes every time.
3. Trace one card by hand on screen; it closes at the dot.
4. Print preview in Chrome: one page, margin, no answer.
5. Phone width: buttons separate, card visible.

## Performance Considerations

At most a few dozen tiny grids per Generuj; far below the 5 s budget.

## References

- Research: `context/changes/graphic-dictation-first-printable/research.md`
- Mockup of command layout (chosen: B): `context/changes/graphic-dictation-first-printable/mockup-commands.html`
- Pattern: `src/components/SymmetryGenerator.tsx`, `src/lib/symmetry/layout.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Dictation generator

#### Automated

- [x] 1.1 Dictation unit tests pass: `npm test` — 14f7170
- [x] 1.2 Lint passes: `npm run lint` — 14f7170

#### Manual

- [ ] 1.3 The counts printed by `dictationVariantCount` match research.md (20 / 16 / 9) for today's templates

### Phase 2: Sheet layout

#### Automated

- [x] 2.1 Layout tests pass: `npm test`
- [x] 2.2 Lint passes: `npm run lint`

### Phase 3: Page and catalog

#### Automated

- [ ] 3.1 All checks pass: `npm run lint`, `npm test`, `npx astro check`, `npm run build`
- [ ] 3.2 Thumbnail regenerates byte-identical: `npm run thumbnails` leaves `git status` clean after the committed run

#### Manual

- [ ] 3.3 The catalog shows the "Dyktando graficzne" thumbnail and opens `/dyktando`
- [ ] 3.4 Generuj shows a card; following the commands from the dot on the screen draws the object's outline and returns to the dot
- [ ] 3.5 Print preview shows one A4 page, margin ≥10 mm, no outline drawn
- [ ] 3.6 At phone width (375 px) Generuj and Drukuj do not overlap and the card fits the width
