# Wyniki Strykera i jak powtórzyć przebieg

## Jak uruchomić

Każdy zakres ma własny plik konfiguracji w `stryker/` (Stryker 10 nie przyjmuje nadpisania komendy z linii poleceń, ale przyjmuje `--mutate`):

```bash
npm run mutate:dictation
npm run mutate:sudoku
npm run mutate:nonogram
npm run mutate:sequence
npm run mutate:symmetry
npm run mutate:local-data
```

Wąski przebieg: dopisz zakres po `--`, np. `npm run mutate:dictation -- --mutate "src/lib/dictation/generate.ts:177-190"`. Raport HTML trafia do `reports/mutation/` (ignorowany przez git). Stary rdzeń (`maze/generate`, `sheet/layout`, `last-used`, `child-profiles`, `sheet/character`) nadal obsługuje `stryker.config.json` (`npx stryker run`).

Zmienne ustawiane przez konfiguracje przez `scripts/with-env.mjs` (to samo na Windows i Linuksie):

- `MUTATION_RUN=1` — wyłącza asercje wall-clock (`< 5000 ms` w nonogramie, sekwencjach i sudoku). Kod instrumentowany jest kilka razy wolniejszy, więc budżet czasu zabijałby mutanty z niewłaściwego powodu (przykład: trudny nonogram 12,4 s zamiast 5 s zatrzymał pierwszy przebieg). `npm test` zachowuje wszystkie budżety czasu.
- `SEQUENCE_ORACLE_SEEDS=5` (tylko sekwencje) — mniej ziaren oracle (domyślnie 120), mniej ziaren generacji (30 zamiast 300) i co siódmy zestaw trzech luk w teście dwuznaczności; pełny `npm test` bez zmian (ok. 47 s).

## Dowód działania faz 1 (wąskie zakresy, 2026-10-27)

To są próby potoku, nie wyniki faz: zakresy są małe, a ocalałe mutanty z nich zostają do przeglądu w fazach 2–6.

| Zakres     | plik:linie                      | Mutanty | Czas przebiegu | Uwagi                                                                                                 |
| ---------- | ------------------------------- | ------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| dictation  | `dictation/generate.ts:177-190` | 29      | 45 s           | część mutantów ocalała (do przeglądu w fazie 2)                                                       |
| sudoku     | `sudoku/generate.ts:160-175`    | 13      | 41 s           | część mutantów ocalała (faza 3)                                                                       |
| nonogram   | `nonogram/solve.ts:1-30`        | 32      | 3 min 20 s     | po `MUTATION_RUN=1`; 15 timeoutów, 4 ocalałe (faza 4)                                                 |
| sequence   | `sequence/generate.ts:137-150`  | 24      | 3 min 23 s     | 100%: 10 zabitych, 14 timeoutów; pierwszy przebieg z 10 ziarnami i 300 ziarnami generacji trwał 8 min |
| symmetry   | `symmetry/generate.ts:285-300`  | 15      | 27 s           | 1 ocalały (faza 5)                                                                                    |
| local-data | `card-settings.ts:94-107`       | 9       | 23 s           | 9 z 9 zabitych                                                                                        |

## Czasy testów i szacunki

- Kod instrumentowany jest ok. 8 razy wolniejszy od zwykłego uruchomienia testów (sekwencje: 2,4 s zwykle, 20 s w pierwszym przebiegu Strykera; nonogram: 2,8 s zwykle, 17 s). Czas przebiegu ≈ mutanty × czas komendy / 4 procesy, a mutant, który powoduje długą pętlę, kończy się dopiero po limicie czasu (timeout liczy się jako zabity).
- Szacunki z `research.md` (kilka minut na zakres) były zaniżone dla nonogramu i sekwencji: pełny zakres może zająć kilkanaście do kilkudziesięciu minut. Przebiegi robimy po jednym zakresie, w tle.
- Gęstość: 9 mutantów na 14 linii (`card-settings.ts`), 21 na 7 (`favoriteDiffers`), 24 na 14 (generator sekwencji).

