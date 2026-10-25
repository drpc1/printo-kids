# Katalog obiektów z kategoriami (S-21) Implementation Plan

## Overview

Katalog szablonów karty symetrii rośnie z trzech obiektów (rakieta, robot, truskawka) do 22 w pięciu kategoriach: Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle. Każdy obiekt ma trzy rozmiary połowy (4×12, 6×15, 9×24), części losowane przez generator, kolor kredki każdej kratki i etykietę co najmniej jednej kategorii. Paleta dostaje brązowy, a szablon może zostawić dziury białe przy włączonych kolorach. Nonogram (S-22) i dyktando (S-23) czytają ten sam katalog przez niezmienione `symmetryTemplatesFor`. PRD: US-19, FR-028. Wybór kategorii na pasku to S-26.

## Current State Analysis

- Wszystkie szablony, typy, paleta i parser rysunku żyją w jednym pliku `src/lib/symmetry/templates.ts` (504 wiersze): `SYMMETRY_COLORS` (`:3`), `SymmetryTemplate` z `holeColor: SymmetryColor` (`:19-29`), `drawing()` z literami kolorów (`:31-61`), po trzy szablony na rozmiar (`:66-490`) i `symmetryTemplatesFor` (`:495-504`). lat5 i lat6 dzielą listę 6×15 (`:493`).
- Generator losuje szablon równomiernie z listy poziomu i maluje każdą dziurę kolorem `template.holeColor` (`src/lib/symmetry/generate.ts:47-52`, `:102`). `symmetryCardProblems` odrzuca kolor spoza `SYMMETRY_COLORS` (`:179`, `:218`).
- Kolor kratki na ekranie to `var(--symmetry-<kolor>)` (`src/lib/symmetry/colors.ts:14-16`); tokeny są tylko w `:root` (`src/styles/global.css:59-66`).
- Testy przypinają listę do `["rakieta","robot","truskawka"]` i liczbę 3 (`src/lib/symmetry/generate.test.ts:227-282`), sprawdzają każdy wariant i każde przesunięcie wszystkich szablonów regułami karty (`:284-299`), 3 podpowiedzi na lat4 dla każdego zestawu wariantów (`:260-269`), 2–3 części z co najmniej 2 wariantami na lat5 (`:236-244`), co najmniej 3 części na lat7 (`:271-282`), różne obrazki dla różnych wariantów lat5 (`:301-309`) oraz że każda dziura ma kolor szablonu i że tylko rakieta może nie mieć dziur (`:84-99`). Testy indeksują `symmetryTemplatesFor(...)[0]` jako rakietę i `[1]` jako robota (`:50`, `:68`, `:75`, `colors.test.ts:14-53`).
- Gałęzie S-22 i S-23 importują `symmetryTemplatesFor`, `SymmetryTemplate` i `SymmetryCell` z `src/lib/symmetry/templates.ts` i w swoich planach zakładają, że S-21 nie zmienia formatu ani eksportów (`nonogram-first-printable/plan.md:36`, `graphic-dictation-first-printable/plan.md:41`). Nonogram ma test: każdy szablon rozmiaru średniego (lat5) ma co najmniej jeden wariant z jednym rozwiązaniem. Dyktando odrzuca warianty stykające się rogiem i wieloczęściowe.
- Miniatura katalogu jest budowana z ziarnem przez `scripts/build-thumbnails.mjs:113` i nie ma testu porównującego; zapisana miniatura zostaje.
- Makieta z użytkowniczką (2026-10-25) jest w `context/changes/template-object-catalog/`: rysunki `mockup-drawings.json` i podglądy `mockup-*.svg`. Każdy rysunek ma co najmniej 3 kratki przy osi, nie ma styku samym rogiem i jest jedną częścią.

## Desired End State

