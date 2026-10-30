# Sudoku: lista kształtów w ramce „Użyj:” na szerokość planszy — Implementation Plan

## Overview

GitHub issue 174. Rząd kształtów pod planszą sudoku ma trzy wady: ma podpisy pod każdym kształtem (zbędne), przylega do ramki planszy i jest szerszy od planszy. Po pierwszej implementacji (kształty rozłożone równo od krawędzi do krawędzi planszy) na 4×4 wyszły odstępy ok. 32 mm. Decyzja 2026-10-30 po makiecie 9×9: rząd trafia do **ramki o szerokości planszy** z jednym podpisem „Użyj:” po lewej, a kształty mają jeden rozmiar (13 mm) i zwarty odstęp.

## Current State Analysis

- `layoutSudokuShapeList` (`src/lib/sudoku/shape-list.ts`, gałąź `origin/main`) dzieli `pageWidth - 2 * inset` (190 mm) na równe szczeliny, zaczyna rysunki tuż pod ramką planszy (`grid.y + grid.height + frameStroke / 2`) i dodaje pod każdym podpis (`LABEL_SIZE` 4 mm, `LABEL_GAP` 1,5 mm); rysunek ma 16 mm.
- Odstęp dymek → plansza to `SUDOKU_SHEET.instructionGap` = 9 mm (`sheet.ts:15`), liczony od dołu dymka do `grid.y` (`layout.ts`).
- `SudokuSheet` w `src/components/SudokuGenerator.tsx` rysuje w `<g data-shape-list>` ścieżkę i `<text>` z nazwą dla każdego kształtu.
- Rząd wisi poza blokiem polecenie+plansza, który `layoutSudokuSheet` centruje w pionie; lista nie zmienia pozycji planszy (test „leaves the grid”).
- **Stan roboczy (niezacommitowany):** pierwsza implementacja (bez nazw, flush do krawędzi planszy, odstęp `instructionGap`, rysunek 16 mm) i przepisane testy są w working tree gałęzi `gh174-sudoku-shapes-placement`. Ten plan ją zastępuje; wszystkie wiersze Progress są więc znowu otwarte.

### Key Discoveries:

- Odstępy między 16 mm kształtami na szerokość planszy: 4×4 ok. 32 mm, 6×6 ok. 14 mm, 9×9 ok. 4,5 mm. Samo „na szerokość planszy” rozrzuca kształty na 4×4.
- Makieta 9×9 (`context/changes/gh174-sudoku-shapes-placement/mockup/sudoku-9x9.svg`): przy 13 mm i „Użyj:” w jednej linii odstęp wynosi 4,9 mm, a dół ramki 282 mm (limit 287) z pasem postaci 26 mm. Przy 16 mm odstęp spadłby do ok. 1,5 mm.
- Kształty nie wypełniają swojego kwadratu (romb 0,7, kropla 0,8 szerokości; `shapes.ts:177-234`), więc równość krawędzi dotyczy pudełek rysunków i ramki, nie konturów.
- `SUDOKU_SHAPE_NAMES` używa tylko `shapes.test.ts`; zostaje (dane katalogu).
- E2E `tests/e2e/sudoku-shape-list.spec.ts` liczy `<text>` w `[data-shape-list]`, więc wymaga przepisania. Specy `sudoku-colors` i `sudoku-levels` pomijają `path` w `[data-shape-list]` i muszą nadal przechodzić (ramka to `rect`, nie `path`).
- Pierwszy e2e w seriach bywa wolny na zimnym starcie dev; uruchamiać z `--workers=1`.

## Desired End State

Pod planszą z kształtami jest ramka (zaokrąglony prostokąt) o szerokości planszy: lewa i prawa krawędź ramki równo z lewą i prawą krawędzią planszy. Odstęp od dołu planszy do góry ramki = `SUDOKU_SHEET.instructionGap` (9 mm). W ramce po lewej stoi napis „Użyj:”, a obok kształty karty (13 mm każdy, w kolejności katalogu, bez nazw) ze stałym odstępem: mniejszym z 8 mm i tego, który mieści się w ramce; grupa jest wyśrodkowana w polu po napisie. Karta z cyframi bez zmian (brak ramki i napisu). Dół ramki ≤ 287 mm na każdej planszy, także 9×9 z pasem postaci.

