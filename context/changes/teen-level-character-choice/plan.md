# Teen level character choice Implementation Plan

## Overview

Na poziomie nastolatka wybrana postać ma stanąć nad narożnym startem. Lewa krawędź znaku 30×30 pokrywa się z lewą krawędzią labiryntu, a cała karta zjeżdża w dół tą samą regułą co na młodszych poziomach, tak że biały pas nad znakiem równa się pasowi pod „Meta”. Pasek „Postać” zostaje aktywny. Ostatnio użyta postać i ulubiona postać profilu nie giną przy przejściu na nastolatka i z powrotem.

## Current State Analysis

Pasek „Postać” nie zależy od poziomu. `CharacterChoiceControl` nie ma stanu wyłączonego, a `handleLevelSelect` zmienia tylko poziom i — gdy nie ma aktywnego profilu — zapisuje ostatnio użyte parametry z tą samą postacią (`src/components/WorksheetGenerator.tsx`). `applyLevel` nie czyści identyfikatora postaci.

Karta dostaje znak tylko wtedy, gdy poziom go pokazuje i jest skąd go narysować. Nastolatek jest jedynym poziomem z `showCharacter: false`; start i meta są w przeciwległych narożnikach (`src/lib/maze/levels.ts`). Układ wtedy nie tworzy znaku i pisze „Start” na środku kolumny wejścia (`src/lib/sheet/layout.ts`).

Przesunięcie w dół jest już w układzie. Gdy `levelShowsCharacter` jest prawdziwe, cała karta zjeżdża tak, że pas nad znakiem równa się pasowi pod „Meta”, i to przesunięcie nie zależy od tego, czy rodzic wybrał postać. Dzięki temu labirynt nie skacze przy „Bez postaci”. Dla siatki 27×33 to przesunięcie wynosi około 7,7 mm, a góra znaku wypada około 10 mm od brzegu kartki.

Znak jest dziś wyśrodkowany na kolumnie wejścia: `x = labelX - markSize / 2`. Na nastolatku kolumna 0 ma środek około 13,5 mm od lewej krawędzi kartki, więc wyśrodkowany znak 30×30 zaczynałby się około 1,5 mm poza kartką (`-40/27` mm). Testy pilnują tej nieobecności znaku (`src/lib/sheet/layout.test.ts`, `src/lib/maze/generate.test.ts`).

PRD mówi w US-01, US-03 i w logice labiryntu, że poziom nastolatka postaci nie pokazuje. To samo jest otwartym pytaniem 4 w PRD i pytaniem 3 w roadmapie. Issue #54 zostawiało dwie drogi; ta zmiana wybiera rysowanie.

Ostatnio użyta postać (`printo-kids:last-used`) i ulubiona postać profilu już przeżywają poziom nastolatka. Testy `last-used.test.ts` i `child-profiles.test.ts` trzymają parę „postać + nastolatek”.

### Key Discoveries:

- Jedyna brama rysowania to `showCharacter` w `src/lib/maze/levels.ts` oraz `characterSelected` i `levelShowsCharacter` w `src/components/WorksheetGenerator.tsx` (przekazanie do `layoutSheet`). Generatora nie trzeba przebudowywać, żeby znak się pojawił.
- Reguła równych pasów jest w `src/lib/sheet/layout.ts` i jest sprawdzana w `src/lib/sheet/layout.test.ts` dla poziomów z `showCharacter`. Nastolatek do tej pętli nie wchodzi, bo flaga jest fałszywa.
- Pętla „middle entrance” wymaga, żeby każdy poziom z postacią miał znak wyśrodkowany na kolumnie wejścia. Po włączeniu flagi ta asercja złapie nastolatka i trzeba ją rozdzielić, a nie „naprawiać” przez powrót do środka kolumny 0.
- Margines 10 mm w PRD dotyczy ścian. Znak może wejść w ten pas. Na nastolatku lewa krawędź znaku ma być równa lewej krawędzi ścian, czyli na granicy marginesu, nie w nim.

## Desired End State

Rodzic na poziomie nastolatka wybiera postać albo własny obrazek i po wygenerowaniu widzi znak 30×30 nad labiryntem. Lewa krawędź znaku pokrywa się z lewą krawędzią ścian. Dół znaku dotyka góry labiryntu. Biały pas nad znakiem równa się pasowi pod napisem „Meta”. Napisu „Start” nie ma.

