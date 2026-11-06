# Kontrybutorzy, 27 września – 2 listopada 2026

## Okno i metoda

Historia linii `main` jest krótsza niż 12 miesięcy. Pierwszy commit to `Initial commit` z 27 września 2026, ostatni dzień z ruchem to 2 listopada 2026. Wzięta jest cała ta linia: 658 commitów bez scalających. Na `--all` nazwa autora jest ta sama; liczby obszarów liczą `main`, żeby zrebase’owana gałąź nie weszła drugi raz.

Osobą jest autor w gicie (`%aN`). Commit, którego autorem jest agent (Claude, Codex, Copilot, Cursor), odpada. Takich commitów nie ma. Botów i automatycznych podbić wersji też nie ma. Agent w stopce `Co-authored-by` zostaje przy człowieku i nie jest osobą do pytania. W tych 658 commitach stopka ma Claude Sonnet 5.5 (291), Cursor (233) albo Claude Opus 5.5 (93).

Commit wchodzi do obszaru raz, gdy ruszy którąś z wypisanych ścieżek. Stare nazwy po zmianie nazwy liczą się razem z nowymi (`labirynt.astro` z `maze.astro`, `symetria.astro` z `symmetry.astro`, `WorksheetHome.astro` z `GeneratorShell.astro`).

## Skład zespołu

Jedna osoba: **drpc1**. Dwa adresy składają się w tę pozycję, bo oba podpisują się tą samą nazwą (651 commitów z noreply GitHuba, 7 z poczty, kampania `nonogram-sizes`). Pliku `.mailmap` nie ma. Przy jednej osobie skupienie wiedzy w jednej głowie jest normą, nie ryzykiem.

## Obszary

### Generowanie labiryntu

Ścieżka: `src/lib/maze/`, `src/components/WorksheetGenerator.tsx`, `src/pages/maze.astro`, `stryker/maze.config.json`. Osoba: drpc1. 63 commity.

Tematy do przeczytania: `first-printable-maze`, `maze-difficulty-levels`, `winding-maze-path`, `random-maze-generator`, `gh114-maze-too-easy`, `gh237-maze-level`.

Dowód z `git log` na `main`: `feat(first-printable-maze): Generator and the single path` (29 września) i `fix(first-printable-maze): draw each shared wall once` (1 października); trzy commity `maze-difficulty-levels` 11–16 października (`Generator pod regułę poziomu`, `Wybór, zapis i Generuj`); `feat(winding-maze-path): Zawijana droga` (12 października) i `sześć lat dostaje drogę pięciu lat` (14 października); `feat(random-maze-generator): Losowy generator` (16 października); `feat(gh114-maze-too-easy): Generator i tabela poziomów` oraz dwa `refactor(gh237-maze-level)` (30–31 października).

### Profil dziecka

Ścieżka: `src/lib/child-profiles.ts`, `src/lib/active-profile.ts`, `src/lib/card-settings.ts`, `src/components/ProfileCorner.tsx`, `src/components/CatalogProfileCorner.tsx`, `src/hooks/useChildProfileVisit.ts`, `tests/e2e/profile-summary.spec.ts`, `tests/e2e/card-settings.spec.ts`. Osoba: drpc1. 54 commity.

Tematy do przeczytania: `child-profile-create-select`, `child-profile-save-delete`, `card-settings-memory`, `gh237-maze-level`, `gh234-profile-on-homepage`, `favorite-character-explicit`, `gh167-favourite-character`.

Dowód z `git log` na `main`: 8–9 października `Wybór przy dwóch i więcej`, `Zapis ulubionej w rogu`, `Usunięcie i przełączenie`; pięć commitów `card-settings-memory` 27 października, w tym `Rdzeń zapisu ustawień kart` i `fix: poziom sudoku zostaje przy 4x4`; pięć commitów `gh237-maze-level` 31 października, w tym `dane i migracja` oraz `LevelChoiceRows poza ProfileCorner`; `feat(gh234-profile-on-homepage): Róg profilu na katalogu` i `fix(gh234): refresh the catalog profile corner on pageshow and storage` (31 października); 27–29 października `zapis ulubionej w oknie profilu ze świeżego odczytu` i `feat(gh167-favourite-character): Widoczny tytuł listy z edycji`.

### Druk arkusza A4

