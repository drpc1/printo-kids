<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Sudoku: rozmiary, poziomy i cyfry

- **Plan**: context/changes/picture-sudoku-levels/plan.md
- **Scope**: Full plan (fazy 1–4)
- **Reviewed phases**: 1, 2, 3, 4
- **Date**: 2026-10-24
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warnings, 1 observations

Fazy 1–3 miały osobny przegląd (`reviews/impl-review-phase-1-3.md`: F1 naprawione, F2 rozwiązane przez przepięcie na wspólny `GenerateButton` z `main`, F3 bez działania). Ten raport obejmuje fazę 4 i przekrój całości (HEAD 158e7cd, scalone z `origin/main`).

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Automated na HEAD: `npm test` 324/324, `npm run lint` czysto, `astro check` 0 błędów, `npm run build` przechodzi, Playwright 88 przeszło i 52 pominięte (iPhone/WebKit na Windows), `npm run smoke` przeszło, `npm run thumbnails` nie zmienia pliku. Kroki ręczne 3.4–3.7 i 4.5–4.7 potwierdziła użytkowniczka.

## Findings

### F1 — Skrypt miniatury nadal ma literały bloku 2×2

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: scripts/build-thumbnails.mjs (wywołanie `layoutSudokuSheet` karty sudoku)
- **Detail**: Plan (faza 4 pkt 1) mówił, żeby skrypt miniatury brał blok z `sudokuBlock`, bez literałów (finding F3 z przeglądu S-18). Skrypt przepięto na `generateSudokuCard` i `SUDOKU_SHEET.cellSize[4]`, ale `blockRows: 2` i `blockColumns: 2` zostały. Miniatura jest zawsze 4×4, więc wynik jest poprawny; ryzyko to rozjazd, gdyby miniatura miała kiedyś pokazywać inny rozmiar.
- **Fix**: Użyć `sudokuBlock(sudokuCard.size)` w skrypcie miniatury (import z `src/lib/sudoku/generate.ts`).
- **Decision**: PENDING

### F2 — Nieudane generowanie po zmianie ustawienia zostawia pasek i kartę niezgodne

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/SudokuGenerator.tsx (generateFor, handleSettingChange)
- **Detail**: Gdyby `generateSudokuCard` zwrócił null po zmianie ustawienia, `settings` już są nowe, a na ekranie zostaje stara karta z komunikatem o błędzie. W praktyce nie zachodzi: pomiar 9×9 trudny to średnio 2 ms bez porażek, a test pilnuje wszystkich 13 ustawień.
- **Fix**: Brak działania; wystarczy komunikat „Nie udało się ułożyć karty.”.
- **Decision**: PENDING