„Bez postaci” zostawia napis „Start” na środku kolumny 0 i „Meta” na kolumnie 26. Wysokość labiryntu jest ta sama co przy wybranej postaci.

Poziomy od 3 lat do 7–8 lat zostają ze znakiem wyśrodkowanym na środkowym wejściu. Wejście i meta nastolatka zostają w narożnikach `{0,0}` i `{32,26}`.

Ostatnio użyta postać i ulubiona postać profilu po przejściu na nastolatka i z powrotem są tym samym identyfikatorem. Na młodszym poziomie znak znowu stoi na środku wejścia, na nastolatku znowu lewą krawędzią przy labiryncie.

Zdania PRD i pytanie w roadmapie opisują ten skutek, a nie brak postaci.

## What We're NOT Doing

- Nie wyłączamy paska „Postać” i nie dokładamy wyjaśnienia, że poziom postaci nie rysuje.
- Nie ruszamy wejścia, mety, rozmiaru znaku (zostaje 30×30) ani marginesu 10 mm ścian.
- Nie zmieniamy wyśrodkowania znaku na poziomach od 3 lat do 7–8 lat.
- Nie zmieniamy zapisu ostatnio użytej postaci, ulubionej postaci profilu ani własnego obrazka. Brak nowej migracji danych.
- Nie ruszamy geometrii druku pod margines drukarki (`print-printer-margins`), miniaturek katalogu, testów przeglądarkowych paska ani `context/foundation/test-plan.md`.

## Implementation Approach

Włączenie `showCharacter` dla nastolatka wpuszcza ten poziom w istniejące przesunięcie w dół i w istniejące rysowanie znaku w generatorze. Nowa reguła jest tylko pozioma i nie zna identyfikatora poziomu: jeśli wyśrodkowanie na kolumnie wejścia zaczęłoby znak na lewo od labiryntu, lewa krawędź znaku przypina się do lewej krawędzi labiryntu. Na dzisiejszych siatkach dotyczy to wyłącznie kolumny 0 nastolatka. Młodsze poziomy dalej spełniają wyśrodkowanie, więc ta reguła ich nie rusza.

Tekst produktu jest drugą fazą, po tym jak testy układu opisują nowy kontrakt. Inaczej PRD mówiłoby o karcie, której testy jeszcze bronią.

## Critical Implementation Details

- Pętla w `src/lib/sheet/layout.test.ts`, która dla każdego poziomu z `showCharacter` wymaga środka znaku na środku kolumny wejścia, po zmianie flagi obejmuje nastolatka. Nowy kontrakt nastolatka to `mark.x === maze.x`, nie środek kolumny 0. Poprawka testu, która przywraca wyśrodkowanie, znowu wystawia znak poza kartkę.
- Przesunięcie w dół zależy od `levelShowsCharacter`, nie od tego, czy postać jest wybrana. Flaga nastolatka ma zostać włączona także dla „Bez postaci”. Osobne przesunięcie tylko przy wybranym znaku poruszyłoby labirynt przy każdym przejściu na „Start”.

## Phase 1: Teen sheet draws the character

### Overview

Nastolatek z wybraną postacią dostaje znak 30×30 przypięty lewą krawędzią do labiryntu i te same równe pasy co pozostałe poziomy z postacią. Bez postaci zostaje napis „Start”. Testy układu i migawka poziomów pilnują tego kontraktu.

### Changes Required:

#### 1. Level flag

**File**: `src/lib/maze/levels.ts`

**Intent**: Nastolatek ma pokazywać postać, żeby generator i przesunięcie układu użyły ścieżki, która już rysuje znak na młodszych poziomach.

**Contract**: Wpis `nastolatek` zmienia `showCharacter` na `true`. `entrance` zostaje `{ row: 0, col: 0 }`, `exit` zostaje `{ row: 32, col: 26 }`, siatka zostaje 27×33. Inne poziomy bez zmian.

#### 2. Horizontal pin

**File**: `src/lib/sheet/layout.ts`

**Intent**: Znak przy narożnym wejściu ma się zaczynać tam, gdzie labirynt, zamiast wystawać poza lewą krawędź kartki. Pion zostaje przy istniejącej regule równych pasów.

