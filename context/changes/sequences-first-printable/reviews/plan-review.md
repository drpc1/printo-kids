<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Karta sekwencji na A4 (S-16)

- **Plan**: context/changes/sequences-first-printable/plan.md
- **Mode**: Deep (weryfikacja lokalna)
- **Date**: 2026-10-24
- **Verdict**: REVISE → SOUND po poprawkach
- **Findings**: 0 critical, 3 warnings, 2 observations

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | WARNING |
| Blind Spots           | WARNING |
| Plan Completeness     | WARNING |

## Grounding

6/6 paths ✓, 5/5 symbols ✓, brief↔plan ✓, Progress↔fazy ✓ (3/8/12)

## Findings

### F1 — Trzecia kopia GenerateButton i ACTION_BUTTON_CLASS

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Architectural Fitness
- **Location**: Faza 2 — SequenceGenerator.tsx
- **Detail**: Przycisk i klasa są skopiowane w `WorksheetGenerator.tsx:23,177` i `SymmetryGenerator.tsx:18,157`; plan robił trzecią kopię, S-18 zrobiłoby czwartą.
- **Fix A ⭐ Recommended**: Nowy `src/components/GenerateButton.tsx`, używany na razie tylko przez sekwencje
  - Strength: Zatrzymuje kopiowanie bez dotykania plików labiryntu i symetrii.
  - Tradeoff: Przez chwilę dwie stare kopie i jedna wspólna.
  - Confidence: HIGH — kopie są identyczne.
  - Blind spot: S-18 może mieć już własną kopię.
- **Fix B**: Świadomie skopiować, sprzątanie później
  - Strength: Zero nowych abstrakcji.
  - Tradeoff: Cztery kopie po M-3.
  - Confidence: HIGH
  - Blind spot: None significant
- **Decision**: FIXED (Fix A)

### F2 — Kontrakt sequenceAnswers nie mówi, jak zwraca nieokreśloną lukę

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Faza 1 — generate.ts
- **Detail**: Typ zwrotny był zbiorem krotek, a plan kazał liczyć nieokreśloną lukę jako niejednoznaczność.
- **Fix**: `{ answers; undetermined }`; „ambiguous” przy `undetermined` albo > 1 odpowiedzi, „no-answer” przy 0.
- **Decision**: FIXED

### F3 — Brak wpisu ryzyka sekwencji w test-plan.md

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Faza 3
- **Detail**: Symetria dostała ryzyko 7; główne ryzyko S-16 nie było w planie testów, a od niego zależą testy mutacyjne.
- **Fix**: Faza 3 dopisuje ryzyko z numerem nadanym przy scalaniu z S-18.
- **Decision**: FIXED

### F4 — Dla „5 lat” generator nigdy nie trafi w „ambiguous”

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Faza 1 — testy
- **Detail**: Gałęzie „ambiguous” i „gap-before-pattern-shown” chronią tylko ręczne przypadki; przykład z 4 lukami łamie też „gap-count”.
- **Fix**: Ręczne przypadki sprawdzają „zawiera”, nie równość całej listy.
- **Decision**: FIXED

### F5 — Bramka powtarzalności miniatur nie widzi nowego pliku

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Faza 3 — kryterium 3.5
- **Detail**: `git diff` pomija nieśledzony `sekwencje.svg`.
- **Fix**: `git add` po pierwszym uruchomieniu, `git diff --exit-code public/thumbnails` po drugim.
- **Decision**: FIXED
