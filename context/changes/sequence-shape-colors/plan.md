# Sekwencje: kolory kształtów — plan

## Overview

Na stronie `/sequences` rodzic włącza kolory na pasku. Przy udanym Generuj każdy kształt obecny na karcie dostaje jedną kredkę z puli dziewięciu tokenów `--symmetry-*`, bez powtórzeń na tej karcie. Ten sam identyfikator ma tę samą kredkę w każdym wierszu. Następne Generuj losuje przydział od nowa. Domyślnie kolory są wyłączone i kształty zostają czarnymi konturami. Liczby, znak „?” i ramki pól zostają czarne. Przełącznik nie układa nowej karty. Karta nadal mieści się na jednej stronie A4.

To issue #116. Wzorzec paska i rysowania jest ten sam co w sudoku (US-14), z jedną różnicą ustaloną w tym planie: na sekwencjach kredka nie jest na stałe przypisana do kształtu.

## Current State Analysis

- `src/components/SequenceGenerator.tsx` trzyma kartę w stanie strony. `generateFor` woła `generateSequenceCard(Math.random, card?.key ?? null, …)` i podmienia kartę tylko przy sukcesie (`54:61`). Zmiana poziomu i zmiana profilu z innym poziomem układają nową kartę (`71:81`). Pasek przed kartą i po karcie jest w dwóch opakowaniach `print:hidden` (`137:141`, `163:166`).
- Kształt to polski identyfikator `SequenceShape`: `kolo`, `kwadrat`, `trojkat`, `gwiazdka`, `serce`, `krzyzyk`, `strzalka` (`src/lib/sequence/shapes.ts:3:13`). Pole rysuje koło, wielokąt albo ścieżkę z `fill="none"` i `stroke="var(--foreground)"` (`SequenceGenerator.tsx:282:308`). Puste pole to indeks w `gaps`: przerywana ramka i „?”, bez kształtu (`234:266`). Liczba to osobny `<text>` w `var(--foreground)` (`268:280`).
- `SequenceCard.key` nazywa poziom i ciągi, nie wygląd (`src/lib/sequence/generate.ts:22:28`, `83:88`). Istniejące testy generatora porównują klucze z ziarna `mulberry32` i nie porównują całego obiektu karty.
- `SequenceSettings` to samo `{ level }` (`src/lib/card-settings.ts:28:30`). Domyślne sekwencje to `{ level: "lat5" }` (`65`). Parser już umie czytać boolean `colors` (`120:122`), ale tylko dla kart, których domyślne ustawienia mają to pole. Test utrwala odczyt `{ sekwencje: { level: "lat7" } }` bez `colors` (`src/lib/card-settings.test.ts:37`).
- Sudoku: `colors: boolean`, domyślnie `false`, zapamiętane od razu przez `memory.remember({ colors })` bez `generateFor` (`src/components/SudokuGenerator.tsx:164:170`). Włączone kolory to wypełnienie i kontur `var(--symmetry-…)`; wyłączone to kontur `var(--foreground)` i `fill="none"` (`src/lib/sudoku/colors.ts:7:21`, `SudokuGenerator.tsx:336:343`). Cyfry tego koloru nie biorą. Tokeny kredek są w `:root` w `src/styles/global.css`.
- Podsumowanie profilu dopisuje „kolory” dla symetrii i sudoku, gdy przełącznik jest włączony. Sekwencje zwracają `extras: []` (`src/lib/card-summary.ts:71:77`). Plakietka katalogu pokazuje poziom. Miniatura katalogu rysuje czarne kontury.
- `src/lib/sheet/print-contract.test.ts:140:144` wymaga dokładnie dwóch napisów klas z `print:hidden` w `SequenceGenerator.tsx`. SVG sekwencji ma już `printColorAdjust: "exact"` (`SequenceGenerator.tsx:207`). Skrypt `test` w `package.json` wymienia pliki z nazwy.

## Desired End State

