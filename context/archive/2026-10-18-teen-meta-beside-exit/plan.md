# Meta przy wyjściu nastolatka — plan implementacji

## Overview

Na kartce poziomu nastolatek słowo „Meta” stoi pod lewą krawędzią, bo układ kładzie je na kolumnie wejścia. Wyjście tego poziomu jest w ostatniej kolumnie po prawej. Meta ma stać na środku kolumny wyjścia. Na poziomach 3–8 lat wejście i wyjście są w tej samej kolumnie, więc położenie Mety się nie zmienia.

## Current State Analysis

`layoutSheet` liczy jeden `labelX` ze środka `entranceColumn` i używa go zarazem dla Mety, Startu i znaczka postaci (`src/lib/sheet/layout.ts:46-51`, `:60-72`). `meta.y` jest w pasie pod siatką, `meta.text` to `"Meta"`.

`MazeSheet` woła `layoutSheet` z `entranceColumn: level.entrance.col` i rysuje `sheet.meta` wyśrodkowane (`textAnchor="middle"`, `fontSize={7}`) w tym samym SVG, którego używa podgląd i druk (`src/components/WorksheetGenerator.tsx:328-337`, `:368-377`).

W `LEVELS` poziomy `lat3`–`lat7` mają `entrance.col === exit.col` (środkowa kolumna). `nastolatek` ma wejście `{ row: 0, col: 0 }` i wyjście `{ row: 32, col: 26 }` przy siatce 27×33 (`src/lib/maze/levels.ts:23-83`). Dlatego Meta ląduje po lewej tylko na tym poziomie.

Test „Meta is on the entrance column” wymaga `meta.x` na środku kolumny wejścia (`src/lib/sheet/layout.test.ts:27-38`). Osobny test nastolatka sprawdza Start na kolumnie 0 i brak znaczka (`:92-103`), a nie sprawdza Mety. Pomocnicze `layoutFor` i `layoutForLevel` nie przekazują kolumny wyjścia (`:106-135`).

## Desired End State

Na nastolatku słowo „Meta” jest wyśrodkowane na kolumnie 26, w tym samym pasie pod siatką co dziś, bezpośrednio pod otwarciem wyjścia po prawej. Start zostaje wyśrodkowany na kolumnie 0. Znaczek postaci się nie pojawia, bo ten poziom i tak go nie pokazuje.

Na poziomach 3–8 lat `meta.x` zostaje na środku dotychczasowej kolumny, bo kolumna wyjścia jest kolumną wejścia. Napis zostaje „Meta”. Podgląd i druk korzystają z tego samego układu.

### Key Discoveries:

- Jedna formuła środka kolumny obsługuje dziś wejście i Metę. Rozdzielenie polega na policzeniu `meta.x` z kolumny wyjścia i zostawieniu `labelX` dla Startu i znaczka (`layout.ts:46-51`).
- Wywołanie w `MazeSheet` ma już `level` z `exit.col`, więc nie trzeba osobnej ścieżki dla druku (`WorksheetGenerator.tsx:326-337`).
- Środek kolumny 26 na kartce 210×297, wstawka 10, 27 kolumn, zostawia od prawej krawędzi strony ponad 10 jednostek (`210 - (10 + 26.5 × 190/27) ≈ 13.5`). Istniejący warunek `page.width - meta.x >= inset` nadal przechodzi. Start na kolumnie 0 jest lustrem tej samej odległości od lewej krawędzi.

## What We're NOT Doing

- Zmiana brzmienia napisu z „Meta” na „META”.
- Przesuwanie Startu albo znaczka postaci. Zostają na kolumnie wejścia.
- Zmiana komórki wyjścia, rozmiaru siatki albo algorytmu któregokolwiek poziomu.
- Osobna gałąź `if (level.id === "nastolatek")` w układzie.
- Dosuwanie Mety do środka kartki, żeby oddalić glify od prawej krawędzi.
- Zmiana danych `entrance` / `exit` poziomów 3–8 lat.

## Implementation Approach

`layoutSheet` dostaje kolumnę wyjścia i kładzie na niej tylko Metę. Reguła jest wspólna dla wszystkich poziomów. Na 3–8 latach kolumny wejścia i wyjścia są równe, więc kotwica Mety ma te same współrzędne co dziś. Na nastolatku przesuwa się na kolumnę 26. Gałąź na identyfikatorze poziomu byłaby zbędna i rozjechałaby się przy kolejnym poziomie z wyjściem w innej kolumnie niż wejście.

## Phase 1: Meta na kolumnie wyjścia

### Overview

Układ, wywołanie na kartce i testy zaczynają odróżniać kolumnę Mety od kolumny wejścia. Po tej fazie nastolatek ma Metę pod prawym wyjściem, a pozostałe poziomy zostają na środku.

### Changes Required:

#### 1. Układ kartki

**File**: `src/lib/sheet/layout.ts`

**Intent**: Meta ma stać na środku kolumny wyjścia, w dotychczasowym pasie pod siatką. Start i znaczek zostają na kolumnie wejścia, bo użytkownik rusza tylko napis przy wyjściu.

