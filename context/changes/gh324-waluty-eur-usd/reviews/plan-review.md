<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Waluty EUR i USD na karcie „Kto ma więcej?”

- **Plan**: context/changes/gh324-waluty-eur-usd/plan.md
- **Mode**: Quick (uzupełnione sprawdzeniem kodu przez autora; użytkowniczka śpi, triage wykonany autonomicznie)
- **Date**: 2026-11-09
- **Verdict**: SOUND (po poprawkach)
- **Findings**: 0 critical, 2 warnings, 1 observation

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | PASS    |

## Grounding

7/7 ścieżek ✓ (`levels.ts`, `layout.ts`, `colors.ts`, `engine.ts`, `card-settings.ts`, `MoneyGenerator.tsx`, `tests/e2e/money.spec.ts`), symbole ✓, brief↔plan ✓.

## Findings

### F1 — E2E karty wymaga nominałów tylko do 20 zł

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Faza 1
- **Detail**: `tests/e2e/money.spec.ts:63` oczekuje wartości z `["1","2","5","10","20"]`; poziom trudny PLN po fazie 1 losuje też 50 i 100, więc CI PR-a fazy 1 byłoby czerwone.
- **Fix**: Dodać do fazy 1 zmianę asercji i uruchomienie e2e karty.
- **Decision**: FIXED (zmiana 5 w fazie 1, wiersz Progress 1.7)

### F2 — Preload obrazków pomija 50 i 100 zł

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Faza 1
- **Detail**: `moneyImagePaths` ma na sztywno `[1,2,5,10,20]` (`colors.ts:12`); po fazie 1 obrazki 50 i 100 zł nie byłyby ładowane z wyprzedzeniem, więc Drukuj mógłby ruszyć przed ich wczytaniem.
- **Fix**: Objąć je w fazie 1 (zmiana 5).
- **Decision**: FIXED

### F3 — Skrypt wycinania zależy od `sharp` spoza `package.json`

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Lean Execution
- **Location**: Faza 2
- **Detail**: Skrypt jest w repo, ale nie da się go uruchomić bez ręcznej instalacji.
- **Fix**: Komentarz w nagłówku z poleceniem; bez nowej zależności.
- **Decision**: ACCEPTED
