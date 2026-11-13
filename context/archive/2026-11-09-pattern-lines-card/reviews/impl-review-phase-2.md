<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: S-36 Karta „Szlaczki”

- **Plan**: context/changes/pattern-lines-card/plan.md
- **Scope**: Phase 2 of 4
- **Reviewed phases**: 2
- **Date**: 2026-11-10
- **Verdict**: APPROVED
- **Findings**: 0 critical 0 warnings 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Sprawdzono: `npm test` (1486 pass), lint, depcruise, `astro check`, build, wszystko zielone. Moduł ma kształt `copy-drawing`; silnik rzuca `CardExhausted`, `kind` rzutowany jak `TOY`; `PatternLinesSettings` bez wpisu w `CardSettingsMap`; `pattern-lines` w regule depcruise; 7 plików testów w skrypcie `test`. Kroki ręczne 2.6 i 2.7 potwierdzone przez użytkowniczkę; 2.8 (wydruk, opcjonalny) otwarty.

## Findings

### F1 — Dodatkowe pole `traced` w `PatternRow`

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/pattern-lines/card.ts
- **Detail**: Plan opisywał `PatternRow { patternId; period; height?; count }`. Dodano `traced` (liczba powtórzeń kropkowanych na P3 i narysowanych na P4), bez którego reguła `trace-repeats` nie miałaby czego sprawdzać. Poza kluczem karty.
- **Fix**: Brak; odnotowane w planie przy fazie 3 (kontrakt wiersza).
- **Decision**: ACCEPTED

### F2 — Pominięcie kontroli „ramion” dla wierszy z samoskrzyżowaniem

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/pattern-lines/card.ts:107
- **Detail**: Dla wiersza, którego ścieżka się przecina (pętle na P3), nie sprawdza się odstępu kropek z różnych ramion; inaczej wzór nigdy nie przeszedłby kontroli. Zgodne z decyzją PRD o P3, ale plan tego nie nazywał.
- **Fix**: Brak.
- **Decision**: ACCEPTED

### F3 — Fixture `knownBad` „crossing” zależy od składu puli P2

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/pattern-lines/engine.ts:57
- **Detail**: Fixture wstawia `loops` do wiersza P2; ważne tylko dopóki `loops` nie wejdzie do puli P2. Po dołożeniu go do puli test żywotności padnie głośno (nie po cichu), więc ryzyko niskie.
- **Fix**: Brak; ewentualnie zmienić fixture, gdy pula P2 się zmieni.
- **Decision**: ACCEPTED
