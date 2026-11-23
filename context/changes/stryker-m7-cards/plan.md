# Stryker dla kart M-7 Implementation Plan

## Overview

S-50: selektywne testy mutacyjne generatorów i reguł jednoznaczności kart M-7 (kodowanie, Cienie, Od najmniejszego, Labirynt liczbowy) oraz wąski przebieg na kodzie S-55 w „Skopiuj obrazek”. Filtr S-43 poza zakresem.

## Current State Analysis

Są zakresy Strykera dla kart do M-6 (`stryker/*.config.json`, `mutate:*` w `package.json`). Dla czterech kart M-7 dodano już configi (`coding`, `shadows`, `size-order`, `number-maze`) i skrypty; `copy-drawing` istnieje (mutuje `generate.ts` i `layout.ts`). Wzór: `context/archive/2026-11-16-stryker-m6-cards/reviews/stryker-results.md`.

## Desired End State

Każdy zakres ma wynik i przejrzane ocalałe w `context/changes/stryker-m7-cards/reviews/stryker-results.md`; roadmapa i AGENTS.md są zgodne.

## What We're NOT Doing

- Filtr S-43 (zakres dojdzie z S-43, jeśli ma logikę).
- Mutowanie layoutu, SVG i arkuszy; ściganie 100%.
- Stryker jako bramka CI.

## Implementation Approach

Jeden zakres naraz, w tle; czytamy tylko końcowe podsumowanie. `copy-drawing` zawężamy flagą `--mutate "plik:start-koniec"` do kodu zmienionego w S-55 (`card.ts`, `colors.ts`, `generate.ts`). Przed każdym PR `/10x-impl-review`.

## Phase 1: Kodowanie

### Overview

Przebieg Strykera zakresu `coding`, przegląd ocalałych pojedynczo, testy tylko dla błędów widocznych dla rodzica.

### Changes Required:

#### 1. Zakres `coding`

**File**: `stryker/coding.config.json`, `package.json`, testy w tym samym katalogu co kod

**Intent**: Uruchomić `npm run mutate:coding` w tle (komputer nie śpi), przeczytać tylko tabelę clear-text, ocenić ocalałe i dopisać asercje tam, gdzie mutant to błąd użytkownika lub biznesu.

**Contract**: Mutowane: `card.ts` (reguły, `codingProblems`), `generate.ts`, `search.ts`. Wynik, ocalałe i decyzje trafiają do `reviews/stryker-results.md` w fazie docs.

### Success Criteria:

#### Automated Verification:

- Zakres przechodzi i daje wynik: `npm run mutate:coding`
- Testy: `npm test`
- Lint: `npm run lint`

#### Manual Verification:

- Każdy ocalały mutant ma decyzję (test albo uzasadnienie)

---

## Phase 2: Cienie

### Overview

Przebieg Strykera zakresu `shadows`, przegląd ocalałych pojedynczo, testy tylko dla błędów widocznych dla rodzica.

### Changes Required:

#### 1. Zakres `shadows`

**File**: `stryker/shadows.config.json`, `package.json`, testy w tym samym katalogu co kod

**Intent**: Uruchomić `npm run mutate:shadows` w tle (komputer nie śpi), przeczytać tylko tabelę clear-text, ocenić ocalałe i dopisać asercje tam, gdzie mutant to błąd użytkownika lub biznesu.

**Contract**: Mutowane: `card.ts` (`shadowsCardProblems`), `generate.ts`, `raster.ts` (różnica cieni). Wynik, ocalałe i decyzje trafiają do `reviews/stryker-results.md` w fazie docs.

### Success Criteria:

#### Automated Verification:

- Zakres przechodzi i daje wynik: `npm run mutate:shadows`
- Testy: `npm test`
- Lint: `npm run lint`

#### Manual Verification:

- Każdy ocalały mutant ma decyzję (test albo uzasadnienie)

---

## Phase 3: Od najmniejszego

### Overview

Przebieg Strykera zakresu `size-order`, przegląd ocalałych pojedynczo, testy tylko dla błędów widocznych dla rodzica.

### Changes Required:

#### 1. Zakres `size-order`

**File**: `stryker/size-order.config.json`, `package.json`, testy w tym samym katalogu co kod

**Intent**: Uruchomić `npm run mutate:size-order` w tle (komputer nie śpi), przeczytać tylko tabelę clear-text, ocenić ocalałe i dopisać asercje tam, gdzie mutant to błąd użytkownika lub biznesu.

**Contract**: Mutowane: `card.ts`, `generate.ts`. Wynik, ocalałe i decyzje trafiają do `reviews/stryker-results.md` w fazie docs.

### Success Criteria:

#### Automated Verification:

- Zakres przechodzi i daje wynik: `npm run mutate:size-order`
- Testy: `npm test`
- Lint: `npm run lint`

#### Manual Verification:

- Każdy ocalały mutant ma decyzję (test albo uzasadnienie)

---

## Phase 4: Labirynt liczbowy

