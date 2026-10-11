---
date: 2026-10-11T18:35:43+02:00
researcher: drpc1
git_commit: 4409124483e4e870d86c6ce66bc74d392482f193
branch: main
repository: printo-kids
topic: "Jak plasterek S-07 ma dołożyć sześć poziomów nazwanych wiekiem do dzisiejszego labiryntu 13×16"
tags: [research, codebase, maze, sheet, last-used, child-profiles]
status: complete
last_updated: 2026-10-11
last_updated_by: drpc1
---

# Research: Jak plasterek S-07 ma dołożyć sześć poziomów nazwanych wiekiem do dzisiejszego labiryntu 13×16

**Date**: 2026-10-11T18:35:43+02:00
**Researcher**: drpc1
**Git Commit**: 4409124483e4e870d86c6ce66bc74d392482f193
**Branch**: main
**Repository**: printo-kids

## Research Question

Plasterek S-07 (`maze-difficulty-levels`) ma dać rodzicowi wybór jednego z sześciu poziomów nazwanych wiekiem i labirynt A4 zgodny z alejką oraz długością drogi tego poziomu. Co z tej umowy jest już w kodzie i w PRD, a co plan musi dopiero dodać?

## Summary

W inspekcji `src/lib/maze/generate.ts` na commicie `4409124483e4e870d86c6ce66bc74d392482f193` generator zwraca jedną siatkę 13×16, z wejściem `(0, 6)` i wyjściem `(15, 6)`, i nie przyjmuje poziomu. Przy tych samych plikach zapis `printo-kids:last-used` i `printo-kids:child-profiles` trzyma postać, bez pola trudności. Tabela sześciu poziomów jest w `context/foundation/prd.md` (wiersze 166–173). Próg głębokości ślepej uliczki w komórkach zostaje pytaniem użytkownika i blokuje tylko sprawdzenie „płytkie / głębokie”, nie szerokość alejki ani pasmo długości drogi (`prd.md:226`).

Przy wzorze `cellSize = (pageWidth - inset * 2) / columns` z wejściem 210×297 i insetem 10 (`layout.ts:40`, `WorksheetGenerator.tsx:24-26`) cztery szerokości z PRD dają alejkę około 21,1 mm, 14,6 mm, 11,2 mm i 7,0 mm. To są te rzędy, które PRD opisuje jako około 21 mm, 15 mm, 11 mm i 7 mm. Ta sama arytmetyka mieści prostokąt labiryntu wewnątrz insetu dla siatek 9×11, 13×16, 17×21 i 27×33. To nie jest pomiar wydruku w przeglądarce.

## Detailed Findings

### Generator dziś

`generateMaze` przyjmuje tylko `random` i zwraca `{ width: WIDTH, height: HEIGHT, cells }` (`generate.ts:27-44`). Stałe w tym pliku: `WIDTH = 13`, `HEIGHT = 16`, `ENTRANCE_ROW = 0`, `ENTRANCE_COL = 6`, `EXIT_ROW = 15`, `EXIT_COL = 6` (`generate.ts:14-19`). Wejście otwiera ścianę północną komórki `(0, 6)`, wyjście ścianę południową `(15, 6)` (`generate.ts:41-42`).

Rzeźbienie jest union-find po krawędziach wschodnich i południowych. `union` zwraca `false`, gdy obie komórki są już w tym samym komponencie, i wtedy ściana zostaje (`generate.ts:33-38`, `generate.ts:136-141`). W tej implementacji wnętrze jest drzewem, bo krawędź w tym samym komponencie nie jest otwierana (`generate.ts:136-141`): między dwiema komórkami siatki jest dokładnie jedna droga, która może zakręcać, i nie powstaje cykl. Testy 34 ziaren (`0`–`31`, `99`, `12345`) sprawdzają szerokość 13, wysokość 16, otwarte wejście i wyjście oraz `countPaths === 1` (`generate.test.ts:6-13`, `generate.test.ts:110-119`). Nie sprawdzają braku cyklu w odnodze ani długości drogi.

`countPaths` liczy drogi od stałych `(ENTRANCE_ROW, ENTRANCE_COL)` do `(EXIT_ROW, EXIT_COL)` i zatrzymuje dalsze szukanie, gdy `found >= 2` (`generate.ts:47-80`). Nie czyta startu z `maze.width` ani `maze.height`. `mazeForSheet` oddaje kandydata tylko przy wyniku `1`, inaczej `null` (`generate.ts:83-87`). `handleGenerate` woła to raz na kliknięcie z `Math.random` i przy `null` nie woła `setMaze` (`WorksheetGenerator.tsx:80-87`). W tym przebiegu nie ma drugiej próby ani filtra długości drogi. Ślepych uliczek ta inspekcja nie mierzy: w `generate.ts` nie ma funkcji głębokości.

