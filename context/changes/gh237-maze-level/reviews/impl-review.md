<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Poziom labiryntu w `cards.labirynt` (GitHub 237)

- **Plan**: context/changes/gh237-maze-level/plan.md
- **Scope**: Full plan (3 of 3)
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-31
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 2 observations

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

### F1 — `ProfileCorner` nadal importuje typ poziomu labiryntu

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: src/components/ProfileCorner.tsx:24, :592
- **Detail**: Plan (Faza 2, zmiana #3, Contract) mówił, że `ProfileCorner` i `CardPage` nie importują `LevelId`. `CardPage` jest czysty, ale `ProfileCorner` importuje `LEVELS` i `LevelId`, bo hostuje eksport `LevelChoiceRows` (lista poziomów labiryntu), używany tylko przez `WorksheetGenerator.tsx:182`. Pole `barLevel` zniknęło, ale wspólny komponent profilu nadal zna typ poziomu labiryntu, co issue 237 chciało usunąć.
- **Fix**: Przenieść `LevelChoiceRows` do własnego pliku (np. `src/components/LevelChoiceRows.tsx`) albo do `WorksheetGenerator.tsx` i zaktualizować import; usunąć `LEVELS`/`LevelId` z importów `ProfileCorner`.
  - Strength: Domyka cel issue (wspólne komponenty profilu bez typu poziomu labiryntu); `ProfileCorner` robi się mniejszy.
  - Tradeoff: Zmiana dotyka jednego pliku więcej niż w planie; drobne ryzyko rozjazdu stylów, jeśli komponent zależy od lokalnych helperów `ProfileCorner`.
  - Confidence: HIGH — jedyny konsument to `WorksheetGenerator`.
  - Blind spot: Nie sprawdzałem, czy `LevelChoiceRows` używa lokalnych helperów z `ProfileCorner` (np. `LevelRow`, `levelRowClass` są importowane z osobnego pliku).
- **Decision**: FIXED (LevelChoiceRows przeniesiony do src/components/LevelChoiceRows.tsx)

### F2 — Przejście profilu na labiryncie z kartą na ekranie nie ma testu e2e

- **Severity**: 👁 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: tests/e2e/card-settings.spec.ts:213 (test istnieje tylko dla nonogramu)
- **Detail**: Ścieżka, którą Faza 2 przepisała dla labiryntu (`onSwitch` → `redrawForLevel`, reset paska po utworzeniu profilu przez `onCreated`), jest sprawdzona ręcznie (2.10, 2.11) i częściowo przez `profile-summary.spec.ts:49` (reset do Poziomu 3). Brakuje testu: profil A na poziomie X, karta na ekranie, wybór profilu B na poziomie Y, labirynt przerysowany na Y.
- **Fix**: Dodać do `card-settings.spec.ts` w bloku „profiles” przypadek dla `/maze`, analogiczny do testu nonogramu z linii 213.
  - Strength: Zabezpiecza jedyną przepisaną ścieżkę zachowania; wzorzec już istnieje.
  - Tradeoff: Jeden test e2e więcej (kilkanaście sekund w CI).
  - Confidence: MED — nie sprawdzałem, czy labirynt daje się łatwo zidentyfikować po poziomie w DOM.
  - Blind spot: Stabilność selektorów karty labiryntu.
- **Decision**: FIXED (dwa testy e2e dla /maze w card-settings.spec.ts: przełączenie profilu i utworzenie profilu z kartą na ekranie; break-check czerwony)

### F3 — Commit Fazy 1 sam w sobie nie przechodzi typecheck

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: commit e66a235
- **Detail**: Plan przewidywał, że po Fazie 1 `astro check` nie przechodzi, a użytkownik wybrał dwa osobne commity. `git bisect` może więc trafić na czerwony `e66a235`. Stan końcowy (`HEAD`) jest zielony.
- **Fix**: Brak działania; ewentualnie zsquashować p1 i p2 przy merge PR.
- **Decision**: PENDING
