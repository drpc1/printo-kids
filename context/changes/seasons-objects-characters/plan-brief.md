# Zima: obiekty i postacie w oknie dat (S-54) — Plan Brief

> Full plan: `context/changes/seasons-objects-characters/plan.md`
> Research: `context/changes/seasons-objects-characters/research.md`

## What & Why

Rodzic wybiera zimowe obiekty (kategoria „Zima”) i postacie (Bałwanek, Pingwin) w oknie 1.12–koniec lutego, tak jak świąteczne w S-38/S-39. Kolejne karty mają się nie powtarzać także po świętach.

## Starting Point

Mechanizm okna dat (kategorie i postacie) jest ogólny i działa dla „Boże Narodzenie” 15.11–6.01. Zimowych obiektów poza świętami nie ma; pingwin to tylko obiekt, nie postać.

## Desired End State

Na pasku „Kategoria” od 1.12 do 29.02 jest „Zima” (iglo, płatek, czapka, szalik, niedźwiedź polarny, bałwanek, pingwin i dwa kształty dyktanda); na liście postaci Bałwanek i Pingwin z jedną kreską.

## Key Decisions Made

| Decision      | Choice                                                              | Why                                                   | Source |
| ------------- | ------------------------------------------------------------------- | ----------------------------------------------------- | ------ |
| Kategoria     | Osobna „Zima” 1.12–29.02 obok „Boże Narodzenie”                     | Kod to udźwignie, święta bez zmian                    | User   |
| Obiekty       | iglo, płatek śniegu, czapka, szalik, niedźwiedź polarny, może narty | Wybór użytkowniczki; odpada, co nie przejdzie makiety | User   |
| Bałwanek      | Obiekt i postać przechodzą do „Zima”                                | „przenieś bałwanka do kategorii zima”                 | User   |
| Postacie      | Bałwanek + nowy Pingwin (rysunek od użytkowniczki)                  | Wybór użytkowniczki                                   | User   |
| Dyktando      | Dwa zimowe kształty (narty, łyżwa; po makiecie)                     | Zima na czterech kartach                              | User   |
| Koniec okna   | `{2,29}`                                                            | Działa też w roku nieprzestępnym                      | Plan   |
| Lista postaci | Jedna kreska po ostatnim wierszu sezonowym                          | Bez zmiany układu listy                               | Plan   |

## Scope

**In scope:** kategoria z oknem, obiekty z szablonów, 2 kształty dyktanda, Bałwanek i Pingwin, testy z datą, dokumenty.

**Out of scope:** inne pory roku i święta, okno ruchome, komunikat o sezonowości, zmiany silników.

## Architecture / Approach

Treść najpierw (makieta jak w S-38), potem kategoria i dane, potem postacie. Data tylko w warstwie React, silniki bez zmian.

## Phases at a Glance

| Phase                | What it delivers                    | Key risk                              |
| -------------------- | ----------------------------------- | ------------------------------------- |
| 1. Makieta           | Zatwierdzone rysunki i skrypt reguł | Czytelność w 4×12, nonogram trudny    |
| 2. Kategoria „Zima”  | Okno dat, pasek, testy z datą       | Dwie kategorie sezonowe naraz         |
| 3. Obiekty           | 5–6 obiektów w trzech rozmiarach    | Styk rogiem, brak jednego rozwiązania |
| 4. Kształty dyktanda | 2 kształty                          | Obrys dotykający sam siebie           |
| 5. Postacie          | Bałwanek z nowym oknem, Pingwin     | Rysunek odstaje od zestawu            |
| 6. Dokumenty         | PRD, glosariusz, liczby             | Przeoczone miejsce z liczbą 14        |

**Prerequisites:** akceptacja makiety przed Fazami 3–4; rysunek Pingwina już jest (niezatwierdzony w głównym repo).
**Estimated effort:** ~4–5 sesji.

## Open Risks & Assumptions

- „Przenieś bałwanka” rozumiem jako obiekt i postać; jeśli chodziło tylko o jedno, do korekty.
- W głównym repo leży też niezatwierdzony `niedzwiedz-polarny.webp`: czy to druga postać zimowa, do decyzji.
- Zima ma co najmniej cztery obiekty w każdym rozmiarze dopiero po Fazie 3.
- Rok przestępny: test okna na 29.02.

## Success Criteria (Summary)

Pasek i lista postaci zmieniają się zgodnie z datą (grudzień, luty, 1.03); lint, testy, astro check, build i e2e zielone; wydruk próbny na stagingu.
