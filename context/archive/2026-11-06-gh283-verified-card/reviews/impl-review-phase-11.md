<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: VerifiedCard (gh283), faza 11 Rejestr wymuszony typem i domknięcie

- **Plan**: context/changes/gh283-verified-card/plan.md
- **Scope**: Phase 11 of 11
- **Reviewed phases**: 11
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

Automated: `npm test` 1049 testów, 1048 pass / 0 fail / 0 todo (jeden pominięty test labiryntu „next card differs”); `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone; `npm run smoke` na zbudowanym podglądzie (`astro preview`) zielone; pełne e2e (`chromium`, `phone-360`, `pixel-7`, `tablet-768`, `E2E_PORT`) 447 passed. 11.4: dopisanie rodzaju `nowy` do `CARD_KINDS` bez silnika daje błędy `astro check` (sprawdzone lokalnie, cofnięte). 11.5: import `generateSymmetryCard` w `SymmetryGenerator.tsx` daje błąd `cards-only-through-engines` w `depcruise` (sprawdzone lokalnie, cofnięte). Manual 11.6 i 11.7 zostają nieodhaczone (sprawdzi użytkowniczka).

## Findings

### F1 — `CardKindId` zdefiniowane w `cards.ts`, a `card-contract.ts` je reeksportuje

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Architecture
- **Location**: src/lib/cards.ts, src/lib/card-contract.ts
- **Detail**: Plan: unia id z `CARD_KINDS` zastępuje alias `string` z kontraktu. Typ żyje przy stałej (`cards.ts` nie importuje nic, więc cyklu nie ma), a `card-contract.ts` robi `import type` i `export type { CardKindId }`, żeby istniejące importy działały. Testy kontraktu i `sheet-state` używają rodzaju „toy” spoza katalogu przez rzutowanie `as CardKindId`.
- **Fix**: Zostawić.
- **Decision**: PENDING

### F2 — Lokalna tabela adapterów zastąpiona tabelą `INVENTORY`, nie całkowicie usunięta

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Plan Adherence
- **Location**: src/lib/card-engines.test.ts
- **Detail**: Silnik, spec, `knownBad` i klucz idą z `CARD_ENGINES`; w teście zostaje tylko to, czego rejestr nie wie: lista ustawień do przejścia, `mayExhaust`, `usesPreviousKey` i tabela I-9 („treść” zmienia `contentKey`, „ozdoba” nie). Tabela jest typowana po `CardKindId`, więc brakujący wpis dla nowego rodzaju łamie `astro check`. Test „brak `todo`” czyta źródło pliku i pomija komentarze.
- **Fix**: Zostawić.
- **Decision**: PENDING

### F3 — Zdanie „Nowa karta i drukuj” poprawione w plan.md i plan-brief.md

- **Severity**: 👁 OBSERVATION
- **Impact**: 🏃 LOW
- **Dimension**: Scope Discipline
- **Location**: context/changes/gh283-verified-card/plan.md, plan-brief.md
- **Detail**: Po PR #302 „Nowa karta” tylko układa nową kartę, a drukuje dopiero następne Drukuj. Poprawka zgodnie z zapowiedzią z faz 8–10. Przy okazji odhaczone ręczne 10.5 i 10.7 (potwierdziła użytkowniczka, Edge na komputerze).
- **Fix**: Zostawić.
- **Decision**: PENDING
