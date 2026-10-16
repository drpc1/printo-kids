# Zawijana droga labiryntu — plan implementacji

## Overview

Generator kładzie drogę, która skręca w górę, w dół i w boki, wchodzi w lewą i prawą tercję kartki i nie dobija do sufitu jednokomórkowymi uskokami wokół środka. Odnogi skręcają tak samo. Szerokość alejki zostaje. Długość jest luźną kolejnością wieku.

## Current State Analysis

`layPath` dla `lat3` i `lat5` stawia prostą w kolumnie wejścia i dokłada uskoki, aż długość dojdzie do `pathMax` (`src/lib/maze/generate.ts:217-219`, `222-227`, `277-285`). Na 20 ziarnach `lat5` długość jest zawsze 40. Kroki w górę są rzadkie albo ich nie ma, a droga mieści się w kilku kolumnach przy środku. `attachRemainder` dokleja resztę do rodzica o głębokości +1 (`generate.ts:385-387`). `spurMax` dla `lat5` to 6, czyli odległość od kolumny 6 do krawędzi, więc prosty korytarz dochodzi do brzegu.

`lat4`, `lat6` i `lat7` idą `pairedSweep`, a `nastolatek` serpentyną przy prawej krawędzi (`generate.ts:205-216`). Żaden z tych rzutów nie skręca w górę. Test w `generate.test.ts` wymaga siatki, jednej drogi, pasma i limitu odnogi z `LEVELS`.

Siatki, wejścia i wyjścia są w `src/lib/maze/levels.ts`. Generuj woła `DEFAULT_LEVEL_ID`, czyli `lat5`. Starszy Kruskal (`19cc6ca`) robił drzewo, które mogło skręcać, i nie wybierał długości.

## Desired End State

Sześć siatek zostaje. Wejście i wyjście zostają. Jedna droga. Jedno ułożenie mieści się w 5 sekundach i nie jest pętlą losowań przez 5 sekund.

| Id | Siatka | Droga (komórki) | Odnoga |
| --- | --- | --- | --- |
| `lat3` | 9×11 | 24–44 | ≤ 4 |
| `lat4` | 9×11 | 50–80 | bez progu głębokości |
| `lat5` | 13×16 | 56–96 | ≤ 4 |
| `lat6` | 13×16 | 56–96 | ≤ 4 |
| `lat7` | 17×21 | 150–240 | bez progu głębokości |
| `nastolatek` | 27×33 | 280–500 | ≥ 25 |

Przedziały są domknięte. 3 lata kończą się na 44, nastolatek zaczyna od 280.

Bieg to najdłuższy ciąg komórek w jednym kierunku, liczony komórkami, nie krokami. Bieg o 5 lub więcej komórkach nie występuje ani na drodze, ani w uliczce. Bieg o 4 komórkach jest wyjątkiem: takich biegów jest mniej niż biegów o 1–3 komórkach.

Lewa tercja to kolumny `[0, floor(columns / 3))`. Prawa to ostatnie `floor(columns / 3)` kolumn. Droga ma co najmniej jedną komórkę w lewej i jedną w prawej. Dla nastolatka start jest w lewej, a meta w prawej.

Głębokość odnogi liczy się jak dziś: pierwsza komórka poza drogą ma głębokość 1. Limit głębokości nie zastępuje reguły biegu.

### Key Discoveries:

- Podniesienie `pathMax` przy `spine` i `applyJog` dokłada uskoki wokół środka. Nie wyprowadza drogi w obie tercje i nie skręca jej w górę (`generate.ts:318-321`).
- `floor(13 / 3)` to 4, więc na 5 latach lewa tercja to kolumny 0–3, a prawa 9–12. Wejście w kolumnie 6 jest środkiem.
- Odnoga o głębokości 4 może być jednym biegiem o 4 komórkach. Reguła wyjątku na to pozwala, o ile takich biegów jest mniej niż krótkich. Nie pozwala dojść prosto do krawędzi, bo od środka 5 lat jest 6 komórek.
- Testy czytają pasmo z `LEVELS`. Nowe liczby wchodzą w tabelę, nie w osobne stałe obok.

## What We're NOT Doing

