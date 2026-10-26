# Poziomy nonogramu (łatwy, średni, trudny) Implementation Plan

## Overview

Rodzic wybiera na pasku strony `/nonogram` poziom: **łatwy** (prosty wariant dla przedszkolaków: siatka 8×12, każdy rząd opisany znaczkami biały/szary/czarny z liczbą kratek, bez liczb przy kolumnach), **średni** (klasyczny nonogram 12×15, dzisiejszy) i **trudny** (klasyczny 18×24, dla nastolatków). Roadmapa nazywała ten slice „rozmiary” (mały/średni/duży); po makiecie z 2026-10-25 użytkowniczka uznała klasyczny nonogram za zbyt trudny dla przedszkolaków, więc mały klasyczny 8×12 odpada, a jego miejsce zajmuje łatwy (US-16, FR-025 zmieniają się).

## Current State Analysis

- `src/lib/nonogram/sizes.ts`: trzy rozmiary `maly` / `sredni` / `duzy` (8×12, 12×15, 18×24) z `cellSize`, `digitSize`, `templateLevel` (lat4/lat5/lat7). `DEFAULT_NONOGRAM_SIZE_ID` ("sredni") na sztywno w `NonogramGenerator.tsx` i w `scripts/build-thumbnails.mjs`.
- `generate.ts`: `generateNonogramCard(random, previousKey, size, categoryId)`, `nonogramCardProblems` (solver propagacji linii), `nonogramVariants(size, category)`.
- `NonogramGenerator.tsx`: pasek z kategorią (S-26) i „Pokaż rozwiązanie”; karta SVG z liczbami przy wierszach i kolumnach, grubsza linia co 5 (`blockLines`, `NONOGRAM_SHEET.blockEvery`).
- Wzorzec wyboru poziomu: `SudokuChoice.tsx` („Poziom: łatwy”, dialog z listą), stan w stronie.
- Sonda solvera po S-21 (research.md): 114/116, 119/124, 184/216 wariantów z jednym rozwiązaniem; w trudnym `kot` i `tulipan` bez żadnego wariantu; najdłuższe Generuj 7,8 ms.

## Desired End State

Pasek strony nonogramu ma „Poziom: średni” (domyślnie), kategorię i „Pokaż rozwiązanie”. Zmiana poziomu przy pokazanej karcie generuje nową kartę na tym poziomie i wyłącza „Pokaż rozwiązanie”. Łatwy pokazuje kartę ze znaczkami przy rzędach (makieta `context/changes/nonogram-sizes/mockup-prosty.html`), średni i trudny jak dziś. Każdy poziom: jedna strona A4, margines 10 mm, grubsza linia co 5 kratek, druk bez rozwiązania, na telefonie Generuj i Drukuj osobno. US-16 i FR-025 w PRD opisują poziomy; Open Questions 11 ma liczby z sondy.

### Key Discoveries:

- Prosty wariant nie potrzebuje solvera: rząd opisany w całości znaczkami ma jedno rozwiązanie (sumy znaczków = 8).
- Najszerszy rząd znaczków ogranicza szerokość: `maxRuns × (znaczek + odstęp)` plus kratka 8×14 mm musi mieścić się w 190 mm, czyli rząd może mieć najwyżej 7 znaczków przy znaczku 9,5 mm i odstępie 1,2 mm (sonda: rzędy mają 5 albo 7 znaczków, więc wszystkie 116 wariantów przechodzi); wariant z większą liczbą odpada.
- `print-contract.test.ts` czyta źródło `NonogramGenerator.tsx` i wylicza klasy `print:hidden`; zmiana struktury komponentu wymaga aktualizacji testu.
- Tony łatwego wynikają z reguły obrysu (kratka obiektu z pustym sąsiadem = czarna, wnętrze = szare, dziury białe), nie z kolorów kredek szablonu (decyzja użytkowniczki).

## What We're NOT Doing

- Klasyczny nonogram 8×12 (mały) i wiek w nazwach poziomów.
- Kolory kredek na nonogramie, tony zapisane w szablonach, zapis poziomu w profilu lub ostatnich parametrach (poziom żyje w stanie strony).
- Zmiana miniatury w katalogu: zostaje średni.
- Zmiany w `src/lib/symmetry/` (szablony są wspólne z S-21/S-26).

## Implementation Approach

