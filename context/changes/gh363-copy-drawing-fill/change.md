---
change_id: gh363-copy-drawing-fill
title: Decide and resolve copy-drawing page-fill vs nonogram (GitHub 363)
status: impl_reviewed
created: 2026-11-13
updated: 2026-11-13
archived_at: null
---

## Notes

GitHub issue drpc1/printo-kids#363. After PR #362 (top-aligned block), the "Skopiuj rysunek na kratce" card's two side-by-side grids still fill only 43-49% of the page height, vs 61%+ for nonogram at the same grid size (8x12/12x15/18x24), because the side-by-side layout is width-bound (190mm usable / 2 grids + 10mm gap) while nonogram's single grid is not. Issue comment (2026-11-13) lists three options:

1. Smaller grid (fewer columns/rows) on low levels — a Business Logic value change, not just layout.
2. Different page layout (not two identical grids side by side) — deeper architecture change.
3. Accept 43-49% fill; #362's top alignment already fixes the real complaint ("starts mid-page").

Issue already measured that maxing cellSize to the width limit only moves fill from 43%→49%, not to nonogram's 61%+, so option 1's naive form (bump cellSize) doesn't close the gap either — would need smaller grid dimensions, which conflicts with the shared template catalog (4x12/6x15/9x24 half-grids reused by symmetry/nonogram/dyktando, FR-028) unless a dedicated smaller template set is drawn for copy-drawing only.

Option 2 would reopen US-27 / Business Logic "Karta Skopiuj rysunek na kratce", whose side-by-side-two-equal-grids layout was explicitly confirmed by mockup on 2026-11-09 (decision in prd.md).

Decide in /10x-plan whether 1, 2, 3, or a 4th option is right; document the decision and its trade-off explicitly since this is not a pure bug fix.
