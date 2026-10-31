<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: S-32 Strona „Jak to działa”

- **Plan**: context/changes/s32-how-does-it-work/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-31
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 1 observation

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 — Położenie stopki różni się od planu, a plan tego nie zapisuje

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/components/SiteFooter.astro:1, plan.md Phase 2 (kontrakt „Użycie”)
- **Detail**: Plan każe dać stopce `mt-auto` i `pt-8`. Implementacja ma `pt-4` i stopkę jako ostatnie dziecko bloku `max-w-xl`, bo `mt-auto` odebrałoby wyśrodkowanie treści przed pierwszym Generuj. Uzasadnienie jest tylko w rozmowie, nie w planie ani w commicie.
- **Fix**: Dopisać w planie przy fazie 2 jedną notkę o zmianie (stopka w bloku `max-w-xl`, `pt-4`, bez `mt-auto`) i powodzie.
- **Decision**: FIXED (notka w planie przy fazie 2)

### F2 — Test druku w e2e nie chroni klasy `print:hidden`

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/how-it-works.spec.ts (test „the footer link is not printed”)
- **Detail**: Link ukrywa już reguła `#worksheet-home a` w `GeneratorShell.astro`, więc test przechodzi także bez `print:hidden` na stopce (sprawdzone podczas break-checku). Klasę pilnuje test kontraktu w `print-contract.test.ts`, więc luki w pokryciu nie ma, ale test e2e ma słabszą wartość, niż sugeruje nazwa.
- **Fix**: Zostawić; ewentualnie dopisać w komentarzu testu, że klasę chroni test kontraktu.
- **Decision**: SKIPPED (klasę pilnuje test kontraktu)

## Weryfikacja kryteriów

- Lint, `astro check` (0 błędów), `npm test` (783/783), build i smoke (16 kroków) przeszły przy tym przeglądzie.
- E2E (chromium + phone-360, 169 zielonych) przeszło przed commitem fazy 3; w tym przeglądzie nie było ponownie uruchamiane.
- Kroki ręczne (1.5, 1.6, 2.4–2.6, 3.4) potwierdził użytkownik w rozmowie.
- Zmiany poza planem, niegroźne: zawężenie liczenia linków w `tests/e2e/catalog.spec.ts` oraz status `in-progress` i `updated` w roadmapie.