## Przegląd ocalałych mutantów

Wypełniany w fazach 2–6: dla każdego ocalałego mutanta jedna decyzja (asercja dopisana albo „równoważny/kosmetyczny” z uzasadnieniem).

## Faza 2: dyktando (`dictation/generate.ts:177-248`, `dictation/outline.ts:120-260`)

Przebieg 1 (przed dopisaniem testów z ocalałych): 327 mutantów, 296 zabitych, 11 timeoutów, 20 ocalałych (93,9%), 6 min 2 s.
Przebieg 2 (po testach): 327 mutantów, 303 zabite, 11 timeoutów, 13 ocalałych (96,0%), 5 min 6 s. `generate.ts` 97,9% (3 ocalałe), `outline.ts` 94,6% (10 ocalałych).

Testy dopisane dla ocalałych mutantów, które były błędem widocznym dla rodzica albo zmieniały wynik karty:

| Mutant (przebieg 1)                                                         | Decyzja           | Test                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate.ts:194` zamknięcie obrysu sprawdzało tylko wiersz                 | asercja           | ścieżka kończąca się w tym samym wierszu, ale innej kolumnie, jest `not-closed`                                                                                                                                                                                                                                                     |
| `generate.ts:247` `pick` (3 mutanty: `max`, `/`, `+1`)                      | asercja dla 2 z 3 | `max` i `/` zawsze wybierały ten sam obiekt (karty bez losowości): test „200 losowań daje co najmniej 5 różnych obrysów na każdym poziomie”; `+1` (wyjście poza zakres tylko dla `random() === 1`): test z losowaniem tuż poniżej 1, ocalały mutant `count + 1` jest równoważny (`Math.floor(random() * count)` nie osiąga `count`) |
| `outline.ts:123` pusta sylwetka nie była „disconnected”                     | asercja           | pusta sylwetka daje `["disconnected"]`                                                                                                                                                                                                                                                                                              |
| `outline.ts:134` brak wykrycia dotknięcia w narożniku po drugiej przekątnej | asercja           | dwa kształty z dotknięciem na obu przekątnych                                                                                                                                                                                                                                                                                       |
| `outline.ts:145` pojedyncza komórka uznawana za rozłączną                   | asercja           | pojedyncza komórka przechodzi                                                                                                                                                                                                                                                                                                       |
| `outline.ts:211` limit kroków `+4` → `-4` zrywał obrys pojedynczej komórki  | asercja           | obrys pojedynczej komórki: R1 D1 L1 U1                                                                                                                                                                                                                                                                                              |

Ocalałe po przebiegu 2 (13), każdy z decyzją „nie dopisujemy asercji”:

| Mutant                                                                | Powód                                                                                                            |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `generate.ts:199:63` (`end.y === start.y` → `true` w `slice`)         | wpływa tylko na kartę już oznaczoną `not-closed`; wynik walidacji ten sam (równoważny)                           |
| `generate.ts:214:7` (`walked.length !== boundary.size` → `false`)     | pozostałe kontrole (`repeated-vertex`, `not-closed`) odrzucają obrys przechodzony dwa razy; zbędna obrona w głąb |
| `generate.ts:247:19` (`count - 1` → `count + 1`)                      | równoważny: `random()` < 1, więc `floor(random() * count)` nigdy nie przekracza `count - 1`                      |
| `outline.ts:127`, `outline.ts:128` (`<=` → `<` w pętli narożników)    | równoważne: na ostatnim wierszu i kolumnie wierzchołków nie ma dwóch przeciwległych komórek                      |
| `outline.ts:214:37` (`heading = "right"` → `""`)                      | równoważny: pierwszy krok ustawia kierunek bez użycia `heading`                                                  |
| `outline.ts:215:22`, `215:36` (granica i krok pętli zabezpieczającej) | strażnik przed nieskończoną pętlą; w normalnym przebiegu pętla kończy się przez `return`                         |
| `outline.ts:217:9` (`step === 0` → `false`)                           | równoważny: z `heading = "right"` pierwszym kandydatem w prawo i tak jest krawędź górna                          |
| `outline.ts:224:9`, `224:29` (gałąź `next === undefined`)             | strażnik błędu; po usunięciu kod i tak się wywraca; dyktando zwraca wtedy `null`                                 |
| `outline.ts:225:23`, `240:19` (teksty błędów)                         | kosmetyczne                                                                                                      |

## Faza 3: sudoku (2026-10-28)

Zakresy: `sudoku/generate.ts:160-250` i `295-353`, `npm run mutate:sudoku` (237 mutantów, ok. 7 min na przebieg). Komenda testów w `stryker/sudoku.config.json` dostała `bruteforce.test.ts`; bez niego mutant `board.clear` ocalał, choć test go zabija.

| Przebieg                                                           | Mutanty | Zabite | Timeouty | Ocalałe | Wynik  |
| ------------------------------------------------------------------ | ------- | ------ | -------- | ------- | ------ |
| przed (testy z `main`)                                             | 237     | 177    | 35       | 25      | 89,45% |
| po testach z luk i po dopisaniu asercji (`bruteforce` w komendzie) | 237     | 199    | 32       | 6       | 97,47% |

### Nowe testy

- `generate.test.ts`: karty 6×6 i 9×9 budowane ręcznie (stały wzór rozwiązania i stałe współrzędne pustych pól, generator nie ustala oczekiwań): `blank-count` (jedno pole więcej/mniej), niedopasowany poziom, `shape-outside-pool` (nieznany kształt; gwiazdka i księżyc w puli dziewięciu są poprawne), `shape-count`, `invalid-solution` osobno dla kolumny (zamiana dwóch komórek w wierszu), bloku (cykliczny kwadrat łaciński), wartości poza zakresem, krótkiego i za długiego wiersza, brakującego wiersza; karta z brakującym wierszem w podanych polach i pełna plansza z uciętym wierszem; ponowne losowanie, gdy klucz powtarza poprzedni.
- `bruteforce.test.ts` (dopisany do `npm test`): niezależny licznik wszystkich wypełnień 4×4 (bez solvera z `generate.ts`) porównany z `countSudokuSolutions` na przypadkach ręcznych (prostokąt do zamiany = 2 rozwiązania), 120 losowych planszach z kilkoma pustymi polami i 40 wygenerowanych kartach (każda ma dokładnie 1 rozwiązanie); plus plansza 6×6 z jednym rozwiązaniem, które wymaga błędnego zgadywania (liczba sprawdzona zwykłym przeszukiwaniem).
- Break-check (zepsuj, test czerwienieje, przywróć): `countSudokuSolutions` zwraca 1 (3 testy czerwone); bez `blank-count` (4); bez `shape-outside-pool` (2); bez `shape-count` (2); pula zawsze 4 kształty (11); bez sprawdzania kolumn (tylko test kolumny); bez sprawdzania bloków (tylko test bloku); bez `board.clear` (test 6×6); bez sprawdzania długości wiersza rozwiązania; bez porównania z poprzednim kluczem; bez `givens.length !== size`; `every` → `some` w `wellFormed`.

### Ocalałe mutanty po fazie 3

| Linia      | Mutant                                         | Decyzja                                                                                                                                                  |
| ---------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 168:25     | `index <= board.cells.length`                  | Równoważny: `cells[length]` to `undefined`, które przechodzi `!== null` i `continue`.                                                                    |
| 172:11 (2) | `count <= bestCount`, `if (true)`              | Równoważne wynikowo: zmienia tylko, którą pustą komórkę solver bierze pierwszą (heurystyka szybkości); liczba rozwiązań ta sama.                         |
| 183:25     | `value <= size`                                | Równoważny: maska kandydatów nie ma bitu `size`.                                                                                                         |
| 232:25     | `attempt <= MAX_PUZZLE_ATTEMPTS`               | Kosmetyczny: 51 zamiast 50 prób nowej planszy, bez wpływu na kartę.                                                                                      |
| 296:37     | `&& sudokuCardProblems(...) === 0` → `&& true` | Siatka bezpieczeństwa: generator nie daje kart łamiących reguły (4×4 z konstrukcji, 6×6/9×9 z `carveSudoku`), więc nie ma wejścia, które by to pokazało. |

### Ustalenie do wiadomości (bez zmiany kodu)

`countSudokuSolutions` nie sprawdza, czy podane pola nie kłócą się ze sobą (dwie takie same wartości w wierszu): zwraca wtedy liczbę, jakby kłótni nie było. Rodzica to nie dotyczy, bo `sudokuCardProblems` porównuje pola z poprawnym rozwiązaniem (`givens-differ-from-solution`, `invalid-solution`). Test losowy porównuje więc tylko plansze o zgodnych polach.

## Faza 4: nonogram (2026-10-30)

Zakresy: `nonogram/solve.ts` (cały), `nonogram/generate.ts:40-123`, `nonogram/simple.ts` (cały), `npm run mutate:nonogram`, 410 mutantów, ok. 106 min na przebieg (testy nonogramu są ciężkie pod instrumentacją). Komenda testów w `stryker/nonogram.config.json` dostała `oracle.test.ts`.

| Przebieg                     | Mutanty | Zabite | Timeouty | Ocalałe | Wynik  |
| ---------------------------- | ------- | ------ | -------- | ------- | ------ |
| przed (testy z `main`)       | 410     | 318    | 56       | 36      | 91,22% |
| po testach z luk i asercjach | 410     | 294    | 105      | 11      | 97,32% |

Wg pliku po: `generate.ts` 96,10% (3 ocalałe), `simple.ts` 96,74% (3), `solve.ts` 97,93% (5). Więcej timeoutów po zmianie wynika z wolniejszej komendy testów (wyrocznia), a timeout liczy się jako zabity.

### Nowe testy

- `oracle.test.ts` (dopisany do `npm test`, ok. 8 s): niezależna wyrocznia bez importu `solve.ts`. Wylicza wszystkie ułożenia linii i zostawia to, co wspólne, a siatkę rozwiązuje własnym przechodzeniem po liniach do stałego punktu. Porównanie `solveLine`: wszystkie wskazówki i wszystkie układy znanych komórek dla linii do 5 komórek plus 400 losowych linii 6–8 komórek. Porównanie `solveNonogram` (status i obraz): wszystkie obrazki 3×3, 4×3, 3×4, co 13. obrazek 4×4 (ok. 5000; pełne 65 536 przeszły jednorazowo, ale trwały ok. 40 s) i 300 losowych 5×5, także z wskazówkami z dwóch różnych obrazków (sprzeczne). Test pilnuje, że w próbce są przypadki `solved`, `stuck`, `contradiction` i obrazki wymagające co najmniej 3 rund propagacji.
- `simple.test.ts`: środek plusa jest szary (liczą się tylko cztery boki, nie rogi), brak dowolnego z czterech sąsiadów albo brzeg siatki daje czarny, nierówny obraz nie czyta poza wierszem, dokładnie 7 znaczków jest poprawne, a jeden wiersz z nadmiarem wśród poprawnych wystarcza do odrzucenia.
- `generate.test.ts`: poziom łatwy daje kartę znaczków (`runs`, bez `clues`), średni i trudny karty z liczbami; kategoria bez obiektów daje `null`; powtórzony klucz losuje ponownie na każdym poziomie.
- Break-check (zepsuj, test czerwienieje, przywróć): pominięcie znanej wypełnionej komórki w `solveLine` (5 czerwonych), `solveNonogram` nigdy nie zgłasza `stuck` (3), pominięcie lewego sąsiada w `outlineTones` (2), granica `>=` znaczków (2), `some` → `every` (1), przełącznik rodzaju karty (1), brak szablonów (1), ponowne losowanie przy powtórzonym kluczu łatwego (1).

### Ocalałe mutanty po fazie 4

| Linia                | Mutant                                                       | Decyzja                                                                                                                                             |
| -------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate.ts:48`     | `attempt <= MAX_ATTEMPTS`                                    | Kosmetyczny: 21 zamiast 20 prób losowania.                                                                                                          |
| `generate.ts:53:41`  | `... && true` (kontrola `simpleNonogramProblems`)            | Siatka bezpieczeństwa: karta znaczków z konstrukcji ma poprawne znaczki, więc żadne wejście z generatora tego nie pokaże.                           |
| `generate.ts:122`    | `Math.min(count + 1, ...)`                                   | Równoważny: `Math.random()` jest mniejsze od 1, więc `floor(random * count)` nigdy nie wychodzi poza tablicę.                                       |
| `simple.ts:39` (3)   | `column >= 0` → `true`, `column < długość` → `true` lub `<=` | Równoważne: odczyt poza tablicą w JS daje `undefined` (fałsz), więc granica kolumny nic nie zmienia.                                                |
| `solve.ts:65`        | `new Array()` zamiast `new Array(length)`                    | Równoważny: niewpisane elementy to `undefined` (fałsz), tak jak `false`.                                                                            |
| `solve.ts:66`        | `i <= length`                                                | Równoważny: dodatkowy obieg zapisuje tylko poza końcem linii, niczego nie czyta.                                                                    |
| `solve.ts:78`        | `i - blocks[j] < length`                                     | Równoważny: różni się tylko zapisem `canEmpty` poza końcem linii.                                                                                   |
| `solve.ts:111`       | `changed = false` w przebiegu po kolumnach                   | Brak różnicy w teście: 12 000 losowych obrazków do 12×15 oraz wszystkie 5×3 i 3×5 dają ten sam status co oryginał; uznany za równoważny w praktyce. |
| `solve.ts:13`, `:30` | `blocks = clue`, `false \|\| known[end]...`                  | Równoważne (sprawdzone ręcznie, wyrocznia przechodzi): blok długości 0 niczego nie zmienia, a `known[length]` to `undefined`.                       |

