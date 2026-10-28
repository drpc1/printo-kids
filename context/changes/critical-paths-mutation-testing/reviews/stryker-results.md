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
