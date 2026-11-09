<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Waluty EUR i USD na karcie „Kto ma więcej?”

- **Plan**: context/changes/gh324-waluty-eur-usd/plan.md
- **Scope**: Phase 1 of 3
- **Reviewed phases**: 1
- **Date**: 2026-11-09
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 1 observation

Przegląd wykonany przez autora fazy (użytkowniczka śpi): diff porównany z planem, uruchomione bramki (`npm test` 1116 pass, `npm run lint`, `npx astro check`, `npm run depcruise`, e2e `money.spec.ts` 7/7), break-check reguły `note-count` (test czerwony po odwróceniu warunku).

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | WARNING |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 — `moneyImage` i `moneyImagePaths` per waluta weszły już w fazie 1

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: src/lib/money/colors.ts
- **Detail**: Plan zakładał w fazie 1 tylko zmianę sygnatury, a pełne mapowanie ścieżek w fazie 2. Strona w fazie 1 i tak woła `moneyImage` z walutą, więc mapowanie `zl|eur|usd` jest tu; w fazie 2 zostają pliki PNG i test ich istnienia.
- **Fix**: Zostawić; faza 2 nie powtarza mapowania.
- **Decision**: ACCEPTED

### F2 — `noteCount` łapał wyjątek z `pieceKind`

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/money/rules.ts
- **Detail**: try/catch dla nominału spoza waluty był niepotrzebny.
- **Fix**: Liczyć po liście banknotów z `PIECES`.
- **Decision**: FIXED
