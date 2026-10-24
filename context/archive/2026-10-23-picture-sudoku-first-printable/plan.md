# Sudoku 4×4 z kształtami: pierwsza karta do druku — plan

## Overview

Rodzic wchodzi z katalogu na stronę „Sudoku” (`/sudoku`), klika Generuj i dostaje kartę A4 z planszą 4×4. Na planszy są cztery proste kształty, narysowane grubym czarnym konturem. W każdym wierszu brakuje jednego kształtu, a dziecko go dorysowuje. Karta ma podgląd i drukuje się jako jedna strona A4, także z telefonu. To plasterek S-18 roadmapy M-3 (US-12, FR-021).

Generator pełnego sudoku i solver liczący rozwiązania powstają od razu dla 4×4, 6×6 i 9×9 (bloki 2×2, 2×3, 3×3), bo S-19 dołoży rozmiary i poziomy bez przepisywania logiki. Strona w tym plasterku pokazuje tylko 4×4.

## Current State Analysis

- Wzorzec karty istnieje po symetrii (S-12): czysta logika w `src/lib/symmetry/` (importy względne z `.ts`), stałe rysunku w `sheet.ts`, układ strony w `layout.ts` (rzuca, gdy coś nie mieści się w marginesie), strona Astro z `GeneratorShell` i komponent React z Generuj, Drukuj, rogiem profilu i kartą SVG (`src/components/SymmetryGenerator.tsx`).
- Katalog: `src/lib/cards.ts` ma dwa wpisy; miniatury w `public/thumbnails/` buduje `scripts/build-thumbnails.mjs` (`npm run thumbnails`) z prawdziwych generatorów ze stałym ziarnem.
- Druk: `@page` żyje tylko w `GeneratorShell.astro`; `src/lib/sheet/print-contract.test.ts` pilnuje klas SVG (`print:w-[210mm]`, `print:h-[297mm]`, `print:overflow-hidden`) dla każdej strony generatora.
- `npm test` wylicza pliki testów jawnie (`package.json:12`), więc nowe testy trzeba dopisać do skryptu.
- `scripts/smoke.mjs` sprawdza zdanie opisu każdej strony; `tests/e2e/catalog.spec.ts` i `phone-layout.spec.ts` mają przypadki labiryntu i symetrii.
- Kodu sudoku nie ma.

## Desired End State

- `/sudoku` pokazuje opis, róg profilu i Generuj. Po Generuj pokazuje kartę A4 (`role="img"`, `aria-label="Sudoku"`) i Drukuj. Nie ma paska „Postać” ani innych ustawień.
- Karta: zdanie polecenia „Dorysuj brakujący kształt. W każdym rzędzie, kolumnie i kwadracie każdy kształt jest raz.” nad planszą 4×4 o polach ok. 40 mm (160×160 mm), wyśrodkowaną w marginesie 10 mm. Linie: cienkie między polami, grube między kwadratami 2×2 i ramka. W 12 polach stoją kształty jako grube czarne kontury z pustym środkiem; 4 pola są puste, po jednym w każdym wierszu, w losowej kolumnie. Bez paska kształtów, bez legendy, bez odpowiedzi.
- Cztery kształty karty są losowane z pięciu: koło, kwadrat, trójkąt, serce, krzyżyk. Kolejne Generuj daje kartę o innym kluczu niż poprzednia.
- Katalog na `/` ma miniaturę „Sudoku” obok pozostałych, prowadzącą do `/sudoku`.
- `src/lib/sudoku/` ma też gotowe dla S-19: wszystkie dziewięć kształtów, pełne sudoku 6×6 i 9×9, solver i usuwanie pól do zadanej liczby pustych z kontrolą jednego rozwiązania.

### Key Discoveries:

- Strona karty z rogiem profilu, Generuj/Drukuj i przełączaniem `has-sheet`: `src/components/SymmetryGenerator.tsx:26-169`.
- Układ strony z rzutem przy przekroczeniu marginesu: `src/lib/symmetry/layout.ts:30-55`.
- Stałe rysunku współdzielone z miniaturą: `src/lib/symmetry/sheet.ts:1-18`; miniatura symetrii w `scripts/build-thumbnails.mjs:89-141`.
- Generator z kluczem poprzedniej karty i limitem prób: `src/lib/symmetry/generate.ts:38-61`.
- Kontrakt druku dla strony symetrii: `src/lib/sheet/print-contract.test.ts:81-110`.

