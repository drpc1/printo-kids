# Sudoku: kolory kształtów — plan

## Overview

Na stronie `/sudoku`, gdy plansza ma kształty (4×4 oraz 6×6 i 9×9 w trybie „Kształty”), rodzic może włączyć kolory. Każdy kształt ma jeden stały kolor kredki na całej planszy, bez liter i bez legendy; na drukarce czarno-białej kolory schodzą do szarości. Domyślnie kolory są wyłączone i kształty są czarnymi konturami. Przełączenie kolorów zostawia tę samą planszę. Przy cyfrach przełącznika nie ma. To plasterek S-20 roadmapy M-3 (US-14, FR-023).

Zmiana jest mała: jeden moduł przypisania kształt → kolor, dwa nowe tokeny kolorów, przełącznik „Kolory” jak w symetrii i rysowanie arkusza. Najważniejsze decyzje (które kolory, wypełnienie czy kolorowy kontur) zapadają na wydruku w fazie 1, zanim powstanie reszta.

## Current State Analysis

- `src/lib/sudoku/shapes.ts`: dziewięć kształtów (`SudokuShapeId`, `SUDOKU_SHAPES`), `sudokuShapePath(id, cx, cy, size)`; ścieżki są zamknięte (`Z`), więc nadają się i do konturu, i do wypełnienia (komentarz nagłówkowy zakłada wypełnienie w kolejnym kamieniu).
- `src/components/SudokuGenerator.tsx`: `SudokuSheet` rysuje kształty w jednej grupie `<g fill="none" stroke="var(--foreground)" …>` (jeden kolor dla wszystkich); stan `settings` {size, level, symbols}; `handleSettingChange` generuje nową kartę przy każdej zmianie ustawienia, gdy karta jest widoczna. Pasek: `SudokuChoice` ×2 i `SudokuSymbolsChoice`, wspólny `settingsControls` używany przed i po pierwszej karcie.
- Wzorzec kolorów: `SymmetryGenerator.tsx` ma `const [colors, setColors] = useState(false)`, `<label><Switch checked onCheckedChange/>Kolory</label>` (`colorsControl`) i przekazuje `colors` do arkusza; przełączenie nie generuje karty. Logika w `src/lib/symmetry/colors.ts` zwraca `var(--symmetry-<kolor>)` albo `var(--foreground)`; testy w `colors.test.ts`; e2e w `tests/e2e/symmetry-colors.spec.ts` (domyślnie wyłączone, ta sama karta, klawiatura).
- Tokeny: `src/styles/global.css:59-66` ma w `:root` siedem kolorów kredek `--symmetry-red|green|yellow|blue|orange|gray|black` (oklch, tylko w `:root`, bo papier zostaje biały). Reguła UI z `AGENTS.md`: nowy kolor to nowy token tam; w komponentach żadnych heksów ani palety Tailwinda.
- Arkusz SVG ma już `printColorAdjust: exact`, więc kolory drukują się bez zmian.
- `scripts/sudoku-mockup.mjs` pisze makiety do `context/changes/picture-sudoku-levels/` literalnymi czarnymi kolorami (statyczny plik; literały dozwolone). `scripts/build-thumbnails.mjs` rysuje miniaturę 4×4 na czarno i ma tak zostać.
- `npm test` wylicza pliki jawnie (`package.json:12`); `src/lib/sheet/print-contract.test.ts` pilnuje dokładnych klas `print:hidden` w `SudokuGenerator.tsx`.

## Desired End State

- Na pasku strony sudoku jest przełącznik „Kolory” (ten sam `Switch` i etykieta co w symetrii), widoczny przed pierwszą kartą i po niej, gdy `settings.symbols === "shapes"` (4×4 zawsze). Przy cyfrach go nie ma.
- Domyślnie wyłączony: kształty są czarnymi konturami, jak dziś.
- Włączony: każdy z dziewięciu kształtów ma stały kolor (tabela poniżej, do zatwierdzenia na makiecie), taki sam na każdej planszy i w każdym rozmiarze. Bez liter, bez legendy.
- Przełączenie kolorów rysuje tę samą planszę (te same `givens`, ten sam `key`); nie generuje nowej. Zmiana rozmiaru, poziomu i symboli nadal generuje nową kartę i nie resetuje przełącznika.
- Kolor jest stanem strony: nie trafia do profilu ani do ostatnich parametrów (US-08 odłożone).
- Karta nadal mieści się na jednej stronie A4 z marginesem 10 mm; kolory w druku wychodzą kolorami kredek, a na czarno-białej drukarce szarościami, w których kształty nadal da się odróżnić po formie.

