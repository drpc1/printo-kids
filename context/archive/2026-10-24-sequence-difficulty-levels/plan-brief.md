# Poziomy karty sekwencji (S-17) — Plan Brief

> Full plan: `context/changes/sequence-difficulty-levels/plan.md`

## What & Why

Rodzic wybiera na `/sekwencje` poziom nazwany wiekiem (4, 5, 6, 7 lat), żeby dostać kartę na właściwym poziomie, tak jak w labiryncie i symetrii. Poziom zmienia długość ciągu, rodzaj reguł, liczbę ciągów i liczbę pustych pól (PRD US-11, FR-020).

## Starting Point

Po S-16 jest jedno stałe ustawienie „5 lat” (6 ciągów po 7 pól, wzory AB/AAB/ABC z kształtami). Walidator zna tylko wzory powtarzane, a pola zawierają wyłącznie kształty. Pasek ma Generuj i Drukuj, bez wyboru poziomu.

## Desired End State

Przycisk „Poziom: 5 lat”; wybór poziomu przy widocznej karcie od razu daje nową kartę. 4 lata: 5 ciągów po 5 pól, wzór AB, 1 luka na końcu. 5 lat: jak dziś. 6 lat: 7 ciągów po 8 pól, liczby +1/+2 i wzory kształtów, 2 luki. 7 lat: 7 ciągów po 8 pól, kształt z liczbą, liczby malejące, rosnące grupy, 2–3 luki. Każdy ciąg ma jedną odpowiedź względem całej listy reguł, a każdy poziom to jedna strona A4 z marginesem 10 mm, także na telefonie.

## Key Decisions Made

| Decision                 | Choice                                                                       | Why (1 sentence)                                                      | Source |
| ------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| Wygląd liczby w polu     | Gruba cyfra na środku, około połowy pola, bez ramki                          | Czytelna dla 6-latka i spójna z kształtami; decyzja użytkowniczki     | Plan   |
| Rosnące grupy (A·AB·ABB) | Bloki A, AB, ABB sklejone i ucięte do długości ciągu                         | Dosłownie zgodne z listą reguł w PRD; decyzja użytkowniczki           | Plan   |
| Zakres liczb             | 1–20                                                                         | Maksymalnie dwie cyfry w polu, skończona przestrzeń hipotez           | Plan   |
| Walidator                | Jawna lista reguł: przestrzeń hipotez dla długości n, dokładnie jedna krotka | Zastępuje test samej okresowości, działa dla liczb, grup i mieszanych | Plan   |
| Wyrocznia w testach      | Próbuje wszystkich wypełnień z 24 symboli, własny predykat przynależności    | Niezależna od kodu walidatora (ryzyko 8 w test-plan.md)               | Plan   |
| Luki poziomów 4–5        | Ostatnie pole; druga luka w drugiej połowie (jak w PRD)                      | Wzór widoczny w całości przed pierwszą luką                           | PRD    |
| Luki poziomów 6–7        | Dowolne pola po polach pokazujących regułę; liczba luk 7 lat według pomiaru  | PRD nie podaje pozycji, a o jednoznaczności rozstrzyga walidator      | Plan   |
| Losowanie                | Wiersze pojedynczo z ponawianiem, karta składana wg minimów reguł            | Przy 8 polach i 2–3 lukach wiele losowań jest niejednoznacznych       | Plan   |
| Stan poziomu             | Tylko stan strony, domyślnie 5 lat; zmiana generuje nową kartę               | Jak symetria; profil i ostatnie parametry to US-08 (odłożone)         | Plan   |
| Przycisk poziomu         | Nowy `SequenceLevelChoice.tsx`, bez ruszania `SymmetryLevelChoice.tsx`       | Unika konfliktów z równoległymi zmianami (#81, S-19)                  | Plan   |
| Miniatura                | Zostaje karta 5 lat, przegenerowana                                          | Losowanie wierszami zmienia kolejność użycia ziarna                   | Plan   |

## Scope

**In scope:** `levels.ts`, nowy `rules.ts`, generator i walidator, liczba w polu, pasek poziomu, testy jednostkowe z wyrocznią, test układu każdego poziomu, e2e, miniatura, poprawki PRD i `test-plan.md`, ręczny druk.

**Out of scope:** profil i ostatnie parametry poziomu sekwencji, nowe reguły i zakres liczb powyżej 20, ujednolicenie trzech kopii przycisku poziomu, kolory, odpowiedzi na kartce.

## Architecture / Approach

Wiersz niesie nazwę reguły i elementy (kształt albo liczba). `rules.ts` buduje ciągi z reguł i listę wszystkich ciągów danej długości; walidator zlicza różne odpowiedzi zgodne z widocznymi polami i wymaga dokładnie jednej. Generator losuje wiersze w granicach poziomu i składa kartę. Wyspa trzyma `levelId` w stanie, rysuje cyfrę albo kształt i generuje kartę przy zmianie poziomu.

## Phases at a Glance

| Phase                              | What it delivers                                                     | Key risk                                                        |
| ---------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1. Poziomy, reguły i generator     | Cztery poziomy, lista reguł, walidator, testy z niezależną wyrocznią | Za dużo odrzuceń (3 luki w grupach i mieszanych) lub czas > 5 s |
| 2. Strona                          | Liczba w polu, pasek poziomu, test układu każdego poziomu            | Cyfra za mała lub zbyt szeroka w polu                           |
| 3. Miniatura, e2e, dokumenty, druk | Zielone bramki, PRD i test-plan zaktualizowane, ręczny druk poziomów | Wartości startowe nietrafione (PRD Open Questions 9)            |

**Prerequisites:** S-16 na `main` (jest). **Estimated effort:** około 3 sesji, po jednej na fazę.

## Open Risks & Assumptions

- Trzy luki w ciągach z grupami lub mieszanych mogą nie mieć żadnego poprawnego rozmieszczenia; pomiar w fazie 1 zawęża ten wymóg (3 ciągi z trzema lukami zostają, jeśli to możliwe).
- Zakres liczb 1–20 i położenie luk na poziomach 6–7 to założenia planu; PRD dostaje je w fazie 3.
- Losowanie wierszami zmienia kartę miniatury dla tego samego ziarna.

## Success Criteria (Summary)

- Rodzic wybiera jeden z czterech poziomów, a karta ma długość ciągu, reguły, liczbę ciągów i luk z tabeli PRD.
- Każdy ciąg ma jedną odpowiedź, a każdy poziom drukuje się na jednej stronie A4 z marginesem 10 mm, także z telefonu.
- Wydruk czterech poziomów potwierdza (albo koryguje) wartości startowe.
