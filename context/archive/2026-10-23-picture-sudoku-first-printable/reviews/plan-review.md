<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Sudoku 4×4 z kształtami: pierwsza karta do druku

- **Plan**: context/changes/picture-sudoku-first-printable/plan.md
- **Mode**: Deep
- **Date**: 2026-10-24
- **Verdict**: SOUND
- **Findings**: 0 critical, 1 warning, 1 observation

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | PASS    |

## Grounding

8/8 paths ✓, 5/5 symbols ✓, brief↔plan ✓, Progress↔Phase ✓ (20/20 before fixes, 21/21 after)

## Findings

### F1 — carveSudoku: niestabilny test (próg czasu, null bez ponowienia)

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 2 — Bloki, pełne sudoku i solver
- **Detail**: Test z progiem 2 s w `npm test` mógł padać na wolniejszym runnerze CI. Zachłanne usuwanie pól z jednej pełnej planszy czasem utyka przed 52 pustymi, a plan nie mówił, kto ponawia, ani że testy mają stałe ziarno.
- **Fix**: `generateSudokuPuzzle` z ponowieniem na nowej pełnej planszy, testy z `mulberry32` i stałymi ziarnami, pomiar czasu 9×9/52 przeniesiony do ręcznej weryfikacji fazy 2 (Progress 2.3).
  - Strength: Deterministyczne testy w CI; S-19 dostaje gotowe wejście z ponowieniem.
  - Tradeoff: Limit czasu sprawdzany ręcznie, nie automatycznie.
  - Confidence: HIGH — wzorzec symetrii już używa MAX_ATTEMPTS i mulberry32.
  - Blind spot: Nie zmierzono, jak często zachłanne usuwanie utyka przy 52 pustych.
- **Decision**: FIXED

### F2 — „Trzecia miniatura” zakłada, że S-18 wejdzie przed S-16

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Desired End State, Phase 4 (4.5), kontrakt `cards.ts`
- **Detail**: Sekwencje (S-16) dopisują wpis równolegle; „trzecia miniatura” i „po symetrii” przestają być prawdą, gdy S-16 wejdzie pierwsze.
- **Fix**: „miniatura Sudoku obok pozostałych”, wpis na końcu `CARD_KINDS`.
- **Decision**: FIXED
