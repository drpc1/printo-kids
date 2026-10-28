# Lista figur pod planszą sudoku z kształtami — Implementation Plan

## Overview

Na karcie sudoku z kształtami, pod planszą, drukuje się jeden rząd figur, które dziecko może wstawić na tej karcie: rysunek i polska nazwa. Karta z cyframi tego rzędu nie ma. Plansza zostaje tam, gdzie jest, i liczba pustych pól się nie zmienia. To issue #113.

## Current State Analysis

Arkusz sudoku to jeden SVG 210×297 mm. `layoutSudokuSheet` wyśrodkowuje polecenie i siatkę w marginesie 10 mm i rzuca błąd, gdy ten blok się nie mieści (`src/lib/sudoku/layout.ts`). Rozmiar pola to 40, 28 i 20 mm, więc siatka ma 160, 168 i 180 mm (`src/lib/sudoku/sheet.ts`). Pod siatką nic nie ma. Najciaśniejszy pas, od dołu siatki 9×9 z dymkiem postaci (`instructionBoxHeight` 26) do wewnętrznej krawędzi y = 287, ma 31 mm.

`SudokuCard.shapes` trzyma zestaw tej karty: cztery z pięciu najprostszych, sześć z dziewięciu albo wszystkie dziewięć, w kolejności wylosowanej przy Generuj. Karta z cyframi ma `shapes: []` i `symbols: "digits"`. Nazwy są w `SUDOKU_SHAPE_NAMES` i dziś nie są rysowane. Kredka jest stała dla identyfikatora kształtu (`sudokuShapeInk`).

PRD dla karty 4×4 mówi „bez paska kształtów i bez legendy” (`context/foundation/prd.md`, kryterium US-12). Osobno zabrania legendy kolorów, czyli liter przy kredkach (US-14 i Business Logic „Karta sudoku”).

## Desired End State

Rodzic generuje sudoku z kształtami i pod planszą widzi każdą figurę tej karty, raz, w kolejności katalogu: koło, kwadrat, trójkąt, serce, krzyżyk, gwiazdka, romb, księżyc, kropla. Pod rysunkiem jest nazwa. Włączone Kolory malują rysunek tą samą kredką co pola; nazwa zostaje czarna. Wyłączenie wraca do czarnego konturu i nie układa nowej planszy.

Karta 6×6 albo 9×9 przełączona na Cyfry nie ma tego rzędu, a siatka zostaje na tej samej wysokości co przy kształtach. Wszystko mieści się na jednej stronie A4, wewnątrz marginesu 10 mm. Miniatura w katalogu zostaje samą planszą.

### Key Discoveries:

- Dodanie wysokości rzędu do `blockHeight` w `layoutSudokuSheet` podniosłoby siatkę o połowę tej wysokości (`layout.ts`, wyśrodkowanie bloku). Rząd musi powstać obok tego wyliczenia, z gotowego prostokąta siatki.
- Przy 9×9 z dymkiem pas ma 31 mm. Najdłuższa nazwa na tej karcie to „gwiazdka” (8 znaków): 9×9 z kształtami bierze wszystkie dziewięć figur. Przy czcionce polecenia 6,5 mm i oszacowaniu szerokości 0,55 ma około 29 mm, a slot na 190 mm ma około 21 mm. Nazwa musi być mniejsza niż polecenie i węższa niż swój slot. Sam margines strony tego nie pilnuje, bo gwiazdka stoi w środku rzędu.
- `tests/e2e/sudoku-colors.spec.ts` i `tests/e2e/sudoku-levels.spec.ts` liczą wszystkie `path` w SVG. Kolory: 12 na karcie 4×4 i 46 na łatwym 9×9. Poziomy: 24 na łatwym 6×6, 12 na 4×4, 46 na łatwym 9×9 i 36 na średnim 9×9. Dodatkowe ścieżki listy obleją te oczekiwania, dopóki lista nie będzie osobną grupą. Licznik tekstu na karcie z cyframi (2 linie polecenia plus 29 cyfr) zostaje prawdziwy, bo przy cyfrach rzędu nie ma.
- `npm test` uruchamia tylko pliki wpisane w skrypt `test` w `package.json`. Nowy plik testu, którego tam nie ma, nie wejdzie do CI.

## What We're NOT Doing

