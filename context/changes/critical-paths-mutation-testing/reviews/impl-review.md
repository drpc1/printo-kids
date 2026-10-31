<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Krytyczne ścieżki: testy z luk i celowany Stryker na nowych kartach

- **Plan**: context/changes/critical-paths-mutation-testing/plan.md
- **Scope**: Full plan (fazy 1–6; w fazie 6 krok 6.3 czeka na potwierdzenie)
- **Reviewed phases**: 1, 2, 3, 4, 5, 6
- **Date**: 2026-11-03
- **Verdict**: APPROVED
- **Findings**: 0 critical 1 warnings 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | WARNING |

Sprawdzone: wszystkie fazy dotykają tylko testów, konfiguracji Strykera, skryptów npm, raportów i `test-plan.md`; kod produkcyjny bez zmian (zgodnie z „What We're NOT Doing”). `npm test` (776 testów), `npm run lint`, `npx astro check` zielone; każdy `npm run mutate:<zakres>` został uruchomiony do końca. Odstępstwa od planu są uzasadnione i zapisane: zakresy linii Strykera dostosowane do zmienionego kodu (sekwencje: `generate.ts:51-276` i `colors.ts`; symetria: `generate.ts:49-300` i `colors.ts`), sekwencje i symetria w dwóch PR-ach, wyrocznia 4×4 nonogramu na próbce co 13. obrazek (pełne 65 536 trwało ok. 40 s).

## Findings

### F1 — `test-plan.md` §5 podaje stary rozmiar zestawu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: context/foundation/test-plan.md:94
- **Detail**: §4 mówi „około 750 testów, stan 2026-11-03”, a pierwsze zdanie §5 nadal „około 600 testów (stan 2026-10-27…)”. Krok 6.3 („test-plan zgadza się z stryker-results”) nie może być uczciwie odhaczony, dopóki te liczby się różnią.
- **Fix**: Zmienić liczbę i datę w pierwszym zdaniu §5 na „około 750 (stan 2026-11-03)”.
- **Decision**: FIXED

### F2 — Wiersz 1.3 w Progress bez SHA

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/critical-paths-mutation-testing/plan.md:338
- **Detail**: `- [x] 1.3 …` nie ma sufiksu SHA, reszta odhaczonych wierszy go ma. `/10x-archive` pokaże to jako ostrzeżenie o braku SHA.
- **Fix**: Dopisać ` — c3ad524` (commit fazy 1, jak w wierszach 1.1 i 1.2).
- **Decision**: FIXED

### F3 — Niejasne zdanie o ocalałych w sekcji nonogramu

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: context/changes/critical-paths-mutation-testing/reviews/stryker-results.md:137
- **Detail**: Zdanie po tabeli ocalałych w fazie 4 mówi o „dokładnie 11 pozycjach z tabeli bez dwóch ostatnich wierszy”, a tabela ma dwanaście wierszy grupowych i dwa z nich (`solve.ts:13`, `:30`) nie przeżyły przebiegu „po”. Czytelnik nie wie, które mutanty ocalały naprawdę.
- **Fix**: Przenieść `solve.ts:13` i `:30` do osobnego zdania („zabite w przebiegu po, równoważne według ręcznego sprawdzenia”) i usunąć opis „bez dwóch ostatnich wierszy”.
- **Decision**: FIXED

### F4 — `AGENTS.md` nie wspomina o skryptach `mutate:*`

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Pattern Consistency
- **Location**: AGENTS.md (sekcja „Mutation testing”)
- **Detail**: Sekcja mówi tylko o ogólnej zasadzie Strykera. Nowe skrypty `npm run mutate:<zakres>`, katalog `stryker/` i zmienne `MUTATION_RUN` oraz `SEQUENCE_ORACLE_SEEDS` są opisane wyłącznie w `reviews/stryker-results.md` i `test-plan.md` §5a. Agent pracujący w repo nie dowie się o nich z AGENTS.md.
- **Fix**: Dopisać do sekcji jedno zdanie: zakresy mają osobne pliki w `stryker/` i skrypty `npm run mutate:<zakres>`, a instrukcja jest w raporcie zmiany i w `test-plan.md` §5a.
  - Strength: AGENTS.md jest jedynym plikiem czytanym przy każdym starcie; dopisek kosztuje jedną linię.
  - Tradeoff: Zmiana wspólnego pliku zasad poza zakresem tej zmiany, więc wymaga akceptacji osobno.
  - Confidence: HIGH — AGENTS.md już dziś opisuje komendy i Stryker.
  - Blind spot: Czy zespół chce utrzymywać listę skryptów w AGENTS.md.
- **Decision**: FIXED
