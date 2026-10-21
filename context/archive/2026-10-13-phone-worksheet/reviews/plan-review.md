<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Strona karty na telefonie (S-09)

- **Plan**: context/changes/phone-worksheet/plan.md
- **Mode**: Deep
- **Date**: 2026-10-14
- **Verdict**: REVISE → SOUND po triage
- **Findings**: 1 critical, 3 warnings, 2 observations

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | WARNING |
| Lean Execution        | PASS    |
| Architectural Fitness | WARNING |
| Blind Spots           | WARNING |
| Plan Completeness     | WARNING |

## Grounding

8/8 paths ✓, 5/5 symbols ✓ (extractBlock, classNamesContaining, CHILD_PROFILES_KEY, cornerLabel, devices Pixel 7 / iPhone 13), brief↔plan ✓, Progress↔Phase ✓ (35/35)

## Findings

### F1 — Jeden rząd od 640 px nie ma miejsca: limit max-w-xl

- **Severity**: ❌ CRITICAL
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Architectural Fitness / End-State Alignment
- **Location**: Faza 1 (Intent paska), brief: Open Risks (S-07)
- **Detail**: Pasek leży w `div.max-w-xl` (`WorksheetHome.astro:9`), więc na każdym ekranie od ok. 624 px ma najwyżej 576 px. Dziś rząd ma ok. 528 px, a z ikonami ok. 576 px, czyli bez zapasu. „Poziom:” z S-07 go przepełni, więc zdanie z briefu, że „Poziom:” wejdzie bez zmiany układu, było prawdziwe tylko poniżej 640 px.
- **Fix A ⭐ Recommended**: Dwa rzędy na wszystkich szerokościach
  - Strength: Jeden układ zależny od kontenera; S-07 wchodzi bez przeróbek.
  - Tradeoff: Desktop zmienia wygląd.
  - Confidence: HIGH — szerokość wynika z klasy max-w-xl.
  - Blind spot: Szerokość nazw postaci nie mierzona.
- **Fix B**: Jeden rząd od sm: z zawijaniem, Drukuj schodzi niżej
  - Strength: Desktop jak dziś, dopóki się mieści.
  - Tradeoff: Układ zależy od treści.
  - Confidence: MED.
  - Blind spot: Wygląd przy zawinięciu.
- **Decision**: FIXED (Fix B)

### F2 — Telefon poziomo: Profil znowu fixed nad kartą

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Faza 2, zmiana 1
- **Detail**: iPhone poziomo (844×390) ma ponad 640 px, więc `sm:fixed` kładzie Profil nad kartą przy przewijaniu, wbrew US-04.
- **Fix**: `absolute` także przy `pointer: coarse`; `fixed` tylko od `sm` z myszą; kryterium dla 844×390.
  - Strength: Telefon w obu orientacjach i tablet zachowują się tak samo.
  - Tradeoff: Laptop dotykowy też dostaje Profil przewijany ze stroną.
  - Confidence: MED — wariant Tailwind 4 niesprawdzony w projekcie.
  - Blind spot: Urządzenia hybrydowe zgłaszające `pointer: fine`.
- **Decision**: FIXED

### F3 — Testy nie obejmują 360 i 375 px

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Faza 5, zmiana 1; Desired End State
- **Detail**: Pixel 7 ma 412 px, iPhone 13 390 px. Usterkę zmierzono przy 375 px, typowe Androidy mają 360 px, a minimum nie było określone.
- **Fix**: Minimum 360 px w Desired End State, projekt Playwright 360×780, 320 px poza zakresem.
- **Decision**: FIXED

### F4 — Kryterium 3.1 jest czerwone, zanim cokolwiek zmienimy

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Faza 3, kryterium 3.1
- **Detail**: `prettier --check` już dziś nie przechodzi na `prd.md`, `test-plan.md` i `roadmap.md` (16, 44, 64 linie), a `roadmap.md` zmienia też S-07 na `main`.
- **Fix**: Faza 3 za bramką; 3.1 = commit przez lint-staged i diff tylko zamierzonych zdań.
- **Decision**: FIXED

### F5 — Kryterium 2.8 nie sprawdza min-h-dvh

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Faza 2, kryterium 2.8
- **Detail**: Emulacja nie ma dynamicznego paska adresu, więc dvh i vh dają to samo.
- **Fix**: Sprawdzenie przeniesione do fazy 6 (kryterium 6.5); 2.8 sprawdza teraz telefon poziomo (F2).
- **Decision**: FIXED

### F6 — Test „Profil nad kartą” może przejść z błędem

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Faza 5, zmiana 2
- **Detail**: We współrzędnych dokumentu Profil i SVG nie przecinają się ani przy `fixed`, ani przy `absolute`.
- **Fix**: Kontrakt na `boundingBox()` względem okna po przewinięciu; 5.5 sprawdza, że test czerwienieje po przywróceniu `fixed`.
- **Decision**: FIXED
