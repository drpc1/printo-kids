---
change_id: gh363-copy-drawing-fill
researched: true
last_updated: 2026-11-13
last_updated_by: claude
last_updated_note: initial research
---

# Research: GitHub #363 — "Skopiuj rysunek" fill vs nonogram

## Question

After PR #362 (top-aligned block), is the remaining gap between copy-drawing's
page-height fill (43–49%) and nonogram's (61%+, same grid sizes) worth closing with
code, and if so how — per the issue's three options (smaller grid / different
layout / accept)?

## Evidence

### The layout is width-bound, not height-bound, and is already at its width limit on the hard level

`layoutCopyDrawingSheet` ([src/lib/copy-drawing/layout.ts:33-77](../../../src/lib/copy-drawing/layout.ts)) places two
equal grids side by side. `COPY_DRAWING_SHEET` ([src/lib/copy-drawing/sheet.ts](../../../src/lib/copy-drawing/sheet.ts)):
`pageWidth: 210, inset: 10, gridGap: 10`, so usable width is 190 mm for two grids plus one 10 mm gap, i.e. 180 mm for
the grids themselves, 90 mm per grid.

`COPY_DRAWING_LEVELS` ([src/lib/copy-drawing/levels.ts:30-51](../../../src/lib/copy-drawing/levels.ts)) reuses the
nonogram grid sizes (`NONOGRAM_SIZES`, [src/lib/nonogram/sizes.ts:29-66](../../../src/lib/nonogram/sizes.ts)):
`latwy` 8×12 cols/rows, `sredni` 12×15, `trudny` 18×24; `cellSize` 10/7/5 mm respectively.

Width-bound max cell = `90 / columns`: latwy 11.25 mm (using 10), sredni 7.5 mm (using 7), trudny 5.0 mm (using 5 —
already exactly at the limit; `layout.test.ts` has a dedicated test "the hard level fills exactly 190 mm of width").

Computed fill (grid height ÷ available height under the instruction band, with a character,
`instructionBoxHeight = 26`, `bandGap = 6`, so available height = 297 − 10 − 10 − 26 − 6 = 245 mm):

| Level  | current cell | current fill | fill at width-bound max cell |
| ------ | ------------ | ------------ | ---------------------------- |
| latwy  | 10 mm        | 49.0%        | 55.1% (cell 11.25)           |
| sredni | 7 mm         | 42.9%        | 45.9% (cell 7.5)             |
| trudny | 5 mm         | 49.0%        | 49.0% (already at the limit) |

This matches the issue's own "43–49% current, only →49% at the width limit" measurement. Bumping `cellSize` to the
width-bound maximum closes at most 6 percentage points (latwy) and nothing at all on the hard level, far short of
nonogram's 61%+; the issue's own comment already draws this conclusion ("samo powiększanie nie wystarczy").

### Stacking the two grids (one above the other) is worse, confirmed by recomputation

Stacked layout: width-bound cell = `180 / columns` (full width, one grid), height-bound cell =
`(available height − gridGap) / (2 × rows)`. For `trudny` (18×24): width-bound = 10.0 mm, height-bound =
`(245 − 10) / 48` ≈ 4.90 mm → binding constraint drops from 5.0 mm (side-by-side) to 4.90 mm (stacked), i.e. stacking
makes the hard level's cell _smaller_, not larger. This matches the issue's own conclusion and this research does not
find a counter-case among the three levels (sredni stacked: height-bound `(245-10)/30` ≈ 7.83 mm vs side-by-side 7.5
mm width-bound — stacking helps sredni slightly, but still hurts trudny, the level the issue explicitly flags).

### The grid sizes are not copy-drawing's own value to shrink — they are the shared template catalog's sizes

`CopyDrawingLevel.size` is `NonogramSize`, not an independent grid
([src/lib/copy-drawing/levels.ts:9-19](../../../src/lib/copy-drawing/levels.ts)): `sizeById` pulls straight from
`NONOGRAM_SIZES`. Each `NonogramSize` carries a `templateLevel: SymmetryLevelId`
([src/lib/nonogram/sizes.ts:24](../../../src/lib/nonogram/sizes.ts)), and `SymmetryLevelId` has exactly four values —
`"lat4" | "lat5" | "lat6" | "lat7"` ([src/lib/symmetry/levels.ts:3](../../../src/lib/symmetry/levels.ts)) — each tied
to one fixed half-grid resolution (4×12, 6×15, …, per `prd.md` "Karta symetrii" table). `lat4` (half 4×12, whole
8×12) is already the smallest template resolution that exists; there is no smaller template set to drop down to.
Shrinking copy-drawing's grid below 8×12 would require drawing an entirely new, lower-resolution template catalog
used by no other card — breaking the "jeden katalog szablonów" sharing that FR-028/US-19 rely on to make each new
template object pay off three cards (symmetry, nonogram, dyktando) at once, and that copy-drawing itself reuses
as a fourth consumer (`prd.md` Business Logic "Karta „Skopiuj rysunek na kratce""").

### The side-by-side, equal-grid layout is itself a confirmed, recent PRD decision, not an incidental default

