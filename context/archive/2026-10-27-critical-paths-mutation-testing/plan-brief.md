# Krytyczne ścieżki: testy z luk i celowany Stryker — Plan Brief

> Full plan: `context/changes/critical-paths-mutation-testing/plan.md`
> Research: `context/changes/critical-paths-mutation-testing/research.md`

## What & Why

Stryker dziś nie obejmuje żadnej z pięciu nowych kart, a kilka krytycznych reguł (jedno rozwiązanie sudoku i nonogramu, obrys dyktanda bez przecięć) ma luki w asercjach albo wyrocznię zależną od kodu produkcyjnego. Zmiana zamyka znane luki testami, potem mutuje karty zawężonymi przebiegami i przegląda ocalałe mutanty po kolei.

## Starting Point

`stryker.config.json` mutuje 5 plików starego rdzenia. Stryker 10 nie przyjmuje nadpisania komendy z CLI, ale przyjmuje osobny plik konfiguracji z `--mutate` (sprawdzone). Testy kart są szerokie (ok. 600 testów w całości), lecz sudoku i nonogram liczą unikalność wyłącznie produkcyjnymi solverami, a walidator dyktanda nie ma testów negatywnych kilku reguł.

## Desired End State

Każdy zakres z raportu ma jednokomendowy przebieg (`npm run mutate:<zakres>`), testy z luk są w `npm test` z break-checkami, a dla każdego zakresu zapisano wynik Strykera i decyzję dla każdego ocalałego mutanta. `test-plan.md` odzwierciedla wyniki.

## Key Decisions Made

| Decision                  | Choice                                                                                                    | Why                                                          | Source                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------- |
| Zakres Fazy 0             | Tylko pozycje 1–3 z raportu (dyktando, walidacja sudoku, niezależne brute-force); resztę wyłapuje Stryker | Najtańsze luki zamykamy z góry, reszta przez ocalałe mutanty | Research / użytkowniczka (A) |
| Oracle sekwencji          | Zmienna środowiskowa `SEQUENCE_ORACLE_SEEDS`, domyślnie 120, krótka tylko pod Strykerem                   | Test trwa 47 s; pełny w `npm test` bez zmian                 | Research / użytkowniczka (B) |
| Uszkodzony sąsiad profilu | Osobna zmiana, tylko wzmianka w test-planie                                                               | To zmiana zachowania produktu                                | Research / użytkowniczka (C) |
| Konfiguracja Strykera     | Osobne pliki `stryker/<zakres>.config.json` + `--mutate` w CLI                                            | CLI nie przyjmuje nadpisania komendy                         | Plan (sprawdzone 2026-10-27) |
| Podział na fazy           | 6 faz, każda z własnym PR-em                                                                              | Małe, niezależne przeglądy                                   | Plan (zatwierdzone)          |
| Reguła asercji            | Tylko gdy błąd widoczny dla rodzica lub zmienia wynik karty                                               | AGENTS.md, bez gonienia 100%                                 | AGENTS.md                    |

## Scope

**In scope:** konfiguracje i skrypty Strykera, testy negatywne dyktanda i sudoku, niezależne brute-force sudoku i nonogramu, przebiegi na dyktandzie, sudoku, nonogramie, sekwencjach, symetrii i danych lokalnych, aktualizacja `test-plan.md`.
**Out of scope:** uszkodzony sąsiad profilu (osobna zmiana), opis Poziomu 3 sekwencji, emulacja druku, e2e dyktanda i nonogramu, testy hooków React, Stryker w CI, zmiany zachowania produktu.

## Architecture / Approach

Faza 1 daje infrastrukturę i dowód na małym zakresie. Fazy 2–5 powtarzają rytm: testy z luk (z break-checkiem), przebieg Strykera, przegląd ocalałych po kolei, asercje tylko wg reguły, ponowny przebieg. Faza 6 zamyka dane lokalne i `test-plan.md`. Wyniki zbiera `reviews/stryker-results.md`.

## Phases at a Glance

| Phase                       | What it delivers                                                            | Key risk                                                   |
| --------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1. Konfiguracja             | Pliki `stryker/*.config.json`, skrypty `mutate:*`, zmienna ziaren sekwencji | Sposób ustawienia zmiennej niezależny od powłoki (Windows) |
| 2. Dyktando                 | Negatywne testy walidatora, Stryker na `generate.ts` i `outline.ts`         | Wiele ocalałych mutantów w obrysie                         |
| 3. Sudoku                   | Negatywne testy 6×6/9×9, brute-force 4×4, Stryker                           | Zawieszenia po mutacji pętli solvera (limit czasu)         |
| 4. Nonogram                 | Wyrocznia brute-force na małych siatkach, Stryker                           | Czas `generate.test.ts` (ok. 7 s) w komendzie              |
| 5. Sekwencje i symetria     | Stryker z krótkim oracle, asercje wg reguły                                 | Krótki oracle może przeoczyć mutanty (porównanie z pełnym) |
| 6. Dane lokalne i test-plan | Stryker na `card-settings` i spółce, aktualizacja `test-plan.md`            | Zgodność dokumentu z wynikami                              |

**Prerequisites:** brak (S-31 zmergowane, #155 w `main`).
**Estimated effort:** ok. 6 sesji, 6 PR-ów.

## Open Risks & Assumptions

- Czasy przebiegów to szacunek (gęstość mutantów niższa niż w raporcie); realne czasy zapisujemy po pierwszych przebiegach.
- Mutacja pętli solverów może dawać zawieszenia; polegamy na limicie czasu Strykera.
- Jeśli ocalały mutant ujawni błąd produktu, zapisujemy go jako osobną poprawkę, nie naprawiamy bez decyzji użytkowniczki.

## Success Criteria (Summary)

- Każdy zakres z raportu ma zapisany wynik Strykera i decyzję dla każdego ocalałego mutanta.
- Unikalność rozwiązania sudoku i nonogramu ma niezależną wyrocznię w testach.
- `npm test` pozostaje szybki, a `test-plan.md` jest zgodny z wynikami.
