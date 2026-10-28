# Katalog na stronie głównej alfabetycznie — plan implementacji

## Overview

Strona główna pokazuje te same sześć kart pracy, ułożone alfabetycznie po polskich tytułach. Podsumowanie profilu zostaje przy kolejności dopisania w `CARD_KINDS`.

## Current State Analysis

`CARD_KINDS` w `src/lib/cards.ts` jest w kolejności dopisania: Labirynt, Symetria, Sudoku, Sekwencje, Nonogram, Dyktando graficzne. `CardCatalog.astro` rysuje tę tablicę wprost i jest użyty tylko na `/` (`src/pages/index.astro`). `cardSummaries` w `src/lib/card-summary.ts` mapuje tę samą tablicę, a test „lists the six cards in catalog order” porównuje wynik z `CARD_KINDS`.

Testy Playwright w `tests/e2e/catalog.spec.ts` szukają kart po nazwie, więc nie pilnują pozycji. Plakietki katalogu są przypięte do `id` karty. `npm test` uruchamia jawną listę plików w `package.json`, a nie glob.

## Desired End State

Na `/`, przy pustym profilu, linki katalogu stoją w kolejności: Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria. Miniatury, tytuły i adresy zostają te same. Okno profilu nadal zaczyna się od Labirynt i kończy na Dyktando graficzne.

Sprawdzenie: `npm test` oraz `npx playwright test tests/e2e/catalog.spec.ts --project=chromium`.

### Key Discoveries:

- Katalog mapuje `CARD_KINDS` w `src/components/CardCatalog.astro:8`. Tablica jest w `src/lib/cards.ts:8-15`.
- Podsumowanie profilu idzie tą samą tablicą w `src/lib/card-summary.ts:27-29`. Komentarz i nazwa testu mówią „catalog order”, choć asercja trzyma kolejność `CARD_KINDS` (`src/lib/card-summary.test.ts:19-24`).
- Alfabet polski jest już w `sortProfiles`: kopia tablicy i `localeCompare` z locale `pl` (`src/lib/child-profiles.ts:240-241`, test Łucji w `src/lib/child-profiles.test.ts:545-564`).
- Przy zapisanym profilu skrypt katalogu dopisuje plakietkę do nazwy dostępnej linku (`src/components/CardCatalog.astro:57-66`). Test kolejności czyta wizytę bez profilu.

## What We're NOT Doing

- Przestawianie stałej `CARD_KINDS` i kolejności w oknie profilu.
- Zmiana tytułów, adresów, miniaturek i plakietek.
- Sortowanie list postaci albo profili.
- Angielski porządek kodów znaków zamiast locale `pl`.

## Implementation Approach

Nowa funkcja zwraca kopię `CARD_KINDS` posortowaną po `title` przez `localeCompare` z locale `pl`. Katalog na stronie głównej rysuje tę kopię. `cardSummaries` dalej mapuje `CARD_KINDS`. Następna karta dopisana na końcu tablicy sama wskoczy w alfabet na stronie głównej i zostanie na końcu podsumowania profilu.

## Faza 1: Reguła kolejności katalogu

### Overview

Czysta funkcja i test jednostkowy ustalają alfabetyczną kolejność tytułów. `CARD_KINDS` i `cardSummaries` zostają w kolejności dopisania. Słowa „catalog order” przy podsumowaniu profilu przestają nazywać kolejność strony głównej.

### Changes Required:

#### 1. Funkcja kolejności

**File**: `src/lib/cards.ts`

**Intent**: Strona główna ma dostać alfabetyczną kopię kart, a tablica źródłowa zostaje w kolejności dopisania, bo z niej korzysta podsumowanie profilu.

**Contract**: `cardsInCatalogOrder(): CardKind[]` zwraca nową tablicę posortowaną przez `left.title.localeCompare(right.title, "pl")`. Nie mutuje `CARD_KINDS`. Dla dzisiejszych sześciu tytułów wynik to Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria.

#### 2. Test jednostkowy i skrypt `test`

**File**: `src/lib/cards.test.ts`, `package.json`

**Intent**: Kolejność ma paść w `npm test`, tak jak `sortProfiles`. Sam plik testu nie wystarczy, bo skrypt `test` wymienia pliki z nazwy.

**Contract**: Test woła `cardsInCatalogOrder()`, oczekuje tytułów Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria i sprawdza, że `CARD_KINDS` nadal zaczyna się od Labirynt i kończy na Dyktando graficzne oraz że funkcja nie zwraca tej samej referencji. Ścieżka `src/lib/cards.test.ts` dochodzi do skryptu `test` w `package.json`.

#### 3. Sformułowanie przy podsumowaniu profilu

**File**: `src/lib/card-summary.ts`, `src/lib/card-summary.test.ts`

**Intent**: Komentarz i nazwa testu mają mówić o kolejności `CARD_KINDS`, skoro strona główna dostaje inną.

