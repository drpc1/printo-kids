# Stryker na starym rdzeniu: wyniki (gh224)

Zakres: `src/lib/maze/generate.ts`, `sheet/layout.ts`, `last-used.ts`, `child-profiles.ts`, `sheet/character.ts`. Konfiguracja: `stryker/maze.config.json`, skrypt `npm run mutate:maze` (wąski przebieg: `-- --mutate "plik:start-end"`).

## Punkt odniesienia czasu

`npm test` na czystym stanie przed zmianą testów (2026-10-31): 782 testy, `duration_ms` 77 568 (łącznie 1 min 20 s).

## Skala przebiegu (Faza 1, dry run)

Instrumentacja: 975 mutantów w pięciu plikach. Początkowy przebieg testów pod Strykerem trwa 85 s (przy 4 procesach), a `node --test` nie przerywa po pierwszej porażce, więc pełny przebieg to rzędu 975 × 85 s / 4 ≈ 5,5 godziny, nie godzina. Faza 2 wymaga decyzji o podziale na węższe przebiegi.

## Wynik „przed” (Faza 2, 2026-10-31)

Stan kodu: commit `6dda780`, bez zmian w testach. Pięć osobnych przebiegów `npm run mutate:maze -- --mutate <plik>`, kolejno, w tle. Wynik = (zabite + timeout) / wszystkie mutanty.

| Moduł                | Mutanty | Zabite | Timeout | Ocalałe | Wynik  | Czas przebiegu |
| -------------------- | ------- | ------ | ------- | ------- | ------ | -------------- |
| `maze/generate.ts`   | 435     | 264    | 135     | 36      | 91,72% | 157 min        |
| `child-profiles.ts`  | 345     | 318    | 4       | 23      | 93,33% | 21 min         |
| `sheet/layout.ts`    | 49      | 49     | 0       | 0       | 100%   | 3 min          |
| `sheet/character.ts` | 70      | 55     | 0       | 15      | 78,57% | 4 min          |
| `last-used.ts`       | 76      | 57     | 0       | 19      | 75,00% | 5 min          |
| Razem                | 975     | 743    | 139     | 93      | 90,46% | 190 min        |

Początkowy przebieg testów: 80 s dla `generate.ts` (testy rozkładu labiryntu), ok. 7 s dla pozostałych czterech modułów, bo Stryker uruchamia tylko to, co kompiluje się do danego pliku. Czas całości wyszedł więc ok. 3 godzin, nie 5,5 (szacunek z Fazy 1 liczył 85 s dla wszystkich).

Wąski przebieg do powtórzenia: `npm run mutate:maze -- --mutate "src/lib/maze/generate.ts:30-130"`.

## Ocalałe mutanty do triage (linia:kolumna, mutator)

Surowe pliki `reports/mutation/baseline-<moduł>.json` i `survivors-<moduł>.txt` są poza gitem.

### generate (35)

```
48:7 ConditionalExpression Survived -> false
48:27 StringLiteral Survived -> ""
51:77 ArithmeticOperator Survived -> random() / level.columns
51:37 ArithmeticOperator Survived -> random() / level.rows
80:72 ObjectLiteral Survived -> {}
80:96 ArrowFunction Survived -> () => undefined
97:23 ConditionalExpression Survived -> true
97:23 EqualityOperator Survived -> col <= maze.width - 1
97:29 ArithmeticOperator Survived -> maze.width + 1
100:24 ConditionalExpression Survived -> true
100:24 EqualityOperator Survived -> row <= maze.height - 1
100:30 ArithmeticOperator Survived -> maze.height + 1
103:23 ConditionalExpression Survived -> true
103:23 EqualityOperator Survived -> col >= 0
107:25 BooleanLiteral Survived -> true
116:7 ConditionalExpression Survived -> false
116:7 LogicalOperator Survived -> candidate.width !== level.columns && candidate.hei
116:7 ConditionalExpression Survived -> false
148:21 ConditionalExpression Survived -> true
148:21 EqualityOperator Survived -> point.col >= 0
169:10 MethodExpression Survived -> route
180:40 ConditionalExpression Survived -> false
271:43 StringLiteral Survived -> ""
279:34 EqualityOperator Survived -> i >= 0
280:38 ArithmeticOperator Survived -> i - 1
289:27 ObjectLiteral Survived -> {}
289:45 ArrowFunction Survived -> () => undefined
304:9 ConditionalExpression Survived -> true
304:9 ConditionalExpression Survived -> false
304:9 EqualityOperator Survived -> rank[rootA] <= rank[rootB]
304:9 EqualityOperator Survived -> rank[rootA] >= rank[rootB]
306:16 ConditionalExpression Survived -> true
306:16 ConditionalExpression Survived -> false
306:16 EqualityOperator Survived -> rank[rootA] >= rank[rootB]
306:16 EqualityOperator Survived -> rank[rootA] <= rank[rootB]
310:7 AssignmentOperator Survived -> rank[rootA] -= 1
```

