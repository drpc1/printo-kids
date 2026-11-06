<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: VerifiedCard: wspólny strażnik niezmiennika kart — faza 1

- **Plan**: context/changes/gh283-verified-card/plan.md
- **Scope**: Phase 1 of 11
- **Reviewed phases**: 1
- **Date**: 2026-11-06
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning (fixed), 2 observations

Review wykonana inline (bez subagentów) na diffie `main..HEAD`: w `src/` jest tylko `src/lib/card-engines.test.ts`, poza tym `package.json` (jedna pozycja na końcu skryptu `test`), `phase0-findings.md` i Progress w planie. Kryteria 1.1–1.4 uruchomione ponownie po poprawce: `npm test` (0 błędów, 14 todo), `test-script.test.ts`, `npm run lint`, `npx astro check` zielone.

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 — Test czasu nie obejmował budowy katalogu dyktanda

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/card-engines.test.ts (test czasu)
- **Detail**: Plan mówi, że test czasu domyka D01 R-10 dla symetrii i dyktanda. Test czasu szedł po teście legalności, więc katalog dyktanda (budowany leniwie) był już w cache i pomiar go nie widział.
- **Fix**: Test czasu idzie pierwszy w każdym rodzaju i asercją obejmuje zimne pierwsze wywołanie oraz średnią.
- **Decision**: FIXED (poprawione w tym PR; dyktando zimno ok. 2 s na wszystkie ustawienia, każde poniżej 5 s)

### F2 — N13: brak wariantu „odcięta grupa z własną pętlą”

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: src/lib/card-engines.test.ts (mazeBadCases)
- **Detail**: D02 6.2 N13 wymienia też grupę odciętą z własną pętlą, która nie tworzy drugiej drogi. Test buduje odciętą komórkę i odciętą grupę dwóch komórek; pętla wymaga grupy co najmniej 2×2 i fabryki mutanta zależnej od układu labiryntu. Luka jest opisana w `phase0-findings.md`.
- **Fix**: Dopisać wariant w teście `mazeSpec` w fazie 4 (tam kod `unreachable-cells` powstaje).
- **Decision**: PENDING

### F3 — Kody docelowe niektórych todo są propozycją

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/card-engines.test.ts (A5-a, A5-b, R-9)
- **Detail**: `expectedCode` dla R-9 (`start-not-top-left`) i A5 (`runs-mismatch` dla krótkiego wiersza i rozbitych znaczków) nie istnieje dziś w żadnej unii `*Problem`; nazwy ustali faza 9 i 10, po rozstrzygnięciu właścicielki. Zapisane w pliku znalezisk.
- **Fix**: Potwierdzić albo zmienić nazwy kodów w fazach 9 i 10 razem z testem i plikiem znalezisk.
- **Decision**: PENDING

## Uwaga procesowa

Przegląd został uruchomiony po otwarciu PR 293 (prośba przyszła po fakcie), nie przed. Poprawka F1 trafia do tego samego PR jako dodatkowy commit.