Ścieżka: `src/lib/sheet/layout.ts`, `src/lib/sheet/print-contract.test.ts`, `src/components/GeneratorShell.astro`, `tests/e2e/print-margins.spec.ts`. Osoba: drpc1. 53 commity.

Tematy do przeczytania: `worksheet-page-shell`, `first-printable-maze`, `print-a4-maze`, `print-sheet-contract`, `printed-maze-equal-margins`, `phone-worksheet`, `print-printer-margins`.

Dowód z `git log` na `main`: `feat(worksheet-page-shell): product first paint` (28 września), `feat(first-printable-maze): A4 sheet on the page` (29 września), `feat(print-a4-maze): Print layout` (3 października); 5 października `chore(print-sheet-contract): Sheet geometry contract` i `Chrome print contract`; `feat(printed-maze-equal-margins): Przesunięcie bloku w layoutSheet` (22 października); `fix(phone-worksheet): druk na iOS na jednej stronie` (16 października) i `druk bez beżowego tła strony w Safari na iOS` (20 października); trzy commity `print-printer-margins` 31 października, w tym `Limit wysokości druku na telefonie 108vh`.

### Symetria

Ścieżka: `src/lib/symmetry/`, `src/components/SymmetryGenerator.tsx`, `src/pages/symmetry.astro`, `tests/e2e/symmetry-colors.spec.ts`, `stryker/symmetry.config.json`. Osoba: drpc1. 42 commity.

Tematy do przeczytania: `symmetry-first-printable`, `symmetry-difficulty-levels`, `symmetry-color-codes`, `template-object-catalog`, `gh198-shape-category`, `gh124-more-symetric-shapes`, `gh118-car-bus`.

Dowód z `git log` na `main`: cztery commity `symmetry-first-printable` 23 października (`logika karty symetrii`, `strona /symetria`); cztery `symmetry-difficulty-levels` tego dnia (`model poziomów i generator`, `katalogi szablonów 4 i 7 lat`); trzy `symmetry-color-codes` (`model — dziury, paleta i kolory obiektów`); pięć `template-object-catalog` 25 października, od `Fundament katalogu` po `Kosmos i maszyny, Domy i budowle, domknięcie`; 30–31 października `feat(gh198-shape-category): Kategoria, rysunki i miernik reguł`, `feat(gh124-more-symetric-shapes): kotwica i lizak w katalogu`, `feat(gh118-car-bus): szablony auta i autobusu`.

### Sudoku

Ścieżka: `src/lib/sudoku/`, `src/components/SudokuGenerator.tsx`, `src/components/SudokuChoice.tsx`, `src/components/SudokuSymbolsChoice.tsx`, `src/pages/sudoku.astro`, `tests/e2e/sudoku-*.spec.ts`, `stryker/sudoku.config.json`. Osoba: drpc1. 40 commitów.

Tematy do przeczytania: `picture-sudoku-first-printable`, `picture-sudoku-levels`, `picture-sudoku-colors`, `sudoku-shape-list`, `gh174-sudoku-shapes-placement`, `gh164-fix-sudoku-phone-view`.

Dowód z `git log` na `main`: cztery commity `picture-sudoku-first-printable` 24 października (`Kształty, układ karty i makieta`, `Generator i solver`, `fix: sudokuCardProblems nie uruchamia solvera dla planszy innej niż 4×4`); pięć `picture-sudoku-levels` (`poziomy i generator kart dla wszystkich rozmiarów`); cztery `picture-sudoku-colors` 25 października (`kolory kształtów jako logika i tokeny`, `przełącznik Kolory`); `feat(sudoku-shape-list): Geometria rzędu` i `Rysowanie` (28 października); 30 października `feat(gh174-sudoku-shapes-placement): Ramka Użyj: pod planszą` i `fix(gh164-fix-sudoku-phone-view): cyfry sudoku na środku komórki w WebKit`.

## Czego plik nie rozstrzyga

Pamięć autora. Log mówi, które tematy drpc1 ruszał, i nie mówi, co z nich zostało w głowie.

Strony `.astro` są niewidoczne w grafie importów. Cruiser nie rozwiązuje `src/pages` ani `GeneratorShell.astro`, więc druk i wejścia kart nie mają krawędzi w tym grafie. Przypisanie powyżej jest z listy plików w commicie, nie z grafu.

Agenci ze stopki nie są kontaktami. Claude Sonnet 5.5, Cursor i Claude Opus 5.5 nie są drugą osobą w zespole.
