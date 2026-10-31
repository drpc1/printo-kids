<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Krytyczne ścieżki: testy z luk i celowany Stryker na nowych kartach

- **Plan**: context/changes/critical-paths-mutation-testing/plan.md
- **Mode**: Deep (weryfikacja kluczowych twierdzeń)
- **Date**: 2026-10-27
- **Verdict**: SOUND (po poprawce)
- **Findings**: 0 critical, 1 warning, 1 observation

## Verdicts

| Dimension             | Verdict                  |
| --------------------- | ------------------------ |
| End-State Alignment   | PASS                     |
| Lean Execution        | PASS                     |
| Architectural Fitness | PASS                     |
| Blind Spots           | WARNING (F1, naprawione) |
| Plan Completeness     | PASS                     |

## Grounding

Ścieżki ✓ (testy i moduły zakresów istnieją), symbole ✓ (`ORACLE_SEEDS`, `fillingsThatFollowARule`, `countSudokuSolutions`, `dictationCardProblems`), brief↔plan ✓, Progress↔fazy ✓. Sprawdzone empirycznie: Stryker 10 nie przyjmuje `--commandRunner.command`, ale plik konfiguracji w podkatalogu `stryker/` z `--mutate` w CLI działa (9 z 9 zabitych na `card-settings.ts:94-107`).

## Findings

### F1 — Zmienna ziaren nie obejmuje drugiego drogiego testu sekwencji

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 1, pkt 3 (szybki oracle sekwencji)
- **Detail**: `ORACLE_SEEDS` (`generate.test.ts:20,160`) steruje tylko jedną pętlą. Test „walidator nazywa wiersz dwuznacznym…” (`:445`) liczy `fillingsThatFollowARule` (27^k) dla wszystkich `fixedRows` × zestawów luk i jest niezależny od ziaren, więc kryterium „komenda poniżej 15 s” mogło być nieosiągalne samą zmianą stałej.
- **Fix**: Zmienna ogranicza oba testy (ziarna i podzbiór `fixedRows` z zachowaniem przypadków jednoznacznych i dwuznacznych); kryterium zmienione na „czas zmierzony i zapisany”.
- **Decision**: FIXED

### F2 — Zmienna środowiskowa niezależna od powłoki

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architectural Fitness
- **Location**: Phase 1, pkt 3
- **Detail**: npm na Windows uruchamia skrypty w `cmd.exe`, więc prefiks `VAR=1 cmd` nie działa; plan zostawia wybór mechanizmu implementacji (skrypt `with-env.mjs` lub wykrycie uruchomienia przez Strykera).
- **Fix**: Bez zmiany planu; decyzja zapisana w `stryker-results.md`.
- **Decision**: ACCEPTED