- Zmiana siatek, insetu, wzoru alejki ani pozycji wejścia i wyjścia.
- Pasek poziomu, zapis ostatniego użycia i profil. To zostaje w `maze-difficulty-levels`.
- Pętla losowań przez 5 sekund jako sposób na pasmo, tercje albo skręt.
- Słownik łatwy/średni/trudny i edycja `context/foundation/test-plan.md`.
- Ruszanie sekcji `## Progress` w planie `maze-difficulty-levels`.
- Kółko na nastolatku i postać na tym poziomie.

## Implementation Approach

Najpierw powstaje droga od wejścia do wyjścia, która sama mieści się w paśmie, wchodzi w obie tercje i trzyma regułę biegu. Potem doklejane są pozostałe komórki tak, żeby labirynt został drzewem z jedną drogą start–meta, odnogi trzymały tę samą regułę biegu, a progi głębokości z tabeli były spełnione. Konstrukcja trafia w regułę w jednym ułożeniu. Nie szuka jej powtórką do 5 sekund.

## Critical Implementation Details

Bieg liczy komórki w nieprzerwanym kierunku. Trzy komórki w linii to jeszcze zwykły bieg. Pięć komórek w linii jest błędem. Cztery są dozwolone tylko wtedy, gdy jest ich mniej niż biegów krótszych.

Głębokość odnogi i długość biegu to dwie osie. Odnoga nastolatka ma mieć co najmniej 25 komórek poza drogą i przy tym skręcać, zanim dojdzie do pięciu komórek w linii.

Faza dokumentów edytuje tabelę Desired End State oraz sekcje Key Discoveries i Critical Implementation Details w planie `maze-difficulty-levels`. Nie edytuje bloków Phase 1–3, sekcji `## Progress` ani pól statusu w `change.md` tamtej zmiany.

## Phase 1: Zawijana droga

### Overview

Tabela poziomów dostaje nowe pasma. Droga sześciu poziomów skręca, wchodzi w obie tercje i mieści się w paśmie. Odnogi dochodzą w fazie 2.

### Changes Required:

#### 1. Pasma

**File**: `src/lib/maze/levels.ts`

**Intent**: Długość przestaje być dawnym sufitem dobijanym uskokiem. Siatka, wejście, wyjście i `showCharacter` zostają.

**Contract**: `pathMin` i `pathMax` są domkniętymi końcami tabeli z Desired End State. `spurMax` jest `4` dla `lat3` i `lat5`. `spurMin` jest `25` dla `nastolatek`. Pozostałe progi głębokości są `null`. `DEFAULT_LEVEL_ID` zostaje `lat5`.

#### 2. Droga

**File**: `src/lib/maze/generate.ts`

**Intent**: Zastąpić prostą, wężyk i serpentynę drogą, która skręca w cztery strony i nie trzyma się kolumny wejścia.

**Contract**: `generateMaze(levelId, random)` dalej zwraca labirynt tego poziomu. Droga między wejściem a wyjściem jest jedna, jej długość jest w paśmie, ma komórkę w lewej i w prawej tercji oraz co najmniej jeden krok w górę. Nie ma biegu o 5 lub więcej komórkach, a biegów o 4 komórkach jest mniej niż biegów o 1–3. Wejście otwiera ścianę północną, meta południową. Jedno wywołanie kończy się w 5 sekundach. Pętla losowań przez 5 sekund nie jest sposobem na pasmo, tercje ani krok w górę.

#### 3. Test drogi

**File**: `src/lib/maze/generate.test.ts`

**Intent**: Zastąpić wyrocznię dawnego pasma sprawdzeniem skrętu, tercji i nowego pasma.

**Contract**: Dla każdego id jedno ustalone ziarno daje dotychczasowe `columns` i `rows`, otwarte ściany wejścia i wyjścia, `countPaths === 1`, długość w nowym paśmie, komórkę drogi w lewej i w prawej tercji, co najmniej jeden krok w górę, brak biegu o 5 lub więcej komórkach na drodze i mniej biegów o 4 komórkach niż biegów o 1–3. To samo ziarno daje te same ściany. Generator nie woła `Math.random`.

### Success Criteria:

#### Automated Verification:

- `npm test` sprawdza sześć poziomów: siatkę bez zmian, jedną drogę, długość w nowym paśmie, komórkę w lewej i w prawej tercji, co najmniej jeden krok w górę, brak biegu o 5 lub więcej komórkach na drodze oraz mniej biegów o 4 komórkach niż biegów o 1–3
- `npm run lint` i `npx astro check` przechodzą

