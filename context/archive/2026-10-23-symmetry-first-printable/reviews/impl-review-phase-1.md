<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Karta symetrii na A4 (S-12)

- **Plan**: `context/changes/symmetry-first-printable/plan.md`
- **Scope**: Phase 1 of 4
- **Reviewed phases**: 1
- **Date**: 2026-10-23
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 4 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | WARNING |

Commit `d2667ee`. Automatyka ponownie: `npm test` 166/166, `npm run lint` 0, `npx astro check` 0 błędów. Ręczne 1.4 potwierdzone przez użytkownika na renderze wszystkich 20 wariantów. Dodatki poza planem (`composeSymmetryCard`, `symmetryRowOffsets`, `SYMMETRY_AXIS_OVERHANG`, rzut przy `instructionGap < overhang`) są drobne i uzasadnione testem wyczerpującym i układem.

## Findings

### F1 — Testy układu nie trzymają granicy ani wysunięcia osi

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: `src/lib/symmetry/layout.test.ts`
- **Detail**: Test „za duża siatka rzuca błąd” sprawdza tylko wartości daleko za granicą (13 kolumn, 18 wierszy, 16 mm). Mutant `>` → `>=` zostaje zielony; 17 wierszy (274 ≤ 277 mm) mieści się i nie jest sprawdzone. Oś jest sprawdzana tylko nierównościami, więc zmiana wysunięcia z 4 mm na 1 mm przechodzi.
- **Fix**: Dodać `assert.doesNotThrow` dla największej mieszczącej się siatki i rzut tuż za nią oraz dokładne `axis.y1 === grid.y − SYMMETRY_AXIS_OVERHANG` i `axis.y2 === grid.y + grid.height + SYMMETRY_AXIS_OVERHANG`.
- **Decision**: FIXED — granica 17/18 wierszy, blok wypełniający margines dokładnie, dokładne y1/y2 osi

### F2 — Testy szablonów wpisują 6 kolumn i 16 wierszy na sztywno

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `src/lib/symmetry/generate.test.ts:133-142`
- **Detail**: Ramka szablonu jest sprawdzana literałami 6 i 16 zamiast `SYMMETRY_SETTING.columns / 2` i `SYMMETRY_SETTING.rows`. Gdy S-13 zmieni siatkę, test dalej będzie pilnował starej.
- **Fix**: Wyprowadzić granice z `SYMMETRY_SETTING`.
- **Decision**: FIXED — granice z SYMMETRY_SETTING

### F3 — Szablon wyższy niż siatka kończy się cichym null

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: `src/lib/symmetry/generate.ts` (`symmetryRowOffsets`, `pick`)
- **Detail**: Przy szablonie wyższym niż `rows` liczba przesunięć to 0, `pick(random, 0)` daje −1, kratki wypadają z siatki, walidator odrzuca i po 20 próbach wraca `null`. Dziś niemożliwe (wszystkie szablony mają 15 wierszy), ale S-13 doda inne siatki i błąd szablonu wyglądałby jak „Nie udało się ułożyć karty.”. Ten sam przypadek dotyczy kratek z niecałkowitymi współrzędnymi, które walidator przepuszcza.
- **Fix**: Rzucić czytelny błąd, gdy szablon nie mieści się w siatce, a w walidatorze dodać `Number.isInteger` dla `col` / `row`.
- **Decision**: FIXED — rzut dla za wysokiego szablonu, Number.isInteger w walidatorze, testy

### F4 — Ten sam obrazek przesunięty o wiersz liczy się jako nowa karta

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `src/lib/symmetry/generate.ts` (`generateSymmetryCard`, klucz)
- **Detail**: Klucz zawiera przesunięcie, więc kolejne Generuj może dać tę samą rakietę o wiersz niżej. To zgodne z decyzją planu („części + przesunięcie”, „inna niż poprzednia”), ale dla rodzica może wyglądać jak powtórka.
- **Fix**: Zostawić; dopisać to zachowanie w komentarzu generatora, a jeśli wydruk pokaże, że myli, porównywać klucz bez przesunięcia.
- **Decision**: ACCEPTED — zachowanie zgodne z planem, opisane w komentarzu generateSymmetryCard

### F5 — Dziury zamiast kolorów zmieniają założenie S-15

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `src/lib/symmetry/templates.ts`, `context/foundation/roadmap.md` (S-15 Risk)
- **Detail**: Okno rakiety, oczy robota i pestki truskawki są pustymi kratkami, żeby czarna sylwetka była czytelna. Ryzyko S-15 mówi, że szablony z S-12 niosą kolor każdej kratki; w trybie kolorów te miejsca będą białe, a nie niebieskie czy żółte.
- **Fix**: Dopisać to do Unknowns S-15 w roadmapie (np. czy w trybie kolorów dziury wypełnić kolorem).
- **Decision**: FIXED — pytanie dopisane do Unknowns S-15 w roadmapie