### Układ karty i alejka

`layoutSheet` liczy `cellSize` z szerokości strony i liczby kolumn, a wysokość prostokąta jako `rows * cellSize` (`layout.ts:40-43`). `MazeSheet` podaje `pageWidth` 210, `pageHeight` 297, `inset` 10, kolumny i wiersze z `maze.width` / `maze.height`, oraz `entranceColumn: LABEL_COLUMN` (`WorksheetGenerator.tsx:24-28`, `WorksheetGenerator.tsx:774-782`). `LABEL_COLUMN` jest stałą `6`, osobno od `ENTRANCE_COL`. SVG ma `viewBox` 210×297 i w druku `210mm`×`297mm` (`WorksheetGenerator.tsx:790-793`).

Przy tym wzorze i tych stałych szerokość komórki wynosi `190 / columns` jednostek użytkownika. Dla czterech szerokości z tabeli PRD:

| Kolumny z PRD | `190 / columns` | Sformułowanie PRD przy tej szerokości |
| --- | --- | --- |
| 9 | 190/9 ≈ 21,111 | około 21 mm (3 lata i 4 lata) |
| 13 | 190/13 ≈ 14,615 | około 15 mm (5 lat i 6 lat) |
| 17 | 190/17 ≈ 11,176 | około 11 mm (7–8 lat) |
| 27 | 190/27 ≈ 7,037 | około 7 mm (nastolatek) |

Wysokość wewnętrzna to `297 - 20 = 277`. Pas nad i pod labiryntem to `(277 - rows * 190 / columns) / 2`. Dla czterech siatek z tabeli PRD, przy kwadratowych komórkach i labiryncie na pełną szerokość treści:

| Siatka | Wysokość labiryntu | Pas etykiety |
| --- | --- | --- |
| 9×11 | 2090/9 ≈ 232,222 | 403/18 ≈ 22,389 |
| 13×16 | 3040/13 ≈ 233,846 | 561/26 ≈ 21,577 |
| 17×21 | 3990/17 ≈ 234,706 | 719/34 ≈ 21,147 |
| 27×33 | 2090/9 ≈ 232,222 | 403/18 ≈ 22,389 |

Każdy z tych czterech pasów jest dodatni, więc prostokąt labiryntu zostaje wewnątrz insetu 10 na stronie 297. To rachunek z `layout.ts:40-50`, nie pomiar Chrome ani telefonu.

Znacznik postaci ma 30×30 i dolną krawędź na górze labiryntu (`layout.ts:53-64`, `CHARACTER_MARK_SIZE = 30` w `WorksheetGenerator.tsx:28`). Współrzędna y góry znacznika to `labelBand - 20`. Przy trzech siatkach, które według PRD pokazują postać, ta współrzędna jest dodatnia, więc góra zostaje na stronie: 43/18 ≈ 2,389 (9×11), 41/26 ≈ 1,577 (13×16), 39/34 ≈ 1,147 (17×21). Na nastolatku PRD postaci nie pokazuje (`prd.md:175`), więc ten znacznik tam nie wchodzi.

Wszystkie cztery liczby kolumn z tabeli są nieparzyste, więc każda ma jedną środkową kolumnę: 4, 6, 8 i 13. Dzisiejszy kod rysuje etykiety na kolumnie 6 także wtedy, gdy szerokość labiryntu byłaby inna, bo `MazeSheet` nie wylicza środka z `maze.width` (`WorksheetGenerator.tsx:780`).

### Zapis parametrów

`writeLastUsed` zapisuje JSON o jednym polu `character` pod kluczem `printo-kids:last-used` (`last-used.ts:1`, `last-used.ts:27-29`). Odczyt zwraca ten napis, gdy jest na liście dozwolonych, a przy braku, błędzie lub obcym napisie zwraca `"none"` (`last-used.ts:9-24`).

`ChildProfile` w tym pliku ma pola `id`, `name`, `character` (`child-profiles.ts:9-13`). `acceptEntry` zwraca obiekt z tych trzech pól albo `null` (`child-profiles.ts:162-191`). Klucz magazynu to `printo-kids:child-profiles` (`child-profiles.ts:1`).

`handleGenerate` nie przyjmuje poziomu (`WorksheetGenerator.tsx:80-87`). W plikach `src/**/*.{ts,tsx,astro}` wyszukanie `difficulty`, `poziom` i `level` nie dało trafień. `rememberLastUsed` jest `activeId === null` (`WorksheetGenerator.tsx:140`, `WorksheetGenerator.tsx:161`). Zapis `writeLastUsed` idzie tylko w tej gałęzi (`WorksheetGenerator.tsx:714-715`).

