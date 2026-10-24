<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Poziomy karty sekwencji (S-17)

- **Plan**: context/changes/sequence-difficulty-levels/plan.md
- **Scope**: Full plan (phases 1–3 of 3)
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-24
- **Verdict**: APPROVED
- **Findings**: 0 critical, 2 warnings, 4 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Verification

- Dwóch recenzentów (zgodność z planem; bezpieczeństwo, jakość i wzorce) czytało diff 650e1bc..HEAD. Zgodność: wszystkie zaplanowane zmiany są (MATCH); odchylenia świadome: `gaps` + `extraGapRows` zamiast `gapCounts`/`multiGapRows`, dedupe po samych wartościach, dodatkowy `random.ts`, brak `maxGaps` po pomiarze. „Czego nie robimy” zachowane (`GenerateButton.tsx`, `SymmetryLevelChoice.tsx`, `src/lib/cards.ts` bez zmian).
- Bramki w tej sesji po fazie 3: `npm test` 316/316, lint czysty, `astro check` 0 błędów, build przechodzi, smoke przechodzi, e2e (katalog + telefon) 53 zielone / 31 pominiętych na własnym porcie. Break-checki: walidator (faza 1), układ (faza 2), e2e (faza 3) — czerwone.
- Recenzent uruchomił 500 losowań na poziom: 0 odrzuconych kart, 0,27–0,76 ms na kartę.
- Ręczne 1.5–1.6, 2.5–2.8, 3.8–3.12 potwierdzone przez użytkowniczkę.

## Findings

### F1 — Następna karta może mieć te same ciągi, różniąc się tylko ukrytymi polami

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/sequence/generate.ts:287, 333-335
- **Detail**: `key` karty zawiera położenie luk, a dedupe wierszy (`valuesKey`) je pomija. Na 5 lat (druga luka w polu 5 lub 6) i na 6–7 lat (luki dowolne) kolejna karta może mieć identyczne ciągi i inne luki, a nadal różnić się od poprzedniej kluczem. PRD (US-10): każde Generuj daje „inne reguły albo inne elementy”.
- **Fix**: Zbudować `key` karty z `valuesKey` wierszy (reguła i wartości, bez luk) i dodać test, że dwie karty z tymi samymi ciągami i innymi lukami mają ten sam klucz.
- **Decision**: PENDING

### F2 — Wyrocznia sprawdza tylko karty z generatora, a ujemna strona walidatora ma dwa przypadki

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/sequence/generate.test.ts:157-174, 278-297
- **Detail**: Wyrocznia (niezależna w kodzie, 24 symbole) potwierdza, że wiersze z generatora mają jedną odpowiedź. Odrzucanie dwuznacznych wierszy (`ambiguous`) pilnują tylko dwa ręczne przypadki. Walidator i wyrocznia kodują ten sam zbiór reguł, więc test nie wykryje braku reguły w zbiorze, tylko błąd implementacji.
- **Fix A ⭐ Recommended**: Dla stałych wierszy (po jednym na regułę) przejść po wszystkich zestawach luk i sprawdzić, że `sequenceRowProblems` zawiera `ambiguous` dokładnie wtedy, gdy wyrocznia znajdzie więcej niż jedno wypełnienie.
  - Strength: Prawdziwa kontrola walidatora z obu stron; wyłapie np. zepsutą przestrzeń hipotez.
  - Tradeoff: Dłuższy test (dla 3 luk 24³ wypełnień na zestaw), trzeba ograniczyć liczbę zestawów.
  - Confidence: HIGH — wyrocznia już istnieje i jest użyta w tym samym pliku.
  - Blind spot: Nie wykryje reguły, której brakuje w obu zbiorach.
- **Fix B**: Dopisać do komentarza wyroczni, że kompletność zbioru reguł jest poza zakresem testu.
  - Strength: Zero kosztu, uczciwy opis.
  - Tradeoff: Nie zamyka luki w teście.
  - Confidence: HIGH — to tylko dokumentacja.
  - Blind spot: Brak.
- **Decision**: PENDING

### F3 — Zmiana poziomu przy czekającym wyborze dziecka zostawia kartę innego poziomu

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Pattern Consistency
- **Location**: src/components/SequenceGenerator.tsx:44-66
- **Detail**: Gdy `waitingForChild` jest prawdą (lub generowanie zawiedzie), zmiana poziomu zmienia przycisk, a karta na ekranie zostaje stara. Wydruk wtedy nie odpowiada etykiecie. `SymmetryGenerator.tsx:67-72` zachowuje się tak samo, więc to zgodność ze wzorcem, nie regresja.
- **Fix**: Zostawić (jedna decyzja dla obu stron); ewentualnie osobna zmiana, która wyłącza przycisk poziomu, gdy profil czeka na wybór dziecka.
- **Decision**: PENDING

### F4 — Trzecia kopia okna poziomu

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/components/SequenceLevelChoice.tsx
- **Detail**: Plik jest kopią `SymmetryLevelChoice.tsx` z innymi typami. To świadoma decyzja planu (unikanie konfliktów z #81 i S-19), tak jak kopie `GenerateButton` w S-16.
- **Fix**: Osobna zmiana po scaleniu S-17 i S-19: wspólny `LevelChoice<T>`.
- **Decision**: PENDING

### F5 — E2E nie odróżnia 6 lat od 7 lat, a nazwa jednego testu mylna

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/catalog.spec.ts (nowy test), src/lib/sequence/generate.test.ts:~349
- **Detail**: 6 i 7 lat mają po 56 pól, więc e2e potwierdza tylko, że karta się zmieniła. Test „a card of five rows is reported” obcina jeden wiersz z karty sześciowierszowej.
- **Fix**: Dla 6 lat sprawdzić w e2e obecność liczb w SVG (`locator("text")`), dla 7 lat dodatkowo kształt i liczbę; poprawić nazwę testu.
- **Decision**: PENDING

### F6 — Open Questions 9 w PRD nie ma wpisu po druku

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/foundation/prd.md (Open Questions 9)
- **Detail**: Plan (3.11) kazał zapisać uwagi z wydruku w Open Questions 9. Użytkowniczka potwierdziła punkty bez uwag, więc nic nie dopisano, ale pytanie 9 wciąż mówi o niepotwierdzonych wartościach sekwencji.
- **Fix**: Dopisać do pytania 9 zdanie, że wartości poziomów sekwencji potwierdził wydruk z 2026-10-24 (sudoku nadal otwarte).
- **Decision**: PENDING
