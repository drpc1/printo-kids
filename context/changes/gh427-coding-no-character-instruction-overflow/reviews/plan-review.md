<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Wspólne polecenie bez postaci (GitHub 427)

- **Plan**: context/changes/gh427-coding-no-character-instruction-overflow/plan.md
- **Mode**: Deep
- **Date**: 2026-11-23
- **Verdict**: REVISE → SOUND po poprawkach
- **Findings**: 0 critical, 2 warnings, 2 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | WARNING |
| Plan Completeness | WARNING |

## Grounding

6/6 paths ✓, 5/5 symbols ✓ (instructionBoxHeight, instructionLines, dictationCellSize, layoutDictationSheet, CARD_KINDS), brief↔plan ✓, Progress↔Phase 14/14 ✓

## Findings

### F1 — Szacunek sam decyduje, które karty zmieniają układ

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 1, Open Risks
- **Detail**: Tylko Kodowanie wychodzi poza kartkę potwierdzone w praktyce (issue). Krzyżówka (≈197 mm) i Dyktando (≈215 mm) tylko według szacunku 0,52, a obie przeszły już wydruk użytkowniczki (Open Questions 17, 11). Za szeroki szacunek dałby im niepotrzebne dwie linie i mniejszą kratkę dyktanda; plan sprawdzał to dopiero w fazie 3.
- **Fix ⭐ Recommended**: W fazie 1 zmierzyć prawdziwą szerokość czterech długich tekstów w podglądzie (`getComputedTextLength`, 7 mm) i skalibrować próg przed fazą 2.
  - Strength: Decyzja o łamaniu opiera się na pomiarze.
  - Tradeoff: Jeden krok ręczny więcej.
  - Confidence: HIGH — jeden pomiar w istniejącym podglądzie.
  - Blind spot: Font w druku (iOS) może się różnić od desktopu.
- **Decision**: FIXED (krok 1.5, What We're NOT Doing, brief)

### F2 — Test „wszystkich kart” może pominąć nową kartę

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 1, change 3
- **Detail**: Ręczna lista poleceń przepuści nową kartę, której nikt nie dopisał — ten sam sposób, w jaki przeszło Kodowanie.
- **Fix**: Test sprawdza, że zestaw pokrytych kart równa się `CARD_KINDS` bez labiryntu.
- **Decision**: FIXED

### F3 — Pozycja komponentu: `top` czy środek

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1, change 2
- **Detail**: Starsze układy (symetria, sekwencje, nonogram, dyktando) zwracają tylko środek `instruction.y`; już przyjmują wysokość pasa, ale komponent bierze `top`.
- **Fix**: Te karty podają `top = instruction.y − height / 2`.
- **Decision**: FIXED

### F4 — Krok 1.4 jest ręczny, choć da się go zautomatyzować

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1 Success Criteria, Progress 1.4
- **Detail**: To, że długie polecenia mają dwie linie, może być asercją w teście.
- **Fix**: Asercja w teście; tytuł 1.4 zostaje, notatka w bloku fazy.
- **Decision**: FIXED
