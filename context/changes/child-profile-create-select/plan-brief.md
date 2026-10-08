# Utworzenie i wybór profilu dziecka — Plan Brief

> Full plan: `context/changes/child-profile-create-select/plan.md`

## What & Why

Rodzic może założyć opcjonalny lokalny profil dziecka z ulubioną postacią i wybrać zapisany profil, gdy dzieci jest co najmniej dwoje. Wydruk ma działać także bez profilu. Poziom trudności zostaje na później; ten plasterek dowozi imię i postać.

## Starting Point

Na `/` są Postać, Generuj i Drukuj. Ostatnia postać bez profilu leży w `localStorage` pod `printo-kids:last-used`. Profilu, imienia i selektora w `src/` nie ma. Jawny zapis zmian i usunięcie profilu to następny plasterek.

## Desired End State

Róg ekranu pokazuje „Profil” albo imię aktywnego dziecka. Pierwszy profil, na przykład Zosia z rakietą, od wejścia ustawia rakietę na pasku. Przy Zosi i Antku wejście pyta o dziecko: pasek zostaje przy ostatniej postaci bez profilu, a Generuj czeka na imię. Jednorazowa zmiana postaci nie przepisuje profilu ani klucza bez profilu. Druk nadal jest jedną stroną A4.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Miejsce | Prawy górny róg ekranu | Profil jest osobną funkcją, nie przyciskiem na pasku karty. |
| Etykieta rogu | „Profil” albo imię aktywnego | Przed kliknięciem widać, czyje ustawienia wejdą na kartę. |
| Menu | Z rogu; lista imion dopiero od dwóch | Przy jednym dziecku nie ma kogo wybierać. |
| Zakładanie | Imię i ulubiona postać | Poziom trudności i dalsze pola dochodzą później. |
| Jedno dziecko | Ulubiona od wejścia, bez pytania | Samo imię nie jest wyborem. |
| Dwoje i więcej | Menu od razu, pasek to ostatnia postać bez profilu, Generuj czeka | Na wspólnym tablecie Zosia nie wchodzi, zanim rodzic kliknie imię. |
| Odświeżenie | Wraca ulubiona wybranego dziecka | Klik dinozaura przy Zosi z rakietą nie staje się nową pamięcią profilu. |
| Imię | Trim, bez pustych, bez duplikatu, do 40 znaków | W menu każde imię da się poznać. |
| Wyjście z profilu | Dopiero usunięcie w następnym plasterku | To menu nie kasuje dziecka. |
| Limit | Brak | Odcięcie dodawania bez usuwania zablokowałoby kolejne dziecko. |
| Kolejność | Alfabetycznie po polsku; „Dodaj profil” na dole | Nowy profil i tak od razu staje się aktywny. |
| Magazyn | `localStorage`, klucz `printo-kids:child-profiles` | Zostaje na urządzeniu, osobno od `printo-kids:last-used`. |

## Scope

**In scope:**

- Róg, formularz imienia i postaci, menu jednego dziecka i wybór od dwóch imion
- Blokada Generuj do wyboru, gdy profili jest co najmniej dwa
- Zapis na urządzeniu i testy kontraktu

**Out of scope:**

- Poziom trudności, usunięcie profilu i zapis zmienionej postaci z powrotem do profilu
- Wiersz „Bez profilu”, limit profili, lista na stronie labiryntu
- Konto, serwer i przerabianie klucza ostatniej postaci na profil

## Architecture / Approach

Moduł `src/lib/child-profiles.ts` trzyma tablicę profili i reguły wizyty. Wyspa czyta ją przy starcie: jeden profil staje się aktywny, dwa i więcej czekają na kliknięcie imienia. Róg jest w tej samej wyspie co Postać, przypięty do rogu okna. Klik postaci zapisuje ostatnią postać bez profilu tylko wtedy, gdy żaden profil nie jest aktywny.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Kontrakt zapisu | Moduł i testy imienia, postaci i złego odczytu | Zły JSON, który test przepuści, wróci jako czyjś profil |
| 2. Róg i założenie | Pierwszy profil i ulubiona postać na pasku | Klik postaci przy Zosi nadpisze klucz bez profilu |
| 3. Wybór przy dwóch i więcej | Menu alfabetyczne i blokada Generuj | Pytanie pojawi się po pierwszym malowaniu i karta zdąży powstać |

**Prerequisites:** S-03 i S-04 są done; kontrolka postaci i `printo-kids:last-used` są na `/`.
**Estimated effort:** dwie albo trzy sesje, trzy fazy.

## Open Risks & Assumptions

- Magazyn w trybie prywatnym może rzucić. Okno zostaje z komunikatem, a bieżąca wizyta działa bez nowego profilu.
- Do chwili wyboru pasek przy dwójce dzieci pokazuje ostatnią postać bez profilu, która może nie należeć do żadnego z nich.
- Profil założony przypadkiem zostaje do plasterka z usunięciem.
- Długie imię w rogu jest obcięte; pełne widać w menu.

## Success Criteria (Summary)

- Po odświeżeniu sama Zosia z rakietą znowu daje „Postać: Rakieta”, a klik dinozaura w poprzedniej wizycie nie zmienia `printo-kids:last-used`.
- Przy Zosi (rakieta) i Antku (dinozaur), gdy ostatnia postać bez profilu to samochodzik, Generuj nie działa i pasek pokazuje Samochodzik, dopóki rodzic nie kliknie imienia. Po wyborze Zosi pasek pokazuje rakietę; kolejne odświeżenie znowu pyta i rakieta wraca dopiero po ponownym kliknięciu Zosi.
- Druk jednej strony A4 nie pokazuje rogu ani menu, a brak profili zostawia dzisiejszą ścieżkę ostatniej postaci.
