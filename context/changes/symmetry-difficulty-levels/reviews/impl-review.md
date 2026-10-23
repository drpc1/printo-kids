<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Poziomy karty symetrii (S-13)

- **Plan**: context/changes/symmetry-difficulty-levels/plan.md
- **Scope**: Phases 1-2 of 4 (zacommitowane); faza 3 w toku, kod sprawdzony pomocniczo, bez werdyktu
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-23
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 1 observation

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Sprawdzone: `npm test` 190/190, `npm run lint` 0 błędów, `npx astro check` 0 błędów, `npm run build` OK, `npx playwright test` 50 zaliczonych / 34 pominiętych, miniatura bez zmian. Brak pozostałości `SYMMETRY_SETTING` i `SYMMETRY_TEMPLATES`.

## Findings

### F1 — Gałąź „pusty katalog → null” nie ma testu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/symmetry/generate.ts (początek `generateSymmetryCard`)
- **Detail**: Faza 1 kazała zwracać `null` dla poziomu z pustym katalogiem i to testować. Test usunięto w fazie 2, bo każdy poziom ma już szablony, więc gałąź jest martwym kodem bez testu.
- **Fix**: Usunąć strażnik `templates.length === 0`; `symmetryTemplatesFor` zawsze zwraca niepusty katalog (typ `Record` po `SymmetryLevelId`).
- **Decision**: FIXED

### F2 — Puste asercje w testach katalogów

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/symmetry/generate.test.ts:168-173, 188
- **Detail**: `assert.ok(frame.length > 0)` oraz `parts.length > ...parts.length - 1` nic nie chronią (tautologie).
- **Fix**: Usunąć zmienną `frame` i zastąpić drugą asercję `parts.length >= 3`.
- **Decision**: FIXED
