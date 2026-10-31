<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Profil klikalny na stronie głównej

- **Plan**: context/changes/gh234-profile-on-homepage/plan.md
- **Scope**: Full plan (po merge PR #239)
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-31
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warnings, 1 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Adherence: wszystkie zaplanowane zmiany są w kodzie zgodnie z planem (wyspa, usunięcie podpisu, nasłuch zdarzenia, padding, testy, linia w US-05); brak zmian poza planem; `ProfileCorner`, hook i `child-profiles` bez zmian. Kryteria automatyczne (lint, unit 7/7 w `catalog-badges`, wcześniej 785 testów, build, E2E katalogu) przechodzą.

## Findings

### F1 — Róg może pokazywać nieaktualny profil względem plakietek

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/components/CatalogProfileCorner.tsx:15
- **Detail**: Plakietki w `CardCatalog.astro` czytają `localStorage` przy `pageshow` i `storage`, ale stan rogu pochodzi z `useChildProfileVisit`, który czyta storage tylko raz (inicjalizator stanu) i nie słucha tych zdarzeń. Po zmianie profilu na stronie karty i powrocie na katalog przez bfcache, albo po zmianie w innej karcie, plakietki pokazują nowy profil, a przycisk w rogu nadal stary. Wybór z takiego rogu działa na nieaktualnej liście profili. Nie sprawdzone w przeglądarce (bfcache nie jest włączony w Playwright), więc to PLAUSIBLE.
- **Fix**: Odświeżać wyspę na `pageshow` (persisted) i `storage` przez zmianę `key` wokół komponentu, żeby `useChildProfileVisit` przeczytał storage od nowa.
  - Strength: Mały, lokalny kod, bez zmian w `ProfileCorner` i w hooku; ta sama logika, co odświeżanie plakietek.
  - Tradeoff: Przy otwartym oknie profilu zdarzenie `storage` z innej karty zamknie je i zresetuje formularz.
  - Confidence: MED — wzorzec jest jasny, ale zachowania bfcache nie odtworzyłem.
  - Blind spot: Czy Astro/Chrome faktycznie przywraca tę stronę z bfcache w produkcji.
- **Decision**: ACCEPTED — fix w osobnym PR (follow-up w follow-ups/review-fixes.md)

### F2 — `profileName` w `CatalogBadges` nie jest już używane w kodzie produkcyjnym

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/catalog-badges.ts:12
- **Detail**: Po usunięciu podpisu pole `profileName` czytają już tylko testy. Plan świadomie je zostawił.
- **Fix**: Zostawić (testy używają go jako sposobu na sprawdzenie aktywnego profilu) albo usunąć razem z asercjami przy okazji większej zmiany katalogu.
- **Decision**: SKIPPED — zostaje, testy używają pola
