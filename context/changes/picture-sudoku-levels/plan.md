# Sudoku: rozmiary, poziomy i cyfry — plan

## Overview

Na stronie `/sudoku` rodzic wybiera rozmiar planszy (4×4, 6×6, 9×9), poziom (łatwy, średni, trudny) i, przy 6×6 i 9×9, symbole: kształty albo cyfry. Karta zawsze ma dokładnie jedno rozwiązanie i mieści się na jednej stronie A4 z marginesem 10 mm, także z telefonu. To plasterek S-19 roadmapy M-3 (US-13, FR-022). Kolory kształtów to osobny S-20.

Generator i solver dla 4×4, 6×6 i 9×9 istnieją od S-18; ten plan dokłada poziomy (liczby pustych pól), wspólny model karty, cyfry, układ zależny od rozmiaru i pasek ustawień. Liczby pustych pól są startowe (PRD, pytanie otwarte 9): użytkowniczka ocenia je na wydruku, zanim powstanie strona.

## Current State Analysis

- `src/lib/sudoku/generate.ts`: `fullSudoku`, `countSudokuSolutions`, `carveSudoku`, `generateSudokuPuzzle(random, size, blanks)` i `sudokuBlock(size)` działają dla 4/6/9. `SudokuCard` ma `size: 4`, a `generateSudokuCard4` i `sudokuCardProblems` są na sztywno 4×4. Pomiar przy planowaniu (40 plansz na ustawienie): 6×6 z 12/18/22 pustymi i 9×9 z 35/45/52 pustymi układa się średnio w 0,2–1,3 ms, najwolniej 3,6 ms, bez porażek. Budżet 5 s ma ogromny zapas.
- `src/lib/sudoku/layout.ts` (`layoutSudokuSheet`) jest ogólny: bierze `size`, `blockRows`, `blockColumns`, `cellSize` i rzuca, gdy plansza nie mieści się w marginesie.
- `src/lib/sudoku/sheet.ts` ma jedną stałą pola `cellSize4: 40` i trzy linie polecenia pod 4×4.
- `src/lib/sudoku/shapes.ts`: dziewięć kształtów (`SUDOKU_SHAPES`), pula `SUDOKU_SHAPES_4` (pięć najprostszych), `sudokuShapePath(id, cx, cy, size)` w mm.
- `src/components/SudokuGenerator.tsx`: bez ustawień; `SudokuSheet` ma `blockRows: 2`, `blockColumns: 2` i `cellSize4` na sztywno (finding F3 z przeglądu implementacji S-18). Te same literały są w `scripts/sudoku-mockup.mjs` i `scripts/build-thumbnails.mjs`.
- Wzorzec paska: `src/components/SymmetryGenerator.tsx` (przycisk poziomu z oknem, nowa karta po zmianie poziomu, `flex-wrap` paska) i `SymmetryLevelChoice.tsx` (`Dialog`, `DIALOG_ROW_CLASS`). W `src/components/ui/` nie ma grupy przełączników ani zakładek (`button`, `dialog`, `input`, `switch`, `tooltip`).
- `npm test` wylicza pliki jawnie (`package.json:12`). `src/lib/sheet/print-contract.test.ts` pilnuje dokładnych napisów klas z `print:hidden` w `SudokuGenerator.tsx`.

## Desired End State