### child-profiles (22)

```
28:9 LogicalOperator Survived -> raw === null && raw === ""
28:9 ConditionalExpression Survived -> false
28:9 ConditionalExpression Survived -> false
28:25 ConditionalExpression Survived -> false
28:33 StringLiteral Survived -> "Stryker was here!"
28:37 BlockStatement Survived -> {}
33:9 ConditionalExpression Survived -> false
33:28 BlockStatement Survived -> {}
182:22 ConditionalExpression Survived -> false
249:7 ConditionalExpression Survived -> false
249:25 BlockStatement Survived -> {}
270:7 ConditionalExpression Survived -> false
270:25 BlockStatement Survived -> {}
275:7 ConditionalExpression Survived -> false
283:7 ConditionalExpression Survived -> false
289:5 ConditionalExpression Survived -> false
315:14 EqualityOperator Survived -> (value.codePointAt(index) ?? 0) >= 0xffff
323:10 ConditionalExpression Survived -> true
323:10 LogicalOperator Survived -> typeof value === "object" && value !== null || !Ar
323:10 ConditionalExpression Survived -> true
323:10 LogicalOperator Survived -> typeof value === "object" || value !== null
323:10 ConditionalExpression Survived -> true
323:39 ConditionalExpression Survived -> true
```

### character (14)

```
81:40 ArrowFunction Survived -> () => undefined
81:52 ConditionalExpression Survived -> true
81:52 ConditionalExpression Survived -> false
81:52 EqualityOperator Survived -> option.id !== id
82:7 ConditionalExpression Survived -> false
82:28 BlockStatement Survived -> {}
86:39 ArrowFunction Survived -> () => undefined
86:51 ConditionalExpression Survived -> true
86:51 ConditionalExpression Survived -> false
86:65 StringLiteral Survived -> ""
87:7 ConditionalExpression Survived -> true
87:7 ConditionalExpression Survived -> false
87:7 EqualityOperator Survived -> none === undefined
87:27 BlockStatement Survived -> {}
99:32 StringLiteral Survived -> ""
```

### last-used (18)

```
24:9 ConditionalExpression Survived -> false
24:9 LogicalOperator Survived -> raw === null && raw === ""
24:9 ConditionalExpression Survived -> false
24:25 ConditionalExpression Survived -> false
24:33 StringLiteral Survived -> "Stryker was here!"
24:37 BlockStatement Survived -> {}
31:18 ConditionalExpression Survived -> true
66:20 ConditionalExpression Survived -> false
66:20 LogicalOperator Survived -> raw === null && raw === ""
66:20 ConditionalExpression Survived -> false
66:36 ConditionalExpression Survived -> false
66:44 StringLiteral Survived -> "Stryker was here!"
68:11 BlockStatement Survived -> {}
86:7 ConditionalExpression Survived -> false
91:10 ConditionalExpression Survived -> true
86:25 BlockStatement Survived -> {}
95:7 ConditionalExpression Survived -> false
95:25 BlockStatement Survived -> {}
103:10 ConditionalExpression Survived -> true
```

`layout.ts`: brak ocalałych.

## Decyzje (Faza 3): `maze/generate.ts` i `child-profiles.ts`

Nowe testy: pięć w `generate.test.ts` (blok „mutation gaps in the maze core”) i jeden w `child-profiles.test.ts` („a stored list with malformed entries”). Każdy przeszedł break-check: zepsuty kod produkcyjny w kopii roboczej, scoped test czerwony, przywrócenie przez `git checkout -- plik`.

### `maze/generate.ts` (36 ocalałych)

