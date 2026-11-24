# „Jak to działa” przy 16 kartach — Plan Brief

> Full plan: `context/changes/how-it-works-m7/plan.md`

## What & Why

Strona „Jak to działa” opisuje każdą z 16 kart w 2–3 zdaniach i robi się za długa; zasady profilu, poziomów i postaci giną pod nimi. Rodzic ma szybko znaleźć właściwą kartę, a zasady mają zostać na górze (S-53, US-22).

## Starting Point

`src/pages/how-it-works.astro` wypisuje 16 kart po kolei (ok. 4900 znaków), a pod nimi sześć sekcji zasad. Akapit „Poziomy” ręcznie wylicza karty i numery poziomów, więc rośnie z każdą kartą. Dane poziomów każdej karty już są w `src/lib/*/levels.ts`.

## Desired End State

Na górze zasady (poziomy tylko ogólnie, profil, postać, święta, dane), niżej 16 zwiniętych wierszy w kolejności katalogu. Rozwinięty wiersz pokazuje opis rodzaju, poziomy tej karty z opisami (i typowym wiekiem tam, gdzie jest) oraz link do generatora.

## Key Decisions Made

| Decision                  | Choice                                             | Why (1 sentence)                                            | Source |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------------------- | ------ |
| Sposób skrócenia          | Zwijane wiersze `<details>`                        | Strona nie rośnie z kartami, bez JS i bez zmiany PRD poza US-05 | Plan   |
| Stan domyślny wierszy     | Wszystkie zwinięte                                 | Cel S-53: strona mieści się na jednym-dwóch ekranach        | Plan   |
| Akapit „Poziomy”          | Tylko zasady ogólne; szczegóły w wierszu karty     | Decyzja użytkowniczki: nie wyliczać kart w jednym akapicie  | Plan   |
| Źródło poziomów           | Rejestr z istniejących `levels.ts`                 | Strona nie rozjedzie się z paskiem, nowa karta wymusza wpis | Plan   |
| Pieniądze                 | Opisy dla złotych                                  | Poziomy zależą od waluty, opis rodzaju mówi o walutach      | Plan   |
| Sudoku                    | Trzy grupy po rozmiarze, opis z `sudokuLevelDescription` | Dane nie mają opisu poziomu, tylko funkcję              | Plan   |

## Scope

**In scope:** nowy `src/lib/card-levels.ts` z testem, przebudowa `how-it-works.astro`, test e2e.

**Out of scope:** treść opisów w `CARD_KINDS` i `levels.ts`, tryby/kategorie/waluta w wierszu, wyszukiwarka, spis treści, osobne strony kart, stopka.

## Architecture / Approach

Rejestr `cardLevelGroups(id)` zwraca ujednolicone grupy wierszy poziomów, a wyjątki (pieniądze, sudoku, nonogram, labirynt) obsługuje on, nie strona. Strona składa z tego `<details>` w kolejności `cardsInCatalogOrder()`. Test jednostkowy pilnuje, że każda karta ma poziomy.

## Phases at a Glance

| Phase                         | What it delivers                                      | Key risk                                                              |
| ----------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| 1. Dane poziomów kart         | Rejestr poziomów 16 kart + test                       | Niejednolite kształty danych (pieniądze, sudoku, nonogram, labirynt)  |
| 2. Strona ze zwijanymi wierszami | Nowy układ strony z `<details>`                    | Import `levels.ts` na workerd; klawiatura i telefon                   |
| 3. Testy i domknięcie         | Zaktualizowany e2e, pełny zestaw lokalny              | Test e2e pilnuje dziś starej struktury                                |

**Prerequisites:** brak; S-42, S-47–S-49, S-43 są `done`.
**Estimated effort:** ok. 2 sesje w 3 fazach.

## Open Risks & Assumptions

- `shadows/raster.ts` i `money/sheet.ts` nie były sprawdzone pod kątem importu na workerd; potwierdza to build w fazie 2.
- Zakładam, że nowy akapit „Poziomy” zastępuje starą asercję e2e (`:55-58`) asercją zasad ogólnych.

## Success Criteria (Summary)

- Strona mieści zasady i 16 kart na jednym-dwóch ekranach, a opis i poziomy każdej karty są jedno kliknięcie dalej.
- Poziomy na stronie są zawsze zgodne z paskiem, a nowa karta bez wpisu wywala test.
- `npm test`, lint, depcruise, build i e2e strony przechodzą.
