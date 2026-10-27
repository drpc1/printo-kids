<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Postać mówi polecenie na każdej karcie

- **Plan**: context/changes/character-speaks-instruction/plan.md
- **Mode**: Deep (lokalnie)
- **Date**: 2026-10-27
- **Verdict**: REVISE → SOUND po poprawkach
- **Findings**: 0 critical, 3 warnings, 1 observation

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | WARNING |

## Grounding

10/10 ścieżek ✓, symbole ✓, plan↔skrót ✓, Progress↔fazy ✓

## Findings

### F1 — Kratka dyktanda z `maxCommands` jest mniejsza, niż trzeba

- **Severity**: WARNING
- **Impact**: MEDIUM
- **Dimension**: Blind Spots
- **Location**: Faza 4
- **Detail**: Typowe liczby poleceń (łatwe do 33, średnie do 44) mieszczą nominalną kratkę z pasem; liczenie z `maxCommands` zmniejsza ją niepotrzebnie.
- **Fix A ⭐ Recommended**: licz z faktycznej liczby poleceń karty
- **Fix B**: zostaw `maxCommands`
- **Decision**: FIXED (Fix A)

### F2 — Istniejące e2e układu paska na telefonie nie są w fazach 2–3

- **Severity**: WARNING
- **Impact**: MEDIUM
- **Dimension**: Blind Spots
- **Location**: Fazy 2 i 3
- **Detail**: `tests/e2e/phone-layout.spec.ts` mierzy brak nachodzenia kontrolek na 360 px na symetrii, sekwencjach i sudoku; nowy przycisk „Postać” zmieni zawijanie.
- **Fix**: dopisać uruchomienie w fazach 2 i 3 (kroki 2.5, 3.4)
- **Decision**: FIXED

### F3 — `speech.test.ts` trafia do skryptu `test` dopiero w fazie 5

- **Severity**: WARNING
- **Impact**: LOW
- **Dimension**: Plan Completeness
- **Location**: Faza 1 vs Faza 5
- **Detail**: `npm test` wylicza pliki jawnie; kryterium 1.1 nie uruchomiłoby nowego testu.
- **Fix**: przenieść dopisanie do fazy 1 (krok 1.6)
- **Decision**: FIXED

### F4 — Brak sposobu wyliczenia `contentRight`; własny obrazek nie jest kwadratem

- **Severity**: OBSERVATION
- **Impact**: LOW
- **Dimension**: Plan Completeness
- **Location**: Faza 1
- **Detail**: Brak biblioteki do pikseli PNG; własny obrazek skalowany do maksymalnej krawędzi.
- **Fix**: opisać jednorazowy pomiar i zasadę dla własnego obrazka
- **Decision**: FIXED