- Pasek ustawień nad kartą (przed pierwszą kartą i po niej, jak w symetrii): przycisk „Rozmiar: 4×4” z oknem (4×4, 6×6, 9×9), przycisk „Poziom: łatwy” z oknem (łatwy, średni, trudny; ukryty przy 4×4), dwa przyciski „Kształty” / „Cyfry” obok siebie (widoczne tylko przy 6×6 i 9×9). Domyślnie 4×4 z kształtami, poziom łatwy.
- Zmiana rozmiaru, poziomu lub symboli, gdy karta jest na ekranie, od razu generuje nową kartę. Przed pierwszą kartą zmiana tylko ustawia stan.
- Liczby pustych pól: 4×4 cztery (jedno w każdym wierszu, miejsce losowe); 6×6 łatwy 12, średni 18, trudny 22 z 36; 9×9 łatwy 35, średni 45, trudny 52 z 81. Zawsze dokładnie jedno rozwiązanie.
- Symbole: 4×4 cztery kształty z pięciu najprostszych; 6×6 sześć kształtów losowanych z dziewięciu; 9×9 wszystkie dziewięć; cyfry 1–6 albo 1–9 jako czarny tekst. Kształty to kontury jak w S-18.
- Polecenie nad planszą to jedno krótkie zdanie dla każdego rozmiaru i symboli: „Uzupełnij puste pola.” oraz „Nic się nie powtarza w rzędzie, kolumnie i bloku.” (dwie linie; zastępuje trzyliniowe polecenie 4×4 z S-18).
- Pola mają rozmiar zależny od rozmiaru planszy (startowo 4×4: 40 mm, 6×6: 28 mm, 9×9: 20 mm; grube linie bloków wg `sudokuBlock`). Każda plansza mieści się w marginesie 10 mm i drukuje się jako jedna strona A4.
- Miniatura w katalogu nadal pokazuje kartę 4×4.

### Key Discoveries:

- Układ jest już ogólny: `src/lib/sudoku/layout.ts:46-82` przyjmuje rozmiar i blok; trzeba tylko przestać podawać literały.
- `sudokuBlock(size)` w `src/lib/sudoku/generate.ts:33-37` jest jedynym źródłem kształtu bloku (2×2, 2×3, 3×3).
- Wzorzec przycisku z oknem: `src/components/SymmetryLevelChoice.tsx:8-56`; odświeżenie karty przy zmianie poziomu: `SymmetryGenerator.tsx:58-63`.
- Czas generowania nie jest ryzykiem (pomiar wyżej); ryzykiem jest czytelność 9×9 na papierze (pole 20 mm, kształt ok. 13 mm).

## What We're NOT Doing

- Kolory kształtów i przełącznik kolorów (S-20).
- Zapis rozmiaru, poziomu i symboli w profilu i w ostatnich parametrach (żyją w stanie strony, jak poziom symetrii; US-08 odłożone).
- Nazywanie poziomów sudoku wiekiem (decyzja 2026-10-24).
- Nowe kształty i zmiana ich rysunku.
- Wspólny `GenerateButton` dla wszystkich generatorów (finding F2 z przeglądu S-18) — osobna zmiana.
- Poziomy przy 4×4 i pokazywanie paska „Poziom” przy 4×4.
- Wybór kształtów 6×6 przez rodzica: zawsze losowe sześć z dziewięciu.

## Implementation Approach

Faza 1 jest bramką jakości: stałe rysunku zależne od rozmiaru, polecenie, rysowanie cyfr i skrypt, który pisze makiety do wydruku (prawdziwe plansze z generatora na najtrudniejszych poziomach). Użytkowniczka ocenia na papierze rozmiary pól, czytelność 9×9 i trudność liczb pustych. Faza 2 to czysta logika: moduł poziomów i uogólniony model karty z testami jednostkowymi. Faza 3 przerabia stronę: pasek i arkusz zależny od rozmiaru. Faza 4 domyka katalog, smoke, e2e i druk w przeglądarkach. Całą geometrię trzymają czyste funkcje w `src/lib/sudoku/`, a komponent, skrypt makiety i skrypt miniatury tylko składają z nich znaczniki, żeby nie rozjechały się z wydrukiem (finding F3).

## Critical Implementation Details

- **Importy w `src/lib/sudoku/`:** tylko względne z rozszerzeniem `.ts`, bez `@/` i bez Reacta (testy, makieta i miniatura biegną przez `node --experimental-strip-types`).
- **Cyfra to tekst w mm:** rozmiar czcionki cyfry liczy się z rozmiaru pola jak kształt (stała w `sheet.ts`), a cyfra jest środkowana w polu atrybutami `textAnchor` i `dominantBaseline`, jak polecenie. Cyfry nie mają koloru.
- **Klucz karty:** klucz obejmuje rozmiar, tryb symboli, kształty w kolejności symboli i givens, więc ta sama plansza z cyframi i z kształtami to dwie różne karty; Generuj po zmianie symboli nie jest odrzucane jako powtórka.
- **Kontrakt druku:** `print-contract.test.ts` sprawdza dokładne napisy klas `print:hidden`; jeśli faza 3 zmieni te klasy, test aktualizuje się razem ze zmianą, a klasy SVG (`print:w-[210mm]` itd.) zostają bez zmian.