- Paska cyfr 1–6 albo 1–9 na karcie liczbowej.
- Przesuwania, zmniejszania albo ponownego wyśrodkowania siatki.
- Drugiego rzędu, większych figur na karcie 4×4 i nagłówka nad listą.
- Kolejności wylosowanej dla karty i kolejności alfabetycznej.
- Listy zawsze kolorowej albo zawsze czarnej, niezależnie od przełącznika.
- Liter przy kredkach. Zakaz legendy kolorów zostaje.
- Miniatury katalogu i makiety `scripts/sudoku-mockup.mjs` z tym rzędem.
- Zmiany generatora, liczby pustych pól, klucza karty i zapisu profilu.
- Nowych tokenów koloru. Lista używa `sudokuShapeInk`.

## Implementation Approach

Nowa funkcja układa rząd z prostokąta, który `layoutSudokuSheet` już zwrócił. Nie woła jej ponownie i nie dokłada swojej wysokości do bloku. `SudokuSheet` maluje ten rząd po ramce, w osobnej grupie, tą samą ścieżką i tą samą kredką co pola. Karta z cyframi dostaje pustą listę pozycji, więc gałąź cyfr zostaje bez figur. Zdania PRD, które zabraniają paska, dostają opis tego rzędu; zdania o literach przy kolorach zostają.

## Critical Implementation Details

- **Wysokość rzędu nie wchodzi do wyśrodkowania.** `layoutSudokuSheet` zostaje liczeniem polecenia i siatki. Rząd czyta gotowe `grid` i kładzie się pod spodem. Inaczej karta z kształtów i karta z cyframi tego samego rozmiaru rozjadą się w pionie.
- **Nazwa nie dziedziczy 6,5 mm.** Oszacowanie szerokości znaku 0,55 jest już w `src/lib/sudoku/layout.test.ts`. Przy dziewięciu slotach „gwiazdka” tą czcionką ma około 29 mm i nie mieści się w slocie około 21 mm. Test, który mierzy „trójkąt” tylko względem krawędzi strony, zostanie zielony, gdy gwiazdka nachodzi na sąsiada.
- **Istniejące testy kolorów i poziomów liczą ścieżki całej karty.** Lista musi być w grupie, którą te testy pominą, albo ich liczby trzeba przeliczyć. Grupa jest trwalsza: oczekiwanie „12 podanych kształtów” dalej opisuje planszę.

## Phase 1: Geometria rzędu

### Overview

Czysta funkcja układa figury tej karty w jednym rzędzie pod siatką. Przy cyfrach nie zwraca żadnej pozycji. Testy pilnują kolejności katalogu, marginesu i tego, że siatka się nie rusza.

### Changes Required:

#### 1. Układ rzędu

**File**: `src/lib/sudoku/shape-list.ts`

**Intent**: Wyliczyć pozycje rzędu z gotowej siatki, żeby rysowanie nie zgadywało milimetrów i nie podnosiło planszy.

**Contract**: `layoutSudokuShapeList` przyjmuje prostokąt `grid` z `layoutSudokuSheet`, `pageWidth`, `pageHeight`, `inset`, `symbols` i `shapes`. Zwraca `{ items }`. Przy `symbols === "digits"` albo pustym `shapes` tablica `items` jest pusta. Przy kształtach jest po jednej pozycji na figurę zestawu, w kolejności `SUDOKU_SHAPES`, bez powtórzeń. Pozycja ma `id`, `name` z `SUDOKU_SHAPE_NAMES`, środek i bok rysunku oraz środek i rozmiar nazwy. Bok rysunku i rozmiar nazwy są wspólne dla 4×4, 6×6 i 9×9. Środki są równo rozłożone na szerokości `pageWidth - 2 * inset`. Rysunek i nazwa leżą poniżej `grid.y + grid.height` z zapasem na połowę `frameStroke` i nie wychodzą poza prostokąt marginesu 10 mm. Funkcja nie zmienia wejścia `layoutSudokuSheet`.

Zestaw `heart`, `circle`, `triangle`, `square` daje nazwy w kolejności: koło, kwadrat, trójkąt, serce.

#### 2. Test geometrii i rejestracja

**File**: `src/lib/sudoku/shape-list.test.ts`, `package.json`

**Intent**: Zamknąć kolejność, brak rzędu przy cyfrach i margines najciaśniejszej karty, oraz dopisać plik do skryptu, który CI naprawdę uruchamia.