- Na obu paskach `/sequences` jest przełącznik „Kolory”, widoczny przed pierwszą kartą i po niej, na każdym poziomie, także na Poziomie 4. Domyślnie wyłączony.
- Wyłączony: kształty są czarnymi konturami, jak dziś. Włączony: kształt jest wypełniony swoją kredką i ma kontur w tym samym kolorze. Grubość konturu zostaje `SEQUENCE_SHEET.shapeStroke`.
- Przydział powstaje przy udanym Generuj i jest zapisany na karcie. Kształty obecne w `values` (także te, które w danym polu są luką) dostają kredki. Kolejność kształtów to kolejność `SEQUENCE_SHAPES`, a kredki są tasowaniem dziewięciu nazw: `red`, `blue`, `green`, `orange`, `purple`, `yellow`, `brown`, `gray`, `black`. Dwa kształty na jednej karcie nie dzielą kredki. Kształt, którego na karcie nie ma, nie ma wpisu.
- Przykład: Poziom 1 układa koło, kwadrat, koło, kwadrat i puste pole, a drugi wiersz znowu ma koło. Oba koła i koło z drugiego wiersza mają tę samą kredkę. Kwadrat ma inną. Puste pole nie rysuje kształtu. Następne Generuj może dać kołu inną kredkę. Przełącznik w tę i z powrotem zostawia ciągi i przydział.
- Poziom 4: wiersz „kształt z liczbą” maluje kształt i zostawia cyfry czarne. Wiersz samych liczb zostaje czarny. Przełącznik na tym poziomie zostaje.
- Nieudane Generuj zostawia poprzednią kartę i jej przydział.
- Boolean jest zapamiętany jak poziom: w aktywnym profilu albo, bez profilu, w ostatnich ustawieniach. Stary zapis bez `colors` czyta się jako wyłączone kolory. Przydział kredek nie trafia do profilu ani do klucza karty.
- Okno profilu pokazuje „kolory” przy sekwencjach, gdy przełącznik jest włączony. Plakietka katalogu zostaje przy poziomie. Miniatura zostaje czarna.
- Karta zostaje jedną stroną A4 z marginesem co najmniej 10 mm. Kolory druku wychodzą dzięki już ustawionemu `printColorAdjust`.

### Key Discoveries:

- Serce i krzyżyk pożyczają ścieżki sudoku, ale identyfikatory sekwencji są polskie. `sudokuShapeInk` nie przyjmuje `strzalka` i nie jest mapą tej karty (`src/lib/sequence/shapes.ts:64:69`).
- Przełącznik sudoku nie woła generatora (`SudokuGenerator.tsx:164:170`). To jest wzorzec, który chroni ciągi i przydział.
- Tasowanie kredek musi użyć tego samego `random`, który dostał `generateSequenceCard`, i dopiero po przyjęciu karty. Wcześniejsze zużycie liczb losowych zmienia ciągi dla tego samego ziarna.
- Nowy plik testu jest niewidoczny dla `npm test`, dopóki nie ma go na liście w `package.json`.

## What We're NOT Doing

- Stała mapa sudoku (serce zawsze czerwone, koło zawsze niebieskie) na sekwencjach.
- Osobna kredka w każdym wierszu albo w każdym polu.
- Wybór kolorów przez rodzica, legenda, litery na polach.
- Nowe tokeny kolorów i przemianowanie `--symmetry-*`.
- Kolor dla liczb, znaku „?”, ramek pól, zdania polecenia i postaci.
- Ukrywanie przełącznika na Poziomie 4.
- Zapis przydziału kredek w profilu, w ostatnich ustawieniach albo w `SequenceCard.key`.
- Zmiana reguł, luk, geometrii kształtów, grubości konturu, układu A4 i generatora poza dopisaniem przydziału do przyjętej karty.
- Nowa miniatura katalogu i zmiana plakietki katalogu.
- Poprawka starszego zdania w PRD, że sekwencje mają cztery kształty.
- Dowód w teście przeglądarkowym, że dwa kolejne Generuj dadzą inną kredkę. To pokrywa test jednostkowy na dwóch ziarnach.

## Implementation Approach

Logika przydziału żyje obok generatora sekwencji i jest sprawdzona ziaren, zanim pasek zacznie ją pokazywać. Karta dostaje pole `shapeColors`. Boolean `colors` idzie tą samą drogą co w sudoku: domyślne ustawienia, parser, `remember`, przełącznik w istniejących opakowaniach `print:hidden`. Arkusz czyta boolean i `shapeColors` tylko przy rysowaniu trzech prymitywów kształtu. Faza przeglądarkowa utrwala „ta sama karta po przełączeniu” i dopisuje „kolory” do zdania o karcie sekwencji oraz do wiersza tabeli zapamiętanych ustawień.

## Critical Implementation Details

- **Kolejność losowania:** `assignSequenceColors` dostaje `random` dopiero wtedy, gdy karta jest już przyjęta i ma swój `key`. Zużycie `random` w trakcie `drawRow` zmienia ciągi dla `mulberry32` i psuje istniejące porównania kluczy w `src/lib/sequence/generate.test.ts`.
- **Dwie różne rzeczy nazywają się kolorem:** boolean paska zostaje `colors`. Przydział na karcie nazywa się `shapeColors`, żeby ustawienia i treść karty nie wpadły w jedno pole.

