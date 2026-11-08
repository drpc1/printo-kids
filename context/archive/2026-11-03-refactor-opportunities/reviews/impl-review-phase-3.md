<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Refactor opportunities, faza 3

- **Plan**: context/changes/refactor-opportunities/plan.md
- **Scope**: Phase 3 of 4
- **Reviewed phases**: 3
- **Date**: 2026-11-08
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

Weryfikacja: npm test 1062 pass / 0 fail; lint, depcruise, astro check (0 errors), build zielone; e2e profile-two-tabs, card-settings, profile-summary, favorite-character (chromium) 46 pass. Test dwóch zakładek: czerwony na kodzie sprzed przepięcia (usuwanie zostawiało pustą listę zamiast Ani), zielony po. Ręcznie 3.8–3.9 potwierdzone przez użytkowniczkę.

Wszystkie pięć zapisów listy profili idzie przez `updateProfiles`; `writeChildProfiles` woła już tylko `lib`.

## Findings

### F1 — Ulubiona bez zmian też zapisuje listę

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/components/ProfileCorner.tsx (saveFavorite)
- **Detail**: Gdy wybór równa się obecnej ulubionej, `transform` zwraca tę samą listę, więc `updateProfiles` ją zapisuje (znormalizowaną przez odczyt); wcześniej wyjście następowało bez zapisu. Plan to dopuszcza ("transform zwraca tę samą listę, wołający rozpoznaje po before"). Efekt widoczny tylko jako zbędny zapis.
- **Fix**: Brak.
- **Decision**: ACCEPTED (zgodne z planem)

### F2 — Karta, w której tworzymy profil, nie widzi profilu z innej zakładki do odświeżenia

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: src/components/ProfileCorner.tsx (handleCreate), src/hooks/useChildProfileVisit.ts
- **Detail**: Dysk jest poprawny, ale stan Reacta tej zakładki dostaje tylko nowy profil (`onCreated(profile)`), bez Ani z drugiej zakładki. To TD-8a (nasłuch `storage`), jawnie poza zakresem planu.
- **Fix**: Brak w tej zmianie.
- **Decision**: SKIPPED (poza zakresem, TD-8a)

### F3 — Tworzenie na nieczytelnym storage (uwaga F1 z fazy 2)

- **Severity**: OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/child-profiles.ts (updateProfiles), src/components/ProfileCorner.tsx (handleCreate)
- **Detail**: Uszkodzony JSON czyta się jako `[]`, więc utworzenie profilu zapisze listę z jednym profilem. Przed zmianą działo się to samo (zapis `[...profiles, profile]` ze stanu, który też był pusty po takim odczycie), więc nie ma regresu. Zablokowany storage kończy się `write-failed`, bo `setItem` też rzuca.
- **Fix**: Zostawić; rozróżnienie błędu odczytu od pustej listy wymagałoby zmiany `readChildProfiles` poza zakresem.
- **Decision**: ACCEPTED (bez regresu względem stanu sprzed zmiany)
