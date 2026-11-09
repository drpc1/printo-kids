<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: S-35 Karta „Skopiuj rysunek na kratce”

- **Plan**: context/changes/copy-the-drawing-card/plan.md
- **Scope**: Phase 2 of 3
- **Reviewed phases**: 2
- **Date**: 2026-11-09
- **Verdict**: APPROVED (po poprawce F1)
- **Findings**: 0 critical, 1 warnings, 2 observations

## Verdicts

| Dimension           | Verdict      |
| ------------------- | ------------ |
| Plan Adherence      | PASS (po F1) |
| Scope Discipline    | PASS         |
| Safety & Quality    | PASS         |
| Architecture        | PASS         |
| Pattern Consistency | PASS         |
| Success Criteria    | PASS         |

Bramki: `npm test` 1324 zaliczone, 0 błędów; lint, `npm run depcruise`, `npx astro check` (0 błędów) i `npm run build` zielone. Test zepsucia: po wyłączeniu wyśrodkowania w `centerSilhouette` 3 testy poszły na czerwono, kod przywrócony.

## Findings

### F1 — Układ cicho zmniejszał kratkę zamiast rzucać błąd

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/copy-drawing/layout.ts:34-38
- **Detail**: Plan każe rzucać błąd, gdy blok wychodzi poza margines; kod zmniejszał kratkę, a warunek marginesu był nieosiągalny. Zmniejszona kratka ukryłaby naruszenie poziomu (np. trudny poniżej 5 mm).
- **Fix**: Rzucać, gdy kratka poziomu się nie mieści (`fits < cellSize − 1e-6`); kratka zawsze równa kratce poziomu. Test „shrunk” zamieniony na test rzucania.
- **Decision**: FIXED

### F2 — Dwa klucze mogą dać ten sam wzór

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/lib/copy-drawing/generate.ts:36
- **Detail**: Klucz zależy od indeksów wariantów; warianty różniące się tylko kolorem dają ten sam wzór. Tak samo działa nonogram (`nonogram/generate.ts:81`).
- **Fix**: Brak, wzorzec zgodny z nonogramem.
- **Decision**: ACCEPTED

### F3 — Test CardExhausted ze stałym random jest kruchy

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/copy-drawing/engine.test.ts:40-47
- **Detail**: Test zależy od tego, że stałe `random` daje jedną kartę.
- **Fix**: Brak.
- **Decision**: ACCEPTED
