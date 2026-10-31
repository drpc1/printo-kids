# Kategoria „Kształty” — Plan Brief

> Full plan: `context/changes/gh198-shape-category/plan.md`
> Frame brief: `context/changes/gh198-shape-category/frame.md`

## What & Why

Dodajemy szóstą kategorię „Kształty” (serce, gwiazda, koło, trójkąt, romb, krzyżyk, księżyc, chmurka) do wspólnego katalogu symetrii, nonogramu i dyktanda. Problem do rozwiązania: znaleźć co najmniej cztery figury, które czytelnie mieszczą się w połowie 4×12, 6×15 i 9×24 i przechodzą reguły trzech kart naraz; sama kategoria to kilka linii.

## Starting Point

Pięć kategorii w `OBJECT_CATEGORIES`, a profil i podsumowanie walidują kategorię względem tej samej listy, więc nowy id działa bez migracji. Obiekt to trzy szablony z losowanymi częściami (wzór: lizak w `jedzenie.ts`), a testy wymagają ≥4 obiektów na kategorię w każdym rozmiarze.

## Desired End State

Pasek „Kategoria” na trzech kartach ma „Kształty”; kolejne Generuj daje inną kartę, profil kategorię zapamiętuje, a PRD opisuje szóstą kategorię i wyjątek od „pionowy”.

## Key Decisions Made

| Decision            | Choice                                                             | Why                                                                          | Source        |
| ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------- |
| Zakres problemu     | Dobór i rysunek figur, nie plumbing kategorii                      | Figury muszą przejść symetrię, nonogram i dyktando naraz                     | Frame         |
| Zestaw figur        | Osiem, z odpadaniem; min. 4 w każdym rozmiarze                     | Zapas na figury, które złamią reguły                                         | Plan          |
| Proporcje           | Figury zachowują kształt (koło 1:1), zajmują pas siatki            | Koło ma być kołem; wyjątek od „pionowy” trafia do PRD                        | Plan          |
| Zmienność           | Losowane ozdoby; na 9×24 co najmniej 3 części, każda zmienia obraz | Wymóg istniejących testów katalogu; bez części kategoria szybko się powtarza | Plan + review |
| Wpięcie do katalogu | Dopiero figury, które przeszły miernik                             | Faza 1 kończy się zielonym `npm test`                                        | Plan + review |
| Karty               | Wspólny katalog trzech kart                                        | Jak dziś; bez wyjątków dla jednej karty                                      | Frame         |
| Kolejność prac      | Rysunki i miernik przed selekcją i PRD                             | Ryzyko leży w rysunkach                                                      | Frame         |

## Scope

**In scope:** nowa kategoria, osiem figur w trzech rozmiarach, testy, tekst UI, PRD.

**Out of scope:** kształty dyktanda z #115, korona, zmiany poziomów i siatek, rozciąganie figur, nowe kontrolki.

## Architecture / Approach

Nowy plik `objects/ksztalty.ts` z `SymmetryObjectSizes` wpięty do `CATALOG`; id `ksztalty` dopisany do `OBJECT_CATEGORIES`. Tymczasowy blok-miernik w `templates.test.ts` pokazuje, które figury przechodzą reguły, a selekcja zostawia te, które przechodzą wszędzie.

## Phases at a Glance

| Phase                           | What it delivers                                       | Key risk                                       |
| ------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| 1. Kategoria, rysunki i miernik | Kategoria widoczna, 8 figur × 3 rozmiary, raport reguł | Czytelność figur w połowie 4×12                |
| 2. Selekcja i zmienność         | ≥4 figury w każdym rozmiarze, różne karty              | Nonogram bez jedynego rozwiązania, styk rogiem |
| 3. Zasięg i PRD                 | UI, testy profilu, PRD, weryfikacja na telefonie       | Pasek z sześcioma wpisami na wąskim ekranie    |

**Prerequisites:** brak.
**Estimated effort:** ~2–3 sesje w trzech fazach.

## Open Risks & Assumptions

- Nie wiadomo, które figury przejdą nonogram i dyktando; rozstrzyga miernik z fazy 1.
- Księżyc (poziomy sierp) i chmurka mogą odpaść; zostaje minimum czterech.
- Czas sprawdzenia trudnego nonogramu może urosnąć; próg testu to 15 s.

## Success Criteria (Summary)

- Rodzic wybiera „Kształty” na trzech kartach i dostaje różne czytelne figury.
- Kategoria zapamiętuje się w profilu i widać ją w podsumowaniu.
- `npm run lint`, `npm test`, `npx astro check`, `npm run build` przechodzą.
