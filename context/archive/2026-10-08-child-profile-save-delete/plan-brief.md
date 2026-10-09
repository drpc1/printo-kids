# Zapis ulubionej i usunięcie profilu — Plan Brief

> Full plan: `context/changes/child-profile-save-delete/plan.md`

## What & Why

Rodzic zapisuje ulubioną postać dziecka w menu z rogu i usuwa profil po potwierdzeniu. Jednorazowa zmiana obok Generuj ma wejść do labiryntu i nie zmieniać profilu sama. Poziom trudności zostaje zaparkowany.

## Starting Point

Róg na `/` zakłada profil i przy co najmniej dwóch imionach każe wybrać dziecko. Ulubiona przy jednym dziecku jest do odczytu. `writeChildProfiles` działa przy „Utwórz”. Pasek Postać przy aktywnym dziecku nie zapisuje profilu ani `printo-kids:last-used`. „Zapisz” i „Usuń” nie istnieją.

## Desired End State

Zapis dinozaura w rogu, gdy pasek nadal pokazuje rakietę, zostawia dinozaura w profilu i na pasku. Jeśli rodzic zdążył wybrać samochodzik obok Generuj, pasek zostaje przy samochodzik, a dinozaur wchodzi po odświeżeniu. Klik innego imienia przy niezapisanym szkicu pyta „Zapisz i przełącz” albo „Przełącz bez zapisu”. Usunięcie innego dziecka zostawia aktywną kartę. Usunięcie aktywnego liczy wizytę od nowa z pozostałej listy.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Ulubiona | Cztery wiersze w rogu i „Zapisz” | Profil przyjmuje postać tylko z menu dziecka. |
| Karta | Pasek obok Generuj na tę wizytę | Do labiryntu idzie postać z paska, a ulubiona zostaje do „Zapisz”. |
| Wejście | Ulubiona zapisana w profilu | Świeża wizyta znowu bierze postać dziecka, nie jednorazowy wybór. |
| Po „Zapisz” | Pasek zmienia się, gdy nadal pokazuje poprzednią ulubioną | Samochodzik wybrany przy Generuj zostaje na tej karcie. |
| Przełączenie | „Zapisz i przełącz” albo „Przełącz bez zapisu” | Szkic dinozaura nie znika przez klik w Antka i nie zapisuje się sam. |
| Miejsce | „Zapisz” i „Usuń” w menu rogu | Profil zostaje osobną funkcją rogu. |
| Kogo usunąć | Każde imię, bez stawania się aktywnym | Przy jednym dziecku „Usuń” jest w jego menu. |
| Po usunięciu aktywnego | Ta sama reguła co wejście | Jeden pozostały włącza się sam; dwoje i więcej znowu pytają. |
| Inne dziecko | Aktywne zostaje, pasek bez zmian | Skasowanie Basi nie przerywa karty Zosi. |
| Imię | Bez edycji | Literówkę zdejmuje usunięcie i nowe założenie. |
| Szkic | Zamknięcie okna porzuca go bez pytania | Ostrzeżenie jest tylko przy kliknięciu innego imienia. |

## Scope

**In scope:**

- „Zapisz” ulubionej w rogu i reguła paska po tym zapisie
- „Usuń” przy każdym imieniu, potwierdzenie i stan wizyty po skasowaniu
- Ostrzeżenie przy przejściu na inne dziecko z niezapisanym szkicem
- Testy czystych reguł

**Out of scope:**

- Edycja imienia, poziom trudności, US-03 i wiersz „Bez profilu”
- Zapis postaci z paska do profilu, limit profili, konto i serwer
- Osobne okno potwierdzenia oraz ostrzeżenie przy zamknięciu rogu

## Architecture / Approach

`src/lib/child-profiles.ts` liczy nową tablicę, pasek po „Zapisz” i wizytę po usunięciu. Wyspa zapisuje wynik istniejącym `writeChildProfiles`. Potwierdzenie i ostrzeżenie są widokami dialogu rogu. Generuj gaśnie tylko wtedy, gdy zostały co najmniej dwa profile i nikt nie jest aktywny.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Kontrakt zapisu i usunięcia | Czyste reguły ulubionej, paska i listy | Test przepuści regułę, która podmienia jednorazowy samochodzik |
| 2. Zapis ulubionej w rogu | Wiersze i „Zapisz” przy aktywnym dziecku | Klik w rogu albo „Zapisz” ruszy `printo-kids:last-used` |
| 3. Usunięcie i przełączenie | Potwierdzenie, ostrzeżenie i Generuj po zmianie listy | Flaga z początku wizyty zgasi Generuj po skasowaniu ostatniego dziecka |

**Prerequisites:** S-05 jest done; róg, `printo-kids:child-profiles` i pasek Postać są na `/`.
**Estimated effort:** dwie sesje, trzy fazy.

## Open Risks & Assumptions

- Magazyn w trybie prywatnym może rzucić. Zostaje komunikat „Nie udało się zapisać profilu”, a lista i dziecko się nie zmieniają.
- Po „Zapisz” pasek może pokazywać jednorazową postać aż do odświeżenia albo ponownego wyboru dziecka.
- Potwierdzone usunięcie nie ma cofania na tym urządzeniu.
- „Dodaj profil” przy brudnym szkicu porzuca szkic bez ostrzeżenia. Aktywne dziecko zostaje.

## Success Criteria (Summary)

- Zapis dinozaura przy pasku rakieta zostawia dinozaura po odświeżeniu. Zapis przy pasku samochodzik zostawia samochodzik na tej karcie i daje dinozaura dopiero po odświeżeniu, bez zmiany `printo-kids:last-used`.
- Klik Antka przy niezapisanym dinozaurze Zosi pyta o zapis. Usunięcie Basi zostawia Zosię. Usunięcie aktywnego dziecka zachowuje się jak świeże wejście z pozostałą listą, a zero profili puszcza Generuj.
- Druk jednej strony A4 nie pokazuje rogu, zapisu, usunięcia ani ostrzeżenia.
