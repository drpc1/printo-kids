# Nazwy kart przy zapamiętanych ustawieniach profilu alfabetycznie — Plan Brief

> Full plan: `context/changes/gh429-alphabetic-profile-settings/plan.md`

## What & Why

W oknie profilu nazwy kart przy zapamiętanych ustawieniach mają iść alfabetycznie po polsku, tak jak katalog. Dziś lista bierze kolejność dopisania `CARD_KINDS`, więc pierwsza jest zawsze Labirynt. Nowa karta ma wpadać w swoje miejsce alfabetu, a nie na koniec podsumowania.

## Starting Point

`cardSummaries()` mapuje `CARD_KINDS` i zwraca też karty nieużywane, ze szczegółem „domyślne”. `ProfileSummary` rysuje tę tablicę bez sortowania. Katalog sortuje kopię przez `title.localeCompare(..., "pl")` w `cardsInCatalogOrder()`. Plan z 2026-10-28 zostawił podsumowanie przy dopisaniu celowo; issue 429 tę jedną decyzję odwraca.

## Desired End State

Rodzic w oknie edycji widzi nazwy alfabetycznie po polsku. Pierwsza jest Dyktando graficzne. `CARD_KINDS` jest w tej samej kolejności, a nowa karta wchodzi w swoje miejsce. PRD mówi o tej kolejności przy oknie profilu.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Gdzie żyje kolejność | `cardSummaries()` iteruje `cardsInCatalogOrder()` | Okno rysuje wynik tej funkcji, a plakietki kluczują po id, więc sortowanie tablicy ich nie rusza |
| Komparator | Istniejący `localeCompare(..., "pl")`, bez opcji | Drugi alfabet rozjechałby się z katalogiem |
| `CARD_KINDS` | Alfabet polskich tytułów; nowa karta w swoim miejscu | Issue 429; test oblewa dopisanie na końcu |
| Wiersze „domyślne” | Zostają na liście | Issue sortuje nazwy, nie ukrywa kart nieużywanych |
| Przykład w US-08 | Zostaje „Labirynt: Poziom 4 · Nonogram…” | To wzór treści wiersza, nie kolejność listy |
| E2E | Rozszerzyć istniejący test okna edycji o kolejność tytułów | Issue prosi o asercję pozycji, a test dziś sprawdza tylko widoczność |
| Pytania planistyczne | Zero | Issue rozstrzyga komparator, powierzchnię, testy i zdanie w PRD |

## Scope

**In scope:**

- Kolejność wyniku `cardSummaries()`
- Test jednostkowy tej kolejności
- Asercja kolejności tytułów w `tests/e2e/profile-summary.spec.ts`
- Jedno zdanie w US-08

**Out of scope:**

- Zostawianie `CARD_KINDS` w kolejności dopisania
- Ukrywanie wierszy „domyślne” i zmiana szczegółów
- Przykład w US-08, tabela ustawień w Business Logic, glosariusz

## Architecture / Approach

Jedno źródło alfabetu: kopia z `cardsInCatalogOrder()`. Podsumowanie przestaje czytać `CARD_KINDS` wprost. Test jednostkowy porównuje się z tą kopią. E2E sortuje odczytane tytuły przez `localeCompare(..., "pl")`, tak jak test katalogu, i nie porównuje całych nazw dostępnych, bo zawierają szczegół.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Kolejność w cardSummaries | Funkcja, test jednostkowy i E2E okna | Asercja E2E porówna całą nazwę dostępną zamiast samego tytułu i będzie czerwona na szczegółach |
| 2. Zdanie w PRD | Jedno zdanie w US-08 | Zdanie przestawi przykład albo tabelę ustawień, które nie są kolejnością listy |

**Prerequisites:** Brak. Działa na obecnym `main` i istniejącym `cardsInCatalogOrder()`.
**Estimated effort:** Jedna sesja, dwie fazy.

## Open Risks & Assumptions

- Równe tytuły zostają w kolejności dopisania (stabilne sortowanie). Dziś się nie powtarzają.
- Różnica ICU między Node a Chromium dla przyszłego tytułu wywaliłaby ten E2E tak samo jak test katalogu. Obecne czternaście tytułów jest zgodne.
- Plan z 2026-10-28 przestaje obowiązywać tylko dla podsumowania profilu.

## Success Criteria (Summary)

- W oknie edycji pierwsza nazwa to Dyktando graficzne, a cała lista zgadza się z katalogiem.
- `npm test` i E2E `profile-summary` na Chromium są zielone, a `CARD_KINDS` jest alfabetyczne po polskich tytułach.
- US-08 mówi o alfabecie, a przykład wiersza i tabela ustawień stoją po staremu.