## What We're NOT Doing

- Nie zmieniamy centrowania bloku polecenie+plansza w pionie ani nie wliczamy ramki do bloku.
- Nie zmieniamy kolorów, kolejności katalogu ani karty z cyframi.
- Nie dodajemy nazw kształtów; jedyny tekst w ramce to „Użyj:”.
- Nie usuwamy `SUDOKU_SHAPE_NAMES`.
- Nie zmieniamy rozmiaru kształtów na planszy (`shapeScale`).

## Implementation Approach

`layoutSudokuShapeList` zostaje czystą funkcją od prostokąta planszy. Zwraca teraz `{ panel, label, items }`: prostokąt ramki, położenie napisu i środki rysunków. Stałe geometrii siedzą w `shape-list.ts` (margines w ramce 3 mm, rysunek 13 mm, wysokość ramki 17 mm, pole napisu 14 mm plus 4 mm odstępu, maksymalny odstęp 8 mm, rozmiar napisu 5 mm), a górę ramki wyznacza `SUDOKU_SHEET.instructionGap`. `SudokuSheet` rysuje `<rect>`, `<text>` „Użyj:” i `<path>` kształtów w jednej grupie `data-shape-list`; przy cyfrach grupy nie ma.

## Phase 1: Układ ramki i rysowanie

### Overview

Nowa geometria rzędu (ramka, napis, 13 mm, zwarty odstęp), rysowanie w SVG i testy jednostkowe.

### Changes Required:

#### 1. Układ rzędu

**File**: `src/lib/sudoku/shape-list.ts`

**Intent**: Ramka ma szerokość planszy i leży `instructionGap` pod planszą; w niej stoi napis „Użyj:” i kształty o jednym rozmiarze z równymi odstępami.

**Contract**: `SudokuShapeListItem` = `{ id, drawing: { x, y, size } }` (bez `name`, `label`). `layoutSudokuShapeList({ grid, symbols, shapes })` zwraca `{ panel: { x, y, width, height } | null, label: { text: "Użyj:", x, y, size } | null, items }`; dla cyfr albo pustej listy kształtów `panel` i `label` to `null`, a `items` jest puste. `panel.x`/`width` = `grid.x`/`grid.width`, `panel.y` = `grid.y + grid.height + SUDOKU_SHEET.instructionGap`, `panel.height` = 17 mm. Pole kształtów zaczyna się za napisem (margines 3 + napis 14 + odstęp 4) i kończy 3 mm przed prawą krawędzią ramki; odstęp = `min(8, (pole - n * 13) / (n - 1))` (dla n = 1: 0), grupa wyśrodkowana w polu, środek pionowy rysunków = środek ramki. Na 9×9 odstęp wynosi ok. 4,9 mm; stała szerokości napisu (14 mm) jest szacunkiem dla czcionki 5 mm i ma test na wszystkie rozmiary.

#### 2. Rysowanie

**File**: `src/components/SudokuGenerator.tsx`

**Intent**: `SudokuSheet` rysuje ramkę z napisem i same ścieżki kształtów, bez podpisów pod nimi.

**Contract**: W `<g data-shape-list>`: `<rect>` ramki (`fill="none"`, `stroke="var(--foreground)"`, cienka kreska, zaokrąglenie ok. 2,5 mm), `<text>` „Użyj:” (`fill="var(--foreground)"`, `dominantBaseline` nie jest używane, bo WebKit je ignoruje; pozycja przez `y` linii bazowej), `<path>` per kształt (kredka bez zmian). Wywołanie układu dostaje `grid`, `symbols`, `shapes` (bez wymiarów strony). Usunąć import `Fragment`, jeśli nieużywany.

#### 3. Testy jednostkowe

**File**: `src/lib/sudoku/shape-list.test.ts`

**Intent**: Testy opisują ramkę, napis i odstępy zamiast starych podpisów.