### Propozycja przypisania (do zatwierdzenia w fazie 1)

Siedem kolorów z symetrii plus dwa nowe (fioletowy, brązowy), bo 9×9 z kształtami potrzebuje dziewięciu różnych kolorów. Kształty z pięciu najprostszych (to je losuje 4×4) dostają najłatwiej rozróżnialne kolory:

| Kształt  | Kolor        | Token               |
| -------- | ------------ | ------------------- |
| serce    | czerwony     | `--symmetry-red`    |
| koło     | niebieski    | `--symmetry-blue`   |
| trójkąt  | zielony      | `--symmetry-green`  |
| kwadrat  | pomarańczowy | `--symmetry-orange` |
| krzyżyk  | fioletowy    | `--symmetry-purple` |
| gwiazdka | żółty        | `--symmetry-yellow` |
| romb     | brązowy      | `--symmetry-brown`  |
| księżyc  | szary        | `--symmetry-gray`   |
| kropla   | czarny       | `--symmetry-black`  |

Przypisanie jest stałe i nie zależy od planszy ani rozmiaru.

### Key Discoveries:

- Ścieżki kształtów są zamknięte, więc wypełnienie wymaga tylko zmiany atrybutów SVG, nie geometrii.
- Żółty (`oklch(0.8 0.16 85)`) i szary jako cienki kontur na białym są blade; wypełnienie jest czytelniejsze niż sam kolorowy kontur. Dlatego faza 1 porównuje dwa warianty rysowania.
- Przełączenie koloru nie może przejść przez `handleSettingChange` (ten generuje nową kartę); `colors` jest osobnym stanem jak w symetrii.

## What We're NOT Doing

- Zapis kolorów w profilu i w ostatnich parametrach (US-08 odłożone).
- Legenda kolorów, litery na polach, kolory dla cyfr.
- Zmiana rysunku kształtów, nowe kształty, zmiana rozmiarów pól, poziomów i generatora.
- Wybór przypisania kolorów przez rodzica (jedno stałe przypisanie).
- Zmiana miniatury w katalogu (zostaje czarna karta 4×4).
- Przemianowanie tokenów `--symmetry-*` na neutralne `--crayon-*` (osobna zmiana porządkowa; patrz Open Risks w briefie).

## Implementation Approach

Faza 1 to bramka jakości: skrypt makiet pisze karty z kolorami w dwóch wariantach rysowania (kształt wypełniony kolorem z konturem w tym samym kolorze oraz sam kolorowy kontur) dla 9×9 i 4×4, a użytkowniczka drukuje je na kolorowej i czarno-białej drukarce i zatwierdza przypisanie oraz wariant. Faza 2 to czysta logika i tokeny z testami. Faza 3 dokłada przełącznik i rysowanie w arkuszu. Faza 4 to e2e, druk w przeglądarkach i domknięcie roadmapy/PRD.

## Critical Implementation Details

- **Importy w `src/lib/sudoku/`:** tylko względne z rozszerzeniem `.ts`, bez `@/` i bez Reacta (testy, makieta i miniatura biegną przez `node --experimental-strip-types`).
- **Kolor w module logiki, nie w komponencie:** nowy `src/lib/sudoku/colors.ts` zwraca napis `var(--symmetry-<kolor>)` albo `var(--foreground)`, jak `symmetry/colors.ts`. Komponent nie zna nazw kolorów; skrypt makiety mapuje te same nazwy kolorów na literały (statyczny plik).
- **Rysowanie:** kolor kształtu to atrybut każdej ścieżki (`stroke` i, w wariancie wypełnionym, `fill`), a nie grupy, bo każdy kształt ma własny kolor. Grubość konturu i `strokeLinejoin` zostają.
- **Bez zmiany klucza karty:** `key` nie zawiera koloru; `colors` nie jest częścią `SudokuSettings` (te opisują kartę), tylko osobnym stanem komponentu.
- **Kontrakt druku:** przełącznik żyje w pasku z `print:hidden`; `print-contract.test.ts` sprawdza dokładne napisy klas, więc jeśli kontener paska się zmieni, test aktualizuje się razem ze zmianą. Klasy SVG bez zmian.
- **Tokeny:** `--symmetry-purple` i `--symmetry-brown` w `:root` obok siedmiu istniejących, bez wariantu `.dark` (papier jest biały).

