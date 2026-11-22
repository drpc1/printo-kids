# Karta „Cienie”: Poziom 1–4 i pozy — Plan Brief

Pełny plan: [plan.md](plan.md)

## What & Why

Karta „Cienie” dostaje najtrudniejszy Poziom 4: sześć póz jednej rzeczy (kot, pies, królik, ptak, miś), różniących się jednym szczegółem obrysu (GitHub 452). Przy czterech poziomach nazwy łatwy / średni / trudny zmieniają się na „Poziom 1–4” (FR-001).

## Starting Point

`src/lib/shadows` ma trzy poziomy (`latwy`, `sredni`, `trudny`), 13 rodzin obrazków i jeden próg różnicy cieni (0,08). Ten sam próg pilnuje całego katalogu i każdej karty. Makieta póz jest zaakceptowana (`poses.mts`). Najbliższe pozy różnią się w niej o 0,029–0,065.

## Desired End State

Pasek pokazuje Poziom 1–4, a domyślny jest Poziom 1. Zapisane profile wczytują się bez migracji. Poziom 4 układa kartę z 6 z 8 póz jednej rodziny, z własnym progiem 0,025.

## Key Decisions Made

| Decyzja        | Wybór                                                | Dlaczego                                           |
| -------------- | ---------------------------------------------------- | -------------------------------------------------- |
| Nazwy poziomów | Poziom 1–4                                           | Reguła FR-001; użytkowniczka wybrała przy makiecie |
| Identyfikatory | `latwy` / `sredni` / `trudny` zostają, nowy `pozy`   | Brak migracji profili                              |
| Rodziny póz    | kot, pies, królik, ptak, miś (3 szczegóły × 2 stany) | Zaakceptowana makieta                              |
| Lustrzane pozy | Każdy szczegół zmienia się tylko po jednej stronie   | Bez odbić, jedna odpowiedź                         |
| Próg           | Od poziomu; 0,08 dla 1–3, 0,025 dla 4                | Pozy różnią się mniej; wydruk potwierdzi (OQ 22)   |
| Katalog póz    | Osobna lista `SHADOW_POSE_FAMILIES`                  | Test katalogu (0,08) i Poziom 1 bez póz            |
| Fazy           | 2 PR-y                                               | Faza 1 bez zmiany zachowania, CI zielone           |

## Scope

**W zakresie:** etykiety, teksty („Jak to działa”, opis karty), katalog póz, Poziom 4, próg od poziomu, testy jednostkowe i e2e, wydruk.

**Poza zakresem:** migracja danych, pozy na Poziomach 1–3, kategorie i kolory, nowa miniatura.

## Architecture / Approach

`ShadowsLevel` dostaje `minShadowDifference`, a `familyRule` dostaje `pozy`. Rysunki póz są przeniesione 1:1 z makiety do `pictures/pozy.ts`. Wyszukiwanie obrazka obejmuje obie listy. Reguła karty bierze próg z poziomu.

## Phases at a Glance

| Faza                 | Co daje                                         | Gałąź / PR                                     |
| -------------------- | ----------------------------------------------- | ---------------------------------------------- |
| 1. Poziom 1–3        | Nowe etykiety i teksty, testy po nowych nazwach | osobna gałąź, PR do `main`, `/10x-impl-review` |
| 2. Poziom 4 z pozami | Katalog póz, nowy poziom, próg, testy, wydruk   | osobna gałąź, PR do `main`, `/10x-impl-review` |

Prerequisites: PR #451 scalony (jest). Estimated effort: mały (faza 1) + średni (faza 2).

## Open Risks & Assumptions

- Próg 0,025 przepuszcza każdą parę póz. Jeśli wydruk pokaże, że dziób ptaka albo zgięte ucho są za małe, próg rośnie albo szczegół się zmienia (OQ 22).

## Success Criteria (Summary)

- `npm test`, lint, `astro check` i e2e „Cienie” przechodzą po każdej fazie.
- Poziom 4 na `/shadows` układa kartę z 6 póz jednej rzeczy.
- Wydruk to jedna strona A4, a cienie póz da się odróżnić.
