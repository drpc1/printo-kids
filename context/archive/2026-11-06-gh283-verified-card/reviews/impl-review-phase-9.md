<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: VerifiedCard (gh283), faza 9 Nonogram pionowo

- **Plan**: context/changes/gh283-verified-card/plan.md
- **Scope**: Phase 9 of 11
- **Reviewed phases**: 9
- **Date**: 2026-11-07
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Automated: `npm test` 1039 tests, 1038 pass / 0 fail / 0 todo (jedyny pominięty to test labiryntu „next card differs”); `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone; e2e Chromium (`E2E_PORT`) `nonogram-reprint` (nowy, 5 testów), `card-settings`, `level-bar`, `phone-settings-rows`: 41 passed. Brak `todo` nonogramu. Trudny nonogram: 5 kart w `engine.test.ts` mieści się w budżecie (≈10 ms na kartę), więc `VerifiedCard.require` zostaje, bez przejścia na `check`. Manual 9.4 i 9.6 zostają nieodhaczone (sprawdzi użytkowniczka).

## Findings

### F1 — Zamknięcie A5 przez wzmocnienie `simpleNonogramProblems`, nie przez kod w silniku

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Plan Adherence
- **Location**: src/lib/nonogram/simple.ts
- **Detail**: Plan dopuszczał nowy kod w fazie 9. Dodano do reguły `runs-mismatch`: wiersz o długości innej niż siatka, liczba wierszy inna niż siatka, pusty znaczek i dwa sąsiednie znaczki jednego tonu. Generator zawsze składa znaczki jako maksymalne ciągi, więc żaden wygenerowany wariant nie jest odrzucany (test „every variant of the easy level” nadal 181/181). Oba `todo` (A5-a, A5-b) są knownBad ze specu z kodem `runs-mismatch`.
- **Fix**: Zostawić.
- **Decision**: PENDING

### F2 — Kategoria nie jest sprawdzana przez spec

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Safety & Quality
- **Location**: src/lib/nonogram/engine.ts (`problems`)
- **Detail**: Karta nie przechowuje kategorii, więc spec sprawdza tylko `sizeId` (`settings-mismatch`). Kategoria wchodzi do `contentKey`, więc SheetState regeneruje kartę przy jej zmianie (nowy skutek zgodny z planem i PRD US-20).
- **Fix**: Zostawić.
- **Decision**: PENDING

### F3 — „Pokaż rozwiązanie” związane z kluczem karty zamiast ręcznego zerowania

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Pattern Consistency
- **Location**: src/components/NonogramGenerator.tsx
- **Detail**: Plan: stan komponentu poza `SheetState`, wyłączany przy każdej nowej karcie. Zamiast wywołań `setShowSolution(false)` w trzech miejscach stan to klucz karty, dla której włączono przełącznik; nowa karta ma inny klucz, więc przełącznik gaśnie sam (Generuj, poziom, kategoria, „Nowa karta”, przełączenie profilu). Test e2e pilnuje Generuj i kategorii. Zdanie „Nowa karta i drukuj” w planie zostaje do fazy 11.
- **Fix**: Zostawić.
- **Decision**: PENDING