## What We're NOT Doing

- Paski „Rozmiar” i „Poziom”, plansze 6×6 i 9×9 na stronie, przełącznik „Kształty / Cyfry” — S-19.
- Kolory kształtów — S-20.
- Pasek kształtów nad planszą i legenda (decyzja 2026-10-24: tylko plansza).
- Wymóg „jedno puste na kolumnę / kwadrat” w 4×4. Puste pola są losowe w wierszu; wszystkie cztery mogą wypaść w jednej kolumnie (decyzja użytkowniczki).
- Gwiazdka, romb, księżyc i kropla na karcie 4×4. Są rysowane w `shapes.ts` i na makiecie, ale 4×4 ich nie losuje.
- Zapisywanie czegokolwiek w profilu lub w ostatnich parametrach. Strona nie dotyka `printo-kids:last-used`.
- Postacie z katalogu labiryntu.

## Implementation Approach

Kolejność jak przy symetrii, ale z makietą na początku. Faza 1 rysuje kształty i układ karty i daje plik SVG do wydruku. Użytkowniczka akceptuje kształty, zanim powstanie reszta. Faza 2 to czysta logika z testami jednostkowymi. Faza 3 to strona. Faza 4 to katalog, miniatura, smoke i e2e. Rysunek dzielą trzy miejsca: komponent React, skrypt makiety i skrypt miniatury. Dlatego geometria (ścieżki kształtów, pozycje linii i pól) siedzi w czystych funkcjach w `src/lib/sudoku/`, a każde miejsce tylko składa z niej znaczniki.

## Critical Implementation Details

- **Importy w `src/lib/sudoku/`:** tylko względne z rozszerzeniem `.ts`, bez `@/` i bez Reacta. `npm test`, `npm run thumbnails` i skrypt makiety uruchamiają je przez `node --experimental-strip-types`, a ten nie rozwiązuje aliasu.
- **Grubość konturu w mm:** ścieżka kształtu powstaje od razu w jednostkach strony (mm) dla zadanego środka i rozmiaru, a nie przez `transform: scale`. Inaczej skalowanie pogrubi albo pocieni kontur i S-19 z polami ok. 18 mm dostanie inną kreskę niż ta, którą zatwierdzono na makiecie.
- **Zdanie polecenia:** przy rozmiarze czcionki ok. 6–7 mm całe zdanie jest szersze niż 190 mm, więc polecenie to lista linii. Układ liczy wysokość bloku z liczby linii, a test pilnuje, że najdłuższa linia (szacunek: liczba znaków × 0,55 × rozmiar) mieści się w szerokości wewnątrz marginesu.

## Phase 1: Kształty, układ karty i makieta

### Overview

Dziewięć kształtów jako ścieżki SVG, stałe rysunku i układ karty 4×4 na A4, a do tego skrypt, który pisze makietę do wydruku. Faza kończy się ręczną akceptacją kształtów.

### Changes Required:

#### 1. Kształty

**File**: `src/lib/sudoku/shapes.ts`, `src/lib/sudoku/shapes.test.ts`

**Intent**: Jedno źródło wyglądu kształtów dla strony, makiety i miniatury. Kontur rysuje się bez wypełnienia, żeby S-20 mogło dołożyć kolor środka.

**Contract**: `type SudokuShapeId = "circle" | "square" | "triangle" | "heart" | "cross" | "star" | "diamond" | "moon" | "drop"`; `SUDOKU_SHAPES: readonly SudokuShapeId[]` (dziewięć); `SUDOKU_SHAPES_4: readonly SudokuShapeId[] = ["circle", "square", "triangle", "heart", "cross"]`; `SUDOKU_SHAPE_NAMES: Record<SudokuShapeId, string>` (polskie nazwy); `sudokuShapePath(id, cx, cy, size): string` zwraca `d` w mm, mieszczące się w kwadracie `size` wokół środka. Krzyżyk to „×” z pogrubionymi ramionami jako zamknięty kontur, nie dwie linie, żeby wyglądał jak pozostałe kształty. Testy: każda ścieżka jest niepusta i jej punkty leżą w kwadracie `size`, a dziewięć identyfikatorów jest unikatowych.

