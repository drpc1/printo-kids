# Stryker na starym rdzeniu — Plan Brief

> Full plan: `context/changes/gh224-stryker-on-new-maze/plan.md`

## What & Why

Pięć starszych modułów (generator labiryntu, układ kartki, profile, postać, ostatnie parametry) nie miało sprawdzenia Strykerem od 2026-10-11, a mocno się zmieniły. Sprawdzamy, czy testy wciąż zabijają mutanty, i domykamy tylko luki widoczne dla rodzica (zła karta, labirynt bez jednej drogi, utrata danych profilu).

## Starting Point

Rootowy `stryker.config.json` z pięcioma modułami i bez `MUTATION_RUN`. Sześć nowszych zakresów ma `stryker/*.config.json` i skrypty `mutate:*`. gh114 puścił zawężony Stryker na `scoreMaze`/`generateMaze`, ale nie zostawił wyniku ani decyzji.

## Desired End State

`npm run mutate:maze` działa jak pozostałe zakresy. Raport zmiany ma wynik przed i po oraz decyzję dla ocalałych mutantów labiryntu i profili; `test-plan.md` §5a ma nowy wiersz. Testy, lint i `astro check` zielone.

## Key Decisions Made

| Decision         | Choice                                                 | Why                                               | Source |
| ---------------- | ------------------------------------------------------ | ------------------------------------------------- | ------ |
| Konfiguracja     | `stryker/maze.config.json` z 5 modułami, root usunięty | Jeden wzór, wąski przebieg przez `--mutate`       | Plan   |
| Głębokość triage | Baseline 5 modułów; pełny triage: generate i profile   | Priorytet z issue, bez gonienia 100%              | Plan   |
| Zakres gh114     | Cały `generate.ts` w baseline                          | gh114 nie zostawił liczb ani decyzji              | Plan   |
| Bramka czasu     | `MUTATION_RUN` wyłącza asercję 500 ms w teście maze    | Jak nonogram i sudoku; instrumentacja zwalnia kod | Plan   |

## Scope

**In scope:** konfiguracja i skrypt, baseline, triage, nowe testy z break-checkiem, raport, wiersz w §5a.

**Out of scope:** 100% wyniku, zmiany produktu, uszkodzony sąsiad profilu, Stryker w CI.

## Architecture / Approach

Konfiguracja i bramka czasu, potem czysty baseline bez zmian w testach, potem triage w kolejności z issue, na końcu wynik „po” wąskimi przebiegami.

## Phases at a Glance

| Phase                 | What it delivers                                  | Key risk                             |
| --------------------- | ------------------------------------------------- | ------------------------------------ |
| 1. Konfiguracja       | `maze.config.json`, `mutate:maze`, bramka czasu   | Testy czasowe czerwone pod Strykerem |
| 2. Baseline „przed”   | Wynik 5 modułów w raporcie                        | Długi przebieg (godzina lub więcej)  |
| 3. Generate i profile | Decyzje i testy z break-checkiem                  | Mutant ujawnia błąd produktu         |
| 4. Reszta i „po”      | Triage drugiej kolejności, wynik po, wiersz w §5a | Czas `npm test` rośnie               |

**Prerequisites:** brak.
**Estimated effort:** ok. 2-3 sesje; większość czasu to przebieg w tle.

## Open Risks & Assumptions

- Pełny baseline może trwać dłużej niż godzinę; wtedy węższe przebiegi.
- Zakładamy, że usunięcie rootowego configu nie psuje niczego poza `test-plan.md` (grep znalazł tylko tam).

## Success Criteria (Summary)

- Zapisany wynik przed i po dla modułów, każdy ocalały mutant z generate i profili ma decyzję.
- `npm test`, lint, `astro check` zielone; czas testów prawie bez zmian.
