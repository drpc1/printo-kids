# Wspólne polecenie bez postaci (GitHub 427) — plan wdrożenia

## Overview

Bez postaci każda karta rysuje polecenie własnym `<text>` w jednej linii, bez sprawdzenia szerokości. Długie polecenia wychodzą poza kartkę (Kodowanie, a według estymaty także Dyktando i Krzyżówka). Wprowadzamy jeden wspólny układ i komponent „polecenie bez postaci”: jedna linia, gdy się mieści w 190 mm, a inaczej jedna linia na zdanie, z pasem tak wysokim, jak te linie. Przechodzą na niego wszystkie karty i miniatury katalogu, a jeden test pilnuje poleceń wszystkich kart.

## Current State Analysis

- Z postacią polecenie łamie `instructionLines` w dymku z `maxWidth` (`src/lib/sheet/speech.ts:57-59`, `:103`; `src/components/SpeechBand.tsx:87`). Bez postaci pas ma wysokość czcionki (`instructionBoxHeight`, `speech.ts:62-64`), a tekst jest jedną linią.
- Szesnaście komponentów ma własną gałąź bez postaci: `CodingSheet`, `ClockSheet`, `CopyDrawingSheet`, `DictationGenerator`, `MathCrosswordSheet`, `MoneyGenerator`, `NonogramGenerator`, `NonogramSimpleSheet`, `NumberMazeSheet`, `OddOneOutGenerator`, `PatternLinesSheet`, `SequenceGenerator`, `ShadowsSheet`, `SizeOrderSheet`, `SudokuGenerator`, `SymmetryGenerator` (grep `instructionBoxHeight` / `plainInstructionSize` / `instructionSize` w `src/components`).
- Estymata (`estimatedTextWidth` = znaki × rozmiar × 0,52), 190 mm dostępne: Kodowanie Zapisz Poziomy 1–3 ≈ 266 mm, Dyktando ≈ 215 mm, Kodowanie Zapisz Poziom 4 ≈ 211 mm, Krzyżówka ≈ 197 mm; pozostałe polecenia 145–167 mm.
- Skrypt miniatur powiela każdy `<text>` ręcznie (`scripts/build-thumbnails.mjs`, m.in. `:186`, `:246-248`, `:507`, `:908-913`).
- Jedyny test szerokości polecenia bez postaci jest w `src/lib/size-order/layout.test.ts:117-120`.

## Desired End State

Na każdej karcie bez postaci polecenie mieści się między marginesami 10 mm. Karty, których polecenie mieści się w jednej linii, wyglądają jak dziś: ten sam rozmiar, ten sam tekst, jedna linia. Karty z dłuższym poleceniem mają jedno zdanie w linii i wyższy pas, a zadanie pod nim zostaje w marginesie. Miniatury w katalogu pokazują to samo. Test nad poleceniami wszystkich kart (wszystkie poziomy i tryby) nie przepuści polecenia, które się nie mieści.

### Key Discoveries:

- Układy kart przyjmują wysokość pasa jako liczbę (`coding/layout.ts:69-72`, `symmetry/layout.ts:12`, `sequence/layout.ts:10`, `math-crossword/layout.ts:36`, `clock/layout.ts:258` i pozostałe), więc ich kontrakt się nie zmienia; zmienia się tylko przekazana liczba.
- Sudoku ma już dwie jawne linie i własny odstęp (`sudoku/layout.ts:48-52`, `sudoku/sheet.ts:12`); mieści się i zostaje przy swoich liniach.
- Dyktando bez postaci trzyma nominalną kratkę (`dictation/layout.ts:108-111`); przy wyższym pasie lista poleceń może zejść pod margines.
- Część kart ustawia tekst przez `dominant-baseline`, część przez `baselineShift` (GitHub 371: telefony różnie rysują `dominant-baseline`, `CodingSheet.tsx:15`, `coding/sheet.ts:38-39`).
- `npm test` uruchamia tylko pliki wymienione w `package.json`, a `src/lib/test-script.test.ts` tego pilnuje.

## What We're NOT Doing

