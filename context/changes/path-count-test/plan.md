# Sheet Path-Count Refusal Implementation Plan

## Overview

Test Node ma udowodnić, że labirynt o liczbie ścieżek 0 oraz labirynt, dla którego `countPaths` zwraca 2, nie są wartością zapisywaną jako kartka. Klik Generuj woła tę samą funkcję i ustawia stan tylko wtedy, gdy wynik nie jest pusty.

## Current State Analysis

Gotowa kartka to stan React `maze` w `src/components/WorksheetGenerator.tsx`. Startuje jako `null` (`WorksheetGenerator.tsx:57`). `MazeSheet` renderuje się, gdy stan nie jest `null` (`WorksheetGenerator.tsx:134`). `handleGenerate` buduje labirynt przez `generateMaze(Math.random)` i woła `setMaze(next)` wyłącznie wewnątrz `if (countPaths(next) === 1)` (`WorksheetGenerator.tsx:72-77`). Gałęzi `else` nie ma: kandydat o innej liczbie nie zastępuje poprzedniej kartki, a przy starcie kartka zostaje niezamontowana. Druk nie liczy ścieżek ponownie (`WorksheetGenerator.tsx:79-81`).

`countPaths` startuje od komórki `(0, 6)`, kończy na `(15, 6)` i zwraca 0, 1 albo 2 (`src/lib/maze/generate.ts:47-80`). Wartość 2 znaczy, że spacer znalazł drugą ścieżkę i się zatrzymał. Wejście i wyjście to stałe modułu, nie argumenty siatki (`generate.ts:16-19`). `generateMaze` tej funkcji nie woła (`generate.ts:27-44`). Dla ziaren `{0, 1, …, 31, 99, 12345}` test wymaga `countPaths === 1` (`src/lib/maze/generate.test.ts:6-13`, `generate.test.ts:68-77`). Test otwartych ścian wewnętrznych oczekuje 2 (`generate.test.ts:42-54`). Asercji `countPaths === 0` w tym pliku nie ma. Żaden z tych testów nie przechodzi przez decyzję zapisu kartki.

`npm test` to `node --experimental-strip-types --test` na pięciu plikach w `src/lib/` (`package.json:12`), w tym na `generate.test.ts`. W zależnościach nie ma jsdom ani Testing Library. Kontrakt plasterka S-01: malować albo podmieniać kartkę tylko przy liczbie 1, inaczej zostawić poprzednią kartkę albo brak kartki, bez ponowienia i bez komunikatu.

## Desired End State

`mazeForSheet` w `src/lib/maze/generate.ts` zwraca ten sam obiekt labiryntu, gdy `countPaths` jest 1, a w pozostałych przypadkach `null`. `handleGenerate` woła `setMaze` tylko dla wyniku niepustego. `npm test` ma trzy nowe asercje na tej funkcji: siatka 13 na 16 ze wszystkimi ścianami zamkniętymi daje `countPaths === 0` i `null`; siatka z otwartymi wewnętrznymi ścianami wschodnimi i południowymi daje `countPaths === 2` i `null`; labirynt o jednej ścieżce wraca jako ta sama referencja.

Zielony przebieg znaczy, że decyzja używana przez klik odrzuca te dwie siatki. Nie znaczy, że siatka o zwrocie 2 ma dokładnie dwa korytarze, ani że da się takie siatki wywołać kliknięciem Generuj.

### Key Discoveries:

- Bramka zapisu jest w `WorksheetGenerator.tsx:72-77`; `generateMaze` jej nie zna (`generate.ts:27-44`).
- `countPaths` zwraca co najwyżej 2 (`generate.ts:52-57`). Test `generate.test.ts:42-54` już buduje siatkę o zwrocie 2.
- Zamknięte nacięcia na spójnym labiryncie nadal dają jedną ścieżkę, bo nacięcie nie jest krokiem do sąsiada (`generate.ts:41-42`, `generate.ts:63-74`).
- Runner ładuje `generate.test.ts` bez montowania komponentu (`package.json:12`).

## What We're NOT Doing

- Siatka o dokładnie dwóch korytarzach i twierdzenie, że zwrot 2 oznacza dokładnie dwie trasy.
- Zmiana kapsla `countPaths`, ciała `generateMaze` albo listy 34 ziaren.
- Przepisanie testu zbicia jednej ściany i testu zatrzymania licznika na 2.
- Montowanie `WorksheetGenerator`, jsdom, Testing Library, nowy plik testowy albo zmiana skryptu `npm test`.
- Komunikat błędu, ponowienie generowania albo czyszczenie poprzedniej kartki, gdy decyzja zwróci `null`.
- Progi poziomów, druk, profile, `last-used` i bitmapa ścian.

## Implementation Approach

Decyzja zapisu staje się jedną eksportowaną funkcją obok `countPaths`, bo `npm test` importuje zwykłe moduły TypeScript i nie montuje Reacta. Klik woła tę funkcję, więc test i ekran dzielą ten sam próg `=== 1`. Siatki 0 i 2 powstają w teście: generator ich nie zwraca. Istniejące testy generatora zostają.

## Critical Implementation Details

- **Siatka o zerze ścieżek.** Wejście `(0, 6)` i meta `(15, 6)` są stałymi w `countPaths`. Fixture ma mieć szerokość 13 i wysokość 16 oraz komórkę na obu tych współrzędnych. Zero ścieżek daje siatka, w której każda ściana `north`, `east`, `south` i `west` jest zamknięta. Samo zamknięcie nacięć na labiryncie z `generateMaze` zostawia jedną ścieżkę.
- **Zwrot 2.** Test otwiera każdą wewnętrzną ścianę wschodnią (`col < width - 1`) i południową (`row < height - 1`), sprawdza `countPaths === 2`, a potem `null`. Ta asercja nie liczy tras powyżej drugiej.
- **Brak `else`.** `null` oznacza, że `setMaze` nie jest wołane. Poprzednia kartka zostaje. Przy `maze === null` kartka zostaje niezamontowana.

