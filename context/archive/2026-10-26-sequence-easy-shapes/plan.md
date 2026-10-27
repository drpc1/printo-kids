# Łatwe kształty sekwencji — plan implementacji

## Overview

Sekwencje dostają trzy kolejne kształty w jednej liście używanej na każdym poziomie: serce i ukośny krzyżyk skopiowane z sudoku oraz nową strzałkę na skos w górę w prawo. Dziecko widzi je w wzorach na poziomach 1–3 i w regułach „grupy” oraz „kształt z liczbą” na poziomie 4.

## Current State Analysis

Katalog sekwencji to cztery identyfikatory: `kolo`, `kwadrat`, `trojkat`, `gwiazdka` (`SEQUENCE_SHAPES` w `src/lib/sequence/shapes.ts`). `sequenceShapeOutline` zwraca koło albo wielokąt. Tę samą funkcję czytają `SequenceGenerator.tsx` i `scripts/build-thumbnails.mjs`, więc miniatura nie może rozjechać się z kartą.

Łatwy zestaw sudoku 4×4 to `circle`, `square`, `triangle`, `heart`, `cross` (`SUDOKU_SHAPES_4`). Krzyżyk sudoku jest plusem obróconym o 45°, więc na karcie jest X mieszczący się w kwadracie boku. Serce jest krzywą. Sudoku nie ma strzałki. Dyktando ma tylko znaki tekstowe `← → ↑ ↓`.

Jedna lista zasila każdą regułę z kształtów: `AB`, `AAB`, `ABC` oraz `groups` i `mixed` na poziomie 4 (`lat7`). Losowanie, wyliczenie dopuszczalnych wierszy i kontrola jednoznaczności biorą alfabet z `SEQUENCE_SHAPES`. Pole kształtu to 0,6 boku kratki, kreska 0,9 mm (`SEQUENCE_SHEET`). Moduły sekwencji i sudoku się nie importują.

Test nieznanego kształtu podstawia dziś napis `"serce"`. Miniatura katalogu powstaje z `generateSequenceCard` przy ziarnie `20261025` i poziomie `lat5`.

## Desired End State

Po Generuj na dowolnym poziomie karta może wylosować serce, ukośny krzyżyk i strzałkę w górę w prawo obok dotychczasowych czterech kształtów. Serce i krzyżyk mają ten sam obrys co w sudoku przy tym samym środku i boku. Strzałka jest jednym, stałym kształtem: trzonek z grotem, zamknięty kontur, nie większy od koła w tej samej kratce i odróżnialny od trójkąta oraz od krzyżyka. Kreska i skala zostają od sekwencji. Poziom 4 losuje nowe kształty w grupach i w kształcie z liczbą. Miniatura katalogu jest narysowana z nowej listy.

### Key Discoveries:

- Serce sudoku nie da się wyrazić wielokątem (`src/lib/sudoku/shapes.ts`, obiekt `heart`). Sekwencja musi dostać trzeci rodzaj obrysu: ścieżkę SVG.
- `sudokuShapePath("heart" | "cross", cx, cy, size)` jest już w milimetrach strony i mieści się w kwadracie boku (`src/lib/sudoku/shapes.test.ts`).
- Dopisanie identyfikatorów na końcu `SEQUENCE_SHAPES` zostawia poprawne `const [KOLO, KWADRAT, TROJKAT, GWIAZDKA] = SEQUENCE_SHAPES` w `src/lib/sequence/generate.test.ts`.
- `hypotheses` buduje wszystkie okresowe ciągi alfabetu. Przy 8 polach okres 4 rośnie z 4⁴ = 256 do 7⁴ = 2401 wierszy. Wyrocznia luk liczy `SYMBOLS.length ** liczba luk` (dziś 24, będzie 27). Obowiązuje istniejący próg: sto kart poziomu 4 poniżej 5 s.

## What We're NOT Doing

- Romb, księżyc i kropla.
- Kolory kształtów na karcie sekwencji.
- Więcej niż jeden kierunek strzałki i losowy obrót.
- Osobna lista kształtów dla poziomu 4.
- Zmiana `shapeScale`, `shapeStroke`, liczby pól, reguł albo poziomów.
- Wspólny moduł geometrii dla wszystkich kart i zmiana rysowania sudoku.
- Nowa reguła sekwencji.

## Implementation Approach