#### 2. Stałe rysunku

**File**: `src/lib/sudoku/sheet.ts`

**Intent**: Liczby wspólne dla strony i miniatury, jak `SYMMETRY_SHEET`.

**Contract**: `SUDOKU_SHEET` z: `pageWidth: 210`, `pageHeight: 297`, `inset: 10`, `cellSize4: 40`, `instructionLines` (dwie lub trzy linie zdania „Dorysuj brakujący kształt. W każdym rzędzie, kolumnie i kwadracie każdy kształt jest raz.”), `instructionSize`, `instructionLineGap`, `instructionGap`, `cellStroke` (cienka), `blockStroke` i `frameStroke` (gruba), `shapeScale: 0.65` (bok kształtu względem pola), `shapeStroke: 1.2`.

#### 3. Układ karty

**File**: `src/lib/sudoku/layout.ts`, `src/lib/sudoku/layout.test.ts`

**Intent**: Umieszcza polecenie i planszę dowolnego rozmiaru na stronie oraz podaje linie i środki pól. S-19 użyje tego samego dla 6×6 i 9×9.

**Contract**: `layoutSudokuSheet({ pageWidth, pageHeight, inset, size, blockRows, blockColumns, cellSize, instructionLineCount, instructionSize, instructionLineGap, instructionGap }): SudokuSheetLayout` z `instruction: { x, ys: number[] }`, `grid: { x, y, width, height }`, `cellLines` (cienkie, bez linii bloków), `blockLines` (grube, wewnątrz ramki) i `cellCenter(row, col)`. Plansza jest wyśrodkowana w poziomie, a blok polecenia z planszą w pionie, wewnątrz marginesu. Rzuca, gdy blok nie mieści się w marginesie. Testy: dla 4×4 przy 40 mm plansza ma 160×160 i leży w marginesie 10 mm z każdej strony; są 2 grube linie wewnętrzne (po jednej w pionie i poziomie) i 4 cienkie; za duży `cellSize` rzuca; najdłuższa linia polecenia mieści się w szerokości wewnątrz marginesu.

#### 4. Makieta

**File**: `scripts/sudoku-mockup.mjs`, wynik `context/changes/picture-sudoku-first-printable/mockup.svg`

**Intent**: Plik do wydruku na A4, na którym użytkowniczka ocenia kształty i kartę przed resztą pracy. Rysuje stałą przykładową kartę 4×4 (ręcznie wpisane poprawne sudoku, jedno puste w wierszu) z poleceniem, a poniżej, w wolnym miejscu strony, wszystkie dziewięć kształtów w jednym rzędzie lub dwóch, podpisanych nazwą.

**Contract**: `node --experimental-strip-types scripts/sudoku-mockup.mjs` pisze plik `mockup.svg` o `viewBox="0 0 210 297"` i `width="210mm" height="297mm"`. Literalne kolory (`#000`, `#fff`) są w skrypcie dozwolone, jak w `build-thumbnails.mjs`. Skrypt zostaje w repo, ale nie ma wpisu w `package.json`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi z dopisanymi `src/lib/sudoku/shapes.test.ts` i `src/lib/sudoku/layout.test.ts`
- `npm run lint` i `npx astro check` przechodzą
- `node --experimental-strip-types scripts/sudoku-mockup.mjs` pisze `mockup.svg` bez błędu

#### Manual Verification:

- Wydruk `mockup.svg` na A4: użytkowniczka akceptuje wygląd dziewięciu kształtów (czytelne, łatwe do odrysowania przez dziecko)
- Na wydruku pola 40 mm dają dość miejsca na rysunek kredką, a grube linie kwadratów 2×2 są wyraźne
- Zdanie polecenia jest czytelne i nie wychodzi poza margines

**Implementation Note**: Po fazie zatrzymaj się na akceptację makiety. Poprawki kształtów wracają do `shapes.ts` i `sheet.ts`, zanim zacznie się faza 2.

---

## Phase 2: Generator i solver

### Overview

Logika sudoku dla wszystkich trzech rozmiarów oraz karta 4×4 z jednym pustym polem w wierszu.

### Changes Required:

#### 1. Bloki, pełne sudoku i solver

**File**: `src/lib/sudoku/generate.ts`, `src/lib/sudoku/generate.test.ts`

