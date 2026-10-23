<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Karta symetrii na A4 (S-12)

- **Plan**: `context/changes/symmetry-first-printable/plan.md`
- **Mode**: Deep
- **Date**: 2026-10-23
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

9/9 paths ✓, 6/6 symbols ✓, brief↔plan ✓, Progress 25/25 ✓. Weryfikacja kodu lokalnie (bez podagenta): `has-maze` tylko w `GeneratorShell.astro`, `WorksheetGenerator.tsx:59` i `print-contract.test.ts:49,81`; e2e go nie używają.

## Findings

### F1 — Kartka symetrii bez nazwy dostępnej

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 3 §2, Phase 4 §3
- **Detail**: `MazeSheet` ma `role="img"` i `aria-label="Labirynt"` (`WorksheetGenerator.tsx:365-366`), a `phone-layout.spec.ts:149` szuka kartki tą nazwą. Kontrakt `SymmetrySheet` tego nie wymieniał, więc e2e nie miały lokatora `getByRole` dla karty.
- **Fix**: Kontrakt `SymmetrySheet` dostaje `role="img"` i `aria-label="Symetria"`, a e2e szukają kartki tą nazwą.
- **Decision**: FIXED

### F2 — Moduły symetrii muszą działać bez aliasu @/

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 1, Phase 4 §2
- **Detail**: `npm test` i `npm run thumbnails` uruchamiają TS przez `node --experimental-strip-types` (`package.json:12,15`), który nie rozwiązuje `@/`. `src/lib` używa importów względnych z `.ts`. Plan tego nie mówił.
- **Fix**: Nowy wpis w Critical Implementation Details: `src/lib/symmetry` importuje tylko względnie, z `.ts`, bez `@/` i bez Reacta.
- **Decision**: FIXED

### F3 — Plan testów nie dostaje aktualizacji

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 1 §4, References
- **Detail**: Faza 1 realizuje fazę 5 planu testów (ryzyko 7), ale `test-plan.md` nadal ma tam „not started”. Ryzyko 7 mówi też „druga połowa jest pusta”, co po regule podpowiedzi w PRD jest za wąskie.
- **Fix**: Phase 1 §5 aktualizuje `test-plan.md`: wiersz fazy 5 wskazuje tę zmianę, a ryzyko 7 brzmi zgodnie z regułą podpowiedzi.
- **Decision**: FIXED