Najpierw da się narysować trzy obrysy, jeszcze poza losowaniem. Serce i krzyżyk zwracają ścieżkę równą `sudokuShapePath` dla `heart` i `cross`. Strzałka powstaje tylko w module sekwencji. Potem trzy identyfikatory wchodzą na koniec `SEQUENCE_SHAPES`. Reguły nie dostają drugiej listy: kto czyta katalog, losuje już nowe kształty, także `groups` i `mixed`.

## Critical Implementation Details

- **Kolejność katalogu.** W fazie 1 identyfikatory `serce`, `krzyzyk` i `strzalka` istnieją w typie i w `sequenceShapeOutline`, ale nie w `SEQUENCE_SHAPES`. Faza 2 dopisuje je na końcu, w tej kolejności. Wstawienie ich wcześniej psuje nazwy wyciągnięte z czterech pierwszych miejsc tablicy.
- **Oś Y w dół.** Grot strzałki w górę w prawo to punkt o największym x powyżej środka (mniejsze y) i ogon o najmniejszym x poniżej środka (większe y).
- **Test `"serce"`.** `src/lib/sequence/generate.test.ts` traktuje napis `"serce"` jako kształt nieznany. Po wejściu `serce` do katalogu ten wiersz jest poprawnym kształtem. Token nieznanego kształtu ma być innym napisem, na przykład `"romb"`.
- **Dwie rysownie.** Gałąź ścieżki musi powstać i w `SequenceGenerator.tsx`, i w `scripts/build-thumbnails.mjs`. Miniatura używa czarnego `#000`, strona tokenu `foreground`. Jedna bez drugiej rozjedzie katalog z kartą.
- **Alfabet kontroli.** Nie zawężać `hypotheses` ani `followsRule` do starych czterech kształtów. Inaczej puste pole dałoby się wypełnić sercem w sposób, którego generator nie uważa za drugą odpowiedź.

## Phase 1: Obrysy i rysowanie

### Overview

Serce, ukośny krzyżyk i strzałka mają obrys w milimetrach strony i da się je narysować na karcie oraz w skrypcie miniatury. Generator nadal losuje tylko cztery dotychczasowe kształty.

### Changes Required:

#### 1. Obrysy sekwencji

**File**: `src/lib/sequence/shapes.ts`

**Intent**: Dodać trzy kształty, które strona potrafi narysować, zanim wejdą do losowania. Serce i krzyżyk mają być tymi samymi obrysami co w sudoku. Strzałka jest nowym, jednym kształtem na skos w górę w prawo.

**Contract**: Typ `SequenceShape` obejmuje też `"serce" | "krzyzyk" | "strzalka"`. `SEQUENCE_SHAPES` w tej fazie zostaje czteroelementowe. `SequenceShapeOutline` dostaje trzeci wariant `{ kind: "path"; d: string }`. Dla tego samego `cx`, `cy` i `size`:

- `sequenceShapeOutline("serce", ...)` zwraca ścieżkę o `d` równym `sudokuShapePath("heart", cx, cy, size)`
- `sequenceShapeOutline("krzyzyk", ...)` zwraca ścieżkę o `d` równym `sudokuShapePath("cross", cx, cy, size)`

`strzalka` to zamknięta ścieżka (zaczyna się od `M`, kończy na `Z`) zbudowana w tym pliku. Punkty leżą w kwadracie boku `size` wokół środka, środek pudełka jest na `(cx, cy)`, szerokość i wysokość pudełka mają co najmniej `0.8 * size`. Punkt o największym x jest powyżej środka, punkt o najmniejszym x poniżej środka.

#### 2. Testy obrysu

**File**: `src/lib/sequence/shapes.test.ts`

**Intent**: Utwardzić równość z sudoku i geometrię strzałki, zanim katalog zacznie je losować. Istniejący test czterech kształtów zostaje, bo katalog jeszcze ich nie zawiera.

**Contract**: Nowy test woła trzy identyfikatory wprost. Porównanie z sudoku jest równością całego `d`, nie przybliżeniem pudełka. Asercje strzałki sprawdzają zamknięcie, pudełko, środek, oba wymiary i położenie grotu względem ogona w osi Y w dół.

#### 3. Karta i skrypt miniatury

**File**: `src/components/SequenceGenerator.tsx`

**File**: `scripts/build-thumbnails.mjs`

**Intent**: Ścieżka ma być narysowana tak jak dzisiejszy wielokąt: kontur, bez wypełnienia, z zaokrąglonym łączeniem. W tej fazie skrypt miniatury nie jest uruchamiany ponownie, bo ziarno `20261025` nadal losuje stare cztery kształty.

