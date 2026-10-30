# Sekwencje, Poziom 4 (lat7): jedna odpowiedź dla dziecka — Plan Brief

> Full plan: `context/changes/gh117-sequence-lat7-ambiguity/plan.md`
> Research: `context/changes/gh117-sequence-lat7-ambiguity/research.md`

## What & Why

Na Poziomie 4 kart sekwencji część wierszy ma dla dziecka więcej niż jedną odpowiedź, bo generator sprawdza tylko zaprogramowane reguły. Naprawiamy wiersze `mixed` z jedną liczbą, zastępujemy nieczytelne „rosnące grupy" wzorem ABB i uszczelniamy sprawdzenie dwuznaczności (GitHub #117).

## Starting Point

`sequenceAnswers` filtruje `hypotheses(n)` po widocznych polach i odrzuca wiersz bez dokładnie jednej odpowiedzi. Lista hipotez zna wzory kształtów o okresie ≤ n/2 i osiem reguł; `mixed` ma tylko krok +1, a lat7 losuje `mixed`, `down1`, `groups`.

## Desired End State

Żaden wiersz żadnego poziomu nie ma drugiej odpowiedzi w ramach reguł, rosnących grup w wariantach i okresu 5–6 widocznego w całości. Lat7 losuje `mixed` (≥ 2 widoczne liczby), `down1` i ABB. Karty nadal się losują na każdym poziomie (pomiar `null` = 0 na 1000 kart).

## Key Decisions Made

| Decision                        | Choice                                               | Why                                                                      | Source                                  |
| ------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| `groups` na lat7                | Zastąpione wzorem ABB                                | 8 pól nie pokazuje reguły rosnących grup                                 | Plan (decyzja użytkowniczki, dopisek 2) |
| Naprawa `mixed`                 | Co najmniej 2 widoczne liczby (reguła konstrukcyjna) | Usuwa dokładnie 44/2361 złych wierszy, bez rozrostu hipotez              | Plan                                    |
| Zasięg poszerzonego sprawdzenia | Wszystkie poziomy                                    | Jedna definicja dwuznaczności; lat5 AAB z 2 lukami przestaje się losować | Plan                                    |
| Okres 5–6                       | Liczy się tylko widoczny w całości                   | Odrzuca to, co dziecko realnie wyczyta; O(n)                             | Plan                                    |
| `groups` jako hipoteza          | Zostaje w `hypotheses`                               | Nadal drugie odczytanie wierszy ABB                                      | Plan                                    |
| Wydajność                       | Bez zmian architektury                               | Mediana lat7 ok. 2 ms                                                    | Research                                |

## Scope

**In scope:** reguła `mixed`, nowa reguła ABB, poszerzone `sequenceAnswers`, definicja lat7, testy i niezależny oracle, aktualizacja PRD, pomiar odsetka nieudanych kart.

**Out of scope:** kroki ±2/±3 w hipotezach, okres do n−1, zmiana układu karty, zmiany lat4, zmiana id poziomów.

## Architecture / Approach

Test-first, od najwęższego: `mixed` → poszerzone sprawdzenie z pomiarem lat5/lat6 → ABB na lat7 → PRD i oracle. Poszerzenie przed ABB, żeby pomiar lat5 był czysty; `null` > 0 zatrzymuje wdrożenie.

## Phases at a Glance

| Phase                     | What it delivers                        | Key risk                                             |
| ------------------------- | --------------------------------------- | ---------------------------------------------------- |
| 1. `mixed` ≥ 2 liczby     | Reguła wiersza + test                   | Zawężenie puli luk w `drawGaps`                      |
| 2. Poszerzone sprawdzenie | Rosnące grupy w wariantach, okres 5–6   | lat5 AAB z 2 lukami wypada; więcej ponownych losowań |
| 3. ABB na lat7            | Nowa reguła, nowa definicja poziomu     | Aktualizacja testów zależnych od `groups`            |
| 4. PRD i oracle           | PRD, niezależny oracle, przegląd lat4–6 | Oracle mniej lub bardziej surowy niż kod             |

**Prerequisites:** praca w worktree `gh117-sequence-lat7`, Node 22.14.0.
**Estimated effort:** ok. 2–3 sesje, 4 fazy.

## Open Risks & Assumptions

- Jeśli po fazie 2 karty lat5 zaczną zwracać `null`, plan wraca do decyzji o przydziale luk zależnym od reguły.
- Okres 5–6 „widoczny w całości" jest granicą uznaniową.
- Treść issue #117 nie była weryfikowana; przykłady zgłaszającej nieznane.

## Success Criteria (Summary)

- Dziecko widzi w każdym wierszu Poziomu 4 jedną odpowiedź (wydruk próbny).
- Karty na lat4–lat7 nadal się losują (0 niepowodzeń na 1000 kart).
- `npm test`, lint, `astro check` i build są zielone.