**Contract**: Komentarz nad `cardSummaries` (`src/lib/card-summary.ts:27`) i tytuł testu `lists the six cards in catalog order` (`src/lib/card-summary.test.ts:19`) nazywają kolejność tablicy `CARD_KINDS`. Asercja porównująca pary `id` i `href` z `CARD_KINDS` zostaje.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, a `src/lib/cards.test.ts` jest na liście skryptu `test` i sprawdza kolejność Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria oraz to, że `CARD_KINDS` nadal zaczyna się od Labirynt i kończy na Dyktando graficzne

---

## Faza 2: Siatka na stronie głównej

### Overview

Katalog na `/` rysuje wynik `cardsInCatalogOrder()`. Test przeglądarkowy pilnuje widocznej kolejności przy pustym profilu. Okno profilu zostaje przy kolejności dopisania.

### Changes Required:

#### 1. Render katalogu

**File**: `src/components/CardCatalog.astro`

**Intent**: Siatka na stronie głównej ma pokazać alfabetyczną kopię, a plakietki zostają przy `id`.

**Contract**: Lista w szablonie powstaje z `cardsInCatalogOrder()` zamiast z `CARD_KINDS`. Atrybuty `href`, `data-card-title`, `data-badge-for` i `src` miniatury dalej biorą się z pól tego samego obiektu karty.

#### 2. Test kolejności w przeglądarce

**File**: `tests/e2e/catalog.spec.ts`

**Intent**: Pominięcie funkcji w szablonie ma paść w teście, bo dzisiejsze testy katalogu szukają kart po nazwie i pozycję puszczają.

**Contract**: Nowy test, tylko na projekcie `chromium`, otwiera `/` bez zapisanego profilu i oczekuje, że nazwy dostępne linków katalogu w kolejności DOM to Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria. Wizyta bez profilu jest warunkiem, bo plakietka przepisuje nazwę dostępną na „tytuł, plakietka”.

### Success Criteria:

#### Automated Verification:

- `npx playwright test tests/e2e/catalog.spec.ts --project=chromium` pokazuje sześć linków katalogu, bez zapisanego profilu, w kolejności Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria

#### Manual Verification:

- Na `/` widać te same sześć kart, miniatury i adresy co dziś, w kolejności Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria
- Okno profilu nadal zaczyna się od Labirynt i kończy na Dyktando graficzne

**Implementation Note**: Po zielonym teście przeglądarkowym zatrzymaj się na ręczne potwierdzenie obu punktów powyżej, zanim zmiana zostanie uznana za domkniętą.

---

## Testing Strategy

### Unit Tests:

- `cardsInCatalogOrder()` daje Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria.
- Wywołanie nie podmienia `CARD_KINDS`: pierwszy element to Labirynt, ostatni to Dyktando graficzne.
- `cardSummaries` dalej zgadza się z kolejnością `CARD_KINDS`.

### Integration Tests:

- Na `/` bez profilu linki katalogu w DOM mają nazwy dostępne w tej samej kolejności sześciu tytułów.

### Manual Testing Steps:

1. Otwórz `/` bez zapisanego profilu i przeczytaj tytuły od lewej: Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria.
2. Wejdź w Labirynt i w Dyktando graficzne i wróć: adresy to `/maze` i `/dictation`, miniatury są te same.
3. Otwórz okno profilu i sprawdź, że lista zaczyna się od Labirynt i kończy na Dyktando graficzne.

## Performance Considerations

Sześć tytułów sortowanych przy renderze strony. Osobny budżet wydajności nie obowiązuje.

## Migration Notes

Zapisane profile i `localStorage` zostają. Kolejność podsumowania wynika z tablicy w kodzie, nie z danych profilu.

## References

- GitHub issue #162
- Wzorzec sortowania: `src/lib/child-profiles.ts:240-241`, `src/lib/child-profiles.test.ts:545-564`
- Katalog: `src/components/CardCatalog.astro:8`, `src/lib/cards.ts:8-15`
- Podsumowanie profilu: `src/lib/card-summary.ts:27-29`, `src/lib/card-summary.test.ts:19-24`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Reguła kolejności katalogu

#### Automated

- [x] 1.1 `npm test` przechodzi, a `src/lib/cards.test.ts` jest na liście skryptu `test` i sprawdza kolejność Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria oraz to, że `CARD_KINDS` nadal zaczyna się od Labirynt i kończy na Dyktando graficzne — 53fb0f5

### Phase 2: Siatka na stronie głównej

#### Automated

- [x] 2.1 `npx playwright test tests/e2e/catalog.spec.ts --project=chromium` pokazuje sześć linków katalogu, bez zapisanego profilu, w kolejności Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria

#### Manual

- [x] 2.2 Na `/` widać te same sześć kart, miniatury i adresy co dziś, w kolejności Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria
- [x] 2.3 Okno profilu nadal zaczyna się od Labirynt i kończy na Dyktando graficzne
