# Katalog na stronie głównej alfabetycznie — Plan Brief

> Full plan: `context/changes/catalog-alpha-order/plan.md`

## What & Why

Strona główna ma pokazać ten sam katalog sześciu kart pracy, ułożony alfabetycznie po polskich tytułach. Dziś siatka idzie w kolejności dopisania kart do `CARD_KINDS`. Źródło: GitHub issue #162 i doprecyzowanie, że chodzi tylko o stronę główną.

## Starting Point

`CardCatalog.astro` rysuje `CARD_KINDS` w kolejności Labirynt, Symetria, Sudoku, Sekwencje, Nonogram, Dyktando graficzne. Ta sama tablica zasila podsumowanie profilu w `cardSummaries`. Katalog jest tylko na `/`.

## Desired End State

Na `/` karty stoją tak: Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria. Miniatury, tytuły i adresy zostają. Okno profilu nadal zaczyna się od Labirynt i kończy na Dyktando graficzne.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Kolejność strony głównej | Alfabet polski tytułów: Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria | Issue #162 podaje tę kolejność, a doprecyzowanie ogranicza ją do strony głównej |
| `CARD_KINDS` | Zostaje w kolejności dopisania | Podsumowanie profilu czyta tę tablicę, a ma zostać po staremu |
| Miejsce sortowania | `cardsInCatalogOrder()` zwraca kopię przez `localeCompare` z locale `pl` | Ten sam mechanizm co `sortProfiles`, więc nowa karta wskoczy w alfabet bez ruszania profilu |
| Test jednostkowy | Plik dopisany do skryptu `test` w `package.json` | `npm test` uruchamia jawną listę plików |

## Scope

**In scope:**

- Funkcja kolejności katalogu i jej test jednostkowy
- Siatka `CardCatalog` na `/`
- Test Playwright kolejności linków bez zapisanego profilu
- Sformułowania „catalog order” przy `cardSummaries`, które mają nazywać kolejność `CARD_KINDS`

**Out of scope:**

- Kolejność okna profilu
- Tytuły, adresy, miniatury, plakietki
- Listy postaci i profili

## Architecture / Approach

`cardsInCatalogOrder()` sortuje kopię `CARD_KINDS` po `title`. Szablon katalogu rysuje tę kopię. `cardSummaries` dalej mapuje `CARD_KINDS`, więc okno profilu zostaje przy kolejności dopisania. Plakietki zostają przy `id`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Reguła kolejności katalogu | Funkcja, test i wpis w skrypcie `test` | Test leży obok kodu, ale `npm test` go nie widzi, dopóki ścieżka nie wejdzie do `package.json` |
| 2. Siatka na stronie głównej | Katalog na `/` w alfabecie i test Playwright | Test z zapisanym profilem czyta nazwę „tytuł, plakietka” i nie widzi samego tytułu |

**Prerequisites:** Brak. Zmiana nie czeka na inny change.
**Estimated effort:** Jedna sesja, dwie fazy.

## Open Risks & Assumptions

- Następna karta z literą `ł` albo `ą` wchodzi według `localeCompare` z locale `pl`, tak jak imiona profili. Dla dzisiejszych sześciu tytułów ten porządek i porządek z issue #162 są tym samym.
- Pusty folder `context/changes/context-dir-restructure/` powstał z przykładowego sluga i nie należy do tej zmiany.

## Success Criteria (Summary)

- Na `/` widać Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria.
- Te same miniatury i adresy co dziś.
- Okno profilu zaczyna się od Labirynt i kończy na Dyktando graficzne.
