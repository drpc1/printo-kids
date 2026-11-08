<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Refactor opportunities, faza 2

- **Plan**: context/changes/refactor-opportunities/plan.md
- **Scope**: Phase 2 of 4
- **Reviewed phases**: 2
- **Date**: 2026-11-08
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 1 observation

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Weryfikacja: npm test 1062 pass / 0 fail; lint, depcruise, astro check zielone. Deliberate-break: po zepsuciu odczytu 3 testy czerwone.

## Findings

### F1 — Nieczytelny storage jest nie do odróżnienia od pustej listy

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/child-profiles.ts (updateProfiles, wywołanie readChildProfiles)
- **Detail**: `readChildProfiles` zamienia błąd `getItem` i uszkodzony JSON na `[]`. Transform, który dopisuje profil (tworzenie w fazie 3), zapisałby listę z jednym profilem i nadpisał istniejące. To zachowanie odziedziczone po obecnych wołających, nie regres fazy 2, ale `updateProfiles` jest miejscem, gdzie da się to zamknąć.
- **Fix**: Przy tworzeniu (faza 3) zdecydować, czy odczyt, który się nie udał, ma dawać `unavailable`; wymaga odróżnienia błędu odczytu od pustej listy, więc zmiana poza zakresem fazy 2.
  - Strength: Zamyka cichą utratę profili.
  - Tradeoff: Nowa ścieżka błędu odczytu i testy.
  - Confidence: MED — zależy od tego, czy takie błędy zdarzają się w praktyce.
  - Blind spot: Nie sprawdzono, jak faza 3 woła tworzenie.
- **Decision**: SKIPPED (odłożone do fazy 3: przy przepinaniu tworzenia rozstrzygnąć obsługę błędu odczytu)

### F2 — Wyjątek w transform raportowany jako write-failed

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/child-profiles.ts (catch w updateProfiles)
- **Detail**: Plan opisuje `write-failed` jako `false` z zapisu albo wyjątek storage. Wyjątek z `transform` (błąd programisty) też dostaje `write-failed`, co mogłoby wprowadzić w błąd komunikat w fazie 4.
- **Fix**: Zostawić (funkcja nie rzuca, a ten przypadek nie powinien wystąpić) albo zwracać `unavailable`.
- **Decision**: ACCEPTED (zostaje, błąd programisty, funkcja nie rzuca)
