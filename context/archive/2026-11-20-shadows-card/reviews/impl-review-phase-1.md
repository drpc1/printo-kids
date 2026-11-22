<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Cienie (S-47) — plan implementacji

- **Plan**: context/changes/shadows-card/plan.md
- **Scope**: Phase 1 of 4
- **Reviewed phases**: 1
- **Date**: 2026-11-21
- **Verdict**: APPROVED
- **Findings**: 0 critical, 2 warnings, 2 observations

Przegląd zrobiony w głównej sesji bez agentów (mały zakres: 7 nowych plików, `global.css`, `package.json`, dokumenty; użytkowniczka prosiła o oszczędzanie tokenów).

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Automatyczne: prettier, `npm test` (jeden znany niestabilny limit czasu w `pattern-lines/generate.test.ts` przy obciążonej maszynie — osobno 11/11; testy `shadows` 10/10), `npm run lint`, `npm run depcruise`, `npx astro check` (0 błędów), `npm run build` — przechodzą. Ręczne 1.7 (akceptacja arkusza) czeka na użytkowniczkę.

## Findings

### F1 — Glosariusz nie miał nazw z kodu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/domain/glossary.md (wiersze „Cień”, „Rodzina”)
- **Detail**: Plan (faza 1, punkt 1) każe dopisać `ShadowPicture` i `ShadowFamily`, gdy nazwy różnią się od „planowane”; wiersze miały `shadow` / `family`.
- **Fix**: Wpisać `shadowMask`, `ShadowPicture`, `ShadowFamily`, `SHADOW_FAMILIES`.
- **Decision**: FIXED

### F2 — Rysunki w dwóch plikach zamiast dwunastu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/shadows/pictures/warianty.ts, rozne.ts
- **Detail**: Plan wymieniał `pictures/<rodzina>.ts` (12 plików); kod ma po sześć rodzin w pliku według rodzaju. Kontrakt (`SHADOW_FAMILIES`) bez zmian.
- **Fix**: Dopisek w planie (punkt 3 fazy 1).
- **Decision**: FIXED

### F3 — Maska pomija obrys i zaokrąglenie prostokąta

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/shadows/raster.ts (`shapeContains`)
- **Detail**: Kontur 1,6 i `rx` nie wchodzą do maski; różnica pól to ułamek procenta, a najbliższa para ma 11,7% przy progu 8%.
- **Fix**: Bez zmian; wrócić, jeśli wydruk podważy próg (faza 4).
- **Decision**: ACCEPTED

### F4 — Rysowanie w dwóch przejściach dodane po uwadze o choince

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/shadows-card/catalog.mts (`pictureAt`), plan faza 3 punkt 2
- **Detail**: Obrys wszystkich części pod spodem, wypełnienia na wierzchu, żeby zachodzące części jednego koloru nie miały kreski w środku. Zapisane w kontrakcie strony w planie (faza 3).
- **Fix**: Bez zmian; strona w fazie 3 robi to samo.
- **Decision**: ACCEPTED
