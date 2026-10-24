# Sudoku: rozmiary, poziomy i cyfry — Plan Brief

> Full plan: `context/changes/picture-sudoku-levels/plan.md`

## What & Why

Rodzic ma wybrać na stronie `/sudoku` rozmiar planszy (4×4, 6×6, 9×9), poziom (łatwy, średni, trudny) i, przy 6×6 i 9×9, kształty albo cyfry. To plasterek S-19 roadmapy M-3 (US-13, FR-022). Siedmiolatek robi już 9×9, więc rozmiar i poziom są dwoma osobnymi wyborami, nie wiekiem.

## Starting Point

Po S-18 jest generator i solver dla 4/6/9, układ strony ogólny dla dowolnego rozmiaru i strona tylko z 4×4 bez ustawień. Rozmiar bloku i pola są jednak wpisane na sztywno w komponencie, skrypcie makiety i skrypcie miniatury (finding F3).

## Desired End State

Nad kartą jest pasek: „Rozmiar”, „Poziom” (nie przy 4×4) i „Kształty / Cyfry” (tylko przy 6×6 i 9×9). Zmiana ustawienia przy widocznej karcie daje od razu nową kartę. Puste pola: 4×4 cztery, 6×6 12/18/22, 9×9 35/45/52; zawsze jedno rozwiązanie, jedna strona A4 z marginesem 10 mm, także z telefonu.

## Key Decisions Made

| Decision             | Choice                                                                                   | Why (1 sentence)                                     | Source |
| -------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| Liczby pustych pól   | 4 / 12-18-22 / 35-45-52, startowe                                                        | PRD; trudność ocenia się na wydruku (pytanie 9)      | PRD    |
| Kształty 6×6         | Losowe sześć z dziewięciu przy każdym Generuj                                            | Większa różnorodność kart, jak 4 z 5 w 4×4           | Plan   |
| Kształty / Cyfry     | Dwa przyciski obok siebie, tylko przy 6×6 i 9×9                                          | Obie opcje widać naraz, czytelne na telefonie        | Plan   |
| Poziom przy 4×4      | Przycisk „Poziom” ukryty                                                                 | Brak martwej kontrolki                               | Plan   |
| Rozmiar i Poziom     | Dwa przyciski z oknem, jak „Poziom” w symetrii                                           | Sprawdzony wzorzec, mało miejsca na telefonie        | Plan   |
| Zmiana ustawienia    | Przy widocznej karcie od razu nowa karta                                                 | Karta zawsze zgodna z paskiem, jak w symetrii        | Plan   |
| Polecenie            | „Uzupełnij puste pola. Nic się nie powtarza w rzędzie, kolumnie i bloku.” dla wszystkich | Wybór użytkowniczki; zastępuje trzy linie 4×4 z S-18 | Plan   |
| Pola startowo        | 4×4: 40 mm, 6×6: 28 mm, 9×9: 20 mm                                                       | Mieszczą się w 190 mm; do potwierdzenia na wydruku   | Plan   |
| Makieta przed stroną | Faza 1 z bramką ręczną na najtrudniejszych poziomach                                     | Trudność i czytelność 9×9 ocenia się na papierze     | Plan   |
| Zapis w profilu      | Brak; ustawienia żyją w stanie strony                                                    | US-08 odłożone                                       | PRD    |

## Scope

**In scope:**

- Poziomy i liczby pustych pól, uogólniony model karty, cyfry
- Pasek Rozmiar / Poziom / Kształty-Cyfry i arkusz zależny od rozmiaru
- Makiety do wydruku, testy jednostkowe, e2e telefonu i ustawień

**Out of scope:**

- Kolory kształtów (S-20)
- Zapis w profilu i w ostatnich parametrach
- Wspólny `GenerateButton`, wybór kształtów 6×6 przez rodzica

## Architecture / Approach

Czyste funkcje w `src/lib/sudoku/` (nowy `levels.ts`, uogólniony `generate.ts`, `sheet.ts` z polem zależnym od rozmiaru) są jedynym źródłem liczb i geometrii. Komponent `SudokuGenerator.tsx`, skrypt makiety i skrypt miniatury składają z nich znaczniki. Pasek używa nowych `SudokuChoice.tsx` i `SudokuSymbolsChoice.tsx` wzorowanych na symetrii.

## Phases at a Glance

| Phase                                | What it delivers                                               | Key risk                                           |
| ------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------- |
| 1. Pola, cyfry, polecenie i makiety  | Stałe zależne od rozmiaru, trzy makiety A4 do wydruku (bramka) | 9×9 z polem 20 mm za drobne albo za trudne         |
| 2. Poziomy i generator               | `levels.ts`, `generateSudokuCard`, reguły i testy, czas        | Zmiana modelu karty łamie istniejące testy S-18    |
| 3. Pasek i karta zależna od rozmiaru | Pasek ustawień, arkusz każdego rozmiaru, cyfry                 | Zawijanie paska na telefonie, klasy `print:hidden` |
| 4. Miniatura, smoke, e2e, druk       | Miniatura z nowego generatora, e2e, wydruk w przeglądarkach    | Druk 9×9 w Safari i Brave                          |

**Prerequisites:** S-18 na `main` (jest).
**Estimated effort:** ~3–4 sesje w 4 fazach.

## Open Risks & Assumptions

- Liczby pustych pól 6×6 (22) i 9×9 (52) mogą okazać się za trudne; faza 1 dopuszcza zmianę liczb przed fazą 2.
- Pomiar: najwolniej 3,6 ms na planszę 9×9 z 52 pustymi, więc budżet 5 s nie jest ryzykiem.
- S-17 i S-20 mogą równolegle dotykać `package.json`, `src/lib/cards.ts` i `SudokuGenerator.tsx`; przy konfliktach zostają oba wpisy.
- Każda faza przepina użytkowników zmienianych symboli (`cellSize4`, `generateSudokuCard4`) w komponencie, miniaturze i testach, żeby kończyła się zielonym `lint`, `astro check` i `build`.
- Dwuliniowe polecenie zmienia też kartę 4×4 z S-18 (decyzja użytkowniczki).

## Success Criteria (Summary)

- Rodzic wybiera rozmiar, poziom i symbole, a karta ma właściwą liczbę pustych pól i jedno rozwiązanie.
- Każde z siedmiu ustawień drukuje się jako jedna strona A4 z marginesem 10 mm, także z telefonu.
- Dziecko daje radę z łatwymi poziomami; trudność 6×6 i 9×9 potwierdza wydruk.
