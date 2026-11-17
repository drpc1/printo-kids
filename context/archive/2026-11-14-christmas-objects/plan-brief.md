# Świąteczne obiekty (S-38) — Plan Brief

> Full plan: `context/changes/christmas-objects/plan.md`
> Frame brief: `context/changes/christmas-objects/frame.md`

## What & Why

Rodzic ma przed grudniem 2026 drukować świąteczne karty symetrii, nonogramu, dyktanda i „Skopiuj obrazek”. Frame ustalił, że to kategoria obiektów z oknem dat, a nie tag. Jest to pierwszy zegar w aplikacji, w postaci czystej funkcji z datą w argumencie. Pierwszą taką kategorią jest „Boże Narodzenie”: 7 nowych obiektów z szablonów, 6 kształtów dyktanda oraz istniejące choinka i gwiazda.

## Starting Point

Katalog ma 34 obiekty w sześciu stałych kategoriach. Pasek czyta statyczną listę `OBJECT_CATEGORY_CHOICES`, a nic w kodzie nie zna daty. Obiekt może mieć kilka kategorii, ale żaden jeszcze nie ma. „Skopiuj obrazek” sprawdza kartę przez „Wszystkie”, więc „Wszystkie” musi zostać pełnym katalogiem.

## Desired End State

Od 15.11 do 6.01 lista „Kategoria” ma „Boże Narodzenie” zaraz po „Wszystkie”, a wybór losuje tylko obiekty świąteczne na czterech kartach. Poza oknem pozycji nie ma, a zapamiętana kategoria pokazuje się jako „Wszystkie” i nadpisuje się przy pierwszej zmianie na pasku. Całość jest na produkcji przed 1.12.2026.

## Key Decisions Made

| Decision            | Choice                                                                            | Why (1 sentence)                                                         | Source |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------ |
| Mechanizm           | Kategoria z oknem dat                                                             | S-43 taguje rodzaje kart, a PRD przewiduje sezonową kategorię.           | Frame  |
| Widoczność          | Jedna pora roku i kategoria specjalna naraz; dziś tylko Boże Narodzenie           | Bez 12 stałych kategorii na pasku.                                       | User   |
| „Wszystkie”         | Pełny katalog cały rok                                                            | Silniki kart i „Skopiuj obrazek” bez zmian; mniej ryzyka przed terminem. | User   |
| Okno                | 15.11 – 6.01, data lokalna, granice włącznie                                      | Druk przed grudniem, do Trzech Króli.                                    | User   |
| Kolejność paska     | Wszystkie, Boże Narodzenie, stałe alfabetycznie                                   | Rodzic od razu widzi nowość; zmienia zdanie w US-20.                     | User   |
| Nazwa               | „Boże Narodzenie”, id `boze-narodzenie`                                           | Nie zderzy się z Wielkanocą.                                             | User   |
| Pamięć poza oknem   | Pasek pokazuje „Wszystkie”, zapis przy pierwszej zmianie                          | Odczyt tolerancyjny jak dziś, bez zapisu przy wejściu.                   | User   |
| Stałe kategorie     | choinka (Przyroda), gwiazda (Kształty), renifer (Zwierzęta)                       | Decyzja dla każdego obiektu osobno.                                      | User   |
| Bałwanek            | Szary korpus w kolorach                                                           | Brak białej kredki.                                                      | User   |
| #379                | Osobno, po S-38                                                                   | Bez zmiany mechanizmu „Skopiuj obrazek” przed terminem.                  | User   |
| Wydanie             | Jedno, po wszystkich fazach                                                       | Raz checklista stagingu.                                                 | User   |
| Akceptacja rysunków | PNG z makiety, wydruk na stagingu przed wydaniem                                  | Wzór gh124.                                                              | User   |
| Miejsce daty        | `useToday` w warstwie React; mapowanie w `useCardSettings` i podsumowaniu profilu | Silniki, `sheet-state` i `parseCardSettings` zostają czyste.             | Plan   |

## Scope

**In scope:**

- okno dat w `OBJECT_CATEGORIES`, lista paska na datę, mapowanie kategorii spoza okna;
- choinka i gwiazda w nowej kategorii;
- 7 obiektów w trzech rozmiarach i 6 kształtów dyktanda;
- makieta ze skryptem reguł;
- testy z datą, e2e z `page.clock`;
- glosariusz, PRD, liczby.

**Out of scope:**

- pory roku (osobny kawałek), inne święta;
- #379 (kształty na „Skopiuj obrazek”), kształty na nonogramie;
- data w silnikach;
- Mikołaj w całości (S-39);
- „Jak to działa” (S-44).

## Architecture / Approach

Kategoria może mieć `window`. Dwie czyste funkcje, `objectCategoryChoicesOn(today)` i `visibleCategoryOn(category, today)`, dają listę paska i kategorię widoczną dziś. Woła je tylko `useToday` (data zamrożona na wizytę) w `useCardSettings`, `CategoryChoice` i `ProfileCorner`. Rysunki przechodzą makietę i skrypt reguł czterech kart przed kodem. Nowe obiekty dochodzą na końcu katalogu, nowe kształty na końcu `DICTATION_SHAPES`.

## Phases at a Glance

| Phase                    | What it delivers                                                    | Key risk                                                            |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1. Makieta i pomiar      | Zatwierdzone rysunki 7 obiektów i 6 kształtów, PNG, pomiar          | Czytelność w 4×12, nonogram trudny bez działającego wariantu        |
| 2. Kategoria z oknem dat | „Boże Narodzenie” na pasku w oknie, odczyt poza oknem, testy z datą | Granice okna przez Nowy Rok, lista z ośmioma pozycjami na telefonie |
| 3. Obiekty z szablonów   | 7 obiektów na czterech kartach                                      | Styk rogiem i dziury w nonogramie                                   |
| 4. Kształty dyktanda     | 6 kształtów, renifer też w Zwierzętach                              | Pompon czapki i płozy sanek stykające się rogiem                    |
| 5. Domknięcie            | PRD, liczby, e2e, wydruk na stagingu, wydanie                       | Termin 1.12                                                         |

**Prerequisites:** akceptacja makiety przed fazami 3–4 (faza 2 idzie równolegle).
**Estimated effort:** ~4–5 sesji w 5 fazach; główny koszt to około 27 szablonów i 13 bitmap kształtów.

## Open Risks & Assumptions

- Obiekt, który nie przejdzie reguł albo jest nieczytelny, odpada bez zastępstwa (kolejność cięcia w frame).
- Po scaleniu fazy 2 staging ma „Boże Narodzenie” tylko z choinką i gwiazdą. Wydanie jest dopiero po fazie 5.
- Więcej obiektów wydłuża test trudnego nonogramu (próg 15 s).
- Zakładamy, że data urządzenia rodzica jest poprawna.

## Success Criteria (Summary)

- W oknie rodzic wybiera „Boże Narodzenie” i drukuje świąteczną kartę symetrii, nonogramu, dyktanda i „Skopiuj obrazek”.
- Poza oknem pasek nie ma tej kategorii, a stary wybór pokazuje „Wszystkie”.
- `npm test`, lint, `astro check`, build i e2e przechodzą; wydruk na stagingu jest czytelny.