### Overview

Przebieg Strykera zakresu `number-maze`, przegląd ocalałych pojedynczo, testy tylko dla błędów widocznych dla rodzica.

### Changes Required:

#### 1. Zakres `number-maze`

**File**: `stryker/number-maze.config.json`, `package.json`, testy w tym samym katalogu co kod

**Intent**: Uruchomić `npm run mutate:number-maze` w tle (komputer nie śpi), przeczytać tylko tabelę clear-text, ocenić ocalałe i dopisać asercje tam, gdzie mutant to błąd użytkownika lub biznesu.

**Contract**: Mutowane: `card.ts` (niezależne sprawdzenie drogi, pułapki), `generate.ts`. Wynik, ocalałe i decyzje trafiają do `reviews/stryker-results.md` w fazie docs.

### Success Criteria:

#### Automated Verification:

- Zakres przechodzi i daje wynik: `npm run mutate:number-maze`
- Testy: `npm test`
- Lint: `npm run lint`

#### Manual Verification:

- Każdy ocalały mutant ma decyzję (test albo uzasadnienie)

---

## Phase 5: Skopiuj obrazek (S-55)

### Overview

Przebieg Strykera zakresu `copy-drawing`, przegląd ocalałych pojedynczo, testy tylko dla błędów widocznych dla rodzica.

### Changes Required:

#### 1. Zakres `copy-drawing`

**File**: `stryker/copy-drawing.config.json`, `package.json`, testy w tym samym katalogu co kod

**Intent**: Uruchomić `npm run mutate:copy-drawing` w tle (komputer nie śpi), przeczytać tylko tabelę clear-text, ocenić ocalałe i dopisać asercje tam, gdzie mutant to błąd użytkownika lub biznesu.

**Contract**: Mutowane: wąsko `card.ts`, `colors.ts`, `generate.ts` (zakresy linii zmienione w S-55). Wynik, ocalałe i decyzje trafiają do `reviews/stryker-results.md` w fazie docs.

### Success Criteria:

#### Automated Verification:

- Zakres przechodzi i daje wynik: `npm run mutate:copy-drawing`
- Testy: `npm test`
- Lint: `npm run lint`

#### Manual Verification:

- Każdy ocalały mutant ma decyzję (test albo uzasadnienie)

---

## Phase 6: Dokumentacja

### Overview

Wyniki, roadmapa i AGENTS.md.

### Changes Required:

#### 1. Wyniki i dokumenty

**File**: `context/changes/stryker-m7-cards/reviews/stryker-results.md`, `context/foundation/roadmap.md`, `AGENTS.md`

**Intent**: Zapisać wyniki i jak powtórzyć; w roadmapie S-50 ma prerekwizyty S-42, S-47, S-48, S-49, S-55 (bez S-43 i S-54) w tabeli „At a glance” i w treści, z notką, że zakres filtra dojdzie z S-43; w AGENTS.md „Mutation testing” dopisać nowe zakresy i plik wyników.

**Contract**: Wzór wpisu M-5/M-6.

### Success Criteria:

#### Automated Verification:

- Testy: `npm test`
- Lint: `npm run lint`
- Zależności: `npm run depcruise`
- Typy: `npx astro check`
- Build: `npm run build`

#### Manual Verification:

- Roadmapa i AGENTS.md zgodne z wynikami

## Testing Strategy

Same przebiegi Strykera i dopisane testy jednostkowe na luki widoczne dla rodzica.

## References

- `context/archive/2026-11-16-stryker-m6-cards/reviews/stryker-results.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Kodowanie

#### Automated

- [x] 1.1 Przebieg Strykera zakresu
- [x] 1.2 `npm test` i `npm run lint`

#### Manual

- [x] 1.3 Każdy ocalały mutant ma decyzję

### Phase 2: Cienie

#### Automated

- [x] 2.1 Przebieg Strykera zakresu
- [x] 2.2 `npm test` i `npm run lint`

#### Manual

- [x] 2.3 Każdy ocalały mutant ma decyzję

### Phase 3: Od najmniejszego

#### Automated

- [x] 3.1 Przebieg Strykera zakresu
- [x] 3.2 `npm test` i `npm run lint`

#### Manual

- [x] 3.3 Każdy ocalały mutant ma decyzję

### Phase 4: Labirynt liczbowy

#### Automated

- [x] 4.1 Przebieg Strykera zakresu
- [x] 4.2 `npm test` i `npm run lint`

#### Manual

- [x] 4.3 Każdy ocalały mutant ma decyzję

### Phase 5: Skopiuj obrazek (S-55)

#### Automated

- [x] 5.1 Przebieg Strykera zakresu
- [x] 5.2 `npm test` i `npm run lint`

#### Manual

- [x] 5.3 Każdy ocalały mutant ma decyzję

### Phase 6: Dokumentacja

#### Automated

- [x] 6.1 `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`

#### Manual

- [x] 6.2 Roadmapa i AGENTS.md zgodne z wynikami
