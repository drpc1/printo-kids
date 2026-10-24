# Sudoku 4×4 z kształtami: pierwsza karta do druku — Plan Brief

> Full plan: `context/changes/picture-sudoku-first-printable/plan.md`

## What & Why

Rodzic ma dostać nowy rodzaj karty: sudoku, w którym dziecko dorysowuje brakujące proste kształty. To plasterek S-18 roadmapy M-3. Pierwsza wersja to plansza 4×4 do druku na A4, a rozmiary 6×6 i 9×9, poziomy i kolory przyjdą w S-19 i S-20.

## Starting Point

Katalog kart, wspólna powłoka strony generatora i wzorzec karty (logika w `src/lib/<rodzaj>/`, strona React z Generuj, Drukuj i rogiem profilu, miniatura z prawdziwego generatora) już działają po symetrii. Kodu sudoku nie ma.

## Desired End State

Na `/sudoku` rodzic klika Generuj i widzi kartę A4: zdanie polecenia i planszę 4×4 o polach 40 mm z grubymi liniami kwadratów 2×2. W 12 polach są czarne kontury czterech kształtów, a w każdym wierszu jedno pole jest puste. Karta drukuje się jako jedna strona, także z telefonu, a katalog ma miniaturę „Sudoku”.

## Key Decisions Made

| Decision        | Choice                                                                                      | Why (1 sentence)                                                   | Source  |
| --------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------- |
| Symbole         | Proste kształty zamiast postaci z katalogu                                                  | Dziecko umie je narysować; znika pytanie o prawa do postaci        | PRD     |
| Pula 4×4        | 4 z 5: koło, kwadrat, trójkąt, serce, krzyżyk                                               | Najłatwiejsze do narysowania dla najmłodszych                      | Plan    |
| Puste pola 4×4  | Jedno w każdym wierszu, kolumna losowa                                                      | Rozwiązanie wynika z samego wiersza; bez wymogu kolumn i kwadratów | PRD     |
| Pasek kształtów | Brak; tylko polecenie i plansza                                                             | Najprostsza karta, największe pola                                 | Plan    |
| Polecenie       | „Dorysuj brakujący kształt. W każdym rzędzie, kolumnie i kwadracie każdy kształt jest raz.” | Rodzic czyta dziecku całą regułę                                   | Plan    |
| Rozmiar planszy | Pola ok. 40 mm (160×160 mm)                                                                 | Dużo miejsca na kredkę, oddech od marginesu                        | Plan    |
| Styl kształtu   | Gruby czarny kontur (~1,2 mm), pusty środek, ~65% pola                                      | Wygląda jak rysunek dziecka; S-20 wypełni środek kolorem           | Plan    |
| Linie           | Cienkie między polami, grube między kwadratami i ramka                                      | Klasyczne sudoku; ten sam kod da bloki 2×3 i 3×3 w S-19            | Plan    |
| Makieta         | Faza 1 z bramką ręczną                                                                      | Kształty akceptowane na wydruku przed stroną                       | Plan    |
| Zakres logiki   | Generator i solver od razu dla 4×4, 6×6, 9×9                                                | S-19 dokłada tylko UI                                              | Roadmap |

## Scope

**In scope:**

- Dziewięć kształtów jako ścieżki SVG i makieta do wydruku
- Pełne sudoku, solver i usuwanie pól z kontrolą jednego rozwiązania dla 4×4, 6×6, 9×9
- Karta 4×4, strona `/sudoku`, kontrakt druku
- Wpis i miniatura w katalogu, smoke, e2e katalogu i telefonu

**Out of scope:**

- Paski „Rozmiar” i „Poziom”, 6×6 i 9×9 na stronie, cyfry (S-19)
- Kolory kształtów (S-20)
- Pasek kształtów i legenda; zapis w profilu i ostatnich parametrach

## Architecture / Approach

Czysta logika w `src/lib/sudoku/`: `shapes.ts` (ścieżki w mm), `sheet.ts` (stałe rysunku), `layout.ts` (położenie polecenia, planszy, linii i środków pól), `generate.ts` (pełne sudoku, solver, `carveSudoku` i `generateSudokuPuzzle` z ponowieniem, karta 4×4 z kluczem). Z tej samej geometrii korzystają trzy miejsca: komponent `SudokuGenerator.tsx`, skrypt makiety i `build-thumbnails.mjs`. Strona to `src/pages/sudoku.astro` w `GeneratorShell`.

## Phases at a Glance

| Phase                              | What it delivers                                        | Key risk                                                  |
| ---------------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| 1. Kształty, układ karty i makieta | Kształty, układ A4, `mockup.svg` do akceptacji          | Kształty nieczytelne lub trudne do narysowania na wydruku |
| 2. Generator i solver              | Sudoku 4/6/9, solver, `generateSudokuPuzzle`, karta 4×4 | 9×9 przy 52 pustych za wolne                              |
| 3. Strona `/sudoku`                | Strona z Generuj, Drukuj, profilem i kartą SVG          | Druk inny niż w symetrii                                  |
| 4. Katalog, miniatura, smoke, e2e  | Miniatura w katalogu, testy, druk w przeglądarkach      | Konflikt w `cards.ts` z równoległym S-16                  |

**Prerequisites:** M-2 zamknięty (katalog, powłoka, wzorzec symetrii); zatwierdzona makieta przed fazą 2.
**Estimated effort:** ~3–4 sesje w 4 fazach.

## Open Risks & Assumptions

- Wszystkie cztery puste pola mogą wypaść w jednej kolumnie; to świadoma decyzja (losowo), do oceny na wydruku z dzieckiem.
- Zdanie polecenia jest długie; układ łamie je na linie, a czytelność potwierdza wydruk.
- S-16 równolegle dopisuje wpis do `src/lib/cards.ts` i miniaturę; przy scalaniu zostają oba.

## Success Criteria (Summary)

- Rodzic z katalogu otwiera „Sudoku”, generuje kartę 4×4 i drukuje ją jako jedną stronę A4 na komputerze i telefonie.
- Każda karta ma dokładnie jedno rozwiązanie, jedno puste pole w każdym wierszu i kształty tylko z puli pięciu.
- Dziecko rozumie zadanie i daje radę narysować brakujące kształty.