W przebiegu „po” ocalało 11 mutantów (tabela wyżej bez wierszy `solve.ts:13` i `:30`). Te dwa nie ocalały: Stryker policzył je jako timeout, a ręczne sprawdzenie pokazało, że są równoważne, więc decyzja zostaje w tabeli dla porządku.

## Faza 5a: sekwencje (2026-11-02)

Symetria zostaje na osobny PR (katalog kształtów w symetrii jeszcze się zmienia). Kod sekwencji zmienił się od planu (kolory kształtów, usunięta reguła `groups`), więc zakresy to: `sequence/rules.ts` (cały), `sequence/generate.ts:51-276`, `sequence/colors.ts` (cały). `npm run mutate:sequence`, 628 mutantów, z krótkim oracle (`SEQUENCE_ORACLE_SEEDS=5`). Komenda testów w `stryker/sequence.config.json` dostała `rules.test.ts` i `colors.test.ts`.

| Przebieg               | Mutanty | Zabite | Timeouty | Ocalałe | Wynik  | Czas       |
| ---------------------- | ------- | ------ | -------- | ------- | ------ | ---------- |
| przed (testy z `main`) | 628     | 453    | 58       | 117     | 81,37% | 3 h 17 min |
| po testach z luk       | 628     | 195    | 428      | 5       | 99,20% | 1 h 33 min |