**Contract**: Dla `kind: "path"` strona rysuje `<path d={outline.d}>` z `fill="none"`, `stroke="var(--foreground)"`, `strokeWidth={SEQUENCE_SHEET.shapeStroke}` i `strokeLinejoin="round"`. Skrypt miniatury rysuje ten sam `d` z `fill="none"`, `stroke="#000"` i tą samą grubością oraz łączeniem. Koło i wielokąt zostają.

### Success Criteria:

#### Automated Verification:

- `node --experimental-strip-types --test src/lib/sequence/shapes.test.ts` przechodzi: `d` dla `serce` równa się `sudokuShapePath("heart")`, a dla `krzyzyk` równa się `sudokuShapePath("cross")`, przy tym samym środku i boku; `strzalka` jest zamkniętą ścieżką wewnątrz kwadratu, wyśrodkowaną, o szerokości i wysokości co najmniej 0,8 boku, z grotem w górę w prawo (największe x powyżej środka, najmniejsze x poniżej środka)
- `npm run lint` przechodzi
- `npx astro check` przechodzi

---

## Phase 2: Jedna lista na wszystkich poziomach

### Overview

Te same trzy kształty wchodzą do losowania każdej reguły z kształtów, od poziomu 1 do poziomu 4. Miniatura katalogu powstaje od nowa z tej listy.

### Changes Required:

#### 1. Katalog

**File**: `src/lib/sequence/shapes.ts`

**Intent**: Jedna lista ma być alfabetem wzorów, grup i kształtu z liczbą. Osobna lista dla poziomu 4 została odrzucona.

**Contract**: `SEQUENCE_SHAPES` to `["kolo", "kwadrat", "trojkat", "gwiazdka", "serce", "krzyzyk", "strzalka"]`. `src/lib/sequence/rules.ts` nie dostaje drugiej tablicy: `rowFromRule`, `ruleSequences` i `periodicSequences` dalej czytają `SEQUENCE_SHAPES`.

#### 2. Testy losowania i obrysu czterech kształtów

**File**: `src/lib/sequence/generate.test.ts`

**File**: `src/lib/sequence/shapes.test.ts`

**Intent**: Pokazać, że nowe kształty naprawdę wypadają na poziomach 1–3 i na poziomie 4, oraz że napis `"serce"` nie jest już używany jako kształt nieznany. Test czterech obrysów, który iteruje po całym katalogu, ma objąć siedem kształtów bez psucia kontraktu koła, kwadratu, trójkąta i gwiazdki.

**Contract**: W istniejącej pętli ziaren (`SEEDS`) każdy z `serce`, `krzyzyk`, `strzalka` występuje wśród wartości kart `lat4`, `lat5` i `lat6`. Na `lat7` każdy z tych trzech występuje w wierszu o regule `groups` albo `mixed`. Asercja „każdy kształt z katalogu pojawia się na lat4 i lat5” zostaje i dotyczy już siedmiu kształtów. Przypadek nieznanego kształtu używa tokenu spoza `SEQUENCE_SHAPES`. Test stu kart `lat7` poniżej 5 s zostaje bez podnoszenia progu. Test czterech obrysów rozróżnia koło i wielokąty od ścieżek, zamiast żądać liczby wierzchołków od serca, krzyżyka i strzałki.

#### 3. Miniatura katalogu

**File**: `public/thumbnails/sekwencje.svg`

**Intent**: Katalog ma pokazywać kartę z aktualnego generatora. Po zmianie alfabetu to samo ziarno daje inną kartę.

**Contract**: Uruchomić `node scripts/build-thumbnails.mjs` i zostawić wygenerowany `public/thumbnails/sekwencje.svg`. Ziarno `SEQUENCE_SEED` (`20261025`) i poziom `lat5` zostają. Nie edytować SVG ręcznie.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi: w pętli ziaren `serce`, `krzyzyk` i `strzalka` występują na `lat4`, `lat5` i `lat6` oraz na `lat7` w wierszu `groups` albo `mixed`; token nieznanego kształtu leży poza katalogiem; sto kart `lat7` mieści się w 5 s
- `node scripts/build-thumbnails.mjs` zapisuje od nowa `public/thumbnails/sekwencje.svg` dla ziarna `20261025`

#### Manual Verification:

- Na `/sekwencje` poziomy 1 i 4 pokazują serce, ukośny krzyżyk i strzałkę w górę w prawo jako czarne kontury nie większe od koła w tym samym polu; strzałka różni się od trójkąta i od krzyżyka
- Miniatura sekwencji w katalogu i podgląd druku `/sekwencje` to nadal jedna strona A4

