<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: VerifiedCard (gh283), faza 10 Dyktando pionowo

- **Plan**: context/changes/gh283-verified-card/plan.md
- **Scope**: Phase 10 of 11
- **Reviewed phases**: 10
- **Date**: 2026-11-07
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

Automated: `npm test` 1047 testów, 1046 pass / 0 fail / 0 todo (jeden pominięty test labiryntu); `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone; e2e Chromium (`E2E_PORT`) `dictation-reprint` (nowy, 5 testów), `card-settings`, `level-bar`, `phone-settings-rows`: 41 passed. `grep -nE "Nieudane Generuj zostawia|Sama zmiana kategorii go nie wyłącza" prd.md` bez trafień. Test czasu: zimne wywołanie silnika dla trzech poziomów (z budową katalogów) < 15 s w `engine.test.ts`, w praktyce ok. 2 s. Manual 10.5 i 10.7 zostają nieodhaczone (sprawdzi użytkowniczka).

## Findings

### F1 — R-9 rozstrzygnięte opcją B: punkt startu nie jest sprawdzany

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Plan Adherence
- **Location**: src/lib/dictation/engine.ts, context/foundation/prd.md (Karta dyktanda graficznego)
- **Detail**: Zgodnie z decyzją właścicielki z 2026-11-06 spec nie sprawdza, w którym wierzchołku leży start; test pilnuje, że ten sam obrys obchodzony od innego wierzchołka przechodzi. Z PRD wypadło „w lewym górnym rogu sylwetki” (zdanie w „Karta dyktanda graficznego”; US-17 nie zawierało takiego zdania). `knownBad` ma jeszcze „start przesunięty poza obrys” (`not-the-outline`).
- **Fix**: Zostawić.
- **Decision**: PENDING

### F2 — Brak testu `CardExhausted` dla dyktanda na prawdziwym katalogu

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Success Criteria
- **Location**: src/lib/dictation/engine.test.ts
- **Detail**: Silnik rzuca `CardExhausted` z liczbą różnych obrysów katalogu, gdy poza poprzednim nic nie zostało, ale każda kategoria każdego poziomu ma dziś ≥ 8 obrysów, więc ścieżki nie da się wywołać bez wstrzykiwania katalogu. Pierwsza wersja testu była z tego powodu pusta, więc ją usunięto zamiast zostawiać zielony test bez asercji. Ścieżkę pokrywa kod `generateSheet`/`failureReason` (testy sheet-state) i `SheetState` w komponencie.
- **Fix**: Jeśli katalog stanie się wstrzykiwalny (faza 11 lub później), dodać test.
- **Decision**: PENDING

### F3 — „Pokaż rozwiązanie” związane z kluczem karty, tak jak w nonogramie

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Pattern Consistency
- **Location**: src/components/DictationGenerator.tsx
- **Detail**: Każda nowa karta (Generuj, poziom, kategoria, „Nowa karta”, przełączenie profilu) wyłącza przełącznik, bo klucz karty się zmienia. Nieudana nowa karta daje `unavailable`, więc karty i przełącznika nie ma, a w miejscu karty jest przyczyna z `failureReason`. Zdanie „Nowa karta i drukuj” w planie zostaje do fazy 11. W tym samym commicie odhaczone ręczne 9.4 i 9.6 (potwierdziła użytkowniczka).
- **Fix**: Zostawić.
- **Decision**: PENDING
