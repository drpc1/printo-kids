---
change_id: gh164-fix-sudoku-phone-view
title: Sudoku liczbowe na iPhonie: cyfry przy górnej krawędzi komórki
status: archived
created: 2026-10-30
updated: 2026-10-30
archived_at: 2026-10-30T12:46:47Z
---

## Notes

zaczynamy pracę nad github issue 164

GitHub issue 164: cyfry sudoku liczbowego na iPhonie (Chrome, Brave = WebKit) siedzą przy górnej krawędzi komórki, na stronie i na wydruku. `SudokuSheet` w `src/components/SudokuGenerator.tsx` używa `<text>` z `dominantBaseline="central"`, które WebKit ignoruje; rozmiar to `cellSize * SUDOKU_SHEET.digitScale` (0.6, `src/lib/sudoku/sheet.ts`). Cel: cyfra na środku komórki na stronie i na wydruku; sudoku obrazkowe bez zmian.
