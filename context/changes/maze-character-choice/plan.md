# Maze character choice Implementation Plan

## Overview

S-03 lets the parent pick one character from a supplied set of three, or keep none, and shows that choice at the maze start. The three drawings already sit in `public/characters/`. This plan knocks out their white field, adds a choice window, and places the chosen figure beside the word Start.

## Current State Analysis

`/` explains the tool, generates a solvable maze, and prints one A4 sheet. `WorksheetGenerator` holds only `maze`. Generuj calls `generateMaze` in the browser and paints the sheet when `countPaths` is 1. The sheet is an SVG in a 210 by 297 user space with a 10-unit inset. For a 13 by 16 maze, the entrance gap is the missing north wall of column 6, about 14.6 user units wide, centered at x=105. The top label band is about 21.6 user units tall. The word Start is centered in that band. Meta sits in the matching band below the grid.

`public/characters/` contains `samochodzik.jpg`, `rakieta.jpg`, and `dinozaur.jpg`. `src/components/ui/` contains only `Button`. Print CSS in `WorksheetHome.astro` hides `#worksheet-home` headings, paragraphs, and buttons, and the action row is `print:hidden`. `@page` is A4 with margin 0.

## Desired End State

On arrival the choice control reads „Bez postaci”. Generuj still draws a maze, and that sheet shows the word Start centered on the entrance, with no figure.

Opening the control shows a window. „Bez postaci” is the selected row. Three more rows show a small icon and the name beside it: Samochodzik, Rakieta, Dinozaur. Choosing a row updates the control. If a sheet is already on the page, the figure changes immediately and the walls stay. Choosing „Bez postaci” again removes the figure and puts Start back in the center.

On the sheet the figure is 20 user units wide and tall, centered on the entrance, so it is wider than the gap and still inside the top band. The word Start sits immediately to its right, in that same band. Meta is unchanged. The control and the window do not print. The printed sheet matches the figure on screen.

**Addendum (2026-10-04):** A character is a 30-unit PNG centered on the entrance, sitting on the top of the grid so it does not cover corridor cells. No character keeps the word Start centered on the entrance. Meta is unchanged.

### Key Discoveries:

- Entrance and Start live in `src/components/WorksheetGenerator.tsx` (`LABEL_COLUMN` 6, Start text around the label-band center). Generation of the gap is `src/lib/maze/generate.ts:41-42`.
- A JPG cannot store transparency. The page must use a PNG. The JPGs stay in the same folder as the source drawings.
- Print hiding matches `h1`, `p`, and `button` inside `#worksheet-home` (`src/components/WorksheetHome.astro:41-45`). A dialog portaled to `document.body` is outside that subtree.
- Shared UI is added with the shadcn catalog (`components.json`, new-york). The worksheet must not invent a second button style.
- Start and Meta `fontFamily` stays `ui-sans-serif, system-ui, sans-serif`.

## What We're NOT Doing

- A parent-supplied file. That is US-02, parked outside MVP.
- Removing auth, the dashboard, or the starter smoke test. That is `remove-starter-scaffold`, deferred.
- Difficulty levels, last-used parameters, or child profiles.
- Redrawing or restyling the three pictures beyond removing the outer white field.
- Changing the generator, the 13 by 16 grid, Meta, `@page`, or the Generuj and Drukuj pills.

**Addendum (2026-10-04):** After a maze exists, the home blurb hides, the title shrinks, Generuj becomes outline, and Drukuj stays the filled pill. Empty state still uses a filled Generuj.
- A legal opinion. Shipping these three files accepts the roadmap’s „rights do not block S-03” line. The PRD block before publishing stays written and is not cleared here.

## Implementation Approach

Keep selection in the worksheet island, separate from `generateMaze`. The closed control is a button that shows the current choice and opens a dialog from `src/components/ui/`. The dialog lists „Bez postaci” and the three characters. The sheet reads that choice. No character means today’s centered Start. A character means a 20-unit image centered on the entrance and the word Start to its right. Assets are transparent PNGs next to the existing JPGs.

**Addendum (2026-10-04):** No character means today’s centered Start. A character means a 30-unit PNG on the entrance, above the first corridor, and no Start word. Assets are the phase 1 PNGs only.

## Critical Implementation Details

