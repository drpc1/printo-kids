<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Wydruk z iPhone'a bez podwójnego marginesu

- **Plan**: context/changes/print-printer-margins/plan.md
- **Mode**: Deep
- **Date**: 2026-10-31
- **Verdict**: REVISE → SOUND po poprawkach
- **Findings**: 1 critical, 3 warnings, 1 observation

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | WARNING |
| Lean Execution        | PASS    |
| Architectural Fitness | WARNING |
| Blind Spots           | WARNING |
| Plan Completeness     | FAIL    |

## Grounding

6/6 ścieżek ✓, 4/4 symboli ✓ (`inset: 10` w 6 kartach, `max-height: 100vh`, `E2E_PORT`, `layoutSheet`), brief↔plan ✓, Progress↔fazy ✓.

## Findings

### F1 — Skalowania nie da się złożyć w CSS przy zmiennym przycięciu

- **Severity**: ❌ CRITICAL
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Plan Completeness
- **Location**: Implementation Approach, Critical Implementation Details, Faza 1
- **Detail**: Przy c = min(10mm, (210mm − 100vw)/2) skala s = min(1, 100vh / (297mm − 2c)) wymaga dzielenia długości przez długość, którego Safari < 18 nie obsługuje; plan zostawiał formułę implementerowi.
- **Fix A ⭐ Recommended**: Stały próg `max-width: 191mm` i stałe przycięcie 9,5 mm; okno 191:278, CSS to length × number.
  - Strength: Działa w każdym Safari; łapie Letter i A4 z marginesami iOS; ≥ ok. 10 mm od krawędzi.
  - Tradeoff: Drukarka z marginesem < 9,5 mm zostaje przy dzisiejszym wydruku.
  - Confidence: HIGH — sama arytmetyka.
  - Blind spot: Zaokrąglenie obszaru druku iOS względem 191 mm.
- **Fix B**: Zmienne przycięcie i skala w JS (beforeprint).
  - Strength: Dokładne przycięcie.
  - Tradeoff: JS w druku; iOS w beforeprint nie zna obszaru druku.
  - Confidence: LOW.
  - Blind spot: Chrome i Brave na iOS.
- **Decision**: FIXED (Fix A)

### F2 — Na Letter zysk jest mały, a boczny pas zostaje

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: End-State Alignment
- **Location**: Desired End State, kryterium 3.2
- **Detail**: Letter: skala 0,855 → 0,914 (+7 %), ściany od boku ok. 26,7 → 21,2 mm; A4 ok. +10 %. Pas start/„Meta” (`labelBand`) nie jest insetem i zostaje.
- **Fix**: Liczby w Desired End State i kryterium 3.2; `labelBand` w NOT Doing.
- **Decision**: FIXED

### F3 — Dopiero ostatnia faza sprawdza, czy iOS odpali zapytanie

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Faza 1 → Faza 3
- **Detail**: Nie wiadomo, czy WebKit w druku liczy `max-width` względem obszaru druku; fallback nie był zapisany.
- **Fix**: Próba na iPhonie jako pierwszy krok fazy 1 (tymczasowa ramka, podgląd Workers Builds), wynik w change.md, fallback „wydruk jak dziś”.
- **Decision**: FIXED

### F4 — Selektor `#worksheet-home svg` łapie każde SVG, a kontener przycięcia nie ma nazwy

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architectural Fitness
- **Location**: Faza 1
- **Detail**: Wariant przesuwa i powiększa, więc trafiłby w każde widoczne SVG; `{sheet}` w `CardPage.tsx:152` nie ma wrappera.
- **Fix**: Wrapper `data-sheet` w CardPage; wariant celuje w niego; test kontraktowy pilnuje znacznika.
- **Decision**: FIXED

### F5 — Pomiar w fazie 2 niedookreślony, wyniki do archiwum

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Faza 2 i 3
- **Detail**: Brak wzoru odległości od krawędzi, spec na 4 projektach, sprawdzenie tylko znaku postaci, zapis do zarchiwizowanego manual-checks.md.
- **Fix**: Wzór i rozmiary papieru, tylko projekt `chromium`, bbox całej treści ≥ 9,5 mm, `manual-checks.md` w folderze zmiany.
- **Decision**: FIXED