Rodzic klikający Generuj na `/symetria` na każdym poziomie widzi obiekty z 22-elementowego katalogu: sowa, biedronka, pingwin, kot, królik; truskawka, babeczka, gruszka, marchewka, ananas; choinka, tulipan, muchomor, kaktus; rakieta, robot, balon, UFO; domek, wieża zamku, latarnia morska, wieżowiec. Każdy obiekt ma szablon w każdym rozmiarze, części z wariantami i etykietę kategorii. Przy kolorach kosz balonu, pień choinki i sowa są brązowe, a brzuch pingwina, kropki muchomora i paski babeczki zostają białe. Nonogram i dyktando dostają nowe obiekty bez zmian w swoim kodzie. PRD opisuje katalog zgodny z kodem. `npm run lint`, `npm test`, `npx astro check` i `npm run build` są zielone.

### Key Discoveries:

- `templates.ts` musi zostać punktem wejścia z tymi samymi eksportami, bo S-22 i S-23 importują z niego równolegle (`nonogram/generate.ts:1`, `dictation/outline.ts:1` w ich worktree).
- Rysunek z makiety to obraz przy wariancie 0 każdej części: `base` plus warianty 0 dają dokładnie rysunek z `mockup-drawings.json`.
- Biała dziura nie potrzebuje nowego koloru: `holeColor: null` daje pustą listę `details`, więc `symmetryDrawnCells` (`colors.ts:22-31`) i `mirrorAnswerWithDetails` (`generate.ts:264-270`) same zostawiają te kratki puste.
- Kolejność listy ma znaczenie dla testów: rakieta, robot i truskawka zostają na pozycjach 0–2.

## What We're NOT Doing

- Wybór kategorii na pasku symetrii, nonogramu i dyktanda (S-26). Generator nadal losuje ze wszystkich obiektów.
- Zmiany w kodzie nonogramu i dyktanda ani kopiowanie ich solverów do repo. Zgodność z nonogramem sprawdzi S-22 po scaleniu (notatka we wspólnym folderze).
- Odbudowa miniatury katalogu (`npm run thumbnails`); zapisany obrazek zostaje.
- Lody w rożku i namiot (nieczytelne w 4×12 na makiecie), motyl i korona (za szerokie), kategorie sezonowe i „Morze”.
- Fioletowy i inne kolory dla sudoku (S-20).
- Zmiana reguł karty symetrii w `symmetryCardProblems` poza akceptacją brązowego.

## Implementation Approach

Najpierw fundament (faza 1): paleta, białe dziury, kategorie i podział na pliki kategorii, z istniejącymi trzema obiektami przeniesionymi bez zmiany rysunków i ogólnymi testami katalogu, które potem same obejmą każdy nowy obiekt. Potem po jednej fazie na kategorię: rysunki z makiety jako wariant 0 plus drugie warianty części w trzech rozmiarach. Ostatnia faza dokłada dwie ostatnie kategorie, test „co najmniej cztery obiekty w każdej kategorii”, poprawki PRD i notatkę dla S-22.

Warianty części: na 4×12 i 6×15 dwie albo trzy części po dwa warianty, na 9×24 co najmniej trzy części po dwa warianty (tak jak dziś). Drugi wariant zmienia jedną rozpoznawalną część (np. uszy sowy, liczba kropek biedronki, kształt korony ananasa, okna wieżowca) i nie może łamać reguł karty na żadnym poziomie.

## Critical Implementation Details

- **Kolejność importów**: pliki kategorii importują typy i `drawing()` z nowego modułu formatu, a `templates.ts` importuje pliki kategorii i re-eksportuje typy. Bez tego powstaje cykl `templates.ts` ↔ pliki kategorii.
- **Poziom 4 lat**: każdy zestaw wariantów każdego szablonu 4×12 musi zostawić co najmniej 3 kratki w kolumnie 3 (podpowiedzi), także po zmianie części przy osi.

## Phase 1: Fundament katalogu

### Overview

Brązowy w palecie, białe dziury, kategorie, podział szablonów na pliki kategorii i ogólne testy katalogu. Rysunki rakiety, robota i truskawki bez zmian.

### Changes Required:

#### 1. Format szablonu

**File**: `src/lib/symmetry/template-format.ts` (nowy)

**Intent**: Wydzielić typy, paletę i parser rysunku, żeby pliki kategorii mogły z nich korzystać bez cyklu importów. Dodać brązowy, białe dziury i kategorie.

**Contract**: Eksportuje `SYMMETRY_COLORS` z dodanym `"brown"` (na końcu listy), `SymmetryColor`, `SymmetryCell`, `SymmetryPart`, `SymmetryTemplate` i `drawing(lines, top?, left?)` z literą `n` dla brązowego. `SymmetryTemplate` dostaje `categories: readonly ObjectCategoryId[]` (niepusta), a `holeColor` staje się `SymmetryColor | null` (null = dziury zostają białe także przy kolorach). `OBJECT_CATEGORIES` to lista `{ id, label }` w kolejności z PRD: `zwierzeta` „Zwierzęta”, `jedzenie` „Jedzenie”, `przyroda` „Przyroda”, `kosmos` „Kosmos i maszyny”, `budowle` „Domy i budowle”; `ObjectCategoryId` to unia tych identyfikatorów.

#### 2. Pliki kategorii i indeks

**File**: `src/lib/symmetry/objects/kosmos.ts`, `src/lib/symmetry/objects/jedzenie.ts` (nowe), `src/lib/symmetry/templates.ts`

**Intent**: Przenieść rakietę i robota do pliku „Kosmos i maszyny”, truskawkę do „Jedzenie”, z etykietami kategorii i bez zmiany komórek. `templates.ts` zostaje indeksem: re-eksportuje format i składa listy rozmiarów z plików kategorii.

**Contract**: Każdy plik kategorii eksportuje obiekt `{ half4: SymmetryTemplate[], half6: SymmetryTemplate[], half9: SymmetryTemplate[] }`. `templates.ts` eksportuje to samo co dziś (`SYMMETRY_COLORS`, typy, `symmetryTemplatesFor`) plus `OBJECT_CATEGORIES`, `ObjectCategoryId`. Kolejność list: rakieta, robot, truskawka, potem nowe obiekty w kolejności kategorii z PRD. lat5 i lat6 dalej dzielą listę 6×15.

#### 3. Białe dziury w generatorze

**File**: `src/lib/symmetry/generate.ts`

**Intent**: Szablon z `holeColor: null` nie zgłasza dziur jako `details`, więc karta z kolorami zostawia je puste, a odpowiedź z detalami ich nie zawiera.

**Contract**: `composeSymmetryCard` zwraca `details: []`, gdy `template.holeColor === null`. Reguły `symmetryCardProblems` bez zmian.

#### 4. Token brązowego

**File**: `src/styles/global.css`

**Intent**: Kolor kredki dla brązowych kratek, obok pozostałych kolorów symetrii.

**Contract**: `--symmetry-brown` w `:root` obok `--symmetry-black`, w formacie oklch jak sąsiednie tokeny (około `oklch(0.5 0.1 55)`), bez wpisu w `.dark`.

#### 5. Testy katalogu

**File**: `src/lib/symmetry/templates.test.ts` (nowy), `src/lib/symmetry/generate.test.ts`, `src/lib/symmetry/colors.test.ts`, `package.json`

**Intent**: Ogólne testy, które obejmują każdy obiekt katalogu, i odpięcie testów generatora od listy trzech obiektów.

