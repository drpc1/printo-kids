<!-- PLAN-REVIEW-REPORT -->

# Plan Review: S-35 Karta „Skopiuj rysunek na kratce”

- **Plan**: context/changes/copy-the-drawing-card/plan.md
- **Mode**: Deep (weryfikacja lokalna, bez subagenta)
- **Date**: 2026-11-09
- **Verdict**: REVISE (po triage: SOUND)
- **Findings**: 0 critical, 2 warnings, 1 observations

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | WARNING |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | PASS    |
| Plan Completeness     | WARNING |

## Grounding

13/13 ścieżek i symboli istnieje (jedna z nich pod inną ścieżką niż w planie), brief↔plan ✓, Progress↔fazy ✓.

## Findings

### F1 — Szerokie obiekty (autobus, auto, chmurka) zajmują kilka górnych wierszy siatki

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: End-State Alignment
- **Location**: Key Discoveries i Faza 2, punkt 3 (generator)
- **Detail**: `nonogramImage` przykleja sylwetkę do górnego wiersza (`clues.ts:37`). Makieta trudnego z autobusem (`mockup-trudny-obok.svg`) pokazuje sylwetkę w górnych ok. 45% siatki, a dolna część obu kratek jest pusta. Plan uznał to za zaakceptowane, ale użytkowniczka zaakceptowała makietę zbiorczo, a rzut oka na trudny pokazuje, że przerysowanie szerokiego obiektu zużywa kratkę słabo.
- **Fix A ⭐ Recommended**: Wyśrodkować sylwetkę w pionie wewnątrz karty (przesunięcie wierszy `pattern` w `copy-drawing/card.ts`, `nonogramImage` bez zmian)
  - Strength: Obie kratki wyglądają równo, przerysowanie dotyczy środka siatki, a katalog wspólny zostaje nietknięty.
  - Tradeoff: `not-silhouette` porównuje wzór z przesuniętą sylwetką (przesunięcie liczone jedną funkcją w karcie i w sprawdzeniu); jedna funkcja więcej.
  - Confidence: HIGH — przesunięcie wierszy to czysta funkcja na `boolean[][]`, test ją sprawdza.
  - Blind spot: Czy wyśrodkowanie lepiej wygląda na papierze niż góra; potwierdza wydruk.
- **Fix B**: Zostawić górę siatki
  - Strength: Zero dodatkowego kodu, zgodne z nonogramem.
  - Tradeoff: Szerokie obiekty zostawiają puste dolne wiersze obu kratek.
  - Confidence: MEDIUM — wygląd na wydruku niezweryfikowany.
  - Blind spot: Liczba obiektów szerokich w kategoriach.
- **Decision**: FIXED

### F2 — Plan wskazuje zły adres `sheet-state.ts`

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Current State Analysis; `research.md`
- **Detail**: Plan i research podają `src/lib/sheet/sheet-state.ts:61-74`. Plik leży w `src/lib/sheet-state.ts` (katalog `src/lib/sheet/` go nie zawiera).
- **Fix**: Poprawić ścieżkę w `plan.md` i `research.md`.
- **Decision**: FIXED

### F3 — Brak warunku „pusta prawa kratka” w sprawdzeniu karty

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Faza 2, punkt 2
- **Detail**: Karta niesie jeden `pattern` dla obu siatek, więc „prawa pusta” wynika z arkusza, nie z danych karty. Test e2e (faza 3) to sprawdza w DOM, ale kontrakt nie.
- **Fix**: Dodać w e2e i w teście arkusza asercję, że prawa siatka nie ma zamalowanych kratek.
- **Decision**: FIXED

## Weryfikacja niezależna (subagent, 2026-11-09)

Potwierdzone w kodzie: eksporty `nonogramVariants` i `symmetryTemplatesFor` wystarczają bez zmian katalogu; każda kombinacja poziom × kategoria ma co najmniej 18 różnych kart (min. średni × budowle); `nonogramImage` nie rzuca i daje niepustą, niepełną sylwetkę dla wszystkich kombinacji; wysokość sylwetki 5–12 z 12 (łatwy), 7–15 z 15 (średni), 9–24 z 24 (trudny); reguły depcruise nie blokują nowego modułu; `parseCard` waliduje `category` po nazwie pola, a `levelIds` wymaga nowego `case`.

Poprawki naniesione w planie: wysokość sylwetki liczona od pierwszego do ostatniego zamalowanego wiersza (zamiast „ok. 45%” pomiar 38%), `phone-layout.spec.ts` to osobny test, nie tabela kart.