Wg pliku po: `rules.ts` 100% (0 ocalałych), `colors.ts` 100%, `generate.ts` 98,51% (5). Wiele mutantów, które wcześniej ocalały, po zmianie kończy się teraz timeoutem (np. gdy zmieniony generator nie kończy pętli); timeout liczy się jako zabity.

### Nowe testy

- `rules.test.ts` (dopisany do `npm test`, poniżej 1 s): `rowFromRule` dla wszystkich ośmiu reguł i długości 5, 7, 8 (każdy wiersz sprawdzony pole po polu przez własny opis reguły; liczby sięgają 1 i 20; mieszany zaczyna raz kształtem, raz liczbą), `shownBefore`, `followsRule` (ręczne wiersze poprawne i zepsute w jednym polu, brak przecieku między długościami), `hypotheses` (dokładna równość ze zbiorem zbudowanym w teście niezależnie z PRD, dla 5, 7, 8 pól, plus ręczne rosnące grupy) i `visiblePeriodReadings` (okresy 4–6, liczby, ukryte pole, jedno wystąpienie).
- `generate.test.ts`: ponowne losowanie przy powtórzonym kluczu na każdym poziomie, stały `random` nie wywala generatora ani nie daje powtórzonego wiersza, kolejność reguł zmienia się między kartami, granice liczb (0, 21, ułamek, 1 i 20 poprawne), luki źle sformowane (puste, poza wierszem, nieposortowane, ułamek) dają tylko `gap-count`, pierwsza dozwolona luka po pokazaniu reguły, druga luka w drugiej połowie, `no-answer` bez `ambiguous`, przekazanie problemów wiersza do karty.
- `colors.test.ts`: kształt bez kredki wraca do koloru tuszu.
- Break-check (zepsuj, test czerwienieje, przywróć), 13 miejsc, m.in.: `lowest` poza zakresem, `down1` rosnące, mieszany nie sięga 20, `hypotheses` bez startu 20, brak rosnących grup, liczby czytane jak okres, cache `followsRule` bez długości, brak porównania z poprzednim kluczem, reguły bez tasowania, ignorowanie wiersza `null`, granica 21, wyłączone `no-answer`, powrót do tuszu. Liczba 21 wymagała dopisania testu, bo pierwotny przypadek 22 go nie łapał.

