---
change_id: gh174-sudoku-shapes-placement
title: Sudoku shapes list - no names, same gap and width as the grid
status: archived
created: 2026-10-30
updated: 2026-10-30
archived_at: 2026-10-30T15:52:25Z
---

## Notes

pracujemy nad github issue 174. używamy 10x skills. idz przez plan, potem review i implementacje

GitHub issue 174: "Sudoku z kształtami: lista pod planszą ma nazwy, jest za szeroka i za blisko" (label: bug).
Wanted: (1) no names under shapes, (2) gap grid-bottom -> shape list equals gap instruction bubble -> grid top (`SUDOKU_SHEET.instructionGap`), (3) shape list width equals grid width.
Code: `src/lib/sudoku/shape-list.ts` (`layoutSudokuShapeList`), `SudokuSheet` in `src/components/SudokuGenerator.tsx`, `src/lib/sudoku/sheet.ts`, `src/lib/sudoku/layout.ts`.