**Contract**: Zachować: cyfry → brak rzędu, pusta lista → brak rzędu, ramka nie rusza planszy, ten sam rozmiar rysunku na 4×4 i 9×9, kolejność katalogu bez `name`. Na 4×4, 6×6, 9×9, z pasem 26 mm i bez, sprawdzić: (a) ramka ma lewą i prawą krawędź planszy, (b) góra ramki − dół planszy = `instructionGap`, i równa się odstępowi dymek → plansza, (c) dół ramki ≤ 287 mm, (d) każdy rysunek mieści się w ramce i za polem napisu, (e) odstępy równe i ≥ 3 mm (kontury 1,2 mm się nie dotykają), na 4×4 i 6×6 równe 8 mm, (f) grupa wyśrodkowana w polu, (g) napis „Użyj:” mieści się przed pierwszym rysunkiem (szacunkowa szerokość 5 znaków × 0,55 × 5 mm). Pojedynczy kształt środkowany w polu.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

#### Manual Verification:

- Na `/sudoku` w 4×4, 6×6 i 9×9 z kształtami pod planszą jest ramka na szerokość planszy z napisem „Użyj:” i kształtami bez nazw; na 9×9 kształty się nie zlewają.
- Odstęp od dołu planszy do ramki wygląda tak samo jak od dymka do góry planszy (z postacią i bez).

**Implementation Note**: Po fazie i zielonych testach zatrzymaj się na potwierdzenie oględzin przed fazą 2.

---

## Phase 2: E2E, PRD i sprawdzenie wydruku

### Overview

Dostosowuje test przeglądarkowy i PRD do ramki „Użyj:”, potem sprawdza kartę w podglądzie wydruku.

### Changes Required:

#### 1. Spec e2e

**File**: `tests/e2e/sudoku-shape-list.spec.ts`

**Intent**: Spec sprawdza to, co zostało: liczbę rysunków zestawu, jedyny napis „Użyj:”, szerokość ramki równą planszy, znikanie rzędu po przełączeniu na Cyfry i kredki przy Kolorach.

**Contract**: Liczyć `[data-shape-list] path` (6 na 6×6); `[data-shape-list] text` ma dokładnie jeden element z tekstem „Użyj:”; `getBBox` `<rect>` ramki (`[data-shape-list] rect`) ma `x` i `x + width` równe krawędziom prostokąta planszy, czyli `svg > rect[stroke-width="1.1"]` (frameStroke; ramka listy ma kreskę 0,6 i leży w grupie, więc selektor `rect[stroke-width]` ... `.last()` z poprzedniej wersji by ją pomylił); równość, bo to prostokąty, tolerancja 0,01 mm; po Cyfrach `[data-shape-list]` nie istnieje; po Kolorach każdy `stroke` ścieżki zaczyna się od `var(--symmetry-`, a `<rect>` i `<text>` zostają przy `var(--foreground)`. Usunąć `listNames`, `CATALOG` i asercje o nazwach. Nagłówek (komentarz) zaktualizować.

#### 2. PRD

**File**: `context/foundation/prd.md`

**Intent**: Opis karty podaje ramkę „Użyj:” zamiast rzędu z nazwami.

**Contract**: US-12 (linia ~251) i Business Logic „Karta sudoku” (linia ~596): zdanie o rzędzie pod planszą zastąpić opisem: pod planszą jest ramka na szerokość planszy z napisem „Użyj:” i samymi rysunkami figur tej karty (bez nazw), w kolejności katalogu, jedna wielkość na każdym rozmiarze (13 mm), odstęp ramki od planszy taki sam jak od polecenia do planszy; dopisać decyzję z datą 2026-10-30 (GitHub 174). US-14 i Business Logic („Rysunek na liście używa tej samej kredki”) zostają w wersji bez zdania o czarnej nazwie. Sprawdzić zdania o wielkości 16 mm lub „ta sama wielkość” i dopasować.

#### 3. Podgląd wydruku

**Intent**: Potwierdzić jednostronicowy układ po zmianie.