### Ocalałe mutanty po fazie 5a (krótki oracle)

| Linia                 | Mutant                                                           | Decyzja                                                                                                         |
| --------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `generate.ts:63:54`   | `&& true` (kontrola `sequenceCardProblems` przy zwróceniu karty) | Siatka bezpieczeństwa: wiersze są walidowane przy losowaniu, więc karta z poprawnych wierszy zwykle przechodzi. |
| `generate.ts:116` (2) | `shapesIn` bez filtra kształtów                                  | Równoważne: `assignSequenceColors` bierze tylko kształty z katalogu, liczby w liście są pomijane.               |
| `generate.ts:134:39`  | `&& true` (kontrola `sequenceRowProblems` w `drawRow`)           | Siatka bezpieczeństwa: ta sama walidacja działa jeszcze raz na karcie.                                          |
| `generate.ts:148:46`  | `pick(random, n - 1 + firstOfSecondHalf)` (druga luka)           | Walidator odrzuca zbyt późną lukę, więc zmienia się tylko liczba ponowień losowania.                            |

### Porównanie krótkiego i pełnego oracle

Krótki oracle (5 ziaren, 30 ziaren generacji) to początek pętli pełnego (120 i 300), więc pełny uruchamia te same sprawdzenia i jeszcze więcej: nie może zabić mniej mutantów. Sprawdziłam to na tych pięciu ocalałych: pełny oracle (bez `SEQUENCE_ORACLE_SEEDS`) zabija wszystkie pięć (2 zabite, 3 timeouty), przebieg 1 min 14 s, bo sam test trwa ok. 21 s (dry run). Pięć ocalałych z krótkiego przebiegu to więc mutanty zabijane tylko rzadkimi przypadkami, które daje dopiero pełna pętla. Dla zakresów, które w krótkim przebiegu zabijają wszystko, pełny oracle nie jest potrzebny.

