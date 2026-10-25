<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Nonogram — pierwsza drukowalna karta (S-22)

- **Plan**: context/changes/nonogram-first-printable/plan.md
- **Mode**: Deep
- **Date**: 2026-10-25
- **Verdict**: SOUND
- **Findings**: 0 critical, 2 warnings, 1 observation

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | WARNING |

## Grounding

6/6 paths ✓ (`src/hooks/useChildProfileVisit.ts`, `src/components/ui/switch.tsx`, `GeneratorShell.astro` link „Wszystkie karty”, `scripts/build-thumbnails.mjs`, `src/lib/cards.ts`, `src/lib/sheet/print-contract.test.ts`), 4/4 symbols ✓, brief↔plan ✓, Progress 15/15 ✓. Najwięcej liczb: 8×12 — 3 przy wierszu / 3 nad kolumną, 12×15 — 5/4, 18×24 — 6/5.

## Findings

### F1 — Nowe obiekty z S-21 mogą cicho wypaść z nonogramu

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 1 — Testy
- **Detail**: Test wymagał tylko „co najmniej jeden wariant każdego rozmiaru przechodzi”; obiekt bez przechodzącego wariantu nigdy nie pokazałby się na nonogramie, a CI zostałoby zielone.
- **Fix A ⭐ Recommended**: test „każdy szablon średniego rozmiaru ma ≥1 przechodzący wariant”
- **Fix B**: tylko `t.diagnostic`
- **Decision**: FIXED (Fix A)

### F2 — Kontrakt druku klas print:hidden

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 3 — Kontrakt druku
- **Detail**: Istniejący test porównuje dokładną listę klas z `print:hidden`; nonogram ma trzecią pozycję (grupa rozwiązania).
- **Fix**: zapisać w planie oczekiwaną listę trzech klas.
- **Decision**: FIXED

### F3 — Zmierzone wymiary bloku dla trzech rozmiarów

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 2 — Testy
- **Detail**: 12×15 po 12 mm z cyframi 6 → ok. 179×221 mm; 18×24 po 7 mm z cyframi 5 → ok. 161×211 mm; 8×12 po 14 mm → ok. 134×151 mm; wszystko ≤ 190×277 mm.
- **Fix**: dopisać jako punkt odniesienia testu układu.
- **Decision**: FIXED