## Faza 1: Rozmiary pól, cyfry, polecenie i makiety do wydruku

### Overview

Stałe rysunku zależne od rozmiaru planszy, jedno polecenie, rysowanie cyfr i skrypt makiety. Faza kończy się ręczną akceptacją wydruku 6×6 i 9×9.

### Changes Required:

#### 1. Stałe rysunku zależne od rozmiaru

**File**: `src/lib/sudoku/sheet.ts`

**Intent**: Zastąpić `cellSize4` rozmiarem pola zależnym od rozmiaru planszy, dodać rozmiar cyfry i dwuliniowe polecenie, i usunąć trzyliniowe polecenie 4×4.

**Contract**: `SUDOKU_SHEET.cellSize: Record<4 | 6 | 9, number>` (40, 28, 20 mm) zamiast `cellSize4`; `instructionLines` to dwie linie („Uzupełnij puste pola.” i „Nic się nie powtarza w rzędzie, kolumnie i bloku.”); stała `digitScale` (rozmiar cyfry względem pola). Wartości są startowe i zostają potwierdzone na wydruku.

#### 2. Układ dla każdego rozmiaru i przepięcie użytkowników stałych

**File**: `src/lib/sudoku/layout.ts`, `src/lib/sudoku/layout.test.ts`, `src/components/SudokuGenerator.tsx`, `scripts/build-thumbnails.mjs`

**Intent**: Nie zmieniać funkcji układu. Istniejące użycia `cellSize4` (`layout.test.ts:16`, `SudokuGenerator.tsx:149,156`, `build-thumbnails.mjs:179,186`) przepiąć na `SUDOKU_SHEET.cellSize[4]`; komponent i skrypt miniatury dalej czytają `instructionLines` (teraz dwie linie), żeby drzewo po fazie 1 przechodziło `lint`, `astro check` i `build`. Test układu dokłada przypadki, które dowodzą, że 6×6 (blok 2×3) i 9×9 (blok 3×3) z rozmiarami pól z `SUDOKU_SHEET` mieszczą się w marginesie 10 mm, mają właściwe linie bloków i że najdłuższa linia polecenia mieści się w szerokości.

**Contract**: `layoutSudokuSheet` bez zmiany sygnatury; asercje na `blockLines`/`cellLines` dla bloków 2×3 i 3×3 oraz na granicach `grid` względem `inset`.

#### 3. Skrypt makiet

**File**: `scripts/sudoku-mockup.mjs`

**Intent**: Pisać makiety kart 6×6 (kształty) i 9×9 (kształty oraz cyfry) z prawdziwych plansz z `generateSudokuPuzzle` na najtrudniejszych poziomach (6×6 z 22 pustymi, 9×9 z 52 pustymi), ze stałym ziarnem, do `context/changes/picture-sudoku-levels/`, do druku w skali 100%.

**Contract**: wyjście `mockup-6x6-shapes.svg`, `mockup-9x9-shapes.svg`, `mockup-9x9-digits.svg` (A4, literalne czarne kolory, jak dotychczas); blok i rozmiar pola z `sudokuBlock` i `SUDOKU_SHEET.cellSize`, bez literałów; sześć kształtów 6×6 wybranych deterministycznie z dziewięciu.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Skrypt zapisuje trzy makiety: `node --experimental-strip-types scripts/sudoku-mockup.mjs`

#### Manual Verification:

- Wydruk makiet w skali 100% na A4: pola 28 mm i 20 mm są wygodne dla dziecka, kształty w 20 mm czytelne, cyfry czytelne
- Liczby pustych pól 22 z 36 i 52 z 81 oceniasz jako nie za trudne (albo podajesz nowe liczby)
- Polecenie jest czytelne i mieści się na stronie
- Nic nie wychodzi poza margines 10 mm

