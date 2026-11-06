<!-- PLAN-REVIEW-REPORT -->

# Plan Review: VerifiedCard — wspólny strażnik niezmiennika kart

- **Plan**: context/changes/gh283-verified-card/plan.md
- **Mode**: Deep
- **Date**: 2026-11-06
- **Verdict**: SOUND
- **Findings**: 0 critical, 1 warning, 2 observations

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | WARNING |

## Grounding

6/6 paths ✓, 4/4 symbols ✓, brief↔plan ✓, Progress↔Phase 11/11 ✓, criteria counts match ✓

## Findings

### F1 — Znacznik „drukowana” ustawiany tylko z beforeprint, w złym miejscu

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Faza 4, punkt 3a; wzorzec migracji, pkt 6
- **Detail**: Plan ustawia `printed` wyłącznie z `beforeprint`, a e2e podmienia `window.print` na licznik. Podmieniona funkcja nie wysyła `beforeprint`, więc kryteria e2e 4.8–10.6 („drugi Drukuj otwiera ostrzeżenie”) nie przejdą. Listener miał siedzieć w `useCardPage.ts`, którego labirynt nie używa; `SheetState` jest w `*Generator.tsx`. Drukuj ma jedno miejsce: `CardPage.handlePrint` (`CardPage.tsx:85`).
- **Fix**: `CardPage` dostaje `onPrinted` i woła je przed każdym `window.print()` oraz w `beforeprint` (Ctrl+P). `markPrinted` jest idempotentne, a `useCardPage.ts` wypada z fazy 4.
- **Decision**: FIXED

### F2 — Desired End State mówi o `unavailable` tylko przy poziomie

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Desired End State, punkt o siedmiu komponentach
- **Detail**: Punkt mówi „nieudane Generuj albo zmiana poziomu”. Po nowym I-9 ten sam skutek ma też nieudana nowa karta po zmianie kategorii albo rozmiaru i „Kształty / Cyfry” w sudoku. Taka nieudana karta to rzadki przypadek: `CardExhausted` (np. wąska kategoria bez innej karty na tym poziomie) albo `CardInvariantError`.
- **Fix**: zamienić na „nieudana nowa karta (Generuj albo zmiana ustawienia treści)”.
- **Decision**: PENDING — właścicielka poprosiła o wyjaśnienie

### F3 — `applySettings` nie zna dzisiejszej blokady `waitingForChild`

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Wzorzec migracji, pkt 5
- **Detail**: Dziś zmiana poziomu generuje kartę tylko przy `card !== null && !waitingForChild` (`SymmetryGenerator.tsx:59`). Plan nie przenosi tej blokady do `applySettings`.
- **Fix**: Handler zostawia blokadę i nie woła `applySettings`, gdy `waitingForChild`.
- **Decision**: FIXED
