---
change_id: gh163-page-title
title: Tytuł kartki przeglądarki to nazwa karty pracy
status: implemented
created: 2026-10-30
updated: 2026-10-30
archived_at: null
---

## Notes

GitHub issue 163: zaczynamy pracę.

W tytule kartki przeglądarki ma być nazwa karty pracy, a nie zawsze „PrintoKids”. Dziś każda strona przekazuje `title="PrintoKids"` do `src/layouts/Layout.astro` (katalog `src/pages/index.astro` oraz labirynt, symetria, sudoku, sekwencje, nonogram, dyktando graficzne). Strona karty ma w tytule jej nazwę z katalogu (Labirynt, Symetria, Sudoku, Sekwencje, Nonogram, Dyktando graficzne); katalog na `/` zostaje „PrintoKids”. Źródło: uwaga z używania kart, 2026-10-28.