**Implementation Note**: Po zielonych testach tej fazy zatrzymaj się na ręczne obejrzenie poziomów 1 i 4 oraz druku, zanim zmiana zostanie uznana za skończoną.

---

## Testing Strategy

### Unit Tests:

- Równość ścieżek serca i krzyżyka z `sudokuShapePath` przy wspólnym środku i boku.
- Pudełko, środek, oba wymiary i kierunek grotu strzałki.
- Wystąpienie trzech nowych kształtów na `lat4`–`lat6` oraz w `groups` lub `mixed` na `lat7`.
- Nieznany token nadal daje `unknown-item`.
- Istniejąca wyrocznia jednej odpowiedzi i próg 5 s zostają.

### Integration Tests:

- Brak nowego testu Playwrighta. Katalog i telefon już wchodzą na `/sekwencje`; ta zmiana nie rusza paska poziomów ani układu strony.

### Manual Testing Steps:

1. Otwórz `/sekwencje`, poziom 1, i klikaj Generuj, aż widać serce, krzyżyk i strzałkę.
2. To samo na poziomie 4, w ciągach grup i kształtu z liczbą.
3. Porównaj wielkość z kołem w tej samej kratce i odróżnij strzałkę od trójkąta oraz krzyżyka.
4. Otwórz podgląd druku i katalog `/`: jedna strona A4, miniatura sekwencji jest kartą, nie pustym obrazkiem.

## Performance Considerations

Kontrola jednoznaczności skanuje więcej ciągów okresowych (do 2401 przy 8 polach zamiast 256), a wyrocznia w teście wypełnia luki alfabetem 27 symboli zamiast 24. Przy trzech lukach to 27³ = 19683 wypełnień zamiast 24³ = 13824. Nie dodajemy pamięci podręcznej ani drugiego alfabetu. Bramką zostaje test stu kart `lat7` poniżej 5 s.

## Migration Notes

Karty nie są zapisane na serwerze. Jedyny artefakt do odświeżenia to `public/thumbnails/sekwencje.svg` w fazie 2. Wydrukowane wcześniej karty zostają przy czterech kształtach.

## References

- Issue: https://github.com/drpc1/printo-kids/issues/112
- Katalog sekwencji: `src/lib/sequence/shapes.ts`
- Obrysy sudoku: `src/lib/sudoku/shapes.ts` (`SUDOKU_SHAPES_4`, `heart`, `crossShape`)
- Losowanie z jednej listy: `src/lib/sequence/rules.ts` (`rowFromRule`, `periodicSequences`)
- Poziom 4: `src/lib/sequence/levels.ts` (`lat7`: `mixed`, `down1`, `groups`)
- Miniatura: `scripts/build-thumbnails.mjs` (`SEQUENCE_SEED`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Obrysy i rysowanie

#### Automated

- [x] 1.1 `node --experimental-strip-types --test src/lib/sequence/shapes.test.ts` przechodzi: `d` dla `serce` równa się `sudokuShapePath("heart")`, a dla `krzyzyk` równa się `sudokuShapePath("cross")`, przy tym samym środku i boku; `strzalka` jest zamkniętą ścieżką wewnątrz kwadratu, wyśrodkowaną, o szerokości i wysokości co najmniej 0,8 boku, z grotem w górę w prawo (największe x powyżej środka, najmniejsze x poniżej środka) — 24be541
- [x] 1.2 `npm run lint` przechodzi — 24be541
- [x] 1.3 `npx astro check` przechodzi — 24be541

### Phase 2: Jedna lista na wszystkich poziomach

#### Automated

- [x] 2.1 `npm test` przechodzi: w pętli ziaren `serce`, `krzyzyk` i `strzalka` występują na `lat4`, `lat5` i `lat6` oraz na `lat7` w wierszu `groups` albo `mixed`; token nieznanego kształtu leży poza katalogiem; sto kart `lat7` mieści się w 5 s — b280bf6
- [x] 2.2 `node scripts/build-thumbnails.mjs` zapisuje od nowa `public/thumbnails/sekwencje.svg` dla ziarna `20261025` — b280bf6

#### Manual

- [x] 2.3 Na `/sekwencje` poziomy 1 i 4 pokazują serce, ukośny krzyżyk i strzałkę w górę w prawo jako czarne kontury nie większe od koła w tym samym polu; strzałka różni się od trójkąta i od krzyżyka — b280bf6
- [x] 2.4 Miniatura sekwencji w katalogu i podgląd druku `/sekwencje` to nadal jedna strona A4 — b280bf6