**Implementation Note**: Po fazie 1 i przejściu testów zatrzymaj się na ręczne potwierdzenie wydruku. Stałe rozmiary pól i liczby pustych pól mogą się zmienić po akceptacji; faza 2 bierze zatwierdzone wartości.

---

## Faza 2: Poziomy i generator kart dla wszystkich rozmiarów

### Overview

Czysty moduł poziomów i jeden model karty dla 4×4, 6×6 i 9×9 z kształtami albo cyframi, z regułami sprawdzanymi dla każdego rozmiaru.

### Changes Required:

#### 1. Moduł ustawień i poziomów

**File**: `src/lib/sudoku/levels.ts` (nowy)

**Intent**: Jedno źródło prawdy dla rozmiarów, poziomów, etykiet na pasku i liczby pustych pól.

**Contract**: typy `SudokuSize` (z `generate.ts`), `SudokuLevelId = "latwy" | "sredni" | "trudny"`, `SudokuSymbols = "shapes" | "digits"`; `SUDOKU_SIZES` z etykietami „4×4”, „6×6”, „9×9”; `SUDOKU_LEVELS` z etykietami „łatwy”, „średni”, „trudny”; `sudokuBlankCount(size, level)` zwraca 4 dla 4×4 (poziom ignorowany), 12/18/22 dla 6×6, 35/45/52 dla 9×9; `sudokuHasLevels(size)` i `sudokuHasSymbolChoice(size)` (prawda dla 6 i 9); `DEFAULT_SUDOKU_SETTINGS` (4×4, łatwy, kształty).

#### 2. Uogólniony model i generator karty

**File**: `src/lib/sudoku/generate.ts`

**Intent**: Zastąpić `generateSudokuCard4` jednym `generateSudokuCard(random, previousKey, settings)`. Karta 4×4 nadal ma jedno puste pole w każdym wierszu, a 6×6 i 9×9 powstają z `generateSudokuPuzzle` z liczbą pustych z `levels.ts`. `sudokuCardProblems` sprawdza karty każdego rozmiaru.

**Contract**: `SudokuCard` ma `size: SudokuSize`, `symbols: SudokuSymbols`, `shapes: readonly SudokuShapeId[]` (puste przy cyfrach), `givens`, `solution`, `key` (obejmuje rozmiar, tryb symboli, kształty i givens). Pula kształtów: 4×4 cztery z `SUDOKU_SHAPES_4`, 6×6 sześć z dziewięciu, 9×9 wszystkie dziewięć, w losowej kolejności. Problemy: istniejące plus `blank-count` (liczba pustych różna od `sudokuBlankCount`; dla 4×4 nadal po jednym w wierszu), `shape-count` (liczba kształtów różna od rozmiaru przy kształtach), `shapes-with-digits` (kształty przy cyfrach); `not-unique` dla każdego rozmiaru, rozwiązanie liczone `countSudokuSolutions(givens, size)`; solver nie rusza źle uformowanych givens (zachować poprawkę F4 z S-18).

#### 3. Przepięcie wywołań `generateSudokuCard4` i testy

**File**: `src/lib/sudoku/levels.test.ts` (nowy), `src/lib/sudoku/generate.test.ts`; `src/components/SudokuGenerator.tsx` i `scripts/build-thumbnails.mjs` (tylko wywołanie); `package.json` (skrypt `test`)

**Intent**: Wywołania `generateSudokuCard4` w `SudokuGenerator.tsx:46`, `build-thumbnails.mjs:167` i w `generate.test.ts` (import w linii 7 oraz linie 57, 152, 171, 193, 275) przepiąć na `generateSudokuCard(…, DEFAULT_SUDOKU_SETTINGS)` w tej samej fazie, żeby `astro check` i `build` przechodziły; miniatura może zmienić planszę przez inną kolejność losowań. Testy liczb pustych dla wszystkich siedmiu ustawień, jednego rozwiązania, puli kształtów, kluczy kart i czasu generowania. Dopisać `src/lib/sudoku/levels.test.ts` do listy w skrypcie `test` (przy konflikcie z S-17 zostają oba wpisy).

