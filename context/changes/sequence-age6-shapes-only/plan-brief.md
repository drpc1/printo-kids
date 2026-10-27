# Sekwencje, Poziom 3: same kształty — Plan Brief

> Full plan: `context/changes/sequence-age6-shapes-only/plan.md`

## What & Why

Karta sekwencji na Poziomie 3 (dziś podpisana „6 lat”) miesza obrazki z ciągami liczb +1 i +2. Issue #111 chce na tej karcie samych obrazków. Liczby, które już są na Poziomie 4, zostają tam.

## Starting Point

Poziom 3 losuje pięć reguł: `up1`, `up2`, `AB`, `AAB` i `ABC`, po co najmniej jednym wierszu, plus dwa dowolne. Ma 8 pól, 7 wierszy i 2 luki. Poziom 4 losuje `mixed`, `down1` i `groups` po dwa wiersze i jednego dowolnego. Jedna odpowiedź jest sprawdzana względem całej listy reguł, także tych spoza puli poziomu. PRD nadal wymaga +1 i +2 na Poziomie 3.

## Desired End State

Poziom 3 pokazuje tylko wzory AB, AAB i ABC. Każdy jest co najmniej w dwóch wierszach, a siódmy wiersz jest jednym z nich, więc karta ma układ 3, 2 i 2. Nie ma na niej cyfr. Długość, liczba luk i jedna strona A4 zostają. Poziom 4 wygląda jak dziś. Rodzic nie wydrukuje już ciągu rosnącego o 1 albo o 2.

## Key Decisions Made

| Decision            | Choice                                                | Why (1 sentence)                                                                                                 |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| +1 i +2             | Znikają z losowania, zostają w sprawdzaniu odpowiedzi | Issue zostawia liczby na Poziomie 4, a ten poziom nie ma miejsca na dwie dodatkowe reguły przy siedmiu wierszach |
| Poziom 4            | Bez zmian                                             | Przeniesienie +1 i +2 ścięłoby jego dzisiejsze minima                                                            |
| Mieszanka Poziomu 3 | Po dwa wiersze AB, AAB i ABC oraz jeden dowolny       | Każda karta ćwiczy wszystkie trzy wzory więcej niż raz                                                           |
| Rosnące grupy       | Zostają na Poziomie 4                                 | Issue wymienia wzory AB, AAB i ABC, nie grupy                                                                    |
| Etykiety            | Zostają „6 lat” i „7 lat”                             | Nazwy bez wieku to slice S-27                                                                                    |

## Scope

**In scope:**

- `lat6.rules` w `src/lib/sequence/levels.ts`
- Asercje w `levels.test.ts` i `generate.test.ts`, w tym zakres liczb 1–20 tylko z Poziomu 4
- Wiersz Poziomu 3, punkt doprecyzowania i dopisek w pytaniu otwartym 9 w `context/foundation/prd.md`

**Out of scope:**

- `rules.ts`, generator, układ strony i rysowanie pól
- Pula, luki i liczba wierszy Poziomu 4
- Poziomy 1 i 2
- Zmiana etykiet na „Poziom 3” i „Poziom 4”

## Architecture / Approach

Generator czyta pulę z tablicy poziomu i nie ma osobnej ścieżki dla wieku. Zmiana to trzy wpisy `minRows: 2` zamiast pięciu wpisów `minRows: 1`. Suma 6 mieści się w 7 wierszach. Sprawdzenie jednej odpowiedzi nadal odrzuca wiersz, który da się wypełnić inaczej regułą +1, +2, malejącą, grupą albo mieszaną.

## Phases at a Glance

| Phase                   | What it delivers                                | Key risk                                                   |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| 1. Pula reguł Poziomu 3 | Tablica i testy bez `up1` i `up2` na tej karcie | Test liczb 1–20 dziś czyta też Poziom 3                    |
| 2. Kontrakt w PRD       | Tabela i doprecyzowanie zgodne z tablicą        | Zostawienie zdania o pięciu regułach przywróciłoby +1 i +2 |

**Prerequisites:** Brak. Folder zmiany jest `new`, a kod poziomów jest na gałęzi roboczej.
**Estimated effort:** Jedna sesja, dwie fazy. Faza 1 to edycja tablicy i dwóch testów. Faza 2 to trzy miejsca w PRD.

## Open Risks & Assumptions

- Wydruk z 2026-10-24 potwierdził mieszankę z liczbami na Poziomie 3. Ta zmiana świadomie ją zastępuje tylko w tym punkcie. Pytanie otwarte 9 ma to odnotować.
- Po zawężeniu próby liczb do Poziomu 4 asercja „jest 1 i jest 20” może paść. Poprawia się wtedy próbkę Poziomu 4, nie pulę Poziomu 3.
- Etykieta przycisku nadal mówi „6 lat”, dopóki nie wejdzie S-27.

## Success Criteria (Summary)

- Karta „6 lat” nie zawiera cyfr i na każdej stronie ma wzory AB, AAB i ABC w układzie 3, 2 i 2.
- Każdy wiersz każdego poziomu ma nadal jedną odpowiedź, a Poziom 4 nadal losuje malejące, mieszane i rosnące grupy.
- PRD nie wymaga już +1 ani +2 na Poziomie 3 i nadal wymienia te reguły na liście sprawdzania odpowiedzi.
