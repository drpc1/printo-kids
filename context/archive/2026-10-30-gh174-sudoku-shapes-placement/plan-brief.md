# Sudoku: lista kształtów w ramce „Użyj:” na szerokość planszy — Plan Brief

> Full plan: `context/changes/gh174-sudoku-shapes-placement/plan.md`

## What & Why

GitHub issue 174: rząd kształtów pod planszą sudoku ma zbędne polskie nazwy, przylega do ramki planszy i jest szerszy od planszy. Pierwsza wersja (kształty równo od krawędzi do krawędzi planszy) dała na 4×4 odstępy ok. 32 mm, więc po makiecie 9×9 rząd trafia do ramki z napisem „Użyj:”.

## Starting Point

`layoutSudokuShapeList` dzieli 190 mm strony na szczeliny, zaczyna rysunki (16 mm) tuż pod ramką planszy i dodaje podpis pod każdym. W working tree leży niezacommitowana pierwsza implementacja (bez nazw, flush do planszy, 16 mm); ten plan ją zastępuje.

## Desired End State

Pod planszą jest ramka o szerokości planszy, odsunięta o `instructionGap` (9 mm, jak dymek od planszy). W środku: „Użyj:” po lewej i kształty karty po 13 mm, bez nazw, ze zwartym odstępem (do 8 mm, na 9×9 ok. 4,9 mm). Karta z cyframi bez zmian.

## Key Decisions Made

| Decision             | Choice                                        | Why                                                                           | Source                   |
| -------------------- | --------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| Forma rzędu          | Ramka na szerokość planszy z napisem „Użyj:”  | Spełnia „szerokość planszy” bez rozrzucania kształtów, wyjaśnia przeznaczenie | Plan (user, po makiecie) |
| Rozmiar kształtu     | 13 mm na każdej planszy                       | Przy 16 mm odstęp na 9×9 spadłby do ok. 1,5 mm                                | Plan                     |
| Odstęp kształtów     | min(8 mm, ile się mieści), grupa wyśrodkowana | Zwarty rząd na 4×4 i 6×6                                                      | Plan                     |
| Odstęp od planszy    | `SUDOKU_SHEET.instructionGap`                 | Jedna stała dla obu odstępów                                                  | Issue 174                |
| Pion bloku           | Bez wliczania ramki                           | 9×9 z pasem postaci kończy na 282 ≤ 287 mm                                    | Plan                     |
| `SUDOKU_SHAPE_NAMES` | Zostaje                                       | Dane katalogu z testem                                                        | Plan                     |

## Scope

**In scope:** układ i rysowanie ramki, napis „Użyj:”, testy jednostkowe i e2e, PRD (US-12, US-14, Business Logic sudoku).

**Out of scope:** centrowanie bloku, kolory, karta z cyframi, rozmiar kształtów na planszy.

## Architecture / Approach

Funkcja układu zależy od prostokąta planszy i stałej odstępu; zwraca ramkę, napis i środki rysunków. Komponent rysuje `<rect>`, `<text>` i `<path>` w grupie `data-shape-list`.

## Phases at a Glance

| Phase                      | What it delivers                                         | Key risk                                                 |
| -------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| 1. Układ ramki i rysowanie | Nowa geometria, SVG z ramką i napisem, testy jednostkowe | Dół 9×9 z pasem 282 z 287 mm; szacunek szerokości napisu |
| 2. E2E, PRD, wydruk        | Przepisany spec, PRD, podgląd wydruku                    | Wolny zimny start e2e (`--workers=1`)                    |

**Prerequisites:** brak.
**Estimated effort:** ~1 sesja, 2 fazy.

## Open Risks & Assumptions

- Szerokość „Użyj:” (14 mm przy czcionce 5 mm) jest szacunkiem; test pilnuje, że mieści się na każdym rozmiarze.
- Kształty 13 mm są mniejsze niż dotychczasowe 16 mm; do potwierdzenia na wydruku.
- Cienki zapas pionowy na 9×9 z postacią (5 mm).

## Success Criteria (Summary)

- Brak nazw pod kształtami, ramka tak szeroka jak plansza, odstęp od planszy jak od dymka.
- `npm test`, lint, astro check i e2e sudoku zielone; wydruk to jedna strona A4.
