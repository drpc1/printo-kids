<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Krzyżówka matematyczna (S-40)

- **Plan**: context/changes/math-crossword-card/plan.md
- **Scope**: Phase 2 of 4
- **Reviewed phases**: 2
- **Date**: 2026-11-14
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Automated: npm test (1600 pass), lint, depcruise, astro check, build, break-check — all green (run before review).

## Findings

### F1 — Testy wyroczni i czasu zależą od zegara

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/math-crossword/oracle.test.ts:84-102, src/lib/math-crossword/generate.test.ts:57
- **Detail**: Poziomy 4–7 w wyroczni liczą próbkę z limitem 4 s i wymagają ≥3 z 6 przeszukanych; na wolnym CI test może paść bez błędu w kodzie. Poziomy 1–3 mają deadline 20 s. generate.test.ts pilnuje 2,5 s na kartę.
- **Fix A ⭐ Recommended**: Ograniczyć wyrocznię licznikiem węzłów zamiast zegara
  - Strength: Test deterministyczny, niezależny od maszyny.
  - Tradeoff: Trzeba dobrać budżet węzłów i sprawdzić, ile kart przechodzi.
  - Confidence: MED — budżet trzeba skalibrować na Poziomie 7.
  - Blind spot: Nie mierzyłem, ile węzłów potrzebuje Poziom 7.
- **Fix B**: Zostawić zegar, podnieść progi (np. 5 s) i pominąć przy CI
  - Strength: Mała zmiana.
  - Tradeoff: Test dalej zależy od maszyny.
  - Confidence: HIGH — prosta edycja.
  - Blind spot: Flaky na jeszcze wolniejszym CI.
- **Decision**: FIXED (2026-11-14)

### F2 — Wyrocznia po cichu pomija karty poza budżetem

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/math-crossword/oracle.test.ts:96-102
- **Detail**: `if (!finished) continue` pomija karty; jednoznaczność na Poziomach 4–7 jest potwierdzona tylko na próbce (wymóg ≥3 łącznie, nie per poziom).
- **Fix**: Wymagać przeszukania co najmniej jednej karty na każdy poziom 4–7 i wypisać `searched` per poziom.
- **Decision**: FIXED (2026-11-14)

### F3 — `chain-too-long` bez wpisu w `knownBad`

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/math-crossword/engine.ts:57-91, engine.test.ts:68-77
- **Detail**: Plan wymaga `knownBad` dla co najmniej dwóch kodów (spełnione), ale punkt „każdy kod” jest pokryty tylko 8 z 9; `chain-too-long` testuje wyłącznie card.test.ts.
- **Fix**: Dodać znaną złą kartę (Poziom 1 z łańcuchem 2) z `expectedCode: "chain-too-long"` i zmienić licznik w engine.test.ts na 9.
- **Decision**: FIXED (2026-11-14)

### F4 — Luki w geometryIsSound i layout dla kart zdegenerowanych

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/math-crossword/card.ts:149-155, layout.ts:35-36
- **Detail**: Brak sprawdzenia duplikatów `id` komórek liczbowych i spójności `values` z `cells`; `Math.max(...[])` w layout daje NaN dla pustych komórek. Ścieżki teoretyczne, generator ich nie tworzy.
- **Fix**: Zostawić; ewentualnie dopisać do kodu problemów w kolejnej zmianie.
- **Decision**: SKIPPED

### F5 — Tymczasowe rzutowanie `kind` do fazy 3

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/math-crossword/engine.ts:20, engine.test.ts (`kindOf`)
- **Detail**: `"krzyzowka" as CardKindId` i `kindOf` w testach są zaplanowanym obejściem; trzeba je usunąć przy rejestracji w fazie 3 (plan to przewiduje).
- **Fix**: Usunąć w fazie 3.
- **Decision**: SKIPPED