**Contract**: dla każdej pary (rozmiar, poziom) i obu trybów symboli: wygenerowana karta ma `sudokuCardProblems(card).length === 0`, dokładnie `sudokuBlankCount` pustych pól i jedno rozwiązanie; dwie kolejne karty mają różne klucze; zmiana trybu symboli zmienia klucz; test czasu: 9×9 trudny, każda z 20 kart poniżej 1 s (budżet produktu to 5 s). Każdy problem z `SudokuProblem` ma test z celowo zepsutą kartą.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

#### Manual Verification:

- Pomiar czasu `generateSudokuPuzzle` dla 9×9 z 52 pustymi (skrypt jednorazowy) potwierdza rząd kilku milisekund

---

## Faza 3: Pasek ustawień i karta zależna od rozmiaru

### Overview

Strona `/sudoku` dostaje pasek „Rozmiar”, „Poziom” i „Kształty / Cyfry”, a arkusz SVG rysuje planszę każdego rozmiaru z kształtami lub cyframi.

### Changes Required:

#### 1. Przycisk z oknem wyboru

**File**: `src/components/SudokuChoice.tsx` (nowy)

**Intent**: Jeden mały komponent przycisku „Etykieta: wartość” z oknem listy, wzorowany na `SymmetryLevelChoice.tsx`, użyty dwa razy: dla rozmiaru i dla poziomu.

**Contract**: props `label` („Rozmiar” albo „Poziom”), `dialogTitle` („Wybierz rozmiar” albo „Wybierz poziom”, w `DialogTitle` z `sr-only` jak `SymmetryLevelChoice.tsx:35`), lista opcji `{id, label}`, wybrane `id`, `open`, `onOpenChange`, `onSelect`; `aria-label` w postaci `Rozmiar: 4×4`; wiersze okna z `DIALOG_ROW_CLASS`; okno z `print:hidden`.

#### 2. Dwa przyciski Kształty / Cyfry

**File**: `src/components/SudokuSymbolsChoice.tsx` (nowy)

**Intent**: Dwa przyciski obok siebie, wybrany podświetlony i oznaczony `aria-pressed`, oba widoczne naraz; cele dotykowe jak inne kontrolki paska.

**Contract**: props `symbols`, `onSelect`; renderowany tylko gdy `sudokuHasSymbolChoice(size)`; etykiety „Kształty” i „Cyfry”.

#### 3. Strona i arkusz

**File**: `src/components/SudokuGenerator.tsx`

**Intent**: Dodać stan rozmiaru, poziomu i symboli oraz pasek w obu układach (przed pierwszą kartą i po niej). Zmiana ustawienia przy widocznej karcie generuje nową kartę. `SudokuSheet` bierze blok z `sudokuBlock(card.size)` i rozmiar pola z `SUDOKU_SHEET.cellSize[card.size]`, rysuje kształt albo cyfrę zależnie od `card.symbols`.

**Contract**: `generateFor(settings)` przyjmuje pełne nowe ustawienia (rozmiar, poziom, symbole) jawnie, jak `generateFor(id)` w `SymmetryGenerator.tsx:58-69`, a nie czyta ich ze stanu po `setState`; ta sama bramka `waitingForChild` co przy Generuj; pasek w kontenerze `flex flex-wrap` jak w symetrii; poziom pokazany tylko gdy `sudokuHasLevels(size)`; `aria-label` arkusza zostaje „Sudoku”; klasy SVG druku bez zmian; cyfry jako `<text>` w kolorze `var(--foreground)`.

#### 4. Testy kontraktu druku i układu telefonu

**File**: `src/lib/sheet/print-contract.test.ts`, `tests/e2e/phone-layout.spec.ts`

**Intent**: Dopasować asercje klas `print:hidden` do nowego układu, jeśli się zmieni, i dołożyć do testu telefonu sprawdzenie, że po wyborze 9×9 z cyframi pasek zawija się bez sięgania poza ekran, a Generuj, Drukuj i Profil nie nachodzą na siebie.

**Contract**: bez zmiany klas SVG; test telefonu: wybór „Rozmiar: 9×9” w oknie, Generuj, brak przewijania w bok, brak nakładania przycisków.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy i build przechodzą: `npx astro check` i `npm run build`

