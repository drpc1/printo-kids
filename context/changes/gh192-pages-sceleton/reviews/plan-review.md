<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Wspólny szkielet strony karty (GH 192)

- **Plan**: context/changes/gh192-pages-sceleton/plan.md
- **Mode**: Deep (lokalnie, bez sub-agenta)
- **Date**: 2026-10-30
- **Verdict**: REVISE (po poprawkach: SOUND)
- **Findings**: 0 critical, 3 warnings, 2 observations

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | WARNING |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | WARNING |

## Grounding

6/6 istniejących ścieżek ✓ (CardPage.tsx, useCardPage.ts do utworzenia), symbole ✓, brief↔plan ✓, Progress↔fazy ✓

## Findings

### F1 — Faza 2 wymaga e2e, które z założenia zepsuje

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM
- **Dimension**: Blind Spots
- **Location**: Faza 2 (2.4), Faza 4
- **Detail**: Test Nonogramu w phone-settings-rows.spec.ts:109-138 zakłada trzy osobne linie Postać/Poziom/Kategoria; ujednolicony wiersz może to zmienić, a spec był przepisywany dopiero w fazie 4.
- **Fix**: Przepisać ten test w fazie 2 na reguły niezależne od liczby linii.
- **Decision**: FIXED (plan: Faza 2, wpis 4)

### F2 — Kształt propsów CardPage zostawiony do zgadnięcia

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM
- **Dimension**: Plan Completeness
- **Location**: Faza 2 pkt 1, Faza 3 pkt 1
- **Detail**: Faza 2 brała wynik useCardPage(), faza 3 dopuszczała osobne propsy dla labiryntu.
- **Fix**: CardPage przyjmuje zwykłe dane od początku.
- **Decision**: FIXED (plan: Faza 2 pkt 1, Faza 3 pkt 1)

### F3 — Testy e2e szukają kontenera po klasie flex-wrap

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW
- **Dimension**: Plan Completeness
- **Location**: Faza 2 pkt 2
- **Detail**: phone-settings-rows.spec.ts:74 i phone-toggle-align.spec.ts:45 używają ancestor::div[contains(@class,'flex-wrap')][1].
- **Fix**: Dopisać do kontraktu wiersza zachowanie klasy flex-wrap.
- **Decision**: FIXED

### F4 — Faza 2 łączy przeniesienie kodu i zmianę wyglądu

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🔎 MEDIUM
- **Dimension**: Lean Execution
- **Location**: Faza 2
- **Detail**: Regresję układu trudniej przypisać do przeniesienia albo do nowego wiersza.
- **Fix**: Podział na 2a i 2b (wymaga tymczasowego slotu).
- **Decision**: ACCEPTED (zostaje jedna faza)

### F5 — Zmiana testu druku w fazie 1 bez własnego wpisu

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Plan Completeness
- **Location**: Faza 1 pkt 2
- **Detail**: Przeniesienie asercji useBarCharacter( było opisane tylko w kontrakcie kart.
- **Fix**: Osobny wpis print-contract.test.ts w fazie 1.
- **Decision**: FIXED (plan: Faza 1, wpis 3)
