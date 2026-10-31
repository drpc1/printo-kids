# Stryker na starym rdzeniu: labirynt, układ kartki, profile, postać, ostatnie parametry — plan

## Overview

Pięć modułów starego rdzenia (`maze/generate.ts`, `sheet/layout.ts`, `last-used.ts`, `child-profiles.ts`, `sheet/character.ts`) ma tylko rootowy `stryker.config.json`, ostatnio sprawdzany 2026-10-11. Od tego czasu moduły mocno się zmieniły. Zmiana zapisuje wynik „przed”, przegląda ocalałe mutanty, dopisuje testy tylko dla błędów widocznych dla rodzica i zapisuje wynik „po”. Konfiguracja przechodzi na wzór `stryker/<zakres>.config.json` ze skryptem `npm run mutate:maze`.

## Current State Analysis

- `stryker.config.json` mutuje pięć plików w całości; komenda to `node --experimental-strip-types --test` na pięciu plikach testów, bez `scripts/with-env.mjs` i bez `MUTATION_RUN`.
- Te pięć plików testów to 142 testy, ok. 15 s na jeden przebieg. Każdy mutant uruchamia je od nowa, więc pełny baseline trwa długo i idzie w tle.
- Sześć zakresów z `critical-paths-mutation-testing` ma `stryker/*.config.json`, skrypt `mutate:<zakres>` i `MUTATION_RUN=1` przez `scripts/with-env.mjs` (`package.json:15-20`).
- `src/lib/maze/generate.test.ts:191-197` ma asercję czasu (`< 500` ms na labirynt Poziomu 6). Pod Strykerem kod jest wolniejszy, więc asercja musi się wyłączać przy `MUTATION_RUN`, jak w `src/lib/nonogram/generate.test.ts:18,118`.
- gh114 (zmergowany, `context/archive/2026-10-30-gh114-maze-too-easy/`) miał krok 1.5 „zawężony Stryker na `scoreMaze` i `generateMaze`”, ale w archiwum nie ma liczb ani decyzji dla mutantów. Wynik „przed” z tej zmiany obejmuje więc cały `generate.ts`.
- `context/foundation/test-plan.md` §5a opisuje sześć zakresów w tabeli, a `stryker.config.json` występuje tam w linii 83. Raport pozostałych zakresów: `context/archive/2026-10-27-critical-paths-mutation-testing/reviews/stryker-results.md`.

## Desired End State

- `stryker/maze.config.json` i `npm run mutate:maze`; rootowy `stryker.config.json` usunięty.
- `context/changes/gh224-stryker-on-new-maze/reviews/stryker-results.md` ma wynik przed i po dla każdego modułu oraz decyzję dla każdego ocalałego mutanta z `maze/generate.ts` i `child-profiles.ts` (asercja albo „równoważny/kosmetyczny” z jednym zdaniem). Dla `layout.ts`, `character.ts`, `last-used.ts` decyzję dostają tylko mutanty widoczne dla rodzica; reszta jest policzona zbiorczo.
- `test-plan.md` §5a ma wiersz „labirynt i profile” z wynikiem przed i po.
- `npm test`, `npm run lint`, `npx astro check` są zielone, a czas `npm test` rośnie o kilka sekund co najwyżej.

### Key Discoveries:

- Rootowy config nie ustawia `MUTATION_RUN`, a test czasu labiryntu (`generate.test.ts:196`) może wtedy czerwienić się przez narzut instrumentacji, nie przez błąd.
- `test` w `package.json` wylicza pliki testów; nowe pliki testów trzeba tam dopisać (inaczej `npm test` ich nie uruchomi).
- Wynik Strykera nie jest bramką CI (`test-plan.md` §5a); skrypt nie wchodzi do `ci.yml`.

## What We're NOT Doing

- Gonienia 100% wyniku Strykera.
- Zmian zachowania produktu: błąd w kodzie wykryty przez mutanta zapisujemy jako osobną poprawkę.
- Uszkodzonego sąsiada profilu (osobna zmiana, `test-plan.md` §7).
- Dodawania Strykera do CI.
- Pełnej decyzji dla każdego ocalałego mutanta w `layout.ts`, `character.ts`, `last-used.ts` (druga kolejność).

## Implementation Approach

Najpierw konfiguracja i bramka czasu, potem jeden pełny baseline bez zmian w testach (czysty wynik „przed”), potem triage w kolejności z issue: `maze/generate.ts`, `child-profiles.ts`, na końcu reszta. Każdy nowy test przechodzi break-check (zepsuć kod, test czerwienieje, przywrócić). Wynik „po” to wąskie przebiegi na zmienionych zakresach, a nie drugi pełny baseline, chyba że czas pozwala.

## Faza 1: Konfiguracja zakresu `maze`

### Overview

Przenieść konfigurację do wzoru `stryker/<zakres>.config.json` i naprawić bramkę czasu pod Strykerem.

### Changes Required:

#### 1. Konfiguracja Strykera