**Contract**: `templates.test.ts` (dopisany do skryptu `test` w `package.json`) sprawdza: ten sam zbiór identyfikatorów obiektów na lat4, lat5 i lat7, z tymi samymi kategoriami w każdym rozmiarze; każdy obiekt ma co najmniej jedną kategorię i tylko znane identyfikatory; szerokości 4, 6 i co najwyżej 9; każdy obiekt w każdym rozmiarze ma co najmniej jeden zestaw wariantów, którego cała sylwetka jest jedną częścią bez styku samym rogiem, z jawnym wyjątkiem dla `truskawka` (żaden jej dzisiejszy wariant tego nie spełnia; dyktando S-23 i tak ją pomija; przegląd planu F1); `drawing` czyta `n` jako brązowy. `generate.test.ts`: test kolejności sprawdza, że lista zaczyna się od `rakieta, robot, truskawka` i jest ta sama na lat5 i lat6; test lat4 nie przypina liczby 3; test dziur (`:84-99`) traci wymóg `details.length > 0 || rakieta` (gruszka, kaktus, tulipan i marchewka 4×12 nie mają dziur; przegląd planu F2) i sprawdza tylko, że każda dziura ma kolor `holeColor`, a przy `holeColor: null` lista jest pusta; nowy test: karta z `holeColor: null` ma `details` puste, a `mirrorAnswerWithDetails` równa się `mirrorAnswer`; `brown` jest w palecie. `colors.test.ts`: brązowa kratka rysuje się jako `var(--symmetry-brown)`.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

#### Manual Verification:

- Na `/symetria` (`npm run dev`) rakieta, robot i truskawka wyglądają jak przed zmianą na każdym poziomie, z kolorami i bez

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Zwierzęta

### Overview

Pięć zwierząt w trzech rozmiarach: sowa, biedronka, pingwin, kot, królik.

### Changes Required:

#### 1. Szablony zwierząt

**File**: `src/lib/symmetry/objects/zwierzeta.ts` (nowy), `src/lib/symmetry/templates.ts`

**Intent**: Rysunki z `mockup-drawings.json` jako `base` plus warianty 0 części, i drugie warianty części. Kolor dziur: sowa żółty (oczy), biedronka czarny (kropki), pingwin `null` (biały brzuch i oko), kot zielony (oczy), królik czarny (oko).

**Contract**: Identyfikatory `sowa`, `biedronka`, `pingwin`, `kot`, `krolik`; `categories: ["zwierzeta"]`. Części z wariantami, na przykład: sowa uszy i oczy, biedronka kropki i czułki, pingwin skrzydła i stopy, kot uszy i łapy, królik uszy i łapy; na 9×24 co najmniej trzy części. Wariant 0 każdej części odtwarza rysunek z makiety.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`

#### Manual Verification:

- Na `/symetria` zwierzęta pojawiają się po kilku Generuj na każdym poziomie i są rozpoznawalne jako czarna sylwetka i w kolorach

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Jedzenie

### Overview

Cztery nowe obiekty obok truskawki: babeczka, gruszka, marchewka, ananas.

### Changes Required:

#### 1. Szablony jedzenia

**File**: `src/lib/symmetry/objects/jedzenie.ts`

**Intent**: Rysunki z makiety jako wariant 0 i drugie warianty części. Kolor dziur: babeczka `null` (białe paski), gruszka żółty (bez dziur w makiecie), marchewka żółty (rowki na 9×24), ananas brązowy (pestki).

**Contract**: Identyfikatory `babeczka`, `gruszka`, `marchewka`, `ananas`; `categories: ["jedzenie"]`. Części, na przykład: babeczka wisienka i paski papilotki, gruszka liść i ogonek, marchewka nać i rowki, ananas korona i pestki; na 9×24 co najmniej trzy części.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`

#### Manual Verification:

- Na `/symetria` nowe jedzenie pojawia się po kilku Generuj na każdym poziomie i jest rozpoznawalne jako czarna sylwetka i w kolorach

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Przyroda

### Overview

Cztery obiekty: choinka, tulipan w doniczce, muchomor, kaktus.

### Changes Required:

#### 1. Szablony przyrody

**File**: `src/lib/symmetry/objects/przyroda.ts` (nowy), `src/lib/symmetry/templates.ts`

**Intent**: Rysunki z makiety jako wariant 0 i drugie warianty części. Kolor dziur: choinka czerwony (bombki), tulipan żółty, muchomor `null` (białe kropki), kaktus żółty.

