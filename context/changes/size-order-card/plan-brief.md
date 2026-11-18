# Od najmniejszego (S-48) — Plan Brief

> Full plan: `context/changes/size-order-card/plan.md`

## What & Why

Czternasta karta: „Od najmniejszego” (`/size-order`). W rzędzie stoi ta sama sylwetka (ikona albo kształt sudoku) w 3–5 wielkościach, a dziecko pod każdą wpisuje miejsce od najmniejszego (1, 2, 3…) albo rysuje kropki. Kolejna karta na właściwym poziomie na żądanie (M-7).

## Starting Point

Katalog ma trzynaście kart; wzorem jest „Który nie pasuje” (te same ikony) i kodowanie (rytm faz). PRD (US-37/38, FR-047/048) i makieta są już na `main` (PR #423).

## Desired End State

Rodzic wybiera z katalogu „Od najmniejszego”, ustawia poziom (łatwy / średni / trudny) i „Kolory”, generuje i drukuje jedną stronę A4, także z telefonu. Profil pamięta poziom i kolory, katalog pokazuje plakietkę, „Jak to działa” opisuje kartę.

## Key Decisions Made

| Decision         | Choice                                                                   | Why                                                           | Source |
| ---------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- | ------ |
| Poziomy          | 3 / 4 / 5 obrazków, 4 / 4 / 5 rzędów, krok ×1,35 / ×1,25 / ×1,14         | Decyzje użytkowniczki po makiecie                             | PRD    |
| Kierunek         | Zawsze od najmniejszego, bez klucza i przełącznika                       | Prostota; dziecko wpisuje cyfrę albo rysuje kropki            | PRD    |
| Obrazki          | Ikony „Który nie pasuje” + kształty sudoku, ≥1 każdego, bez kategorii    | Za mało ikon w kategorii na rzędy bez powtórek                | PRD    |
| Kolory           | Jedna kredka na rząd; **nie** układają nowej karty                       | Kolor nie zdradza wielkości; inaczej niż w „Który nie pasuje” | PRD    |
| Wielkości        | Stałe poziomu; losuje się obrazek, kolejność i kredkę                    | Odpowiedź z konstrukcji, bez solvera                          | Plan   |
| `contentKey`     | Tylko poziom                                                             | Zmiana kolorów zostawia tę samą kartę                         | Plan   |
| Domyślny poziom  | Łatwy (założenie, do zmiany)                                             | Najprostszy start                                             | Plan   |
| Nazwy techniczne | id `odnajmniejszego`, `/size-order`, `src/lib/size-order/`               | Wzór `niepasuje` i `/odd-one-out`                             | Plan   |
| Różnica w mm     | Reguła `step-too-small-mm` (wstępnie 2,5 mm); generator zmienia sylwetkę | Szeroka ikona zmniejsza rząd i różnicę                        | Review |
| Fazy             | Dokumenty+logika, strona+rejestry, wydruk; `/10x-impl-review` przed PR   | Reguła repo                                                   | Plan   |

## Scope

**In scope:** logika i generator, układ A4, strona, pasek, arkusz SVG, miniatura, profil, „Jak to działa”, testy jednostkowe i e2e, wydruk próbny.

**Out of scope:** „od największego”, klucz, kategorie, „Pokaż rozwiązanie”, inne miary niż wysokość, Stryker (S-50), tagi (S-43).

## Architecture / Approach

Moduł `src/lib/size-order/` (`levels`, `sheet`, `card`, `generate`, `layout`, `engine`) podłączony do kontraktu kart; `SizeOrderGenerator` na `CardPage`, arkusz SVG z układu w mm. Reuse `ICONS` i `sudokuShapePath`.

## Phases at a Glance

| Phase                       | What it delivers                               | Key risk                                   |
| --------------------------- | ---------------------------------------------- | ------------------------------------------ |
| 1. Dokumenty i logika karty | Glosariusz, moduł, testy, podgląd z kodu       | Obrys ikon, szerokie ikony i różnica w mm  |
| 2. Strona, katalog i profil | `/size-order`, rejestry, miniatura, e2e        | Kolory nie mogą wejść do `contentKey`      |
| 3. Wydruk próbny            | Poprawki stałych, zamknięcie Open Questions 19 | Krok ×1,14 na trudnym widoczny bez linijki |

Prerequisites: PR #423 na `main` (jest). Estimated effort: mniej niż kodowanie (brak solvera); fazy 1–2 w osobnych PR-ach, faza 3 po scaleniu.