**Implementation Note**: Po zielonym `npm test`, `npm run lint` i `npx astro check` można przejść do fazy 2. Kartka nadal może mieć proste odnogi, dopóki faza 2 ich nie wymieni.

---

## Phase 2: Odnogi ze skrętem

### Overview

Reszta siatki dokleja się ze skrętem. 3 lata i 5 lat mają płytką odnogę. Nastolatek ma głęboką. Żadna nie jest prostym ramieniem do krawędzi.

### Changes Required:

#### 1. Doklejenie reszty

**File**: `src/lib/maze/generate.ts`

**Intent**: Odnoga ma skręcać tą samą regułą biegu co droga i trzymać próg głębokości poziomu.

**Contract**: Każda komórka siatki należy do drogi albo do odnogi. Zostaje jedna droga start–meta. Najdłuższa odnoga `lat3` i `lat5` ma co najwyżej 4 komórki. Najdłuższa odnoga `nastolatek` ma co najmniej 25. W całym labiryncie, na drodze i poza nią, nie ma biegu o 5 lub więcej komórkach, a biegów o 4 komórkach jest mniej niż biegów o 1–3. Jedno wywołanie kończy się w 5 sekundach.

#### 2. Test odnogi

**File**: `src/lib/maze/generate.test.ts`

**Intent**: Złapać prosty korytarz do krawędzi i odnogę 3 lat albo 5 lat głębszą niż 4.

**Contract**: Dla każdego id jedno ustalone ziarno daje odnogę w progu z tabeli, brak biegu o 5 lub więcej komórkach w całym labiryncie i mniej biegów o 4 komórkach niż biegów o 1–3. Kandydat z odnogą poza progiem albo z biegiem o 5 komórkach dostaje z `mazeForSheet` wartość `null`.

### Success Criteria:

#### Automated Verification:

- `npm test` sprawdza odnogę: 3 lata i 5 lat co najwyżej 4, nastolatek co najmniej 25, a na każdym poziomie brak biegu o 5 lub więcej komórkach w całym labiryncie i mniej biegów o 4 komórkach niż biegów o 1–3
- `npm test` i `npm run lint` przechodzą

#### Manual Verification:

- Po Generuj na 5 latach droga skręca w górę i w boki, wchodzi w lewą i prawą stronę kartki, a żaden korytarz nie idzie prosto przez całą szerokość

**Implementation Note**: Po zielonych testach odnogi i po tym rzucie oka na kartkę można przejść do fazy 3.

---

## Phase 3: Dokumenty

### Overview

PRD i plan poziomów mówią tymi samymi pasmami i progami odnogi co generator. Sekcja postępu planu poziomów zostaje.

### Changes Required:

#### 1. Tabela produktu

**File**: `context/foundation/prd.md`

**Intent**: Zdania „do około 40 komórek” i podobne przestają opisywać kartkę, której generator już nie robi.

**Contract**: Tabela w Business Logic ma pasma 24–44, 50–80, 56–96, 56–96, 150–240 i 280–500. Płytka odnoga 3 lat, 5 lat i 6 lat to najwyżej 4 komórki. Głęboka odnoga nastolatka to co najmniej 25. Zdanie, że krótki poziom nie jest zagadką wśród pułapek, zostaje. Siatki i alejki zostają.

#### 2. Plan poziomów

**File**: `context/changes/maze-difficulty-levels/plan.md`

**Intent**: Plan w trakcie wdrożenia nie każe już kłaść prostej w kolumnie wejścia ani dobijać do dawnego sufitu.

**Contract**: Tabela Desired End State oraz sekcje Key Discoveries i Critical Implementation Details opisują zawijaną drogę z tego planu i te same pasma oraz progi odnogi. Bloki Phase 1–3 oraz sekcja `## Progress` tamtego pliku zostają bez zmian checkboxów, indeksów, tytułów i dopisków SHA.

### Success Criteria:

#### Manual Verification:

