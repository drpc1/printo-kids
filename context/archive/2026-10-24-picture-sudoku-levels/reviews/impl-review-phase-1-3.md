<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Sudoku: rozmiary, poziomy i cyfry

- **Plan**: context/changes/picture-sudoku-levels/plan.md
- **Scope**: Phases 1–3 of 4 (faza 4 jeszcze niezrobiona)
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-24
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | PASS    |

Automated na HEAD 7ac483f (bez zmian kodu od ostatniego biegu): `npm test` 324/324, `npm run lint` czysto, `astro check` 0 błędów, `npm run build` przechodzi, e2e sudoku (4 projekty) 8/8. Kontrole z celowym złamaniem w fazach 2 i 3 poszły na czerwono. Kroki ręczne 3.4–3.7 czekają na użytkowniczkę.

## Findings

### F1 — Zmiana ustawienia podczas `waitingForChild` zostawia kartę niezgodną z paskiem

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/SudokuGenerator.tsx (handleSettingChange)
- **Detail**: `handleSettingChange` zapisuje nowe ustawienia, ale gdy `waitingForChild` jest prawdą, pomija generowanie. Pasek pokazuje wtedy np. „Rozmiar: 9×9”, a na ekranie zostaje karta 4×4, aż rodzic kliknie Generuj. Plan wskazał tę samą bramkę co przy Generuj (jak w symetrii `SymmetryGenerator.tsx:58-63`), więc to zgodne z wzorcem, ale rozjazd jest widoczny dla rodzica.
- **Fix**: Przy `waitingForChild` nie zmieniać ustawień (return przed `setSettings`), tak by pasek i karta zawsze się zgadzały.
- **Decision**: FIXED (return przed setSettings przy waitingForChild)

### F2 — `SudokuChoice` powiela prawie cały `SymmetryLevelChoice`

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Pattern Consistency
- **Location**: src/components/SudokuChoice.tsx, src/components/SymmetryLevelChoice.tsx
- **Detail**: Dwa komponenty przycisku z oknem różnią się etykietą i typem opcji. Plan świadomie wybrał nowy komponent obok symetrii; trzeci rodzaj karty z poziomem (sekwencje, S-17) powieli to po raz trzeci.
- **Fix**: Osobna zmiana: przepisać `SymmetryLevelChoice` na cienką nakładkę na `SudokuChoice` (po zmianie nazwy na ogólną), razem z unifikacją `GenerateButton` (F2 z przeglądu S-18).
  - Strength: Jeden komponent do zmiany układu na telefonie.
  - Tradeoff: Dotyka symetrii i jej testów e2e, poza zakresem S-19.
  - Confidence: HIGH — różnice zweryfikowane w obu plikach.
  - Blind spot: S-17 równolegle może dodać własną kopię.
- **Decision**: FIXED differently (przepięcie na wspólny GenerateButton z main po scaleniu; okno wyboru zostaje osobną zmianą)

### F3 — Miniatura i test kontraktu pojawiły się wcześniej niż w planie

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: public/thumbnails/sudoku.svg (faza 2), src/lib/sheet/print-contract.test.ts (faza 3)
- **Detail**: Miniaturę odbudowano już w fazie 2 (plan: faza 4), bo skrypt miniatury i tak przepinano na nowy generator, a polecenie zmieniło się na dwie linie. Test `print:hidden` okna wyboru dodano w fazie 3 (plan wymienił dostosowanie asercji). Oba są zgodne z intencją planu i bez ryzyka.
- **Fix**: Brak; faza 4 pkt 1 sprowadza się do sprawdzenia, że `npm run thumbnails` nie zmienia pliku.
- **Decision**: SKIPPED (bez działania)