| Linia             | Mutant                                                | Decyzja                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 48:7, 48:27       | Poziom 1 przestaje używać Kruskala                    | Asercja: średnia droga Poziomu 1 < 28 komórek (Kruskal ok. 22, zawijany algorytm dłuższa). Break-check: `=== "kruskal"` → `false`, test czerwony.                            |
| 51:37, 51:77      | Komórka startu zawijanego algorytmu zawsze (0,0)      | Asercja: pierwsze dwa losowania wybierają wiersz i kolumnę startu (labirynty różne przy zmianie każdego z nich). Break-check: osobno dla wiersza i kolumny, test czerwony.   |
| 80:72, 80:96      | Początkowa tablica `visited` w `countPaths`           | Równoważny: pusta tablica albo `undefined` czyta się jak `false`.                                                                                                            |
| 97:\*, 100:\*     | Strażnik wschodniej i południowej krawędzi            | Równoważny dla wyniku generatora: zewnętrzne ściany są zawsze zamknięte (otwarte tylko wejście od północy i wyjście od południa), więc strażnik nigdy nie decyduje.          |
| 103:\*            | Strażnik zachodniej krawędzi w `countPaths`           | Jak wyżej.                                                                                                                                                                   |
| 107:25            | `visited[row][col] = true` zamiast `false` po wyjściu | Asercja: dwie drogi dzielące komórkę po rozgałęzieniu dają 2, nie 1 (labirynt z dwiema drogami nie może przejść jako jedna, ryzyko 1). Break-check: `= true`, test czerwony. |
| 116:7 (3 mutanty) | `mazeForSheet` nie sprawdza rozmiaru siatki           | Asercja: kandydat o złej szerokości albo wysokości nie jest kartą. Break-check: `\|\|` → `&&`, test czerwony.                                                                |
| 148:\*            | Strażnik zachodniej krawędzi w `openNeighbors`        | Równoważny dla wyniku generatora (zewnętrzna zachodnia ściana zamknięta).                                                                                                    |
| 169:10            | `route.reverse()` pominięte                           | Równoważny: `scoreMaze` używa tylko zbioru komórek drogi i ich liczby, nie kolejności.                                                                                       |
| 180:40            | Odnoga w bok nie liczy głębokości                     | Asercja: ślepa odnoga 5 komórek w bok liczy się jako głęboka (różnica wyniku 3 wobec 4 komórek). Break-check: `next.col !== previous.col` → `false`, test czerwony.          |
| 271:43            | `direction: ""` zamiast `"south"`                     | Równoważny: każdy kierunek inny niż `"east"` jest traktowany jako południe.                                                                                                  |
| 279:34, 280:38    | Tasowanie krawędzi: dodatkowe losowanie / `i - 1`     | Kosmetyczny: Kruskal działa na dowolnej permutacji krawędzi; jedno losowanie więcej albo lekko inny rozkład nie zmienia poprawności ani jedynej drogi.                       |
| 289:\*, 304–310   | Ranga w union-find                                    | Równoważny: wiązanie według rangi to optymalizacja czasu; zbiory rozłączne wychodzą te same, więc labirynt jest ten sam.                                                     |

### `child-profiles.ts` (23 ocalałe)

| Linia                  | Mutant                                         | Decyzja                                                                                                                                                                                                                                                       |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 28:\* (6 mutantów)     | Pusty zapis nie wraca od razu pustą listą      | Równoważny: `JSON.parse("")` rzuca, wyjątek łapie `catch` i wynik to ta sama pusta lista.                                                                                                                                                                     |
| 33:\*                  | Brak `profiles` nie wraca od razu pustą listą  | Równoważny: pętla po `null` rzuca, `catch` daje tę samą pustą listę.                                                                                                                                                                                          |
| 182:22                 | `find` po `stored === null`                    | Równoważny: żaden profil nie ma `id === null`.                                                                                                                                                                                                                |
| 249:\*                 | `profilesField` nie sprawdza obiektu           | Równoważny: dla wartości innych niż obiekt `.profiles` to `undefined` albo wyjątek łapany w `catch`; wynik to pusta lista.                                                                                                                                    |
| 270:\*, 323:\* (część) | Wpis `null` na liście traktowany jak rekord    | Asercja: wpis `null`, liczba, napis lub tablica na liście jest pomijany, a ważne profile zostają. Bez tego jeden wpis `null` kasował wszystkie profile (utrata danych). Break-check: `!isRecord(entry)` → `false` i `value !== null` → `true`, test czerwony. |
| 275:7                  | Nie-tekstowe `id` przyjęte                     | Asercja: `id` bez tekstu (liczba, brak) odrzuca wpis. Break-check: `typeof id !== "string"` → `false`, test czerwony.                                                                                                                                         |
| 283:7                  | `typeof character !== "string"` → `false`      | Równoważny: dla nie-tekstu `allowed.includes` i tak zwraca `false`, więc wpis jest odrzucany.                                                                                                                                                                 |
| 289:5                  | Nie-tekstowe `name` przyjęte                   | Asercja: `name` bez tekstu odrzuca wpis (bez tego `name.trim()` rzucało i traciliśmy wszystkie profile). Break-check: `typeof name !== "string"` → `false`, test czerwony.                                                                                    |
| 315:14                 | `> 0xffff` → `>= 0xffff`                       | Kosmetyczny: różnica dotyczy tylko znaku U+FFFF (nie-znak), którego rodzic nie wpisze w imieniu.                                                                                                                                                              |
| 323:\* (reszta)        | Warianty `isRecord` dla napisów, liczb, tablic | Równoważny: wpis nie-obiektowy i tak nie ma pól `id`/`profiles`, więc jest odrzucany tą samą drogą.                                                                                                                                                           |

Do sprawdzenia w Fazie 4 wąskim przebiegiem Strykera: czy dopisane testy zabiły wymienione mutanty (wynik „po”).
