<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: S-36 Karta „Szlaczki” (cały plan, po scaleniu #344–#348)

- **Plan**: context/archive/2026-11-09-pattern-lines-card/plan.md
- **Scope**: Full plan (fazy 1–3; faza 4 celowo odłożona)
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-11-10
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical 2 warnings 3 observations

Przegląd zrobiony po scaleniu, na kodzie z `main` (w tym PR #348: pętle w dół zamiast kółeczek). Dwóch recenzentów tylko czytało kod (dryf od planu, bezpieczeństwo i jakość); wyniki bramek (`npm test` 1499, lint, depcruise, `astro check`, build, e2e `patterns*`) pochodzą z wcześniejszych uruchomień przy PR-ach. Raport zapisany ręcznie w archiwum, bo skill nie dopisuje do zarchiwizowanych zmian.

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | PASS    |

Dryf od planu: brak MISSING. Drobne DRIFT/EXTRA opisane w F4.

## Findings

### F1 — `patternLinesProblems` może rzucić wyjątek na wadliwej karcie

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/pattern-lines/card.ts (`outOfRow`, `patternLinesProblems`), src/lib/pattern-lines/paths.ts (`rowGeometry`)
- **Detail**: `outOfRow` woła `rowGeometry` dla każdego wiersza, zanim wynik `trace-repeats` wyłączy dalszą geometrię. Przy `traced` ≤ 0 albo NaN na P3–P4 ścieżka jest pusta i `rowGeometry` czyta `path[0].x` (TypeError); `count` nie ma górnego limitu (np. 1e7 liczyłoby się bardzo długo). Dziś `problems` dostaje tylko karty z generatora, więc to ryzyko teoretyczne, ale kontrakt `CardSpec.problems` powinien być totalny. (Wniosek recenzenta z czytania kodu, nie odtworzony testem: PLAUSIBLE.)
- **Fix**: W `outOfRow` najpierw walidować `count` (całkowite, z górnym limitem), `traced` (`0 <= traced <= count`) i `period` (skończony, > 0) i zwracać `true` przed `rowGeometry`; dodać guard na pustą ścieżkę i test `knownBad`/jednostkowy z `traced: 0`.
- **Decision**: PENDING (propozycja: mały PR po wydruku)

### F2 — Generator strony nie pilnuje `waitingForChild` jak wzorzec

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/PatternLinesGenerator.tsx (`handleLevelSelect`, przełącznik „Linie”)
- **Detail**: `CopyDrawingGenerator` i `SudokuGenerator` wychodzą przy `waitingForChild` przed `memory.remember`. Tu zmiana poziomu zapisuje ustawienie zawsze (pomija tylko przeładowanie karty), a „Linie” nie dostaje `disabled={waitingForChild}`. Przy otwartym wyborze profilu ustawienie może trafić do niewłaściwego profilu. Zweryfikowane grepem `waitingForChild` w trzech komponentach.
- **Fix**: Wyjść z `handleLevelSelect` przed `remember` przy `waitingForChild` i zablokować przełącznik tym samym warunkiem (jeśli `SettingToggle` ma `disabled`).
- **Decision**: PENDING (propozycja: mały PR razem z F1)

### F3 — Kruche asercje czasowe i fixtury `knownBad`

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/pattern-lines/generate.test.ts (próg 2 s), src/lib/pattern-lines/engine.ts (`knownBad` z `seeded(3)`)
- **Detail**: Próg „200 kart poniżej 2 s” zależy od obciążenia maszyny (w tej sesji padał przy pełnym `npm test`, po przyspieszeniu `selfCrossings` i `dotProblems` przeszedł kilka razy z rzędu). `knownBad` budują fixtury z ziarna 3; po zmianie puli lub generatora `fixture()` rzuci dopiero przy teście kontraktu. Wiersz „crossing” używa `loops`, którego nie ma w puli P2 (poza `crossing` wypada też `not-in-pool`).
- **Fix**: Poluzować próg albo mierzyć osobno; fixtury zrobić z jawnych literałów wierszy.
- **Decision**: PENDING

### F4 — Drobne odstępstwa od planu

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/pattern-lines/card.ts, sheet.ts, paths.ts, generate.ts
- **Detail**: (1) `PatternRow.traced` nie był w planie, na P4 liczba powtórzeń linią to `max(3, round(count*0.35))`. (2) `out-of-row` na P1–P3 porównuje z `rowHalfExtent` (maxHeight/2 + pierścień startu), luźniej niż `wysokość/2` (poprawka po e2e). (3) `patternStroke` ma jedną wartość (0,6, tylko P4), bo P3 rysuje powtórzenia kropkami. (4) `knownBad` ma 7 przypadków zamiast 3.
- **Fix**: Brak; zapisane tu jako ustalenia.
- **Decision**: ACCEPTED

### F5 — Koszt obliczeń i render bez `useMemo`

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/pattern-lines/paths.ts (`dotProblems` O(n²)), src/components/PatternLinesSheet.tsx
- **Detail**: `dotProblems` to podwójna pętla po kropkach (ograniczona: do 7 wierszy, 20 prób, pomiar 200 kart ≈ 0,2 s). `PatternLinesSheet` liczy `rowGeometry` i układ przy każdym renderze (np. po „Linie”); tanie, ale `useMemo` byłby czystsze. Układ nie jest chroniony przed rzuceniem wyjątku w renderze, jeśli ktoś zmieni stałe w `sheet.ts`; `layout.test.ts` ma pilnować czterech poziomów (nie sprawdzano szczegółowo).
- **Fix**: Brak potrzeby teraz.
- **Decision**: ACCEPTED

## Pozostałe uwagi recenzenta (bez akcji)

Komunikaty wyjątków po angielsku zgodnie z konwencją modułów; odczyt magazynu (`fieldValue`, `card-summary`) tolerancyjny jak u sąsiadów; test „Linie” w e2e zależy od pustego magazynu (kruchość, nie błąd).