**Contract**: Identyfikatory `choinka`, `tulipan`, `muchomor`, `kaktus`; `categories: ["przyroda"]`. Części, na przykład: choinka gwiazda i bombki, tulipan płatki i liście, muchomor kropki i trawa, kaktus kwiat i ramiona; na 9×24 co najmniej trzy części.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`

#### Manual Verification:

- Na `/symetria` obiekty przyrody pojawiają się po kilku Generuj na każdym poziomie i są rozpoznawalne jako czarna sylwetka i w kolorach

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 5: Kosmos i maszyny, Domy i budowle, domknięcie

### Overview

Balon i UFO obok rakiety i robota; domek, wieża zamku, latarnia morska, wieżowiec. Test liczby obiektów w kategoriach, PRD i notatka dla S-22.

### Changes Required:

#### 1. Szablony kosmosu i budowli

**File**: `src/lib/symmetry/objects/kosmos.ts`, `src/lib/symmetry/objects/budowle.ts` (nowy), `src/lib/symmetry/templates.ts`

**Intent**: Rysunki z makiety jako wariant 0 i drugie warianty części. Kolor dziur: balon niebieski (niebo między linami), UFO żółty (okno), domek żółty (okna), wieża zamku żółty (okna), latarnia żółty (światło), wieżowiec żółty (okna).

**Contract**: Identyfikatory `balon`, `ufo` z `categories: ["kosmos"]`; `domek`, `wieza-zamku`, `latarnia`, `wiezowiec` z `categories: ["budowle"]`. Części, na przykład: balon pasy i kosz, UFO antena i światła, domek okna i drzwi, wieża flaga i blanki, latarnia dach i pasy, wieżowiec antena i okna; na 9×24 co najmniej trzy części.

#### 2. Test kategorii

**File**: `src/lib/symmetry/templates.test.ts`

**Intent**: Strażnik US-19: każda z pięciu kategorii ma co najmniej cztery obiekty w każdym rozmiarze.

**Contract**: Dla każdego `OBJECT_CATEGORIES` i każdego z lat4, lat5, lat7: liczba szablonów z tą kategorią ≥ 4.

#### 3. PRD

**File**: `context/foundation/prd.md`

**Intent**: PRD zgodne z katalogiem po makiecie.

**Contract**: Tabela „Katalog szablonów obiektów”: Zwierzęta z królikiem, Jedzenie z marchewką i ananasem zamiast lodów, Domy i budowle z wieżowcem zamiast namiotu, z dopiskiem o decyzji z 2026-10-25; zdanie o siedmiu kolorach kredek zmienione na osiem (z brązowym) tam, gdzie opisuje paletę (Business Logic „Karta symetrii” i „Katalog szablonów obiektów”); US-09 i Business Logic o kolorach: detal-dziura dostaje kolor szablonu albo zostaje biały, gdy szablon tak ustala (brzuch pingwina, kropki muchomora).

#### 4. Notatka dla S-22

**File**: `C:\Users\agapp\AppData\Local\Claude-Data\claude_pzs8sxrjxfjjc\side-session-notes\local_259ae603-b07c-4ac3-a819-ca9ce9c1abc5\s21-catalog.md` (poza repo)

**Intent**: Uprzedzić nonogram i dyktando, co doszło do katalogu i co może zaczerwienić ich testy po scaleniu.

**Contract**: Lista identyfikatorów, `categories`, `holeColor: null`, brązowy, kolejność listy, i uwaga, że nowe szablony 6×15 nie były sprawdzane solverem nonogramu.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Na `/symetria` po kilkunastu Generuj na każdym poziomie widać obiekty ze wszystkich pięciu kategorii, czytelne jako czarna sylwetka i w kolorach
- Wydruk (podgląd druku) karty 4 lat i 7 lat z kolorami mieści się na jednej stronie A4; brązowy i białe dziury wyglądają poprawnie

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- Istniejący test „każdy szablon, zestaw wariantów i przesunięcie daje poprawną kartę” obejmuje każdy nowy obiekt na każdym poziomie (reguły z `symmetryCardProblems`).
- Istniejący test 3 podpowiedzi na lat4 obejmuje każdy zestaw wariantów nowych szablonów 4×12.
- Nowe testy katalogu: zgodność identyfikatorów i kategorii między rozmiarami, jedna część bez styku rogiem dla co najmniej jednego zestawu wariantów, co najmniej cztery obiekty w kategorii, białe dziury, brązowy.

### Manual Testing Steps:

1. `npm run dev`, `/symetria`, na każdym poziomie kilkanaście razy Generuj z kolorami i bez.
2. Sprawdzić sylwetki nowych obiektów i brązowe oraz białe kratki przy kolorach.
3. Podgląd druku poziomu 4 lat i 7 lat.

## Performance Considerations

Generator losuje szablon w O(1) i sprawdza jedną kartę naraz; 22 szablony zamiast 3 nie zmieniają czasu generowania. Test „każdy zestaw wariantów i przesunięcie” rośnie liniowo (około 22 × 2^części × przesunięcia), co mieści się w sekundach.

## References

- Makieta: `context/changes/template-object-catalog/mockup-drawings.json`, `mockup-4x12.svg`, `mockup-6x15.svg`, `mockup-9x24.svg`
- Wzorzec szablonów: `src/lib/symmetry/templates.ts:66-180`
- Reguły karty: `src/lib/symmetry/generate.ts:170-255`
- Poprzedni plan szablonów: `context/archive/2026-10-23-symmetry-difficulty-levels/plan.md`
- Roadmapa: `context/foundation/roadmap.md` (S-21)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Fundament katalogu

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — b447ad6
- [x] 1.2 Lint przechodzi: `npm run lint` — b447ad6
- [x] 1.3 Typy przechodzą: `npx astro check` — b447ad6

#### Manual

- [ ] 1.4 Na `/symetria` rakieta, robot i truskawka wyglądają jak przed zmianą na każdym poziomie, z kolorami i bez

### Phase 2: Zwierzęta

#### Automated

- [x] 2.1 Testy przechodzą: `npm test` — 18e7563
- [x] 2.2 Lint przechodzi: `npm run lint` — 18e7563

#### Manual

- [ ] 2.3 Na `/symetria` zwierzęta pojawiają się po kilku Generuj na każdym poziomie i są rozpoznawalne jako czarna sylwetka i w kolorach

### Phase 3: Jedzenie

#### Automated

- [x] 3.1 Testy przechodzą: `npm test`
- [x] 3.2 Lint przechodzi: `npm run lint`

#### Manual

- [ ] 3.3 Na `/symetria` nowe jedzenie pojawia się po kilku Generuj na każdym poziomie i jest rozpoznawalne jako czarna sylwetka i w kolorach

### Phase 4: Przyroda

#### Automated

- [ ] 4.1 Testy przechodzą: `npm test`
- [ ] 4.2 Lint przechodzi: `npm run lint`

#### Manual

- [ ] 4.3 Na `/symetria` obiekty przyrody pojawiają się po kilku Generuj na każdym poziomie i są rozpoznawalne jako czarna sylwetka i w kolorach

### Phase 5: Kosmos i maszyny, Domy i budowle, domknięcie

#### Automated

- [ ] 5.1 Testy przechodzą: `npm test`
- [ ] 5.2 Lint przechodzi: `npm run lint`
- [ ] 5.3 Typy przechodzą: `npx astro check`
- [ ] 5.4 Build przechodzi: `npm run build`

#### Manual

- [ ] 5.5 Na `/symetria` po kilkunastu Generuj na każdym poziomie widać obiekty ze wszystkich pięciu kategorii, czytelne jako czarna sylwetka i w kolorach
- [ ] 5.6 Wydruk (podgląd druku) karty 4 lat i 7 lat z kolorami mieści się na jednej stronie A4; brązowy i białe dziury wyglądają poprawnie