Poziom to rozszerzony dzisiejszy rozmiar: dodajemy pole `kind` (`"znaczki"` albo `"liczby"`). `generateNonogramCard` zwraca kartę z dyskryminatorem `kind`; `znaczki` budowane są z szablonu lat4 regułą obrysu, a `liczby` jak dziś przez solver. Strona rysuje jedną z dwóch kartek. Logika zostaje czysta, z wstrzykiwanym `random`. Nazwy plików i typów (`sizes.ts`, `NonogramSize`) zostają, żeby nie mnożyć zmian; użytkownik widzi słowo „Poziom”.

## Phase 1: Poziomy i logika prostej karty

### Overview

Zmiana identyfikatorów (`latwy`, `sredni`, `trudny`), prosta karta i jej reguły, testy wszystkich trzech poziomów, notowanie liczb wariantów.

### Changes Required:

#### 1. Poziomy

**File**: `src/lib/nonogram/sizes.ts`

**Intent**: Zamienić `maly` na `latwy` i `duzy` na `trudny`, dodać `kind` i etykiety „łatwy / średni / trudny”; łatwy to siatka 8×12, kratka 14 mm, `templateLevel: "lat4"`.

**Contract**: `NonogramSizeId = "latwy" | "sredni" | "trudny"`; `NonogramSize` dostaje `kind: "znaczki" | "liczby"`; `DEFAULT_NONOGRAM_SIZE_ID` zostaje `"sredni"` (miniatura i start strony).

#### 2. Prosta karta

**File**: `src/lib/nonogram/simple.ts` (nowy)

**Intent**: Z szablonu i wariantów zbudować obraz trzech tonów regułą obrysu, rozbić każdy rząd na znaczki (ton + liczba kratek) i sprawdzić reguły karty.

**Contract**: `SimpleNonogramCard { kind: "znaczki"; sizeId; columns; rows; cellSize; tones: Tone[][]; runs: {tone, count}[][]; key }` z `Tone = "white" | "gray" | "black"`. `simpleNonogramProblems(card)` zwraca `"no-filled-cell"`, `"too-many-runs"` (rząd z więcej niż 7 znaczkami), `"runs-mismatch"` (znaczki nie dają tonów). Obraz obiektu bierze `nonogramImage` (ten sam co klasyczny), więc dziury zostają białe.

#### 3. Generator

**File**: `src/lib/nonogram/generate.ts`

**Intent**: `generateNonogramCard` rozdziela po `size.kind`: dla `znaczki` bierze szablon z kategorii, składa kartę prostą i odrzuca ją, gdy `simpleNonogramProblems` nie jest puste; dla `liczby` bez zmian. `NonogramCard` dostaje `kind: "liczby"`.

**Contract**: sygnatura `generateNonogramCard(random, previousKey, size, categoryId)` bez zmian, typ zwracany `NonogramCard | SimpleNonogramCard | null`; klucz `latwy:<id>:<warianty>`; `nonogramVariants` bez zmian.

#### 4. Testy

**Files**: `src/lib/nonogram/simple.test.ts` (nowy), `generate.test.ts`, `clues.test.ts`, `layout.test.ts`, `src/lib/object-categories.test.ts`, `package.json` (dopisać `src/lib/nonogram/simple.test.ts` do skryptu `test`)

**Intent**: Test wariantów każdego poziomu (dziś tylko średni ma „każdy szablon ma przechodzący wariant”): dla klasycznych poziomów liczba i czas wariantów, dla `trudny` jawnie dopuszczone szablony bez wariantu (`kot`, `tulipan`), dla `latwy` wszystkie warianty przechodzą reguły prostej karty albo są odrzucone z nazwanym powodem. Zamienić odwołania do `maly`/`duzy`. Pętle po `NONOGRAM_SIZES` w `generate.test.ts`, `clues.test.ts`, `layout.test.ts` i `object-categories.test.ts` rozdzielić po `kind`: klasyczne poziomy przechodzą przez solver, łatwy przez `simpleNonogramProblems`.

**Contract**: wynik liczbowy każdego poziomu wypisany przez `t.diagnostic` i wpisany w PR i w Open Questions 11; limit 5 s na wszystkie warianty poziomu.

### Success Criteria:

#### Automated Verification:

- Testy logiki przechodzą: `npm test`
- Typy: `npx astro check`
- Lint: `npm run lint`

#### Manual Verification:

- Liczby wariantów każdego poziomu zanotowane do PR i PRD

**Implementation Note**: Po fazie wstrzymaj się na potwierdzenie.

---

## Phase 2: Strona: wybór poziomu i karta łatwa

### Overview

Pasek „Poziom”, rysowanie karty ze znaczkami, rozwiązanie tylko na ekranie, układ w marginesie 10 mm.

### Changes Required:

#### 1. Układ karty ze znaczkami

**Files**: `src/lib/nonogram/layout.ts`, `src/lib/nonogram/sheet.ts`, `src/lib/nonogram/layout.test.ts`

**Intent**: Dodać układ kartki łatwej: zdanie polecenia, pasek znaczków z lewej strony rzędu, kratka; blok wyśrodkowany w marginesie 10 mm, rzuca przy przekroczeniu jak klasyczny układ. Stałe znaczków (bok 9,5 mm, odstęp 1,2 mm, cyfra 6 mm, polecenie „Pokoloruj każdy rząd według znaczków.”) w `sheet.ts`, żeby miniatura i skrypt makiety czytały to samo.

**Contract**: `layoutSimpleNonogramSheet(input)` zwraca `page`, `instruction`, `grid`, pozycję znaczka (wiersz, indeks, liczba znaczków); test: każdy wariant łatwego mieści się w marginesie.

#### 2. Komponent strony

**File**: `src/components/NonogramGenerator.tsx`

**Intent**: Dodać stan `sizeId` (domyślnie `sredni`) i przycisk „Poziom” z `SudokuChoice` (opcje: łatwy, średni, trudny) w pasku obok kategorii; zmiana poziomu przy pokazanej karcie woła generowanie na nowym poziomie, a „Pokaż rozwiązanie” wraca do wyłączonego. Rysować kartę ze znaczkami komponentem `SimpleNonogramSheet` w osobnym pliku `src/components/NonogramSimpleSheet.tsx` (znaczki: biały obrys, szary i czarny wypełnienie; liczba biała na czarnym; grubsza linia co 5 kratek jak `blockLines`; rozwiązanie zamalowuje tony tylko na ekranie, grupa `print:hidden`).

**Contract**: oba pliki zachowują klasy `print:hidden` na sterowaniu i grupie rozwiązania, SVG 210×297 mm z `print:overflow-hidden`, `printColorAdjust: exact` (kontrakt w `print-contract.test.ts` pozostaje prawdziwy dla obu kartek).

#### 3. Skrypty i makiety

**Files**: `scripts/build-thumbnails.mjs`, `scripts/nonogram-mockup.mjs`, `scripts/nonogram-simple-mockup.mjs`, `context/changes/nonogram-sizes/mockup-*.html`

**Intent**: Miniatura zostaje średnia (sprawdzić, że nadal buduje się z `DEFAULT_NONOGRAM_SIZE_ID`). Usunąć `nonogram-mockup.mjs` i `mockup-maly.html` (klasyczny 8×12 nie istnieje); skrypt prostej makiety przestawić na stałe z `sheet.ts` i `simple.ts`, żeby makieta nie rozjechała się z kartą.

**Contract**: bez zmian w `src/lib/cards.ts`.

#### 4. Kontrakt druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: `svgClassName` sprawdza tylko pierwszy `<svg>` w pliku, więc druga kartka w tym samym pliku zostałaby bez kontroli; dlatego karta ze znaczkami jest w osobnym pliku, a testy (rozmiar SVG 210×297 mm, kolory, grupa rozwiązania `print:hidden`) powtarzamy dla `NonogramSimpleSheet.tsx`. Lista klas `print:hidden` w `NonogramGenerator.tsx` zostaje taka sama.

**Contract**: test ma pilnować obu kartek: wydruk bez rozwiązania.

### Success Criteria:

#### Automated Verification:

- `npm run lint`
- `npm test`
- `npx astro check`
- `npm run build`

#### Manual Verification:

- Podgląd wydruku każdego poziomu (łatwy 8×12, średni 12×15, trudny 18×24): jedna strona A4, margines 10 mm, grubsza linia co 5 kratek
- Zmiana poziomu przy pokazanej karcie daje nową kartę na tym poziomie, a „Pokaż rozwiązanie” jest wyłączone
- Na telefonie (375 px) Generuj i Drukuj nie nachodzą na siebie, każdy poziom mieści się na A4
- Cyfry i znaczki czytelne na wydruku (łatwy: znaczki 9,5 mm; trudny: kratka 7 mm, dwucyfrowe liczby w nagłówkach kolumn)

**Implementation Note**: Po fazie wstrzymaj się na potwierdzenie.

---

## Phase 3: PRD i roadmapa

### Overview

Dokumentacja zgodna z decyzjami.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: US-15 (łatwy: karta ze znaczkami), US-16 „Rodzic wybiera poziom nonogramu” (łatwy, średni, trudny; nie wiek), FR-025, Business Logic „Karta nonogramu” (tabela poziomów, reguła obrysu, szare tło, grubsza linia co 5), linie podsumowania w Success Criteria, Open Questions 11 z liczbami z sondy i uwagą o `kot`/`tulipan` w trudnym.

**Contract**: bez zmiany numeracji US/FR.

#### 2. Roadmapa

**File**: `context/foundation/roadmap.md`

**Intent**: Zaktualizować S-24 (tytuł „Poziomy nonogramu”, Outcome, notatka o zmianie z rozmiarów na poziomy).

**Contract**: Change ID zostaje `nonogram-sizes`.

### Success Criteria:

#### Automated Verification:

- `npm run lint` (Prettier na plikach md)

#### Manual Verification:

- PRD i roadmapa opisują poziomy łatwy, średni, trudny, a nie mały, średni, duży

---

## Testing Strategy

### Unit Tests:

- Poziomy: jedno rozwiązanie bez zgadywania (średni, trudny) i reguły prostej karty (łatwy) dla każdego wariantu; liczby i czas.
- Układ każdego poziomu mieści się w 10 mm; prosty układ rzuca przy przekroczeniu.
- Generator: klucz inny niż poprzedni na każdym poziomie, kategoria zawęża obiekty.

### Manual Testing Steps:

1. Otworzyć `/nonogram`, wygenerować każdy poziom, włączyć „Pokaż rozwiązanie”, zmienić poziom.
2. Wydrukować podgląd każdego poziomu na A4.
3. Sprawdzić telefon 375 px.

## Performance Considerations

Najdłuższe Generuj 7,8 ms (trudny); łatwy bez solvera. Limit 5 s zachowany z ogromnym zapasem.

## References

- Related research: `context/changes/nonogram-sizes/research.md`
- Archiwum S-22: `context/archive/2026-10-25-nonogram-first-printable/`
- Wzorzec wyboru: `src/components/SudokuChoice.tsx`
- Makiety: `context/changes/nonogram-sizes/mockup-prosty.html`, `mockup-sredni.html`, `mockup-duzy.html`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Poziomy i logika prostej karty

#### Automated

- [x] 1.1 Testy logiki przechodzą: `npm test` — d327b13
- [x] 1.2 Typy: `npx astro check` — d327b13
- [x] 1.3 Lint: `npm run lint` — d327b13

#### Manual

- [x] 1.4 Liczby wariantów każdego poziomu zanotowane do PR i PRD — e2a4017

### Phase 2: Strona: wybór poziomu i karta łatwa

#### Automated

- [x] 2.1 `npm run lint` — c75fe4a
- [x] 2.2 `npm test` — c75fe4a
- [x] 2.3 `npx astro check` — c75fe4a
- [x] 2.4 `npm run build` — c75fe4a

#### Manual

- [x] 2.5 Podgląd wydruku każdego poziomu: jedna strona A4, margines 10 mm, grubsza linia co 5 kratek — c75fe4a
- [x] 2.6 Zmiana poziomu przy pokazanej karcie daje nową kartę, „Pokaż rozwiązanie” wyłączone
- [x] 2.7 Na telefonie (375 px) Generuj i Drukuj nie nachodzą na siebie, każdy poziom mieści się na A4
- [x] 2.8 Cyfry i znaczki czytelne na wydruku — c75fe4a

### Phase 3: PRD i roadmapa

#### Automated

- [x] 3.1 `npm run lint` (Prettier na plikach md) — e2a4017

#### Manual

- [x] 3.2 PRD i roadmapa opisują poziomy łatwy, średni, trudny — e2a4017
