# Krytyczne ścieżki: testy z luk i celowany Stryker na nowych kartach Implementation Plan

## Overview

Raport `research.md` pokazał, że Stryker nie obejmuje żadnej nowej karty (symetria, sekwencje, sudoku, nonogram, dyktando), a kilka krytycznych reguł (jedno rozwiązanie sudoku i nonogramu, obrys dyktanda bez przecięć) ma luki w asercjach albo wyrocznię zależną od kodu produkcyjnego. Ten plan: najpierw konfiguracja Strykera w osobnych przebiegach, potem dla każdej karty testy zamykające znane luki (Faza 0 z raportu, tylko pozycje 1–3), a następnie celowany Stryker z przeglądem ocalałych mutantów jeden po jednym. Na końcu dane lokalne (`card-settings`, `active-profile`, `own-image-store`, `speech`) i aktualizacja `test-plan.md`. Decyzje użytkowniczki z 2026-10-27: A (Faza 0 tylko dla pozycji 1–3, reszta przez Strykera), B (zmienna środowiskowa dla ziaren oracle sekwencji tylko pod Strykerem), C (uszkodzony sąsiad profilu to osobna zmiana, tylko odnotowana).

## Current State Analysis

- `stryker.config.json` mutuje 5 plików (`maze/generate.ts`, `sheet/layout.ts`, `last-used.ts`, `child-profiles.ts`, `sheet/character.ts`) i uruchamia 5 testów (`commandRunner`, `coverageAnalysis: "off"`). Stryker 10 **nie** przyjmuje nadpisania komendy z linii poleceń (`error: unknown option '--commandRunner.command'`, sprawdzone 2026-10-27). Działa natomiast osobny plik konfiguracji z `--mutate` w CLI: `npx stryker run <config.json> --mutate "plik:start-end"` (próba na `card-settings.ts:94-107`: 9 mutantów, 9 zabitych, 6 s).
- Gęstość mutantów jest niższa niż szacunek z raportu (9 mutantów na 14 liniach, 21 na 7 liniach `favoriteDiffers`), więc czasy z raportu są górną granicą.
- `.gitignore` ignoruje już `.stryker-tmp` i `reports/mutation/`.
- Testy: `sequence/generate.test.ts` trwa ok. 47 s przez brute force 27^k wypełnień (`ORACLE_SEEDS = 120`, `generate.test.ts:20`, pętla `:160`, funkcja `fillingsThatFollowARule` `:98-108`). Dyktando: `dictationCardProblems` (`dictation/generate.ts:177`) bez testów negatywnych dla `repeated-vertex` i `no-commands`, `outside-margin` tylko z lewej strony (`generate.test.ts:167`). Sudoku: unikalność liczy wyłącznie produkcyjne `countSudokuSolutions` (`sudoku/generate.ts:160`); negatywne `shape-*` i `blank-count` tylko dla 4×4 (`generate.test.ts:241, 257, 264`). Nonogram: „jedno rozwiązanie” wynika z `solveNonogram`, a test porównuje go z samym sobą (`nonogram/generate.test.ts:98`); `solve.test.ts` ma tylko ręczne przykłady 5-komórkowe i 3×3.
- Wzorzec z S-31: test e2e/jednostkowy wolno uznać za dowód dopiero po break-checku (zepsuć kod, test ma zczerwienieć).

## Desired End State

- `stryker/` zawiera po jednym pliku konfiguracji na zakres (z własną komendą testów), skrypty npm do ich uruchamiania, a `stryker.config.json` pozostaje konfiguracją starego rdzenia. Każdy przebieg jest powtarzalny jedną komendą.
- Testy z luk (dyktando, sudoku, niezależna kontrola unikalności sudoku i nonogramu) są w `npm test` i przechodzą; każdy ma break-check.
- Dla każdego zakresu z raportu istnieje zapisany wynik Strykera (score, liczba ocalałych) i decyzja dla każdego ocalałego mutanta: asercja dopisana (błąd widoczny dla rodzica albo zmieniający wynik karty) albo odnotowany jako równoważny/kosmetyczny w `test-plan.md` §5.
- `test-plan.md`: ryzyko 9 i §5 z wynikami Strykera i lukami zamkniętymi; wzmianka o osobnej zmianie dla uszkodzonego sąsiada profilu (C).