**Contract**: Brak zmian w kodzie; ręczne oględziny.

### Success Criteria:

#### Automated Verification:

- Spec przechodzi: `npx playwright test tests/e2e/sudoku-shape-list.spec.ts --project=chromium --workers=1`
- Specy sudoku kolorów i poziomów nadal przechodzą: `npx playwright test tests/e2e/sudoku-colors.spec.ts tests/e2e/sudoku-levels.spec.ts --project=chromium --workers=1`
- Testy i lint przechodzą: `npm test && npm run lint`

#### Manual Verification:

- W podglądzie wydruku (Ctrl+P) karta sudoku 9×9 z kształtami, postacią i kolorami jest jedną stroną A4, a ramka mieści się w marginesie 10 mm.
- PRD nie zawiera już „nazwa każdej figury” ani „nazwa zostaje czarna” w opisie sudoku i opisuje ramkę „Użyj:”.

---

## Testing Strategy

### Unit Tests:

- Geometria ramki na trzech rozmiarach, z pasem postaci i bez: szerokość = plansza, odstęp od planszy = `instructionGap`, dół ≤ 287 mm, rysunki w ramce i za napisem, równe odstępy ≥ 3 mm, napis mieści się.
- Cyfry i pusty zestaw → brak ramki; plansza nietknięta.

### Integration Tests:

- Playwright: liczba ścieżek, jeden napis „Użyj:”, szerokość ramki, brak rzędu po Cyfrach, kredki przy Kolorach.

### Manual Testing Steps:

1. `/sudoku`, 4×4 kształty: Generuj, sprawdź ramkę, napis, odstęp i szerokość.
2. To samo na 6×6 i 9×9, z postacią i „Bez postaci”.
3. Podgląd wydruku 9×9 z kolorami.

## Performance Considerations

Brak: obliczenie O(n) na kartę.

## References

- GitHub issue 174
- Makieta: `context/changes/gh174-sudoku-shapes-placement/mockup/sudoku-9x9.svg`, `sudoku-4x4.svg`
- Poprzednia zmiana: `context/archive/2026-10-28-sudoku-shape-list/plan.md`
- `src/lib/sudoku/shape-list.ts`, `src/components/SudokuGenerator.tsx`, `src/lib/sudoku/sheet.ts:15`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Układ ramki i rysowanie

#### Automated

- [x] 1.1 Testy jednostkowe przechodzą: `npm test` — 086e89e
- [x] 1.2 Lint przechodzi: `npm run lint` — 086e89e
- [x] 1.3 Typy przechodzą: `npx astro check` — 086e89e

#### Manual

- [x] 1.4 Na `/sudoku` w 4×4, 6×6 i 9×9 z kształtami pod planszą jest ramka na szerokość planszy z napisem „Użyj:” i kształtami bez nazw; na 9×9 kształty się nie zlewają. — 086e89e
- [x] 1.5 Odstęp od dołu planszy do ramki wygląda tak samo jak od dymka do góry planszy (z postacią i bez). — 086e89e

### Phase 2: E2E, PRD i sprawdzenie wydruku

#### Automated

- [x] 2.1 Spec przechodzi: `npx playwright test tests/e2e/sudoku-shape-list.spec.ts --project=chromium --workers=1` — 422aed5
- [x] 2.2 Specy sudoku kolorów i poziomów nadal przechodzą: `npx playwright test tests/e2e/sudoku-colors.spec.ts tests/e2e/sudoku-levels.spec.ts --project=chromium --workers=1` — 422aed5
- [x] 2.3 Testy i lint przechodzą: `npm test && npm run lint` — 422aed5

#### Manual

- [x] 2.4 W podglądzie wydruku (Ctrl+P) karta sudoku 9×9 z kształtami, postacią i kolorami jest jedną stroną A4, a ramka mieści się w marginesie 10 mm. — 422aed5
- [x] 2.5 PRD nie zawiera już „nazwa każdej figury” ani „nazwa zostaje czarna” w opisie sudoku i opisuje ramkę „Użyj:”. — 422aed5
