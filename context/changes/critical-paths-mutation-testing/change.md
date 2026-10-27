---
change_id: critical-paths-mutation-testing
title: Krytyczne ścieżki projektu, luki w testach i celowany Stryker na nowych kartach
status: new
created: 2026-10-27
updated: 2026-10-27
archived_at: null
---

## Notes

Najpierw sam raport z rekomendacją (research.md): krytyczne ścieżki całego projektu, luki w testach, które moduły i zakresy zasługują na Strykera. Dopiero po akceptacji raportu celowany Stryker (--mutate plik:start-end) na nowych kartach: symetria, sekwencje, sudoku, nonogram, dyktando. Stryker dotąd obejmował tylko maze/generate, sheet/layout, last-used, child-profiles, sheet/character (stryker.config.json). Zgodnie z AGENTS.md: bez gonienia 100%, ocalałe mutanty po kolei, asercja tylko dla błędu widocznego dla rodzica albo zmieniającego wynik karty.
