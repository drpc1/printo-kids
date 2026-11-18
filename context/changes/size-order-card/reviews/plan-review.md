<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Od najmniejszego (S-48)

- **Plan**: context/changes/size-order-card/plan.md
- **Mode**: Deep (bez sub-agenta)
- **Date**: 2026-11-18
- **Verdict**: REVISE → SOUND po poprawkach
- **Findings**: 0 critical, 2 warnings, 2 observations

## Findings

### F1 — Rysowanie ikony w kredce nie ma kontraktu

- **Severity**: WARNING, **Impact**: MEDIUM, **Dimension**: Architectural Fitness
- **Detail**: `IconPicture` rysuje ikony zawsze czarne; PRD wymaga wypełnienia kredką.
- **Decision**: FIXED via Fix A (własny `SizeOrderPicture`, `iconBounds` w `src/lib/size-order/`)

### F2 — Szeroka ikona zmniejsza cały rząd bez dolnej granicy

- **Severity**: WARNING, **Impact**: MEDIUM, **Dimension**: Blind Spots
- **Detail**: Krok to stosunek, a dziecko widzi mm; na trudnym szeroka ikona daje różnicę ok. 2–3 mm.
- **Decision**: FIXED (reguła `step-too-small-mm`, wstępnie 2,5 mm, potwierdza wydruk)

### F3 — `.dependency-cruiser.cjs` poza zmianami

- **Severity**: OBSERVATION, **Impact**: LOW
- **Decision**: FIXED (dopisane w fazie 1, pkt 4)

### F4 — Brak skryptu podglądu w zmianach fazy 1

- **Severity**: OBSERVATION, **Impact**: LOW
- **Decision**: FIXED (`preview.mts` w fazie 1, pkt 5)