## Faza 1: Makiety kolorów do wydruku

### Overview

Tabela przypisania kolorów i dwa warianty rysowania na papierze. Faza kończy się ręczną akceptacją wydruku, zanim powstanie logika i strona.

### Changes Required:

#### 1. Skrypt makiet

**File**: `scripts/sudoku-mockup.mjs`

**Intent**: Pisać makiety kart z kolorami na podstawie tabeli przypisania z tego planu: 9×9 z kształtami (wszystkie dziewięć kolorów naraz) i 4×4, każda w dwóch wariantach rysowania — kształt wypełniony kolorem z konturem w tym samym kolorze oraz sam kolorowy kontur. Katalog wyjściowy zmienia się na `context/changes/picture-sudoku-colors/`. Makiety rozmiarów z S-19 (6×6, 9×9 cyfry) nie są tu potrzebne i nie są generowane ponownie.

**Contract**: wyjście `mockup-9x9-colors-filled.svg`, `mockup-9x9-colors-outline.svg`, `mockup-4x4-colors-filled.svg`, `mockup-4x4-colors-outline.svg` (A4, literalne kolory — plik statyczny); plansze z `generateSudokuPuzzle`/`generateSudokuCard` ze stałym ziarnem; rozmiary pól i blok z `SUDOKU_SHEET` i `sudokuBlock`, bez literałów; literały kolorów odpowiadają wartościom oklch tokenów (zamienione na sRGB), a dwa nowe kolory (fioletowy, brązowy) dobrane tu pierwszy raz i potem przeniesione do tokenów w fazie 2.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Skrypt zapisuje cztery makiety: `node --experimental-strip-types scripts/sudoku-mockup.mjs`

#### Manual Verification:

- Wydruk 9×9 w skali 100% na kolorowej drukarce: wszystkie dziewięć kolorów da się rozróżnić; żółty, szary i brązowy są czytelne
- Wydruk tej samej karty na czarno-białej drukarce (albo w trybie szarości): kształty nadal da się odróżnić po formie, a kolor nie przeszkadza
- Wybierasz wariant: wypełnione kształty albo kolorowy kontur
- Zatwierdzasz przypisanie kształt → kolor z tabeli (albo podajesz zmiany)

**Implementation Note**: Po fazie 1 zatrzymaj się na ręczne potwierdzenie wydruku. Przypisanie i wariant mogą się zmienić po akceptacji; faza 2 bierze zatwierdzone wartości.

---

## Faza 2: Kolory kształtów jako logika i tokeny

### Overview

Czysty moduł przypisania kształt → kolor, dwa nowe tokeny i testy.

### Changes Required:

#### 1. Tokeny kolorów

**File**: `src/styles/global.css`

**Intent**: Dodać dwa kolory kredek potrzebne dziewięciu kształtom, tak jak siedem istniejących.

**Contract**: `--symmetry-purple` i `--symmetry-brown` w `:root` (oklch, wartości zatwierdzone na makiecie), z komentarzem, że kolory kredek dzieli też sudoku. Bez wariantu `.dark`.

#### 2. Moduł kolorów sudoku

**File**: `src/lib/sudoku/colors.ts` (nowy), `src/lib/sudoku/colors.test.ts` (nowy), `package.json` (skrypt `test`)

**Intent**: Jedno źródło prawdy dla koloru każdego kształtu.

**Contract**: `SUDOKU_SHAPE_COLORS: Record<SudokuShapeId, string>` (nazwa koloru z tabeli zatwierdzonej w fazie 1); `sudokuShapeInk(id: SudokuShapeId, colors: boolean): string` zwraca `var(--foreground)` przy `colors === false` i `var(--symmetry-<kolor>)` przy `true`. Testy: dziewięć kształtów ma dziewięć różnych kolorów; przy `colors === false` każdy kształt dostaje `var(--foreground)`; ręcznie spisana wyrocznia dla pięciu kształtów 4×4 (np. serce → `var(--symmetry-red)`); każdy użyty token istnieje w `global.css` (test czyta plik i szuka `--symmetry-<kolor>:`).

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

#### Manual Verification:

- Brak (czysta logika)

---

## Faza 3: Przełącznik „Kolory” i rysowanie arkusza

### Overview