### Key Discoveries:

- `src/lib/sequence/generate.test.ts:20,160` — ziarna oracle są stałą; zmienna środowiskowa zmieni tylko tę stałą.
- `src/lib/sudoku/generate.ts:160,217,301-350` — solver, carve i `sudokuCardProblems` (kody `not-unique`, `blank-count`, `shape-*`, `invalid-solution`).
- `src/lib/dictation/generate.ts:177-248` — kody `no-commands`, `bad-length`, `same-direction`, `not-closed`, `repeated-vertex`, `outside-margin`, `not-the-outline`.
- `src/lib/nonogram/solve.ts` (139 linii) — `solveLine`, `solveNonogram` (statusy `solved`, `stuck`, `contradiction`).
- Stryker 10: osobny plik konfiguracji + `--mutate` w CLI (potwierdzone), bez nadpisania komendy z CLI.

## What We're NOT Doing

- Uszkodzony sąsiad profilu przy odczycie i zapisie (decyzja C): osobna zmiana, tu tylko wzmianka w `test-plan.md`.
- Poprawka opisu Poziomu 3 sekwencji (`src/lib/sequence/levels.ts:66`), emulacja druku/liczba stron w Playwright, dedykowane e2e dyktanda i nonogramu, testy hooków React, test przekroczonej kwoty `localStorage`.
- Gonienie 100% wyniku Strykera; mutowanie plików z danymi obiektów (`symmetry/objects/*`).
- Zmiany zachowania produktu: jeśli ocalały mutant ujawni błąd w kodzie produkcyjnym, odnotowujemy go jako osobną poprawkę, nie naprawiamy w tej zmianie bez decyzji użytkowniczki.
- Pełny przebieg Strykera w CI (to narzędzie lokalne, selektywne).

## Implementation Approach

Sześć faz, każda z własnym PR-em. Faza 1 to infrastruktura (konfiguracje, skrypty, zmienna ziaren) i szybki dowód działania na jednym małym zakresie. Fazy 2–5 mają ten sam rytm: (a) testy z luk dla obszaru, każdy z break-checkiem, (b) przebieg Strykera na zakresie, (c) przegląd ocalałych mutantów po kolei z decyzją, (d) asercje tylko tam, gdzie błąd widzi rodzic albo zmienia wynik karty, (e) ponowny przebieg potwierdzający. Faza 6 zamyka dane lokalne i aktualizuje `test-plan.md`. Wyniki każdej fazy trafiają do `reviews/stryker-results.md` w folderze zmiany (tabela: zakres, mutanty, ocalałe, decyzje), a podsumowanie do `test-plan.md` w fazie 6.

## Phase 1: Konfiguracja Strykera w przebiegach

### Overview

Każdy zakres z raportu da się uruchomić jedną komendą, a test sekwencji ma szybki tryb pod Strykerem.

### Changes Required:

#### 1. Pliki konfiguracji zakresów

**File**: `stryker/dictation.config.json`, `stryker/sudoku.config.json`, `stryker/nonogram.config.json`, `stryker/sequence.config.json`, `stryker/symmetry.config.json`, `stryker/local-data.config.json`

**Intent**: Osobna konfiguracja na zakres z własnym `commandRunner.command` (tylko testy tego zakresu), `mutate` z zakresami linii z raportu i `reporters` clear-text i html (do `reports/mutation/`); reszta ustawień jak w `stryker.config.json`.

**Contract**: Uruchomienie `npx stryker run stryker/<zakres>.config.json`; `--mutate "plik:start-end"` w CLI nadpisuje zakres do wąskiego przebiegu. Komendy testów zawierają wyłącznie pliki z `npm test` danego obszaru (dictation: `generate`, `outline`, `layout`, `levels`; sudoku: `generate`, `levels`, `shapes`; nonogram: `solve`, `clues`, `simple`, `generate`, `sizes`; sequence: `generate`, `levels`; symmetry: `generate`, `templates`; local-data: `card-settings`, `active-profile`, `own-image-store`, `speech`).

#### 2. Skrypty npm

**File**: `package.json`

**Intent**: Skrót `npm run mutate:<zakres>` dla każdego pliku z `stryker/`, bez zmiany skryptu `test`.

