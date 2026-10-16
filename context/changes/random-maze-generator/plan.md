# Losowy generator labiryntu — plan implementacji

## Overview

Generator wraca do zwykłego losowania drzewa rozpinającego. Poziom wyznacza siatka, czyli szerokość alejki, i algorytm losowania. Pasma długości drogi, progi odnogi, reguła biegu, tercje i gotowe szablony drogi znikają. Każde Generuj daje nowy labirynt z dokładnie jedną drogą.

## Current State Analysis

Gałąź `feat/maze-winding` ma `src/lib/maze/generate.ts` o około 1260 liniach (na `main` było 169). Kod próbuje jednym ułożeniem trafić w pasmo długości, limit odnogi, regułę biegu i obie tercje.

- `lat3` ma jedną ręcznie wpisaną drogę (`layLat3Path`). Każda kartka 3 lat ma tę samą drogę do mety.
- `lat5` i `lat6` mają jedną ręcznie wpisaną drogę (`layLat5Edge`) i jej 4 odbicia (`layLat5Path`). Dziecko szybko pozna drogę na pamięć, a 6 lat niczym nie różni się od 5 lat.
- `lat7` i `nastolatek` zaczynają od rzędów drobnych pętli w poprzek kartki (powtarzalny wzór w górnej części).
- `mazeForSheet` odrzuca kartkę spoza pasma, odnogi albo reguły biegu, więc te reguły trzeba utrzymywać w generatorze i w bramce naraz.

Pomiar zwykłego losowania (1000 ziaren na poziom, skrypt poza repo):

| Poziom | Siatka | Algorytm | Droga p5 / mediana / p95 | PRD dziś |
| --- | --- | --- | --- | --- |
| 3 lata | 9×11 | Kruskal | 15 / 21 / 29 | do około 25 |
| 4 lata | 9×11 | DFS (backtracker) | 21 / 33 / 57 | od około 40 |
| 5 lat | 13×16 | Kruskal | 24 / 32 / 46 | do około 40 |
| 6 lat | 13×16 | DFS | 38 / 62 / 108 | od około 70 |
| 7–8 lat | 17×21 | DFS | 57 / 97 / 171 | około 80–120 |
| nastolatek | 27×33 | DFS, narożniki | 163 / 309 / 477 | około 150–300 |

Na tym samym ziarnie 4 lata mają dłuższą drogę niż 3 lata w 88% losowań, a 6 lat niż 5 lat w 96%. Nastolatek generuje się w około 1 ms.

### Key Discoveries:

- Kruskal daje krótką drogę i dużo krótkich odnóg. DFS daje długą, krętą drogę i mało rozgałęzień. To naturalnie rozdziela pary o tej samej alejce.
- Oba algorytmy dają drzewo rozpinające, więc droga jest zawsze dokładnie jedna i każda komórka jest osiągalna. Bramka zostaje jako zabezpieczenie, a nie miejsce na reguły trudności.
- Mediany trafiają w pierwotną tabelę PRD bez żadnego progu. Zawijanie, o które chodziło w `winding-maze-path`, losowanie daje samo.

## Desired End State

| Id | Siatka | Wejście → wyjście | Algorytm | Postać |
| --- | --- | --- | --- | --- |
| `lat3` | 9×11 | środek góry → środek dołu | `kruskal` | tak |
| `lat4` | 9×11 | środek góry → środek dołu | `backtracker` | tak |
| `lat5` | 13×16 | środek góry → środek dołu | `kruskal` | tak |
| `lat6` | 13×16 | środek góry → środek dołu | `backtracker` | tak |
| `lat7` | 17×21 | środek góry → środek dołu | `backtracker` | tak |
| `nastolatek` | 27×33 | lewy górny → prawy dolny | `backtracker` | nie |

Długość drogi nie jest progiem. Jest typową wartością dla siatki i algorytmu.

## What We're NOT Doing

- Pasma długości, limity odnogi, reguła biegu, tercje, szablony drogi.
- Pętla losowań do trafienia w pasmo.
- Zmiana siatek, insetu, `@page`, układu kartki (faza 2 `maze-difficulty-levels`).
- Pasek „Poziom:”, zapis poziomu i profilu (faza 3 `maze-difficulty-levels`, osobno).
- Pętle w odnogach nastolatka (PRD je dopuszcza, ale nie wymaga).

## Implementation Approach

Najpierw generator i testy, potem dokumenty i porzucenie `winding-maze-path`. Faza 3 `maze-difficulty-levels` rusza dopiero po tym planie, na nowym generatorze.

## Phase 1: Losowy generator

### Overview

`generateMaze(levelId, random)` zachowuje sygnaturę. W środku wybiera algorytm z poziomu i otwiera wejście oraz wyjście z poziomu.

### Changes Required:

#### 1. `src/lib/maze/levels.ts`

Usunąć `pathMin`, `pathMax`, `spurMin` i `spurMax`. Dodać `algorithm: "kruskal" | "backtracker"` według tabeli Desired End State. Zostają `id`, `label`, `columns`, `rows`, `entrance`, `exit` i `showCharacter`.

#### 2. `src/lib/maze/generate.ts`

Zastąpić całość około 150–200 liniami:

- `kruskal` przenieść z `main` (tasowanie krawędzi i union-find), sparametryzowany siatką poziomu.
- `backtracker` dopisać: iteracyjny DFS ze stosem (nie rekurencja, bo nastolatek ma 891 komórek), losowy nieodwiedzony sąsiad z `random`.
- `countPaths(maze, entrance, exit)` zostaje bez zmian.
- `mazeForSheet(candidate, levelId)` sprawdza tylko siatkę poziomu i `countPaths === 1`.

`WorksheetGenerator.tsx` się nie zmienia.

#### 3. `src/lib/maze/generate.test.ts`

Zostają: deterministyczność dla tego samego ziarna, różne ściany dla dwóch ziaren, brak wywołania `Math.random`, testy `countPaths` i `mazeForSheet` dla zera i dwóch dróg.

Nowe albo przepisane:

- dla każdego z sześciu poziomów na kilku ziarnach: siatka poziomu, otwarte wejście i wyjście, dokładnie jedna droga, każda komórka osiągalna;
- na 200 ziarnach mediana drogi `lat4` jest większa niż `lat3`, a `lat6` niż `lat5` (kolejność, nie próg);
- dla `lat3` i `lat5` co najmniej dwie różne drogi do mety na kilku ziarnach (pilnuje, że szablon nie wraca).

Usunąć: testy pasma, odnogi, reguły biegu, tercji, „six years keeps the five-year winding maze” i pomocnicze funkcje tych testów.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint` i `npx astro check` przechodzą.
- Testy z punktu 3 są w `generate.test.ts`.

#### Manual Verification:

- Po Generuj na 5 latach kolejne kliknięcia dają wyraźnie różne drogi do mety, a kartka mieści się na jednej stronie A4 jak dziś.

## Phase 2: Dokumenty i porzucenie `winding-maze-path`

### Changes Required:

#### 1. `context/foundation/prd.md`

- Business Logic: tabela poziomów dostaje kolumnę „Losowanie” zamiast „Ślepe uliczki”, a droga do mety staje się wartością typową, nie progiem. Zdanie o płytkich uliczkach przy krótkim poziomie zastąpić zdaniem, że krótki poziom przy tej samej alejce losuje się algorytmem z krótszą drogą i większą liczbą krótkich odnóg.
- Open Questions: pytanie 2 (głębokość płytkiej uliczki) zamknąć jako nieaktualne.

#### 2. `context/foundation/test-plan.md`

§5 i §7: zamiast „długość w paśmie i odnoga w limicie” — siatka poziomu, jedna droga, każda komórka osiągalna i kolejność median w parach o tej samej siatce.

#### 3. `context/changes/maze-difficulty-levels/plan.md`

Desired End State i Critical Implementation Details: odesłać do tego planu. Bloki faz i Progress zostają.

#### 4. `context/changes/winding-maze-path/change.md`

`status: abandoned`, w Notes jedno zdanie, że zastępuje go `random-maze-generator`. Potem `/10x-archive`.

### Success Criteria:

#### Manual Verification:

- PRD, test-plan i plan poziomów nie wspominają już pasm, progu odnogi ani reguły biegu jako wymagań.

## Testing Strategy

Testy jednostkowe na runnerze Node, bez Playwright. Właściwości drzewa (jedna droga, osiągalność) sprawdzane na każdym poziomie. Różnica trudności w parach sprawdzana statystycznie medianą, żeby test nie zależał od pojedynczego ziarna.

## Performance Considerations

Najwolniejszy poziom (nastolatek, DFS) zajmuje około 1 ms. Limit 5 sekund z PRD nie jest zagrożony.

## Migration Notes

Sygnatury `generateMaze`, `countPaths` i `mazeForSheet` zostają, więc kartka i układ się nie zmieniają. Zapisy w `localStorage` nie mają pól generatora.

Na `feat/maze-winding` są też commity `dialog-close-button`. Ten plan dotyka tylko `src/lib/maze/` i dokumentów, więc się z nimi nie miesza, ale przy PR warto je rozdzielić.

## References

- Porzucone: `context/changes/winding-maze-path/plan.md`
- Rama: `context/changes/maze-difficulty-levels/frame.md`
- Generator przed zmianami: `git show main:src/lib/maze/generate.ts`
- Tabela produktu: `context/foundation/prd.md` (Business Logic)

## Progress

### Phase 1: Losowy generator

#### Automated

- [x] 1.1 `npm test` sprawdza sześć poziomów: siatkę, wejście i wyjście, jedną drogę, osiągalność każdej komórki, kolejność median w parach 3/4 i 5/6 oraz brak stałej drogi na 3 i 5 latach — 27779c6
- [x] 1.2 `npm run lint` i `npx astro check` przechodzą — 27779c6

#### Manual

- [ ] 1.3 Kolejne Generuj na 5 latach dają różne drogi, kartka mieści się na jednej stronie A4

### Phase 2: Dokumenty i porzucenie `winding-maze-path`

#### Manual

- [ ] 2.1 PRD: tabela z kolumną „Losowanie”, droga jako wartość typowa, pytanie 2 zamknięte
- [ ] 2.2 test-plan §5 i §7 bez pasma i progu odnogi
- [ ] 2.3 Plan `maze-difficulty-levels` odsyła do tego planu
- [ ] 2.4 `winding-maze-path` ma `status: abandoned` i jest zarchiwizowany
