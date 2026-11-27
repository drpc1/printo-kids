# Podsumowanie kart w oknie profilu (S-52) — Plan Brief

> Full plan: `context/changes/profile-card-summary/plan.md`

## What & Why

Okno edycji profilu wypisuje wszystkie 16 kart (ok. 700 px), także te, których profil nie używał. Chcemy widoku, który nie rośnie z liczbą kart i jest przyjazny rodzicowi, także na telefonie.

## Starting Point

`ProfileSummary` w `src/components/ProfileCorner.tsx` mapuje `cardSummaries` na wiersze `min-h-11`; pole `used` już istnieje, a wzorzec `<details>` jest na stronie „Jak to działa”.

## Desired End State

Wiersze tylko kart używanych przez profil (z linkiem i szczegółami) oraz jeden zwinięty wiersz „Domyślne (N)” z linkami do pozostałych kart; gdy użyte są wszystkie, wiersza nie ma.

## Key Decisions Made

| Decision       | Choice                              | Why                                            | Source |
| -------------- | ----------------------------------- | ---------------------------------------------- | ------ |
| Zakres         | Tylko widok, dane bez zmian         | Decyzja użytkowniczki 2026-11-27               | Prompt |
| Kształt        | Użyte + zwinięte „Domyślne (N)”     | Widać to, co ma znaczenie; okno nie rośnie     | Plan   |
| Karty domyślne | Linki z samym tytułem               | US-08: każda pozycja prowadzi do karty         | Plan   |
| Zwijanie       | Natywne `<details>`/`<summary>`     | Wzorzec z „Jak to działa”, klawiatura za darmo | Plan   |
| Podział        | Czysta funkcja `splitCardSummaries` | Testowalna bez przeglądarki                    | Plan   |

## Scope

**In scope:** `ProfileSummary`, funkcja podziału z testem, testy e2e, jedno zdanie w PRD (US-08).

**Out of scope:** dane profilu i migracja, plakietki katalogu, pasek kart, lista postaci, „Jak to działa”, S-51.

## Architecture / Approach

`cardSummaries` → `splitCardSummaries` → dwie listy; widok renderuje użyte jak dziś, domyślne w `<details>`.

## Phases at a Glance

| Phase                | What it delivers                     | Key risk                                   |
| -------------------- | ------------------------------------ | ------------------------------------------ |
| 1. Podział           | Funkcja i test jednostkowy           | Brak                                       |
| 2. Widok i e2e       | Nowy widok, testy na 3 projektach    | Selektory testu zasięgu przy dwóch listach |
| 3. PRD i weryfikacja | US-08, ręczna kontrola, pełne bramki | Przepełnienie przy 375 px                  |

**Prerequisites:** brak.
**Estimated effort:** ~1 sesja, 3 fazy.

## Open Risks & Assumptions

- Liczba nieużytych kart w profilu testowym `ANIA` do ustalenia przy implementacji.

## Success Criteria (Summary)

- Okno nie rośnie z liczbą kart, każda karta nadal ma link.
- Testy i bramki zielone; widok czytelny przy 375 px.