**Contract**: skrypty `mutate:dictation`, `mutate:sudoku`, `mutate:nonogram`, `mutate:sequence`, `mutate:symmetry`, `mutate:local-data`, każdy `stryker run stryker/<zakres>.config.json`.

#### 3. Szybki oracle sekwencji pod Strykerem

**File**: `src/lib/sequence/generate.test.ts`, `stryker/sequence.config.json`

**Intent**: Koszt brute-force oracle sekwencji czytany ze zmiennej środowiskowej; domyślnie jak dziś (120 ziaren i pełne `fixedRows` × zestawy luk, więc `npm test` bez zmian), a konfiguracja Strykera ustawia małą wartość. Drogie są dwa testy, nie jeden: pętla po ziarnach (`generate.test.ts:20,160`) oraz test „walidator nazywa wiersz dwuznacznym dokładnie wtedy, gdy oracle znajduje więcej niż jedno wypełnienie” (`:445`, `fixedRows` × zestawy luk × 27^k); zmienna musi ograniczać oba (np. mniej ziaren i podzbiór `fixedRows`), a podzbiór ma nadal zawierać przypadki jednoznaczne i dwuznaczne.

**Contract**: `ORACLE_SEEDS = Number(process.env.SEQUENCE_ORACLE_SEEDS ?? 120)`; komenda w `stryker/sequence.config.json` ustawia `SEQUENCE_ORACLE_SEEDS` (np. `10`) przez `node -e`/prefiks zgodny z Windows i Linuksem (zmienna ustawiona w `commandRunner.command` w sposób niezależny od powłoki, np. przez skrypt `scripts/with-env.mjs` jeśli `cross-env` niedostępny). Decyzja o sposobie ustawienia zmiennej zapada w implementacji i jest zapisana w `reviews/stryker-results.md`.

#### 4. Dowód działania

**File**: `context/changes/critical-paths-mutation-testing/reviews/stryker-results.md`

**Intent**: Pierwszy wpis: wąski przebieg `local-data` na `card-settings.ts:94-107` (9 z 9 zabitych, z próby planu) potwierdza, że potok działa; dalsze wpisy dodają kolejne fazy.

**Contract**: tabela `zakres | plik:linie | mutanty | zabite | ocalałe | decyzja`.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint i typy: `npm run lint`, `npx astro check`
- Każdy `npm run mutate:<zakres>` startuje i kończy się wynikiem na wąskim zakresie (np. `-- --mutate "src/lib/card-settings.ts:94-107"` dla `local-data`)
- Szybki oracle sekwencji: czas komendy z `stryker/sequence.config.json` jest zmierzony i zapisany w `stryker-results.md` (cel: kilkanaście sekund; jeśli nie do osiągnięcia bez utraty przypadków dwuznacznych, zapisujemy faktyczny czas i szacunek całego przebiegu)

#### Manual Verification:

- `stryker.config.json` (stary rdzeń) działa jak dotąd po zmianie pakietu skryptów
- Opis w `reviews/stryker-results.md` pozwala powtórzyć przebieg bez znajomości kontekstu

**Implementation Note**: Po fazie zatrzymaj się na potwierdzenie ręczne.

---

## Phase 2: Dyktando: testy negatywne i Stryker

### Overview

Walidator dyktanda ma negatywne testy każdej reguły, a mutacje `dictation/generate.ts` i `dictation/outline.ts` mają przejrzane ocalałe mutanty.

### Changes Required:

#### 1. Testy negatywne walidatora

**File**: `src/lib/dictation/generate.test.ts`

**Intent**: Dla ręcznie zbudowanych kart sprawdzić, że `dictationCardProblems` zgłasza dokładnie właściwy kod: `repeated-vertex` (obrys przecinający się i dotykający siebie w narożniku), `no-commands`, `outside-margin` z czterech stron kratki, `not-the-outline` dla obrysu w kierunku przeciwnym do ruchu wskazówek zegara, a także test, że poprawna ręczna karta nie zgłasza nic.

**Contract**: bez zmian w kodzie produkcyjnym; każdy test ma break-check (usunięcie warunku w `generate.ts` czerwieni test).

#### 2. Przebieg Strykera i przegląd

**File**: `stryker/dictation.config.json`, `reviews/stryker-results.md`