## Faza 5b: symetria (2026-11-03)

Kod symetrii zmienił się od planu (kategoria, kształty), więc zakresy to `symmetry/generate.ts:49-300` (stary zakres 75-300 pomijał `generateSymmetryCard`) i `symmetry/colors.ts`; `colors.test.ts` dołączony do komendy testów w `stryker/symmetry.config.json`. `npm run mutate:symmetry`, 366 mutantów.

| Przebieg               | Mutanty | Zabite | Timeouty | Ocalałe | Wynik  | Czas   |
| ---------------------- | ------- | ------ | -------- | ------- | ------ | ------ |
| przed (testy z `main`) | 366     | 300    | 21       | 45      | 87,70% | 17 min |
| po testach z luk       | 366     | 323    | 22       | 11      | 96,99% | 22 min |

Wg pliku po: `colors.ts` 100%, `generate.ts` 96,91% (11 ocalałych).

### Nowe testy (`generate.test.ts`)

- Kategoria bez obiektów daje `null`; powtórzony klucz losuje ponownie na każdym poziomie; karta ma oś pionową i klucz `poziom:obiekt:warianty:przesunięcie`.
- Indeks wariantu poza częścią rzuca błąd z nazwą obiektu i indeksem; błędy zbyt dużego szablonu podają jego rozmiar i rozmiar siatki.
- Podpowiedzi dla szablonu z małą liczbą komórek na osi: mniej komórek niż podpowiedzi (wszystkie, od góry, bez komórek poza osią), więcej (trzy rozłożone od góry do dołu) i dokładnie tyle samo.
- Szczeliny w sylwetce (`details`) porównane z niezależnym wypełnianiem od zewnątrz dla każdego obiektu, wariantu i przesunięcia (na początku i na końcu); do tego dwa ręczne szablony: komora otwarta na oś (żeby wejść do niej, trzeba iść w lewo, więc nie jest szczeliną) oraz ta sama komora zamknięta ścianą przy osi (jest szczeliną).
- Szczegóły na brzegach siatki: kolumna i wiersz 0 poprawne, kolumna 12, wiersz 16, ujemne i ułamkowe poza siatką.
- Break-check (zepsuj, test czerwienieje, przywróć), 14 miejsc: brak szablonów, powtórzony klucz, brak wariantu, oś, łączenie klucza, sortowanie i filtr podpowiedzi, zawsze `spread`, brak ruchu w lewo przy wypełnianiu (wymagało dopisania komory ręcznej, bo katalog tego nie wymaga), granice wiersza wypełniania, cztery granice szczegółów.

