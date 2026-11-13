<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: S-34 Karta „Który nie pasuje”

- **Plan**: context/changes/odd-one-out-card/plan.md
- **Scope**: Phase 2 of 3
- **Reviewed phases**: 2
- **Date**: 2026-11-09
- **Verdict**: APPROVED (po poprawkach F1–F3)
- **Findings**: 0 critical, 3 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Dwóch recenzentów: zgodność z planem (0 DRIFT, 0 MISSING; 25 ikon identycznych z makietą; faza 3 nietknięta; trzy drobne EXTRA zgodne z intencją: dodatkowe kody problemów, `duplicate-row` bez względu na kolejność obrazków, kolor jako pierwszy rozpraszacz) oraz jakość i wzorce (brak CRITICAL; silnik w kształcie `moneyEngine`). Bramki: `npm test`, lint, depcruise, `astro check`, build zielone; kontrola celowego zepsucia (wyłączenie sprawdzania innych cech w `oddOneOutRowProblems`) dała 4 czerwone testy. Punkt ręczny 2.6 (przegląd diffu) zastąpiony tym przeglądem za zgodą użytkowniczki z 2026-11-09.

## Findings

### F1 — Najgorszy przypadek generatora ok. 6,3 s

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/odd-one-out/generate.ts:22-24
- **Detail**: 200 kart × rzędy × 20 × 200 losowań rzędu; przy niemożliwej karcie generator poddawał się po ok. 6,3 s, ponad 5 s z PRD.
- **Fix**: `MAX_ATTEMPTS` i `MAX_ROW_ATTEMPTS` 200 → 50; test „returns null…” pilnuje teraz, że poddanie się trwa < 2 s.
- **Decision**: FIXED

### F2 — Niespójny klucz powtórzonego rzędu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/odd-one-out/generate.ts:140,147
- **Detail**: Generator odrzucał powtórki po `rowKey` (z kolejnością), a `oddOneOutCardProblems` po `rowContentKey` (bez kolejności), więc przetasowany rząd marnował całą próbę karty.
- **Fix**: `rowContentKey` eksportowany z `rules.ts` i użyty w zbiorze `seen`.
- **Decision**: FIXED

### F3 — Brak pilnowania liczby ikon w kategorii

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/odd-one-out/generate.ts:41-55, icons.test.ts
- **Detail**: Rząd kategorii trudnego bierze 5 różnych ikon jednej kategorii; kategoria z 4 ikonami dałaby TypeError.
- **Fix**: test w `icons.test.ts`: każda kategoria ma co najmniej `itemCount − 1` najszerszego poziomu ikon.
- **Decision**: FIXED

### F4 — Test `CardExhausted` z dwiema ścieżkami

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/odd-one-out/engine.test.ts:43
- **Detail**: Gałąź `if (only === null)` ukrywała, która asercja działa.
- **Fix**: jedna ścieżka: stałe losowanie daje `null`, a silnik rzuca `CardExhausted` z `kind` i `attempts`.
- **Decision**: FIXED

### F5 — Nieaktualny komentarz w `knownBad`

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/odd-one-out/engine.ts:46
- **Detail**: Komentarz mówił o regule rozmiaru, a fixture ma regułę kształtu.
- **Fix**: komentarz poprawiony.
- **Decision**: FIXED

### F6 — Rzutowanie `"niepasuje" as CardKindId`

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/lib/odd-one-out/engine.ts:94
- **Detail**: Zaplanowane tymczasowe rzutowanie do fazy 3; do tego czasu kompilator nie pilnuje identyfikatora.
- **Fix**: faza 3 dodaje wpis w `CARD_KINDS` i usuwa rzutowanie (zapisane w planie).
- **Decision**: ACCEPTED
