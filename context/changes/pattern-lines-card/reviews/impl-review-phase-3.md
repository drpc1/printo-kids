<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: S-36 Karta „Szlaczki”

- **Plan**: context/changes/pattern-lines-card/plan.md
- **Scope**: Phase 3 of 4
- **Reviewed phases**: 3
- **Date**: 2026-11-10
- **Verdict**: APPROVED
- **Findings**: 0 critical 0 warnings 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Sprawdzono: `npm test` (1502), lint, depcruise, `astro check`, build, e2e na porcie 4399 w 4 projektach (41 testów nowej karty zielone po poprawce), smoke. Kroki ręczne 3.8 i 3.9 potwierdzone przez użytkowniczkę. Komponenty bez hexów, klasy i kolory przez tokeny; „Linie” woła tylko `memory.remember`, poziom woła `applySettings`; `lines` bez gałęzi w `normalizeCard`; rzutowania `kind` usunięte.

## Findings

### F1 — Test marginesu wykrył rzut kółka startu poza margines; poprawiono `rowHalfExtent`

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/pattern-lines/paths.ts (`rowHalfExtent`), paths.test.ts:86
- **Detail**: Na P2 kółko wokół pierwszej kropki wystawało do 289 mm przy limicie 287. `rowHalfExtent` dolicza teraz promień kropki, odstęp i pół grubości kółka na poziomach z kropkami; zmieniona jedna oczekiwana wartość testu (9 → 11,15). Zmiana układu fazy 2, bez osłabiania asercji.
- **Fix**: Brak.
- **Decision**: FIXED (w commicie fazy 3)

### F2 — Miniatura używa literalnych szarości

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: scripts/build-thumbnails.mjs, public/thumbnails/szlaczki.svg
- **Detail**: Literalne szarości jak w pozostałych miniaturach skryptu (poza regułą UI, bo to statyczny plik).
- **Fix**: Brak.
- **Decision**: ACCEPTED
