# Stryker dla kart M-7 — Plan Brief

> Full plan: `context/changes/stryker-m7-cards/plan.md`

## What & Why

Testy mutacyjne generatorów i reguł jednoznaczności czterech kart M-7 i wąski przebieg na kodzie S-55 w „Skopiuj obrazek”, żeby wykryć luki w testach tam, gdzie błąd zobaczy rodzic.

## Starting Point

Zakresy Strykera dla kart do M-6 istnieją; dla M-7 dodano configi i skrypty `mutate:coding|shadows|size-order|number-maze`.

## Desired End State

Wyniki i decyzje o ocalałych w `reviews/stryker-results.md`; roadmapa i AGENTS.md zgodne.

## Key Decisions Made

| Decision          | Choice                       | Why                                   | Source |
| ----------------- | ---------------------------- | ------------------------------------- | ------ |
| Zakres            | 5 kart, bez filtra S-43      | Filtr nie zbudowany                   | Plan   |
| Prerekwizyty S-50 | S-42, S-47, S-48, S-49, S-55 | S-43 i S-54 nie zmieniają generatorów | Plan   |
| Mutowanie         | wąskie, bez layoutu/SVG      | Ryzyko jest w logice                  | Plan   |

## Scope

**In scope:** generatory i reguły 5 kart, wyniki, roadmapa, AGENTS.md.
**Out of scope:** filtr S-43, layout, 100% wyniku, CI.

## Architecture / Approach

Jeden zakres naraz w tle, czytanie tylko podsumowania, przegląd ocalałych pojedynczo, `/10x-impl-review` przed każdym PR.

## Phases at a Glance

| Phase | What it delivers                                                            | Key risk                                 |
| ----- | --------------------------------------------------------------------------- | ---------------------------------------- |
| 1–5   | Przebieg i przegląd: coding, shadows, size-order, number-maze, copy-drawing | Czas przebiegu (shadows: testy ok. 45 s) |
| 6     | Wyniki, roadmapa, AGENTS.md                                                 | —                                        |

**Prerequisites:** S-42, S-47, S-48, S-49, S-55 na `main`.
**Estimated effort:** ~6 sesji.

## Open Risks & Assumptions

- Długi przebieg `shadows` (rastrowanie) może wymagać zawężenia zakresu.

## Success Criteria (Summary)

- Każdy zakres ma wynik i decyzje; bramki zielone.
