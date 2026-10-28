# Lista figur pod planszą sudoku z kształtami — Plan Brief

> Full plan: `context/changes/sudoku-shape-list/plan.md`

## What & Why

Na dole karty sudoku z kształtami dziecko ma zobaczyć każdą figurę, którą może wstawić na tej planszy: rysunek i nazwę. Dziś widać tylko kształty wpisane w pola, a przy pustym polu nie ma podpowiedzi, jak wygląda brakująca figura. Karta z cyframi zostaje bez tego rzędu. Issue #113.

## Starting Point

Arkusz to SVG 210×297 mm. Polecenie i siatka są wyśrodkowane w marginesie 10 mm, a pod siatką jest pusty pas: około 31 mm przy 9×9 z postacią, więcej przy mniejszych planszach. Zestaw karty siedzi w `shapes` (4, 6 albo 9 figur, kolejność losowa). Nazwy są w `SUDOKU_SHAPE_NAMES` i nie są rysowane. Kredka jest stała dla kształtu. PRD nadal pisze, że nad planszą jest polecenie, bez paska kształtów i bez legendy.

## Desired End State

Pod planszą z kształtami jest jeden rząd: figura nad swoją nazwą, tylko figury tej karty, zawsze w kolejności katalogu. Kolory włączone malują rysunek kredką planszy, nazwa zostaje czarna. Cyfry nie mają rzędu, a siatka 6×6 i 9×9 zostaje na tej samej wysokości co przy kształtach. Jedna strona A4, margines 10 mm. Miniatura katalogu bez zmian.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Kiedy jest lista | Tylko karta z kształtami | Karta z cyframi wygląda jak dziś, a plansze tego samego rozmiaru zostają na jednej wysokości |
| Układ | Jeden rząd w obecnym pasie, siatka bez ruchu | Dziewięć figur z nazwą mieści się w pasie 31 mm przy 9×9 z dymkiem, a dwa rzędy już nie |
| Kolejność | Katalog, tylko figury tej karty | Zestaw heart, circle, triangle, square czyta się: koło, kwadrat, trójkąt, serce |
| Kredka | Ta sama co na planszy, nazwa czarna | Lista jest wzorem do kolorowania, a na szarym wydruku zostaje nazwa |
| Wielkość | Jedna, dobrana do najwęższego pasa | Większe figury na 4×4 wyglądałyby jak druga plansza |
| Nagłówek | Brak | Issue prosi o rysunek i nazwę, a pas nie ma zapasu na tytuł |
| PRD | Poprawić w tej zmianie | Zdanie „bez paska” byłoby nieprawdziwe; zakaz liter przy kolorach zostaje |
| Miniatura | Bez listy | Nazwy na miniaturze katalogu są nieczytelne |
| Test | Geometria w `npm test`, jeden Playwright | Liczy margines i przełącznik Cyfry, bez matrycy rozmiarów |

## Scope

**In scope:**

- Układ rzędu pod gotową siatką i testy kolejności, cyfr oraz marginesu
- Rysowanie na arkuszu, grupa listy omijana przez liczniki ścieżek w testach kolorów i poziomów
- Jeden test Playwright i zdania US-12, US-14 oraz Business Logic „Karta sudoku”

**Out of scope:**

- Pasek cyfr, przesuwanie siatki, drugi rząd, nagłówek, inna kolejność
- Lista zawsze kolorowa albo zawsze czarna, litery przy kredkach
- Miniatura, makieta, generator, klucz karty, profil, nowe tokeny

## Architecture / Approach

`layoutSudokuShapeList` czyta prostokąt siatki i zwraca pozycje. Nie dokłada wysokości do bloku, który `layoutSudokuSheet` wyśrodkowuje. Arkusz maluje grupę `data-shape-list` ścieżką `sudokuShapePath` i kredką `sudokuShapeInk`. Przy cyfrach lista pozycji jest pusta.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Geometria rzędu | Pozycje w kolejności katalogu, pusty wynik przy cyfrach, test marginesu | Wpisanie wysokości rzędu do wyśrodkowania podniosłoby siatkę |
| 2. Rysowanie | Rząd na arkuszu, kredka jak na planszy, nazwa czarna | Testy kolorów i poziomów liczą wszystkie ścieżki SVG i obleją się o cztery, sześć albo dziewięć nowych |
| 3. Przeglądarka i PRD | Jeden Playwright i zdania, które dziś zabraniają paska | Poprawka PRD może skasować zakaz liter przy kolorach symetrii |

**Prerequisites:** Zestaw, nazwy i kredki są już na karcie. Issue #113.
**Estimated effort:** około jednej sesji na trzy fazy.

## Open Risks & Assumptions

- Obrys 1,2 mm na małym rysunku listy jest ten sam co w polu 9×9. Na papierze może wyglądać grubo. Cieńszy obrys tylko na liście byłby już inną decyzją.
- Kropla przy włączonych kolorach jest czarna, więc na liście wygląda jak kontur bez kolorów. Wypełnienie ją odróżnia.
- Szerokość nazwy jest szacowana współczynnikiem 0,55, tak jak polecenie. Test 9×9 mierzy „gwiazdkę” względem slotu, nie „trójkąt” względem krawędzi strony. Prawdziwa czcionka może być szersza; slot ma zostać z zapasem, nie na styk.
- Drukarka czarno-biała zamienia kredki w szarości. Nazwa niesie wtedy tożsamość figury. Automat tego nie drukuje.

## Success Criteria (Summary)

- Karta z kształtami ma pod planszą jeden rząd swoich figur, w kolejności katalogu, z nazwą. Przykład: heart, circle, triangle, square czyta się koło, kwadrat, trójkąt, serce.
- Karta z cyframi nie ma rzędu, a siatka nie zmienia miejsca. Włączone Kolory malują rysunki listy i zostawiają nazwy czarne.
- Rząd mieści się na jednej stronie A4 w marginesie 10 mm, także na 9×9 z postacią. Miniatura katalogu zostaje bez listy.