## Faza 1: Przydział kredek

### Overview

Czysta funkcja przydziału i jej zapis na przyjętej karcie. Po tej fazie da się z ziarna dostać kartę, której każdy kształt ma jedną kredkę, a klucz opisuje tylko ciągi.

### Changes Required:

#### 1. Moduł kredek

**File**: `src/lib/sequence/colors.ts`

**Intent**: Trzymać dziewięć nazw kredek i przydzielać je kształtom tej karty, bez sięgania do mapy sudoku.

**Contract**: `SEQUENCE_CRAYONS` to `red`, `blue`, `green`, `orange`, `purple`, `yellow`, `brown`, `gray`, `black`. `assignSequenceColors(random, shapes)` bierze identyfikatory obecne na karcie, zostawia je w kolejności `SEQUENCE_SHAPES`, tasuje kopię puli istniejącym `shuffle` i daje kształtowi `i` kredkę `i`. Wynik ma po jednym wpisie na identyfikator, bez powtórzonej kredki. Liczba nie wchodzi do wyniku, bo funkcja przyjmuje tylko `SequenceShape`. `sequenceShapeInk(shape, colors, shapeColors)` zwraca `var(--foreground)` przy `colors === false` i `var(--symmetry-<kredka>)` przy `true` dla kształtu, który ma wpis.

#### 2. Karta

**File**: `src/lib/sequence/generate.ts`

**Intent**: Zapisać przydział na przyjętej karcie tym samym źródłem losowym, które ułożyło ciągi, bez zmiany klucza.

**Contract**: `SequenceCard` dostaje `shapeColors`. Po zbudowaniu ważnej karty, przed `return`, pole powstaje z identyfikatorów występujących w `rows[].values`. `key` zostaje `${level.id}:${rows…}` i nie zawiera nazw kredek. `null` z generatora nie niesie przydziału. Istniejące porównania kluczy dla tego samego ziarna zostają prawdziwe bez zmiany wyroczni ciągów.

#### 3. Testy

**File**: `src/lib/sequence/colors.test.ts`, `src/lib/sequence/generate.test.ts`, `package.json`

**Intent**: Utrwalić jedną kredkę na kształt, brak powtórzeń, determinizm ziarna i to, że klucz nie opisuje kolorów.

**Contract**: Nowy plik jest dopisany do skryptu `test`. Wyrocznia: dla kształtów koło i kwadrat wynik ma dokładnie te dwa klucze i dwie różne kredki; dwa wywołania z tym samym `random` dają ten sam wynik; dwa różne ziarna mogą dać kołu różne kredki; każda nazwa istnieje w `global.css` jako `--symmetry-<nazwa>:`. Generator: każdy identyfikator z `values` jest kluczem `shapeColors`, a `key` dwóch kart z tego samego ziarna jest równy i nie zawiera nazwy kredki.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, a `src/lib/sequence/colors.test.ts` jest w skrypcie `test`
- `npm run lint` przechodzi

**Implementation Note**: Po zielonych testach tej fazy zatrzymaj się na potwierdzenie, zanim powstanie przełącznik.

---

## Faza 2: Pasek i rysowanie

### Overview

Rodzic widzi „Kolory” na pasku sekwencji. Włączenie maluje kształty już wylosowanej karty. Wyłączenie wraca do czarnych konturów. Ustawienie zostaje w profilu albo w ostatnich parametrach.

### Changes Required:

#### 1. Ustawienia karty

**File**: `src/lib/card-settings.ts`, `src/lib/card-settings.test.ts`

**Intent**: Pamiętać boolean kolorów sekwencji tak jak boolean sudoku, z domyślnym wyłączeniem dla starych zapisów.

**Contract**: `SequenceSettings` to `{ level, colors: boolean }`. `DEFAULTS.sekwencje` ma `colors: false`. Odczyt `{ sekwencje: { level: "lat7" } }` daje `colors: false`. Nieprawdziwa wartość `colors` wraca do `false`. Wyrocznia w teście, która dziś oczekuje samego `{ level: "lat7" }`, dostaje `colors: false`.

#### 2. Pasek i arkusz

**File**: `src/components/SequenceGenerator.tsx`

**Intent**: Pokazać przełącznik i malować tylko kształty, bez nowego Generuj.