**File**: `stryker/maze.config.json`, `stryker.config.json` (usunięcie), `package.json`

**Intent**: Te same pięć modułów i te same pliki testów co dziś, w formacie jak `stryker/local-data.config.json`, uruchamiane przez `scripts/with-env.mjs MUTATION_RUN=1`.

**Contract**: skrypt `"mutate:maze": "stryker run stryker/maze.config.json"`; `mutate` to pięć plików w całości; wąski przebieg przez `-- --mutate "plik:start-end"`.

#### 2. Bramka czasu w teście labiryntu

**File**: `src/lib/maze/generate.test.ts`

**Intent**: Asercja „Poziom 6 w dobrze poniżej sekundy” nie liczy czasu pod Strykerem.

**Contract**: `MUTATION_RUN` czytane jak w `src/lib/nonogram/generate.test.ts:16-18`; asercja `MUTATION_RUN || ...`. Zwykłe `npm test` zachowuje budżet.

#### 3. Odwołania do starej konfiguracji

**File**: `context/foundation/test-plan.md` (linia 83 i okolice §5a)

**Intent**: Poprawić odwołanie do `stryker.config.json` na `stryker/maze.config.json` / `npm run mutate:maze`.

**Contract**: tylko tekst; wiersz wyników wchodzi w Fazie 4.

### Success Criteria:

#### Automated Verification:

- `npm run mutate:maze -- --dryRunOnly` przechodzi (testy bazowe zielone pod `MUTATION_RUN=1`)
- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Brak rootowego pliku: `test ! -f stryker.config.json`
- Czas `npm test` na czystym stanie zapisany w `reviews/stryker-results.md` przed zmianą testów (punkt odniesienia dla kryterium 3.6)

#### Manual Verification:

- `stryker/maze.config.json` wygląda jak pozostałe konfiguracje zakresów

**Implementation Note**: po tej fazie i zielonych testach pauza na potwierdzenie.

---

## Faza 2: Baseline „przed”

### Overview

Jeden pełny przebieg `mutate:maze` na obecnym kodzie, bez żadnych zmian w testach ani kodzie.

### Changes Required:

#### 1. Wynik „przed”

**File**: `context/changes/gh224-stryker-on-new-maze/reviews/stryker-results.md`

**Intent**: Zapisać liczbę mutantów, wynik i liczbę ocalałych osobno dla każdego z pięciu modułów, plus czas przebiegu i komendę do powtórzenia.

**Contract**: przebieg w tle (`npm run mutate:maze`), raport HTML w `reports/mutation/` (ignorowany przez git); lista ocalałych (plik:linia, mutator) przepisana do raportu zmiany jako tabela do triage.

### Success Criteria:

#### Automated Verification:

- Przebieg kończy się bez błędu: `npm run mutate:maze`
- Raport zawiera wiersz przed dla każdego z pięciu modułów

#### Manual Verification:

- Wynik „przed” jest zapisany przed pierwszą zmianą w testach

---

## Faza 3: Triage `maze/generate.ts` i `child-profiles.ts`

### Overview

Przejrzeć ocalałe mutanty po kolei: najpierw labirynt (ryzyko 1: jedna droga start–meta), potem profile (ryzyko 5: zapis i usuwanie).

### Changes Required:

#### 1. Decyzje i testy

**File**: `src/lib/maze/generate.test.ts`, `src/lib/child-profiles.test.ts`, `context/changes/gh224-stryker-on-new-maze/reviews/stryker-results.md`

**Intent**: Dla każdego ocalałego mutanta decyzja: asercja, gdy mutant to widoczny dla rodzica błąd (zła karta, labirynt bez jednej drogi, utrata danych profilu) albo zmiana wyniku karty; w przeciwnym razie „równoważny/kosmetyczny” z jednym zdaniem. Mutanty w `scoreMaze` i `generateMaze` (zakres gh114) przeglądane tak samo, bo gh114 nie zostawił decyzji.

**Contract**: nowe testy w istniejących plikach (wzór z testów w tych plikach); każdy nowy test ma break-check zapisany w raporcie (mutacja ręczna, czerwony test, przywrócenie). Błąd produktu wykryty przez mutanta: wpis w raporcie jako osobna poprawka, bez zmiany kodu produkcyjnego tutaj.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy: `npx astro check`
- Każdy ocalały mutant z obu modułów ma wpis decyzji w raporcie

#### Manual Verification:

- Przegląd decyzji „równoważny/kosmetyczny” — zdania uzasadnienia mają sens
- Czas `npm test` rośnie o kilka sekund co najwyżej (porównanie z wartością sprzed zmiany)

---

## Faza 4: Reszta, wynik „po” i dokumentacja

### Overview

`layout.ts`, `character.ts`, `last-used.ts` w drugiej kolejności; wynik „po” i wpis do test-planu.

### Changes Required:

#### 1. Triage drugiej kolejności

**File**: `src/lib/sheet/layout.test.ts`, `src/lib/sheet/character.test.ts`, `src/lib/last-used.test.ts`

