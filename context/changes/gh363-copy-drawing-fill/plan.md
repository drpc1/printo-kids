# GitHub #363 — "Skopiuj rysunek" page fill Implementation Plan

## Overview

Close GitHub issue [drpc1/printo-kids#363](https://github.com/drpc1/printo-kids/issues/363): after PR #362 fixed
the "starts mid-page" complaint, the "Skopiuj rysunek na kratce" card's two side-by-side grids still fill only
43–49% of the available page height, vs 61%+ for nonogram at the same grid size. This plan raises each level's
cell size to the maximum the 190 mm page width allows for two equal grids side by side, and otherwise closes the
issue as resolved: no layout or template-catalog change.

## Current State Analysis

`layoutCopyDrawingSheet` ([src/lib/copy-drawing/layout.ts](../../../src/lib/copy-drawing/layout.ts)) places two
equal grids side by side inside the 190 mm usable width (210 mm page − 2×10 mm margin). `COPY_DRAWING_LEVELS`
([src/lib/copy-drawing/levels.ts](../../../src/lib/copy-drawing/levels.ts)) reuses the nonogram grid sizes
(8×12 / 12×15 / 18×24 columns×rows) with cell sizes 10 / 7 / 5 mm. The width-bound maximum cell for two grids plus
a 10 mm gap is `90 / columns` mm: 11.25 mm (latwy), 7.5 mm (sredni), 5.0 mm (trudny — already exactly there, per
the existing `layout.test.ts` case "the hard level fills exactly 190 mm of width"). See
`research.md` for the full derivation, the stacked-layout comparison (confirmed worse on 2 of 3 levels, matching
the issue's own analysis and the 2026-11-09 mockup decision already recorded in `prd.md` for US-27), and
`mockup.mts` / `mockups.html` in this folder for the rendered comparison that informed the decision below.

### Key Discoveries:

- `trudny`'s cell is already at the width limit; only `latwy` and `sredni` have room to grow.
- `CopyDrawingLevel.size` is literally `NonogramSize` ([levels.ts:9-19](../../../src/lib/copy-drawing/levels.ts)) —
  the grid dimensions are not copy-drawing's own value, they're shared with nonogram/symmetry/dyktando via the
  template catalog, so shrinking the grid (not just the cell) is out of scope here (see research.md).
- No test or e2e spec hard-codes the `10 mm` / `7 mm` literal outside `levels.test.ts` and `layout.test.ts`
  ([src/lib/copy-drawing/levels.test.ts:17-21](../../../src/lib/copy-drawing/levels.test.ts),
  [src/lib/copy-drawing/layout.test.ts:27](../../../src/lib/copy-drawing/layout.test.ts)); both need updating.
- `layoutCopyDrawingSheet` already tolerates a fractional-mm `cellSize` (used today only in test fixtures,
  e.g. `layout.test.ts`'s `7.5` / `7.6` / `13.2` / `13.3` cases) — no code change needed to support `sredni`'s new
  `7.5` mm value.

## Desired End State

`latwy` renders at 11 mm cells (was 10), `sredni` at 7.5 mm (was 7), `trudny` unchanged at 5 mm. The grid block's
share of the available page height rises from 49.0%→53.9% (latwy) and 42.9%→45.9% (sredni); `trudny` stays at
49.0% (already at its width limit). The side-by-side layout, grid count and template catalog are unchanged.
`prd.md`'s Business Logic table and Open Questions 13 document the new cell sizes and the reasoning for not going
further (template-catalog and layout-architecture constraints). Issue #363 is closed with a comment summarizing
the decision.

**Verification**: `npm test` (updated `levels.test.ts` / `layout.test.ts` expectations), `npm run build`, and a
visual check of the three printed levels (reusing `tests/e2e/copy-drawing.spec.ts`'s existing margin assertions,
which are size-agnostic).

## What We're NOT Doing

- Not shrinking the grid dimensions (columns/rows) on any level — that needs a new, smaller template catalog
  entry shared by no other card, which is a disproportionate scope increase for a page-fill cosmetic gap.
- Not changing the side-by-side layout to a stacked ("pod") or other arrangement — already evaluated by mockup on
  2026-11-09 (recorded in `prd.md` US-27 / Business Logic) and reconfirmed worse or negligible by this change's own
  `mockup.mts`: stacking shrinks the cell on `latwy` (9.75 mm vs 11.25 mm bound) and `trudny` (4.85 mm vs 5.0 mm),
  and visually introduces a large fixed gap between the two stacked grids.
- Not touching `nonogram`'s own cell sizes or layout — this issue is scoped to copy-drawing only.
- Not pursuing full parity with nonogram's 61%+ fill — physically unreachable for two equal grids sharing one
  page width without a smaller grid (see above); documented as a closed, accepted trade-off in `prd.md`.

## Implementation Approach

Two small, independent changes: (1) raise `latwy`/`sredni` cell sizes to the width limit (Phase 1), and (2) align
`layoutCopyDrawingSheet`'s vertical placement with the rule `layoutSudokuSheet` and `layoutNonogramSheet` already
use — the block (instruction + grids) centered down the page, not pinned to the top margin (Phase 2). Phase 2
reverts the core of PR #362 (commit f288e25): the user, after comparing the top-anchored card to sudoku live,
asked for the card to use the same vertical rule as sudoku rather than a copy-drawing-only top-anchor special
case; the issue's own "do sprawdzenia" section had already flagged this comparison as worth making. Phase 1's
larger cells reduce the empty-block problem that motivated #362 in the first place. No new logic, no new component
code, no Stryker scope (pure data/layout values, not new validation logic).

## Phase 1: Raise latwy and sredni cell sizes to the width limit

### Overview

Update the two affected `cellSize` values, update the tests that assert the old literals, and update `prd.md`.

### Changes Required:

#### 1. Copy-drawing level cell sizes

**File**: `src/lib/copy-drawing/levels.ts`

**Intent**: Raise `latwy`'s `cellSize` from `10` to `11` and `sredni`'s from `7` to `7.5`, the width-bound maximum
for two equal side-by-side grids (minus a small safety margin on `latwy`: bound is 11.25, using 11 keeps 0.25 mm
of slack). `trudny` stays `5` (already exactly at its 5.0 mm bound).

**Contract**: `COPY_DRAWING_LEVELS[0].cellSize === 11`, `COPY_DRAWING_LEVELS[1].cellSize === 7.5`,
`COPY_DRAWING_LEVELS[2].cellSize === 5` (unchanged). `layoutCopyDrawingSheet` already throws if a cell doesn't fit
(see `layout.ts:43-47`), so an out-of-bounds value would fail loudly rather than silently clip — no code change
needed there.

#### 2. Levels unit test

**File**: `src/lib/copy-drawing/levels.test.ts`

**Intent**: Update the literal assertion to match the new cell sizes.

**Contract**: The test (currently "the cells are 10, 7 and 5 mm") asserts `[11, 7.5, 5]`; rename the test title to
match.

#### 3. Layout unit test

**File**: `src/lib/copy-drawing/layout.test.ts`

**Intent**: Update the test that pins "the cell is the nominal one: 10, 7 and 5 mm" to the new values, and verify
the per-level margin/fit assertions still hold (they're computed from `level.size`/`level.cellSize`, not hard-coded,
so only the literal-value test and its title need edits).

**Contract**: Test title and assertion become "the cell is the nominal one: 11, 7.5 and 5 mm" (or equivalent),
comparing against `level.cellSize` per level as today — no other assertions in this file reference the old
literals directly.

#### 4. PRD Business Logic and Open Questions 13

**File**: `context/foundation/prd.md`

**Intent**: Update the "Karta „Skopiuj rysunek na kratce”" cell-size table (`10 mm` → `11 mm`, `7 mm` → `7.5 mm`)
and append a closing note to Open Questions 13 recording that #363 raised both cells to the two-grid width limit,
that full parity with nonogram's fill is not pursued (template-catalog and layout reasons), and that the
side-by-side layout decision from 2026-11-09 is reconfirmed.

**Contract**: Business Logic table row for `łatwy`/`średni` cell sizes updated; Open Questions 13 gets one more
sentence under its existing paragraph (it is already "closed", so this is an addendum, not a reopening).

### Success Criteria:

#### Automated Verification:

- `npm test` passes with updated `levels.test.ts` and `layout.test.ts`
- `npm run lint` passes
- `npm run depcruise` passes
- `npx astro check` passes
- `npm run build` passes

#### Manual Verification:

- Generate a `latwy` and a `sredni` copy-drawing card in the preview and confirm both grids are visibly larger
  than before and still fully inside the printed margin (no clipping, no overlap with the instruction band)
- Confirm `trudny` is visually unchanged

---

## Phase 2: Center the instruction/grid block down the page, like sudoku and nonogram

### Overview

Revert `layoutCopyDrawingSheet`'s top-anchored `blockTop` (introduced by PR #362) back to the vertically-centered
formula `layoutSudokuSheet` and `layoutNonogramSheet` already use, per the user's explicit request to align the
card's vertical rule with sudoku's.

### Changes Required:

#### 1. Copy-drawing layout

**File**: `src/lib/copy-drawing/layout.ts`

**Intent**: Replace `const blockTop = sheet.inset;` with the centered-down-the-page formula
(`sheet.inset + (areaBottom - sheet.inset - blockHeight) / 2`, where `blockHeight = instructionBoxHeight +
sheet.bandGap + height`), matching `layoutSudokuSheet`'s `top = inset + (pageHeight - inset * 2 - blockHeight) / 2`
and `layoutNonogramSheet`'s equivalent. Update the function's doc comment accordingly.

**Contract**: `band.y` and the grids' `y` move down the page by `(areaBottom - sheet.inset - blockHeight) / 2`
relative to today; horizontal centering, the fixed `bandGap` between instruction and grids, and the
margin/overflow checks are unchanged.

#### 2. Layout unit test

**File**: `src/lib/copy-drawing/layout.test.ts`

**Intent**: Replace the test asserting `band.y === 10` (top-anchored) with one asserting the block is centered
down the page (`topGap === bottomGap`, mirroring `nonogram/layout.test.ts`'s "the block is centered across and
down the page").

**Contract**: New/renamed test: "the instruction and the grids are one block centered across and down the page,
the grids 6 mm under the instruction" — asserts horizontal centering (as before) and
`band.y - 10 === 287 - (source.y + source.height)` (vertical centering) instead of `band.y === 10`.

### Success Criteria:

#### Automated Verification:

- `npm test` passes with the updated centering test
- `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` all pass

#### Manual Verification:

- In the dev preview, generate a copy-drawing card at each level and a sudoku card, and confirm both now leave a
  visually similar (not necessarily pixel-identical) empty band above and below their content block, instead of
  copy-drawing's content hugging the top margin while sudoku's is centered
- Confirm the printed margin (10 mm) still holds at every level (reuses `tests/e2e/copy-drawing.spec.ts:138`)

---

## Testing Strategy

### Unit Tests:

- `levels.test.ts`: new cell-size literals
- `layout.test.ts`: new nominal-cell literal; existing margin/fit/throw assertions are size-agnostic and need no
  change beyond the literal

### Manual Testing Steps:

1. Open `/skopiuj-rysunek` (or the current copy-drawing route), generate a card at each of the three levels, and
   visually compare grid size/fill against the `mockup.mts` "obok-max" renders in this change folder
2. Confirm the 10 mm print margin still holds at `latwy`/`sredni` (reuses the existing e2e assertion, no new test
   needed since the assertion is already size-agnostic per `tests/e2e/copy-drawing.spec.ts:138`)

## Performance Considerations

None — static value change.

## Migration Notes

None — no persisted data references these cell sizes; they're read fresh on every render.

## References

- Research: `context/changes/gh363-copy-drawing-fill/research.md`
- Mockups: `context/changes/gh363-copy-drawing-fill/mockup.mts`, `mockups.html`
- GitHub issue: drpc1/printo-kids#363

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands.

### Phase 1: Raise latwy and sredni cell sizes to the width limit

#### Automated

- [x] 1.1 `npm test` passes with updated `levels.test.ts` and `layout.test.ts`
- [x] 1.2 `npm run lint` passes
- [x] 1.3 `npm run depcruise` passes
- [x] 1.4 `npx astro check` passes
- [x] 1.5 `npm run build` passes

#### Manual

- [x] 1.6 latwy and sredni cards visibly larger, still inside the printed margin
- [x] 1.7 trudny visually unchanged

### Phase 2: Center the instruction/grid block down the page, like sudoku and nonogram

#### Automated

- [x] 2.1 `npm test` passes with the updated centering test
- [x] 2.2 `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` all pass

#### Manual

- [x] 2.3 copy-drawing and sudoku both leave a symmetric empty band above/below their block
- [x] 2.4 printed margin (10 mm) holds at every level (verified by `layout.test.ts`'s margin assertions, which stayed green for every level)
