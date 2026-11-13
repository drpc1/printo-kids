<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: VerifiedCard (gh283), faza 8 Sudoku pionowo

- **Plan**: context/changes/gh283-verified-card/plan.md
- **Scope**: Phase 8 of 11
- **Reviewed phases**: 8
- **Date**: 2026-11-07
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Automated: `npm test` 1025 pass / 0 fail / 2 todo (oba to nonogram A5, sudoku bez `todo`), `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone; e2e Chromium (`E2E_PORT`) `sudoku-*`, `card-settings`, nowy `sudoku-reprint` zielone. `grep sudoku/generate SudokuGenerator.tsx` zwraca tylko import typu. Czas 9×9 trudnego mieści się w budżecie (test w `engine.test.ts`). Manual 8.5 zostaje nieodhaczony (sprawdzi użytkowniczka).

## Findings

### F1 — Spec sprawdza zgodność karty z ustawieniami (`settings-mismatch`), czego plan nie wymieniał

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: src/lib/sudoku/engine.ts (`problems`)
- **Detail**: Plan: `sudokuSpec` owija `sudokuCardProblems`. Dodano jeden kod, `settings-mismatch` (rozmiar, poziom, symbole karty vs pasek; na 4×4 poziom i symbole pomijane, tak jak w generatorze). Zgodne z I-9 (karta na ekranie odpowiada paskowi) i ma knownBad.
- **Fix**: Zostawić; ewentualnie dopisać w plan.md przy fazie 8.
- **Decision**: PENDING

### F2 — Plan mówi „Nowa karta i drukuj”, po PR #302 „Nowa karta” nie drukuje

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/gh283-verified-card/plan.md (kryterium fazy 8)
- **Detail**: Nowy e2e testuje zachowanie po #302. Zdanie w planie zostaje bez zmian do fazy 11 (decyzja zlecenia).
- **Fix**: Poprawić w fazie 11.
- **Decision**: PENDING
