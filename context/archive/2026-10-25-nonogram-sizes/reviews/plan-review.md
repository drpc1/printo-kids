<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Poziomy nonogramu (łatwy, średni, trudny)

- **Plan**: context/changes/nonogram-sizes/plan.md
- **Mode**: Quick (kod sprawdzony ręcznie)
- **Date**: 2026-10-25
- **Verdict**: SOUND (po dwóch poprawkach)
- **Findings**: 0 critical, 2 warnings, 0 observations

Grounding: ścieżki i symbole (sizes.ts, generate.ts, layout.ts, print-contract.test.ts, SudokuChoice.tsx) istnieją; plan↔brief zgodne.

### F1 — Kontrakt druku sprawdza tylko pierwszy `<svg>` w pliku

- **Severity**: WARNING
- **Impact**: LOW
- **Dimension**: Blind Spots
- **Detail**: `svgClassName` w `print-contract.test.ts` bierze pierwszy `<svg>`; druga kartka w tym samym pliku nie miałaby sprawdzonego rozmiaru A4 ani grupy rozwiązania `print:hidden`.
- **Fix**: Karta ze znaczkami w osobnym `NonogramSimpleSheet.tsx` i te same testy dla tego pliku.
- **Decision**: FIXED

### F2 — Pętle po wszystkich poziomach w testach zakładają klasyczną kartę

- **Severity**: WARNING
- **Impact**: LOW
- **Dimension**: Plan Completeness
- **Detail**: `generate.test.ts`, `clues.test.ts`, `layout.test.ts`, `object-categories.test.ts` iterują po `NONOGRAM_SIZES` i wołają solver; łatwy (znaczki) przeszedłby nie tą drogą.
- **Fix**: Rozdzielić po `kind`.
- **Decision**: FIXED