### Ocalałe mutanty po fazie 5b

| Linia                 | Mutant                                                 | Decyzja                                                                                                                                 |
| --------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `generate.ts:59`      | `attempt <= MAX_ATTEMPTS`                              | Kosmetyczny: 21 zamiast 20 prób losowania.                                                                                              |
| `generate.ts:64`      | `&& true` (kontrola `symmetryCardProblems`)            | Siatka bezpieczeństwa: generator składa kartę z szablonu, który ma osobne testy poprawności, więc nie ma wejścia, które by to pokazało. |
| `generate.ts:120` (2) | `hintCount === 0` zawsze fałsz                         | Równoważny: `spread(onAxis, 0)` też daje pustą listę.                                                                                   |
| `generate.ts:125`     | `<` zamiast `<=` przy wyborze podpowiedzi              | Równoważny: przy tylu samych komórkach co podpowiedzi `spread` zwraca te same komórki w tej samej kolejności.                           |
| `generate.ts:155`     | `reached` bez początkowego 0                           | Równoważny: wypełnianie i tak zaczyna od indeksu 0, a róg ramki dodaje się przez sąsiadów ramki.                                        |
| `generate.ts:167` (4) | granice ramki wypełniania (`true`, `\|\|`, `<= width`) | Równoważne: ramka wokół siatki jest cała pusta i połączona, więc wyjście za jej brzeg wpada na kolejny wiersz ramki.                    |
| `generate.ts:299`     | `Math.min(count + 1, ...)`                             | Równoważny: `Math.random()` jest mniejsze od 1, więc indeks nigdy nie wychodzi poza tablicę.                                            |

## Faza 6: dane lokalne (2026-11-03)

Zakres: `card-settings.ts`, `active-profile.ts`, `sheet/own-image-store.ts`, `sheet/speech.ts` (całe pliki), `npm run mutate:local-data`, 283 mutanty, ok. 4 min na przebieg.

