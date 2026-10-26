<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Sudoku: rozmiary, poziomy i cyfry

- **Plan**: context/changes/picture-sudoku-levels/plan.md
- **Mode**: Deep (weryfikacja w kodzie bez sub-agenta)
- **Date**: 2026-10-24
- **Verdict**: SOUND
- **Findings**: 0 critical, 1 warnings, 2 observations

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | WARNING |

## Grounding

12/12 ścieżek istnieje (w tym `SymmetryLevelChoice.tsx`, `build-thumbnails.mjs`, `print-contract.test.ts`), symbole `DIALOG_ROW_CLASS`, `sudokuBlock`, `generateSudokuPuzzle`, `layoutSudokuSheet` znalezione, brief↔plan zgodne, Progress↔fazy zgodne (4 fazy, 21 wierszy).

## Findings

### F1 — Fazy 1 i 2 psują kompilację plików, których same nie dotykają

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Completeness
- **Location**: Faza 1 pkt 1–3, Faza 2 pkt 2
- **Detail**: Faza 1 usuwa `SUDOKU_SHEET.cellSize4` i trzyliniowe `instructionLines`, ale zostają ich użytkownicy poza listą zmian fazy: `src/components/SudokuGenerator.tsx:149,156`, `scripts/build-thumbnails.mjs:179,186` oraz istniejący `src/lib/sudoku/layout.test.ts:16` (plan wymienia tylko test układu jako dokładanie przypadków). Faza 2 usuwa `generateSudokuCard4`, którego używają `SudokuGenerator.tsx:46`, `build-thumbnails.mjs:167` i sześć miejsc w `generate.test.ts` (linie 7, 57, 152, 171, 193, 275), a komponent i miniatura są dopiero w fazach 3 i 4. Kryteria 1.2 (`npm run lint` z regułami typów), 2.3 (`astro check`) i bramka ręczna po fazie 1 nie przejdą na takim drzewie.
- **Fix**: W fazie 1 dopisać do zmian przepięcie `SudokuGenerator.tsx`, `build-thumbnails.mjs` i `layout.test.ts` na `cellSize[4]`; w fazie 2 przepiąć wywołania `generateSudokuCard4` (komponent minimalnie z `DEFAULT_SUDOKU_SETTINGS`, skrypt miniatury, istniejące testy) w tej samej fazie, a fazom 3 i 4 zostawić tylko pasek, arkusz i nowe testy.
  - Strength: Każda faza kończy się zielonym `lint`, `astro check` i `build`, więc bramki mają sens.
  - Tradeoff: Fazy 1 i 2 dotykają trochę więcej plików niż dziś w planie.
  - Confidence: HIGH — wszystkie wskazane użycia zweryfikowane w kodzie.
  - Blind spot: Miniatura po fazie 2 może się zmienić przez inną kolejność losowań (plan to już przewiduje).
- **Decision**: FIXED

### F2 — Zmiana ustawienia musi generować kartę z nowymi wartościami, nie ze stanu

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Faza 3 pkt 3
- **Detail**: Plan mówi „zmiana ustawienia przy widocznej karcie generuje nową kartę”, ale nie rozstrzyga, skąd generator bierze ustawienia. Wywołanie po `setSize(...)` czyta jeszcze stare wartości stanu. Symetria rozwiązuje to przez `generateFor(id)` z jawnym argumentem (`SymmetryGenerator.tsx:58-69`) i bramką `waitingForChild`.
- **Fix**: Dopisać w kontrakcie, że `generateFor(settings)` przyjmuje pełne nowe ustawienia i że obowiązuje ta sama bramka `waitingForChild`; test e2e sprawdza, że po wyborze 9×9 karta ma 9 kolumn.
- **Decision**: FIXED

### F3 — Okno wyboru potrzebuje tytułu dla czytników ekranu

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Faza 3 pkt 1
- **Detail**: `SudokuChoice` wzoruje się na `SymmetryLevelChoice.tsx:35`, gdzie `DialogTitle` ma klasę `sr-only` („Wybierz poziom”); plan tego nie wymienia, a dwa okna muszą mieć różne tytuły („Wybierz rozmiar”, „Wybierz poziom”).
- **Fix**: Dodać do kontraktu `SudokuChoice` prop z tytułem okna.
- **Decision**: FIXED
