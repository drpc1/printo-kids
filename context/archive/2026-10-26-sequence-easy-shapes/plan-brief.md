# Łatwe kształty sekwencji — Plan Brief

> Full plan: `context/changes/sequence-easy-shapes/plan.md`

## What & Why

Na karcie sekwencji dokładamy serce, ukośny krzyżyk i strzałkę na skos w górę w prawo. Serce i krzyżyk są tymi łatwymi obrysami, które sudoku już rysuje na planszy 4×4. Strzałki w sudoku nie ma, więc powstaje jeden nowy kontur. Chodzi o to, żeby łatwe wzory nie kręciły się w kółko po kole, kwadracie, trójkącie i gwiazdce.

## Starting Point

Sekwencje losują cztery kształty z `SEQUENCE_SHAPES`. Ta sama lista zasila wzory AB, AAB i ABC oraz, na poziomie 4, grupy i kształt z liczbą. Obrys to koło albo wielokąt wpisany w 0,6 boku kratki, kreską 0,9 mm. Sudoku ma osobne ścieżki: łatwy zestaw to koło, kwadrat, trójkąt, serce i krzyżyk obrócony o 45°.

## Desired End State

Generuj na poziomach 1–4 może wylosować także serce, ukośny krzyżyk i strzałkę z grotem w górę w prawo. Serce i krzyżyk wyglądają jak w sudoku. Strzałka mieści się w tej samej kratce, jest czarnym konturem i nie myli się z trójkątem ani z krzyżykiem. Miniatura w katalogu jest z tej nowej listy.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Które kształty | Serce, ukośny krzyżyk i nowa strzałka | Serce i krzyżyk są w łatwym sudoku, a strzałkę dopisujemy, bo issue #112 jej wymaga, choć sudoku jej nie rysuje |
| Poziomy | Jedna lista na poziomach 1–4 | Grupy i kształt z liczbą biorą kształty z tego samego katalogu co wzory AB, AAB i ABC |
| Kierunek strzałki | Jeden kształt, grot w górę w prawo | Trójkąt już wskazuje w górę, a kilka kierunków byłoby nowymi kształtami |
| Geometria | Ścieżka równa sudoku dla serca i krzyżyka; kreska 0,9 mm i skala 0,6 zostają | Dziecko ma rozpoznać ten sam obrys, w skali karty sekwencji |
| Kolejność prac | Najpierw rysowanie, potem losowanie | Ziarno miniatury i testy generatora zmieniają się dopiero, gdy identyfikatory wejdą do katalogu |

## Scope

**In scope:**

- Identyfikatory `serce`, `krzyzyk`, `strzalka` na końcu `SEQUENCE_SHAPES`
- Trzeci rodzaj obrysu: ścieżka SVG, rysowana na karcie i w skrypcie miniatury
- Testy równości z sudoku, geometrii strzałki i obecności trzech kształtów na poziomach 1–4
- Ponowne wygenerowanie `public/thumbnails/sekwencje.svg`

**Out of scope:**

- Romb, księżyc, kropla i kolory kształtów
- Więcej kierunków strzałki
- Osobny katalog dla poziomu 4
- Zmiana skali, kreski, reguł i liczby pól

## Architecture / Approach

`sequenceShapeOutline` dla serca i krzyżyka zwraca `d` z `sudokuShapePath`. Strzałka jest zamkniętą ścieżką w `src/lib/sequence/shapes.ts`. Strona i miniatura rysują `kind: "path"` obok koła i wielokąta. Faza 2 tylko wydłuża katalog. `rules.ts` zostaje przy jednej liście, więc kontrola jednoznaczności widzi te same kształty, które generator losuje.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Obrysy i rysowanie | Ścieżki serca, krzyżyka i strzałki oraz ich rysowanie | Grot zapisany w osi Y skierowanej w dół wypadnie w złą stronę |
| 2. Jedna lista na wszystkich poziomach | Losowanie na poziomach 1–4 i nowa miniatura | Test nieznanego kształtu nadal używa napisu `"serce"` |

**Prerequisites:** Obrysy `heart` i `cross` w `src/lib/sudoku/shapes.ts`. Nic do wdrożenia wcześniej.

**Estimated effort:** Jedna sesja, dwie fazy.

## Open Risks & Assumptions

- Test geometrii pilnuje kierunku i pudełka strzałki. Oko na mniejszej kratce poziomu 4 sprawdza, czy grot nie wygląda jak trójkąt.
- Wyrocznia luk rośnie z 24³ do 27³ wypełnień. Progu 5 s dla stu kart poziomu 4 nie podnosimy.
- Ziarno miniatury `20261025` może nie wylosować nowego kształtu. Obejście karty na `/sekwencje` jest sprawdzeniem wyglądu.

## Success Criteria (Summary)

- Serce i krzyżyk na karcie mają ten sam obrys co w sudoku, strzałka idzie w górę w prawo i mieści się w kratce.
- Poziomy 1–3 oraz grupy i kształt z liczbą na poziomie 4 losują wszystkie trzy nowe kształty.
- `npm test` jest zielony, a katalog i druk zostają jedną stroną A4.