### Umowa z PRD, która nie jest w kodzie

Tabela w Business Logic (`prd.md:166-173`) nazywa sześć poziomów i przy każdym podaje alejkę, siatkę, pasmo drogi i — tam gdzie jest myślnik albo słowo — ślepe uliczki:

| Poziom | Alejka | Siatka | Droga do mety | Ślepe uliczki |
| --- | --- | --- | --- | --- |
| 3 lata | około 21 mm | 9×11 | do około 25 komórek | płytkie |
| 4 lata | około 21 mm | 9×11 | od około 40 komórek | — |
| 5 lat | około 15 mm | 13×16 | do około 40 komórek | płytkie |
| 6 lat | około 15 mm | 13×16 | od około 70 komórek | — |
| 7–8 lat | około 11 mm | 17×21 | około 80–120 komórek | — |
| nastolatek | około 7 mm | 27×33 | około 150–300 komórek | głębokie |

Dwa poziomy mogą dzielić alejkę i różnić się długością drogi (`prd.md:164`). Osobnej kontrolki długości nie ma. Dokładnie jedno rozwiązanie zostaje (`prd.md:162`, US-01 w `prd.md:63`).

Start na środku górnej krawędzi i napis „Meta” na środku dolnej dotyczą poziomów od 3 lat do 7–8 lat. Nastolatek ma start i metę w narożnikach i nie pokazuje postaci (`prd.md:175`, US-01 w `prd.md:64-65`). Która para narożników, PRD nie nazywa. Zdanie „pętle w jego ślepych odnogach są dozwolone” dopuszcza cykl w odnodze, jeśli nie powstaje druga droga start–meta. Nie nakazuje cyklu. Dzisiejsze union-find cyklu nie otwiera.

„Około” przy długości drogi nie podaje całkowitej liczby komórek, od której kartka przechodzi albo odpada. Generator w inspekcji tej długości nie liczy.

Wybór poziomu ma być na istniejącej kartce, nie na nowym ekranie (`roadmap.md:199`). Ostatnio użyte parametry i domyślna trudność profilu zaczynają pamiętać poziom w tym plasterku (`roadmap.md:160`, `roadmap.md:173`, `roadmap.md:199`). Pliki zapisu dziś tego pola nie mają.

## Code References

- `src/lib/maze/generate.ts:14-45` — stała siatka 13×16, wejście i wyjście w kolumnie 6, Kruskal bez parametru poziomu
- `src/lib/maze/generate.ts:47-87` — liczba dróg między stałymi komórkami; brak długości drogi
- `src/lib/maze/generate.test.ts:6-13` — 34 ziarna, każde 13×16 z jedną drogą
- `src/lib/sheet/layout.ts:38-75` — rozmiar komórki z szerokości, pas etykiet, Start albo znacznik 30×30
- `src/components/WorksheetGenerator.tsx:24-28` — strona 210×297, inset 10, kolumna etykiety 6, znacznik 30
- `src/components/WorksheetGenerator.tsx:80-87` — jedno losowanie na kliknięcie, bez ponowienia
- `src/lib/last-used.ts:27-29` — zapis `{ character }`
- `src/lib/child-profiles.ts:9-13` — profil bez trudności
- `context/foundation/prd.md:166-177` — tabela poziomów i otwarty próg głębokości
- `context/foundation/roadmap.md:189-199` — wynik S-07 i ryzyko generatora

## Architecture Insights

Jedno rozwiązanie jest dziś własnością drzewa rozpinającego plus bramki `mazeForSheet`, a nie filtra poziomu. Długość drogi z tabeli PRD ten algorytm sam nie wybiera: `generateMaze` nie dostaje pasma i `handleGenerate` nie powtarza losowania.

Układ karty już przyjmuje dowolne `columns` i `rows`, a generator ich nie przyjmuje. Wejście, wyjście, `countPaths` i `LABEL_COLUMN` są osobno wpisane jako kolumna 6 i wiersze 0 oraz 15. Zmiana siatki w jednym z tych miejsc, bez pozostałych, rozjedzie otwór ściany i napis.

Zapis ostatniego użycia nadpisuje cały JSON polem `character`. Dopisanie poziomu wymaga zmiany zapisu i odczytu; zostawienie starego zapisu przy następnym `writeLastUsed` pole poziomu by usunęło. To samo dotyczy `acceptEntry`, które zwraca tylko `id`, `name` i `character`.

## Historical Context (from prior changes)