- Nie zmieniamy treści poleceń ani dymka z postacią (`SpeechBand`).
- Nie zmniejszamy czcionki, żeby wcisnąć tekst w jedną linię.
- Nie mierzymy szerokości tekstu w czasie działania (bez pomiaru DOM przy renderze); zostaje estymata `estimatedTextWidth`, sprawdzona raz pomiarem w podglądzie w fazie 1 (krok 1.5).
- Nie ruszamy labiryntu (nie ma polecenia).
- Nie przebudowujemy układów kart poza przekazaniem nowej wysokości pasa i dopasowaniem kratki dyktanda.

## Implementation Approach

Logika układu w `src/lib/sheet/` (czysta funkcja, testowana w Node), rysowanie w jednym komponencie React, a skrypt miniatur używa tej samej funkcji. Najpierw helper i test (faza 1), potem przepięcie kart (faza 2), na końcu miniatury i wydruk (faza 3).

## Critical Implementation Details

- **Wysokość pasa a pozycja tekstu.** Pas ma wysokość `size + (n − 1) × size × 1,25`; linie są wyśrodkowane w pasie, a linia bazowa każdej leży `size × 0,36` pod jej środkiem (`baselineShift`, GitHub 371). Dla jednej linii to ten sam pas co dziś (`size`), więc karty, które się mieszczą, nie przesuwają zadania.
- **Dyktando bez postaci** musi dopasować kratkę do pasa (`fitCellSize`, tak jak z postacią), gdy pas ma więcej niż jedną linię; przy jednej linii zostaje nominalna kratka jak dziś.

## Phase 1: Wspólny układ i test

### Overview

Helper układu polecenia bez postaci, komponent, który go rysuje, i test nad poleceniami wszystkich kart.

### Changes Required:

#### 1. Układ polecenia bez postaci

**File**: `src/lib/sheet/plain-instruction.ts` (nowy), `src/lib/sheet/speech.ts`

**Intent**: Jedno miejsce, które z tekstu (albo jawnych linii, jak w sudoku), rozmiaru i szerokości kartki wylicza linie i wysokość pasa. Zasada: cały tekst w jednej linii, gdy mieści się w `pageWidth − 2 × inset`; inaczej `instructionLines` (jedna linia na zdanie). Zdanie, które samo się nie mieści, to błąd (rzut), który łapie test.

**Contract**: `layoutPlainInstruction({ text | lines, size, pageWidth, inset }) → { lines: string[]; size: number; height: number; lineOffsets: number[] }` (`lineOffsets` to środki linii względem góry pasa); stałe `lineHeightRatio` 1,25 i `baselineShift` 0,36 w jednym obiekcie stałych. `instructionBoxHeight(characterShown, plainHeight)` zostaje i dostaje `height` z helpera.

#### 2. Komponent polecenia bez postaci

**File**: `src/components/PlainInstruction.tsx` (nowy)

**Intent**: Rysuje linie z helpera jako SVG `<text>`, wyśrodkowane w poziomie, z `baselineShift` zamiast `dominant-baseline`, kolorem z tokenów (`var(--foreground)`).

**Contract**: props `{ layout: PlainInstructionLayout; centerX: number; top: number }`. Nowsze układy podają `top = band.y`; starsze (symetria, sekwencje, nonogram, dyktando), które zwracają tylko środek `instruction.y`, podają `top = instruction.y − layout.height / 2` (ich układy już przyjmują wysokość pasa, z postacią 26 mm).

#### 3. Test nad poleceniami wszystkich kart

**File**: `src/lib/sheet/plain-instruction.test.ts` (nowy), `src/lib/plain-instruction-cards.test.ts` (nowy), `package.json`

**Intent**: Testy jednostkowe helpera (krótki tekst → jedna linia i wysokość = rozmiar; długi → linie na zdania; za długie zdanie → błąd). Test kart zbiera polecenia bez postaci ze źródeł kart (wszystkie poziomy i tryby Kodowania, zegara, Labiryntu liczbowego, szlaczków i stałe pozostałych kart, sudoku z jawnymi liniami) i sprawdza, że helper je układa, a każda linia mieści się w 190 mm. Test sprawdza też pokrycie: zestaw kart, których polecenia zebrał, równa się `CARD_KINDS` (`src/lib/cards.ts:28`) bez labiryntu, więc nowa karta bez wpisu wywraca test. Asercja wprost: polecenia Kodowania Zapisz (Poziomy 1–4), Dyktanda i Krzyżówki dają więcej niż jedną linię, a pozostałe jedną (wartość zależy od kalibracji z kroku 1.5). Oba pliki dopisane do skryptu `test`.