**Intent**: Losowe pełne sudoku i liczenie rozwiązań, żeby każda pokazana plansza miała dokładnie jedno rozwiązanie.

**Contract**:

- `type SudokuSize = 4 | 6 | 9`; `sudokuBlock(size): { rows: number; columns: number }` → 2×2, 2×3 (2 rzędy, 3 kolumny), 3×3.
- `type SudokuGrid = readonly (readonly (number | null)[])[]`, wartości `0..size-1` to indeksy symboli, `null` to puste pole.
- `fullSudoku(random, size): number[][]` — losowe poprawne wypełnienie (backtracking z losową kolejnością wartości).
- `countSudokuSolutions(grid, size, limit = 2): number` — przerywa po `limit` rozwiązaniach.
- `carveSudoku(random, solution, size, blanks): SudokuGrid | null` — usuwa pola w losowej kolejności, zostawia tylko usunięcia, po których rozwiązanie jest nadal jedno, i kończy przy `blanks` pustych; `null`, gdy z tej jednej pełnej planszy się nie da.
- `generateSudokuPuzzle(random, size, blanks): { givens: SudokuGrid; solution: number[][] } | null` — losuje nową pełną planszę (`fullSudoku`) i wywołuje `carveSudoku` do `MAX_PUZZLE_ATTEMPTS` razy; `null` dopiero po wyczerpaniu prób. To jest wejście dla S-19.
- Testy używają `mulberry32` ze stałymi ziarnami (jak `src/lib/symmetry/generate.test.ts:475`), więc są deterministyczne. `fullSudoku` dla 4, 6, 9 daje każdy symbol raz w każdym wierszu, kolumnie i bloku (kilka ziaren); solver zwraca 1 dla pełnej planszy z jednym pustym, 2 (limit) dla pustej planszy; `generateSudokuPuzzle` dla 9×9 przy 52 pustych i dla 6×6 przy 22 pustych, dla kilku ziaren, daje wynik w limicie prób, dokładnie tyle pustych i jedno rozwiązanie, a `givens` zgadza się z `solution`. W `npm test` nie ma progu czasu; czas sprawdza ręczna weryfikacja tej fazy.

#### 2. Karta 4×4

**File**: `src/lib/sudoku/generate.ts`, `src/lib/sudoku/generate.test.ts`

**Intent**: Karta, którą pokazuje strona: cztery kształty z puli pięciu, pełne sudoku 4×4, jedno puste pole w każdym wierszu w losowej kolumnie i klucz do pilnowania, żeby kolejna karta była inna.

**Contract**:

- `interface SudokuCard { size: 4; shapes: readonly SudokuShapeId[]; givens: SudokuGrid; solution: readonly (readonly number[])[]; key: string }`; `shapes[i]` to kształt symbolu `i`.
- `generateSudokuCard4(random, previousKey: string | null): SudokuCard | null` losuje aż do `MAX_ATTEMPTS`, aż klucz będzie inny niż `previousKey` i karta nie będzie miała problemów.
- `sudokuCardProblems(card): readonly SudokuProblem[]` z problemami: `invalid-solution`, `givens-differ-from-solution`, `blank-count-per-row` (każdy wiersz ma dokładnie jedno puste), `shape-outside-pool`, `duplicate-shape`, `not-unique` (`countSudokuSolutions` ≠ 1).
- Klucz zawiera kształty w kolejności symboli i plansze `givens`, więc ta sama plansza z innymi kształtami to inna karta.
- Testy: karta z kilku ziaren nie ma problemów; każdy problem ma przypadek, który go wywołuje; dwa kolejne wywołania z kluczem poprzedniej dają inny klucz; w 200 kartach pojawia się każdy z pięciu kształtów i każda kolumna pustego pola w każdym wierszu (losowość nie jest zablokowana); żadna karta nie używa gwiazdki, rombu, księżyca ani kropli.

#### 3. Skrypt testów

**File**: `package.json`

**Intent**: Dopisać `src/lib/sudoku/generate.test.ts` do `test`.

**Contract**: Skrypt `test` wylicza też nowy plik; reszta listy bez zmian.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym `src/lib/sudoku/generate.test.ts`
- `npm run lint` i `npx astro check` przechodzą

#### Manual Verification:

