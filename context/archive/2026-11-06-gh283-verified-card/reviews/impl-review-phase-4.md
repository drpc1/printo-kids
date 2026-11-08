<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: gh283-verified-card, Faza 4

- **Plan**: context/changes/gh283-verified-card/plan.md
- **Scope**: Phase 4 of 11
- **Reviewed phases**: 4
- **Date**: 2026-11-06
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning (fixed), 2 observations

Przegląd wykonany przez autora fazy (bez osobnych agentów), na różnicy względem `main`: `maze/engine.ts`, `maze/known-bad.ts`, `maze/generate.ts`, testy, `WorksheetGenerator.tsx`, `CardPage.tsx`, `ReprintDialog.tsx`, `build-thumbnails.mjs`, e2e.

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 — `mazeSpec.problems` rzucał `TypeError` przy wejściu poza siatką

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW
- **Dimension**: Safety & Quality
- **Location**: src/lib/maze/engine.ts (wywołanie `countPaths`)
- **Detail**: Wejście albo wyjście poza siatką (np. `{ row: 99, col: 99 }`) kończyło się `TypeError` w `countPaths` zamiast kodem `entrance-position` / `exit-position`. Spec ma zwracać problemy, nie rzucać.
- **Fix**: Gdy wejście lub wyjście leży poza siatką, zwrócić dotychczasowe kody pozycji bez sprawdzeń drogi.
- **Decision**: FIXED (test „an entrance or exit outside the grid…”)

### F2 — `generateMaze` nadal eksportowany z `generate.ts`

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Plan Adherence
- **Location**: src/lib/maze/generate.ts
- **Detail**: Plan dopuszcza eksport dla silnika i testów modułu (`card-contract.test.ts`, `generate.test.ts`, silnik). Komponent go już nie importuje. Zakaz importu z komponentów wymusi reguła depcruise z fazy 11.
- **Fix**: Brak w tej fazie.
- **Decision**: PENDING (faza 11)

### F3 — `npm run thumbnails` zmienia miniatury innych kart

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Success Criteria
- **Location**: public/thumbnails/{dyktando,nonogram,sekwencje,symetria}.svg
- **Detail**: Skrypt przepisuje te cztery pliki także na `main` (poza zakresem fazy: wiersz 4.4 dotyczy tylko `labirynt.svg`, który jest bajt w bajt ten sam). Cofnięte w tej fazie.
- **Fix**: Osobno ustalić, czy miniatury są niedeterministyczne (zmiana poza gh283).
- **Decision**: PENDING

## Kryteria sukcesu

`npm test` (998 testów, 0 błędów, 2 `todo` cudze), `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` (w e2e), `grep mazeForSheet` puste, e2e Chromium 143 zielone (w tym nowe `maze-reprint.spec.ts`). Wiersze Manual 4.6, 4.7, 4.9 zostają otwarte (decyzja właścicielki).
