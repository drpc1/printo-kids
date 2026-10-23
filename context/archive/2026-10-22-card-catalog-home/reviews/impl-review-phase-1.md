<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Katalog kart na stronie głównej; labirynt pod /labirynt

- **Plan**: context/changes/card-catalog-home/plan.md
- **Scope**: Phase 1 of 3
- **Reviewed phases**: 1
- **Date**: 2026-10-23
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Evidence: commit 5f1adf1; `npm test` 135/135, `npm run lint`, `npx astro check` czyste, e2e `profile-level` (chromium) zielone; deliberate-break na `openingVisit` czerwienił testy; ręczne 1.5-1.8 potwierdził użytkownik.

## Findings

### F1 — Literał "none" zduplikowany w child-profiles.ts

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/child-profiles.ts:107
- **Detail**: `openingVisit` porównuje z literałem `"none"`, a stała `NO_PROFILE` żyje w `active-profile.ts`. Zmiana jednej wartości bez drugiej cicho zepsuje „Bez profilu”. Testy używają literału, więc też nie złapią rozjazdu.
- **Fix**: Zaimportować `NO_PROFILE` w `child-profiles.ts` (moduł nie ma zależności cyklicznej).
- **Decision**: FIXED

### F2 — Usunięcie innego profilu kasuje jawne „Bez profilu”

- **Severity**: OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: src/components/WorksheetGenerator.tsx:154
- **Detail**: Gdy zapisane jest `"none"` (nikt nie aktywny) i rodzic usuwa dowolny profil, `handleDeleted` czyści klucz. Przy jednym pozostałym profilu następne wejście wybiera go samo, mimo że rodzic wybrał „bez profilu”. Plan mówił o czyszczeniu po usunięciu aktywnego; ten przypadek jest nieopisany.
- **Fix**: W `handleDeleted` czyścić klucz tylko gdy usunięty profil był aktywny; w przeciwnym razie zachować `"none"`.
  - Strength: Zachowuje jawny wybór rodzica.
  - Tradeoff: Wymaga znajomości, czy usunięty był aktywny, i jednego testu.
  - Confidence: MED — zachowanie dotyczy rzadkiej ścieżki.
  - Blind spot: Brak automatycznego testu opakowania w komponencie.
- **Decision**: FIXED