`prd.md` US-27 acceptance criteria and Business Logic "Karta „Skopiuj rysunek na kratce"" record: "Kratki stoją obok
siebie na każdym poziomie, bez numerów wierszy i kolumn... decyzja 2026-11-09 po makiecie" and give the exact
arithmetic that was approved: "2 × 18 × 5 mm + odstęp 10 mm = 190 mm". The current `layoutCopyDrawingSheet` and
`COPY_DRAWING_LEVELS` values are a direct implementation of that approved mockup decision, re-asserted by
`layout.test.ts`'s own named test ("the grids are equal, side by side, 10 mm apart and on the same height"; "the hard
level fills exactly 190 mm of width"). Replacing the layout (issue option 2) would reopen that settled, mockup-backed
decision, not just tune a value.

### PR #362 already fixed the complaint this issue's title describes

Per the background and `git log`, #362 changed `layoutCopyDrawingSheet` from a vertically centered block to one
anchored at the top margin (commit f288e25 / merge #361, and the preceding fix/copy-drawing-top-aligned branch). The
issue's own text confirms: "#362 (wyrównanie do góry, scalone) zostaje w mocy niezależnie od wyboru — rozwiązuje
'zaczyna się w połowie', nawet jeśli samo wypełnienie strony zostaje niższe niż w nonogramie." The remaining gap is
purely a fill-percentage cosmetic difference from nonogram, not the "starts mid-page" defect #362 fixed.

## Unresolved / not investigated further

- Whether a fourth option (e.g., a dedicated lower-resolution template set just for copy-drawing, or a layout that
  is not two equal side-by-side grids but still satisfies US-27's intent) is worth a new mockup round — out of scope
  for this research; the PRD's own Open Questions 13 (closed 2026-11-09) already anticipated exactly this trade-off
  ("jeśli wydruk pokaże, że 5 mm na trudnym jest za mało, trudny wraca do planu z siatką 12×15") and ties any further
  change to print-based evidence that the _cell is too small to use_, not to a page-fill percentage gap with another
  card.

## Addendum (2026-11-13): vertical centering

After mockups confirmed the width-bound cellSize bump and ruled out stacking (see above), the user requested a
second, independent change mid-session: align the card's vertical placement with sudoku's. DOM measurement of the
running dev server confirmed `layoutSudokuSheet` and `layoutNonogramSheet` both center their instruction+grid
block down the page (`top = inset + (availableHeight - blockHeight) / 2`), while `layoutCopyDrawingSheet`
(post-#362, commit f288e25) pins it to the top margin instead. `prd.md`'s own Business Logic text for this card
("polecenie z kratkami tworzy jeden blok wyśrodkowany też w pionie, jak na nonogramie", decision dated
2026-11-10) already documented the centered rule — PR #362 (2026-11-13) changed the code without updating this
PRD sentence, leaving code and docs out of sync. Reverting `blockTop` to the centering formula (Phase 2 of
`plan.md`) brings the code back in line with the pre-existing PRD text, not just the user's live request.

## Addendum 2 (2026-11-13): the centering fix overshot; fixed offset instead

The Phase 2 centering change above (matching `layoutSudokuSheet`'s formula literally) was implemented, then
checked against the rebuilt catalog thumbnails (`node --experimental-strip-types scripts/build-thumbnails.mjs`,
which renders this card, sudoku and nonogram from their real generators/layouts at their real default settings).
Measured instruction y: copy-drawing ≈89 mm, sudoku ≈59–69 mm, nonogram ≈48 mm — the centering formula pushed
copy-drawing noticeably _deeper_ than either reference, because its block (two side-by-side, width-bound grids)
is much shorter than sudoku's or nonogram's single tall grid, and the centering formula's offset grows as the
block shrinks. This effectively reproduced the original "starts mid-page" complaint. Corrected to a fixed
`topOffset: 40` mm (not derived from this card's own blockHeight) in `COPY_DRAWING_SHEET`, landing the instruction
at y≈53.5 mm — in the same neighborhood as sudoku/nonogram, not flush at the 10 mm margin like the fully
top-anchored cards (maze, sequences, money, …), and not deep-centered. See `plan.md` Phase 2 for the final
implementation.

## Addendum 3 (2026-11-13): card renamed to "Skopiuj obrazek"

Separate, user-requested change bundled into the same PR: the card's display name "Skopiuj rysunek na kratce" was
shortened to "Skopiuj obrazek" ("na kratce" was redundant — every card in the catalog is drawn on a grid). See
`plan.md` Phase 3. Scoped to live, user-facing references (`src/`, `tests/e2e/`, `context/foundation/prd.md`);
`context/archive/**`, `roadmap.md`'s historical slice narrative, `shape-notes.md` and `test-plan.md` keep the old
name as a historical record of the slice that shipped under it.

## Sources

- [src/lib/copy-drawing/layout.ts](../../../src/lib/copy-drawing/layout.ts)
- [src/lib/copy-drawing/sheet.ts](../../../src/lib/copy-drawing/sheet.ts)
- [src/lib/copy-drawing/levels.ts](../../../src/lib/copy-drawing/levels.ts)
- [src/lib/copy-drawing/layout.test.ts](../../../src/lib/copy-drawing/layout.test.ts)
- [src/lib/nonogram/sizes.ts](../../../src/lib/nonogram/sizes.ts)
- [src/lib/symmetry/levels.ts](../../../src/lib/symmetry/levels.ts)
- `context/foundation/prd.md` — US-27, Business Logic "Karta „Skopiuj rysunek na kratce"", Open Questions 13
- GitHub issue drpc1/printo-kids#363 (full text + 2026-11-13 comment)
