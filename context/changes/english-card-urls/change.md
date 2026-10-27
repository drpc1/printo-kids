---
change_id: english-card-urls
title: Adresy podstron kart po angielsku
status: implementing
created: 2026-10-27
updated: 2026-10-27
archived_at: null
---

## Notes

github issue #123 zaplanujmy pracę nad tą zmianą. Czy mogę ją robić niezależnie od S31 czy trzeba poczekać aż tamta praca bedzie skonczona?

Issue: https://github.com/drpc1/printo-kids/issues/123
Tytuł: Adresy podstron po angielsku

- `/labirynt` → `/maze`
- `/symetria` → `/symmetry`
- `/sekwencje` → `/sequences`
- `/dyktando` → `/dictation`

`/sudoku` i `/nonogram` zostają. Katalog na `/` zostaje. Stary polski adres otwiera tę samą kartę. Napisy na kartach zostają po polsku. Smoke i testy katalogu sprawdzają nowe adresy.

S-31 (`favorite-character-explicit`) nie jest warunkiem tej zmiany. S-28 i S-30 są już zrobione, więc S-31 też nie czeka już na nie produktowo, ale ta zmiana i S-31 dotykają innych plików: tu nazwy stron, `src/lib/cards.ts` i testy ścieżek; tam zapis ulubionej postaci.