**Contract**: Gdy powstaje znak (`characterSelected` i `levelShowsCharacter`), jego szerokość i wysokość zostają `markSize`, a dół zostaje na `maze.y` (`y = originY - markSize`). Lewa krawędź to środek kolumny wejścia minus połowa znaku, ale nie mniej niż `maze.x`. Wzór: `mark.x = max(labelX - markSize / 2, maze.x)`. `shift` zostaje funkcją samego `levelShowsCharacter`. Dla nastolatka ze znakiem `mark.x` równa się `maze.x` (inset 10 mm). Wyśrodkowany znak na kolumnie 0 wychodziłby na `-40/27` mm i ta wartość nie może wrócić.

#### 3. Layout tests

**File**: `src/lib/sheet/layout.test.ts`

**Intent**: Testy mają bronić nowego kontraktu nastolatka i dotychczasowego wyśrodkowania młodszych poziomów, skoro pętla „middle entrance” zacznie obejmować nastolatka razem z flagą.

**Contract**:

- Przy wybranej postaci na nastolatku: jest znak 30×30, nie ma „Start”, `mark.x` równa się `maze.x`, dół znaku równa się `maze.y`, „Meta” jest na kolumnie 26, a pas nad znakiem równa się pasowi pod „Meta” z tą samą tolerancją 0,01 mm co istniejący test pasów.
- Bez postaci: nie ma znaku, „Start” jest na środku kolumny 0, „Meta” na kolumnie 26, a `maze.y` i `meta.y` są takie same jak przy wybranej postaci.
- Nastolatek wchodzi w istniejące pętle poziomów z postacią (równe pasy, przesunięcie niezależne od wyboru, ściany co najmniej 10 mm od brzegu).
- Asercja „środek znaku na środku kolumny” zostaje przy poziomach, na których wyśrodkowanie nie zaczyna znaku na lewo od `maze.x`. Nastolatek jej nie spełnia i dostaje asercję lewej krawędzi zamiast wyjątku po identyfikatorze wpisanego na sztywno w układ.
- Testy „nastolatek nie ma znaku”, „wybrana postać na poziomie bez postaci nadal daje Start” i „nastolatek trzyma wyśrodkowany blok” schodzą, bo opisują regułę, którą ta zmiana uchyla. Nie zostaje poziom, który połyka wybraną postać.

#### 4. Level snapshot

**File**: `src/lib/maze/generate.test.ts`

**Intent**: Migawka tabeli poziomów ma przestać wymagać `showCharacter: false` dla nastolatka.

**Contract**: Oczekiwany wpis `nastolatek` ma `showCharacter: true`. Reszta migawki bez zmian.

### Success Criteria:

#### Automated Verification:

- `npm test` passes, with nastolatek drawing a 30×30 mark whose left edge equals the maze left edge and whose top band matches the band below Meta
- `npm run lint` passes

#### Manual Verification:

- A generated nastolatek sheet with a catalog character and with a parent image shows the mark on the maze's left edge, with no Start label, and the white band above the mark matches the band below Meta
- Bez postaci on nastolatek shows Start on column 0, Meta on column 26, and the maze stays at the same height as with a character
- Switching from nastolatek to 5 lat and back keeps the same character, centered on 5 lat and left-aligned on nastolatek

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Product text matches the sheet

### Overview

PRD i otwarte pytanie w roadmapie przestają mówić, że nastolatek postaci nie pokazuje. Opisują znak przy lewej krawędzi labiryntu i te same pasy pionowe co na pozostałych poziomach z postacią.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Zdania, które rodzicowi i kolejnym zmianom mówią, że nastolatek postaci nie rysuje, mają opisać kartę z fazy 1.

**Contract**: Do zmiany wchodzą: scenariusz US-01 („poza poziomem nastolatka”), kryterium US-01 „Poziom nastolatka postaci nie pokazuje”, kryterium US-03 z tym samym zdaniem oraz akapit logiki labiryntu, który powtarza brak postaci. Nowy opis: na nastolatku wybrana postać stoi nad narożnym startem, lewą krawędzią równo z lewą krawędzią labiryntu, a pas nad znakiem równa się pasowi pod „Meta”; młodsze poziomy zostają ze znakiem na środku wejścia. US-02 zostaje bez dopisku o wyjątku, bo własny obrazek używa tego samego znaku. Zdanie US-04 o marginesie ścian i o znaku, który może wejść w ten pas, zostaje. Pytanie otwarte 4 zamyka się tak jak pytanie 2: przekreślenie, data 2026-10-25, odesłanie do tej zmiany i jedno zdanie z podjętą decyzją.

#### 2. Roadmap question

**File**: `context/foundation/roadmap.md`

