---
change_id: gh233-how-does-it-work
title: Opisy generatorów w części „Jak to działa” na stronie głównej
status: implemented
created: 2026-10-31
updated: 2026-10-31
archived_at: null
---

## Notes

GitHub issue 233: „Strona główna nie opisuje generatorów w »Jak to działa«”.

- Co jest teraz: strona główna to tytuł, jedno zdanie i katalog miniatur; miniatura pokazuje wygląd karty, ale nie mówi, co dziecko ma na niej zrobić.
- Co ma być: w części „Jak to działa” dwa–trzy zdania o każdym rodzaju karty (co dziecko robi i co jest na kartce) plus jedno zdanie o poziomach nazwanych wiekiem.
- Opisy trzymać przy definicji rodzaju karty w `CARD_KINDS` (`src/lib/cards`), żeby nowy rodzaj dostawał opis tam, gdzie powstaje.
- Rozszerza US-05; PRD trzeba uzupełnić o kryterium.