#### Manual Verification:

- Na komputerze i telefonie: wybór każdego rozmiaru, poziomu i symboli daje kartę, która mieści się w ramce strony i nie wychodzi poza A4
- Przy 4×4 nie ma przycisków „Poziom” ani „Kształty / Cyfry”; przy 6×6 i 9×9 są
- Zmiana ustawienia przy widocznej karcie daje nową kartę, a Drukuj i Generuj nie nachodzą na siebie na telefonie
- Czas od kliknięcia Generuj do karty 9×9 trudnego wygląda na natychmiastowy

---

## Faza 4: Miniatura, smoke, e2e i druk w przeglądarkach

### Overview

Skrypt miniatury przechodzi na uogólniony generator (wygląd bez zmian), testy e2e i smoke obejmują nowe ustawienia, a druk potwierdza się na papierze.

### Changes Required:

#### 1. Miniatura

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/sudoku.svg`

**Intent**: Użyć `generateSudokuCard` z ustawieniami 4×4 i `sudokuBlock`/`SUDOKU_SHEET.cellSize[4]` zamiast `generateSudokuCard4` i literałów; miniatura pozostaje kartą 4×4.

**Contract**: ten sam seed daje miniaturę z poprawną planszą 4×4; plik SVG odbudowany `npm run thumbnails` różni się od poprzedniego co najwyżej poleceniem (dwie linie zamiast trzech) i ewentualnie planszą, jeśli zmieni się kolejność losowań.

#### 2. e2e i smoke

**File**: `tests/e2e/sudoku-levels.spec.ts` (nowy), `scripts/smoke.mjs` (bez zmian, jeśli opis strony zostaje)

**Intent**: Test przechodzi po ustawieniach: domyślnie 4×4 bez przycisków poziomu i symboli, wybór 6×6 pokazuje „Poziom” i „Kształty / Cyfry”, wybór 9×9, cyfr i trudnego daje kartę z dziewięcioma kolumnami (nowe ustawienia, nie stare ze stanu), powrót do 4×4 chowa te kontrolki.

**Contract**: test używa `getByRole("button", { name: "Rozmiar: …" })` i okna wyboru; liczy w arkuszu elementy `<text>` z cyframi dla trybu cyfr.

### Success Criteria:

#### Automated Verification:

- Wszystkie testy: `npm test`
- Lint, typy, build: `npm run lint`, `npx astro check`, `npm run build`
- e2e: `npx playwright test`
- Smoke: `npm run smoke` na działającym serwerze

#### Manual Verification:

- Wydruk jednej strony A4 każdego z siedmiu ustawień, także z telefonu, w co najmniej Chrome i Safari (iOS)
- Brave i Firefox na komputerze drukują 9×9 jako jedną stronę
- Dziecko radzi sobie z poziomem łatwym 6×6 i z 4×4; liczby pustych pól 6×6 i 9×9 uznajesz za dobre albo podajesz nowe (PRD, pytanie otwarte 9)

---

## Testing Strategy

### Unit Tests:

- `levels.test.ts`: liczby pustych dla siedmiu ustawień, widoczność poziomu i wyboru symboli.
- `generate.test.ts`: dla każdego ustawienia i obu trybów symboli karta bez problemów, dokładna liczba pustych, jedno rozwiązanie, klucze, pula kształtów, czas.
- `layout.test.ts`: 6×6 i 9×9 mieszczą się w marginesie 10 mm, linie bloków 2×3 i 3×3, szerokość polecenia.

### Integration Tests:

- `tests/e2e/sudoku-levels.spec.ts` i rozszerzony test telefonu: pasek, ukrywanie kontrolek, brak nakładania przycisków.

### Manual Testing Steps:

1. Wydrukować makiety z fazy 1 w skali 100%.
2. Na stronie obejść wszystkie siedem ustawień na komputerze i telefonie.
3. Wydrukować po jednej karcie każdego ustawienia.

## Performance Considerations

Pomiar przy planowaniu: najwolniej 3,6 ms na planszę 9×9 z 52 pustymi (40 prób, bez porażek). Generator zostaje bez zmian, a test czasu pilnuje zapasu względem budżetu 5 s.

## Migration Notes

Brak danych do migracji: sudoku niczego nie zapisuje w profilu ani w ostatnich parametrach. Trzyliniowe polecenie 4×4 z S-18 zostaje zastąpione dwuliniowym.

## References

- PRD: `context/foundation/prd.md` (US-13, FR-022, Business Logic „Karta sudoku”, pytanie otwarte 9)
- Roadmapa: `context/foundation/roadmap.md` (S-19)
- Poprzedni plasterek: `context/changes/picture-sudoku-first-printable/plan.md` i `reviews/impl-review.md` (F3)
- Wzorzec paska: `src/components/SymmetryGenerator.tsx`, `src/components/SymmetryLevelChoice.tsx`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Rozmiary pól, cyfry, polecenie i makiety do wydruku

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — 04d5b8f
- [x] 1.2 Lint przechodzi: `npm run lint` — 04d5b8f
- [x] 1.3 Skrypt zapisuje trzy makiety: `node --experimental-strip-types scripts/sudoku-mockup.mjs` — 04d5b8f

#### Manual

- [x] 1.4 Wydruk makiet w skali 100% na A4: pola 28 mm i 20 mm są wygodne dla dziecka, kształty w 20 mm czytelne, cyfry czytelne — 04d5b8f
- [x] 1.5 Liczby pustych pól 22 z 36 i 52 z 81 oceniasz jako nie za trudne (albo podajesz nowe liczby) — 04d5b8f
- [x] 1.6 Polecenie jest czytelne i mieści się na stronie — 04d5b8f
- [x] 1.7 Nic nie wychodzi poza margines 10 mm — 04d5b8f

### Phase 2: Poziomy i generator kart dla wszystkich rozmiarów

#### Automated

- [x] 2.1 Testy przechodzą: `npm test` — edd5a65
- [x] 2.2 Lint przechodzi: `npm run lint` — edd5a65
- [x] 2.3 Typy przechodzą: `npx astro check` — edd5a65

#### Manual

- [x] 2.4 Pomiar czasu `generateSudokuPuzzle` dla 9×9 z 52 pustymi (skrypt jednorazowy) potwierdza rząd kilku milisekund — edd5a65

### Phase 3: Pasek ustawień i karta zależna od rozmiaru

#### Automated

- [x] 3.1 Testy przechodzą: `npm test` — 7ac483f
- [x] 3.2 Lint przechodzi: `npm run lint` — 7ac483f
- [x] 3.3 Typy i build przechodzą: `npx astro check` i `npm run build` — 7ac483f

#### Manual

- [ ] 3.4 Na komputerze i telefonie: wybór każdego rozmiaru, poziomu i symboli daje kartę, która mieści się w ramce strony i nie wychodzi poza A4
- [ ] 3.5 Przy 4×4 nie ma przycisków „Poziom” ani „Kształty / Cyfry”; przy 6×6 i 9×9 są
- [ ] 3.6 Zmiana ustawienia przy widocznej karcie daje nową kartę, a Drukuj i Generuj nie nachodzą na siebie na telefonie
- [ ] 3.7 Czas od kliknięcia Generuj do karty 9×9 trudnego wygląda na natychmiastowy

### Phase 4: Miniatura, smoke, e2e i druk w przeglądarkach

#### Automated

- [ ] 4.1 Wszystkie testy: `npm test`
- [ ] 4.2 Lint, typy, build: `npm run lint`, `npx astro check`, `npm run build`
- [ ] 4.3 e2e: `npx playwright test`
- [ ] 4.4 Smoke: `npm run smoke` na działającym serwerze

#### Manual

- [ ] 4.5 Wydruk jednej strony A4 każdego z siedmiu ustawień, także z telefonu, w co najmniej Chrome i Safari (iOS)
- [ ] 4.6 Brave i Firefox na komputerze drukują 9×9 jako jedną stronę
- [ ] 4.7 Dziecko radzi sobie z poziomem łatwym 6×6 i z 4×4; liczby pustych pól 6×6 i 9×9 uznajesz za dobre albo podajesz nowe (PRD, pytanie otwarte 9)