**Intent**: To samo pytanie nie może zostać otwarte w roadmapie, skoro PRD je zamyka.

**Contract**: Pytanie 3 w otwartych pytaniach roadmapy („Czy poziom nastolatka ma pokazywać postać?”) zapisuje decyzję i wskazuje `teen-level-character-choice` oraz issue #54. Nie dostaje wiersza plastra ani `Change ID` w tabeli „At a glance”. Statusy innych plastrów bez zmian.

### Success Criteria:

#### Automated Verification:

- The sentence „Poziom nastolatka postaci nie pokazuje” is absent from `context/foundation/prd.md`, and roadmap open question 3 records the decision

#### Manual Verification:

- US-01, US-03, the maze business-logic paragraph, PRD open question 4, and roadmap open question 3 say the teen level draws the character left-aligned with the maze and with the same vertical bands, while younger levels stay centered

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- Układ nastolatka ze znakiem: lewa krawędź, dół na górze labiryntu, brak „Start”, równe pasy, „Meta” na kolumnie 26.
- Układ nastolatka bez postaci: „Start” na kolumnie 0, ta sama wysokość labiryntu co ze znakiem.
- Młodsze poziomy: znak dalej wyśrodkowany na kolumnie wejścia.
- Migawka `LEVELS`: `showCharacter: true` tylko jako zmiana flagi nastolatka.
- Istniejące testy `last-used` i profili zostają zielone bez nowej reguły zapisu.

### Integration Tests:

- Brak nowego testu przeglądarkowego. Pasek na nastolatku ma zostać klikalny; istniejące scenariusze paska tego nie cofają.

### Manual Testing Steps:

1. Wygenerować nastolatka z postacią z katalogu i sprawdzić lewą krawędź znaku, brak „Start” oraz pas nad znakiem wobec pasa pod „Meta”.
2. To samo z własnym obrazkiem.
3. Przełączyć na „Bez postaci” i sprawdzić, że labirynt nie skacze, a „Start” jest w narożniku.
4. Przełączyć na 5 lat i z powrotem na nastolatka i sprawdzić, że to ta sama postać, raz na środku wejścia, raz przy lewej krawędzi.

## Performance Considerations

Układ karty zostaje czystą funkcją wymiarów i flag poziomu. Generowanie labiryntu się nie zmienia. Nie ma nowego budżetu czasu.

## Migration Notes

Zapisane pary „postać + nastolatek” w ostatnio użytych parametrach i w profilu dziecka zaczynają być widoczne na karcie. Nie przepisujemy `localStorage`. „Bez postaci” nadal daje napis „Start”.

## References

- Issue: https://github.com/drpc1/printo-kids/issues/54
- Poziom i flaga: `src/lib/maze/levels.ts`
- Układ znaku i przesunięcie: `src/lib/sheet/layout.ts`
- Testy, które dziś bronią braku znaku: `src/lib/sheet/layout.test.ts`, `src/lib/maze/generate.test.ts`
- PRD: US-01, US-03, akapit logiki labiryntu, pytanie otwarte 4 w `context/foundation/prd.md`
- Reguła równych pasów: `context/archive/2026-10-22-printed-maze-equal-margins/`
- Pytanie roadmapy: `context/foundation/roadmap.md` (pytanie 3, nie plaster z Change ID)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Teen sheet draws the character

#### Automated

- [x] 1.1 `npm test` passes, with nastolatek drawing a 30×30 mark whose left edge equals the maze left edge and whose top band matches the band below Meta — 321c008
- [x] 1.2 `npm run lint` passes — 321c008

#### Manual

- [ ] 1.3 A generated nastolatek sheet with a catalog character and with a parent image shows the mark on the maze's left edge, with no Start label, and the white band above the mark matches the band below Meta
- [ ] 1.4 Bez postaci on nastolatek shows Start on column 0, Meta on column 26, and the maze stays at the same height as with a character
- [ ] 1.5 Switching from nastolatek to 5 lat and back keeps the same character, centered on 5 lat and left-aligned on nastolatek

### Phase 2: Product text matches the sheet

#### Automated

- [ ] 2.1 The sentence „Poziom nastolatka postaci nie pokazuje” is absent from `context/foundation/prd.md`, and roadmap open question 3 records the decision

#### Manual

- [ ] 2.2 US-01, US-03, the maze business-logic paragraph, PRD open question 4, and roadmap open question 3 say the teen level draws the character left-aligned with the maze and with the same vertical bands, while younger levels stay centered