**Intent**: Uruchomić `mutate:dictation` na `generate.ts:177-248` i `outline.ts:120-260`; każdy ocalały mutant dostaje decyzję (asercja albo wpis „równoważny/kosmetyczny”), po asercjach ponowny przebieg.

**Contract**: wynik i lista decyzji w `stryker-results.md`; nowe asercje tylko dla błędów widocznych dla rodzica (zła, przecinająca się albo ucięta karta) lub zmieniających wynik karty.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`
- `npm run mutate:dictation` kończy się, a wynik jest zapisany w `stryker-results.md`
- Break-check: usunięcie reguły `repeated-vertex` w `dictationCardProblems` czerwieni nowy test

#### Manual Verification:

- Każdy ocalały mutant ma zapisaną decyzję z uzasadnieniem w jednym zdaniu

---

## Phase 3: Sudoku: negatywne testy, niezależna kontrola unikalności i Stryker

### Overview

Walidacja sudoku jest sprawdzana negatywnie także dla 6×6 i 9×9, a unikalność rozwiązania ma niezależnego brute-force; potem Stryker na generatorze.

### Changes Required:

#### 1. Negatywne testy walidacji

**File**: `src/lib/sudoku/generate.test.ts`

**Intent**: Karty 6×6 i 9×9 z błędną liczbą pustych pól (`blank-count`), kształtami spoza puli i złą liczbą kształtów (`shape-outside-pool`, `shape-count`), niedopasowanym poziomem oraz naruszeniami kolumny i bloku (`invalid-solution`) — każda zgłasza właściwy kod.

**Contract**: ręcznie budowane karty (bez generatora jako źródła oczekiwań).

#### 2. Niezależny brute-force unikalności

**File**: `src/lib/sudoku/generate.test.ts` (lub nowy `src/lib/sudoku/bruteforce.test.ts` dopisany do skryptu `test`), `package.json`

**Intent**: Prosty, własny licznik rozwiązań (przeszukiwanie wszystkich uzupełnień) dla małych plansz 4×4 porównywany z `countSudokuSolutions` na zbiorze wygenerowanych kart i ręcznych przypadków dwurozwiązaniowych.

**Contract**: licznik niezależny od `sudoku/generate.ts` (żadnych importów solvera); dla 4×4 wszystkie wygenerowane karty mają dokładnie jedno rozwiązanie według obu.

#### 3. Przebieg Strykera i przegląd

**File**: `stryker/sudoku.config.json`, `reviews/stryker-results.md`

**Intent**: `mutate:sudoku` na `sudoku/generate.ts:160-250` i `295-353`; decyzja dla każdego ocalałego mutanta, asercje tylko wg reguły, ponowny przebieg.

**Contract**: wynik w `stryker-results.md`.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`
- `npm run mutate:sudoku` kończy się i wynik jest zapisany
- Break-check: zepsucie `countSudokuSolutions` (np. zwracanie 1) czerwieni test brute-force; usunięcie `blank-count` czerwieni test 6×6

#### Manual Verification:

- Czas `npm test` nie rośnie o więcej niż kilka sekund

---

## Phase 4: Nonogram: niezależna kontrola i Stryker

### Overview

Solver nonogramu ma niezależną wyrocznię na małych siatkach; potem Stryker na `solve.ts`, `generate.ts` i `simple.ts`.

### Changes Required:

#### 1. Niezależna wyrocznia

**File**: `src/lib/nonogram/solve.test.ts` (lub nowy plik dopisany do skryptu `test`), `package.json`

**Intent**: Dla linii do 8 komórek porównać `solveLine` z wyliczeniem wszystkich ułożeń bloków (komórki wspólne dla wszystkich ułożeń są zdeterminowane); dla siatek do 4×4/5×5 policzyć wszystkie obrazki zgodne z wskazówkami i sprawdzić, że `solved` ⇔ dokładnie jeden obrazek, a `stuck` ⇒ więcej niż jeden albo wymaga zgadywania; osobny przypadek wielorundowej propagacji.

**Contract**: wyrocznia niezależna od `solve.ts`; ręczne przykłady zostają.

#### 2. Przebieg Strykera i przegląd

**File**: `stryker/nonogram.config.json`, `reviews/stryker-results.md`

**Intent**: `mutate:nonogram` na `solve.ts` oraz `generate.ts:40-123` i `simple.ts`; decyzje dla ocalałych, asercje wg reguły (m.in. granica 7 znaczków i sąsiad po przekątnej w `simple.ts`, jeśli ocalały mutant to wskaże), ponowny przebieg.