- **White field:** Remove only the outer white. Cream fills inside the car, rocket, and dinosaur stay. A single near-white threshold that eats cream fails this phase.
- **Print:** The opener is a `button` inside `#worksheet-home`, so the existing print rule hides it. Dialog content is portaled outside that element, so the window itself needs `print:hidden` even when closed content would otherwise be absent. An open window must not appear on the printed page. Screen-only `#worksheet-home.has-maze` padding is more specific than the print `padding: 0` and must be reset in `@media print`, or the 297 mm sheet overflows onto blank pages. `@page` stays unchanged.
- **Start position:** With no character, Start stays on the entrance center. With a character, the image takes that center and Start moves to the right of the image. Do not leave Start centered underneath the figure.

**Addendum (2026-10-04):** With no character, Start stays on the entrance center. With a character, the 30-unit image takes that center and Start is not drawn.

## Phase 1: Transparent character files

### Overview

Produce a transparent PNG for each of the three drawings. The JPGs remain where they are.

### Changes Required:

#### 1. Character assets

**File**: `public/characters/`

**Intent**: Give the sheet an image that does not paint a white square, without redrawing the pictures.

**Contract**: Add `samochodzik.png`, `rakieta.png`, and `dinozaur.png` beside the existing JPGs of the same names. Each PNG shows the same drawing as its JPG. The outer white field is transparent. Cream interior fills remain. The page does not use the JPGs as the sheet or dialog source.

**Addendum (2026-10-04):** The JPGs were local knockout sources. After the PNGs shipped they were removed; only the PNGs remain in `public/characters/`.

### Success Criteria:

#### Automated Verification:

- `public/characters/samochodzik.png`, `public/characters/rakieta.png`, and `public/characters/dinozaur.png` exist, and the three JPGs of the same names are still in that folder
- `npm run lint` exits 0

#### Manual Verification:

- On a non-white backdrop, each PNG shows the drawing with no outer white rectangle, and cream parts of the drawing are still filled

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Choice dialog

### Overview

The parent can open a window, see „Bez postaci” selected, and pick a named character. Nothing is drawn on the maze yet.

### Changes Required:

#### 1. Dialog primitive

**File**: `src/components/ui/dialog.tsx`

**Intent**: Add the missing shared window from the existing catalog so the worksheet does not hand-roll one.

**Contract**: Add the dialog with `npx shadcn@latest add dialog`. The file lives under `src/components/ui/` and uses the role tokens already published in `src/styles/global.css`. Do not add a new color token.

#### 2. Worksheet choice

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Let the parent choose none or one of the three characters before or after Generuj, without generating a maze from that click.

**Contract**: State is the selection, default none, independent of `maze`. The closed control is a `button` in the print-hidden action area. Its label is „Bez postaci” until a character is chosen, then a small icon plus „Samochodzik”, „Rakieta”, or „Dinozaur”. The icon uses the phase 1 PNG and is about 40px, smaller than the 20-unit sheet mark. The window’s first row is „Bez postaci”, selected by default. The other rows are the same three names, each with the small icon to the left of the name. Choosing a row updates the selection and closes the window. The window content is `print:hidden`. This phase does not add an SVG image.

**Addendum (2026-10-04):** The closed control is a ghost line `Postać: {name} ▾` with a ~24px icon, not a second primary pill. Dialog rows still use ~40px icons.

### Success Criteria:

#### Automated Verification:

- `src/components/ui/dialog.tsx` exists
- `npm run lint` exits 0
- `npm test` exits 0

#### Manual Verification:

- A fresh load shows the control labeled „Bez postaci”
- The window lists „Bez postaci” and three rows with a small icon and the name beside it
- Choosing Dinozaur shows that name and icon on the closed control
- A print preview does not show the control or the window
- Generuj still shows a maze whose start is the word Start and no figure

**Note (2026-10-04):** Progress 2.4 title is unchanged. On a fresh load the closed control reads `Postać: Bez postaci`.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Character beside Start

### Overview

The selected figure appears on the sheet, wider than the entrance. Changing the choice updates the figure and leaves the maze in place. With no character the sheet shows centered Start.

### Changes Required:

#### 1. Sheet mark

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Put the chosen character on the entrance. With no character, keep the centered Start word.