- W `context/foundation/prd.md` tabela drogi ma pasma 24–44, 50–80, 56–96, 56–96, 150–240 i 280–500, płytka odnoga 3 lat, 5 lat i 6 lat to najwyżej 4 komórki, a głęboka odnoga nastolatka co najmniej 25
- W `context/changes/maze-difficulty-levels/plan.md` tabela Desired End State oraz sekcje Key Discoveries i Critical Implementation Details opisują zawijaną drogę i te same pasma, a bloki Phase 1–3 oraz sekcja Progress zostają bez zmian

**Implementation Note**: Po przeczytaniu obu tabel plasterek jest gotowy do przeglądu implementacji.

---

## Testing Strategy

### Unit Tests:

- Sześć id: siatka, jedna droga, nowe pasmo, obie tercje, co najmniej jeden krok w górę, otwarte ściany wejścia i wyjścia.
- Brak biegu o 5 lub więcej komórkach na drodze, a potem w całym labiryncie. Biegów o 4 komórkach jest mniej niż biegów o 1–3.
- `lat3` i `lat5`: odnoga ≤ 4. `nastolatek`: odnoga ≥ 25.
- `mazeForSheet` zwraca `null` dla odnogi poza progiem i dla biegu o 5 komórkach.

### Integration Tests:

- Brak nowego testu Playwright. Sześć poziomów pilnują testy Node. `tests/e2e/seed.spec.ts` zostaje przy Generuj i napisach Start oraz Meta.

### Manual Testing Steps:

1. Ustawić widok na Generuj, który składa 5 lat. Po Generuj sprawdzić, że droga idzie w górę i w boki, jest i po lewej, i po prawej stronie kartki, i że żaden korytarz nie przecina prostą całą szerokość.

## Performance Considerations

Jedno ułożenie, także 27×33, kończy się wyraźnie przed 5 sekundami. Limit 5 sekund jest odcięciem, nie budżetem na powtarzanie losowania, aż trafi się pasmo, tercja albo skręt.

## Migration Notes

Zapis ostatniego użycia i profili ta zmiana nie rusza. Pasma żyją w `LEVELS` i w dwóch dokumentach. Stary labirynt na ekranie znika przy następnym Generuj.

## References

- Frame: `context/changes/maze-difficulty-levels/frame.md`
- Related research: `context/changes/maze-difficulty-levels/research.md`
- Similar implementation: `src/lib/maze/generate.ts:204-387`
- Level table: `src/lib/maze/levels.ts:24-103`
- Product table: `context/foundation/prd.md:166-177`
- In-progress plan to update in phase 3: `context/changes/maze-difficulty-levels/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Zawijana droga

#### Automated

- [x] 1.1 `npm test` sprawdza sześć poziomów: siatkę bez zmian, jedną drogę, długość w nowym paśmie, komórkę w lewej i w prawej tercji, co najmniej jeden krok w górę, brak biegu o 5 lub więcej komórkach na drodze oraz mniej biegów o 4 komórkach niż biegów o 1–3 — b1547c0
- [x] 1.2 `npm run lint` i `npx astro check` przechodzą — b1547c0

### Phase 2: Odnogi ze skrętem

#### Automated

- [x] 2.1 `npm test` sprawdza odnogę: 3 lata i 5 lat co najwyżej 4, nastolatek co najmniej 25, a na każdym poziomie brak biegu o 5 lub więcej komórkach w całym labiryncie i mniej biegów o 4 komórkach niż biegów o 1–3 — 3ee7320
- [x] 2.2 `npm test` i `npm run lint` przechodzą — 3ee7320

#### Manual

- [ ] 2.3 Po Generuj na 5 latach droga skręca w górę i w boki, wchodzi w lewą i prawą stronę kartki, a żaden korytarz nie idzie prosto przez całą szerokość

### Phase 3: Dokumenty

#### Manual

- [ ] 3.1 W `context/foundation/prd.md` tabela drogi ma pasma 24–44, 50–80, 56–96, 56–96, 150–240 i 280–500, płytka odnoga 3 lat, 5 lat i 6 lat to najwyżej 4 komórki, a głęboka odnoga nastolatka co najmniej 25
- [ ] 3.2 W `context/changes/maze-difficulty-levels/plan.md` tabela Desired End State oraz sekcje Key Discoveries i Critical Implementation Details opisują zawijaną drogę i te same pasma, a bloki Phase 1–3 oraz sekcja Progress zostają bez zmian
