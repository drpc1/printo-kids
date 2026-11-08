<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Kolory na karcie „Kto ma więcej?”

- **Plan**: context/changes/coins-colors/plan.md
- **Mode**: Deep (bez sub-agenta, sprawdzenie lokalne)
- **Date**: 2026-11-08
- **Verdict**: REVISE
- **Findings**: 1 critical, 3 warnings, 1 observation

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | FAIL    |
| Lean Execution        | WARNING |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | WARNING |

## Grounding

Paths 9/9 ✓ (MoneyGenerator, sheet, engine, card-settings, card-summary, card-contract, 3 e2e), symbole `knownBad`, `SpeechBand <image>` ✓; brief↔plan: plan opisuje jeszcze „makietę”.

## Findings

### F1 — Desired End State zabrania godeł i portretów, a wybrane obrazki je mają

- **Severity**: ❌ CRITICAL
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: End-State Alignment
- **Location**: Desired End State, 4. punkt
- **Detail**: Punkt mówi „bez zabezpieczeń, godeł, portretów”, ale obrazki użytkowniczki mają orła i profil władcy. Wszystkie kryteria mogłyby przejść, a stan końcowy łamałby własne zdanie planu.
- **Fix**: Zamienić na „stylizowane obrazki użytkowniczki; bez zabezpieczeń i dokładnych wzorów NBP; nie uchodzą za prawdziwy pieniądz”.
- **Decision**: FIXED

### F2 — Tokeny `--money-*` i `colors.ts` z nazwami tokenów nie mają sensu przy obrazkach

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Lean Execution
- **Location**: Faza 3, punkty 1, 2, 2b; Implementation Approach
- **Detail**: Faza 3 buduje tokeny kolorów i moduł „nominał → nazwy tokenów” oraz stałe pierścienia i paska, a wygląd to gotowe PNG. Kolory siedzą w pikselach, więc tokeny byłyby martwe.
- **Fix A ⭐ Recommended**: Usunąć tokeny i stałe pierścienia; `colors.ts` zwraca ścieżkę obrazka dla nominału (null przy wyłączonych kolorach), test: każdy nominał poziomów ma plik w `public/money/`.
  - Strength: Mało kodu, test pilnuje brakującego pliku.
  - Tradeoff: Brak motywowania ekranu tokenami (nie dotyczy rastrów).
  - Confidence: HIGH — AGENTS.md zabrania hexów, a tu ich nie ma.
  - Blind spot: Wersje ciemnego motywu, jeśli kiedyś.
- **Fix B**: Zostawić moduł tylko na nazwę pliku i pominąć test.
  - Strength: Szybciej.
  - Tradeoff: Brak testu na brakujący plik.
  - Confidence: MED — pliki są ręcznie wycięte.
  - Blind spot: Literówka w nazwie wychodzi dopiero w przeglądarce.
- **Decision**: FIXED

### F3 — Progress i faza 1 opisują nieistniejący skrypt makiety

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Progress 1.1, 1.2; Status w nagłówku; `scripts/money-colors-mockup.mjs`
- **Detail**: 1.1 jest odhaczone i wskazuje skrypt, który plan sam uznaje za odpadły, a plik wciąż jest w git. Status mówi o „makiecie”, a 1.2 o „ocenie makiety”.
- **Fix**: Usunąć skrypt (`git rm`), 1.1 zamienić na „obrazki w `public/money/`”, 1.2 na „użytkowniczka potwierdza obrazki na wydruku w rozmiarze karty”, poprawić status.
- **Decision**: FIXED

### F4 — Proporcje i rozmiary obrazków nie pasują do stałych karty

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Faza 3, 2b i 3; `src/lib/money/sheet.ts`
- **Detail**: Banknoty mają proporcje ok. 2,0 (547×278, 559×278), a karta 18×10 mm = 1,8; monety wycięto na różnych promieniach (155, 165, 178 px), więc po wstawieniu w to samo koło wielkość mogłaby zdradzać wartość. Plan mówi „wymiary bez zmian”, ale nie rozstrzyga, czy obrazek się rozciąga, czy ma pasy.
- **Fix A ⭐ Recommended**: Zmienić `noteHeight` na 9 mm (18×9 = 2,0), skalować monety do tej samej średnicy (znormalizować promień) i zaktualizować testy układu.
  - Strength: Brak zniekształceń; ta sama wielkość kawałków zostaje.
  - Tradeoff: Dotyka `layout.ts` i jego testów (dziś plan mówi „bez zmian”).
  - Confidence: MED — wysokość wiersza kupki może zależeć od 10 mm.
  - Blind spot: Zmiana układu kart już wydrukowanych.
- **Fix B**: Zostawić 18×10 i wstawić obrazek z `preserveAspectRatio="meet"` (pasy ok. 0,5 mm góra/dół).
  - Strength: Zero zmian w układzie.
  - Tradeoff: Banknot mniejszy o ok. 10%, liczby mniejsze.
  - Confidence: HIGH.
  - Blind spot: Czytelność pionowej liczby na 16 mm szerokości.
- **Decision**: FIXED

### F5 — Obrazki rastrowe: ładowanie przed drukiem i rozmiar plików

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Faza 3, rysowanie i testy
- **Detail**: Druk zaraz po przełączeniu „Kolory” może ruszyć, zanim `<image>` się załaduje (postacie już tak działają w `SpeechBand.tsx`, więc jest wzór). W `public/money/` leży 15 PNG (ok. 2 MB), z czego 10 niewykorzystanych, wdrażanych na produkcję. Rastry zwiększają ciężar karty.
- **Fix**: Dodać do e2e sprawdzenie, że obrazki są załadowane przed Drukuj (jak dla postaci), zważyć PNG (np. kwantyzacja) przed wdrożeniem, a niewykorzystane zostawić świadomie.
- **Decision**: FIXED
