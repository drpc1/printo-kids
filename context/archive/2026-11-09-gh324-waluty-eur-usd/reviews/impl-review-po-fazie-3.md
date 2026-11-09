<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Waluty EUR i USD — zmiany po fazie 3

- **Plan**: context/changes/gh324-waluty-eur-usd/plan.md
- **Scope**: zmiany po fazie 3 (poza planem): dolar bez monet (`e37a0d9`), plakietka z cyfrą na banknotach dolarowych (`84abd68`), złożenie gałęzi `-final` (PR #337, scalony)
- **Reviewed phases**: none (fazy 1–3 mają własne raporty; tu tylko zmiany dodane po nich)
- **Date**: 2026-11-09
- **Verdict**: NEEDS ATTENTION → po poprawkach APPROVED
- **Findings**: 0 critical, 2 warnings, 1 observation

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | WARNING |

## Findings

### F1 — Opisy USD nadal mówią o monetach

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/money/currencies.ts:21, src/lib/money/levels.ts (`describe`, poziom trudny)
- **Detail**: Po usunięciu monet dolara lista walut pokazywała „moneta i banknoty w dolarach”, a opis trudnego „monety i banknoty do 100 $”. Test `levels.test.ts` pinował błędny tekst.
- **Fix**: opis zależy od tego, czy waluta ma monety; test pilnuje obu wariantów (usd bez monet, pln z monetami).
- **Decision**: FIXED

### F2 — Plakietka z cyfrą bez testu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/components/MoneyGenerator.tsx (`data-value-badge`)
- **Detail**: Plakietka naprawia nieczytelny druk dolara, ale nic nie pilnowało, że stoi na każdym banknocie i pokazuje ten sam nominał co obrazek, ani że znika po zmianie waluty.
- **Fix**: e2e w `money.spec.ts`: liczba plakietek = liczba obrazków USD, wartości zgodne z nazwami plików, brak plakietek po przejściu na złote.
- **Decision**: FIXED

### F3 — Zmiany po fazie 3 poza planem i bez przeglądu przed scaleniem

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: plan.md (Progress)
- **Detail**: Dolar bez monet i plakietka wynikły z decyzji użytkowniczki po fazie 3 (change.md, pkt 6 i uwaga o druku). Weszły do `main` w #337 bez `/10x-impl-review`; ten raport nadrabia przegląd. Reszta sprawdzona bez uwag: `MAX_NOTES_WITHOUT_COINS = 9` mieści się w ramce (test układu), `1usd.png` to banknot 1 $ z makiety, PRD zgodne z kodem.
- **Fix**: brak dalszych; odnotowane w change.md.
- **Decision**: ACCEPTED