**Contract**: Etykieta „Kolory” i `Switch` jak `colorsControl` w `src/components/SymmetryGenerator.tsx:136:146`, w obu paskach, wewnątrz istniejących opakowań `print:hidden`, za wyborem poziomu. `onCheckedChange` woła tylko `memory.remember({ colors: next })`. `handleProfileSwitch` nadal układa kartę wyłącznie przy zmianie poziomu. `SequenceSheet` dostaje `colors`. Przy `false` trzy prymitywy zostają `fill="none"` i `stroke="var(--foreground)"`. Przy `true` `fill` i `stroke` są wynikiem `sequenceShapeInk`. Ramka pola, „?”, liczba i polecenie zostają `var(--foreground)`. Klasy SVG i dwa napisy `print:hidden` zostają.

#### 3. Podsumowanie profilu

**File**: `src/lib/card-summary.ts`, `src/lib/card-summary.test.ts`

**Intent**: Pokazać w oknie profilu, że sekwencje mają włączone kolory, tak jak symetria.

**Contract**: Dla `sekwencje` `extras` zawiera `"kolory"` tylko gdy `settings.colors` jest prawdziwe. Plakietka zostaje przy poziomie. Test na wzór „the symmetry colors appear only when they are on” pokrywa włączone i wyłączone sekwencje.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi
- `npm run lint` przechodzi

#### Manual Verification:

- Na `/sequences` przełącznik „Kolory” jest wyłączony; po Generuj włączenie wypełnia kształty i zostawia te same ciągi, a wyłączenie wraca do czarnych konturów; liczby i „?” zostają czarne

**Implementation Note**: Po zielonych testach zatrzymaj się na ręczne potwierdzenie paska, zanim powstaną testy przeglądarkowe.

---

## Faza 3: Przeglądarka i PRD

### Overview

Test przeglądarkowy pilnuje, że przełącznik nie układa nowej karty i że kontrolki mieszczą się na telefonie. PRD zapisuje nowe zapamiętane ustawienie sekwencji.

### Changes Required:

#### 1. Test kolorów

**File**: `tests/e2e/sequence-colors.spec.ts`

**Intent**: Utrwalić domyślnie wyłączone kolory i tę samą kartę po przełączeniu.

**Contract**: Na `/sequences` przełącznik jest widoczny i wyłączony przed Generuj i po nim. Po Generuj geometria kół (`cx`, `cy`, `r`), wielokątów (`points`) i ścieżek (`d`) jest taka sama po włączeniu i po wyłączeniu. Przy wyłączeniu kontur kształtu to `var(--foreground)`, a `fill` to `none`. Przy włączeniu `fill` równa się `stroke` i zaczyna się od `var(--symmetry-`. Wszystkie koła mają jeden wspólny `stroke`. Tekst cyfr i „?” oraz `stroke` ramek zostają `var(--foreground)`. Drugie kliknięcie wraca do czarnych konturów. Test nie wymaga, żeby kolejne Generuj zmieniło kredkę.

#### 2. Pamięć i telefon

**File**: `tests/e2e/card-settings.spec.ts`, `tests/e2e/phone-layout.spec.ts`

**Intent**: Objąć sekwencje istniejącym sprawdzeniem pamięci paska i sprawdzić, że „Kolory” nie nachodzi na sąsiednie kontrolki.

**Contract**: Wpis `sekwencje` w `CARDS` dostaje `colors: true`, więc trzy testy pamięci klikają przełącznik i po przeładowaniu oczekują zaznaczenia, a profil, który karty nie używał, startuje z wyłączonym przełącznikiem. Dwa testy telefonu sekwencji („the sequence page fits…” i „every sequence level fits…”) dokładają `Kolory` do pól, które nie mogą na siebie nachodzić i muszą mieścić się w szerokości viewportu, na wzór testów sudoku i symetrii w tym pliku.

#### 3. PRD

**File**: `context/foundation/prd.md`

**Intent**: Zostawić po tej zmianie zdanie, które zgadza się z paskiem.

**Contract**: W „Karta sekwencji” dopisać, że rodzic włącza kolory niezależnie od poziomu; domyślnie kształty są czarnymi konturami; po włączeniu każdy kształt tej karty ma jedną kredkę, tę samą w każdym wierszu, wylosowaną przy Generuj z dziewięciu kredek; liczby, „?” i puste pola zostają jak dziś; przełącznik nie układa nowej karty. W tabeli „Profil i zapamiętane ustawienia” wiersz Sekwencje to `poziom, kolory`. Zdanie o czterech kształtach zostaje nietknięte.

### Success Criteria:

#### Automated Verification:

- `npx playwright test tests/e2e/sequence-colors.spec.ts tests/e2e/card-settings.spec.ts tests/e2e/phone-layout.spec.ts` przechodzi
- `npm test` przechodzi
- `npm run lint` przechodzi

#### Manual Verification:

- Wydruk z włączonymi kolorami mieści się na jednej stronie A4, liczby są czarne, a puste pola nie pokazują odpowiedzi
- W `context/foundation/prd.md` wiersz Sekwencje zawiera „kolory”, a „Karta sekwencji” opisuje przełącznik

**Implementation Note**: Po zielonych testach przeglądarkowych zatrzymaj się na wydruk i na przeczytanie zdań w PRD.

---

## Testing Strategy

### Unit Tests:

- Przydział: jeden wpis na identyfikator, brak wspólnej kredki, kolejność `SEQUENCE_SHAPES`, determinizm ziarna, dwa ziarna mogą rozróżnić koło, nazwy tokenów istnieją w `global.css`.
- Generator: `shapeColors` pokrywa `values`, `key` nie zawiera kredki, to samo ziarno daje ten sam klucz co przed dopisaniem losowania po przyjęciu karty.
- Ustawienia: domyślne `colors: false`, stary zapis samego poziomu czyta się jako wyłączone kolory.
- Podsumowanie: „kolory” tylko przy włączonym booleanie.

### Integration Tests:

- Playwright: ta sama geometria po przełączeniu, koła w jednym kolorze, cyfry i „?” czarne, pamięć paska, brak nachodzenia na telefonie.

### Manual Testing Steps:

1. Otwórz `/sequences`, wygeneruj Poziom 1 i włącz kolory. Dwa takie same kształty mają jeden kolor, a puste pole zostaje puste.
2. Wyłącz kolory i sprawdź czarne kontury przy tych samych ciągach.
3. Wejdź na Poziom 4. Cyfry zostają czarne, a przełącznik zostaje.
4. Wydrukuj kartę z kolorami i bez. Obie mieszczą się na jednej stronie A4.

## Performance Considerations

Jedno tasowanie dziewięciu nazw przy przyjętej karcie. Limity prób generatora zostają. Układ A4 się nie zmienia, więc margines 10 mm zostaje przy obecnych testach `layout.test.ts`.

## Migration Notes

Zapis profilu i ostatnich ustawień bez pola `colors` czyta się jako wyłączone kolory. Osobnej migracji nie ma. Przydział kredek żyje tylko na karcie w pamięci strony i znika razem z nią przy następnym udanym Generuj.

## References

- Issue: GitHub #116
- Podobny przełącznik: `src/components/SudokuGenerator.tsx:164:170`, `src/lib/sudoku/colors.ts:7:21`
- Pasek sekwencji: `src/components/SequenceGenerator.tsx:54:81`, `137:166`, `282:308`
- Generator: `src/lib/sequence/generate.ts:49:88`
- Ustawienia: `src/lib/card-settings.ts:28:30`, `120:122`
- PRD: `context/foundation/prd.md` „Karta sekwencji”, tabela „Profil i zapamiętane ustawienia”
- Wcześniejszy wydruk wypełnienia: `context/archive/2026-10-25-picture-sudoku-colors/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Przydział kredek

#### Automated

- [x] 1.1 `npm test` przechodzi, a `src/lib/sequence/colors.test.ts` jest w skrypcie `test` — a57a3c0
- [x] 1.2 `npm run lint` przechodzi — a57a3c0

### Phase 2: Pasek i rysowanie

#### Automated

- [x] 2.1 `npm test` przechodzi — 6a0dea0
- [x] 2.2 `npm run lint` przechodzi — 6a0dea0

#### Manual

- [ ] 2.3 Na `/sequences` przełącznik „Kolory” jest wyłączony; po Generuj włączenie wypełnia kształty i zostawia te same ciągi, a wyłączenie wraca do czarnych konturów; liczby i „?” zostają czarne

### Phase 3: Przeglądarka i PRD

#### Automated

- [x] 3.1 `npx playwright test tests/e2e/sequence-colors.spec.ts tests/e2e/card-settings.spec.ts tests/e2e/phone-layout.spec.ts` przechodzi
- [x] 3.2 `npm test` przechodzi
- [x] 3.3 `npm run lint` przechodzi

#### Manual

- [ ] 3.4 Wydruk z włączonymi kolorami mieści się na jednej stronie A4, liczby są czarne, a puste pola nie pokazują odpowiedzi
- [ ] 3.5 W `context/foundation/prd.md` wiersz Sekwencje zawiera „kolory”, a „Karta sekwencji” opisuje przełącznik
