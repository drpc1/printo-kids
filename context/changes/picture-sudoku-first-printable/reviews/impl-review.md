<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Sudoku 4×4 z kształtami: pierwsza karta do druku

- **Plan**: context/changes/picture-sudoku-first-printable/plan.md
- **Scope**: Full plan (phases 1–4 implemented; manual steps 4.5–4.8 pending)
- **Reviewed phases**: 1, 2, 3, 4
- **Date**: 2026-10-24
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | WARNING |

Automated re-run on HEAD: `npm test` 241/241, `npm run lint` clean (astro check, build, smoke and Playwright passed at phase 4 on the same tree).

## Findings

### F1 — Unexplained defect reported by the user, manual steps 4.5–4.8 unverified

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: context/changes/picture-sudoku-first-printable/plan.md (Progress 4.5–4.8)
- **Detail**: While trying the local dev server the user said "coś nie działa" and chose not to investigate. All automated gates were green, including Playwright on an isolated port, so the cause is unknown (a stray server on port 4321 from another session is one possibility). The plan stays open until 4.5–4.8 are confirmed.
- **Fix**: Check the symptom on production after deploy (or on `npm run dev` on the port the console prints) and report it before closing the plan.
  - Strength: Settles whether it is a real defect or a local-environment mixup.
  - Tradeoff: Nothing is archived until this is done.
  - Confidence: MED — no reproduction yet.
  - Blind spot: The symptom itself is unknown.
- **Decision**: PENDING

### F2 — GenerateButton and ACTION_BUTTON_CLASS copied a third time

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Pattern Consistency
- **Location**: src/components/SudokuGenerator.tsx:15, :116
- **Detail**: The same button class and `GenerateButton` component now exist in WorksheetGenerator, SymmetryGenerator and SudokuGenerator. The plan said to follow the symmetry pattern, so this is faithful, but a fourth card (sequences) will copy it again and the buttons can drift apart.
- **Fix**: Move `GenerateButton` and the class to one shared component in a separate change covering all generators.
  - Strength: One place to change the phone layout of the buttons.
  - Tradeoff: Touches the two other generators and their e2e coverage.
  - Confidence: HIGH — the three copies are identical.
  - Blind spot: S-16 (sequences) is being built in parallel and may copy it too.
- **Decision**: PENDING

### F3 — Sheet hard-codes 2×2 blocks and the 4×4 cell size

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/components/SudokuGenerator.tsx (SudokuSheet), scripts/build-thumbnails.mjs
- **Detail**: `blockRows: 2`, `blockColumns: 2` and `cellSize4` are literals in the component, the mockup and the thumbnail script, although `sudokuBlock(size)` exists. Correct for 4×4; S-19 has to change all three places.
- **Fix**: Read the block shape from `sudokuBlock(card.size)` in S-19.
- **Decision**: PENDING

### F4 — Card problems check runs the solver on malformed givens

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/sudoku/generate.ts (sudokuCardProblems)
- **Detail**: `not-unique` calls `countSudokuSolutions` even when the givens are not 4×4; the Board then builds masks from a wrong-sized grid and gives a meaningless count instead of a clear problem. Generated cards are always 4×4, so it cannot happen on the page.
- **Fix**: Skip the solver when the givens are not 4 rows of 4.
- **Decision**: FIXED
