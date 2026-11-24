---
change_id: how-it-works-m7
title: „Jak to działa” przy 16 kartach: zwijane karty
status: impl_reviewed
created: 2026-11-23
updated: 2026-11-24
archived_at: null
---

## Notes

S-53 (MS-05, US-22, FR-031). Decyzja użytkowniczki 2026-11-23: opcja B, zwijane karty. Zasady profilu, poziomów i postaci idą na górę strony; każda karta to zwijany wiersz (`<details>`) z tytułem, a po rozwinięciu opis z `CARD_KINDS` i link do generatora. Bez React i bez JS; opisy zostają w `CARD_KINDS`. Akapit „Poziomy” warto generować z danych kart zamiast pisać ręcznie. Do zaktualizowania: US-22 w PRD (opisy zwijane), `tests/e2e/how-it-works.spec.ts` (rozwijanie wierszy), roadmapa (S-53 odblokowane, niewiadoma zamknięta).
