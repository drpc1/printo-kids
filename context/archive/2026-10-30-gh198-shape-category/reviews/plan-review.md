<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Kategoria „Kształty” (gh198)

- **Plan**: context/changes/gh198-shape-category/plan.md
- **Mode**: Deep (odczyt bezpośredni)
- **Date**: 2026-10-30
- **Verdict**: REVISE → SOUND po poprawkach
- **Findings**: 1 critical, 2 warnings, 0 observations

## Findings

### F1 — „1–2 części na figurę” łamie istniejące testy katalogu

- **Severity**: CRITICAL, **Impact**: LOW, **Dimension**: Blind Spots
- **Detail**: `symmetry/generate.test.ts` wymaga ≥3 części na 9×24, różnych obrazów dla zestawów wariantów i miejsca na 3 podpowiedzi na 4×12.
- **Decision**: FIXED (Faza 1 pkt 2, brief)

### F2 — Miernik wywołuje nieeksportowane funkcje

- **Severity**: WARNING, **Impact**: LOW, **Dimension**: Plan Completeness
- **Detail**: `variantSets`, `silhouette`, `isCleanOutline` są prywatne w plikach testowych.
- **Decision**: FIXED (miernik w `templates.test.ts`)

### F3 — Kryterium 1.1 niespełnialne z założenia

- **Severity**: WARNING, **Impact**: LOW, **Dimension**: Plan Completeness
- **Detail**: Surowe figury mogą łamać testy po wszystkich szablonach; `npm test` jawnie wymienia pliki.
- **Decision**: FIXED (wpięcie do `CATALOG` po mierniku)