**Contract**: test kart importuje teksty i rozmiary z modułów `src/lib/<karta>/` (jak `card-contract.test.ts`), nie z komponentów.

### Success Criteria:

#### Automated Verification:

- Testy helpera i test poleceń wszystkich kart przechodzą: `npm test`
- `npm run lint` i `npx astro check` bez błędów
- `npm run depcruise` bez nowych naruszeń

#### Manual Verification:

- Test kart wymienia długie polecenia Kodowania, Dyktanda i Krzyżówki jako dwuliniowe (po review: sprawdza to asercja testu; ręcznie wystarczy przejrzeć jej wynik)
- Prawdziwa szerokość czterech długich poleceń (Kodowanie Zapisz Poziomy 1–3 i 4, Dyktando, Krzyżówka) przy 7 mm zmierzona w podglądzie (`getComputedTextLength`) i zapisana obok szacunku; przy rozbieżności, która zmienia decyzję jedna/dwie linie, próg w helperze skalibrowany przed fazą 2

**Implementation Note**: Po fazie zatrzymaj się na potwierdzenie ręczne przed fazą 2.

---

## Phase 2: Migracja kart

### Overview

Wszystkie szesnaście kart rysuje polecenie bez postaci przez `PlainInstruction` i bierze wysokość pasa z helpera.

### Changes Required:

#### 1. Komponenty kart

**File**: 16 komponentów z Current State Analysis

**Intent**: Gałąź bez postaci zastąpiona komponentem; `instructionBoxHeight(false, …)` dostaje `layout.height` zamiast rozmiaru czcionki. Lokalne `CentredText` zostają tam, gdzie rysują inne napisy (np. „Start”, cyfry). Sudoku przekazuje swoje dwie jawne linie i swój odstęp przez istniejące pole `instructionLineCount` / `instructionBoxHeight`.

**Contract**: bez zmian w propsach kart; zmienia się tylko liczba przekazywana do `layout*Sheet`.

#### 2. Dyktando bez postaci

**File**: `src/lib/dictation/layout.ts`, `src/components/DictationGenerator.tsx`

**Intent**: Gdy pas bez postaci ma więcej niż jedną linię, kratka dopasowuje się tak, żeby lista poleceń została w marginesie (jak z postacią).

**Contract**: `dictationCellSize` dostaje wysokość pasa zamiast samej flagi `withBand` (albo obok niej); przy jednej linii wynik równy nominalnej kratce.

#### 3. Testy układów

**File**: `src/lib/{coding,clock,copy-drawing,math-crossword,pattern-lines}/layout.test.ts`, `src/lib/dictation/layout.test.ts`

**Intent**: `WITHOUT_CHARACTER` liczone z helpera dla najdłuższego polecenia karty, żeby testy sprawdzały wyższy pas tam, gdzie występuje.

**Contract**: istniejące asercje marginesu zostają.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` przechodzą
- Żaden komponent w `src/components` nie rysuje już polecenia bez postaci własnym `<text>` (grep `plainInstructionSize` / `instructionText` poza `PlainInstruction`)
- E2E Chromium przechodzi: `npx playwright test --project=chromium` (z `E2E_PORT` na wolnym porcie)

#### Manual Verification:

- Kodowanie (Zapisz, Poziomy 1–4), Dyktando i Krzyżówka bez postaci: polecenie w dwóch liniach, w marginesie, zadanie pod nim w marginesie (podgląd na ekranie)
- Pozostałe karty bez postaci: polecenie w jednej linii, bez widocznej zmiany względem dziś

**Implementation Note**: Po fazie zatrzymaj się na potwierdzenie ręczne przed fazą 3.

---

## Phase 3: Miniatury i sprawdzenie

### Overview

Skrypt miniatur używa helpera, miniatury są przebudowane, a wydruk sprawdzony.

### Changes Required:

#### 1. Skrypt miniatur

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/*.svg`

**Intent**: Jedna funkcja w skrypcie rysuje polecenie z `layoutPlainInstruction` (te same linie, wysokość i `baselineShift` co komponent); każda miniatura z poleceniem jej używa, a układ miniatury dostaje tę samą wysokość pasa. Przebudowane pliki SVG.

