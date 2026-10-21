# Meta przy wyjściu nastolatka — Plan Brief

> Full plan: `context/changes/teen-meta-beside-exit/plan.md`

## What & Why

Na poziomie nastolatek słowo „Meta” stoi po lewej stronie kartki, a otwarcie wyjścia jest po prawej. Napis ma stać tam, gdzie jest wyjście. Na poziomach 3–8 lat wyjście jest na środku i Meta już tam stoi — tego położenia nie ruszamy.

## Starting Point

`layoutSheet` kładzie Metę, Start i znaczek na jednej kolumnie: kolumnie wejścia. To działa na 3–8 latach, bo tam wejście i wyjście są w tej samej, środkowej kolumnie. Nastolatek ma wejście w kolumnie 0 i wyjście w kolumnie 26, więc Meta zostaje po lewej.

## Desired End State

Po wygenerowaniu nastolatka „Meta” jest pod prawym wyjściem, a „Start” zostaje po lewej. Na 5 latach i pozostałych poziomach dziecięcych „Meta” zostaje na środku, pod wyjściem. Podgląd i druk pokazują to samo, bo korzystają z jednego układu. Napis zostaje „Meta”.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Gdzie stoi Meta | Środek kolumny wyjścia, ten sam pas pod siatką | Tak Meta stoi dziś tam, gdzie wejście i wyjście dzielą kolumnę |
| Kogo dotyczy przesunięcie | Wspólna reguła dla wszystkich poziomów | Na 3–8 latach kolumny są równe, więc współrzędna się nie zmienia; rusza się tylko nastolatek |
| Start i postać | Zostają na kolumnie wejścia | Ruszamy tylko napis przy wyjściu |
| Brzmienie | Zostaje „Meta” | Chodzi o miejsce napisu, nie o tekst |
| Gałąź na identyfikatorze | Nie | Osobny przypadek nastolatka rozjechałby się przy kolejnym poziomie z wyjściem w innej kolumnie |

## Scope

**In scope:**

- `exitColumn` w `layoutSheet` i użycie go wyłącznie dla `meta.x`
- Przekazanie `level.exit.col` z kartki
- Test: nastolatek na kolumnie 26, pozostałe poziomy bez zmiany kotwicy

**Out of scope:**

- Zmiana tekstu na „META”
- Przesuwanie Startu, znaczka, komórki wyjścia albo siatki
- Dosuwanie napisu do środka, żeby oddalić glify od krawędzi

## Architecture / Approach

Jedna funkcja układu dostaje kolumnę wyjścia obok kolumny wejścia. Meta korzysta z wyjścia, Start i znaczek z wejścia. `MazeSheet` podaje obie wartości z poziomu. Druk nie ma drugiej ścieżki.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Meta na kolumnie wyjścia | Meta pod prawym wyjściem nastolatka; pozostałe poziomy na dotychczasowej kolumnie | Glify „Meta” przy prawej krawędzi mogą podejść bliżej marginesu niż sam punkt kotwicy |

**Prerequisites:** brak. Wystarczy obecne drzewo i Node z `.nvmrc`.
**Estimated effort:** jedna krótka sesja, jedna faza.

## Open Risks & Assumptions

- Założenie: „tam gdzie wyjście” znaczy środek kolumny wyjścia, tak jak dziś środek kolumny wejścia. Kotwica na kolumnie 26 zostaje ponad 10 jednostek od prawej krawędzi strony, więc test wstawki przechodzi. Jeśli na wydruku obetnie się samo słowo, to osobna zmiana — tego planu nie dosuwamy do środka.
- Start na kolumnie 0 jest już tak samo blisko lewej krawędzi. Prawa strona ma być lustrem tego układu.

## Success Criteria (Summary)

- Na nastolatku „Meta” jest pod wyjściem po prawej, „Start” po lewej.
- Na 5 latach „Meta” zostaje na środku.
- `npm test` i `npm run lint` przechodzą, a test układu pilnuje kolumny 26 oraz równości kolumn na pozostałych poziomach.