**Contract**: Test buduje siatkę przez `layoutSudokuSheet` i podaje jej `grid` do `layoutSudokuShapeList`. Dla zestawu heart, circle, triangle, square nazwy to koło, kwadrat, trójkąt, serce. Dla `symbols: "digits"` `items` jest puste. Prostokąt siatki 4×4, 6×6 i 9×9, także z `instructionBoxHeight: 26`, jest równy temu, co zwraca samo `layoutSudokuSheet`. Na 9×9 z tym dymkiem, ze wszystkimi dziewięcioma figurami, każdy bok rysunku i nazwa „gwiazdka” mieszczą się w x od 10 do 200 i y do 287, poniżej ramki. Szerokość „gwiazdki”, liczona jako `8 * fontSize * 0.55`, jest mniejsza niż szerokość jej slotu (`(pageWidth - 2 * inset) / 9`). Skrypt `test` w `package.json` wymienia `src/lib/sudoku/shape-list.test.ts` obok `src/lib/sudoku/layout.test.ts`.

### Success Criteria:

#### Automated Verification:

- Test rzędu dla zestawu heart, circle, triangle, square zwraca nazwy koło, kwadrat, trójkąt, serce, a dla cyfr nie zwraca żadnej pozycji.
- Ten sam test zostawia prostokąt siatki 4×4, 6×6 i 9×9, z dymkiem i bez, równy wynikowi `layoutSudokuSheet`, a na 9×9 z `instructionBoxHeight` 26 rysunek i nazwa „gwiazdka” mieszczą się w marginesie 10 mm poniżej ramki, a szerokość „gwiazdki” liczona jako `8 * fontSize * 0.55` jest mniejsza niż szerokość slotu.
- `npm test` uruchamia `src/lib/sudoku/shape-list.test.ts`, bo plik jest w skrypcie `test`.

**Implementation Note**: Po zielonym `npm test` zatrzymaj się. Tej fazy nie ma co oglądać na stronie: rząd jeszcze nie jest narysowany.

---

## Phase 2: Rysowanie

### Overview

Arkusz maluje rząd pod ramką. Kolory włączone dają kredkę na rysunku i czarną nazwę. Karta z cyframi nie dostaje ścieżek listy. Miniatura zostaje bez zmian. Dotychczasowe testy kolorów i poziomów dalej liczą ścieżki planszy, nie listy.

### Changes Required:

#### 1. Rząd na arkuszu

**File**: `src/components/SudokuGenerator.tsx`

**Intent**: Pokazać zestaw pod planszą tą samą kredką co pola, bez ruszania podanych kształtów przy przełączeniu Kolorów.

**Contract**: `SudokuSheet` woła `layoutSudokuShapeList` z `sheet.grid` i `card.shapes` po istniejącym `layoutSudokuSheet`. Po ramce rysuje grupę `data-shape-list`. Każda pozycja to `sudokuShapePath` oraz `text` z nazwą. Obrys rysunku ma `SUDOKU_SHEET.shapeStroke`. Przy `colors` wypełnienie i obrys biorą `sudokuShapeInk(id, true)`; przy wyłączonych wypełnienie to `none`, a obrys `sudokuShapeInk(id, false)`. Nazwa ma zawsze `fill="var(--foreground)"` i rodzinę `ui-sans-serif, system-ui, sans-serif`, jak polecenie. Puste `items` nie dodają grupy. Gałąź cyfr i liczba podanych pól zostają.

#### 2. Liczniki ścieżek w testach karty

**File**: `tests/e2e/sudoku-colors.spec.ts`, `tests/e2e/sudoku-levels.spec.ts`

**Intent**: Zostawić oczekiwania liczby podanych kształtów przy planszy, gdy na karcie dojdą ścieżki listy.

**Contract**: Liczniki ścieżek planszy w obu specach pomijają `path` wewnątrz `[data-shape-list]`. W kolorach zostają oczekiwania 12 na 4×4 i 46 na łatwym 9×9. W poziomach zostają 24 na łatwym 6×6, 12 na 4×4, 46 na łatwym 9×9 i 36 na średnim 9×9. Asercja karty z cyframi, że w SVG nie ma żadnego `path`, zostaje w obu specach. Licznik tekstu na trudnym 9×9 z cyframi (2 linie polecenia plus 29 cyfr) zostaje bez zmian: lista przy cyfrach nie istnieje.

#### 3. Miniatura

**File**: `scripts/build-thumbnails.mjs`

**Intent**: Katalog dalej pokazuje samą planszę.

**Contract**: Skrypt miniatury nie importuje `layoutSudokuShapeList` i nie rysuje nazw kształtów. Bez zmian w pliku, jeśli już tak jest.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi.
- `npx astro check` kończy się bez błędów.

#### Manual Verification:

- Na `/sudoku` wygenerowana karta 4×4 pokazuje pod planszą cztery nazwy w kolejności katalogu. Włączenie Kolorów wypełnia te rysunki kredką planszy, nazwy zostają czarne, a podane kształty nie zmieniają miejsca.
- Karta 6×6 przełączona na Cyfry nie ma nazw kształtów, a plansza zostaje na tej samej wysokości.
- Karta 9×9 z kształtami i z postacią ma jeden rząd, który nie styka się z ramką i nie wychodzi poza stronę.

**Implementation Note**: Po zielonym `npm test` i `npx astro check` zatrzymaj się na obejrzenie trzech kart powyżej, zanim powstanie test przeglądarkowy.

---

## Phase 3: Przeglądarka i PRD

### Overview

Jeden test Playwright łapie obecność nazw, ich zniknięcie przy cyfrach i kredkę na liście. PRD przestaje zabraniać tego rzędu i dalej zabrania liter przy kolorach.

### Changes Required:

#### 1. Test przeglądarkowy

**File**: `tests/e2e/sudoku-shape-list.spec.ts`

**Intent**: Złapać w CI to, że lista jest przy kształtach, znika przy cyfrach i bierze kredkę razem z planszą.

**Contract**: Spec na projekcie `chromium`, w tym samym stylu co `tests/e2e/sudoku-colors.spec.ts`. Po Generuj na karcie z kształtami SVG zawiera nazwy zestawu. Po przełączeniu 6×6 na Cyfry tych nazw nie ma i w `[data-shape-list]` nie ma ścieżek. Po powrocie do kształtów i włączeniu Kolorów ścieżki listy mają `stroke` zaczynający się od `var(--symmetry-`, a tekst nazw zostaje przy `var(--foreground)`. Test nie wymaga innej kolejności po drugim Generuj i nie przechodzi po 4×4, 6×6 i 9×9 osobno.

#### 2. PRD

**File**: `context/foundation/prd.md`

**Intent**: Uzgodnić dokument z kartą: rząd figur jest częścią karty z kształtami, a legenda literowa kolorów dalej nie istnieje.

**Contract**: Kryterium US-12, które dziś kończy się „bez paska kształtów i bez legendy”, opisuje jeden rząd pod planszą: rysunek i nazwa każdej figury tej karty, kolejność katalogu, ta sama wielkość na każdym rozmiarze. US-13 albo Business Logic „Karta sudoku” mówi, że karta z cyframi rzędu nie ma. US-14 i akapit kolorów w „Karta sudoku” zostawiają „bez liter i bez legendy kolorów” i dopisują, że rysunek na liście używa tej samej kredki, a nazwa zostaje czarna. Zdania symetrii o legendzie (US-09, FR-018, Business Logic symetrii) bez zmian. FR-021 nie wraca do legendy numerów postaci.

### Success Criteria:

#### Automated Verification:

- `npx playwright test tests/e2e/sudoku-shape-list.spec.ts --project=chromium` przechodzi: nazwy są na karcie z kształtami, znikają po Cyfrach, a włączone Kolory malują ścieżki listy kredką.
- `npm test`, `npm run lint` i `npx astro check` przechodzą.

#### Manual Verification:

- Podgląd druku karty 9×9 z postacią jest jedną stroną A4, a rząd zostaje w marginesie 10 mm.
- W podglądzie czarno-białym nazwy da się przeczytać, gdy kredki zejdą do szarości.
- Miniatura sudoku w katalogu nie ma nazw pod planszą.
- W wąskim oknie telefonu rząd widać w podglądzie, a Generuj nie nachodzi na Drukuj.
- US-12, US-14 i Business Logic „Karta sudoku” opisują rząd figur i dalej zabraniają liter przy kolorach. Zdania symetrii o legendzie są bez zmian.

**Implementation Note**: Po zielonym teście przeglądarkowym i bramkach zatrzymaj się na podgląd druku, miniaturę i telefon. Tych czterech rzeczy automat nie ogląda.

---

## Testing Strategy

### Unit Tests:

- Kolejność katalogu na zestawie heart, circle, triangle, square: koło, kwadrat, trójkąt, serce.
- Pusta lista przy `symbols: "digits"`.
- Prostokąt siatki bez zmian względem `layoutSudokuSheet`, w tym 9×9 z dymkiem 26 mm.
- „gwiazdka” i rysunek wewnątrz marginesu, poniżej ramki, na 9×9 ze wszystkimi dziewięcioma figurami. Szerokość nazwy jest mniejsza niż slot.

### Integration Tests:

- Jeden spec Playwright: nazwy, brak listy po Cyfrach, kredka na `[data-shape-list]` przy włączonych Kolorach.
- `sudoku-colors.spec.ts` i `sudoku-levels.spec.ts` dalej liczą ścieżki planszy z pominięciem tej grupy. Licznik tekstu na karcie z cyframi zostaje.

