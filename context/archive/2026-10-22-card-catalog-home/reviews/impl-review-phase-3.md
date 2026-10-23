<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Katalog kart na stronie głównej; labirynt pod /labirynt

- **Plan**: context/changes/card-catalog-home/plan.md
- **Scope**: Phase 3 of 3
- **Reviewed phases**: 3
- **Date**: 2026-10-23
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Evidence: commit 408ffbc (w main przez PR #64), CI zielone (ci, smoke, Workers Builds), lokalnie po merge'u `npm test` 137/137, lint, `astro check`, build, e2e 38 zielonych. Skrypt miniatury deterministyczny (dwa przebiegi, ten sam hash). Deliberate-break testu persystencji profilu czerwienił e2e. Kroki ręczne 3.6–3.9 potwierdził użytkownik. Zmiany po planie na prośbę użytkownika: wyśrodkowany tytuł karty, ikona Home zamiast tekstu (z `title` i `aria-label`), hover jak ghost.

## Findings

### F1 — collectWalls w walls.ts nie ma testu jednostkowego

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/sheet/walls.ts:11
- **Detail**: Funkcja została wyniesiona z komponentu bez zmiany zachowania i jest teraz wspólna dla karty i skryptu miniatury. Chronią ją tylko e2e i ręczne oko; test jednostkowy jest tani (np. maze 1×1 z czterema ścianami, ściany wewnętrzne bez duplikatów).
- **Fix**: Dodać `walls.test.ts` i dopisać go do skryptu `test` w package.json.
- **Decision**: FIXED (walls.test.ts, 4 testy; break-check na `col === 0` czerwienił 2 testy)

### F2 — Plan opisuje link „Wszystkie karty” jako tekst, kod ma ikonę Home

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/card-catalog-home/plan.md (Phase 2, GeneratorShell)
- **Detail**: Po prośbie użytkownika link to ikona 44×44 px z `title` i `aria-label`, hover jak ghost (brązowe tło). Plan wciąż mówi o tekście; po archiwizacji plan zostanie tak jako źródło prawdy.
- **Fix**: Dopisać krótki addendum do planu przed archiwizacją.
- **Decision**: SKIPPED (decyzja użytkownika)

### F3 — Strony `/` i `/labirynt` mają ten sam `<title>`

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/pages/labirynt.astro:6
- **Detail**: Obie używają tytułu „PrintoKids”. Karty przeglądarki i historia nie odróżniają katalogu od generatora, a S-12 doda trzecią stronę.
- **Fix**: Tytuł generatora np. „Labirynt – PrintoKids”, katalog bez zmian.
- **Decision**: SKIPPED (decyzja użytkownika)
