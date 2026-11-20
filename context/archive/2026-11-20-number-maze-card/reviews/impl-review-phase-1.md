<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Labirynt liczbowy (S-49) — faza 1

- **Plan**: context/changes/number-maze-card/plan.md
- **Scope**: Phase 1 of 3
- **Reviewed phases**: 1
- **Date**: 2026-11-20
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 2 observations

Dryf względem planu sprawdzony w głównym kontekście; bezpieczeństwo, jakość i wzorce sprawdził jeden niezależny agent (oszczędność tokenów zamiast dwóch). Bramki automatyczne fazy 1 przeszły (`npm test`, lint, depcruise, `astro check`, build) oraz break-check. Typ `NumberMazeSettings` w `card-settings.ts` jest ponad plan fazy 1 (plan wymienia go w fazie 2), ale potrzebny silnikowi, jak w S-48 — nie jest znaleziskiem.

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | WARNING |

## Findings

### F1 — Najgorszy czas generatora nie ma górnej granicy

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/number-maze/generate.ts:12-17
- **Detail**: 50 prób × 20 000 węzłów × przeszukanie osiągalności na węzeł to w najgorszym razie dziesiątki milionów odwiedzin kratek na Poziomie 4. Test czasu mierzy tylko typowe ziarna (NFR 5 s).
- **Fix**: Wspólny budżet węzłów na całe `generateNumberMazeCard` (wyczerpanie → `null` → `CardExhausted`) i test ze złośliwym `random` (stałe 0 i 0,999…), że kończy się szybko.
- **Decision**: FIXED

### F2 — Pułapka może stać o krok dalej niż PRD pozwala

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/number-maze/generate.ts:95-96, generate.test.ts:36
- **Detail**: Przesunięcia pułapki to `-near … near+1`, więc przed liczbą drogi pułapka może być `near+1` kroków dalej (np. 4 kroki na Poziomie 1). PRD: „najwyżej 3 kroki od nich na Poziomach 1–2 i 2 kroki na Poziomach 3–6”. Test utrwala `near + 1`.
- **Fix**: Zakres `-near … near` (następna liczba i tak zakazana) i asercja `steps <= level.near` w teście.
- **Decision**: FIXED

### F3 — Wyrocznia słabsza niż reguła jednej drogi

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/number-maze/oracle.test.ts:20-40
- **Detail**: Wyrocznia liczy tylko pełne przejścia. Sąsiad z następną liczbą, który po kilku krokach prowadzi w ślepy zaułek, łamie regułę („dokładnie jedna sąsiednia kratka”), a wyrocznia go nie widzi (łapie to tylko `card.ts`).
- **Fix**: W wyroczni dodatkowo sprawdzić, że na każdym kroku przejścia dokładnie jedna sąsiednia kratka ma następną liczbę.
- **Decision**: FIXED

### F4 — Zły początek albo koniec drogi zgłaszany jako `path-not-adjacent`

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/number-maze/card.ts:77
- **Detail**: Kod mylący przy diagnozie; plan nie przewiduje osobnego kodu.
- **Fix**: Osobny kod `path-wrong-ends` z przypadkiem w `card.test.ts`.
- **Decision**: FIXED

### F5 — Układ nie odrzuca zbyt wysokiego pasa polecenia

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/number-maze/layout.ts:48
- **Detail**: Przy pasie wyższym niż strona `cell` wychodzi ujemny i układ nie rzuca błędu. Dziś pas ma najwyżej 26 mm, więc to tylko zabezpieczenie.
- **Fix**: Rzucić błąd, gdy `cell <= 0`, i test z za wysokim pasem.
- **Decision**: FIXED