**Contract**: pliki w `public/thumbnails/` generowane skryptem, bez ręcznych edycji.

### Success Criteria:

#### Automated Verification:

- `npm run thumbnails` kończy się bez błędu, a `git diff --stat public/thumbnails` pokazuje zmiany
- `npm test`, `npm run lint`, `npm run build` przechodzą

#### Manual Verification:

- Miniatura Kodowania w katalogu: polecenie w dwóch liniach, w szerokości kartki
- Wydruk A4 bez postaci Kodowania (Zapisz Poziom 2 i 4), Dyktanda i Krzyżówki: jedna strona, polecenie w marginesie 10 mm
- Ten sam wydruk z telefonu (Safari, Chrome iOS, Brave iOS): jedna strona, linie polecenia wyśrodkowane w pionie

---

## Testing Strategy

### Unit Tests:

- Helper: jedna linia przy krótkim tekście, linie na zdania przy długim, wysokość pasa, błąd przy zbyt długim zdaniu, jawne linie (sudoku).
- Test kart: polecenia wszystkich kart, poziomów i trybów mieszczą się w 190 mm po ułożeniu.

### Integration Tests:

- Istniejące testy układów kart z wyższym pasem tam, gdzie polecenie ma dwie linie.
- Istniejące e2e Chromium.

### Manual Testing Steps:

1. Strona Kodowania, postać „Brak”, Zapisz, Poziomy 1–4: polecenie w marginesie.
2. Dyktando i Krzyżówka, postać „Brak”: to samo.
3. Kilka kart z krótkim poleceniem: bez zmian.
4. Katalog: miniatura Kodowania.
5. Wydruk na komputerze i na telefonie.

## Performance Considerations

Brak: helper liczy kilka linii przy renderze.

## Migration Notes

Brak danych do migracji; zapisane profile i ustawienia bez zmian.

## References

- Research: `context/changes/gh427-coding-no-character-instruction-overflow/research.md`
- Dymek z postacią: `src/lib/sheet/speech.ts:57-106`, `src/components/SpeechBand.tsx`
- Test szerokości do uogólnienia: `src/lib/size-order/layout.test.ts:117-120`
- GitHub 371 (`baselineShift`): `src/lib/coding/sheet.ts:38-39`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wspólny układ i test

#### Automated

- [x] 1.1 Testy helpera i test poleceń wszystkich kart przechodzą: `npm test` — 8710deb5
- [x] 1.2 `npm run lint` i `npx astro check` bez błędów — 8710deb5
- [x] 1.3 `npm run depcruise` bez nowych naruszeń — 8710deb5

#### Manual

- [x] 1.4 Test kart wymienia długie polecenia Kodowania, Dyktanda i Krzyżówki jako dwuliniowe — 8710deb5
- [x] 1.5 Prawdziwa szerokość czterech długich poleceń zmierzona w podglądzie, próg skalibrowany przed fazą 2 — 8710deb5

### Phase 2: Migracja kart

#### Automated

- [x] 2.1 `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` przechodzą — 2f4afb93
- [x] 2.2 Żaden komponent w `src/components` nie rysuje już polecenia bez postaci własnym `<text>` — 2f4afb93
- [x] 2.3 E2E Chromium przechodzi: `npx playwright test --project=chromium` (z `E2E_PORT` na wolnym porcie) — 2f4afb93

#### Manual

- [x] 2.4 Kodowanie (Zapisz, Poziomy 1–4), Dyktando i Krzyżówka bez postaci: polecenie w dwóch liniach, w marginesie — 2f4afb93
- [x] 2.5 Pozostałe karty bez postaci: polecenie w jednej linii, bez widocznej zmiany — 2f4afb93

### Phase 3: Miniatury i sprawdzenie

#### Automated

- [x] 3.1 `npm run thumbnails` kończy się bez błędu, a miniatury są przebudowane
- [x] 3.2 `npm test`, `npm run lint`, `npm run build` przechodzą

#### Manual

- [x] 3.3 Miniatura Kodowania w katalogu: polecenie w dwóch liniach, w szerokości kartki
- [x] 3.4 Wydruk A4 bez postaci Kodowania, Dyktanda i Krzyżówki: jedna strona, polecenie w marginesie 10 mm
- [x] 3.5 Ten sam wydruk z telefonu (Safari, Chrome iOS, Brave iOS): jedna strona
