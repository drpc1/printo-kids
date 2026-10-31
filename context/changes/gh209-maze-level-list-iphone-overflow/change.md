---
change_id: gh209-maze-level-list-iphone-overflow
title: Lista poziomów labiryntu przepełnia dialog na iPhone 13
status: impl_reviewed
created: 2026-10-31
updated: 2026-10-31
archived_at: null
---

## Notes

GitHub #209: workflow `e2e-phone` (WebKit, `iphone-13`) pada na `tests/e2e/phone-layout.spec.ts:499` ("the maze level list fits the screen with all six rows and no scrolling"). Dialog listy poziomów ma 18 px przepełnienia, test wymaga 0. Prawdopodobna przyczyna: trzecia linia wiersza z typowym wiekiem (US-22, 2026-10-26). Niezależne od #224 (Stryker).
