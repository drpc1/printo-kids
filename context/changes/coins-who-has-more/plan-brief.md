# S-33 Karta „Kto ma więcej?” — Plan Brief

> Full plan: `context/changes/coins-who-has-more/plan.md`
> Frame brief: `context/changes/coins-who-has-more/frame.md`

## What & Why

Dokładamy kartę „Kto ma więcej?”: pięć rzędów po dwie kupki monet i banknotów, dziecko wpisuje między kupkami „<”, „>” lub „=”. Pierwsza z czterech kart M-5; przy okazji testy przestają wpisywać liczbę kart na sztywno. Frame: ramowanie „jedna zmiana z kartą” się utrzymało, ale czytelność monety na czarnym druku jest nieznana, a lista miejsc z liczbą kart w issue była niepełna (brakuje `cards.test.ts`).

## Starting Point

W repozytorium jest sześć kart; wszystkie wchodzą jednym wzorcem sekwencji: katalog `CARD_KINDS`, ustawienia w `card-settings.ts`, podsumowanie profilu, strona, generator na `CardPage`, miniatura ze skryptu. Testy mają wpisaną liczbę sześciu kart. Nic nie drukowano z monetami.

## Desired End State

Na `/money` rodzic wybiera poziom (łatwy / średni / trudny), generuje kartę A4, podgląda i drukuje; profil pamięta poziom, katalog i „Jak to działa” znają kartę. Dodanie kolejnej karty nie zmienia liczb w testach.

## Key Decisions Made

| Decision      | Choice                                                                                              | Why                                         | Source |
| ------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------ |
| Zakres        | Jedna zmiana: karta plus testy z katalogu                                                           | Zgodne z issue i konwencją                  | Frame  |
| Id i adres    | `pieniadze`, `/money`, tytuł „Kto ma więcej?”                                                       | Wzorzec innych kart                         | Plan   |
| Remis         | Zero lub jeden rząd na karcie                                                                       | Decyzja użytkownika                         | Plan   |
| Poziom łatwy  | Sumy do 10 zł, tylko monety, 1–5 sztuk                                                              | Dziecko 6 lat bez dodawania                 | Plan   |
| Poziom średni | Monety 1/2/5 zł, suma do 20 zł, dokładnie 2 z 5 rzędów „myli”                                       | Stopniowanie do trudnego                    | Plan   |
| Poziom trudny | 1–20 zł z banknotami, suma do 50 zł, co najmniej 3 z 5 „myli”                                       | PRD                                         | Plan   |
| Zaznaczanie   | Wpisuje „<”, „>” lub „=” między kupkami; polecenie „Gdzie jest więcej pieniędzy? Wskaż <, > lub =.” | Decyzja użytkownika, odchylenie od PRD      | Plan   |
| Kolory        | Poza tą kartą, osobny kawałek                                                                       | Druk czarny w PRD, rysunek zależy od bramki | Plan   |
| Kolejność     | Testy z katalogu, makieta z bramką, potem karta                                                     | Makieta wymaga wydruku                      | Frame  |

## Scope

**In scope:** karta, poziomy, generator z regułami, pamięć w profilu, katalog, miniatura, opis, testy z liczbą z katalogu, poprawki PRD.

**Out of scope:** grosze, banknoty powyżej 20 zł, ceny, reszta, ocena rysunku, kolory, testy mutacyjne, wierne kopie polskich monet i banknotów.

## Architecture / Approach

Nowy moduł `src/lib/money/` (poziomy, reguły, generator, układ, stałe rysunku), strona `/money` i `MoneyGenerator` na `CardPage`, wpisy w `cards.ts`, `card-settings.ts`, `card-summary.ts`. Miniatura i makieta czytają te same stałe rysunku.

## Phases at a Glance

| Phase                | What it delivers                           | Key risk                             |
| -------------------- | ------------------------------------------ | ------------------------------------ |
| 1. Liczba z katalogu | Testy i smoke bez wpisanej liczby kart     | Utrata sprawdzanego zachowania       |
| 2. Makieta (bramka)  | Trzy pliki do wydruku, decyzja użytkownika | Nominał nieczytelny na czarnym druku |
| 3. Generator         | Poziomy, reguły, generator z testami       | Reguły „myli” i remis na granicy     |
| 4. Strona i katalog  | Karta w produkcie z testami e2e            | Wysokość druku w iOS                 |
| 5. PRD               | PRD zgodne z decyzjami                     | —                                    |

**Prerequisites:** wydruk makiety przez użytkownika po fazie 2.
**Estimated effort:** ok. 4–5 sesji, 5 faz.

## Open Risks & Assumptions

- Czytelność monety i banknotu oraz wartości startowe (sztuki w kupce, rozmiary) potwierdza dopiero wydruk.
- Prawa do wyglądu pieniędzy: rysunki muszą być uproszczone i nie mogą uchodzić za prawdziwy pieniądz (ustalenie użytkowniczki, 2026-11-01).
- Seed plakietek na telefonie to lista najszerszych plakietek, nie wszystkich kart.

## Success Criteria (Summary)

- Rodzic generuje, podgląda i drukuje kartę na jednej stronie A4, także z telefonu.
- Profil pamięta poziom, katalog pokazuje plakietkę.
- Dodanie kart S-34 do S-36 nie wymaga zmiany liczb w testach.