**Contract**: `MazeSheet` reads the selection. None draws the word Start centered on `LABEL_COLUMN` 6 in the top label band (`INSET_Y + labelBand / 2`), same `fontFamily` and size as Meta, and no image. A character draws the phase 1 PNG at 30 by 30 user units, centered on that column, sitting on the top of the grid (`originY - 30`) so it does not cover corridor cells, and does not draw Start. The image is wider than the entrance gap of `(210 - 20) / 13` user units. Meta, wall geometry, and Meta `fontFamily` are unchanged. Changing the selection does not call `generateMaze`. Returning to „Bez postaci” removes the image and restores centered Start.

**Addendum (2026-10-04):** Replaces the earlier 20-unit figure-plus-Start contract. Progress 3.3, 3.4, and 3.6 titles stay as written; 3.3 and 3.6 mean centered Start with no image; 3.4 means a 30 mm figure with no Start beside it.

### Success Criteria:

#### Automated Verification:

- `npm run lint` exits 0
- `npm test` exits 0

#### Manual Verification:

- With „Bez postaci”, the generated sheet shows centered Start and no image
- A chosen figure is about 30mm on the A4 sheet, centered on the entrance, wider than the gap, sitting above the first corridor, with no Start word
- Choosing another character swaps the figure and leaves the walls unchanged
- Choosing „Bez postaci” removes the figure and restores centered Start
- The printed page matches that sheet and does not show the choice control or window

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- `npm test` stays the maze generator file. This change does not add generator cases. The suite must still pass because `generate.ts` is untouched.

### Integration Tests:

- No new HTTP smoke coverage. The starter smoke test still walks auth and is out of scope.

### Manual Testing Steps:

1. Load `/`. Confirm the control says `Postać: Bez postaci`. Open the window and confirm the four rows.
2. Generuj. Confirm centered Start and no figure.
3. Choose Samochodzik. Confirm a ~30mm figure on the entrance above the corridors, no Start word, and the walls did not change.
4. Choose Rakieta, then Dinozaur, then „Bez postaci”. Confirm the sheet follows each choice and Start returns only for none.
5. Print with a character selected and again with none. Confirm one A4 page, Meta still present, and no choice UI.

## Performance Considerations

Selection and the sheet update stay in the browser. The three PNGs are small local files. No new request carries an image.

## Migration Notes

No stored character preference exists yet. A reload starts again at „Bez postaci”. Remembering the last choice is S-04.

## References

- Related research: `context/changes/maze-character-choice/research.md`
- Sheet and Start: `src/components/WorksheetGenerator.tsx`
- Entrance gap: `src/lib/maze/generate.ts:41-42`
- Print hide rules: `src/components/WorksheetHome.astro:21-45`
- Start slot left for this slice: `context/archive/2026-09-28-first-printable-maze/plan-brief.md:51`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Transparent character files

#### Automated

- [x] 1.1 `public/characters/samochodzik.png`, `public/characters/rakieta.png`, and `public/characters/dinozaur.png` exist, and the three JPGs of the same names are still in that folder — 26c9560
- [x] 1.2 `npm run lint` exits 0 — 26c9560

#### Manual

- [x] 1.3 On a non-white backdrop, each PNG shows the drawing with no outer white rectangle, and cream parts of the drawing are still filled — 26c9560

### Phase 2: Choice dialog

#### Automated

- [x] 2.1 `src/components/ui/dialog.tsx` exists — 102d918
- [x] 2.2 `npm run lint` exits 0 — 102d918
- [x] 2.3 `npm test` exits 0 — 102d918

#### Manual

- [x] 2.4 A fresh load shows the control labeled „Bez postaci” — 102d918
- [x] 2.5 The window lists „Bez postaci” and three rows with a small icon and the name beside it — 102d918
- [x] 2.6 Choosing Dinozaur shows that name and icon on the closed control — 102d918
- [x] 2.7 A print preview does not show the control or the window — 102d918
- [x] 2.8 Generuj still shows a maze whose start is the word Start and no figure — 102d918

### Phase 3: Character beside Start

#### Automated

- [x] 3.1 `npm run lint` exits 0
- [x] 3.2 `npm test` exits 0

#### Manual

- [x] 3.3 With „Bez postaci”, the generated sheet shows centered Start and no image
- [x] 3.4 A chosen figure is about 20mm on the A4 sheet, centered on the entrance, wider than the gap, with Start immediately on its right, both in the top band, and no corridor covered
- [x] 3.5 Choosing another character swaps the figure and leaves the walls unchanged
- [x] 3.6 Choosing „Bez postaci” removes the figure and restores centered Start
- [x] 3.7 The printed page matches that sheet and does not show the choice control or window