## Phase 1: Decyzja kartki

### Overview

Wyciągnąć decyzję zapisu, podpiąć ją pod klik Generuj i dodać testy odmowy dla liczby 0 i dla zwrotu 2 oraz zachowania obiektu przy liczbie 1.

### Changes Required:

#### 1. Funkcja decyzji

**File**: `src/lib/maze/generate.ts`

**Intent**: Klik i test Node mają wołać jeden próg. Generator nadal nie liczy ścieżek.

**Contract**: Nowy eksport `mazeForSheet(candidate: Maze): Maze | null`. Zwraca ten sam `candidate`, gdy `countPaths(candidate) === 1`. W każdym innym zwrocie `countPaths` zwraca `null`. `generateMaze` pozostaje bez wywołania `countPaths`.

#### 2. Klik Generuj

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Ekran zapisuje kartkę tylko wtedy, gdy `mazeForSheet` zwróci labirynt. Zachowanie przy liczbie 1 oraz cisza przy innej liczbie zostają.

**Contract**: `handleGenerate` przekazuje wynik `generateMaze(Math.random)` do `mazeForSheet` i woła `setMaze` wyłącznie, gdy wynik nie jest `null`. Nie ma `else`, komunikatu ani drugiej próby. Bezpośrednie `countPaths` w tym pliku odpada razem z nieużywanym importem.

#### 3. Testy odmowy

**File**: `src/lib/maze/generate.test.ts`

**Intent**: Suite ma paść, gdy decyzja kartki przyjmie siatkę o liczbie 0 albo o zwrocie 2, albo gdy przy liczbie 1 zwróci inny obiekt.

**Contract**: Nowy blok `describe`, bez zmian pętli ziaren, testu zbicia jednej ściany i testu zatrzymania na 2. Trzy przypadki:

- Klon labiryntu 13 na 16, wszystkie cztery ściany każdej komórki zamknięte. `countPaths` równe 0. `mazeForSheet` zwraca `null`.
- Klon z otwartą każdą wewnętrzną ścianą wschodnią i południową. `countPaths` równe 2. `mazeForSheet` zwraca `null`.
- `generateMaze(mulberry32(1))`. `countPaths` równe 1. `mazeForSheet` zwraca ten sam obiekt (`assert.equal` na referencji).

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym odmowa kartki przy `countPaths` 0, odmowa przy `countPaths` 2 i zwrot tego samego labiryntu przy `countPaths` 1
- `npm run lint` przechodzi

#### Manual Verification:

- W `handleGenerate` `setMaze` jest wołane tylko dla niepustego wyniku, bez `else`, bez komunikatu i bez ponowienia
- Test zatrzymania licznika na 2 oraz pętla 34 ziaren zostały w `generate.test.ts` i nie zostały przepisane

**Implementation Note**: Po ukończeniu tej fazy i przejściu weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie, że weryfikacja ręczna się powiodła, zanim przejdziesz do kolejnej fazy. Bloki faz mają zwykłe wypunktowanie. Odpowiadające pozycje `- [ ]` są w sekcji `## Progress` na dole planu.

---

## Testing Strategy

### Unit Tests:

- Odmowa przy `countPaths === 0` na siatce 13 na 16 ze wszystkimi ścianami zamkniętymi.
- Odmowa przy `countPaths === 2` na siatce z otwartymi wewnętrznymi ścianami wschodnimi i południowymi.
- Przy `countPaths === 1` funkcja zwraca tę samą referencję, którą dostała.
- Istniejąca pętla 34 ziaren i test kapsla zostają i dalej przechodzą w tym samym `npm test`.

### Integration Tests:

- Brak. Decyzja jest czystą funkcją. Komponent nie jest montowany w tym runnerze.

### Manual Testing Steps:

1. Otwórz `handleGenerate` i sprawdź, że `setMaze` stoi wyłącznie za wynikiem niepustym.
2. Sprawdź, że w pliku testu nadal jest test „stops counting once a second path exists” oraz pętla ziaren 0–31, 99 i 12345, bez przeróbki ich asercji.

## Performance Considerations

`mazeForSheet` woła istniejący `countPaths` raz na klik. Licznik i tak staje po drugiej ścieżce. Osobnego budżetu czasu nie ma.

## Migration Notes

Stan kartki żyje w pamięci komponentu i startuje od `null`. Zapis lokalny postaci i profili ta zmiana nie rusza. Migracji danych nie ma.

## References

- Related research: `context/changes/path-count-test/research.md`
- Similar implementation: `src/components/WorksheetGenerator.tsx:72-77`
- Test kapsla: `src/lib/maze/generate.test.ts:42-54`
- Kontrakt ciszy: `context/archive/2026-09-28-first-printable-maze/plan.md`
- Faza 1 test-planu: `context/foundation/test-plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Decyzja kartki

#### Automated

- [x] 1.1 `npm test` przechodzi, w tym odmowa kartki przy `countPaths` 0, odmowa przy `countPaths` 2 i zwrot tego samego labiryntu przy `countPaths` 1 — b211225
- [x] 1.2 `npm run lint` przechodzi — b211225

#### Manual

- [x] 1.3 W `handleGenerate` `setMaze` jest wołane tylko dla niepustego wyniku, bez `else`, bez komunikatu i bez ponowienia — b211225
- [x] 1.4 Test zatrzymania licznika na 2 oraz pętla 34 ziaren zostały w `generate.test.ts` i nie zostały przepisane — b211225
