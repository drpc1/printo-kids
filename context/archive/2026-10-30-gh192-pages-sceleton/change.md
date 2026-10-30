---
change_id: gh192-pages-sceleton
title: Wspólny szkielet strony karty przed kolejnym rodzajem (GH 192)
status: archived
created: 2026-10-30
updated: 2026-10-30
archived_at: 2026-10-30T22:31:54Z
---

## Notes

zaczynamy pracę nad github issue 192 używając skilly 10x

GitHub #192: "Wspólny szkielet strony karty przed kolejnym rodzajem". Wyciągnąć wspólną powłokę strony (wizyta profilu, klasa `has-sheet` na `#worksheet-home`, komunikat „nie udało się ułożyć", Generuj, Drukuj, blokada przy oczekiwaniu na wybór dziecka) z sześciu wysp: WorksheetGenerator, SymmetryGenerator, SequenceGenerator, SudokuGenerator, NonogramGenerator, DictationGenerator. Labirynt wchodzi na szkielet, ale poziom zostaje poza `CardSettingsMap`. Reguły, układ mm i SVG zostają w module karty. Nie jest elementem roadmapy (bez etykiety `roadmap-slice`).