### Manual Testing Steps:

1. Wygenerować 4×4, włączyć i wyłączyć Kolory, sprawdzić nazwy i to, że plansza nie mruga nowym układem.
2. Na 6×6 przełączyć Cyfry i z powrotem Kształty.
3. Na 9×9 wybrać postać i obejrzeć podgląd druku oraz wersję czarno-białą.
4. Otworzyć katalog i potwierdzić, że miniatura nie ma rzędu.
5. Zwęzić okno do szerokości telefonu i sprawdzić pasek Generuj / Drukuj.

## Performance Considerations

Rząd to co najwyżej dziewięć ścieżek i dziewięć napisów na karcie, która i tak rysuje do 81 pól. Osobnego budżetu nie ma. Lista nie woła generatora.

## Migration Notes

Zestaw jest już na karcie, a kredka wynika z identyfikatora kształtu. Klucz karty i profil nie dostają nowego pola. Zapisane profile i ostatnie ustawienia czytają się jak dotąd. Stara karta z kształtami, narysowana po tej zmianie, po prostu dostaje rząd.

## References

- Issue #113: lista figur zestawu tej karty pod planszą; karta z cyframi bez listy; układ planszy i liczba pustych pól bez zmian.
- `src/lib/sudoku/layout.ts`, `src/lib/sudoku/sheet.ts`, `src/lib/sudoku/shapes.ts`, `src/lib/sudoku/colors.ts`
- `src/components/SudokuGenerator.tsx`
- `tests/e2e/sudoku-colors.spec.ts`, `tests/e2e/sudoku-levels.spec.ts`
- `context/foundation/prd.md`: kryterium US-12, US-14, Business Logic „Karta sudoku”

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Geometria rzędu

#### Automated

- [x] 1.1 Test rzędu dla zestawu heart, circle, triangle, square zwraca nazwy koło, kwadrat, trójkąt, serce, a dla cyfr nie zwraca żadnej pozycji.
- [x] 1.2 Ten sam test zostawia prostokąt siatki 4×4, 6×6 i 9×9, z dymkiem i bez, równy wynikowi `layoutSudokuSheet`, a na 9×9 z `instructionBoxHeight` 26 rysunek i nazwa „gwiazdka” mieszczą się w marginesie 10 mm poniżej ramki, a szerokość „gwiazdki” liczona jako `8 * fontSize * 0.55` jest mniejsza niż szerokość slotu.
- [x] 1.3 `npm test` uruchamia `src/lib/sudoku/shape-list.test.ts`, bo plik jest w skrypcie `test`.

### Phase 2: Rysowanie

#### Automated

- [ ] 2.1 `npm test` przechodzi.
- [ ] 2.2 `npx astro check` kończy się bez błędów.

#### Manual

- [ ] 2.3 Na `/sudoku` wygenerowana karta 4×4 pokazuje pod planszą cztery nazwy w kolejności katalogu. Włączenie Kolorów wypełnia te rysunki kredką planszy, nazwy zostają czarne, a podane kształty nie zmieniają miejsca.
- [ ] 2.4 Karta 6×6 przełączona na Cyfry nie ma nazw kształtów, a plansza zostaje na tej samej wysokości.
- [ ] 2.5 Karta 9×9 z kształtami i z postacią ma jeden rząd, który nie styka się z ramką i nie wychodzi poza stronę.

### Phase 3: Przeglądarka i PRD

#### Automated

- [ ] 3.1 `npx playwright test tests/e2e/sudoku-shape-list.spec.ts --project=chromium` przechodzi: nazwy są na karcie z kształtami, znikają po Cyfrach, a włączone Kolory malują ścieżki listy kredką.
- [ ] 3.2 `npm test`, `npm run lint` i `npx astro check` przechodzą.

#### Manual

- [ ] 3.3 Podgląd druku karty 9×9 z postacią jest jedną stroną A4, a rząd zostaje w marginesie 10 mm.
- [ ] 3.4 W podglądzie czarno-białym nazwy da się przeczytać, gdy kredki zejdą do szarości.
- [ ] 3.5 Miniatura sudoku w katalogu nie ma nazw pod planszą.
- [ ] 3.6 W wąskim oknie telefonu rząd widać w podglądzie, a Generuj nie nachodzi na Drukuj.
- [ ] 3.7 US-12, US-14 i Business Logic „Karta sudoku” opisują rząd figur i dalej zabraniają liter przy kolorach. Zdania symetrii o legendzie są bez zmian.