- `context/foundation/shape-notes.md:49-50` — trzy poziomy (łatwy, średni, trudny) i stała szerokość przejścia. **Sprzeczne z bieżącym PRD** jako specyfikacja: `prd.md:166-173` ma sześć nazw wieku i cztery szerokości alejki. Plik shape-notes nadal zawiera zdanie o trzech poziomach.
- `context/archive/2026-09-28-first-printable-maze/plan-brief.md:21` — siatka 13×16, komórka około 14,6 mm, dwanaście kolumn odrzucone, bo nie ma jednej komórki środkowej. **Częściowo aktualne:** 13×16 i około 14,6 mm pokrywa się z wierszami 5 lat i 6 lat oraz z dzisiejszym kodem. Jako jedyna siatka produktu jest zastąpione tabelą PRD. Uzasadnienie nieparzystej szerokości nadal pasuje do 9, 13, 17 i 27 kolumn.
- `context/archive/2026-09-28-first-printable-maze/plan-brief.md:32` — trudność poza zakresem S-01. **Aktualne jako historia zakresu.** S-07 jest pierwszym plasterkiem poziomów (`roadmap.md:189-200`).
- `context/archive/2026-09-29-print-a4-maze/plan.md:23` — 10 mm to inset SVG, a drugi margines na `@page` by zmniejszył labirynt. **Aktualne jako mechanizm druku.** Wymaganie marginesu 10 mm jest też w `prd.md:179`.
- `context/archive/2026-09-29-print-a4-maze/plan.md:34` — zmiana generatora i siatki 13×16 jest poza zakresem tamtego plasterka. **Aktualne jako historia S-02. Nie jest specyfikacją S-07**, który ma cztery siatki.
- `context/foundation/test-plan.md:35` — prawdopodobieństwo ryzyka 1 nie bierze się z tego, że progi łatwy/średni/trudny są już znane. **Aktualne:** te trzy progi nie są w kodzie ani w tabeli PRD. Tabela PRD używa innego słownika.
- `context/foundation/test-plan.md:50` — kolumna „Musi kwestionować” każe podważyć zdanie „progi łatwy/średni/trudny są już znane”. **To nie jest twierdzenie, że progi są znane.** Zgodnie z linią 35 plan testów każe je traktować jako nieustalone. Słownik trzech progów i tak zastąpiła tabela wieku.
- `context/foundation/test-plan.md:127` — zgodność z poziomem i progi poziomów są poza budżetem, dopóki poziomów nie ma. **Aktualne na dziś:** w kodzie poziomów nie ma. Po tym plasterku to wyłączenie przestaje opisywać S-07.
- `context/foundation/roadmap.md:198-199` — generator sam nie trafia w pasmo długości; próg głębokości uliczki nie jest liczbą; zmiana siatki może rozjechać jedną stronę A4, którą naprawia S-09. **Pierwsze dwa zdania zgodne z kodem.** Trzecie, przy wzorze z `layout.ts:40-43` i czterech siatkach PRD, nie dotyczy wyjścia prostokąta poza inset SVG (pas etykiety dodatni, rachunek wyżej). Nadal dotyczy wydruku w przeglądarce, którego ta research nie mierzyła. S-09 jest osobnym plasterkiem (`roadmap.md:215-227`).

## Related Research

- `context/archive/2026-10-05-testing-path-count/research.md` — gdzie liczba dróg staje się kartką
- `context/archive/2026-10-05-path-count-test/research.md` — test zera i dwóch dróg na runnerze Node
- `context/archive/2026-10-04-maze-character-choice/research.md` — postać przy starcie na tej samej kartce

## Open Questions

1. **Ile komórek odróżnia płytką ślepą uliczkę od głębokiej?** Właściciel: użytkownik. Blokuje sprawdzenie „płytkie / głębokie” (`prd.md:177`, `prd.md:226`). Nie blokuje alejki ani pasma długości drogi, które są w tabeli.
2. **Jakie całkowite liczby komórek zamykają każde „około” w tabeli drogi?** PRD nie podaje progów całkowitych. Plan ma je nazwać, jeśli kartka ma być sprawdzalna (FR-003, `prd.md:118-119`).
3. **Które narożniki są startem i metą nastolatka?** PRD mówi „w narożnikach” (`prd.md:175`) i nie wskazuje pary.
4. **Jaki poziom jest widoczny, gdy w magazynie nie ma jeszcze poziomu?** PRD każe pokazać edytowalne ostatnie parametry (FR-006) i domyślną trudność w profilu (FR-007), ale nie nazywa poziomu startowego dla pustego zapisu.
5. **Czy napis „Start” zostaje na poziomie nastolatka, gdy postaci nie ma?** US-01 mówi, że postaci nie ma (`prd.md:64`). O napisie „Start” na tym poziomie milczy. Dziś napis pojawia się, gdy postać nie jest wybrana (`layout.ts:68-74`).