**Contract**: `SheetLayoutInput` dostaje `exitColumn: number`. `meta.x` liczy się ze środka `exitColumn` tą samą formułą, której dziś używa `labelX`. `start` i `mark` dalej używają `entranceColumn`. `meta.y` i `meta.text` (`"Meta"`) bez zmian.

#### 2. Kartka podglądu i druku

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Podgląd i druk mają dostać kolumnę wyjścia z poziomu, bo oba widoki rysują ten sam wynik `layoutSheet`.

**Contract**: Wywołanie `layoutSheet` w `MazeSheet` przekazuje `exitColumn: level.exit.col` obok istniejącego `entranceColumn: level.entrance.col`.

#### 3. Test układu

**File**: `src/lib/sheet/layout.test.ts`

**Intent**: Test ma złapać nastolatka, gdzie kolumny się rozjeżdżają, i pilnować, że na pozostałych poziomach Meta zostaje na dotychczasowej kolumnie.

**Contract**: Każde wywołanie `layoutSheet` w tym pliku podaje `exitColumn`. Dla `nastolatek`: `meta.x` jest środkiem kolumny 26, `start.x` jest środkiem kolumny 0. Dla każdego innego poziomu: `meta.x` jest środkiem `level.exit.col`, a `level.exit.col` równa się `level.entrance.col`. Dotychczasowe wywołanie ze stałą kolumną 6 przekazuje tę samą liczbę jako kolumnę wyjścia, więc asercja „Meta na środku kolumny wejścia” zostaje prawdziwa dla tej fixtures.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, a `src/lib/sheet/layout.test.ts` wymaga, żeby na nastolatku `meta.x` był środkiem kolumny 26 i `start.x` środkiem kolumny 0, oraz żeby na każdym pozostałym poziomie `meta.x` był środkiem `exit.col` przy `exit.col === entrance.col`
- `npm run lint` przechodzi

#### Manual Verification:

- Po Generuj na poziomie nastolatek słowo „Meta” jest pod otwarciem po prawej, a „Start” zostaje po lewej
- Po Generuj na poziomie 5 lat „Meta” zostaje na środku kartki, pod wyjściem
- Podgląd druku nastolatka pokazuje „Meta” przy prawym wyjściu

**Implementation Note**: Po zielonych testach automatycznych zatrzymaj się na potwierdzenie ręczne z listy powyżej. Faza używa zwykłych wypunktowań. Odpowiadające im pola `- [ ]` są tylko w sekcji `## Progress`.

---

## Testing Strategy

### Unit Tests:

- Nastolatek: Meta na środku kolumny wyjścia 26, Start na środku kolumny 0, pas pod siatką bez zmian.
- Każdy poziom poza nastolatkiem: kolumna wyjścia równa kolumnie wejścia, więc `meta.x` zostaje na dotychczasowym środku.
- Fixtures 13×16 z kolumną 6: kolumna wyjścia równa kolumnie wejścia, dotychczasowe asercje Mety i wstawki 10 zostają zielone.

### Integration Tests:

- Brak nowego testu HTTP. `npm test` jest sprawdzeniem produktu dla tej zmiany. Podgląd i druk idą przez to samo `layoutSheet`.

### Manual Testing Steps:

1. Ustaw poziom nastolatek, kliknij Generuj. „Start” po lewej, otwarcie wyjścia po prawej, „Meta” pod tym otwarciem.
2. Ustaw poziom 5 lat i wygeneruj ponownie. „Meta” na środku, tam gdzie przed zmianą.
3. Na nastolatku otwórz druk. Na kartce A4 „Meta” jest przy prawym wyjściu.

## Performance Considerations

Jedno mnożenie przy liczeniu kotwicy. Czas rysowania kartki się nie zmienia.

## Migration Notes

Brak. Układ nie jest zapisywany. Profile i ostatnie użycie trzymają identyfikator poziomu, nie współrzędne napisu.

## References

- Układ Mety na kolumnie wejścia: `src/lib/sheet/layout.ts:46-51`
- Wywołanie układu i rysowanie napisu: `src/components/WorksheetGenerator.tsx:328-337`, `:368-377`
- Wejście i wyjście nastolatka: `src/lib/maze/levels.ts:74-82`
- Test Mety na kolumnie wejścia: `src/lib/sheet/layout.test.ts:27-38`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Meta na kolumnie wyjścia

#### Automated

- [x] 1.1 `npm test` przechodzi, a `src/lib/sheet/layout.test.ts` wymaga, żeby na nastolatku `meta.x` był środkiem kolumny 26 i `start.x` środkiem kolumny 0, oraz żeby na każdym pozostałym poziomie `meta.x` był środkiem `exit.col` przy `exit.col === entrance.col` — 8062949
- [x] 1.2 `npm run lint` przechodzi — 8062949

#### Manual

- [x] 1.3 Po Generuj na poziomie nastolatek słowo „Meta” jest pod otwarciem po prawej, a „Start” zostaje po lewej — 8062949
- [x] 1.4 Po Generuj na poziomie 5 lat „Meta” zostaje na środku kartki, pod wyjściem — 8062949
- [x] 1.5 Podgląd druku nastolatka pokazuje „Meta” przy prawym wyjściu — 8062949
