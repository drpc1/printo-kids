---
change_id: test-plan-refresh-2026-10-06
title: Refresh the whole-product test-plan guide
status: implementing
created: 2026-10-06
updated: 2026-10-07
archived_at: null
---

## Notes

Odświeżenie context/foundation/test-plan.md. Użytkownik zaakceptował brief i wyraźnie kazał przepisać guide dla całego produktu, łącznie z niezrobionym backlogiem i rzeczami zaparkowanymi. Ta zmiana może przepisać §1–§7. Nie edytuj guide w miejscu przy samym tworzeniu folderu. Po utworzeniu folderu następnym naturalnym poleceniem jest /10x-research test-plan-refresh-2026-10-06: brief ma dowody i intencję odpowiedzi, nie kotwice w kodzie. Badanie ma ustalić, co cztery istniejące pliki npm test już dowodzą, a co zostaje otwarte.

Guide z 2026-10-05 jest nieaktualny: opisuje jeden plik testu, a npm test uruchamia cztery pliki w src/lib/. Faza 1 ma folder testing-path-count, którego nie ma; archiwum ma 2026-10-05-testing-path-count. Faza 2 jest not started, a print-sheet-contract jest w trakcie; Chrome i Edge sprawdzone, Firefox i Safari odłożone 2026-10-05.

Ryzyka:
1. Wysoki × Średni. Kartka wygląda na gotową, a labiryntu nie da się uczciwie rozwiązać: brak ścieżki, więcej niż jedna, albo po zmianie rysowania, kształtu lub poziomów wynik przestaje być prawidłowy. Źródła: wywiad P1 i P4; PRD: dokładnie jedno rozwiązanie; użytkownik włączył zaparkowane poziomy; src/lib/maze/ — 3 zmiany / 30 dni; poprawka rysowania wspólnej ściany 2026-10-01. Ochrona: taka kartka nie jest gotowa. Kwestionuj: test szczęśliwej ścieżki oznacza odrzucenie złego labiryntu; progi łatwy/średni/trudny są już znane. Badanie: jak dziś rozstrzygana jest prawidłowa kartka i które reguły już istnieją. Warstwa: test jednostkowy na runnerze Node. Anty-wzorzec: wyrocznia skopiowana z bieżącego rysunku; progi poziomów wymyślone przed ich ustaleniem.
2. Średni × Wysoki. Ekran dobry, a podgląd druku Chrome obcina labirynt albo daje drugą stronę. Źródła: wywiad P2; FR-005 i margines 10 mm; ryzyko S-02; src/components/ — 39 zmian / 30 dni. Ochrona: jedna strona A4, labirynt nieobcięty, margines co najmniej 10 mm. Kwestionuj: dobry ekran oznacza dobry druk. Warstwa: kontrakt układu, inaczej ręczny podgląd Chrome. Anty-wzorzec: zrzut ekranu, pełne e2e, test stron startera.
3. Średni × Średni. Brak „Meta”, postać nie przy starcie albo zasłania wejście, wydruk nie zgadza się z tymi faktami. Źródła: US-01; zarchiwizowany plasterek postaci; src/components/. Ochrona: postać przy starcie, „Meta” przy końcu, wydruk zgodny. Kwestionuj: ekran oznacza ten sam wydruk. Warstwa: ten sam kontrakt kartki co ryzyko 2. Anty-wzorzec: migawka pikseli.
4. Średni × Średni. Edge, Firefox albo Safari powtarza obcięcie lub drugą stronę, gdy Chrome jest dobry. Źródła: PRD wymienia cztery przeglądarki; wywiad P2 tylko Chrome; Firefox i Safari odłożone. Ochrona: ten sam wydruk jest jedną stroną A4 także tam. Kwestionuj: dobry Chrome oznacza dobre pozostałe. Warstwa: ręczny podgląd dopiero gdy Chrome jest zielony. Anty-wzorzec: macierz automatycznych przeglądarek jako pierwszy test druku.
5. Wysoki × Niski. Jednorazowa zmiana kartki zapisuje się jako profil, usunięcie przechodzi bez potwierdzenia, albo profil, ostatnie parametry lub własny obrazek opuszczają urządzenie. Źródła: FR-009, FR-010, NFR danych na urządzeniu, US-02, roadmapa S-05 i S-06. To nie alert o chmurze. Testu nie pisz, zanim plasterek istnieje. Ochrona: jawny zapis, potwierdzenie usunięcia, dane zostają na urządzeniu. Kwestionuj: zapis lokalny oznacza, że dane zostały; każda zmiana kartki jest zmianą profilu. Warstwa: kontrakt lokalny, gdy S-05, S-06 albo US-02 powstanie. Anty-wzorzec: test profilu albo uploadu przed kodem; test konta.
6. Średni × Wysoki. Przebieg automatyczny poświadcza konta ze startera albo budżet schodzi na testy startera. Źródła: wywiad P5; smoke w CI; F-02 proposed; src/components/auth/ — 11 zmian / 30 dni; src/pages/auth/ — 6. Ochrona: bramka pilnuje kartki i nie obrasta testami kont. Kwestionuj: smoke startera oznacza rozwiązywalny labirynt i jedną stronę A4. Warstwa: npm test jako bramka produktu; smoke produktu bez asercji kont. Anty-wzorzec: nowe testy logowania, dashboardu albo API kont.

Biblioteka kart (FR-011) używa wyroczni ryzyka 1, dopiero gdy powstanie. Progi łatwy/średni/trudny nie są osobnym ryzykiem. Testów startera nie dodawać. Wywiad P3: użytkownik zmienia wszystko, więc kolejność faz bierze się z wpływu i sparzenia.

Fazy: 1 prawidłowy labirynt po zmianie rysowania (ryzyko 1). 2 kontrakt druku i faktów kartki (2, 3, 4). 3 dane lokalne po powstaniu plasterka (5). 4 bramka produktu bez startera (6).

Hot-spot: src, 19 commitów od 2026-09-06. Najczęstsze: src/components/ (39), src/pages/ (15), src/lib/ (11). Baza testów: sparse.
