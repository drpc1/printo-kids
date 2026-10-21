<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Na wydruku labirynt z postacią niżej, równy margines góra i dół (S-11)

- **Plan**: context/changes/printed-maze-equal-margins/plan.md
- **Scope**: Phase 1 of 2
- **Reviewed phases**: 1
- **Date**: 2026-10-22
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Commit `5ad9265`. Plan drift: every planned change MATCH (new `levelShowsCharacter` / `labelHeight` inputs, shift formula exactly as planned, identical output when `false`, one `SHEET_LABEL_SIZE` constant for `fontSize` and `labelHeight`, all four planned test cases, old assertions kept); Desired End State numbers recomputed (s 7.65 / 7.86 / 7.96, bands 10.04 / 9.43 / 9.11). Out of scope untouched (teen layout, `@page`, print CSS). Gates on this code: `npm test` 119/119, lint, `astro check` 0 errors, build, Playwright 28 passed / 16 skipped, break check (3 breaks, all red), Stryker on `layout.ts` 47/47 killed. Manual 1.7 confirmed by the user on screen.

## Findings

### F1 — Przesunięcie nie ma ograniczenia dla przyszłych siatek

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/sheet/layout.ts:65-67
- **Detail**: Wzór sprowadza się do `s = (markSize − labelHeight/2 − labelBand/2) / 2`. Na dzisiejszych siatkach (`labelBand` ok. 21–22) ściany zostają 23–25 mm od dołu. Przy wyższej siatce (`labelBand` poniżej ok. 10,6) ściany weszłyby w dolny pas 10 mm, a poniżej ok. 9 znak wyszedłby nad stronę, a „Meta” pod nią. Testy obejmują tylko `LEVELS`, więc nowa siatka wywróciłaby CI bez wyjaśnienia dlaczego.
- **Fix**: Dopisać w `layout.ts` jednozdaniowy komentarz, że wzór zakłada `labelBand` co najmniej ok. 11 (dzisiejsze siatki), a test „stays inside the page margins” zostaje strażnikiem dla nowej siatki.
- **Decision**: FIXED (komentarz w `layout.ts` o założeniu pasa co najmniej ok. 11 nad siatką)

### F2 — `characterSelected: true` przy `levelShowsCharacter: false` daje znak nad nieprzesuniętą siatką

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/lib/sheet/layout.ts:28-31; src/components/WorksheetGenerator.tsx:338
- **Detail**: Jedyny wywołujący łączy oba warunki (`level.showCharacter && characterSrc !== null`), więc dziś to się nie zdarza. Gdyby się zdarzyło, znak stałby ok. 2,4 mm od krawędzi nad nieprzesuniętą siatką.
- **Fix**: Zostawić; ewentualnie w `layoutSheet` liczyć znak przy `characterSelected && levelShowsCharacter`.
- **Decision**: FIXED (znak tylko przy `characterSelected && levelShowsCharacter`; nowy test „a picked character on a level without one still shows Start and no mark”, czerwony bez poprawki)

### F3 — Kilka asercji porównuje liczby zmiennoprzecinkowe dokładnie

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/sheet/layout.test.ts:159, 175-179
- **Detail**: `mark.y + mark.height === maze.y`, `maze.y === INSET + labelBand` i suma dla `meta.y` przechodzą, bo test powtarza kolejność działań z implementacji. Inne asercje w tym samym commicie mają tolerancję (1e-9 / 0,01).
- **Fix**: Użyć tej samej tolerancji w tych asercjach.
- **Decision**: FIXED (`assertNear` z tolerancją 1e-9 w czterech asercjach)

### F4 — `labelHeight` to rozmiar czcionki, nie wysokość liter

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/sheet/layout.ts:30
- **Detail**: Przy `dominantBaseline="middle"` „Meta” nie ma liter z ogonkami, więc biały pas pod napisem jest na wydruku o mniej niż 1 mm większy niż nad postacią. Plan to przyjął (Open Risks w briefie); komentarz w kodzie mówi o dolnej krawędzi dokładniej, niż jest.
- **Fix**: Doprecyzować komentarz: „dolna krawędź pola napisu (połowa rozmiaru czcionki)”.
- **Decision**: FIXED (komentarz przy `labelHeight`: pole napisu to meta.y ± labelHeight/2, litery kończą się trochę wewnątrz)

## Triage

Wszystkie cztery poprawione 2026-10-22 (decyzja użytkowniczki). Bramki po poprawkach: `npm test` 120/120, lint, `astro check` 0 błędów, build, Playwright 28 passed, Stryker na `layout.ts` 48/48 (100%).