- Jednorazowy lokalny pomiar: 20 wywołań `generateSudokuPuzzle` dla 9×9 przy 52 pustych, każde wyraźnie poniżej 5 s (wynik zapisany w notatce do fazy)

---

## Phase 3: Strona `/sudoku`

### Overview

Strona generatora sudoku według wzorca symetrii, bez ustawień.

### Changes Required:

#### 1. Strona

**File**: `src/pages/sudoku.astro`

**Intent**: Nowa trasa w tej samej powłoce co inne karty.

**Contract**: `Layout` + `GeneratorShell description="Wygeneruj kartę sudoku i wydrukuj ją na kartce A4."` + `<SudokuGenerator client:only="react" />`.

#### 2. Komponent

**File**: `src/components/SudokuGenerator.tsx`

**Intent**: Generuj, Drukuj, róg profilu (ten sam hook i te same propsy co `SymmetryGenerator`), karta SVG. Bez paska „Postać”, bez poziomu, bez przełączników. Komunikat „Nie udało się ułożyć karty.”, gdy generator zwróci `null`.

**Contract**: Te same klasy przycisków i układ przed i po pierwszej karcie co `SymmetryGenerator.tsx:117-155`, z przełączaniem `has-sheet` na `#worksheet-home`. Karta to `<svg role="img" aria-label="Sudoku">` z tymi samymi klasami druku (`aspect-[210/297] … print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0`) i `printColorAdjust: "exact"`. Rysuje tło `var(--card)`, linie polecenia, kształty `givens` (`sudokuShapePath` ze środkiem pola, `fill="none"`, `stroke="var(--foreground)"`, `strokeWidth={SUDOKU_SHEET.shapeStroke}`, `strokeLinejoin="round"`), potem cienkie linie, grube linie bloków i ramkę z `layoutSudokuSheet`. Kolory tylko z tokenów (`var(--foreground)`, `var(--card)`), klasy przez `cn()`.

#### 3. Kontrakt druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Te same gwarancje druku co dla symetrii, dla nowej strony.

**Contract**: Stałe `SUDOKU_PAGE` i `SUDOKU_GENERATOR`; testy: SVG sudoku ma `print:w-[210mm]`, `print:h-[297mm]`, `print:max-h-[297mm]`, `print:overflow-hidden`; elementy ekranu poza kartą mają `print:hidden`; strona żyje pod `/sudoku`, używa `GeneratorShell` i nie ma własnego `@page`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym nowe przypadki kontraktu druku
- `npm run lint`, `npx astro check` i `npm run build` przechodzą

#### Manual Verification:

- Na `/sudoku` w `npm run dev`: Generuj pokazuje kartę zgodną z zaakceptowaną makietą, kolejne Generuj daje inną kartę
- Podgląd wydruku w Chrome to jedna strona A4 bez elementów ekranu

---

## Phase 4: Katalog, miniatura, smoke i e2e

### Overview

Sudoku wchodzi do katalogu z miniaturą z prawdziwego generatora; smoke i Playwright chronią stronę; na końcu druk w przeglądarkach.

### Changes Required:

#### 1. Katalog

**File**: `src/lib/cards.ts`

**Intent**: Trzeci wpis katalogu.

**Contract**: `{ id: "sudoku", title: "Sudoku", href: "/sudoku", thumbnail: "/thumbnails/sudoku.svg" }` na końcu `CARD_KINDS`. S-16 (sekwencje) dopisuje tu swój wpis równolegle; przy konflikcie zostają oba wpisy.

