<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Labirynty trudniejsze na każdym poziomie

- **Plan**: `context/changes/gh114-maze-too-easy/plan.md`
- **Mode**: Deep
- **Date**: 2026-10-30
- **Verdict**: REVISE → SOUND po poprawkach
- **Findings**: 1 critical, 2 warnings, 3 observations

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | FAIL    |

## Grounding

9/9 paths ✓, symbols ✓ (`level.exit`, `layoutSheet`, `mazeForSheet`, `DEFAULT_LEVEL_ID`), brief↔plan ✓, Progress 18/18 ✓

## Findings

### F1 — Faza 1 nie przejdzie własnych testów

- **Severity**: ❌ CRITICAL
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1 / Phase 2
- **Detail**: Faza 1 usuwa `Level.exit` i rozszerza `Maze`, a `WorksheetGenerator.tsx:274-275`, `build-thumbnails.mjs:69-70`, `layout.test.ts` (`:84`, `:113`, `:126`, `:128`, `:195-196`, `:233-234`) i `walls.test.ts:8-9` dostawały poprawki dopiero w Fazie 2 albo wcale.
- **Fix**: Przenieść odbiorców do Fazy 1; w Fazie 2 zostaje napis „Meta” w skrajnej kolumnie, miniatura i e2e.
- **Decision**: FIXED

### F2 — Testy rozkładu: koszt i brak dostępu do jednego losowania

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 1, pkt 4
- **Detail**: 200 ziaren × 20 kandydatów × 6 poziomów ≈ 14 s na przejście, pięć asercji ≈ minuta; Stryker uruchamia `generate.test.ts` przy każdym mutancie. Porównanie z jednym losowaniem nie miało funkcji w kontrakcie.
- **Fix**: Eksport `generateCandidate` i `scoreMaze`, jedna próbka 100 ziaren na poziom współdzielona między asercjami.
- **Decision**: FIXED

### F3 — Domyślny poziom to ten z największym skokiem

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Desired End State / Open Risks
- **Detail**: `DEFAULT_LEVEL_ID = lat5` (Poziom 3) widzi każda pierwsza wizyta i nowy profil; droga rośnie z ok. 34 do ok. 74 komórek.
- **Fix A ⭐ Recommended**: Zostawić domyślny, dopisać ryzyko i kryterium ręczne.
- **Fix B**: Domyślny Poziom 2 i poprawka PRD US-08.
- **Decision**: FIXED (Fix A)

### F4 — Kryterium 1.5 nie mówi, czym sprawdzić

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1, Manual
- **Fix**: Na `/maze` w `npm run dev` po 5 kart z każdego poziomu.
- **Decision**: FIXED

### F5 — Brak kroku Stryker dla generate.ts

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1
- **Fix**: Zawężony przebieg na `scoreMaze` i `generateMaze`, przeżyłe mutanty przejrzane.
- **Decision**: FIXED

### F6 — Kryterium 3.1 zapisuje cały projekt

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 3, Automated
- **Fix**: `npx prettier --check context/foundation/prd.md`.
- **Decision**: FIXED
