<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: „Jak to działa” przy 16 kartach: zwijane wiersze

- **Plan**: context/changes/how-it-works-m7/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-11-24
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 4 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

Success criteria: all automated gates were run and green at the end of phase 3 (`npm test` 2086/2087 with one skipped, depcruise, lint, astro check, build, e2e `how-it-works.spec.ts` 6/6, deliberate-break check red as expected); all manual rows were confirmed by the user.

## Findings

### F1 — „Kto ma więcej” pokazuje poziomy tylko dla złotych

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/card-levels.ts:76
- **Detail**: `moneyLevels("pln")` daje opisy „monety 1, 2 i 5 zł…”, ale karta ma też euro i dolary z innymi nominałami (euro: „monety 1 i 2 €…”, dolary: „banknoty 1 i 5 $…”, bez monet). Rodzic wybierający euro czy dolary widzi na stronie opis niezgodny z paskiem. Zweryfikowane: opisy trzech walut różnią się.
- **Fix A ⭐ Recommended**: Trzy grupy z nagłówkami „Złote”, „Euro”, „Dolary”, każda z poziomami swojej waluty.
  - Strength: Mechanizm grup już istnieje (sudoku), strona nie zmienia się, opisy pochodzą z tych samych danych co pasek.
  - Tradeoff: Wiersz karty robi się o 6 linii dłuższy (9 wierszy poziomów).
  - Confidence: HIGH — `moneyLevels(currency)` jest już funkcją waluty, a test rejestru i strona obsługują grupy.
  - Blind spot: Czy trzy waluty nie przytłoczą jednego wiersza; do oceny na ekranie.
- **Fix B**: Zostawić złote i dopisać krótką uwagę „w złotych; euro i dolary mają inne nominały”.
  - Strength: Najmniejsza zmiana.
  - Tradeoff: Rodzic dalej nie widzi poziomów swojej waluty.
  - Confidence: MEDIUM — zależy, czy uwaga wystarczy.
  - Blind spot: Nie sprawdzone, jak często rodzice używają euro i dolarów.
- **Decision**: FIXED via Fix A (trzy grupy walut; test dopisany)

### F2 — Nagłówek `h3` wewnątrz `<summary>`

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/pages/how-it-works.astro:56-57
- **Detail**: Plan zakładał `h3` w `<summary>`. Część czytników ekranu traktuje zawartość `summary` jak przycisk i może pominąć `h3` w nawigacji po nagłówkach. Test e2e sprawdza role w drzewie Chromium, więc tego nie wykryje.
- **Fix A ⭐ Recommended**: Zostawić jak jest i zapisać jako znany kompromis.
  - Strength: Natywny `<details>` działa bez JS, a pasek klawiatury i fokus są poprawne.
  - Tradeoff: Nawigacja czytnikiem po nagłówkach może pomijać tytuły kart.
  - Confidence: MEDIUM — oparte na opisie zachowania czytników, bez testu na prawdziwym czytniku.
  - Blind spot: Nie sprawdzone w NVDA/VoiceOver.
- **Fix B**: Przenieść `h3` poza `<details>`, a `summary` zrobić zwykłą etykietą.
  - Strength: Nagłówki pewnie widoczne dla czytników.
  - Tradeoff: Zmiana struktury i testu; tytuł kliknięty nie rozwija, chyba że `summary` go powtarza.
  - Confidence: LOW — wymaga ponownego sprawdzenia układu.
  - Blind spot: Podwójne odczytanie tytułu.
- **Decision**: ACCEPTED via Fix A: znany kompromis, `h3` w `<summary>` zostaje; nie sprawdzano w NVDA ani VoiceOver

### F3 — Rzutowanie `card.id as CardKindId`

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/pages/how-it-works.astro:73
- **Detail**: `cardsInCatalogOrder()` zwraca `CardKind[]` z `id: string`, więc strona rzutuje. Dziś niemożliwy rozjazd, ale rozszerzenie typu dałoby TypeError i 500 na SSR.
- **Fix**: Zawęzić zwracany typ `cardsInCatalogOrder` do `(typeof CARD_KINDS)[number][]` i usunąć rzutowanie.
- **Decision**: FIXED (typ zwracany `cardsInCatalogOrder` zawężony, rzutowanie usunięte)

### F4 — Komentarz „te same dane co pasek” jest przesadzony

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/card-levels.ts:71-93
- **Detail**: Wiersz sudoku 4×4 („jeden poziom”) jest wpisany ręcznie i nie pochodzi z danych paska.
- **Fix**: Zawęzić komentarz („z tych samych danych co pasek, poza wierszem sudoku 4×4”).
- **Decision**: FIXED (komentarz zawężony o wiersz sudoku 4×4)

### F5 — E2E tylko na Chromium

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/how-it-works.spec.ts
- **Detail**: Wszystkie testy są pomijane na projektach telefonicznych i tabletowych, więc układ `<details>` na wąskich ekranach sprawdzono tylko ręcznie (375 px w fazie 2). Zgodne z regułą pliku „layout-independent flow”.
- **Fix**: Zaakceptować; ręczne sprawdzenie 375 px zostaje dowodem.
- **Decision**: ACCEPTED (e2e tylko na Chromium zgodnie z regułą pliku; 375 px sprawdzone ręcznie)

### F6 — PRD US-05 nie wspomina o poziomach w rozwiniętym wierszu

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/foundation/prd.md (US-05, zdanie „Od S-53 …”)
- **Detail**: Zdanie mówi o opisie i linku, a rozwinięty wiersz pokazuje też poziomy karty.
- **Fix**: Dopisać „poziomy karty” do zdania.
- **Decision**: FIXED (PRD US-05: dopisane „poziomy karty”)