#### 2. Miniatura

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/sudoku.svg` (generowany)

**Intent**: Ten sam skrypt pisze też miniaturę sudoku z `generateSudokuCard4`, `layoutSudokuSheet` i `sudokuShapePath` ze stałym, osobnym ziarnem, więc miniatura nie rozjedzie się z kartą.

**Contract**: `npm run thumbnails` daje bajtowo ten sam `sudoku.svg` przy każdym uruchomieniu i nie zmienia `labirynt.svg` ani `symetria.svg`.

#### 3. Smoke

**File**: `scripts/smoke.mjs`

**Intent**: Sprawdzić, że `/sudoku` jest serwowane.

**Contract**: Przypadek „sudoku renders the worksheet sentence”: `/sudoku` → 200 i zdanie „Wygeneruj kartę sudoku i wydrukuj ją na kartce A4.”; komentarz nagłówka wymienia `/sudoku`.

#### 4. E2E

**File**: `tests/e2e/catalog.spec.ts`, `tests/e2e/phone-layout.spec.ts`

**Intent**: Pokryć US-05 i US-04 dla nowej strony tymi samymi wzorcami co symetria.

**Contract**: Katalog: link „Sudoku” → `/sudoku` → Generuj → widać `getByRole("img", { name: "Sudoku" })` → „Wszystkie karty” → profil wybrany wcześniej nadal wybrany. Telefon: na `/sudoku` po Generuj nie ma przewijania w bok, a Generuj, Drukuj i róg Profilu nie nachodzą na siebie, na tych samych rozmiarach ekranu co symetria. Lokatory `getByRole` / `getByText`, bez `waitForTimeout`. Komentarze proweniencji dopisują `picture-sudoku-first-printable (US-12)`.

### Success Criteria:

#### Automated Verification:

- `npm run thumbnails` dwa razy daje ten sam `sudoku.svg`, a `labirynt.svg` i `symetria.svg` się nie zmieniają
- `npm test`, `npm run lint`, `npx astro check` i `npm run build` przechodzą
- `npm run smoke` przeciw podglądowi przechodzi
- Lokalne `npx playwright test` przechodzi, w tym nowe przypadki sudoku

#### Manual Verification:

- Katalog na telefonie i komputerze pokazuje czytelną miniaturę „Sudoku” obok pozostałych
- Druk jednej strony A4 z `/sudoku` w Chrome, Edge, Firefox, Brave i Safari na komputerze
- Na telefonie przyciski nie nachodzą na siebie, podgląd zostaje, wydruk to jedna strona A4
- Wydruk testowy z dzieckiem: dziecko rozumie, że w każdym rzędzie brakuje jednego kształtu, i daje radę go narysować w polu 40 mm

**Implementation Note**: Zakończenie fazy zamyka S-18. Status roadmapy i issue aktualizuje `/10x-archive`.

---

## Testing Strategy

### Unit Tests:

- `shapes.test.ts`: dziewięć unikatowych kształtów, każda ścieżka mieści się w swoim kwadracie, pula 4×4 to dokładnie pięć wybranych kształtów.
- `layout.test.ts`: plansza 4×4 przy 40 mm leży w marginesie 10 mm, liczba cienkich i grubych linii, rzut przy za dużym polu, polecenie mieści się w szerokości.
- `generate.test.ts`: poprawność pełnego sudoku dla 4, 6, 9; solver z limitem; `generateSudokuPuzzle` przy 22 (6×6) i 52 (9×9) pustych z jednym rozwiązaniem, deterministycznie (`mulberry32`), bez progu czasu; karta 4×4 bez problemów, każdy problem wywołany, brak powtórki klucza, rozkład kształtów i kolumn pustych pól.
- `print-contract.test.ts`: klasy druku i powłoka dla `/sudoku`.

### Integration Tests:

- Playwright: katalog → `/sudoku` → Generuj → karta → powrót z zachowanym profilem; układ telefonu na `/sudoku`.
- Smoke: `/sudoku` → 200 ze zdaniem opisu.

### Manual Testing Steps:

1. Wydrukuj `mockup.svg` i zaakceptuj kształty (bramka po fazie 1).
2. Na `/sudoku` kliknij Generuj kilka razy; sprawdź, że w każdym wierszu brakuje dokładnie jednego kształtu i że karty się zmieniają.
3. Wydrukuj kartę w każdej przeglądarce z listy US-04 na komputerze i na telefonie; sprawdź jedną stronę A4 i margines.
4. Daj wydruk dziecku i sprawdź, czy rozumie zadanie bez paska kształtów.

## Performance Considerations

Karta 4×4 jest natychmiastowa. Jedyny koszt to `generateSudokuPuzzle` dla 9×9 przy 52 pustych (S-19): każde usunięcie pola uruchamia solver z limitem 2, a utknięcie zaczyna od nowej pełnej planszy. Limit 5 s z PRD sprawdza ręczny pomiar w fazie 2, a nie próg czasu w `npm test` (próg byłby niestabilny na CI). Jeśli pomiar wyjdzie za blisko limitu, solver dostaje wybór pola z najmniejszą liczbą kandydatów.

## Migration Notes

Brak. Nowa strona i nowe pliki; profil i ostatnie parametry bez zmian.

## References

- Roadmapa: `context/foundation/roadmap.md` — S-18 (`picture-sudoku-first-printable`), S-19, S-20
- PRD: US-12, FR-021, Business Logic „Karta sudoku”
- Decyzje z rozmowy: `context/changes/picture-sudoku-first-printable/change.md`
- Wzorzec karty: `context/archive/2026-10-23-symmetry-first-printable/plan.md`, `src/components/SymmetryGenerator.tsx`, `src/lib/symmetry/layout.ts`, `src/lib/symmetry/sheet.ts`
- Kontrakt druku: `src/lib/sheet/print-contract.test.ts`
- Miniatury: `scripts/build-thumbnails.mjs`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Kształty, układ karty i makieta

#### Automated

- [x] 1.1 `npm test` przechodzi z dopisanymi `src/lib/sudoku/shapes.test.ts` i `src/lib/sudoku/layout.test.ts` — 3f9b67f
- [x] 1.2 `npm run lint` i `npx astro check` przechodzą — 3f9b67f
- [x] 1.3 `node --experimental-strip-types scripts/sudoku-mockup.mjs` pisze `mockup.svg` bez błędu — 3f9b67f

#### Manual

- [x] 1.4 Wydruk `mockup.svg` na A4: użytkowniczka akceptuje wygląd dziewięciu kształtów (czytelne, łatwe do odrysowania przez dziecko) — 3f9b67f
- [x] 1.5 Na wydruku pola 40 mm dają dość miejsca na rysunek kredką, a grube linie kwadratów 2×2 są wyraźne — 3f9b67f
- [x] 1.6 Zdanie polecenia jest czytelne i nie wychodzi poza margines — 3f9b67f

### Phase 2: Generator i solver

#### Automated

- [x] 2.1 `npm test` przechodzi, w tym `src/lib/sudoku/generate.test.ts` — 3a98afc
- [x] 2.2 `npm run lint` i `npx astro check` przechodzą — 3a98afc

#### Manual

- [x] 2.3 Jednorazowy lokalny pomiar: 20 wywołań `generateSudokuPuzzle` dla 9×9 przy 52 pustych, każde wyraźnie poniżej 5 s (wynik zapisany w notatce do fazy) — 3a98afc

### Phase 3: Strona `/sudoku`

#### Automated

- [x] 3.1 `npm test` przechodzi, w tym nowe przypadki kontraktu druku — 3f2acbe
- [x] 3.2 `npm run lint`, `npx astro check` i `npm run build` przechodzą — 3f2acbe

#### Manual

- [x] 3.3 Na `/sudoku` w `npm run dev`: Generuj pokazuje kartę zgodną z zaakceptowaną makietą, kolejne Generuj daje inną kartę — 3f2acbe
- [x] 3.4 Podgląd wydruku w Chrome to jedna strona A4 bez elementów ekranu — 3f2acbe

### Phase 4: Katalog, miniatura, smoke i e2e

#### Automated

- [x] 4.1 `npm run thumbnails` dwa razy daje ten sam `sudoku.svg`, a `labirynt.svg` i `symetria.svg` się nie zmieniają — 025e157
- [x] 4.2 `npm test`, `npm run lint`, `npx astro check` i `npm run build` przechodzą — 025e157
- [x] 4.3 `npm run smoke` przeciw podglądowi przechodzi — 025e157
- [x] 4.4 Lokalne `npx playwright test` przechodzi, w tym nowe przypadki sudoku — 025e157

#### Manual

- [x] 4.5 Katalog na telefonie i komputerze pokazuje czytelną miniaturę „Sudoku” obok pozostałych — 025e157
- [x] 4.6 Druk jednej strony A4 z `/sudoku` w Chrome, Edge, Firefox, Brave i Safari na komputerze — 025e157
- [x] 4.7 Na telefonie przyciski nie nachodzą na siebie, podgląd zostaje, wydruk to jedna strona A4 — 025e157
- [ ] 4.8 Wydruk testowy z dzieckiem: dziecko rozumie, że w każdym rzędzie brakuje jednego kształtu, i daje radę go narysować w polu 40 mm