**Contract**: wynik w `stryker-results.md`; czas pełnego `nonogram/generate.test.ts` (ok. 7 s) uwzględniony w komendzie.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`
- `npm run mutate:nonogram` kończy się i wynik jest zapisany
- Break-check: osłabienie `solveLine` (pominięcie jednej reguły) czerwieni test wyroczni

#### Manual Verification:

- Czas dodatkowych testów w `npm test` jest akceptowalny (rząd sekund)

---

## Phase 5: Sekwencje i symetria: Stryker

### Overview

Reguły i walidator sekwencji oraz generator symetrii mają przejrzane ocalałe mutanty.

### Changes Required:

#### 1. Przebieg sekwencji

**File**: `stryker/sequence.config.json`, `reviews/stryker-results.md`; testy w `src/lib/sequence/*.test.ts` w razie potrzeby

**Intent**: `mutate:sequence` na `sequence/rules.ts` i `sequence/generate.ts:137-238` z krótkim oracle (zmienna z fazy 1); jeśli ocalałe mutanty pokażą brak testu bezpośredniego `hypotheses`/`followsRule`, dopisać test jednostkowy; przed zaufaniem krótkiemu oracle sprawdzić, że wynik pełnego oracle (120 ziaren) nie zabija więcej mutantów na wybranej próbce.

**Contract**: wynik w `stryker-results.md`; `npm test` nadal używa 120 ziaren.

#### 2. Przebieg symetrii

**File**: `stryker/symmetry.config.json`, `reviews/stryker-results.md`; testy w `src/lib/symmetry/generate.test.ts` w razie potrzeby

**Intent**: `mutate:symmetry` na `symmetry/generate.ts:75-300`; asercje wg reguły (m.in. rozłączność wzoru i odbicia na wygenerowanych kartach, kategoria, gałąź braku szablonów, jeśli ocalały mutant to wskaże).

**Contract**: wynik w `stryker-results.md`.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`
- `npm run mutate:sequence` i `npm run mutate:symmetry` kończą się i wyniki są zapisane
- Break-check dla każdej nowej asercji

#### Manual Verification:

- Porównanie krótkiego i pełnego oracle sekwencji zapisane w `stryker-results.md`

---

## Phase 6: Dane lokalne i test-plan

### Overview

Parsowanie ustawień i zapis własnego obrazka mają przejrzane mutanty, a `test-plan.md` odzwierciedla wyniki.

### Changes Required:

#### 1. Przebieg danych lokalnych

**File**: `stryker/local-data.config.json`, `reviews/stryker-results.md`; testy `src/lib/*.test.ts` w razie potrzeby

**Intent**: `mutate:local-data` na `card-settings.ts`, `active-profile.ts`, `sheet/own-image-store.ts`, `sheet/speech.ts` (komenda z `card-settings.test.ts`); decyzje dla ocalałych, asercje dla błędów utraty danych lub złej karty.

**Contract**: wynik w `stryker-results.md`.

#### 2. Aktualizacja test-planu

**File**: `context/foundation/test-plan.md`

**Intent**: §5: tabela wyników Strykera (zakres, mutanty, ocalałe, decyzje) i zamknięte luki; ryzyko 9: status pokrycia niezależną wyrocznią; §7 i wzmianka o osobnej zmianie dla uszkodzonego sąsiada profilu (decyzja C) oraz o zdefiniowanych poza zakresem punktach (opis Poziomu 3, emulacja druku, e2e dyktanda i nonogramu).

**Contract**: `checked` zaktualizowane; fazy z §3 dopisane, jeśli dotyczy.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, prettier
- `npm run mutate:local-data` kończy się i wynik jest zapisany

#### Manual Verification:

- `test-plan.md` zgadza się z `stryker-results.md`

---

## Testing Strategy

### Unit Tests:

- Negatywne testy walidatorów dyktanda i sudoku na ręcznych kartach; niezależne brute-force dla sudoku i nonogramu; dodatkowe asercje tylko po przeglądzie ocalałych mutantów.

### Integration Tests:

- Bez nowych e2e (poza zakresem); istniejące e2e nie zmieniają się.

### Manual Testing Steps:

1. `npm run mutate:<zakres>` na wąskim zakresie pokazuje wynik w terminalu i raport HTML.
2. Dla każdego nowego testu: zepsuć kod produkcyjny, test czerwienieje, przywrócić.

## Performance Considerations

- `npm test` rośnie tylko o testy negatywne i niewielkie brute-force (małe siatki); sprawdzamy czas po fazach 3 i 4.
- Przebiegi Strykera są lokalne i selektywne; szacunki czasu z raportu to górna granica (gęstość mutantów jest niższa).

## Migration Notes

Brak zmian w danych ani w kodzie produktu.

## References

- Raport: `context/changes/critical-paths-mutation-testing/research.md`
- Mapa ryzyk: `context/foundation/test-plan.md` (§2, §5)
- Reguły Strykera: `AGENTS.md` ("Mutation testing")
- Poprzedni wąski przebieg: `favoriteDiffers` (`src/lib/child-profiles.ts:165-171`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Konfiguracja Strykera w przebiegach

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — c3ad524
- [x] 1.2 Lint i typy: `npm run lint`, `npx astro check` — c3ad524
- [x] 1.3 Każdy `npm run mutate:<zakres>` startuje i kończy się wynikiem na wąskim zakresie
- [x] 1.4 Szybki oracle sekwencji: czas komendy z `stryker/sequence.config.json` jest zmierzony i zapisany w `stryker-results.md` (cel: kilkanaście sekund) — c3ad524

#### Manual

- [x] 1.5 `stryker.config.json` (stary rdzeń) działa jak dotąd po zmianie skryptów — c3ad524
- [x] 1.6 Opis w `reviews/stryker-results.md` pozwala powtórzyć przebieg bez znajomości kontekstu — c3ad524

### Phase 2: Dyktando: testy negatywne i Stryker

#### Automated

- [x] 2.1 `npm test`, `npm run lint`, `npx astro check` — 280eef9
- [x] 2.2 `npm run mutate:dictation` kończy się, wynik zapisany w `stryker-results.md` — 280eef9
- [x] 2.3 Break-check: usunięcie reguły `repeated-vertex` w `dictationCardProblems` czerwieni nowy test — 280eef9

#### Manual

- [x] 2.4 Każdy ocalały mutant ma zapisaną decyzję z uzasadnieniem — 280eef9

### Phase 3: Sudoku: negatywne testy, niezależna kontrola unikalności i Stryker

#### Automated

- [x] 3.1 `npm test`, `npm run lint`, `npx astro check` — 4ce99db
- [x] 3.2 `npm run mutate:sudoku` kończy się, wynik zapisany — 4ce99db
- [x] 3.3 Break-check: zepsucie `countSudokuSolutions` czerwieni test brute-force; usunięcie `blank-count` czerwieni test 6×6 — 4ce99db

#### Manual

- [x] 3.4 Czas `npm test` nie rośnie o więcej niż kilka sekund — 4ce99db

### Phase 4: Nonogram: niezależna kontrola i Stryker

#### Automated

- [x] 4.1 `npm test`, `npm run lint`, `npx astro check` — 88046f1
- [x] 4.2 `npm run mutate:nonogram` kończy się, wynik zapisany — 88046f1
- [x] 4.3 Break-check: osłabienie `solveLine` czerwieni test wyroczni — 88046f1

#### Manual

- [x] 4.4 Czas dodatkowych testów w `npm test` jest akceptowalny — 88046f1

### Phase 5: Sekwencje i symetria: Stryker

#### Automated

- [x] 5.1 `npm test`, `npm run lint`, `npx astro check` — e6170b0
- [x] 5.2 `npm run mutate:sequence` i `npm run mutate:symmetry` kończą się, wyniki zapisane — e6170b0
- [x] 5.3 Break-check dla każdej nowej asercji — e6170b0

#### Manual

- [x] 5.4 Porównanie krótkiego i pełnego oracle sekwencji zapisane w `stryker-results.md` — e6170b0

### Phase 6: Dane lokalne i test-plan

#### Automated

- [ ] 6.1 `npm test`, `npm run lint`, `npx astro check`, prettier
- [ ] 6.2 `npm run mutate:local-data` kończy się, wynik zapisany

#### Manual

- [ ] 6.3 `test-plan.md` zgadza się z `stryker-results.md`