**Intent**: Asercja tylko dla ocalałych mutantów widocznych dla rodzica (np. postać na Poziomie 6 poza kartą, utrata zapamiętanego ustawienia); reszta zbiorczo jako kosmetyczna.

**Contract**: jak w Fazie 3, z break-checkiem.

#### 2. Wynik „po” i test-plan

**File**: `context/changes/gh224-stryker-on-new-maze/reviews/stryker-results.md`, `context/foundation/test-plan.md` §5a

**Intent**: Wąskie przebiegi `npm run mutate:maze -- --mutate "plik:start-end"` na zmienionych zakresach (albo pełny, jeśli czas pozwala) i wiersz „labirynt i profile” w tabeli §5a z wynikiem przed i po.

**Contract**: wiersz w tym samym formacie co istniejące (Zakres, Ryzyko, Mutanty, Wynik przed, Wynik po, Ocalałe przed → po); ryzyka 1 i 5.

### Success Criteria:

#### Automated Verification:

- Testy: `npm test`
- Lint: `npm run lint`
- Typy: `npx astro check`
- Format: `npm run format`

#### Manual Verification:

- Raport ma wynik przed i po dla wybranych modułów
- Tabela §5a ma nowy wiersz

---

## Testing Strategy

### Unit Tests:

- Nowe asercje tylko z ocalałych mutantów widocznych dla rodzica; każda z break-checkiem.
- Ręczne karty i ręcznie policzone liczby, a nie wynik generatora jako oczekiwanie (wzór z `critical-paths-mutation-testing`).

### Integration Tests:

- Brak nowych; `npm test` jako całość.

### Manual Testing Steps:

1. Sprawdzić `reports/mutation/` po baseline (raport się otwiera).
2. Dla jednego nowego testu zepsuć kod ręcznie i zobaczyć czerwony test.

## Performance Considerations

Pełny baseline: ok. 15 s na mutanta przy 4 procesach, rząd godziny lub więcej; idzie w tle. `npm test` nie rośnie o więcej niż kilka sekund; nowe testy maze nie powtarzają pętli po 200 ziarnach.

## References

- Issue: GitHub 224
- Wzór konfiguracji: `stryker/local-data.config.json`, `package.json:15-20`
- Bramka czasu: `src/lib/nonogram/generate.test.ts:16-18`
- Poprzednie wyniki: `context/archive/2026-10-27-critical-paths-mutation-testing/reviews/stryker-results.md`
- gh114: `context/archive/2026-10-30-gh114-maze-too-easy/plan.md` (krok 1.5)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Konfiguracja zakresu `maze`

#### Automated

- [x] 1.1 `npm run mutate:maze -- --dryRunOnly` przechodzi (testy bazowe zielone pod `MUTATION_RUN=1`) — 6dda780
- [x] 1.2 Testy przechodzą: `npm test` — 6dda780
- [x] 1.3 Lint przechodzi: `npm run lint` — 6dda780
- [x] 1.4 Brak rootowego pliku: `test ! -f stryker.config.json` — 6dda780
- [x] 1.6 Czas `npm test` na czystym stanie zapisany w `reviews/stryker-results.md` przed zmianą testów — 6dda780

#### Manual

- [x] 1.5 `stryker/maze.config.json` wygląda jak pozostałe konfiguracje zakresów — 6dda780

### Phase 2: Baseline „przed”

#### Automated

- [x] 2.1 Przebieg kończy się bez błędu: `npm run mutate:maze` — 8eef2e5
- [x] 2.2 Raport zawiera wiersz przed dla każdego z pięciu modułów — 8eef2e5

#### Manual

- [x] 2.3 Wynik „przed” jest zapisany przed pierwszą zmianą w testach — 8eef2e5

### Phase 3: Triage `maze/generate.ts` i `child-profiles.ts`

#### Automated

- [x] 3.1 Testy przechodzą: `npm test` — d0a230c
- [x] 3.2 Lint przechodzi: `npm run lint` — d0a230c
- [x] 3.3 Typy: `npx astro check` — d0a230c
- [x] 3.4 Każdy ocalały mutant z obu modułów ma wpis decyzji w raporcie

#### Manual

- [x] 3.5 Przegląd decyzji „równoważny/kosmetyczny” — zdania uzasadnienia mają sens — d0a230c
- [x] 3.6 Czas `npm test` rośnie o kilka sekund co najwyżej (porównanie z wartością sprzed zmiany) — d0a230c

### Phase 4: Reszta, wynik „po” i dokumentacja

#### Automated

- [x] 4.1 Testy: `npm test` — decc961
- [x] 4.2 Lint: `npm run lint` — decc961
- [x] 4.3 Typy: `npx astro check` — decc961
- [x] 4.4 Format: `npm run format` — decc961

#### Manual

- [x] 4.5 Raport ma wynik przed i po dla wybranych modułów — decc961
- [x] 4.6 Tabela §5a ma nowy wiersz — decc961