Strona `/sudoku` dostaje przełącznik, a arkusz rysuje kształty kolorami z modułu.

### Changes Required:

#### 1. Stan i przełącznik

**File**: `src/components/SudokuGenerator.tsx`

**Intent**: Dodać `colors` jako osobny stan i przełącznik „Kolory” w pasku (w obu układach, przed pierwszą kartą i po niej), tylko gdy `settings.symbols === "shapes"`.

**Contract**: `const [colors, setColors] = useState(false)`; `colorsControl` jak w `SymmetryGenerator.tsx` (`label` + `Switch` + „Kolory”), dołożony do `settingsControls`; `setColors` nie wywołuje `generateFor`; zmiana rozmiaru, poziomu i symboli nie zmienia `colors`; przy cyfrach przełącznik się nie renderuje, a arkusz rysuje cyfry czarne bez względu na `colors`.

#### 2. Rysowanie kształtów

**File**: `src/components/SudokuGenerator.tsx` (`SudokuSheet`)

**Intent**: Zamiast jednej grupy z jednym kolorem rysować każdy kształt z kolorem z `sudokuShapeInk`, według wariantu zatwierdzonego w fazie 1.

**Contract**: `SudokuSheet` dostaje `colors: boolean`; każda `<path>` ma `stroke={ink}` i (wariant wypełniony) `fill={ink}`, wariant konturowy `fill="none"`; przy `colors === false` wygląd karty jest identyczny jak dziś (czarne kontury, `fill="none"`). `aria-label` arkusza zostaje „Sudoku”.

#### 3. Komentarz w `shapes.ts` i kontrakt druku

**File**: `src/lib/sudoku/shapes.ts` (tylko komentarz), `src/lib/sheet/print-contract.test.ts` (tylko jeśli zmienią się klasy paska)

**Intent**: Zaktualizować komentarz nagłówkowy („so a later color slice can fill the inside”) na opis, że kolor nakłada komponent. Dopasować asercje klas `print:hidden`, jeśli układ paska się zmieni.

**Contract**: bez zmiany logiki ścieżek.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy i build przechodzą: `npx astro check` i `npm run build`

#### Manual Verification:

- Na komputerze i telefonie: przełącznik „Kolory” jest przed pierwszą kartą i po niej, domyślnie wyłączony
- Włączenie kolorów przy widocznej karcie koloruje te same pola w tych samych miejscach; wyłączenie wraca do czarnych konturów
- Przy cyfrach przełącznika nie ma; po powrocie do kształtów stan przełącznika jest taki, jak był
- Pasek z przełącznikiem zawija się na telefonie bez sięgania poza ekran; Generuj i Drukuj się nie nachodzą

---

## Faza 4: e2e, druk w przeglądarkach i domknięcie

### Overview

Test e2e przełącznika, sprawdzenie druku i aktualizacja dokumentów.

### Changes Required:

#### 1. e2e

**File**: `tests/e2e/sudoku-colors.spec.ts` (nowy), `tests/e2e/phone-layout.spec.ts` (jeśli pasek wymaga rozszerzenia)

**Intent**: Wzorem `symmetry-colors.spec.ts`: przełącznik jest domyślnie wyłączony, włączenie przemalowuje tę samą planszę (te same ścieżki), wyłączenie wraca do konturów; przy cyfrach go nie ma; zmiana rozmiaru zostawia stan; działa z klawiatury.

**Contract**: `getByRole("switch", { name: "Kolory" })`; porównanie atrybutów `d` ścieżek w `getByRole("img", { name: "Sudoku" })` przed i po włączeniu (równe) oraz `stroke` (przed: `var(--foreground)`, po: `var(--symmetry-…)`, cztery różne na 4×4); `getByRole("button", { name: "Cyfry", exact: true })` ukrywa przełącznik.

#### 2. Dokumenty

**File**: `context/foundation/roadmap.md`, `context/foundation/prd.md` (tylko jeśli decyzje fazy 1 zmieniają treść)

**Intent**: Oznaczyć S-20 jako done po zakończeniu i zapisać zatwierdzone przypisanie kolorów w Business Logic „Karta sudoku”, jeśli różni się od propozycji.

### Success Criteria:

#### Automated Verification:

- Wszystkie testy: `npm test`
- Lint, typy, build: `npm run lint`, `npx astro check`, `npm run build`
- e2e: `npx playwright test`

#### Manual Verification:

- Wydruk karty z kolorami (4×4 i 9×9) z Chrome, Edge, Brave, Firefox i Safari: kolory drukują się, jedna strona A4, margines 10 mm
- Wydruk z telefonu: kolory drukują się, karta mieści się na A4
- Wydruk z wyłączonymi kolorami wygląda jak przed zmianą

---

## Testing Strategy

- **Jednostkowe:** `colors.test.ts` (różne kolory dla dziewięciu kształtów, wyłączone kolory = atrament, wyrocznia dla 4×4, tokeny istnieją w CSS).
- **e2e:** `sudoku-colors.spec.ts` (domyślnie wyłączone, ta sama plansza, cyfry bez przełącznika, klawiatura).
- **Ręcznie:** wydruk kolorowy i czarno-biały w fazie 1; druk w przeglądarkach w fazie 4.
- **Czego nie testujemy:** wierności koloru drukarki.

## Performance Considerations

Brak: kolor to atrybut ścieżki; przełączenie przemalowuje SVG bez generowania planszy.

## Migration Notes

Brak: nic nie jest zapisywane (stan strony). Zapisane profile i ostatnie parametry bez zmian.

## References

- Roadmapa: `context/foundation/roadmap.md` (S-20); PRD: US-14, FR-023, Business Logic „Karta sudoku”
- Wzorzec: `src/components/SymmetryGenerator.tsx`, `src/lib/symmetry/colors.ts`, `tests/e2e/symmetry-colors.spec.ts`
- Poprzedni plasterek: `context/archive/2026-10-24-picture-sudoku-levels/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Makiety kolorów do wydruku

#### Automated

- [x] 1.1 Testy przechodzą: `npm test`
- [x] 1.2 Lint przechodzi: `npm run lint`
- [x] 1.3 Skrypt zapisuje cztery makiety: `node --experimental-strip-types scripts/sudoku-mockup.mjs`

#### Manual

- [x] 1.4 Wydruk 9×9 w skali 100% na kolorowej drukarce: wszystkie dziewięć kolorów da się rozróżnić; żółty, szary i brązowy są czytelne
- [x] 1.5 Wydruk tej samej karty na czarno-białej drukarce (albo w trybie szarości): kształty nadal da się odróżnić po formie, a kolor nie przeszkadza
- [x] 1.6 Wybierasz wariant: wypełnione kształty albo kolorowy kontur
- [x] 1.7 Zatwierdzasz przypisanie kształt → kolor z tabeli (albo podajesz zmiany)

### Phase 2: Kolory kształtów jako logika i tokeny

#### Automated

- [x] 2.1 Testy przechodzą: `npm test`
- [x] 2.2 Lint przechodzi: `npm run lint`
- [x] 2.3 Typy przechodzą: `npx astro check`

### Phase 3: Przełącznik „Kolory” i rysowanie arkusza

#### Automated

- [ ] 3.1 Testy przechodzą: `npm test`
- [ ] 3.2 Lint przechodzi: `npm run lint`
- [ ] 3.3 Typy i build przechodzą: `npx astro check` i `npm run build`

#### Manual

- [ ] 3.4 Na komputerze i telefonie: przełącznik „Kolory” jest przed pierwszą kartą i po niej, domyślnie wyłączony
- [ ] 3.5 Włączenie kolorów przy widocznej karcie koloruje te same pola w tych samych miejscach; wyłączenie wraca do czarnych konturów
- [ ] 3.6 Przy cyfrach przełącznika nie ma; po powrocie do kształtów stan przełącznika jest taki, jak był
- [ ] 3.7 Pasek z przełącznikiem zawija się na telefonie bez sięgania poza ekran; Generuj i Drukuj się nie nachodzą

### Phase 4: e2e, druk w przeglądarkach i domknięcie

#### Automated

- [ ] 4.1 Wszystkie testy: `npm test`
- [ ] 4.2 Lint, typy, build: `npm run lint`, `npx astro check`, `npm run build`
- [ ] 4.3 e2e: `npx playwright test`

#### Manual

- [ ] 4.4 Wydruk karty z kolorami (4×4 i 9×9) z Chrome, Edge, Brave, Firefox i Safari: kolory drukują się, jedna strona A4, margines 10 mm
- [ ] 4.5 Wydruk z telefonu: kolory drukują się, karta mieści się na A4
- [ ] 4.6 Wydruk z wyłączonymi kolorami wygląda jak przed zmianą