| Przebieg               | Mutanty | Zabite | Timeouty | Ocalałe | Wynik  |
| ---------------------- | ------- | ------ | -------- | ------- | ------ |
| przed (testy z `main`) | 283     | 232    | 1        | 50      | 82,33% |
| po testach z luk       | 283     | 262    | 3        | 18      | 93,64% |

Wg pliku po: `speech.ts` 100% (przed 73,77%), `card-settings.ts` 97,39% (94,78%), `active-profile.ts` 94,74% (89,47%), `own-image-store.ts` 84,09% (70,45%).

### Nowe testy

- `own-image-store.test.ts`: klucz kopii zdjęcia przypięty literalnie (`printo-kids:own-image`; zmiana klucza gubiłaby zapisane zdjęcia, a test używał stałej z kodu), `HREF_PATTERN` kotwiczony z obu stron (tekst przed, po, w środku, dopełnienie `===`, pusty ładunek, inny typ obrazu), nie-teksty (także tablica, która drukuje się jako href) nie są obrazkiem, `drawnVisitCharacter` nie bierze obrazka dla postaci z katalogu, własny obrazek bez poprawnej migawki to `none`, a postać z ostatnich parametrów jest rysowana tak, jak jest, także gdy istnieje kopia na urządzeniu.
- `speech.test.ts`: `instructionLines` nie zostawia pustych linii ani spacji (spacja na końcu, podwójna spacja), szerokość linii, ręcznie policzone wszystkie liczby pasma (postać, bąbel, ogon, tekst, maksymalna szerokość) dla jednego, dwóch i trzech zdań oraz granica kroku `fitCellSize` (dokładnie 7,5 mm zostaje 7,5).
- `active-profile.test.ts`: `NO_PROFILE` to `none` i wraca z odczytu (pusty zapis to brak wyboru).
- `card-settings.test.ts`: symbole sudoku inne niż `shapes` i `digits` wracają do `shapes`.
- Break-check (zepsuj, test czerwienieje, przywróć), 13 miejsc: klucz zdjęcia, obie kotwice wzorca, `typeof string`, sprawdzenie postaci przy własnym obrazku, ostatnia postać jako własny obrazek, puste linie, czubek ogona, `x` tekstu, epsilon kroku, szerokość tekstu, `NO_PROFILE`, symbole sudoku.

### Ocalałe mutanty po fazie 6

| Linia                              | Mutant                                                    | Decyzja                                                                                                                                                               |
| ---------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `own-image-store.ts:22` (6)        | pusty zapis (`raw === ""`) nie zwraca od razu `null`      | Równoważne: `JSON.parse("")` rzuca, a `catch` zwraca `null`, tak samo jak wczesny powrót.                                                                             |
| `own-image-store.ts:27` (2)        | brak `isRecord(stored)`                                   | Równoważne: `JSON.parse` daje `null`, liczbę, tekst lub tablicę, a odczyt `.href` kończy się `undefined` (nie jest obrazkiem) albo wyjątkiem ze `catch`.              |
| `own-image-store.ts:101` (6)       | `isRecord` zawsze prawdziwe i warianty                    | Równoważne z tego samego powodu: strażnik jest zbędny, bo `isOwnImageDataUrl(stored.href)` odrzuca wszystko, co nie jest poprawnym href.                              |
| `active-profile.ts:15`             | `raw === null` → `false`                                  | Równoważny: dla `null` wynik `null === ""` jest fałszem, więc zwracane jest `raw`, czyli `null`.                                                                      |
| `card-settings.ts:132`             | `value === "shapes"` → `false`                            | Równoważny: wartość `shapes` wraca z `fallback`, który też jest `shapes`.                                                                                             |
| `card-settings.ts:141`, `:145` (2) | usunięte `case "symetria"` i `case "sudoku"` w `levelIds` | Równoważne: wpada do następnego `case` (sekwencje, nonogram), których identyfikatory poziomów są takie same jak symetrii (`lat4`–`lat7`) i sudoku (`latwy`–`trudny`). |
